/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getBookmarkCollectionById,
  followBookmarkCollection,
  unfollowBookmarkCollection,
  removeQuestionFromBookmarkCollection,
} from '../services/bookmarkService';
import { BookmarkCollection, Question } from '../types';
import useQuestionPage from './useQuestionPage';
import useUserContext from './useUserContext';

const useBookmarkPage = () => {
  const { user } = useUserContext();
  const { collectionId } = useParams();
  const collectionID = collectionId as string;
  const [collection, setCollection] = useState<BookmarkCollection>({
    title: 'Default Collection',
    owner: '',
    isPublic: false,
    followers: [],
    savedPosts: [],
  });
  const [savedPosts, setSavedPosts] = useState<Question[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { setQuestionOrder } = useQuestionPage();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const fetchedCollection = await getBookmarkCollectionById(collectionID);
      setCollection(fetchedCollection);
      if (fetchedCollection.savedPosts) {
        setSavedPosts(fetchedCollection.savedPosts);
      }
    };
    fetchSavedPosts();
  }, [collectionID]);

  const handleFollowCollection = async () => {
    await followBookmarkCollection(collectionID, user.username);
  };

  const handleUnfollowCollection = async () => {
    await unfollowBookmarkCollection(collectionID, user.username);
  };

  const handleSharingCollection = async (username: string) => {
    if (username) {
      const updatedCollection = await followBookmarkCollection(collectionID, username);
      setCollection(updatedCollection);
    }
  };

  const handleDeleteFromCollection = async (q_id: string) => {
    const updatedCollection = await removeQuestionFromBookmarkCollection(collectionID, q_id);
    setCollection(updatedCollection);
  }

  return {
    user,
    collection,
    savedPosts,
    showModal,
    setShowModal,
    setQuestionOrder,
    handleFollowCollection,
    handleUnfollowCollection,
    handleSharingCollection,
    handleDeleteFromCollection,
  };
};

export default useBookmarkPage;
