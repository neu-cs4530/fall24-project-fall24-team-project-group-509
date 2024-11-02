import { Schema } from 'mongoose';
/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each user includes the following fields:
 * - `username`: The user's username.
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
export default userSchema;
