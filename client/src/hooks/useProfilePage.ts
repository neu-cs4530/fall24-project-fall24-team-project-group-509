import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookmarkCollection, Question, UserProfile } from '../types';
import useUserContext from './useUserContext';
import { addUserBio, addUserProfilePicture, getUserByUsername } from '../services/userService';

const useProfilePage = () => {
  const { user, socket } = useUserContext();
  const { username } = useParams();
  const requesterUsername = user.username;
  const [bio, setBio] = useState('');
  const initialActivityHistory = [{ postID: '', postType: '', createdAt: new Date() }];
  const [activityHistory, setActivityHistory] =
    useState<Array<{ postID: string; postType: string; createdAt: Date }>>(initialActivityHistory);
  const [bookmarks, setBookmarks] = useState<BookmarkCollection[]>([]);
  const [pfp, setPfp] = useState<string>('');
  // for handle Search routing
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userProfile: UserProfile = await getUserByUsername(
          username as string,
          requesterUsername,
        );
        setBio(userProfile.bio);
        setPfp(userProfile.profilePictureURL);
        if (userProfile.activityHistory) {
          setActivityHistory(
            userProfile.activityHistory.map(a => ({
              postID: a.postId,
              postType: a.postType,
              createdAt: new Date(a.createdAt),
            })),
          );
        }
        setBookmarks(userProfile.bookmarks);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();

    socket.on(
      'activityHistoryUpdate',
      (newActivityHistory: Array<{ postID: string; postType: string; createdAt: Date }>) => {
        setActivityHistory(newActivityHistory);
      },
    );

    socket.on('bookmarkUpdate', (newBookmarks: BookmarkCollection[]) => {
      setBookmarks(newBookmarks);
    });

    return () => {
      socket.off('activityHistoryUpdate');
      socket.off('bookmarkUpdate');
    };
  }, [username, requesterUsername, socket]);

  const handleImgUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPfp(URL.createObjectURL(file));
      await addUserProfilePicture(requesterUsername, file);
    }
  };

  const handleEditClick = () => {
    setIsEditingBio(true);
  };

  const handleSaveClick = async () => {
    await addUserBio(username as string, bio);
    setIsEditingBio(false);
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return {
    requesterUsername,
    bio,
    setBio,
    activityHistory,
    setActivityHistory,
    bookmarks,
    setBookmarks,
    pfp,
    setPfp,
    handleImgUpdate,
    handleEditClick,
    handleSaveClick,
    username,
    searchQuery,
    setSearchQuery,
    handleSearch,
    isEditingBio,
  };
};

export default useProfilePage;
