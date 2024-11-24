import { Flag, UserProfile } from '../types';
import api from './config';

const MODERATOR_API_URL = `${process.env.REACT_APP_SERVER_URL}/moderator`;

/**
 * Function to ban a user.
 *
 * @param username - The username of the user to ban.
 * @param moderatorUsername - The username of the moderator banning the user.
 * @throws Error if there is an issue banning the user.
 */
const banUser = async (username: string, moderatorUsername: string): Promise<UserProfile> => {
  const res = await api.post(`${MODERATOR_API_URL}/banUser`, { username, moderatorUsername });

  if (res.status !== 200) {
    throw new Error('Error when banning user');
  }
  return res.data;
};

/**
 * Function to unban a user.
 *
 * @param username - The username of the user to unban.
 * @param moderatorUsername - The username of the moderator unbanning the user.
 * @throws Error if there is an issue unbanning the user.
 */
const unbanUser = async (username: string, moderatorUsername: string): Promise<UserProfile> => {
  const res = await api.post(`${MODERATOR_API_URL}/unbanUser`, { username, moderatorUsername });

  if (res.status !== 200) {
    throw new Error('Error when unbanning user');
  }
  return res.data;
};

/**
 * Function to shadow ban a user.
 *
 * @param username - The username of the user to shadow ban.
 * @param moderatorUsername - The username of the moderator shadow banning the user.
 * @throws Error if there is an issue shadow banning the user.
 */
const shadowBanUser = async (username: string, moderatorUsername: string): Promise<UserProfile> => {
  const res = await api.post(`${MODERATOR_API_URL}/shadowBanUser`, { username, moderatorUsername });

  if (res.status !== 200) {
    throw new Error('Error when shadow banning user');
  }
  return res.data;
};

/**
 * Function to un-shadow ban a user.
 *
 * @param username - The username of the user to un-shadow ban.
 * @param moderatorUsername - The username of the moderator un-shadow banning the user.
 * @throws Error if there is an issue un-shadow banning the user.
 */
const unshadowBanUser = async (
  username: string,
  moderatorUsername: string,
): Promise<UserProfile> => {
  const res = await api.post(`${MODERATOR_API_URL}/unshadowBanUser`, {
    username,
    moderatorUsername,
  });

  if (res.status !== 200) {
    throw new Error('Error when un-shadow banning user');
  }
  return res.data;
};

/**
 * Function to get all pending flags.
 *
 * @param username - The username of the moderator fetching the pending flags.
 * @throws Error if there is an issue fetching the pending flags.
 */
const getPendingFlags = async (username: string): Promise<Flag[]> => {
  const res = await api.get(`${MODERATOR_API_URL}/pendingFlags?username=${username}`);

  if (res.status !== 200) {
    throw new Error('Error while fetching pending flags');
  }
  return res.data;
};

/**
 * Function to get a flag by its ID.
 *
 * @param fid - The ID of the flag to retrieve.
 * @throws Error if there is an issue fetching the flag by ID.
 */
const getFlagById = async (fid: string, username: string): Promise<Flag> => {
  const res = await api.get(`${MODERATOR_API_URL}/getFlag/${fid}?username=${username}`);

  if (res.status !== 200) {
    throw new Error('Error while fetching flag by id');
  }
  return res.data;
};

/**
 * Function to delete a post.
 *
 * @param id - The ID of the post to delete.
 * @param type - The type of the post to delete. This can be 'question', 'answer', or 'comment'.
 * @param moderatorUsername - The username of the moderator deleting the post.
 * @throws Error if there is an issue deleting the post.
 */
const deletePost = async (
  id: string,
  type: 'question' | 'answer' | 'comment',
  moderatorUsername: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATOR_API_URL}/deletePost`, { id, type, moderatorUsername });

  if (res.status !== 200) {
    throw new Error('Error while deleting post');
  }
  return res.data;
};

/**
 * Function to review a flag. This marks a flag as reviewed by a moderator.
 *
 * @param flagId - The ID of the flag to review.
 * @param moderatorUsername - The username of the moderator reviewing the flag.
 * @throws Error if there is an issue reviewing the flag.
 */
const reviewFlag = async (
  flagId: string,
  moderatorUsername: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATOR_API_URL}/reviewFlag`, { flagId, moderatorUsername });

  if (res.status !== 200) {
    throw new Error('Error while reviewing flag');
  }
  return res.data;
};

export {
  banUser,
  unbanUser,
  shadowBanUser,
  unshadowBanUser,
  getPendingFlags,
  getFlagById,
  deletePost,
  reviewFlag,
};
