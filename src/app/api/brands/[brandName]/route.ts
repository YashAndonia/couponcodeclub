import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon } from '@/lib/models/Coupon';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';

// GET /api/brands/[brandName] - Get all coupons for a specific brand
export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    await dbConnect();
    
    const { brandName } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'recent';
    const skip = (page - 1) * limit;

    // Decode the brand name (URL encoded)
    const decodedBrandName = decodeURIComponent(brandName);

    // Build sort query
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

    // Get coupons for this brand
    const coupons = await Coupon.find({ 
      brand: { $regex: decodedBrandName, $options: 'i' } 
    })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('submitterId', 'username')
      .lean();

    // Get total count
    const total = await Coupon.countDocuments({ 
      brand: { $regex: decodedBrandName, $options: 'i' } 
    });

    // Get brand stats
    const brandStats = await Coupon.aggregate([
      { $match: { brand: { $regex: decodedBrandName, $options: 'i' } } },
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          avgSuccessRate: {
            $avg: {
              $cond: [
                { $gt: [{ $add: ['$upvotes', '$downvotes'] }, 0] },
                { $divide: ['$upvotes', { $add: ['$upvotes', '$downvotes'] }] },
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = brandStats[0] || {
      totalCoupons: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
      avgSuccessRate: 0
    };

    return sendSuccessResponse({
      brand: {
        name: decodedBrandName,
        ...stats,
        avgSuccessRate: Math.round(stats.avgSuccessRate * 100)
      },
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