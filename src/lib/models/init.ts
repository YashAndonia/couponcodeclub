// Initialize all models to ensure they're registered with Mongoose
import { User } from './User';
import { Coupon } from './Coupon';
import { Vote } from './Vote';

// Export all models
export { User, Coupon, Vote };

console.log('Models initialized:', {
  AppUser: !!User,
  Coupon: !!Coupon,
  Vote: !!Vote
});
