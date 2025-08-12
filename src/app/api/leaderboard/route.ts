import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { sendSuccessResponse, sendErrorResponse, handleApiError } from '@/lib/utils/appApi';

// GET /api/leaderboard - Get top users by rank score
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get top users by rank score
    const users = await User.find({})
      .sort({ rankScore: -1, totalUpvotes: -1 })
      .limit(limit)
      .select('username rankScore totalUpvotes totalDownvotes createdAt avatarUrl')
      .lean();

    // Calculate badges and additional stats
    const leaderboard = users.map((user, index) => {
      const totalVotes = user.totalUpvotes + user.totalDownvotes;
      const successRate = totalVotes > 0 ? (user.totalUpvotes / totalVotes) * 100 : 0;
      
      // Determine badge based on rank score
      let badge = 'Bronze';
      if (user.rankScore >= 100) badge = 'Gold';
      else if (user.rankScore >= 50) badge = 'Silver';

      return {
        ...user,
        rank: index + 1,
        badge,
        successRate: Math.round(successRate),
        totalVotes
      };
    });

    return sendSuccessResponse(leaderboard);

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 