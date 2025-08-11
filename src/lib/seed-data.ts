import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import dbConnect from './mongodb';
import { Coupon } from './models/Coupon';
import { User } from './models/User';

const sampleUsers = [
  {
    username: 'sportslover',
    email: 'sports@example.com',
    rankScore: 245,
    totalUpvotes: 150,
    totalDownvotes: 5,
  },
  {
    username: 'dealfinder',
    email: 'deals@example.com',
    rankScore: 156,
    totalUpvotes: 90,
    totalDownvotes: 12,
  },
  {
    username: 'couponpro',
    email: 'pro@example.com',
    rankScore: 98,
    totalUpvotes: 65,
    totalDownvotes: 8,
  },
];

const sampleCoupons = [
  {
    brand: 'Nike',
    code: 'SAVE20',
    description: '20% off all athletic wear',
    tags: ['sports', 'clothing', 'athletic'],
    upvotes: 45,
    downvotes: 5,
    lastVerifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    brand: 'Amazon',
    code: 'PRIME10',
    description: '10% off for Prime members',
    tags: ['electronics', 'prime', 'amazon'],
    upvotes: 120,
    downvotes: 15,
    lastVerifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    brand: 'Target',
    code: 'WEEKLY25',
    description: '25% off home goods',
    tags: ['home', 'decor', 'furniture'],
    upvotes: 80,
    downvotes: 12,
    lastVerifiedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    brand: 'Best Buy',
    code: 'TECH15',
    description: '15% off electronics',
    tags: ['electronics', 'tech', 'gadgets'],
    upvotes: 65,
    downvotes: 8,
    lastVerifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    brand: 'Starbucks',
    code: 'COFFEE20',
    description: '20% off your next order',
    tags: ['food', 'coffee', 'drinks'],
    upvotes: 95,
    downvotes: 10,
    lastVerifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
];

export async function seedData() {
  try {
    await dbConnect();
    
    console.log('Seeding database with initial data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Coupon.deleteMany({});
    
    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create coupons with random submitters
    const couponsWithSubmitters = sampleCoupons.map((coupon, index) => ({
      ...coupon,
      submitterId: createdUsers[index % createdUsers.length]._id,
    }));
    
    const createdCoupons = await Coupon.insertMany(couponsWithSubmitters);
    console.log(`Created ${createdCoupons.length} coupons`);
    
    console.log('Database seeded successfully!');
    
    return {
      users: createdUsers.length,
      coupons: createdCoupons.length,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// CLI usage: npm run seed
if (require.main === module) {
  seedData()
    .then((result) => {
      console.log('Seeding completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 