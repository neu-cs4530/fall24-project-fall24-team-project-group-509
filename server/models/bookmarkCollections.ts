import mongoose, { Model } from 'mongoose';
import { BookmarkCollection } from '../types';
import bookmarkCollectionSchema from './schema/bookmarkCollection';

/**
 * Mongoose model for the `BookmarkCollection` collection.
 *
 * This model is created using the `BookmarkCollection` interface and the `bookmarkCollectionSchema`, representing the
 * `BookmarkCollection` collection in the MongoDB database, and provides an interface for interacting with
 * the stored bookmark collections.
 */
const BookmarkCollectionModel: Model<BookmarkCollection> = mongoose.model<BookmarkCollection>(
  'BookmarkCollection',
  bookmarkCollectionSchema,
);
export default BookmarkCollectionModel;
