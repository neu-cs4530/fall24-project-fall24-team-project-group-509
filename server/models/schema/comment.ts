import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Comment collection.
 *
 * This schema defines the structure of a comment used in questions and answers in the database.
 * Each comment includes the following fields:
 * - text: The content of the comment. This field is required.
 * - commentBy: A reference to the user who commented.
 * - commentDateTime: The date and time when the comment was posted.
 */
const commentSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    commentBy: {
      type: String,
      required: true,
    },
    commentDateTime: {
      type: Date,
      default: Date.now, // Set default to current date and time
    },
  },
  { collection: 'Comment', timestamps: true },
);

export default commentSchema;
