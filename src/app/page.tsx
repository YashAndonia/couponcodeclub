import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CouponCodeClub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A community-driven platform for discovering and sharing the best coupon codes
          </p>
          <div className="space-x-4">
            <Link href="/coupons" className="btn-primary">
              Browse Coupons
            </Link>
            <Link href="/auth/signin" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Discover Deals</h3>
            <p className="text-gray-600">
              Find the latest and most popular coupon codes from top retailers
            </p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Share & Earn</h3>
            <p className="text-gray-600">
              Share your finds and earn recognition on our leaderboard
            </p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Community Verified</h3>
            <p className="text-gray-600">
              All codes are verified by our community with voting system
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 