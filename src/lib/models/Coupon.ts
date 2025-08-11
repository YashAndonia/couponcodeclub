import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  brand: string;
  code: string;
  description: string;
  tags: string[];
  link?: string;
  expiresAt?: Date;
  submitterId: mongoose.Types.ObjectId;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  lastVerifiedAt?: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 20
  }],
  link: {
    type: String,
    trim: true,
    maxlength: 500
  },
  expiresAt: {
    type: Date,
    default: null
  },
  submitterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  lastVerifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
CouponSchema.index({ brand: 1 });
CouponSchema.index({ submitterId: 1 });
CouponSchema.index({ createdAt: -1 });
CouponSchema.index({ upvotes: -1 });
CouponSchema.index({ expiresAt: 1 });
CouponSchema.index({ lastVerifiedAt: -1 });

// Virtual for success rate
CouponSchema.virtual('successRate').get(function() {
  const totalVotes = this.upvotes + this.downvotes;
  return totalVotes > 0 ? (this.upvotes / totalVotes) * 100 : 0;
});

// Virtual for total votes
CouponSchema.virtual('totalVotes').get(function() {
  return this.upvotes + this.downvotes;
});

// Ensure virtuals are serialized
CouponSchema.set('toJSON', { virtuals: true });
CouponSchema.set('toObject', { virtuals: true });

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema); 