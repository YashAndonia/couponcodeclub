'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import { CouponWithStats, SearchFilters } from '@/types/coupon';

// Mock data - replace with API call
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
    brand: 'Nike',
    code: 'SPORTS15',
    description: '15% off sports equipment',
    tags: ['sports', 'equipment', 'nike'],
    submitterId: 'user2',
    submitter: { username: 'fitnessguru', avatarUrl: undefined },
    upvotes: 78,
    downvotes: 12,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    successRate: 87,
    totalVotes: 90,
    isExpired: false,
    freshnessIndicator: 'Verified 1 hour ago',
  },
  {
    _id: '3',
    brand: 'Nike',
    code: 'NEWCUSTOMER25',
    description: '25% off for new customers',
    tags: ['sports', 'new-customer', 'nike'],
    expiresAt: new Date('2024-01-25'),
    submitterId: 'user3',
    submitter: { username: 'dealfinder', avatarUrl: undefined },
    upvotes: 120,
    downvotes: 15,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    successRate: 89,
    totalVotes: 135,
    isExpired: false,
    freshnessIndicator: 'Verified 30 minutes ago',
  },
];

export default function BrandPage() {
  const params = useParams();
  const brandName = decodeURIComponent(params.brand as string);
  const [coupons, setCoupons] = useState<CouponWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent' });
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  // Filter coupons for this brand
  const brandCoupons = useMemo(() => {
    return mockCoupons.filter(coupon => 
      coupon.brand.toLowerCase() === brandName.toLowerCase()
    );
  }, [brandName]);

  // Fetch brand logo
  useEffect(() => {
    const fetchBrandLogo = async () => {
      try {
        // TODO: Replace with actual Clearbit API call
        // const response = await fetch(`/api/brands/${brandName}/logo`);
        // const data = await response.json();
        // setBrandLogo(data.logoUrl);
        
        // For now, use a placeholder
        setBrandLogo(null);
      } catch (error) {
        console.error('Failed to fetch brand logo:', error);
      }
    };

    fetchBrandLogo();
  }, [brandName]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCoupons(brandCoupons);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [brandCoupons]);

  const handleVote = async (couponId: string, worked: boolean) => {
    // TODO: Implement voting API call
    console.log('Vote:', couponId, worked);
    
    // Optimistic update
    setCoupons(prev => prev.map(coupon => {
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

  const getBrandStats = () => {
    if (coupons.length === 0) return { totalCoupons: 0, avgSuccessRate: 0, totalVotes: 0 };
    
    const totalCoupons = coupons.length;
    const avgSuccessRate = Math.round(
      coupons.reduce((sum, coupon) => sum + coupon.successRate, 0) / totalCoupons
    );
    const totalVotes = coupons.reduce((sum, coupon) => sum + coupon.totalVotes, 0);
    
    return { totalCoupons, avgSuccessRate, totalVotes };
  };

  const stats = getBrandStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            {brandLogo ? (
              <img 
                src={brandLogo} 
                alt={`${brandName} logo`}
                className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-2xl font-bold text-gray-700">
                  {brandName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{brandName}</h1>
              <p className="text-gray-600">
                {stats.totalCoupons} coupon{stats.totalCoupons !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          {/* Brand Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</div>
              <div className="text-sm text-gray-600">Total Coupons</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.avgSuccessRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalVotes}</div>
              <div className="text-sm text-gray-600">Community Votes</div>
            </div>
          </div>
        </div>

        {/* Coupons */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {brandName} coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-gray-400">
                {brandName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found for {brandName}</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share a coupon code for {brandName}!
            </p>
            <Link
              href="/coupons/new"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Add {brandName} Coupon</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <CouponFeed
            coupons={coupons}
            loading={loading}
            onVote={handleVote}
            onCopy={handleCopy}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            total={coupons.length}
          />
        )}

        {/* Add Coupon CTA */}
        {coupons.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/coupons/new"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Add {brandName} Coupon</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 