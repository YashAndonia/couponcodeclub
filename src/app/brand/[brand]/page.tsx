'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Tag, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import { CouponWithStats, SearchFilters } from '@/types/coupon';
import { getBrandLogoUrl, getBrandColors, getBrandDomain, hasHighQualityLogo, getBrandedPlaceholderUrl } from '@/lib/brand-logos';

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

// Brand Logo Component
const BrandLogo = ({ brandName, size = 96 }: { brandName: string; size?: number }) => {
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(getBrandLogoUrl(brandName, size));
  const [logoAttempt, setLogoAttempt] = useState(0);
  const colors = getBrandColors(brandName);
  
  const handleLogoError = () => {
    if (logoAttempt === 0) {
      // First fallback: try branded placeholder
      setLogoSrc(getBrandedPlaceholderUrl(brandName, size));
      setLogoAttempt(1);
    } else {
      // Final fallback: show custom fallback component
      setLogoError(true);
    }
  };
  
  if (logoError) {
    return (
      <div 
        className="rounded-2xl flex items-center justify-center"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: `#${colors.bg}` 
        }}
      >
        <span 
          className="font-bold"
          style={{ 
            color: `#${colors.text}`, 
            fontSize: `${size / 3}px` 
          }}
        >
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }
  
  return (
    <img
      src={logoSrc}
      alt={`${brandName} logo`}
      className="rounded-2xl object-cover"
      style={{ width: size, height: size }}
      onError={handleLogoError}
      onLoad={() => console.log(`✓ Brand logo loaded for ${brandName}: ${logoSrc}`)}
    />
  );
};

export default function BrandPage() {
  const params = useParams();
  const brandName = decodeURIComponent(params.brand as string);
  const [coupons, setCoupons] = useState<CouponWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent' });

  // Filter coupons for this brand
  const brandCoupons = useMemo(() => {
    return mockCoupons.filter(coupon => 
      coupon.brand.toLowerCase() === brandName.toLowerCase()
    );
  }, [brandName]);

  // Get brand stats
  const brandStats = useMemo(() => {
    const totalCoupons = brandCoupons.length;
    const totalVotes = brandCoupons.reduce((sum, coupon) => sum + coupon.totalVotes, 0);
    const totalUpvotes = brandCoupons.reduce((sum, coupon) => sum + coupon.upvotes, 0);
    const averageSuccessRate = totalCoupons > 0 
      ? Math.round(brandCoupons.reduce((sum, coupon) => sum + coupon.successRate, 0) / totalCoupons)
      : 0;
    
    return {
      totalCoupons,
      totalVotes,
      totalUpvotes,
      averageSuccessRate,
    };
  }, [brandCoupons]);

  // Get all unique tags for this brand
  const brandTags = useMemo(() => {
    const tags = new Set<string>();
    brandCoupons.forEach(coupon => {
      coupon.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).slice(0, 6); // Show top 6 tags
  }, [brandCoupons]);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCoupons(brandCoupons);
      } catch (error) {
        console.error('Failed to fetch brand coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [brandName, brandCoupons]);

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Search:', query);
  };

  const handleVote = (couponId: string, worked: boolean) => {
    // Implement voting functionality
    console.log('Vote:', couponId, worked);
  };

  const handleCopy = (couponId: string) => {
    // Implement copy tracking
    console.log('Copy:', couponId);
  };

  // Get brand domain for website link
  const brandDomain = getBrandDomain(brandName);
  const brandWebsite = brandDomain ? `https://${brandDomain}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Brand Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Brand Logo */}
            <BrandLogo brandName={brandName} size={96} />
            
            {/* Brand Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0 capitalize">
                  {brandName}
                </h1>
                
                {brandWebsite && (
                  <a
                    href={brandWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>

              {/* Brand Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{brandStats.totalCoupons}</div>
                  <div className="text-sm text-gray-600">Active Coupons</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{brandStats.averageSuccessRate}%</div>
                  <div className="text-sm text-gray-600">Avg Success Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{brandStats.totalVotes}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{brandStats.totalUpvotes}</div>
                  <div className="text-sm text-gray-600">Successful Uses</div>
                </div>
              </div>

              {/* Brand Tags */}
              {brandTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {brandTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coupons Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Coupons ({brandCoupons.length})
            </h2>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as any })}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="expiring">Expiring Soon</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-32"></div>
                </div>
              ))}
            </div>
          ) : brandCoupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coupons Found</h3>
              <p className="text-gray-600 mb-6">
                We don't have any coupons for {brandName} yet.
              </p>
              <Link
                href="/coupons/new"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>Be the first to add one!</span>
              </Link>
            </div>
          ) : (
            <CouponFeed
              coupons={coupons}
              onVote={handleVote}
              onCopy={handleCopy}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
} 