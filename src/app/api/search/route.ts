import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon } from '@/lib/models/Coupon';
import { sendSuccessResponse, sendErrorResponse, handleApiError } from '@/lib/utils/appApi';
import { rateLimiters, getClientIdentifier } from '@/lib/utils/rateLimit';

// GET /api/search - Search coupons by brand, description, or tags
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Apply general rate limiting
    const clientId = getClientIdentifier(request);
    await rateLimiters.general.enforceLimit(clientId);
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return sendErrorResponse('Search query is required', 400);
    }

    // Build search query
    const searchQuery = {
      $or: [
        { brand: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    // Execute search
    const coupons = await Coupon.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('submitterId', 'username')
      .lean();

    // Get total count
    const total = await Coupon.countDocuments(searchQuery);

    return sendSuccessResponse({
      coupons,
      query: q,
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