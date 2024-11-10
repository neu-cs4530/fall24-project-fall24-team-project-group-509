import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { useParams } from 'react-router-dom';
import TextArea from '../../baseComponents/textarea';
import { BookmarkCollection, Question } from '../../../../types';
import useUserContext from '../../../../hooks/useUserContext';

/**
 * Interface representing the props for the ProfielView component.
 *
 */
interface ProfileProps {
  username: string;
}

// TODO: add functionality abt following bookmarked collections (when implemented)

/**
 * ProfileView component that displays the content of a user profile with the username, profile picture,
 * biography, activity history, and bookmarked posts.
 *
 * @param username The user's unique username.
 */
const ProfileView = ({ username }: ProfileProps) => {
  const requesterUsername = useUserContext().user.username;
  const { socket } = useUserContext();
  const [bio, setBio] = useState('');
  // list of questions for history and saved posts in a bookmark collection  --> Important
  // need to be sorted in chronological order prior to being sent here
  const [activityHistory, setActivityHistory] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pfp, setPfp] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<BookmarkCollection[]>([]);

  /**
   * Function to handle the submission of a new image as a profile picture.
   */
  const handleImgUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPfp(URL.createObjectURL(file));
      // need to add controller method here
    }
  };

  /**
   * Function to handle when a user edits their bio.
   */
  const handleBioUpdate = async () => {
    // need API call for this (controller)
  };

  useEffect(() => {
    // need getters for activity history and bookmarks for initial data
    // TODO: need to declare updateActivityHistory and updateBookmarks as events in controller (i think)
    /*
    socket.on('updateActivityHistory', (newActivityHistory: Question[]) => {
      setActivityHistory(newActivityHistory);
    });
    socket.on('updateBookmarks', (newBookmarks: BookmarkCollection[]) => {
      setBookmarks(newBookmarks);
    })

    return () => {
      socket.off('updateActivityHistory');
      socket.off('updateBookmarks');
    }
    */
  }, [username]);

  return (
    <div className='user-profile'>
      <div className='profile-image'>
        <img src={pfp || 'defaultpfp.jpg'}></img>
        {requesterUsername === username && (
          <>
            <input type='file' ref={fileInputRef} onChange={handleImgUpdate} />
            <button onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              Upload new profile picture
            </button>
          </>
        )}
      </div>
      <div className='username-display'>{username}</div>
      <div className='biography'>
        <TextArea
          title='Biography'
          err='Error with biography'
          mandatory={false}
          id={username}
          val={bio}
          setState={setBio}
        />
        {requesterUsername === username && (
          <button onClick={() => handleBioUpdate()}>Edit biography</button>
        )}
      </div>
      <div className='history'>
        {activityHistory.map(question => (
          <div key={question._id}>
            <a href={`/questions/${question._id}`}>{question.title}</a>
          </div>
        ))}
      </div>
      <div className='collections'>
        {bookmarks.map(bookmark => (
          <div key={bookmark._id}>
            {(bookmark.isPublic || requesterUsername === username) && (
              <div className='bookmarks'>
                {bookmark.title}
                {bookmark.savedPosts.map(post => (
                  <div key={post._id}>{post.title}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;
