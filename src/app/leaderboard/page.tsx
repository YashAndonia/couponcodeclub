'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, Star, ThumbsUp, ThumbsDown, User, ArrowLeft } from 'lucide-react';
import { User as UserType } from '@/types/coupon';

// Mock leaderboard data - replace with actual API calls
const mockLeaderboard: UserType[] = [
  {
    _id: 'user3',
    username: 'couponpro',
    email: 'pro@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2023-12-20'),
    rankScore: 245,
    totalUpvotes: 300,
    totalDownvotes: 55,
  },
  {
    _id: 'user2',
    username: 'dealfinder',
    email: 'deals@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-05'),
    rankScore: 156,
    totalUpvotes: 200,
    totalDownvotes: 44,
  },
  {
    _id: 'user4',
    username: 'savingsqueen',
    email: 'queen@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-08'),
    rankScore: 134,
    totalUpvotes: 180,
    totalDownvotes: 46,
  },
  {
    _id: 'user1',
    username: 'sportslover',
    email: 'sports@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-10'),
    rankScore: 85,
    totalUpvotes: 120,
    totalDownvotes: 35,
  },
  {
    _id: 'user5',
    username: 'bargainhunter',
    email: 'bargain@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-12'),
    rankScore: 67,
    totalUpvotes: 95,
    totalDownvotes: 28,
  },
  {
    _id: 'user6',
    username: 'discountdan',
    email: 'dan@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-14'),
    rankScore: 45,
    totalUpvotes: 65,
    totalDownvotes: 20,
  },
  {
    _id: 'user7',
    username: 'couponninja',
    email: 'ninja@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-16'),
    rankScore: 32,
    totalUpvotes: 45,
    totalDownvotes: 13,
  },
  {
    _id: 'user8',
    username: 'dealseeker',
    email: 'seeker@example.com',
    avatarUrl: undefined,
    joinDate: new Date('2024-01-18'),
    rankScore: 28,
    totalUpvotes: 38,
    totalDownvotes: 10,
  },
];

const getRankBadge = (position: number, rankScore: number) => {
  if (position === 1) return { 
    name: 'Champion', 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    icon: '👑',
    bgGradient: 'from-yellow-400 to-yellow-600'
  };
  if (position === 2) return { 
    name: 'Runner-up', 
    color: 'text-gray-600 bg-gray-50 border-gray-200', 
    icon: '🥈',
    bgGradient: 'from-gray-400 to-gray-600'
  };
  if (position === 3) return { 
    name: 'Third Place', 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    icon: '🥉',
    bgGradient: 'from-orange-400 to-orange-600'
  };
  if (rankScore >= 200) return { 
    name: 'Gold', 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    icon: '🏆',
    bgGradient: 'from-yellow-400 to-yellow-500'
  };
  if (rankScore >= 100) return { 
    name: 'Silver', 
    color: 'text-gray-600 bg-gray-50 border-gray-200', 
    icon: '🥈',
    bgGradient: 'from-gray-400 to-gray-500'
  };
  if (rankScore >= 50) return { 
    name: 'Bronze', 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    icon: '🥉',
    bgGradient: 'from-orange-400 to-orange-500'
  };
  return { 
    name: 'Rookie', 
    color: 'text-blue-600 bg-blue-50 border-blue-200', 
    icon: '⭐',
    bgGradient: 'from-blue-400 to-blue-500'
  };
};

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1: return <Trophy className="w-6 h-6 text-yellow-600" />;
    case 2: return <Medal className="w-6 h-6 text-gray-600" />;
    case 3: return <Award className="w-6 h-6 text-orange-600" />;
    default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
  }
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sort by rank score (already sorted in mock data)
        const sortedUsers = [...mockLeaderboard].sort((a, b) => b.rankScore - a.rankScore);
        setLeaderboard(sortedUsers);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Leaderboard</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Top contributors ranked by their impact on the community. 
            Rank Score = (Worked Votes × 2) - Didn't Work Votes
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {leaderboard.slice(0, 3).map((user, index) => {
              const position = index + 1;
              const badge = getRankBadge(position, user.rankScore);
              const successRate = user.totalUpvotes + user.totalDownvotes > 0 
                ? Math.round((user.totalUpvotes / (user.totalUpvotes + user.totalDownvotes)) * 100)
                : 0;

              return (
                <div 
                  key={user._id} 
                  className={`bg-white rounded-xl shadow-lg p-6 text-center relative overflow-hidden ${
                    position === 1 ? 'md:order-2 transform md:scale-110' : 
                    position === 2 ? 'md:order-1' : 'md:order-3'
                  }`}
                >
                  {/* Background decoration */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.bgGradient} opacity-5`}></div>
                  
                  {/* Position indicator */}
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      {getPositionIcon(position)}
                    </div>

                    {/* Avatar - Now Clickable */}
                    <Link href={`/user/${user.username}`} className="block group">
                      <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${badge.bgGradient} rounded-full flex items-center justify-center transition-transform group-hover:scale-105 cursor-pointer`}>
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* User info */}
                    <Link href={`/user/${user.username}`} className="block group">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {user.username}
                      </h3>
                    </Link>
                    
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${badge.color}`}>
                      <span className="mr-1">{badge.icon}</span>
                      {badge.name}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-2xl font-bold text-gray-900">{user.rankScore}</div>
                      <div className="text-sm text-gray-600">Rank Score</div>
                      
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mt-3">
                        <div className="flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1 text-green-600" />
                          {user.totalUpvotes}
                        </div>
                        <div className="flex items-center">
                          <ThumbsDown className="w-3 h-3 mr-1 text-red-600" />
                          {user.totalDownvotes}
                        </div>
                        <div>{successRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Complete Rankings</h2>
            <p className="text-gray-600 mt-1">All community contributors</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {leaderboard.map((user, index) => {
              const position = index + 1;
              const badge = getRankBadge(position, user.rankScore);
              const successRate = user.totalUpvotes + user.totalDownvotes > 0 
                ? Math.round((user.totalUpvotes / (user.totalUpvotes + user.totalDownvotes)) * 100)
                : 0;

              return (
                <div 
                  key={user._id} 
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Position */}
                      <div className="w-8 flex justify-center">
                        {position <= 3 ? getPositionIcon(position) : (
                          <span className="text-lg font-bold text-gray-500">#{position}</span>
                        )}
                      </div>

                      {/* Avatar - Now Clickable */}
                      <Link href={`/user/${user.username}`} className="group">
                        <div className={`w-12 h-12 bg-gradient-to-br ${badge.bgGradient} rounded-full flex items-center justify-center transition-transform group-hover:scale-105 cursor-pointer`}>
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* User info */}
                      <div>
                        <div className="flex items-center space-x-3">
                          <Link href={`/user/${user.username}`} className="block group">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {user.username}
                            </h3>
                          </Link>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                            <span className="mr-1">{badge.icon}</span>
                            {badge.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {user.joinDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{user.rankScore}</div>
                        <div className="text-xs text-gray-500">Rank Score</div>
                      </div>
                      
                      <div className="hidden sm:flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-green-600">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {user.totalUpvotes}
                        </div>
                        <div className="flex items-center text-red-600">
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          {user.totalDownvotes}
                        </div>
                        <div className="text-gray-600">{successRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Rankings update in real-time based on community votes. 
            <Link href="/coupons/new" className="text-blue-600 hover:text-blue-800 ml-1">
              Submit a coupon
            </Link> to start climbing the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
} 