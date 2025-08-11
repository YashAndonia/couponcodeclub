import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  couponId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  deviceHash?: string; // For anonymous votes
  worked: boolean;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deviceHash: {
    type: String,
    default: null
  },
  worked: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index to prevent duplicate votes
VoteSchema.index({ couponId: 1, userId: 1 }, { unique: true, sparse: true });
VoteSchema.index({ couponId: 1, deviceHash: 1 }, { unique: true, sparse: true });

// Ensure either userId or deviceHash is present
VoteSchema.pre('save', function(next) {
  if (!this.userId && !this.deviceHash) {
    return next(new Error('Either userId or deviceHash must be provided'));
  }
  next();
});

export const Vote = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema); 