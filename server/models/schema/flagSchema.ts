import { Schema } from 'mongoose';

/**
 * Schema for the flags associated with a post (Question, Answer, or Comment).
 */
const flagSchema: Schema = new Schema({
  flaggedBy: { type: String, required: true }, // User who flagged the post
  reason: { type: String, required: true }, // Reason for flagging
  date: { type: Date, default: Date.now }, // When it was flagged
});

export default flagSchema;
