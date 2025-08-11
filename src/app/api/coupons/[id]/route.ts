import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Coupon } from '@/lib/models/Coupon';
import { Vote } from '@/lib/models/Vote';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';

// DELETE /api/coupons/[id] - Delete a coupon (only by submitter)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return sendErrorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = params;

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return sendErrorResponse('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Get coupon and check ownership
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return sendErrorResponse('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }

    if (coupon.submitterId.toString() !== user._id.toString()) {
      return sendErrorResponse('Not authorized to delete this coupon', HTTP_STATUS.FORBIDDEN);
    }

    // Delete associated votes first
    await Vote.deleteMany({ couponId: id });

    // Delete the coupon
    await Coupon.findByIdAndDelete(id);

    // Update user stats (subtract the votes this coupon received)
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        totalUpvotes: -coupon.upvotes,
        totalDownvotes: -coupon.downvotes,
        rankScore: -(coupon.upvotes * 2 - coupon.downvotes)
      }
    });

    return sendSuccessResponse({ success: true });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 