import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Answer collection.
 *
 * This schema defines the structure for storing answers in the database.
 * Each answer includes the following fields:
 * - text: The content of the answer.
 * - ansBy: A reference to the user who provided the answer.
 * - ansDateTime: The date and time when the answer was given.
 * - comments: An array of references to Comment documents associated with the answer.
 */
const answerSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    ansBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model for consistency
      required: true,
    },
    ansDateTime: {
      type: Date,
      default: Date.now,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { collection: 'Answer', timestamps: true },
);

export default answerSchema;
