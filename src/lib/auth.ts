import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb-adapter';
import { NextAuthOptions } from 'next-auth';
import dbConnect from './mongodb';

import { User } from './models/User';

// Helper function to generate username from email
function generateUsername(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'couponcodeclub',
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verificationtokens',
    },
  }),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Generate username from email for JWT
        if (user.email && !token.username) {
          token.username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Fetch full user data including our custom fields
        try {
          await dbConnect();
          const user = await User.findById(token.sub);
          if (user) {
            session.user.id = user._id.toString();
            session.user.username = user.username;
            session.user.rankScore = user.rankScore;
            session.user.totalUpvotes = user.totalUpvotes;
            session.user.totalDownvotes = user.totalDownvotes;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // This runs after NextAuth successfully creates the user
      if (user.email) {
        try {
          await dbConnect();
          
          // Generate username from email
          let username = generateUsername(user.email);
          
          // Ensure username is unique
          let counter = 1;
          let finalUsername = username;
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}${counter}`;
            counter++;
          }
          
          // Update the user with our custom fields
          await User.findByIdAndUpdate(user.id, {
            username: finalUsername,
            rankScore: 0,
            totalUpvotes: 0,
            totalDownvotes: 0,
          });
          
          console.log(`Updated user with custom fields: ${finalUsername}`);
        } catch (error) {
          console.error('Error updating user with custom fields:', error);
        }
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}; 