import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb-adapter';
import { NextAuthOptions } from 'next-auth';
import dbConnect from './mongodb';

// Initialize models to ensure they're registered
import { User } from './models/init';

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
  adapter: MongoDBAdapter(clientPromise),
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
        session.user.id = token.id as string;
        session.user.username = token.username as string;
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
          
          // Check if user already exists in our AppUser collection
          const existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            console.log(`User already exists in AppUser collection: ${existingUser.username}`);
            return;
          }
          
          // Generate username from email
          let username = generateUsername(user.email);
          
          // Ensure username is unique in our collection
          let counter = 1;
          let finalUsername = username;
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}${counter}`;
            counter++;
          }
          
          // Create user in our AppUser collection
          await User.create({
            username: finalUsername,
            email: user.email,
            name: user.name || 'User',
            image: user.image,
            rankScore: 0,
            totalUpvotes: 0,
            totalDownvotes: 0,
          });
          
          console.log(`Created user in AppUser collection: ${finalUsername}`);
        } catch (error) {
          console.error('Error creating user in AppUser collection:', error);
        }
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}; 