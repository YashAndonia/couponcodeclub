import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ApiError, HTTP_STATUS } from '@/lib/utils/api';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const withAuth = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      throw new ApiError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Add user info to request
    req.user = {
      id: session.user.id as string,
      email: session.user.email,
      username: session.user.username as string
    };
    
    await next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
  }
};

export const withOptionalAuth = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (session?.user?.email) {
      req.user = {
        id: session.user.id as string,
        email: session.user.email,
        username: session.user.username as string
      };
    }
    
    await next();
  } catch (error) {
    // Continue without authentication for optional auth
    await next();
  }
};

export const requireAuth = (handler: Function) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    await withAuth(req, res, async () => {
      return handler(req, res);
    });
  };
};

export const optionalAuth = (handler: Function) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    await withOptionalAuth(req, res, async () => {
      return handler(req, res);
    });
  };
}; 