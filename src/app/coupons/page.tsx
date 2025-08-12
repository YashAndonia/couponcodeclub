'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import { CouponWithStats, SearchFilters } from '@/types/coupon';
import { captureEvent } from '@/lib/analytics';
import { getCoupons, voteCoupon } from '@/lib/api/client';

export default function CouponsPage() {
  const { data: session } = useSession();
  const [allCoupons, setAllCoupons] = useState<CouponWithStats[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponWithStats[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent', page: 1, limit: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch coupons from API
  const fetchCoupons = async (newFilters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const response = await getCoupons(filtersToUse);
      
      if (response.success && response.data) {
        const { coupons, pagination: paginationData } = response.data;
        
        // Transform the data to match our expected format
        const transformedCoupons: CouponWithStats[] = coupons.map(coupon => ({
          ...coupon,
          submitter: coupon.submitterId && typeof coupon.submitterId === 'object' 
            ? { 
                username: (coupon.submitterId as any)?.username || 'Unknown',
                avatarUrl: (coupon.submitterId as any)?.avatarUrl 
              }
            : { username: 'Unknown' },
          successRate: coupon.upvotes + coupon.downvotes > 0 
            ? Math.round((coupon.upvotes / (coupon.upvotes + coupon.downvotes)) * 100) 
            : 0,
          totalVotes: coupon.upvotes + coupon.downvotes,
          isExpired: coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false,
          freshnessIndicator: coupon.lastVerifiedAt 
            ? `Verified ${getTimeAgo(new Date(coupon.lastVerifiedAt))} ago`
            : 'Not yet verified'
        }));
        
        setAllCoupons(transformedCoupons);
        setFilteredCoupons(transformedCoupons);
        setPagination(paginationData);
      } else {
        throw new Error(response.error || 'Failed to fetch coupons');
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(err instanceof Error ? err.message : 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'less than an hour';
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'}`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'}`;
    
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  };

  // Initial fetch
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle vote
  const handleVote = async (couponId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await voteCoupon(couponId, voteType);
      
      if (response.success) {
        // Update the coupon in our state
        setAllCoupons(prev => prev.map(coupon => {
          if (coupon._id === couponId) {
            const newUpvotes = voteType === 'upvote' ? coupon.upvotes + 1 : coupon.upvotes;
            const newDownvotes = voteType === 'downvote' ? coupon.downvotes + 1 : coupon.downvotes;
            const totalVotes = newUpvotes + newDownvotes;
            const successRate = totalVotes > 0 ? Math.round((newUpvotes / totalVotes) * 100) : 0;
            
            return {
              ...coupon,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              successRate,
              totalVotes,
              userVote: voteType
            };
          }
          return coupon;
        }));
        
        setFilteredCoupons(prev => prev.map(coupon => {
          if (coupon._id === couponId) {
            const newUpvotes = voteType === 'upvote' ? coupon.upvotes + 1 : coupon.upvotes;
            const newDownvotes = voteType === 'downvote' ? coupon.downvotes + 1 : coupon.downvotes;
            const totalVotes = newUpvotes + newDownvotes;
            const successRate = totalVotes > 0 ? Math.round((newUpvotes / totalVotes) * 100) : 0;
            
            return {
              ...coupon,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              successRate,
              totalVotes,
              userVote: voteType
            };
          }
          return coupon;
        }));
        
        // Analytics
        captureEvent('coupon_voted', { 
          couponId, 
          voteType, 
          brand: allCoupons.find(c => c._id === couponId)?.brand 
        });
      }
    } catch (error) {
      console.error('Error voting on coupon:', error);
    }
  };

  // Handle copy
  const handleCopy = (couponCode: string, brand: string) => {
    navigator.clipboard.writeText(couponCode);
    
    // Analytics
    captureEvent('coupon_copied', { brand, couponCode });
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Analytics
    if (query.trim()) {
      captureEvent('search_performed', { query });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} searchQuery={searchQuery} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Coupons
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchCoupons()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Coupons</h1>
            <p className="text-gray-600">Discover the latest coupon codes and deals from your favorite stores</p>
          </div>

          {/* Coupon Feed */}
          <CouponFeed
            coupons={filteredCoupons}
            loading={loading}
            total={pagination.total}
            onVote={handleVote}
            onCopy={handleCopy}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            hasMore={pagination.page < pagination.pages}
            onLoadMore={() => {
              const nextPage = pagination.page + 1;
              setFilters(prev => ({ ...prev, page: nextPage }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
