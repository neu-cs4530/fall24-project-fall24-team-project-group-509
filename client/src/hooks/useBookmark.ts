import { useState, useEffect } from 'react';
import {
  getUserBookmarkCollections,
  addQuestionToBookmarkCollection,
  createBookmarkCollection,
  removeQuestionFromBookmarkCollection,
} from '../services/bookmarkService';
import { BookmarkCollection } from '../types';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing bookmarks and collections.
 *
 * @param questionId - The ID of the question to manage bookmarks for.
 * @returns An object containing:
 * - isBookmarked: Whether the question is bookmarked.
 * - collections: The user's bookmark collections.
 * - isDropdownOpen: Whether the dropdown for collections is open.
 * - toggleBookmark: Toggles the bookmark status.
 * - selectCollection: Adds the question to a selected collection.
 * - createCollection: Creates a new collection and adds the question to it.
 */
const useBookmark = (questionId: string) => {
  const { user } = useUserContext();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDropdownOpen && user) {
      // Fetch collections when the dropdown opens
      const fetchCollections = async () => {
        try {
          // pass in the username twice for the user and the requester
          const userCollections = await getUserBookmarkCollections(user.username, user.username);
          // Check if the response is an error object
          if ('error' in userCollections) {
            setCollections([]); // Set an empty array in case of an error
            setError(String(userCollections.error));
          } else {
            // Otherwise, set the fetched collections
            if (userCollections.length === 0) {
              setError('No bookmark collections found.');
            }
            setCollections(userCollections);
          }
        } catch (err) {
          setError('Error fetching bookmark collections:');
        }
      };

      fetchCollections();
    }
  }, [isDropdownOpen, user]);

  /**
   * Removes the question from a specific collection.
   *
   * @param collectionId - The ID of the collection to remove the question from.
   */
  const removeFromCollection = async (collectionId: string) => {
    if (!user || !collectionId) return;
    try {
      const updatedCollection = await removeQuestionFromBookmarkCollection(
        collectionId,
        questionId,
      );

      setCollections(prev =>
        prev.map(collection => (collection._id === collectionId ? updatedCollection : collection)),
      );
    } catch (err) {
      setError('Error removing question from collection');
    }
  };

  /**
   * Toggles the bookmark status.
   */
  const toggleBookmark = () => {
    setIsBookmarked(prev => {
      const newBookmarkState = !prev;
      if (!newBookmarkState) {
        setIsDropdownOpen(false); // Ensure dropdown closes when unbookmarking
      } else {
        setIsDropdownOpen(true); // Open dropdown when bookmarking
      }
      return newBookmarkState;
    });
  };

  /**
   * Adds the question to a selected collection.
   *
   * @param collectionId - The ID of the selected collection.
   */
  const selectCollection = async (collectionId: string) => {
    if (!user || !collectionId) return;
    try {
      await addQuestionToBookmarkCollection(collectionId, questionId);
      setIsDropdownOpen(false);
    } catch (err) {
      setError('Error adding question to collection:');
    }
  };

  /**
   * Creates a new collection and adds the question to it.
   *
   * @param title - Title of the new collection.
   */
  const createCollection = async (title: string) => {
    if (!user || !title) return;
    try {
      const newCollection = await createBookmarkCollection(user.username, title, true);
      await addQuestionToBookmarkCollection(newCollection._id!, questionId);
      setCollections(prev => [...prev, newCollection]);
      setIsDropdownOpen(false);
    } catch (err) {
      setError('Error creating a new collection:');
    }
  };

  return {
    isBookmarked,
    collections,
    isDropdownOpen,
    error,
    toggleBookmark,
    selectCollection,
    createCollection,
    removeFromCollection,
  };
};

export default useBookmark;
