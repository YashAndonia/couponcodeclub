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

// Mock data for development - replace with actual API calls
const mockCoupons: CouponWithStats[] = [
  {
    _id: '1',
    brand: 'Nike',
    code: 'SAVE20',
    description: '20% off all athletic wear',
    tags: ['sports', 'clothing', 'athletic'],
    submitterId: 'user1',
    submitter: { username: 'sportslover', avatarUrl: undefined },
    upvotes: 45,
    downvotes: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    successRate: 90,
    totalVotes: 50,
    isExpired: false,
    freshnessIndicator: 'Verified 2 hours ago',
  },
  {
    _id: '2',
    brand: 'Amazon',
    code: 'PRIME10',
    description: '10% off for Prime members',
    tags: ['electronics', 'prime', 'amazon'],
    submitterId: 'user2',
    submitter: { username: 'dealfinder', avatarUrl: undefined },
    upvotes: 120,
    downvotes: 15,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    successRate: 89,
    totalVotes: 135,
    isExpired: false,
    freshnessIndicator: 'Verified 1 hour ago',
  },
  {
    _id: '3',
    brand: 'Target',
    code: 'WEEKLY25',
    description: '25% off home goods',
    tags: ['home', 'decor', 'furniture'],
    submitterId: 'user3',
    submitter: { username: 'couponpro', avatarUrl: undefined },
    upvotes: 80,
    downvotes: 12,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    successRate: 87,
    totalVotes: 92,
    isExpired: false,
    freshnessIndicator: 'Verified 3 hours ago',
  },
  {
    _id: '4',
    brand: 'Best Buy',
    code: 'TECH15',
    description: '15% off electronics',
    tags: ['electronics', 'tech', 'gadgets'],
    submitterId: 'user4',
    submitter: { username: 'techguru', avatarUrl: undefined },
    upvotes: 65,
    downvotes: 8,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    successRate: 89,
    totalVotes: 73,
    isExpired: false,
    freshnessIndicator: 'Verified 4 hours ago',
  },
  {
    _id: '5',
    brand: 'Starbucks',
    code: 'COFFEE20',
    description: '20% off your next order',
    tags: ['food', 'coffee', 'drinks'],
    submitterId: 'user5',
    submitter: { username: 'coffeelover', avatarUrl: undefined },
    upvotes: 95,
    downvotes: 10,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    successRate: 90,
    totalVotes: 105,
    isExpired: false,
    freshnessIndicator: 'Verified 6 hours ago',
  },
  {
    _id: '6',
    brand: 'H&M',
    code: 'FASHION30',
    description: '30% off new arrivals',
    tags: ['fashion', 'clothing', 'style'],
    submitterId: 'user6',
    submitter: { username: 'fashionista', avatarUrl: undefined },
    upvotes: 112,
    downvotes: 18,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    successRate: 86,
    totalVotes: 130,
    isExpired: false,
    freshnessIndicator: 'Verified 8 hours ago',
  }
];

export default function HomePage() {
  const { data: session } = useSession();
  const [allCoupons, setAllCoupons] = useState<CouponWithStats[]>(mockCoupons);
  const [filteredCoupons, setFilteredCoupons] = useState<CouponWithStats[]>(mockCoupons);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent', page: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [workedForMeModal, setWorkedForMeModal] = useState<{
    isOpen: boolean;
    coupon: CouponWithStats | null;
  }>({
    isOpen: false,
    coupon: null,
  });

  // Sort and filter coupons
  const sortedCoupons = useMemo(() => {
    let sorted = [...filteredCoupons];
    
    switch (filters.sort) {
      case 'popular':
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'expiring':
        sorted.sort((a, b) => {
          if (!a.expiresAt && !b.expiresAt) return 0;
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        });
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return sorted;
  }, [filteredCoupons, filters.sort]);

  // Paginated coupons
  const paginatedCoupons = useMemo(() => {
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 10);
    const endIndex = startIndex + (filters.limit || 10);
    return sortedCoupons.slice(startIndex, endIndex);
  }, [sortedCoupons, filters.page, filters.limit]);

  // Check for "worked for me" prompts on mount
  useEffect(() => {
    const checkWorkedForMePrompts = () => {
      const copiedCoupons = JSON.parse(localStorage.getItem('copiedCoupons') || '[]');
      const now = Date.now();
      const thirtySecondsAgo = now - 30000; // 30 seconds ago
      
      // Find coupons copied recently that haven't been prompted yet
      const recentlyCopied = copiedCoupons.filter((copied: any) => 
        copied.timestamp > thirtySecondsAgo && 
        copied.timestamp < now - 5000 && // At least 5 seconds ago
        !copied.prompted
      );
      
      if (recentlyCopied.length > 0) {
        const copiedCoupon = recentlyCopied[0];
        const coupon = allCoupons.find(c => c._id === copiedCoupon.couponId);
        
        if (coupon) {
          setWorkedForMeModal({ isOpen: true, coupon });
          
          // Mark as prompted
          const updatedCopiedCoupons = copiedCoupons.map((copied: any) =>
            copied.couponId === copiedCoupon.couponId 
              ? { ...copied, prompted: true }
              : copied
          );
          localStorage.setItem('copiedCoupons', JSON.stringify(updatedCopiedCoupons));
        }
      }
    };

    // Check immediately and then every 5 seconds
    checkWorkedForMePrompts();
    const interval = setInterval(checkWorkedForMePrompts, 5000);
    
    return () => clearInterval(interval);
  }, [allCoupons]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
    
    if (!query.trim()) {
      setFilteredCoupons(allCoupons);
      return;
    }
    
    const filtered = allCoupons.filter(coupon =>
      coupon.brand.toLowerCase().includes(query.toLowerCase()) ||
      coupon.description.toLowerCase().includes(query.toLowerCase()) ||
      coupon.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredCoupons(filtered);
    
    // Analytics
    captureEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query,
      resultsCount: filtered.length,
    });
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleVote = async (couponId: string, worked: boolean) => {
    // Optimistic update
    const updateCoupons = (coupons: CouponWithStats[]) =>
      coupons.map(coupon => {
        if (coupon._id === couponId) {
          const newUpvotes = worked ? coupon.upvotes + 1 : coupon.upvotes;
          const newDownvotes = worked ? coupon.downvotes : coupon.downvotes + 1;
          const newTotalVotes = newUpvotes + newDownvotes;
          const newSuccessRate = Math.round((newUpvotes / newTotalVotes) * 100);
          
          return {
            ...coupon,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            totalVotes: newTotalVotes,
            successRate: newSuccessRate,
            freshnessIndicator: worked ? 'Just verified' : coupon.freshnessIndicator,
            lastVerifiedAt: worked ? new Date() : coupon.lastVerifiedAt,
          };
        }
        return coupon;
      });
    
    setAllCoupons(updateCoupons);
    setFilteredCoupons(updateCoupons);
    
    // Analytics
    captureEvent(ANALYTICS_EVENTS.COUPON_VOTED, {
      couponId,
      worked,
      source: 'homepage',
    });
  };

  const handleCopy = (couponId: string) => {
    // Analytics
    captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
      couponId,
      source: 'homepage',
    });
  };

  const handleWorkedForMeVote = (couponId: string, worked: boolean) => {
    handleVote(couponId, worked);
    closeWorkedForMeModal();
  };

  const closeWorkedForMeModal = () => {
    setWorkedForMeModal({ isOpen: false, coupon: null });
  };

  const handleSignIn = () => {
    // Import signIn from next-auth/react at the top of the component
    import('next-auth/react').then(({ signIn }) => {
      signIn('google', { callbackUrl: '/' });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Find the Best <span className="text-primary-600">Coupon Codes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community of savvy shoppers. Discover verified coupon codes, share your finds, 
            and save money on your favorite brands.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-primary-600 mb-2">{allCoupons.length}</div>
              <div className="text-gray-600">Active Coupons</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(allCoupons.reduce((acc, coupon) => acc + coupon.successRate, 0) / allCoupons.length)}%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {allCoupons.reduce((acc, coupon) => acc + coupon.totalVotes, 0)}
              </div>
              <div className="text-gray-600">Community Votes</div>
            </div>
          </div>
          
          {session ? (
            <Link 
              href="/coupons/new"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Share Your First Coupon</span>
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              <Star className="w-5 h-5" />
              <span>Join the Community</span>
            </button>
          )}
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Trending Now */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trending Now</h3>
            </div>
            <div className="space-y-3">
              {allCoupons
                .sort((a, b) => b.upvotes - a.upvotes)
                .slice(0, 3)
                .map(coupon => (
                  <Link
                    key={coupon._id}
                    href={`/brand/${encodeURIComponent(coupon.brand.toLowerCase())}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{coupon.brand}</div>
                    <div className="text-sm text-gray-600">{coupon.description}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {coupon.successRate}% success
                      </span>
                      <span className="text-xs text-gray-500">{coupon.upvotes} votes</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Expiring Soon</h3>
            </div>
            <div className="space-y-3">
              {allCoupons
                .filter(coupon => coupon.expiresAt)
                .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
                .slice(0, 3)
                .map(coupon => (
                  <Link
                    key={coupon._id}
                    href={`/brand/${encodeURIComponent(coupon.brand.toLowerCase())}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{coupon.brand}</div>
                    <div className="text-sm text-gray-600">{coupon.description}</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Expires {new Date(coupon.expiresAt!).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
            </div>
            <div className="space-y-3">
              {['couponpro', 'dealfinder', 'sportslover'].map((username, index) => (
                <Link
                  key={username}
                  href={`/user/${username}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{username}</div>
                    <div className="text-xs text-gray-500">
                      {index === 0 ? '245' : index === 1 ? '156' : '85'} rank score
                    </div>
                  </div>
                  <div className="text-xl">
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </Link>
              ))}
              <Link
                href="/leaderboard"
                className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium pt-2"
              >
                View Full Leaderboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Main Coupon Feed */}
        <CouponFeed
          coupons={paginatedCoupons}
          loading={loading}
          onVote={handleVote}
          onCopy={handleCopy}
          onFiltersChange={handleFiltersChange}
          filters={filters}
          total={sortedCoupons.length}
          hasMore={paginatedCoupons.length < sortedCoupons.length}
        />


        {/* CTA Section */}
        {!session && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already saving money with our community-verified coupon codes. 
              Sign up today and start sharing your discoveries!
            </p>
            <button 
              onClick={handleSignIn}
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span>Join CouponCodeClub</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Worked for Me Modal */}
      <WorkedForMeModal
        isOpen={workedForMeModal.isOpen}
        onClose={closeWorkedForMeModal}
        coupon={workedForMeModal.coupon ? {
          couponId: workedForMeModal.coupon._id,
          timestamp: Date.now(),
          brand: workedForMeModal.coupon.brand,
          code: workedForMeModal.coupon.code,
        } : null}
        onVote={handleWorkedForMeVote}
      />
    </div>
  );
} 