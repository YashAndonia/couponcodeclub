'use client';

import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

interface CopiedCoupon {
  couponId: string;
  timestamp: number;
  brand: string;
  code: string;
}

interface WorkedForMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: CopiedCoupon | null;
  onVote: (couponId: string, worked: boolean) => void;
}

export default function WorkedForMeModal({ 
  isOpen, 
  onClose, 
  coupon, 
  onVote 
}: WorkedForMeModalProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (worked: boolean) => {
    if (!coupon || isVoting) return;
    
    setIsVoting(true);
    try {
      onVote(coupon.couponId, worked);
      
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_VOTED, {
        couponId: coupon.couponId,
        brand: coupon.brand,
        worked,
        source: 'worked_for_me_modal',
      });

      setHasVoted(true);
      
      // Close modal after a brief delay to show feedback
      setTimeout(() => {
        onClose();
        setHasVoted(false);
        setIsVoting(false);
      }, 800);
    } catch (error) {
      console.error('Failed to vote:', error);
      setIsVoting(false);
    }
  };

  const handleClose = () => {
    if (!isVoting) {
      onClose();
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isVoting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isVoting, onClose]);

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {hasVoted ? 'Thanks for your feedback!' : 'Did this work for you?'}
          </h3>
          <button
            onClick={handleClose}
            disabled={isVoting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasVoted ? (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
                      {coupon.brand.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{coupon.brand}</h4>
                    <p className="text-sm text-gray-500">Coupon: {coupon.code}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Your feedback helps other users find the best deals. Did this coupon code work when you tried to use it?
                </p>
              </div>

              {/* Voting Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Yes, it worked!</span>
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>No, didn't work</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                Thank you for helping the community! Your feedback has been recorded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 