import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      rankScore?: number;
      totalUpvotes?: number;
      totalDownvotes?: number;
    };
  }

  interface User {
    id: string;
    username?: string;
    rankScore?: number;
    totalUpvotes?: number;
    totalDownvotes?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
  }
} 