import { BookmarkCollection } from '../types';
import api from './config';

const BOOKMARK_API_URL = `${process.env.REACT_APP_SERVER_URL}/bookmark`;

/**
 *
 * @param username - the username of the user who is creating the collection
 * @param title - the title of the bookmark collection
 * @param isPublic - a boolean indicating whether the bookmark collection is public or private
 * @returns - the newly created bookmark collection.
 */
const createBookmarkCollection = async (
  username: string,
  title: string,
  isPublic: boolean,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/createCollection`, {
    username,
    title,
    isPublic,
  });
  if (res.status !== 200) {
    throw new Error('Error when creating bookmark collection');
  }
  return res.data;
};

const addQuestionToBookmarkCollection = async (
  collectionId: string,
  postId: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/addQuestionToCollection`, {
    collectionId,
    postId,
  });

  if (res.status !== 200) {
    throw new Error('Error when adding question to collection');
  }
  return res.data;
};

/**
 * Removes a given question from a bookmark collection.
 * @param collectionId - the id of the bookmark collection to remove the question from
 * @param postId - the Id of the question to remove from the collection
 * @returns- the updated bookmark collection
 */
const removeQuestionFromBookmarkCollection = async (
  collectionId: string,
  postId: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/removeQuestionFromCollection`, {
    collectionId,
    postId,
  });

  if (res.status !== 200) {
    throw new Error('Error when removing question from collection');
  }
  return res.data;
};

/**
 * Gets all the bookmark collections for a given user.
 * @param username - the username of the user whose bookmark collections are being fetched
 * @param requesterUsername - the username of the user who is requesting the bookmark collections
 * @param sortOption - an optional sort option to sort the collections by
 * @returns - an array of bookmark collections
 */
const getUserBookmarkCollections = async (
  username: string,
  requesterUsername: string,
  sortOption?: string,
): Promise<BookmarkCollection[]> => {
  const res = await api.get(
    `${BOOKMARK_API_URL}/getUserCollections/${username}/${requesterUsername}${sortOption ? `?sortOption=${sortOption}` : ''}`,
  );
  if (res.status !== 200) {
    throw new Error('Error when fetching user bookmark collections');
  }
  return res.data;
};

/**
 * Follows a bookmark collection
 * @param collectionId - the id of the bookmark collection to follow
 * @param username - the username of the user who is following the bookmark collection
 * @returns - the updated bookmark collection
 */
const followBookmarkCollection = async (
  collectionId: string,
  username: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/followCollection`, {
    collectionId,
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error when following collection');
  }
  return res.data;
};

/**
 * Unfollows a user from a bookmark collection
 * @param collectionId - the id of the bookmark collection to unfollow
 * @param username - the username of the user who is unfollowing the bookmark collection
 * @returns - the updated bookmark collection
 */
const unfollowBookmarkCollection = async (
  collectionId: string,
  username: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/unfollowCollection`, {
    collectionId,
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error when unfollowing collection');
  }
  return res.data;
};

/**
 * Retrieves a bookmark collection by its id
 * @param collectionId - the id of the bookmark collection to retrieve
 * @returns - the bookmark collection
 */
const getBookmarkCollectionById = async (collectionId: string): Promise<BookmarkCollection> => {
  const res = await api.get(`${BOOKMARK_API_URL}/getBookmarkCollectionById/${collectionId}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching bookmark collection by id');
  }
  return res.data;
};

export {
  createBookmarkCollection,
  addQuestionToBookmarkCollection,
  removeQuestionFromBookmarkCollection,
  getUserBookmarkCollections,
  followBookmarkCollection,
  unfollowBookmarkCollection,
  getBookmarkCollectionById,
};
