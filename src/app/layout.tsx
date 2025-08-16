import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { Analytics } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://couponcodeclub.com'),
  title: 'CouponCodeClub - Discover & Share the Best Coupon Codes',
  description: 'A community-driven platform where users can discover, share, and validate coupon codes from top retailers.',
  keywords: 'coupons, discount codes, deals, savings, community',
  authors: [{ name: 'Yash Naik' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'CouponCodeClub - Discover & Share the Best Coupon Codes',
    description: 'A community-driven platform where users can discover, share, and validate coupon codes from top retailers.',
    type: 'website',
    url: 'https://couponcodeclub.com',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CouponCodeClub - Discover & Share the Best Coupon Codes',
    description: 'A community-driven platform where users can discover, share, and validate coupon codes from top retailers.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
} 