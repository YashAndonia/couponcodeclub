# CouponCodeClub 🎫

A modern, community-driven coupon-sharing platform where users can discover, share, and validate coupon codes with a gamified ranking system.

## 🚀 Live Demo

Visit the live application at: `http://localhost:3000` (development)

## ✨ Features

### 🏠 **Core Platform**

- **🎯 Landing Page**: Modern, responsive design with community stats
- **🔍 Search & Sort**: Real-time search with sorting by recent/popular/expiring
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🎨 Brand Logos**: Smart logo system with Clearbit API integration + branded fallbacks

### 🗳️ **Community Features**

- **👍 Voting System**: "Worked" / "Didn't Work" voting with success rates
- **💬 "Worked for Me" Modal**: Post-copy prompts for user feedback
- **🏆 Leaderboard**: Beautiful podium design with user rankings
- **🎖️ Rank Badges**: Rookie → Bronze → Silver → Gold → Champion system
- **👤 User Profiles**: Complete profile pages with stats and submitted coupons

### 🏪 **Brand & Coupon Management**

- **🏢 Brand Pages**: Dedicated pages with stats, logos, and all brand coupons
- **➕ Add Coupons**: Full form with validation for logged-in users
- **🏷️ Tags System**: Categorized coupons with visual tag displays
- **📅 Expiration Tracking**: Visual indicators for expiring coupons

### 🔐 **User Experience**

- **🔑 Authentication**: Google OAuth integration ready
- **📊 Analytics**: User interaction tracking throughout
- **🎯 Navigation**: Clickable user profiles and intuitive routing
- **⚡ Performance**: Optimized loading states and smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router) + TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js (Google OAuth)
- **Icons**: Lucide React
- **Brand Logos**: Clearbit Logo API + custom fallbacks
- **Analytics**: Custom event tracking system

## 📊 Current Status

**MVP Progress: 95% Complete** ✅

### ✅ Completed Features

- [x] Landing page with modern UI
- [x] Search and sorting functionality
- [x] Voting system with success rates
- [x] "Worked for Me" modal prompts
- [x] Add coupon form with validation
- [x] Brand pages with logos and stats
- [x] User profile pages with rankings
- [x] Leaderboard with podium design
- [x] Enhanced coupon cards with brand logos
- [x] Mobile-responsive design
- [x] Analytics tracking
- [x] Clickable navigation throughout

### 🔄 Using Mock Data

Currently all features work with comprehensive mock data. Ready for backend integration.

## 🏃‍♂️ Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env.local
   # Add your Google OAuth credentials
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎯 Key Pages to Explore

- **🏠 Homepage**: `/` - Main coupon feed with search
- **🏆 Leaderboard**: `/leaderboard` - Community rankings
- **👤 User Profiles**: `/user/sportslover` - User stats and coupons
- **🏢 Brand Pages**: `/brand/nike` - Brand-specific coupons
- **➕ Add Coupon**: `/coupons/new` - Submit new coupons (auth required)

## 🎨 Design Highlights

- **Modern UI**: Clean, professional design with consistent spacing
- **Brand Integration**: Real logos with smart fallbacks using brand colors
- **Gamification**: Ranking system with badges and leaderboard
- **User-Centric**: Intuitive navigation and clear feedback
- **Mobile-First**: Responsive design for all screen sizes

## 🔮 What's Next

### Phase 1: Backend Integration

- Replace mock data with real APIs
- Set up user authentication flow
- Implement persistent voting system
- Add user dashboard

### Phase 2: Enhanced Features

- Forum integration (Reddit)
- Advanced filtering and categories
- Notification system
- Coupon expiration alerts

### Phase 3: Production Ready

- SEO optimization
- Performance tuning
- Error handling
- Testing suite
- Deployment setup

## 🤝 Contributing

This is an MVP in active development. The codebase is clean, well-organized, and ready for backend integration.

## 📝 Architecture

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
├── lib/                   # Utilities (analytics, brand logos)
├── types/                 # TypeScript type definitions
└── ...
```

## 🎯 Business Model (Future)

- **Free Community Platform**: Core features remain free
- **Premium Features**: Advanced analytics, early access
- **Brand Partnerships**: Verified brand partnerships
- **Commission**: Optional affiliate links

---

**Built with ❤️ for the coupon community** 🎫
