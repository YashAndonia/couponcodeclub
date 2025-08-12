'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import WorkedForMeModal from '@/components/WorkedForMeModal';
import { CouponWithStats, SearchFilters } from '@/types/coupon';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { getCoupons, voteCoupon } from '@/lib/api/client';

export default function HomePage() {
  const { data: session } = useSession();
  const [allCoupons, setAllCoupons] = useState<CouponWithStats[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponWithStats[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent', page: 1, limit: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [workedForMeModal, setWorkedForMeModal] = useState<{
    isOpen: boolean;
    coupon: { couponId: string; brand: string; code: string; timestamp: number } | null;
  }>({
    isOpen: false,
    coupon: null,
  });

  // Check for success message from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === 'true') {
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

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
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  // Load coupons on mount and when filters change
  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCoupons(allCoupons);
    } else {
      const filtered = allCoupons.filter(
        coupon =>
          coupon.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coupon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCoupons(filtered);
    }
  }, [searchQuery, allCoupons]);

  // Handle voting
  const handleVote = async (couponId: string, worked: boolean) => {
    try {
      const response = await voteCoupon(couponId, worked);
      
      if (response.success && response.data) {
        // Update the coupon in our local state
        const updatedCoupon = response.data;
        
        setAllCoupons(prev => prev.map(coupon => 
          coupon._id === couponId 
            ? {
                ...coupon,
                upvotes: updatedCoupon.upvotes,
                downvotes: updatedCoupon.downvotes,
                successRate: updatedCoupon.upvotes + updatedCoupon.downvotes > 0 
                  ? Math.round((updatedCoupon.upvotes / (updatedCoupon.upvotes + updatedCoupon.downvotes)) * 100) 
                  : 0,
                totalVotes: updatedCoupon.upvotes + updatedCoupon.downvotes,
                lastVerifiedAt: worked ? new Date() : coupon.lastVerifiedAt,
                freshnessIndicator: worked ? 'Verified just now' : coupon.freshnessIndicator
              }
            : coupon
        ));
        
        setFilteredCoupons(prev => prev.map(coupon => 
          coupon._id === couponId 
            ? {
                ...coupon,
                upvotes: updatedCoupon.upvotes,
                downvotes: updatedCoupon.downvotes,
                successRate: updatedCoupon.upvotes + updatedCoupon.downvotes > 0 
                  ? Math.round((updatedCoupon.upvotes / (updatedCoupon.upvotes + updatedCoupon.downvotes)) * 100) 
                  : 0,
                totalVotes: updatedCoupon.upvotes + updatedCoupon.downvotes,
                lastVerifiedAt: worked ? new Date() : coupon.lastVerifiedAt,
                freshnessIndicator: worked ? 'Verified just now' : coupon.freshnessIndicator
              }
            : coupon
        ));

        // Analytics
        captureEvent(ANALYTICS_EVENTS.COUPON_VOTED, {
          couponId,
          worked,
          source: 'main_feed',
        });
      }
    } catch (err) {
      console.error('Error voting on coupon:', err);
      // You might want to show a toast notification here
    }
  };

  // Function to check for "worked for me" prompts
  const checkForPrompts = () => {
    try {
      const copiedCoupons = JSON.parse(localStorage.getItem('copiedCoupons') || '[]');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      // Find coupons copied in the last hour that haven't been prompted
      const recentlyCopied = copiedCoupons.filter(
        (item: any) => now - item.timestamp < oneHour && !item.prompted
      );

      if (recentlyCopied.length > 0) {
        const couponToPrompt = recentlyCopied[0];
        setWorkedForMeModal({
          isOpen: true,
          coupon: {
            couponId: couponToPrompt.couponId,
            brand: couponToPrompt.brand,
            code: couponToPrompt.code,
            timestamp: couponToPrompt.timestamp,
          },
        });

        // Mark as prompted
        const updatedCoupons = copiedCoupons.map((item: any) =>
          item.couponId === couponToPrompt.couponId
            ? { ...item, prompted: true }
            : item
        );
        localStorage.setItem('copiedCoupons', JSON.stringify(updatedCoupons));
      }
    } catch (error) {
      console.error('Error checking for prompts:', error);
    }
  };

  // Handle coupon copy
  const handleCopy = (couponId: string) => {
    const coupon = allCoupons.find(c => c._id === couponId);
    if (coupon) {
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
        couponId,
        brand: coupon.brand,
        successRate: coupon.successRate,
      });
      
      // Check for prompts immediately after copying
      setTimeout(checkForPrompts, 500); // Small delay to ensure localStorage is updated
    }
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

  // Check for "worked for me" prompts on mount
  useEffect(() => {
    // Check for prompts immediately with a minimal delay to ensure page is ready
    const timer = setTimeout(checkForPrompts, 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const totalActiveCoupons = allCoupons.filter(c => !c.isExpired).length;
  const averageSuccessRate = allCoupons.length > 0 
    ? Math.round(allCoupons.reduce((sum, c) => sum + c.successRate, 0) / allCoupons.length)
    : 0;
  const totalVotes = allCoupons.reduce((sum, c) => sum + c.totalVotes, 0);

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
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="container mx-auto px-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  🎉 <strong>Coupon submitted successfully!</strong> Thank you for contributing to the community. Your coupon is now live and helping others save money.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Best <span className="text-blue-200">Coupon Codes</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Join our community of savvy shoppers. Discover verified coupon codes, share
            your finds, and save money on your favorite brands.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-200">{totalActiveCoupons}</div>
              <div className="text-sm text-blue-100">Active Coupons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-200">{averageSuccessRate}%</div>
              <div className="text-sm text-blue-100">Success Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-200">{totalVotes}</div>
              <div className="text-sm text-blue-100">Community Votes</div>
            </div>
          </div>

          <Link
            href="/coupons/new"
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Share Your First Coupon
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Trending Now</h3>
              <p className="text-gray-600 text-sm">Most popular deals</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Expiring Soon</h3>
              <p className="text-gray-600 text-sm">Limited time offers</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Top Contributors</h3>
              <p className="text-gray-600 text-sm">Community leaders</p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-2 text-sm font-medium"
              >
                View Leaderboard <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
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

      {/* Worked For Me Modal */}
      <WorkedForMeModal
        isOpen={workedForMeModal.isOpen}
        onClose={() => setWorkedForMeModal({ isOpen: false, coupon: null })}
        coupon={workedForMeModal.coupon}
        onVote={handleVote}
      />
    </div>
  );
} 