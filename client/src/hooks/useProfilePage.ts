import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookmarkCollection, Question, UserProfile } from '../types';
import useUserContext from './useUserContext';
import { addUserBio, addUserProfilePicture, getUserByUsername } from '../services/userService';

const useProfilePage = () => {
  const { user, socket } = useUserContext();
  const { username } = useParams();
  const requesterUsername = user.username;
  const [bio, setBio] = useState('');
  // list of questions for history and saved posts in a bookmark collection  --> Important
  // need to be sorted in chronological order prior to being sent here
  const [activityHistory, setActivityHistory] = useState<Question[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkCollection[]>([]);
  const [pfp, setPfp] = useState<string>('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userProfile: UserProfile = await getUserByUsername(
          username as string,
          requesterUsername,
        );
        setBio(userProfile.bio);
        setPfp(userProfile.profilePictureURL);
        setActivityHistory(userProfile.activityHistory || []);
        setBookmarks(userProfile.bookmarks || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();

    socket.on('activityHistoryUpdate', (newActivityHistory: Question[]) => {
      setActivityHistory(newActivityHistory);
    });

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

  const handleBioUpdate = async () => {
    await addUserBio(username as string, bio);
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
    handleBioUpdate,
    username,
  };
};

export default useProfilePage;
