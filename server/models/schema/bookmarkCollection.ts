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
    },
    isPublic: {
      type: Boolean,
    },
    savedPost: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  },
  { collection: 'BookmarkCollection' },
);
export default bookmarkCollectionSchema;
