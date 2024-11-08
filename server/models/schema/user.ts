import { Schema } from 'mongoose';
/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each user includes the following fields:
 * - `username`: The user's username. This is a required field and must be unique.
 * - 'bio': A short description of the user.
 * - 'profilePictureURL': The URL of the user's profile picture.
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
      required: false,
    },
    profilePictureURL: {
      type: String,
      required: false,
    },
  },
  { collection: 'User' },
);
// Adding a full-text index to username and bio to support searching users.
userSchema.index({ username: 'text', bio: 'text' });
export default userSchema;
