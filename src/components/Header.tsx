'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Search, Menu, X, User, Plus } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const { data: session } = useSession();
  const { trackSearchQuery, trackCustomEvent } = useAnalytics();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);

  // Sync search value with prop
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      trackSearchQuery(searchValue.trim());
    }
    onSearch?.(searchValue);
  };

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Get current user's username for profile link
  const currentUsername = session?.user?.username || session?.user?.email?.split('@')[0] || 'profile';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CouponCodeClub</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores, products, and coupons..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/coupons" className="text-gray-600 hover:text-gray-900 transition-colors">
              Browse
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Leaderboard
            </Link>
            
            {session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/coupons/new" 
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Coupon</span>
                </Link>
                
                <div className="relative group">
                  {/* Clickable Avatar/Profile Button */}
                  <Link href={`/user/${currentUsername}`} className="group">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt={session.user.name || 'User'} 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <span className="hidden lg:block">{session.user?.name || session.user?.username}</span>
                    </button>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href={`/user/${currentUsername}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        View Profile
                      </Link>
                      <Link href="/coupons/new" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Add Coupon
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>


        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link href="/coupons" className="block text-gray-600 hover:text-gray-900">
                Browse Coupons
              </Link>
              <Link href="/leaderboard" className="block text-gray-600 hover:text-gray-900">
                Leaderboard
              </Link>
              
              {session ? (
                <>
                  <Link 
                    href="/coupons/new" 
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Coupon</span>
                  </Link>
                  <Link href={`/user/${currentUsername}`} className="block text-gray-600 hover:text-gray-900">
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 