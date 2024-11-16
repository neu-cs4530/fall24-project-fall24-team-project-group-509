import mongoose, { Model } from 'mongoose';
import { Flag } from '../types';
import flagSchema from './schema/flag';

/**
 * Mongoose model for the `Flag` collection.
 *
 * This model is created using the `Flag` interface and the `flagSchema`, representing the
 * `Flag` collection in the MongoDB database, and provides an interface for interacting with
 * the stored flags.
 *
 * @type {Model<Flag>}
 */
const FlagModel: Model<Flag> = mongoose.model<Flag>('Flag', flagSchema);

export default FlagModel;
