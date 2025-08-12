import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Coupon } from '@/lib/models/Coupon';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';

// GET /api/user/[username] - Get user profile and their coupons
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnect();
    
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get user
    const user = await User.findOne({ username }).select('-__v');
    if (!user) {
      return sendErrorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Get user's rank position
    const userRank = await User.countDocuments({
      rankScore: { $gt: user.rankScore }
    }) + 1;

    // Get user's coupons
    const coupons = await Coupon.find({ submitterId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total coupon count
    const totalCoupons = await Coupon.countDocuments({ submitterId: user._id });

    // Calculate user stats
    const totalVotes = user.totalUpvotes + user.totalDownvotes;
    const successRate = totalVotes > 0 ? (user.totalUpvotes / totalVotes) * 100 : 0;
    
    // Determine badge
    let badge = 'Bronze';
    if (user.rankScore >= 100) badge = 'Gold';
    else if (user.rankScore >= 50) badge = 'Silver';

    const profile = {
      ...user.toObject(),
      badge,
      rank: userRank,
      successRate: Math.round(successRate),
      totalVotes,
      stats: {
        totalCoupons,
        totalUpvotes: user.totalUpvotes,
        totalDownvotes: user.totalDownvotes,
        rankScore: user.rankScore
      }
    };

    return sendSuccessResponse({
      user: profile,
      coupons,
      pagination: {
        page,
        limit,
        total: totalCoupons,
        pages: Math.ceil(totalCoupons / limit)
      }
    });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 