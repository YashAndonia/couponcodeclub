'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Trophy, ThumbsUp, ThumbsDown, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { User, CouponWithStats } from '@/types/coupon';
import CouponCard from '@/components/CouponCard';

// Mock user data - replace with actual API calls
const mockUsers: Record<string, User> = {
  'sportslover': {
    _id: 'user1',
    username: 'sportslover',
    email: 'sports@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-10'),
    rankScore: 85,
    totalUpvotes: 120,
    totalDownvotes: 35,
  },
  'dealfinder': {
    _id: 'user2',
    username: 'dealfinder',
    email: 'deals@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-05'),
    rankScore: 156,
    totalUpvotes: 200,
    totalDownvotes: 44,
  },
  'couponpro': {
    _id: 'user3',
    username: 'couponpro',
    email: 'pro@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2023-12-20'),
    rankScore: 245,
    totalUpvotes: 300,
    totalDownvotes: 55,
  },
};

// Mock user coupons - replace with actual API calls
const mockUserCoupons: Record<string, CouponWithStats[]> = {
  'sportslover': [
    {
      _id: '1',
      brand: 'Nike',
      code: 'SAVE20',
      description: '20% off all athletic wear',
      tags: ['sports', 'clothing', 'athletic'],
      submitterId: 'user1',
      submitter: { username: 'sportslover' },
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
      _id: '7',
      brand: 'Adidas',
      code: 'SPORT15',
      description: '15% off running shoes',
      tags: ['sports', 'shoes', 'running'],
      submitterId: 'user1',
      submitter: { username: 'sportslover' },
      upvotes: 28,
      downvotes: 4,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      successRate: 87.5,
      totalVotes: 32,
      isExpired: false,
      freshnessIndicator: 'Verified 5 hours ago',
    },
  ],
  'dealfinder': [
    {
      _id: '2',
      brand: 'Amazon',
      code: 'PRIME10',
      description: '10% off for Prime members',
      tags: ['electronics', 'prime', 'amazon'],
      submitterId: 'user2',
      submitter: { username: 'dealfinder' },
      upvotes: 120,
      downvotes: 15,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      successRate: 89,
      totalVotes: 135,
      isExpired: false,
      freshnessIndicator: 'Verified 1 hour ago',
    },
  ],
  'couponpro': [
    {
      _id: '3',
      brand: 'Target',
      code: 'WEEKLY25',
      description: '25% off home goods',
      tags: ['home', 'decor', 'furniture'],
      submitterId: 'user3',
      submitter: { username: 'couponpro' },
      upvotes: 80,
      downvotes: 12,
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
      successRate: 87,
      totalVotes: 92,
      isExpired: false,
      freshnessIndicator: 'Verified 3 hours ago',
    },
  ],
};

const getRankBadge = (rankScore: number) => {
  if (rankScore >= 200) return { name: 'Gold', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '🏆' };
  if (rankScore >= 100) return { name: 'Silver', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '🥈' };
  if (rankScore >= 50) return { name: 'Bronze', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🥉' };
  return { name: 'Rookie', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '⭐' };
};

export default function UserProfile() {
  const params = useParams();
  const username = params?.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [userCoupons, setUserCoupons] = useState<CouponWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userData = mockUsers[username];
        const couponsData = mockUserCoupons[username] || [];
        
        if (!userData) {
          setError('User not found');
        } else {
          setUser(userData);
          setUserCoupons(couponsData);
        }
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
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
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600">The user "{username}" doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const badge = getRankBadge(user.rankScore);
  const successRate = user.totalUpvotes + user.totalDownvotes > 0 
    ? Math.round((user.totalUpvotes / (user.totalUpvotes + user.totalDownvotes)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                  {user.username}
                </h1>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name} Contributor
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {user.joinDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Rank Score: {user.rankScore}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userCoupons.length}</div>
              <div className="text-sm text-gray-600">Coupons Posted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.totalUpvotes}</div>
              <div className="text-sm text-gray-600">Total Upvotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{user.totalDownvotes}</div>
              <div className="text-sm text-gray-600">Total Downvotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* User's Coupons */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Posted Coupons ({userCoupons.length})
          </h2>
          
          {userCoupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coupons Yet</h3>
              <p className="text-gray-600">This user hasn't posted any coupons yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userCoupons.map((coupon) => (
                <div key={coupon._id} className="relative">
                  <CouponCard coupon={coupon} />
                  
                  {/* Additional Stats for Profile View */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 border">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1 text-green-600" />
                        {coupon.upvotes}
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown className="w-3 h-3 mr-1 text-red-600" />
                        {coupon.downvotes}
                      </div>
                      <div className="text-gray-400">•</div>
                      <div>{coupon.successRate}% success</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 