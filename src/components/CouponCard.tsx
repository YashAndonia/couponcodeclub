'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ThumbsUp, ThumbsDown, Clock, User, Tag } from 'lucide-react';
import { CouponWithStats } from '@/types/coupon';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

interface CouponCardProps {
  coupon: CouponWithStats;
  onVote?: (couponId: string, worked: boolean) => void;
  onCopy?: (couponId: string) => void;
}

export default function CouponCard({ coupon, onVote, onCopy }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

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
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">
                {coupon.brand.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{coupon.brand}</h3>
              <p className="text-sm text-gray-500">{coupon.description}</p>
            </div>
          </div>
          
          {/* Success Rate Badge */}
          <div className="text-right">
            <div className={`text-sm font-medium ${getSuccessRateColor(coupon.successRate)}`}>
              {getSuccessRateText(coupon.successRate)}
            </div>
            <div className="text-xs text-gray-500">
              {coupon.successRate}% success
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Code Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Coupon Code</span>
          {coupon.isExpired && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Expired
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <code className="text-lg font-mono font-semibold text-gray-900">
              {coupon.code}
            </code>
          </div>
          <button
            onClick={handleCopy}
            disabled={copied || coupon.isExpired}
            className={`p-2 rounded-lg transition-colors ${
              copied 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Tags */}
        {coupon.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {coupon.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {coupon.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{coupon.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Voting Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{coupon.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">{coupon.downvotes}</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {coupon.totalVotes} votes
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {coupon.submitter && (
              <Link 
                href={`/user/${coupon.submitter.username}`}
                className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <User className="w-3 h-3" />
                <span>{coupon.submitter.username}</span>
              </Link>
            )}
            
            {coupon.freshnessIndicator && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{coupon.freshnessIndicator}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {coupon.expiresAt && (
              <span>
                Expires {new Date(coupon.expiresAt).toLocaleDateString()}
              </span>
            )}
            <span>
              {new Date(coupon.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 