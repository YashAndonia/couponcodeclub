import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon, ICoupon } from '@/lib/models/Coupon';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';
import { validateCouponInput } from '@/lib/utils/validation';
import { rateLimiters, getClientIdentifier } from '@/lib/utils/rateLimit';

// GET /api/coupons - List coupons with sorting and filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'recent'; // recent, popular, expiring
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const brand = searchParams.get('brand');
    const submitter = searchParams.get('submitter'); // NEW: Filter by submitter username
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    if (submitter) {
      // Find user by username and filter by their submitterId
      const user = await User.findOne({ username: submitter });
      if (user) {
        query.submitterId = user._id;
      } else {
        // If user doesn't exist, return empty results
        return sendSuccessResponse({
          coupons: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        });
      }
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'popular':
        sortQuery = { upvotes: -1, createdAt: -1 };
        break;
      case 'expiring':
        sortQuery = { expiresAt: 1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Get coupons with pagination
    const coupons = await Coupon.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('submitterId', 'username')
      .lean();

    // Get total count for pagination
    const total = await Coupon.countDocuments(query);

    return sendSuccessResponse({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
}

// POST /api/coupons - Create new coupon (authenticated)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return sendErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Apply rate limiting for coupon submission
    const clientId = getClientIdentifier(request);
    // await rateLimiters.couponSubmission.enforceLimit(clientId); // Disabled for now

    const body = await request.json();
    
    // Validate input
    const validationResult = validateCouponInput(body);
    if (!validationResult.isValid) {
      return sendErrorResponse(validationResult.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    // Get or create user
    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      user = await User.create({
        email: session.user.email,
        username: session.user.username || session.user.email.split('@')[0],
        name: session.user.name || session.user.username || session.user.email.split('@')[0]
      });
    }

    // Create coupon
    const coupon = await Coupon.create({
      ...body,
      submitterId: user._id,
      tags: body.tags || []
    });

    // Populate submitter info
    await coupon.populate('submitterId', 'username');

    return sendSuccessResponse(coupon, HTTP_STATUS.CREATED);

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 