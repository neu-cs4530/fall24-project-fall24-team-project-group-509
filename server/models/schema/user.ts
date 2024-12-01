import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each user includes the following fields:
 * - `username`: The user's username. This is a required field and must be unique.
 * - `bio`: A short description of the user.
 * - `password`: The user's password. This is a required field
 * - `profilePictureURL`: The URL of the user's profile picture.
 * - `activityHistory`: An array of the user's activities.
 * - `bookmarkCollections`: An array of bookmark collections owned by the user.
 * - `followedBookmarkCollections`: An array of bookmark collections the user is following.
 * - `isBanned`: A boolean indicating whether the user is banned.
 * - `isShadowBanned`: A boolean indicating whether the user is shadow banned.
 * - `followUpdateNotifications`: An array of notifications for updates to followed bookmark collections.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      default: '',
    },
    bio: {
      type: String,
      required: false,
      default: '',
    },
    profilePictureURL: {
      type: String,
      required: false,
      default: 'https://storage.googleapis.com/cs4530-509-userprofile-pictures/Dog-cloud.jpg',
    },
    activityHistory: {
      type: [
        {
          postId: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          postType: { type: String, required: true, enum: ['Question', 'Answer', 'Comment'] },
          qTitle: { type: String, required: true },
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
    sharedBookmarkCollections: {
      type: [{ type: Schema.Types.ObjectId, ref: 'BookmarkCollection' }],
      default: [],
    },
    followUpdateNotifications: {
      type: [
        {
          qTitle: { type: String, required: true },
          collectionId: { type: String, required: true },
          bookmarkCollectionTitle: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isShadowBanned: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'User' },
);

// Adding a full-text index to username and bio to support searching users.
userSchema.index({ username: 'text', bio: 'text' });

export default userSchema;
