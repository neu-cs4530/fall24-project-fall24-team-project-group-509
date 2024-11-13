import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookmarkCollection, UserProfile } from '../types';
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
  const [isEditingBio, setIsEditingBio] = useState(false);

  const sortActivityHistory = (
    history: Array<{ postID: string; postType: string; createdAt: Date }>,
  ) => history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          const sortedHistory = sortActivityHistory(
            userProfile.activityHistory.map(a => ({
              postID: a.postId,
              postType: a.postType,
              createdAt: new Date(a.createdAt),
            })),
          );
          setActivityHistory(sortedHistory);
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
        setActivityHistory(sortActivityHistory(newActivityHistory));
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
    isEditingBio,
  };
};

export default useProfilePage;
