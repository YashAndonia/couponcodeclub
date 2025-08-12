import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';

// GET /api/user/me - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return sendErrorResponse('Not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    await dbConnect();
    
    // Get user from our AppUser collection
    const user = await User.findOne({ email: session.user.email }).select('-__v');
    
    if (!user) {
      return sendErrorResponse('User not found in app database', HTTP_STATUS.NOT_FOUND);
    }

    // Get user's rank position
    const userRank = await User.countDocuments({
      rankScore: { $gt: user.rankScore }
    }) + 1;

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
    };

    return sendSuccessResponse({ user: profile });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
}
