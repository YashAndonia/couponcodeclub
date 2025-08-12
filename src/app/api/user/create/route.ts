import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { sendSuccessResponse, sendErrorResponse, handleApiError, HTTP_STATUS } from '@/lib/utils/appApi';

// Helper function to generate username from email
function generateUsername(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

// POST /api/user/create - Create user in our collection after OAuth
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return sendErrorResponse('Not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    await dbConnect();
    
    // Check if user already exists in our User collection
    const existingUser = await User.findOne({ email: session.user.email });
    
    if (existingUser) {
      return sendSuccessResponse({ user: existingUser, message: 'User already exists' });
    }

    // Generate username from email
    let username = generateUsername(session.user.email);
    
    // Ensure username is unique
    let counter = 1;
    let finalUsername = username;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${username}${counter}`;
      counter++;
    }
    
    // Create user in our User collection
    const newUser = await User.create({
      username: finalUsername,
      email: session.user.email,
      name: session.user.name || 'User',
      image: session.user.image,
      rankScore: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
    });
    
    return sendSuccessResponse({ 
      user: newUser, 
      message: 'User created successfully',
      username: finalUsername 
    });

  } catch (error) {
    const apiError = handleApiError(error);
    return sendErrorResponse(apiError, apiError.statusCode);
  }
} 