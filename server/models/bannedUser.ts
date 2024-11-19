import mongoose, { Model } from 'mongoose';
import { BannedUser } from '../types';
import bannedUserSchema from './schema/bannedUser';

/**
 * Mongoose model for the BannedUser collection.
 *
 * This model represents the BannedUser collection in the MongoDB database.
 *
 * @type {Model<BannedUser>}
 */
const BannedUserModel: Model<BannedUser> = mongoose.model<BannedUser>(
  'BannedUser',
  bannedUserSchema,
);

export default BannedUserModel;
