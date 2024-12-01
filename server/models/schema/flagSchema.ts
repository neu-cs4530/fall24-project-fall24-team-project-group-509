import { Schema } from 'mongoose';

/**
 * Schema for the flags associated with a post (Question, Answer, or Comment).
 * @property {string} flaggedBy - The ID of the user who flagged the post.
 * @property {string} reason - The reason why the post was flagged.
 * @property {Date} dateFlagged - The date when the post was flagged. Defaults to the current date.
 * @property {string} status - The status of the flag. Can be 'pending' or 'reviewed'. Defaults to 'pending'.
 * @property {string} [reviewedBy] - The ID of the user who reviewed the flag.
 * @property {Date} [reviewedAt] - The date when the flag was reviewed.
 * @property {Schema.Types.ObjectId} postId - The ID of the flagged post.
 * @property {string} postType - The type of the flagged post. Can be 'question', 'answer', or 'comment'.
 * @property {string} postText - The text content of the flagged post.
 * @property {string} flaggedUser - The ID of the user who created the flagged post.
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
