import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon } from '@/lib/models/Coupon';
import { sendSuccessResponse, sendErrorResponse, handleApiError } from '@/lib/utils/appApi';

// GET /api/brands - Get all brands with their statistics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Aggregate brands with their coupon counts and stats
    const brands = await Coupon.aggregate([
      {
        $group: {
          _id: '$brand',
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
          },
          lastUpdated: { $max: '$updatedAt' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          totalCoupons: 1,
          totalUpvotes: 1,
          totalDownvotes: 1,
          avgSuccessRate: { $round: [{ $multiply: ['$avgSuccessRate', 100] }, 0] },
          totalVotes: { $add: ['$totalUpvotes', '$totalDownvotes'] },
          lastUpdated: 1
        }
      },
      { $sort: { totalCoupons: -1 } },
      { $limit: limit }
    ]);

    return sendSuccessResponse({
      brands,
      totalBrands: brands.length
    });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 