import { BookmarkCollection } from '../types';
import api from './config';

const BOOKMARK_API_URL = `${process.env.REACT_APP_SERVER_URL}/bookmarks`;

/**
 * Function to get all bookmark collections for a user.
 *
 * @param username - The username of the user whose collections are to be retrieved.
 * @param requesterUsername - The username of the user making the request (viewer).
 * @throws Error if there is an issue fetching the collections.
 */
const getUserBookmarkCollections = async (
  username: string,
  requesterUsername: string,
): Promise<BookmarkCollection[]> => {
  const res = await api.get(
    `${BOOKMARK_API_URL}/getUserCollections?username=${username}&requesterUsername=${requesterUsername}`,
  );
  if (res.status !== 200) {
    throw new Error('Error when fetching bookmark collections');
  }
  return res.data;
};

/**
 * Function to create a new bookmark collection.
 *
 * @param username - The username of the collection owner.
 * @param title - The title of the new collection.
 * @param isPublic - Boolean indicating if the collection is public.
 * @throws Error if there is an issue creating the collection.
 */
const createBookmarkCollection = async (
  username: string,
  title: string,
  isPublic: boolean,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/createCollection`, { username, title, isPublic });
  if (res.status !== 200) {
    throw new Error('Error while creating a bookmark collection');
  }
  return res.data;
};

/**
 * Function to add a question to a bookmark collection.
 *
 * @param collectionId - The ID of the collection to which the question will be added.
 * @param questionId - The ID of the question to add.
 * @throws Error if there is an issue adding the question to the collection.
 */
const addQuestionToBookmarkCollection = async (
  collectionId: string,
  questionId: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/addQuestionToCollection`, {
    collectionId,
    postId: questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error while adding question to collection');
  }
  return res.data;
};

/**
 * Function to remove a question from a bookmark collection.
 *
 * @param collectionId - The ID of the collection from which the question will be removed.
 * @param questionId - The ID of the question to remove.
 * @throws Error if there is an issue removing the question from the collection.
 */
const removeQuestionFromBookmarkCollection = async (
  collectionId: string,
  questionId: string,
): Promise<BookmarkCollection> => {
  const res = await api.post(`${BOOKMARK_API_URL}/removeQuestionFromCollection`, {
    collectionId,
    postId: questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error while removing question from collection');
  }
  return res.data;
};

export {
  getUserBookmarkCollections,
  createBookmarkCollection,
  addQuestionToBookmarkCollection,
  removeQuestionFromBookmarkCollection,
};
