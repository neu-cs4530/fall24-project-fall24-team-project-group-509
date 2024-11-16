import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Flag subdocument.
 *
 * This schema defines the structure for storing flags associated with content.
 */
const flagSchema: Schema = new Schema(
  {
    flaggedBy: { type: String, required: true, ref: 'User' },
    reason: {
      type: String,
      enum: ['spam', 'offensive language', 'irrelevant content', 'other'],
      required: true,
    },
    dateFlagged: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected'],
      default: 'pending',
    },
    moderatorAction: {
      type: String,
      enum: ['removed', 'allowed', 'userBanned'],
    },
    moderatorComment: { type: String },
  },
  { _id: false },
);

export default flagSchema;
