'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, TrendingUp, Crown, Medal, Award, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { User } from '@/types/coupon';
import { getLeaderboard } from '@/lib/api/client';
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

// Rank badge component
const RankBadge = ({ rank, score }: { rank: number; score: number }) => {
  const getBadgeConfig = (score: number) => {
    if (score >= 200) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Champion', tier: 'champion' };
    if (score >= 100) return { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', label: 'Gold', tier: 'gold' };
    if (score >= 50) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Silver', tier: 'silver' };
    if (score >= 20) return { icon: Award, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Bronze', tier: 'bronze' };
    return { icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Rookie', tier: 'rookie' };
  };

  const config = getBadgeConfig(score);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg} ${config.border} border`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

// Podium component for top 3
const Podium = ({ users }: { users: User[] }) => {
  const podiumOrder = [1, 0, 2]; // Second, First, Third for visual podium effect
  const podiumHeights = ['h-24', 'h-32', 'h-20'];
  const podiumColors = ['bg-gray-300', 'bg-yellow-400', 'bg-orange-400'];
  const positions = ['2nd', '1st', '3rd'];

  return (
    <div className="flex items-end justify-center space-x-4 mb-8">
      {podiumOrder.map((userIndex, podiumIndex) => {
        const user = users[userIndex];
        if (!user) return null;

        return (
          <div key={user._id} className="flex flex-col items-center">
            {/* User Avatar */}
            <Link
              href={`/user/${user.username}`}
              className="group mb-4 transform hover:scale-105 transition-transform"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {podiumIndex === 1 && (
                  <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div className="text-center mt-2">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user.username}
                </div>
                <div className="text-sm text-gray-600">
                  {user.rankScore} points
                </div>
              </div>
            </Link>

            {/* Podium */}
            <div className={`w-20 ${podiumHeights[podiumIndex]} ${podiumColors[podiumIndex]} rounded-t-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">
                {positions[podiumIndex]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');

  // Fetch leaderboard data
  const fetchLeaderboard = async (selectedPeriod?: 'all' | 'month' | 'week') => {
    try {
      setLoading(true);
      setError(null);
      
      const periodToUse = selectedPeriod || period;
      const response = await getLeaderboard({ 
        limit: 50, 
        period: periodToUse 
      });
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard on mount and when period changes
  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  // Handle period change
  const handlePeriodChange = (newPeriod: 'all' | 'month' | 'week') => {
    setPeriod(newPeriod);
    
    // Analytics
    captureEvent('leaderboard_period_changed', {
      period: newPeriod,
    });
  };

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <div className="flex justify-center space-x-8 mb-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Leaderboard
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchLeaderboard()}
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 Community Leaderboard
            </h1>
            <p className="text-xl text-gray-600">
              Recognizing our top coupon contributors
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 border border-gray-200">
              {(['all', 'month', 'week'] as const).map((periodOption) => (
                <button
                  key={periodOption}
                  onClick={() => handlePeriodChange(periodOption)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === periodOption
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {periodOption === 'all' ? 'All Time' : 
                   periodOption === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Trophy className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contributors yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share a coupon and claim the top spot!
              </p>
              <Link
                href="/coupons/new"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Coupon
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                    🥇 Top Contributors
                  </h2>
                  <Podium users={topThree} />
                </div>
              )}

              {/* Rest of the leaderboard */}
              {restOfUsers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Rankings #{topThree.length + 1} - #{users.length}
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {restOfUsers.map((user, index) => (
                      <Link
                        key={user._id}
                        href={`/user/${user.username}`}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div className="w-8 text-center">
                              <span className="text-lg font-bold text-gray-500">
                                #{topThree.length + index + 1}
                              </span>
                            </div>
                            
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* User Info */}
                            <div>
                              <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-600">
                                Joined {new Date(user.joinDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {/* Stats */}
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                {user.rankScore} points
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.totalUpvotes} upvotes, {user.totalDownvotes} downvotes
                              </div>
                            </div>
                            
                            {/* Rank Badge */}
                            <RankBadge rank={topThree.length + index + 1} score={user.rankScore} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 mt-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Want to Join the Rankings?</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Share valuable coupon codes with the community and earn points for each successful use. 
                  The more people save with your codes, the higher you'll climb!
                </p>
                <Link
                  href="/coupons/new"
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Start Contributing
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 