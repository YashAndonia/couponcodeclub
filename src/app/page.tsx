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
    code: 'WEEKEND25',
    description: '25% off weekend sale items',
    tags: ['retail', 'weekend', 'sale'],
    expiresAt: new Date('2024-01-20'),
    submitterId: 'user3',
    submitter: { username: 'targetfan', avatarUrl: undefined },
    upvotes: 78,
    downvotes: 12,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    successRate: 87,
    totalVotes: 90,
    isExpired: false,
    freshnessIndicator: 'Verified 3 hours ago',
  },
  {
    _id: '4',
    brand: 'Adidas',
    code: 'SPORTS15',
    description: '15% off all sports equipment',
    tags: ['sports', 'equipment', 'adidas'],
    submitterId: 'user4',
    submitter: { username: 'fitnessguru', avatarUrl: undefined },
    upvotes: 34,
    downvotes: 8,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    successRate: 81,
    totalVotes: 42,
    isExpired: false,
    freshnessIndicator: 'Verified 5 hours ago',
  },
  {
    _id: '5',
    brand: 'Best Buy',
    code: 'TECH20',
    description: '20% off electronics over $100',
    tags: ['electronics', 'tech', 'bestbuy'],
    submitterId: 'user5',
    submitter: { username: 'techdeals', avatarUrl: undefined },
    upvotes: 156,
    downvotes: 23,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    successRate: 87,
    totalVotes: 179,
    isExpired: false,
    freshnessIndicator: 'Verified 30 minutes ago',
  },
  {
    _id: '6',
    brand: 'Macy\'s',
    code: 'FASHION30',
    description: '30% off fashion items',
    tags: ['fashion', 'clothing', 'macys'],
    expiresAt: new Date('2024-01-18'),
    submitterId: 'user6',
    submitter: { username: 'fashionista', avatarUrl: undefined },
    upvotes: 67,
    downvotes: 11,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    successRate: 86,
    totalVotes: 78,
    isExpired: false,
    freshnessIndicator: 'Verified 4 hours ago',
  },
  {
    _id: '7',
    brand: 'Walmart',
    code: 'SAVE15',
    description: '15% off groceries and household items',
    tags: ['grocery', 'household', 'walmart'],
    submitterId: 'user7',
    submitter: { username: 'savingspro', avatarUrl: undefined },
    upvotes: 89,
    downvotes: 18,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    successRate: 83,
    totalVotes: 107,
    isExpired: false,
    freshnessIndicator: 'Verified 6 hours ago',
  },
  {
    _id: '8',
    brand: 'Home Depot',
    code: 'DIY25',
    description: '25% off DIY and home improvement',
    tags: ['home', 'diy', 'improvement'],
    expiresAt: new Date('2024-01-25'),
    submitterId: 'user8',
    submitter: { username: 'homeimprover', avatarUrl: undefined },
    upvotes: 45,
    downvotes: 9,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    successRate: 83,
    totalVotes: 54,
    isExpired: false,
    freshnessIndicator: 'Verified 8 hours ago',
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [allCoupons, setAllCoupons] = useState<CouponWithStats[]>(mockCoupons);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent' });
  const [searchQuery, setSearchQuery] = useState('');
  const [workedForMeModal, setWorkedForMeModal] = useState({
    isOpen: false,
    coupon: null as any,
  });

  // Check for copied coupons on mount and show modal if needed
  useEffect(() => {
    const checkCopiedCoupons = () => {
      try {
        const copiedCoupons = JSON.parse(localStorage.getItem('copiedCoupons') || '[]');
        const now = Date.now();
        const recentCopies = copiedCoupons.filter((copy: any) => 
          now - copy.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
        );

        // Find the most recent copy that hasn't been prompted
        const unpromptedCopy = recentCopies.find((copy: any) => !copy.prompted);
        
        if (unpromptedCopy) {
          // Mark as prompted
          unpromptedCopy.prompted = true;
          localStorage.setItem('copiedCoupons', JSON.stringify(copiedCoupons));
          
          // Show modal after a short delay
          setTimeout(() => {
            setWorkedForMeModal({
              isOpen: true,
              coupon: unpromptedCopy,
            });
          }, 2000); // 2 second delay
        }
      } catch (error) {
        console.error('Error checking copied coupons:', error);
      }
    };

    // Check on mount
    checkCopiedCoupons();

    // Set up interval to check periodically
    const interval = setInterval(checkCopiedCoupons, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter and sort coupons based on search query and filters
  const filteredAndSortedCoupons = useMemo(() => {
    let filtered = allCoupons;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(coupon => 
        coupon.brand.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.tags.some(tag => tag.toLowerCase().includes(query)) ||
        coupon.code.toLowerCase().includes(query)
      );
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(coupon => 
        coupon.brand.toLowerCase() === filters.brand!.toLowerCase()
      );
    }

    // Apply submitter filter
    if (filters.submitter) {
      filtered = filtered.filter(coupon => 
        coupon.submitter?.username.toLowerCase().includes(filters.submitter!.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.successRate - a.successRate);
        break;
      case 'expiring':
        filtered = [...filtered].sort((a, b) => {
          if (!a.expiresAt && !b.expiresAt) return 0;
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        });
        break;
      case 'recent':
      default:
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [allCoupons, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    captureEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, { query });
  };

  const handleVote = async (couponId: string, worked: boolean) => {
    // TODO: Implement voting API call
    console.log('Vote:', couponId, worked);
    
    // Optimistic update
    setAllCoupons(prev => prev.map(coupon => {
      if (coupon._id === couponId) {
        return {
          ...coupon,
          upvotes: worked ? coupon.upvotes + 1 : coupon.upvotes,
          downvotes: worked ? coupon.downvotes : coupon.downvotes + 1,
          successRate: Math.round(((worked ? coupon.upvotes + 1 : coupon.upvotes) / (coupon.totalVotes + 1)) * 100),
          totalVotes: coupon.totalVotes + 1,
        };
      }
      return coupon;
    }));
  };

  const handleCopy = (couponId: string) => {
    // TODO: Implement copy tracking
    console.log('Copied coupon:', couponId);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  const handleWorkedForMeVote = (couponId: string, worked: boolean) => {
    handleVote(couponId, worked);
  };

  const closeWorkedForMeModal = () => {
    setWorkedForMeModal({ isOpen: false, coupon: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover & Share the Best
            <span className="text-primary-600"> Coupon Codes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community of savvy shoppers. Find verified coupon codes from top retailers, 
            share your discoveries, and earn recognition on our leaderboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {session ? (
              <Link 
                href="/coupons/new"
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your Coupon</span>
              </Link>
            ) : (
              <Link 
                href="/auth/signin"
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            
            <Link 
              href="/leaderboard"
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{allCoupons.length}+</h3>
            <p className="text-gray-600">Verified Coupons</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {allCoupons.reduce((sum, coupon) => sum + coupon.totalVotes, 0)}+
            </h3>
            <p className="text-gray-600">Community Votes</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {Math.round(allCoupons.reduce((sum, coupon) => sum + coupon.successRate, 0) / allCoupons.length)}%
            </h3>
            <p className="text-gray-600">Success Rate</p>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Search results for "<span className="font-semibold">{searchQuery}</span>": 
              <span className="font-semibold ml-1">{filteredAndSortedCoupons.length}</span> coupon{filteredAndSortedCoupons.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Featured Coupons Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : 'Latest Coupons'}
            </h2>
            <Link 
              href="/coupons"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <CouponFeed
            coupons={filteredAndSortedCoupons}
            loading={loading}
            onVote={handleVote}
            onCopy={handleCopy}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            total={filteredAndSortedCoupons.length}
          />
        </div>

        {/* CTA Section */}
        {!session && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already saving money with our community-verified coupon codes. 
              Sign up today and start sharing your discoveries!
            </p>
            <Link 
              href="/auth/signin"
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span>Join CouponCodeClub</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>

      {/* Worked for Me Modal */}
      <WorkedForMeModal
        isOpen={workedForMeModal.isOpen}
        onClose={closeWorkedForMeModal}
        coupon={workedForMeModal.coupon}
        onVote={handleWorkedForMeVote}
      />
    </div>
  );
} 