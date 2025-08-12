import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  captureEvent,
  trackCouponViewed,
  trackCouponCopied,
  trackCouponVoted,
  trackSearch,
  trackError,
  ANALYTICS_EVENTS,
} from '@/lib/analytics';

export const useAnalytics = () => {
  const { data: session } = useSession();

  const trackCouponView = useCallback((coupon: any, source?: string) => {
    trackCouponViewed(coupon, source);
  }, []);

  const trackCouponCopy = useCallback((coupon: any, source?: string) => {
    trackCouponCopied(coupon, source);
  }, []);

  const trackVote = useCallback((coupon: any, voteType: 'upvote' | 'downvote', source?: string) => {
    trackCouponVoted(coupon, voteType, source);
  }, []);

  const trackSearchQuery = useCallback((query: string, resultsCount?: number) => {
    trackSearch(query, resultsCount);
  }, []);

  const trackCustomEvent = useCallback((event: string, properties?: Record<string, any>) => {
    const enhancedProperties = {
      ...properties,
      userId: session?.user?.id,
      username: session?.user?.username,
      isAuthenticated: !!session?.user,
      timestamp: new Date().toISOString(),
    };
    captureEvent(event, enhancedProperties);
  }, [session]);

  const trackErrorEvent = useCallback((error: Error, context?: string) => {
    trackError(error, context);
  }, []);

  const trackSortChange = useCallback((sort: string) => {
    trackCustomEvent(ANALYTICS_EVENTS.SORT_CHANGED, { sort });
  }, [trackCustomEvent]);

  const trackFilterApplied = useCallback((filter: string, value: any) => {
    trackCustomEvent(ANALYTICS_EVENTS.FILTER_APPLIED, { filter, value });
  }, [trackCustomEvent]);

  const trackLeaderboardPeriodChange = useCallback((period: string) => {
    trackCustomEvent(ANALYTICS_EVENTS.LEADERBOARD_PERIOD_CHANGED, { period });
  }, [trackCustomEvent]);

  const trackBrandPageView = useCallback((brand: string) => {
    trackCustomEvent(ANALYTICS_EVENTS.BRAND_PAGE_VIEWED, { brand });
  }, [trackCustomEvent]);

  const trackUserProfileView = useCallback((username: string) => {
    trackCustomEvent(ANALYTICS_EVENTS.USER_PROFILE_VIEWED, { username });
  }, [trackCustomEvent]);

  const trackLeaderboardView = useCallback(() => {
    trackCustomEvent(ANALYTICS_EVENTS.LEADERBOARD_VIEWED);
  }, [trackCustomEvent]);

  return {
    trackCouponView,
    trackCouponCopy,
    trackVote,
    trackSearchQuery,
    trackCustomEvent,
    trackErrorEvent,
    trackSortChange,
    trackFilterApplied,
    trackLeaderboardPeriodChange,
    trackBrandPageView,
    trackUserProfileView,
    trackLeaderboardView,
    isAuthenticated: !!session?.user,
    user: session?.user,
  };
};
