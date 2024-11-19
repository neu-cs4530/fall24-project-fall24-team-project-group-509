import { Schema } from 'mongoose';

/**
 * Mongoose schema for the BookmarkCollection collection.
 *
 * This schema defines the structure for storing bookmark collections in the database.
 * Each bookmark collection includes the following fields:
 * - `title`: The title of the bookmark collection.
 * - `isPublic`: A boolean indicating whether the bookmark collection is public or private.
 * - `savedPost`: An array of references to `Question` documents that have been saved to the collection.
 */
const bookmarkCollectionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
      ref: 'User', // may or may not need ref, delete if needed
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    followers: [{ type: String, ref: 'User' }], // may or may not need ref, delete if needed
    savedPosts: [
      {
        postId: { type: Schema.Types.ObjectId, required: true, refPath: 'Question' },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: 'BookmarkCollection' },
);

export default bookmarkCollectionSchema;
