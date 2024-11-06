import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Question collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - title: The title of the question.
 * - text: The detailed content of the question.
 * - tags: An array of references to Tag documents associated with the question.
 * - answers: An array of references to Answer documents associated with the question.
 * - askedBy: A reference to the User who asked the question.
 * - askDateTime: The date and time when the question was asked.
 * - views: An array of usernames that have viewed the question.
 * - upVotes: An array of usernames that have upvoted the question.
 * - downVotes: An array of usernames that have downvoted the question.
 * - comments: Comments that have been added to the question by users.
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
    },
    askDateTime: {
      type: Date,
      default: Date.now,
    },
    views: [{ type: String }],
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { collection: 'Question', timestamps: true },
);

// Adding a text index to title and text to improve searchability.
questionSchema.index({ title: 'text', text: 'text' });

export default questionSchema;
