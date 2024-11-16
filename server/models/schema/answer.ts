import { Schema } from 'mongoose';
import flagSchema from './flag';

/**
 * Mongoose schema for the Answer collection.
 *
 * This schema defines the structure for storing answers in the database.
 * Each answer includes the following fields:
 * - `text`: The content of the answer.
 * - `ansBy`: The username of the user who provided the answer.
 * - `ansDateTime`: The date and time when the answer was given.
 * - `comments`: Comments that have been added to the answer by users.
 * - `flags`: An array of flags associated with the answer.
 * - `isRemoved`: A boolean indicating whether the answer has been removed by a moderator.
 */
const answerSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    ansBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    ansDateTime: {
      type: Date,
      default: Date.now,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    flags: [flagSchema],
    isRemoved: { type: Boolean, default: false },
  },
  { collection: 'Answer' },
);

export default answerSchema;
