import { Schema } from 'mongoose';
import flagSchema from './flag';

/**
 * Mongoose schema for the Question collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - `title`: The title of the question.
 * - `text`: The detailed content of the question.
 * - `tags`: An array of references to `Tag` documents associated with the question.
 * - `answers`: An array of references to `Answer` documents associated with the question.
 * - `askedBy`: The username of the user who asked the question.
 * - `askDateTime`: The date and time when the question was asked.
 * - `views`: An array of usernames that have viewed the question.
 * - `upVotes`: An array of usernames that have upvoted the question.
 * - `downVotes`: An array of usernames that have downvoted the question.
 * - `comments`: Comments that have been added to the question by users.
 * - `flags`: An array of flags associated with the question.
 * - `isRemoved`: A boolean indicating whether the question has been removed by a moderator.
 */
const questionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    askedBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    askDateTime: {
      type: Date,
      default: Date.now,
    },
    views: [{ type: String }],
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    flags: [flagSchema],
    isRemoved: { type: Boolean, default: false },
    warningMessage: { type: String, default: '' },
  },
  { collection: 'Question' },
);

export default questionSchema;
