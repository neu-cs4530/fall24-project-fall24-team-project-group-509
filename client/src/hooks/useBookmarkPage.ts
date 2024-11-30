import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getBookmarkCollectionById,
  followBookmarkCollection,
  unfollowBookmarkCollection,
  removeQuestionFromBookmarkCollection,
} from '../services/bookmarkService';
import { Bookmark, BookmarkCollection } from '../types';
import useUserContext from './useUserContext';

const useBookmarkPage = () => {
  const { user, socket } = useUserContext();
  const { collectionId } = useParams();
  const collectionID = collectionId as string;
  const [collection, setCollection] = useState<BookmarkCollection>({
    title: 'Default Collection',
    owner: '',
    isPublic: false,
    followers: [],
    savedPosts: [],
  });
  const [savedPosts, setSavedPosts] = useState<Bookmark[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sortOption, setSortOption] = useState<'recency' | 'mostAnswers'>('recency');

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const fetchedCollection = await getBookmarkCollectionById(collectionID);
      setCollection(fetchedCollection);
      setSavedPosts(fetchedCollection.savedPosts || []);
    };
    fetchSavedPosts();
  }, [collectionID]);

  useEffect(() => {
    socket.on('bookmarkUpdate', (updatedCollections: BookmarkCollection[]) => {
      const updatedCollection = updatedCollections.find(col => col._id === collectionID);
      if (updatedCollection) {
        setCollection(updatedCollection);
        setSavedPosts(updatedCollection.savedPosts);
      }
    });

    return () => {
      socket.off('bookmarkUpdate');
    };
  }, [collectionID, socket]);

  useEffect(() => {
    // Handle flag notification
    const handleFlagNotification = (payload: {
      postId: string;
      postType: string;
      message: string;
    }) => {
      setSavedPosts(prevPosts => prevPosts.filter(post => post.postId !== payload.postId));
    };

    // Handle delete notification
    const handleDeletePostNotification = (payload: {
      postId: string;
      postType: string;
      message: string;
    }) => {
      setSavedPosts(prevPosts => prevPosts.filter(post => post.postId !== payload.postId));
    };

    socket.on('flagNotification', handleFlagNotification);
    socket.on('deletePostNotification', handleDeletePostNotification);

    return () => {
      socket.off('flagNotification', handleFlagNotification);
      socket.off('deletePostNotification', handleDeletePostNotification);
    };
  }, [socket]);

  const handleFollowCollection = async () => {
    const updatedCollection = await followBookmarkCollection(collectionID, user.username);
    setCollection(updatedCollection);
    socket.emit('bookmarkUpdate', [updatedCollection]);
  };

  const handleUnfollowCollection = async () => {
    const updatedCollection = await unfollowBookmarkCollection(collectionID, user.username);
    setCollection(updatedCollection);
    socket.emit('bookmarkUpdate', [updatedCollection]);
  };

  const handleSharingCollection = async (username: string) => {
    if (username) {
      const updatedCollection = await followBookmarkCollection(collectionID, username);
      setCollection(updatedCollection);
      socket.emit('bookmarkUpdate', [updatedCollection]);
    }
  };

  const handleDeleteFromCollection = async (q_id: string) => {
    setSavedPosts(prevPosts => prevPosts.filter(post => post.postId !== q_id));
    try {
      const updatedCollection = await removeQuestionFromBookmarkCollection(collectionID, q_id);
      setCollection(updatedCollection);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete question:', error);
      const fetchedCollection = await getBookmarkCollectionById(collectionID);
      setSavedPosts(fetchedCollection.savedPosts || []);
    }
  };

  const sortedPosts = [...savedPosts].sort((a, b) => {
    if (sortOption === 'recency') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    if (a.numAnswers && b.numAnswers && sortOption === 'mostAnswers') {
      return b.numAnswers - a.numAnswers;
    }
    return 0;
  });

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as 'recency' | 'mostAnswers');
  };

  return {
    user,
    collection,
    showModal,
    sortOption,
    sortedPosts,
    handleSortChange,
    setShowModal,
    handleFollowCollection,
    handleUnfollowCollection,
    handleSharingCollection,
    handleDeleteFromCollection,
  };
};

export default useBookmarkPage;
