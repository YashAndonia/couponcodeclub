'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Tag, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import { CouponWithStats, SearchFilters } from '@/types/coupon';
import { getBrandLogoUrl, getBrandColors, getBrandDomain, hasHighQualityLogo, getBrandedPlaceholderUrl } from '@/lib/brand-logos';
import { getBrandDetails, voteCoupon } from '@/lib/api/client';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

// Brand Logo Component
const BrandLogo = ({ brandName, size = 96 }: { brandName: string; size?: number }) => {
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(getBrandLogoUrl(brandName, size));
  const [logoAttempt, setLogoAttempt] = useState(0);

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

  const brandColors = getBrandColors(brandName);

  if (logoError) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg font-bold text-white shadow-lg"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: `#${brandColors.bg}`,
          color: `#${brandColors.text}`,
          fontSize: size * 0.3
        }}
      >
        {brandName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={logoSrc}
      alt={`${brandName} logo`}
      className="rounded-lg shadow-lg"
      style={{ width: size, height: size }}
      onError={handleLogoError}
    />
  );
};

export default function BrandPage() {
  const params = useParams();
  const brandName = decodeURIComponent(params?.brand as string || '');
  
  const [brandData, setBrandData] = useState<any>(null);
  const [coupons, setCoupons] = useState<CouponWithStats[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ sort: 'recent', page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch brand data and coupons
  const fetchBrandData = async (newFilters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      const response = await getBrandDetails(brandName, filtersToUse);
      
      if (response.success && response.data) {
        const { brand, coupons: brandCoupons, pagination: paginationData } = response.data;
        
        // Transform the data to match our expected format
        const transformedCoupons: CouponWithStats[] = brandCoupons.map(coupon => ({
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
        
        setBrandData(brand);
        setCoupons(transformedCoupons);
        setPagination(paginationData);
      } else {
        throw new Error(response.error || 'Failed to fetch brand data');
      }
    } catch (err) {
      console.error('Error fetching brand data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load brand data');
      
      // Fallback: create basic brand data
      setBrandData({
        name: brandName,
        domain: getBrandDomain(brandName),
        totalCoupons: 0,
        activeCoupons: 0,
        averageSuccessRate: 0
      });
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

  // Load brand data on mount and when filters change
  useEffect(() => {
    if (brandName) {
      fetchBrandData();
    }
  }, [brandName, filters]);

  // Handle voting
  const handleVote = async (couponId: string, worked: boolean) => {
    try {
      const response = await voteCoupon(couponId, worked);
      
      if (response.success && response.data) {
        // Update the coupon in our local state
        const updatedCoupon = response.data;
        
        setCoupons(prev => prev.map(coupon => 
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
          source: 'brand_page',
          brand: brandName,
        });
      }
    } catch (err) {
      console.error('Error voting on coupon:', err);
    }
  };

  // Handle coupon copy
  const handleCopy = (couponId: string) => {
    const coupon = coupons.find(c => c._id === couponId);
    if (coupon) {
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
        couponId,
        brand: coupon.brand,
        successRate: coupon.successRate,
        source: 'brand_page',
      });
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  // Calculate brand stats
  const brandStats = useMemo(() => {
    const activeCoupons = coupons.filter(c => !c.isExpired).length;
    const totalVotes = coupons.reduce((sum, c) => sum + c.totalVotes, 0);
    const averageSuccessRate = coupons.length > 0 
      ? Math.round(coupons.reduce((sum, c) => sum + c.successRate, 0) / coupons.length)
      : 0;
    
    return {
      totalCoupons: coupons.length,
      activeCoupons,
      totalVotes,
      averageSuccessRate
    };
  }, [coupons]);

  const brandColors = getBrandColors(brandName);
  const brandDomain = getBrandDomain(brandName);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !brandData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Brand
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchBrandData()}
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
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Coupons
          </Link>

          {/* Brand Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-start space-x-6">
              <BrandLogo brandName={brandName} size={96} />
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {brandName}
                </h1>
                
                {brandDomain && (
                  <a
                    href={`https://${brandDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {brandDomain}
                  </a>
                )}
                
                {/* Brand Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{brandStats.totalCoupons}</div>
                    <div className="text-sm text-gray-600">Total Coupons</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{brandStats.activeCoupons}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{brandStats.averageSuccessRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{brandStats.totalVotes}</div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coupons Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Available Coupons
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>{brandStats.activeCoupons} active deals</span>
              </div>
            </div>

            {coupons.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No coupons available
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share a coupon for {brandName}!
                </p>
                <Link
                  href="/coupons/new"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Coupon
                </Link>
              </div>
            ) : (
              <CouponFeed
                coupons={coupons}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 