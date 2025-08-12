'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'Your email is already associated with another account. Please sign in with the original provider.';
      case 'OAuthCallback':
        return 'Error during OAuth callback. Please try again.';
      case 'OAuthSignin':
        return 'Error during OAuth sign in. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create account. Please try again.';
      case 'Callback':
        return 'Error in callback handler. Please try again.';
      case 'OAuthProviderError':
        return 'OAuth provider error. Please try again.';
      default:
        return 'An unexpected error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">CouponCodeClub</h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {getErrorMessage(error)}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 