import { Schema } from 'mongoose';

/**
 * Schema for the flags associated with a post (Question, Answer, or Comment).
 */
const flagSchema: Schema = new Schema({
  flaggedBy: { type: String, required: true },
  reason: { type: String, required: true },
  dateFlagged: { type: Date, default: Date.now },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'reviewed'] },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  postId: { type: Schema.Types.ObjectId, required: true },
  postType: { type: String, required: true, enum: ['question', 'answer', 'comment'] },
  postText: { type: String, required: true },
  flaggedUser: { type: String, required: true },
});

export default flagSchema;
