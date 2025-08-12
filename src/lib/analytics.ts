import posthog from 'posthog-js';
import { Analytics } from '@vercel/analytics/react';

// PostHog configuration
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    capture_pageview: false, // We'll handle this manually for better control
    autocapture: true, // Automatically capture clicks, form submissions, etc.
    capture_pageleave: true, // Capture when users leave the page
    disable_session_recording: false, // Enable session recordings
    enable_recording_console_log: true, // Capture console logs in recordings
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
    posthog.people.set(properties);
  }
};

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

export const capturePageView = (url?: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      $current_url: url || window.location.href,
      ...properties,
    });
  }
};

// Enhanced user identification with session data
export const identifyUserWithSession = (user: any) => {
  if (typeof window !== 'undefined' && user) {
    const userProperties = {
      email: user.email,
      username: user.username,
      rankScore: user.rankScore || 0,
      totalUpvotes: user.totalUpvotes || 0,
      totalDownvotes: user.totalDownvotes || 0,
      userType: user.rankScore > 100 ? 'power_user' : user.rankScore > 50 ? 'active_user' : 'new_user',
      signupDate: user.createdAt || new Date().toISOString(),
    };

    identifyUser(user.id || user.email, userProperties);
    setUserProperties(userProperties);
  }
};

// Vercel Analytics component
export { Analytics };

// Analytics events for CouponCodeClub
export const ANALYTICS_EVENTS = {
  // User Actions
  COUPON_VIEWED: 'coupon_viewed',
  COUPON_COPIED: 'coupon_copied',
  COUPON_VOTED: 'coupon_voted',
  COUPON_SUBMITTED: 'coupon_submitted',
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  
  // Navigation & Search
  SEARCH_PERFORMED: 'search_performed',
  BRAND_PAGE_VIEWED: 'brand_page_viewed',
  USER_PROFILE_VIEWED: 'user_profile_viewed',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',
  
  // Engagement
  SORT_CHANGED: 'sort_changed',
  FILTER_APPLIED: 'filter_applied',
  LEADERBOARD_PERIOD_CHANGED: 'leaderboard_period_changed',
  
  // Error Tracking
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  
  // Performance
  PAGE_LOAD_TIME: 'page_load_time',
  API_RESPONSE_TIME: 'api_response_time',
} as const;

// Enhanced event tracking with better properties
export const trackCouponViewed = (coupon: any, source?: string) => {
  captureEvent(ANALYTICS_EVENTS.COUPON_VIEWED, {
    couponId: coupon._id || coupon.id,
    brand: coupon.brand,
    code: coupon.code,
    discount: coupon.discount,
    source: source || 'unknown',
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

export const trackCouponCopied = (coupon: any, source?: string) => {
  captureEvent(ANALYTICS_EVENTS.COUPON_COPIED, {
    couponId: coupon._id || coupon.id,
    brand: coupon.brand,
    code: coupon.code,
    discount: coupon.discount,
    source: source || 'unknown',
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

export const trackCouponVoted = (coupon: any, voteType: 'upvote' | 'downvote', source?: string) => {
  captureEvent(ANALYTICS_EVENTS.COUPON_VOTED, {
    couponId: coupon._id || coupon.id,
    brand: coupon.brand,
    code: coupon.code,
    voteType,
    source: source || 'unknown',
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

export const trackSearch = (query: string, resultsCount?: number) => {
  captureEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
    query,
    resultsCount: resultsCount || 0,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

export const trackError = (error: Error, context?: string) => {
  captureEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    errorMessage: error.message,
    errorStack: error.stack,
    context: context || 'unknown',
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

// Performance tracking
export const trackPageLoadTime = (loadTime: number) => {
  captureEvent(ANALYTICS_EVENTS.PAGE_LOAD_TIME, {
    loadTime,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
};

// Initialize page view tracking
if (typeof window !== 'undefined') {
  // Track initial page view
  capturePageView();
  
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    trackPageLoadTime(loadTime);
  });
  
  // Track navigation changes (for SPA)
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      capturePageView();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
} 