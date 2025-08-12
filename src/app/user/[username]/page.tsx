'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Trophy, ThumbsUp, ThumbsDown, Star, Crown, Medal, Award } from 'lucide-react';
import Header from '@/components/Header';
import CouponFeed from '@/components/CouponFeed';
import { CouponWithStats, User } from '@/types/coupon';
import { getPublicUserProfile, voteCoupon } from '@/lib/api/client';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

const getRankBadge = (score: number) => {
  if (score >= 200) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Champion' };
  if (score >= 100) return { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', label: 'Gold' };
  if (score >= 50) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Silver' };
  if (score >= 20) return { icon: Award, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Bronze' };
  return { icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Rookie' };
};

export default function UserProfile() {
  const params = useParams();
  const username = params?.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [userCoupons, setUserCoupons] = useState<CouponWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPublicUserProfile(username);
      
      if (response.success && response.data) {
        const { user: userData, coupons } = response.data;
        
        // Transform the coupons data to match our expected format
        const transformedCoupons: CouponWithStats[] = coupons.map(coupon => ({
          ...coupon,
          submitter: { 
            username: userData.username,
            avatarUrl: userData.avatarUrl 
          },
          successRate: coupon.upvotes + coupon.downvotes > 0 
            ? Math.round((coupon.upvotes / (coupon.upvotes + coupon.downvotes)) * 100) 
            : 0,
          totalVotes: coupon.upvotes + coupon.downvotes,
          isExpired: coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false,
          freshnessIndicator: coupon.lastVerifiedAt 
            ? `Verified ${getTimeAgo(new Date(coupon.lastVerifiedAt))} ago`
            : 'Not yet verified'
        }));
        
        setUser(userData);
        setUserCoupons(transformedCoupons);
      } else {
        throw new Error(response.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
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

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Handle voting
  const handleVote = async (couponId: string, worked: boolean) => {
    try {
      const response = await voteCoupon(couponId, worked);
      
      if (response.success && response.data) {
        // Update the coupon in our local state
        const updatedCoupon = response.data;
        
        setUserCoupons(prev => prev.map(coupon => 
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
          source: 'user_profile',
          username,
        });
      }
    } catch (err) {
      console.error('Error voting on coupon:', err);
    }
  };

  // Handle coupon copy
  const handleCopy = (couponId: string) => {
    const coupon = userCoupons.find(c => c._id === couponId);
    if (coupon) {
      // Analytics
      captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
        couponId,
        brand: coupon.brand,
        successRate: coupon.successRate,
        source: 'user_profile',
      });
    }
  };

  // Calculate user stats
  const userStats = useMemo(() => {
    if (!user) return null;
    
    const activeCoupons = userCoupons.filter(c => !c.isExpired).length;
    const totalVotes = userCoupons.reduce((sum, c) => sum + c.totalVotes, 0);
    const averageSuccessRate = userCoupons.length > 0 
      ? Math.round(userCoupons.reduce((sum, c) => sum + c.successRate, 0) / userCoupons.length)
      : 0;
    
    return {
      totalCoupons: userCoupons.length,
      activeCoupons,
      totalVotes,
      averageSuccessRate,
      successRate: user.totalUpvotes + user.totalDownvotes > 0 
        ? Math.round((user.totalUpvotes / (user.totalUpvotes + user.totalDownvotes)) * 100)
        : 0
    };
  }, [user, userCoupons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
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
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                {error || 'User not found'}
              </h2>
              <p className="text-red-600 mb-4">
                {error || `The user "${username}" could not be found.`}
              </p>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rankBadge = getRankBadge(user.rankScore);
  const RankIcon = rankBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {user.rankScore >= 200 && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                    {user.username}
                  </h1>
                  
                  {/* Rank Badge */}
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${rankBadge.bg} ${rankBadge.border} border`}>
                    <RankIcon className={`w-5 h-5 ${rankBadge.color}`} />
                    <span className={`font-medium ${rankBadge.color}`}>
                      {rankBadge.label}
                    </span>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center text-gray-600 mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>

                {/* User Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{user.rankScore}</div>
                    <div className="text-sm text-gray-600">Rank Score</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userStats?.successRate || 0}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userStats?.totalCoupons || 0}</div>
                    <div className="text-sm text-gray-600">Coupons Shared</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{userStats?.totalVotes || 0}</div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                </div>

                {/* Vote Breakdown */}
                <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    <span className="font-medium">{user.totalUpvotes}</span>
                    <span className="text-sm text-gray-600 ml-1">helpful votes</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    <span className="font-medium">{user.totalDownvotes}</span>
                    <span className="text-sm text-gray-600 ml-1">unhelpful votes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Coupons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Shared Coupons
              </h2>
              <div className="text-sm text-gray-600">
                {userStats?.activeCoupons || 0} active • {userStats?.totalCoupons || 0} total
              </div>
            </div>

            {userCoupons.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Trophy className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No coupons shared yet
                </h3>
                <p className="text-gray-600">
                  {user.username} hasn't shared any coupons with the community yet.
                </p>
              </div>
            ) : (
              <CouponFeed
                coupons={userCoupons}
                loading={false}
                total={userCoupons.length}
                onVote={handleVote}
                onCopy={handleCopy}
                onFiltersChange={() => {}} // User profile doesn't need filtering
                filters={{}}
                hasMore={false}
              />
            )}
          </div>

          {/* Leaderboard Link */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 mt-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">See How You Stack Up</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Check out the community leaderboard to see where {user.username} ranks among all contributors.
            </p>
            <Link
              href="/leaderboard"
              className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 