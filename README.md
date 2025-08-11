# CouponCodeClub.com

A community-driven coupon-sharing platform where users can discover, share, and validate coupon codes from top retailers.

## 🚀 Features

- **Browse & Share Coupons**: Discover and share the best coupon codes with the community
- **Voting System**: Rate coupons as "Worked" or "Didn't Work" to help others
- **User Rankings**: Leaderboard system with badges for top contributors
- **Search & Filter**: Find coupons by brand, description, or tags
- **Brand Pages**: Dedicated pages for each brand with auto-fetched logos
- **User Profiles**: Track your contributions and see your ranking
- **Real-time Updates**: Freshness indicators and live vote counts
- **Mobile Responsive**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB Atlas with Atlas Search
- **Authentication**: NextAuth.js (Google OAuth + Email/Password)
- **Caching & Rate Limiting**: Upstash Redis
- **Hosting**: Vercel
- **External APIs**: Clearbit Logo API (brand logos)
- **Analytics**: PostHog / Vercel Analytics

## 📚 Documentation

- **[Backend Documentation](BACKEND.md)** - Complete API documentation, database schema, and backend architecture
- **Frontend Documentation** - This README focuses on user-facing features and frontend development

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/couponcodeclub.git
cd couponcodeclub
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
CLEARBIT_API_KEY=your_clearbit_api_key
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
couponcodeclub/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── api/       # API routes (see BACKEND.md)
│   │   ├── coupons/   # Coupon-related pages
│   │   ├── user/      # User profile pages
│   │   └── leaderboard/ # Leaderboard page
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utility functions and configurations
│   ├── models/       # MongoDB/Mongoose models
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
├── BACKEND.md        # Backend documentation
└── package.json      # Dependencies and scripts
```

## 🎯 Core Features

### Landing Page

- Latest and most popular coupons
- Search functionality
- Sort options (Most Recent, Highest Rated, Expiring Soon)
- Vote counts and freshness indicators

### Coupon Management

- Submit new coupons (authenticated users)
- Copy coupon codes with one click
- "Worked for me" prompt after copying
- Manage your submitted coupons

### Voting System

- Two-button voting: "Worked" / "Didn't Work"
- Success rate calculation
- Auto-hide low-performing coupons
- Freshness tracking

### User System

- Google OAuth and email/password authentication
- User profiles with contribution history
- Ranking system with badges (Bronze, Silver, Gold)
- Leaderboard showcasing top contributors

### Brand Pages

- Dedicated pages for each brand
- Auto-fetched brand logos
- All active coupons for the brand
- Filtering and sorting options

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🔒 Security Features

- Rate limiting on posts and votes
- Server-side validation
- Input sanitization
- Duplicate vote prevention
- Authentication required for posting

## 🚀 Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy to production
5. Connect custom domain (couponcodeclub.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Check both frontend and backend documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Yash Naik**

---

⭐ Star this repository if you find it helpful!

**📖 For detailed backend documentation, see [BACKEND.md](BACKEND.md)**
