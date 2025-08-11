# CouponCodeClub Backend

This document provides comprehensive documentation for the backend API and services of CouponCodeClub.com.

## 🏗️ Architecture Overview

The backend is built using Next.js 14 with the App Router, providing a full-stack solution with API routes, database integration, and authentication services.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js (Google OAuth + Email/Password)
- **Caching**: Upstash Redis
- **Search**: MongoDB Atlas Search
- **Rate Limiting**: Custom Redis-based rate limiting
- **Testing**: Jest with MongoDB Memory Server

## 📁 Project Structure

```
src/
├── app/api/           # API Routes
│   ├── auth/         # Authentication endpoints
│   ├── coupons/      # Coupon CRUD operations
│   ├── brands/       # Brand-related endpoints
│   ├── user/         # User profile endpoints
│   ├── leaderboard/  # Leaderboard data
│   └── search/       # Search functionality
├── lib/
│   ├── models/       # MongoDB/Mongoose models
│   ├── middleware/   # Custom middleware
│   ├── utils/        # Utility functions
│   ├── mongodb.ts    # Database connection
│   ├── redis.ts      # Redis client
│   └── auth.ts       # Authentication configuration
└── types/            # TypeScript type definitions
```

## 🗄️ Database Models

### User Model

```typescript
interface IUser {
  username: string;
  email: string;
  avatarUrl?: string;
  joinDate: Date;
  rankScore: number;
  totalUpvotes: number;
  totalDownvotes: number;
}
```

### Coupon Model

```typescript
interface ICoupon {
  brand: string;
  code: string;
  description: string;
  tags: string[];
  link?: string;
  expiresAt?: Date;
  submitterId: ObjectId;
  upvotes: number;
  downvotes: number;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vote Model

```typescript
interface IVote {
  couponId: ObjectId;
  userId?: ObjectId; // Optional for anonymous votes
  worked: boolean;
  createdAt: Date;
}
```

## 🔌 API Endpoints

### Authentication

#### `GET /api/auth/signin`

- **Description**: NextAuth.js sign-in page
- **Authentication**: Not required

#### `GET /api/auth/signout`

- **Description**: NextAuth.js sign-out endpoint
- **Authentication**: Not required

#### `GET /api/auth/session`

- **Description**: Get current session
- **Authentication**: Not required
- **Response**: Session object or null

### Coupons

#### `GET /api/coupons`

- **Description**: List coupons with filtering and pagination
- **Authentication**: Not required
- **Query Parameters**:
  - `sort`: `recent` | `popular` | `expiring` (default: `recent`)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `brand`: Filter by brand name
  - `submitter`: Filter by submitter username
- **Response**: Paginated list of coupons

#### `POST /api/coupons`

- **Description**: Create a new coupon
- **Authentication**: Required
- **Rate Limiting**: 5 requests per minute
- **Body**:
  ```json
  {
    "brand": "string",
    "code": "string",
    "description": "string",
    "tags": ["string"],
    "link": "string (optional)",
    "expiresAt": "ISO date string (optional)"
  }
  ```

#### `GET /api/coupons/[id]`

- **Description**: Get specific coupon details
- **Authentication**: Not required
- **Response**: Coupon object with populated submitter

#### `PUT /api/coupons/[id]`

- **Description**: Update coupon (owner only)
- **Authentication**: Required
- **Rate Limiting**: 10 requests per minute

#### `DELETE /api/coupons/[id]`

- **Description**: Delete coupon (owner only)
- **Authentication**: Required
- **Rate Limiting**: 5 requests per minute

#### `POST /api/coupons/[id]/vote`

- **Description**: Vote on a coupon
- **Authentication**: Not required (anonymous voting allowed)
- **Rate Limiting**: 10 votes per minute per IP
- **Body**:
  ```json
  {
    "worked": boolean
  }
  ```

### Brands

#### `GET /api/brands`

- **Description**: List all brands with coupon counts
- **Authentication**: Not required
- **Response**: Array of brands with statistics

#### `GET /api/brands/[brand]`

- **Description**: Get brand details and coupons
- **Authentication**: Not required
- **Query Parameters**: Same as `/api/coupons`
- **Response**: Brand info with paginated coupons

### Users

#### `GET /api/user/profile`

- **Description**: Get current user profile
- **Authentication**: Required
- **Response**: User profile with statistics

#### `GET /api/user/[username]`

- **Description**: Get public user profile
- **Authentication**: Not required
- **Response**: Public user info with contributions

### Leaderboard

#### `GET /api/leaderboard`

- **Description**: Get top contributors
- **Authentication**: Not required
- **Query Parameters**:
  - `limit`: Number of users (default: 50)
  - `period`: `all` | `month` | `week` (default: `all`)
- **Response**: Array of users ranked by score

### Search

#### `GET /api/search`

- **Description**: Search coupons and brands
- **Authentication**: Not required
- **Query Parameters**:
  - `q`: Search query
  - `type`: `coupons` | `brands` | `all` (default: `all`)
  - `limit`: Results limit (default: 20)
- **Response**: Search results with relevance scores

## 🔐 Authentication

### NextAuth.js Configuration

The application uses NextAuth.js with multiple providers:

- **Google OAuth**: Primary authentication method
- **Email/Password**: Fallback authentication
- **MongoDB Adapter**: Session and user storage

### Session Management

- Sessions are stored in MongoDB
- JWT tokens for API authentication
- Automatic session refresh
- Secure cookie handling

### Rate Limiting

Custom Redis-based rate limiting is implemented for:

- **Post Creation**: 5 requests per minute per user
- **Voting**: 10 votes per minute per IP
- **API Calls**: Varies by endpoint

## 🗄️ Database Configuration

### MongoDB Atlas Setup

1. **Connection**: Uses MongoDB Atlas with connection pooling
2. **Indexes**: Optimized indexes for common queries
3. **Search**: Atlas Search for full-text search capabilities
4. **Backup**: Automated daily backups

### Redis Configuration

- **Caching**: Session data and API responses
- **Rate Limiting**: Request tracking and limiting
- **Real-time Features**: Live vote counts and updates

## 🧪 Testing

### Test Setup

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Structure

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB Memory Server
- **Mocking**: HTTP requests and external services

### Test Coverage

- API endpoints: 90%+
- Database models: 85%+
- Utility functions: 80%+

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token

# External APIs
CLEARBIT_API_KEY=your-clearbit-api-key

# Analytics
POSTHOG_API_KEY=your-posthog-key
```

## 🚀 Deployment

### Vercel Deployment

1. **Build Process**: Automatic builds on git push
2. **Environment Variables**: Configured in Vercel dashboard
3. **Database**: MongoDB Atlas connection
4. **Caching**: Upstash Redis integration
5. **Monitoring**: Vercel Analytics and PostHog

### Production Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Rate limiting enabled
- [ ] Monitoring set up
- [ ] SSL certificates configured
- [ ] Custom domain configured

## 📊 Performance

### Optimization Strategies

1. **Database Indexing**: Strategic indexes for common queries
2. **Caching**: Redis caching for frequently accessed data
3. **Pagination**: Efficient pagination for large datasets
4. **Connection Pooling**: MongoDB connection optimization
5. **Rate Limiting**: Prevents abuse and improves performance

### Monitoring

- **Response Times**: API endpoint performance tracking
- **Error Rates**: Error monitoring and alerting
- **Database Performance**: Query optimization monitoring
- **User Analytics**: PostHog integration for user behavior

## 🔒 Security

### Security Measures

1. **Input Validation**: Server-side validation for all inputs
2. **Rate Limiting**: Prevents abuse and DDoS attacks
3. **Authentication**: Secure session management
4. **CORS**: Proper CORS configuration
5. **HTTPS**: SSL/TLS encryption
6. **SQL Injection Prevention**: Mongoose ODM protection

### Data Protection

- User data encryption
- Secure password hashing
- Session security
- API key protection

## 🐛 Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: 401
- `RATE_LIMIT_EXCEEDED`: 429
- `VALIDATION_ERROR`: 400
- `NOT_FOUND`: 404
- `INTERNAL_SERVER_ERROR`: 500

## 📈 API Versioning

Currently using unversioned API endpoints. Future versions will use `/api/v2/` prefix for breaking changes.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Follow security best practices

## 📞 Support

For backend-specific issues or questions:

1. Check the API documentation
2. Review error logs
3. Test with Postman/curl
4. Contact the development team

---

For frontend documentation, see the main [README.md](README.md).
