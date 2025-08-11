import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon } from '@/lib/models/Coupon';
import { Vote } from '@/lib/models/Vote';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';
import { rateLimiters, getClientIdentifier } from '@/lib/utils/rateLimit';
import mongoose from 'mongoose';

// POST /api/coupons/[id]/vote - Vote on a coupon
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    await rateLimiters.voting.enforceLimit(clientId);
    
    const { id } = params;
    const body = await request.json();
    const { worked } = body;

    if (typeof worked !== 'boolean') {
      return sendErrorResponse('Invalid vote value', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if coupon exists
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return sendErrorResponse('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }

    // Get session (optional for anonymous voting)
    const session = await getServerSession(authOptions);
    let userId = null;
    let deviceHash = null;

    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        userId = user._id;
      }
    } else {
      // For anonymous votes, use device hash (simplified - in production use proper device fingerprinting)
      deviceHash = request.headers.get('user-agent') || 'anonymous';
    }

    // Check for existing vote
    const existingVote = await Vote.findOne({
      couponId: id,
      $or: [
        { userId: userId },
        { deviceHash: deviceHash }
      ]
    });

    if (existingVote) {
      return sendErrorResponse('Already voted on this coupon', HTTP_STATUS.CONFLICT);
    }

    // Create vote
    await Vote.create({
      couponId: id,
      userId,
      deviceHash,
      worked
    });

    // Update coupon stats
    const updateData: any = {
      $inc: { [worked ? 'upvotes' : 'downvotes']: 1 }
    };

    // Update lastVerifiedAt if vote is positive
    if (worked) {
      updateData.lastVerifiedAt = new Date();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true })
      .populate('submitterId', 'username avatarUrl');

    // Update user stats if authenticated
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          [worked ? 'totalUpvotes' : 'totalDownvotes']: 1,
          rankScore: worked ? 2 : -1
        }
      });
    }

    return sendSuccessResponse(updatedCoupon);

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 