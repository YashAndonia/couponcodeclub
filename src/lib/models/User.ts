import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  name: string
  image?: string
  rankScore: number
  totalUpvotes: number
  totalDownvotes: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
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

export const User = mongoose.models.AppUser || mongoose.model<IUser>('AppUser', UserSchema) 