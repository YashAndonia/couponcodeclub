'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ThumbsUp, ThumbsDown, Clock, User, Tag, ExternalLink } from 'lucide-react';
import { CouponWithStats } from '@/types/coupon';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { getBrandLogoUrl, getBrandedPlaceholderUrl, getBrandColors } from '@/lib/brand-logos';

interface CouponCardProps {
  coupon: CouponWithStats;
  onVote?: (couponId: string, worked: boolean) => void;
  onCopy?: (couponId: string) => void;
}

// Fallback component for when logo fails to load
const BrandLogoFallback = ({ brandName }: { brandName: string }) => {
  const colors = getBrandColors(brandName);
  return (
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `#${colors.bg}` }}
    >
      <span 
        className="text-lg font-bold"
        style={{ color: `#${colors.text}` }}
      >
        {brandName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

export default function CouponCard({ coupon, onVote, onCopy }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState(getBrandLogoUrl(coupon.brand, 64));
  const [logoAttempt, setLogoAttempt] = useState(0);

  const handleLogoError = () => {
    if (logoAttempt === 0) {
      // First fallback: try branded placeholder
      setLogoSrc(getBrandedPlaceholderUrl(coupon.brand, 64));
      setLogoAttempt(1);
    } else {
      // Final fallback: show custom fallback component
      setLogoError(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      onCopy?.(coupon._id);
      
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
        couponId: coupon._id,
        brand: coupon.brand,
        successRate: coupon.successRate,
      });

      // Store in localStorage for "worked for me" prompt
      const copiedCoupons = JSON.parse(localStorage.getItem('copiedCoupons') || '[]');
      copiedCoupons.push({
        couponId: coupon._id,
        timestamp: Date.now(),
        brand: coupon.brand,
        code: coupon.code,
      });
      localStorage.setItem('copiedCoupons', JSON.stringify(copiedCoupons));

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
    }
  };

  const handleVote = async (worked: boolean) => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      onVote?.(coupon._id, worked);
      
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_VOTED, {
        couponId: coupon._id,
        brand: coupon.brand,
        worked,
        successRate: coupon.successRate,
      });
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSuccessRateText = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Brand Logo */}
            {!logoError ? (
              <img
                src={logoSrc}
                alt={`${coupon.brand} logo`}
                className="w-12 h-12 rounded-lg object-cover"
                onError={handleLogoError}
                onLoad={() => console.log(`✓ Logo loaded for ${coupon.brand}: ${logoSrc}`)}
              />
            ) : (
              <BrandLogoFallback brandName={coupon.brand} />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/brand/${encodeURIComponent(coupon.brand.toLowerCase())}`}
                  className="group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {coupon.brand}
                  </h3>
                </Link>
                {coupon.link && (
                  <a
                    href={coupon.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Visit store"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{coupon.description}</p>
            </div>
          </div>
          
          {/* Success Rate Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            coupon.successRate >= 80 ? 'bg-green-100 text-green-800' :
            coupon.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
            coupon.successRate >= 40 ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {coupon.successRate}% success
          </div>
        </div>
      </div>

      {/* Coupon Content */}
      <div className="p-4">
        {/* Coupon Code */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 relative group hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <code className="text-lg font-bold text-gray-900 tracking-wider">
                  {coupon.code}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {coupon.tags && coupon.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {coupon.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {coupon.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{coupon.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {coupon.submitter && (
              <Link
                href={`/user/${coupon.submitter.username}`}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{coupon.submitter.username}</span>
              </Link>
            )}
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{coupon.freshnessIndicator}</span>
            </div>
          </div>
          
          {coupon.expiresAt && (
            <div className={`text-xs px-2 py-1 rounded ${
              coupon.isExpired 
                ? 'bg-red-100 text-red-800' 
                : new Date(coupon.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              {coupon.isExpired 
                ? 'Expired' 
                : `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`
              }
            </div>
          )}
        </div>

        {/* Voting Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className="flex items-center space-x-2 px-3 py-2 rounded-md border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{coupon.upvotes}</span>
              <span className="text-sm">Worked</span>
            </button>
            
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className="flex items-center space-x-2 px-3 py-2 rounded-md border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">{coupon.downvotes}</span>
              <span className="text-sm">Didn't Work</span>
            </button>
          </div>

          <div className="text-right">
            <div className={`text-sm font-medium ${getSuccessRateColor(coupon.successRate)}`}>
              {getSuccessRateText(coupon.successRate)}
            </div>
            <div className="text-xs text-gray-500">
              {coupon.totalVotes} votes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 