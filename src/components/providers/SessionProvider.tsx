'use client';

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { identifyUserWithSession, resetUser, ANALYTICS_EVENTS, captureEvent } from '@/lib/analytics';

interface SessionProviderProps {
  children: ReactNode;
}

// Component to handle session-based analytics
function SessionAnalytics() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // User is signed in - identify them in PostHog
      identifyUserWithSession(session.user);
      captureEvent(ANALYTICS_EVENTS.USER_SIGNED_IN, {
        userId: session.user.id,
        username: session.user.username,
        email: session.user.email,
        timestamp: new Date().toISOString(),
      });
    } else {
      // User is signed out - reset PostHog user
      resetUser();
      captureEvent(ANALYTICS_EVENTS.USER_SIGNED_OUT, {
        timestamp: new Date().toISOString(),
      });
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionAnalytics />
      {children}
    </NextAuthSessionProvider>
  );
} 