import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  // NextAuth fields
  email: string
  name: string
  image?: string
  emailVerified?: Date
  
  // Our custom fields
  username: string
  rankScore: number
  totalUpvotes: number
  totalDownvotes: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  // NextAuth fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  image: {
    type: String,
    trim: true
  },
  emailVerified: {
    type: Date
  },
  
  // Our custom fields
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  rankScore: {
    type: Number,
    default: 0,
    min: 0
  },
  totalUpvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDownvotes: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Only add compound index for leaderboard queries
UserSchema.index({ rankScore: -1, createdAt: -1 })

// Remove the duplicate email index - unique: true already creates it

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 