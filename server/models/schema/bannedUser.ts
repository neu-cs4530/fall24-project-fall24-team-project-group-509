import { Schema } from 'mongoose';

/**
 * Mongoose schema for the BannedUser collection.
 *
 * This schema defines the structure for storing banned users in the database.
 * Each banned user includes the following fields:
 * - username: The username of the banned user.
 * - moderatorComment: Comments added by the moderator.
 */
const bannedUserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    moderatorComment: {
      type: String,
    },
  },
  { collection: 'BannedUser' },
);

export default bannedUserSchema;
