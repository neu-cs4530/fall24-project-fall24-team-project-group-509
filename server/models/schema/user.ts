import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each user includes the following fields:
 * - `username`: The user's username. This is a required field and must be unique.
 * - `bio`: A short description of the user.
 * - `profilePictureURL`: The URL of the user's profile picture.
 * - `activityHistory`: An array of the user's activities.
 * - `bookmarkCollections`: An array of bookmark collections owned by the user.
 * - `followedBookmarkCollections`: An array of bookmark collections the user is following.
 * - `role`: The role of the user ('user' or 'moderator').
 * - `isBanned`: A boolean indicating whether the user is banned.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    profilePictureURL: {
      type: String,
      default: '',
    },
    activityHistory: {
      type: [
        {
          postId: {
            type: Schema.Types.ObjectId,
            required: true,
            // refPath: 'activityHistory.postType',
          },
          postType: { type: String, required: true, enum: ['Question', 'Answer', 'Comment'] },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    bookmarkCollections: {
      type: [{ type: Schema.Types.ObjectId, ref: 'BookmarkCollection' }],
      default: [],
    },
    followedBookmarkCollections: {
      type: [{ type: Schema.Types.ObjectId, ref: 'BookmarkCollection' }],
      default: [],
    },
    role: {
      type: String,
      enum: ['user', 'moderator'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'User' },
);

// Adding a full-text index to username and bio to support searching users.
userSchema.index({ username: 'text', bio: 'text' });

export default userSchema;
