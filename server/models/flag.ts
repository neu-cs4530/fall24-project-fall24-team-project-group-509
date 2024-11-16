import mongoose, { Model } from 'mongoose';
import flagSchema from './schema/flag';
import { FlaggedContent } from '../types';

/**
 * Mongoose model for the `Flag` collection.
 *
 * This model is created using the `Flag` interface and the `flagSchema`, representing the
 * `Flag` collection in the MongoDB database, and provides an interface for interacting with
 * the stored flags.
 *
 * @type {Model<Flag>}
 */
const FlagModel: Model<FlaggedContent> = mongoose.model<FlaggedContent>('Flag', flagSchema);

export default FlagModel;
