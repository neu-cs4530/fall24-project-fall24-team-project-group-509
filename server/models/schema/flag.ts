import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Flag collection.
 *
 * This schema defines the structure of a flag used to mark inappropriate content in the system.
 * Each flag includes the following fields:
 *
 * - `postId`: The ID of the post (question, answer, or comment) that has been flagged.
 * - `flaggedBy`: The username of the user who flagged the post.
 * - `flagType`: The type of flag, indicating the reason for flagging. Possible values include:
 *    - `spam`: The content is considered spam.
 *    - `offensive`: The content is offensive or abusive.
 *    - `irrelevant`: The content is irrelevant to the context.
 *    - `other`: Any other reason for flagging.
 * - `status`: The status of the flag. Possible values include:
 *    - `pending`: The flag is waiting for moderator review.
 *    - `reviewed`: The flag has been reviewed by a moderator.
 * - `createdAt`: The date and time when the flag was created. Automatically set when the flag is created.
 * - `reviewedBy`: (Optional) The username of the moderator who reviewed the flag.
 * - `reviewedAt`: (Optional) The date and time when the flag was reviewed by a moderator.
 *
 * This schema is used to manage and track flagged content, ensuring that inappropriate posts can be identified and moderated effectively.
 */
const flagSchema: Schema = new Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    flaggedBy: {
      type: String,
      required: true,
    },
    flagType: {
      type: String,
      enum: ['spam', 'offensive', 'irrelevant', 'other'], // Enforce allowed flag types
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed'], // Enforce allowed statuses
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the flagging date
    },
    reviewedBy: {
      type: String, // Username of the moderator
    },
    reviewedAt: {
      type: Date, // Date the flag was reviewed
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export default flagSchema;
