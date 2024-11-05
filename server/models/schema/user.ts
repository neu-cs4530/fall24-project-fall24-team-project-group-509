import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each user includes the following fields:
 * - `username`: The user's username. This is a required field and must be unique.
 * - `bio`: A short description of the user.
 * - `profilePictureURL`: The URL of the user's profile picture.
 * - `activityHistory`: A record of posts and answers made by the user.
 * - `createdAt`: The timestamp of when the user profile was created.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
    },
    profilePictureURL: {
      type: String,
      required: false,
    },
    activityHistory: [
      {
        postId: { type: Schema.Types.ObjectId, refPath: 'activityHistory.postType' },
        postType: { type: String, enum: ['Question', 'Answer', 'Comment'], required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: 'User', timestamps: true },
);

// Adding a full-text index to `username` and `bio` to support searching users.
userSchema.index({ username: 'text', bio: 'text' });

export default userSchema;
