export interface Coupon {
  _id: string;
  brand: string;
  code: string;
  description: string;
  tags: string[];
  link?: string;
  expiresAt?: Date;
  submitterId: string;
  submitter?: {
    username: string;
    avatarUrl?: string;
  };
  upvotes: number;
  downvotes: number;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponWithStats extends Coupon {
  successRate: number;
  totalVotes: number;
  isExpired: boolean;
  freshnessIndicator: string;
}

export interface Vote {
  _id: string;
  couponId: string;
  userId?: string;
  worked: boolean;
  createdAt: Date;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  rankScore: number;
  totalUpvotes: number;
  totalDownvotes: number;
}

export interface SearchFilters {
  sort?: 'recent' | 'popular' | 'expiring';
  brand?: string;
  submitter?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  coupons: CouponWithStats[];
  total: number;
  page: number;
  totalPages: number;
} 