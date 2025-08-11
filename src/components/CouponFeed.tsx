'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Filter, Grid, List } from 'lucide-react';
import CouponCard from './CouponCard';
import { CouponWithStats, SearchFilters } from '@/types/coupon';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

interface CouponFeedProps {
  coupons: CouponWithStats[];
  loading?: boolean;
  onVote?: (couponId: string, worked: boolean) => void;
  onCopy?: (couponId: string) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  filters?: SearchFilters;
  total?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function CouponFeed({
  coupons,
  loading = false,
  onVote,
  onCopy,
  onFiltersChange,
  filters = {},
  total,
  hasMore = false,
  onLoadMore,
}: CouponFeedProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Highest Rated' },
    { value: 'expiring', label: 'Expiring Soon' },
  ];

  const handleSortChange = (sort: string) => {
    const newFilters = { ...filters, sort: sort as SearchFilters['sort'] };
    onFiltersChange?.(newFilters);
    setShowSortMenu(false);
    
    // Analytics
    captureEvent('sort_changed', { sort });
  };

  const handleVote = (couponId: string, worked: boolean) => {
    onVote?.(couponId, worked);
  };

  const handleCopy = (couponId: string) => {
    onCopy?.(couponId);
  };

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.sort-dropdown')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Analytics: Track coupon views
  useEffect(() => {
    if (coupons.length > 0) {
      coupons.forEach(coupon => {
        captureEvent(ANALYTICS_EVENTS.COUPON_VIEWED, {
          couponId: coupon._id,
          brand: coupon.brand,
          successRate: coupon.successRate,
        });
      });
    }
  }, [coupons]);

  if (loading && coupons.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {total !== undefined ? (
            <>
              Showing {coupons.length} of {total} coupons
            </>
          ) : (
            <>
              {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>
                {sortOptions.find(opt => opt.value === filters.sort)?.label || 'Sort by'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        filters.sort === option.value
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coupons Grid/List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find more coupons.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              onVote={handleVote}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Coupons'}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && coupons.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            <span>Loading more coupons...</span>
          </div>
        </div>
      )}
    </div>
  );
} 