# Analytics Setup Guide for CouponCodeClub

This guide covers how to set up and utilize PostHog and Vercel Analytics in your CouponCodeClub application.

## Overview

Your application now includes comprehensive analytics tracking using:
- **PostHog**: For detailed user behavior analytics, funnels, and session recordings
- **Vercel Analytics**: For performance monitoring and web vitals

## Environment Variables

Add these to your `.env.local` file:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Vercel Analytics (optional - auto-detected when deployed on Vercel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

## Setup Instructions

### 1. PostHog Setup

1. **Create a PostHog Account**:
   - Go to [app.posthog.com](https://app.posthog.com)
   - Sign up for a free account
   - Create a new project for CouponCodeClub

2. **Get Your API Key**:
   - In your PostHog project, go to Settings → Project API Keys
   - Copy the "Project API Key"
   - Add it to your `.env.local` as `NEXT_PUBLIC_POSTHOG_KEY`

3. **Configure PostHog**:
   - Enable session recordings in Settings → Recordings
   - Set up funnels for key user journeys
   - Configure feature flags if needed

### 2. Vercel Analytics Setup

1. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Deploy your application
   - Vercel Analytics will be automatically enabled

2. **View Analytics**:
   - Go to your Vercel dashboard
   - Click on your project
   - Navigate to the "Analytics" tab

## Features Implemented

### Automatic Tracking

The following events are automatically tracked:

#### User Authentication
- `user_signed_in` - When users sign in
- `user_signed_out` - When users sign out
- `user_signed_up` - When new users register

#### Coupon Interactions
- `coupon_viewed` - When users view coupon details
- `coupon_copied` - When users copy coupon codes
- `coupon_voted` - When users upvote/downvote coupons
- `coupon_submitted` - When users submit new coupons

#### Navigation & Search
- `search_performed` - When users search for coupons
- `brand_page_viewed` - When users visit brand pages
- `user_profile_viewed` - When users view profiles
- `leaderboard_viewed` - When users view the leaderboard

#### Engagement
- `sort_changed` - When users change sorting options
- `filter_applied` - When users apply filters
- `leaderboard_period_changed` - When users change leaderboard time periods

#### Performance & Errors
- `page_load_time` - Page load performance metrics
- `error_occurred` - Error tracking
- `api_error` - API error tracking

### User Identification

Users are automatically identified in PostHog when they sign in with the following properties:
- Email address
- Username
- Rank score
- Total upvotes/downvotes
- User type (new_user, active_user, power_user)
- Signup date

## Usage Examples

### Using the Analytics Hook

```tsx
import { useAnalytics } from '@/lib/hooks/useAnalytics';

function MyComponent() {
  const {
    trackCouponView,
    trackCouponCopy,
    trackVote,
    trackSearchQuery,
    trackCustomEvent,
    isAuthenticated,
    user
  } = useAnalytics();

  const handleCouponClick = (coupon) => {
    trackCouponView(coupon, 'homepage');
  };

  const handleCopyCode = (coupon) => {
    trackCouponCopy(coupon, 'coupon_card');
  };

  const handleVote = (coupon, voteType) => {
    trackVote(coupon, voteType, 'coupon_feed');
  };

  const handleSearch = (query) => {
    trackSearchQuery(query, resultsCount);
  };

  return (
    // Your component JSX
  );
}
```

### Direct Event Tracking

```tsx
import { captureEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

// Track a custom event
captureEvent('custom_action', {
  action: 'button_clicked',
  button_name: 'submit_coupon',
  page: 'coupon_form'
});

// Track with user context
captureEvent(ANALYTICS_EVENTS.COUPON_SUBMITTED, {
  brand: 'Amazon',
  discount: '20%',
  category: 'electronics'
});
```

### Error Tracking

```tsx
import { trackError } from '@/lib/analytics';

try {
  // Your code
} catch (error) {
  trackError(error, 'coupon_submission');
}
```

## Analytics Dashboard

Access your analytics dashboard at `/analytics` to view:
- Key metrics (users, coupons, votes)
- Top performing brands
- Recent user activity
- Quick links to PostHog and Vercel dashboards

## PostHog Insights

### Key Metrics to Monitor

1. **User Engagement**:
   - Daily/Monthly Active Users
   - Session duration
   - Pages per session

2. **Coupon Performance**:
   - Most viewed coupons
   - Most copied coupons
   - Highest voted coupons

3. **User Journey**:
   - Signup to first coupon submission
   - Search to coupon copy
   - Landing page to engagement

### Creating Funnels

1. **User Onboarding Funnel**:
   - Page view (homepage)
   - Sign up
   - First coupon view
   - First coupon copy

2. **Coupon Submission Funnel**:
   - Click "Submit Coupon"
   - Fill form
   - Submit form
   - Success confirmation

### Session Recordings

Enable session recordings to:
- Watch how users interact with your site
- Identify UX issues
- Understand user behavior patterns
- Debug conversion problems

## Vercel Analytics Insights

### Performance Metrics

Monitor these key metrics:
- **Core Web Vitals**: LCP, FID, CLS
- **Page load times**
- **API response times**
- **Error rates**

### Geographic Data

- User locations
- Performance by region
- CDN performance

## Best Practices

### 1. Privacy Compliance

- Ensure your privacy policy covers analytics tracking
- Consider GDPR compliance for EU users
- Implement opt-out mechanisms if required

### 2. Data Quality

- Use consistent event naming
- Include relevant properties with events
- Avoid tracking sensitive information

### 3. Performance

- Analytics tracking is non-blocking
- Events are batched for efficiency
- Minimal impact on page load times

### 4. Testing

- Test analytics in development mode
- Verify events are firing correctly
- Check PostHog dashboard for data accuracy

## Troubleshooting

### Common Issues

1. **Events not appearing in PostHog**:
   - Check API key is correct
   - Verify environment variables are set
   - Check browser console for errors

2. **User identification not working**:
   - Ensure user is signed in
   - Check session data is available
   - Verify PostHog initialization

3. **Performance issues**:
   - Analytics should not impact performance
   - Check for infinite loops in tracking
   - Verify event batching is working

### Debug Mode

Enable debug mode in development:
```typescript
// Already configured in analytics.ts
if (process.env.NODE_ENV === 'development') posthog.debug();
```

## Advanced Features

### Custom Properties

Add custom properties to users:
```tsx
import { setUserProperties } from '@/lib/analytics';

setUserProperties({
  subscription_tier: 'premium',
  favorite_brands: ['Amazon', 'Walmart'],
  referral_source: 'google_ads'
});
```

### Feature Flags

Use PostHog feature flags for A/B testing:
```tsx
import posthog from 'posthog-js';

const isNewFeatureEnabled = posthog.isFeatureEnabled('new_ui');
```

### Cohort Analysis

Create user cohorts in PostHog for:
- Power users (high engagement)
- New users (first 7 days)
- Inactive users (no activity in 30 days)

## Support

- **PostHog Documentation**: [posthog.com/docs](https://posthog.com/docs)
- **Vercel Analytics**: [vercel.com/analytics](https://vercel.com/analytics)
- **Next.js Analytics**: [nextjs.org/docs/advanced-features/measuring-performance](https://nextjs.org/docs/advanced-features/measuring-performance)
