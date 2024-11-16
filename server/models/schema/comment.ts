import { Schema } from 'mongoose';
import flagSchema from './flag';

/**
 * Mongoose schema for the Comment collection.
 *
 * This schema defines the structure of comments used in questions and answers in the database.
 * Each comment includes the following fields:
 * - `text`: The content of the comment.
 * - `commentBy`: The username of the user who commented.
 * - `commentDateTime`: The date and time when the comment was posted.
 * - `flags`: An array of flags associated with the comment.
 * - `isRemoved`: A boolean indicating whether the comment has been removed by a moderator.
 */
const commentSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    commentBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    commentDateTime: {
      type: Date,
      default: Date.now,
    },
    flags: [flagSchema],
    isRemoved: { type: Boolean, default: false },
  },
  { collection: 'Comment' },
);

export default commentSchema;
