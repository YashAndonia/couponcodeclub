import posthog from 'posthog-js';
import { Analytics } from '@vercel/analytics/react';

// PostHog configuration
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    capture_pageview: false,
  });
}

// PostHog utility functions
export const captureEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.set(properties);
  }
};

// Vercel Analytics component
export { Analytics };

// Analytics events for CouponCodeClub
export const ANALYTICS_EVENTS = {
  COUPON_VIEWED: 'coupon_viewed',
  COUPON_COPIED: 'coupon_copied',
  COUPON_VOTED: 'coupon_voted',
  COUPON_SUBMITTED: 'coupon_submitted',
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  SEARCH_PERFORMED: 'search_performed',
  BRAND_PAGE_VIEWED: 'brand_page_viewed',
} as const; 