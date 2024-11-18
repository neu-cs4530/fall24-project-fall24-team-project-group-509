import { useRef } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import TextArea from '../../baseComponents/textarea';
import useProfilePage from '../../../../hooks/useProfilePage';

// TODO: add functionality abt following bookmarked collections (when implemented)
// TODO: Link a collection's title to a new page with its contents

/**
 * ProfileView component that displays the content of a user profile with the username, profile picture,
 * biography, activity history, and bookmarked posts.
 *
 * @param username The user's unique username.
 */
const ProfileView = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    requesterUsername,
    bio,
    setBio,
    activityHistory,
    bookmarks,
    pfp,
    handleImgUpdate,
    handleEditClick,
    handleSaveClick,
    username,
    isEditingBio,
  } = useProfilePage();

  const getArticle = (type: string) => (type.toLowerCase() === 'answer' ? 'an' : 'a');

  return (
    <div className='user-profile'>
      <div className='profile-image-container'>
        <div className='profile-image'>
          <img src={pfp || 'defaultpfp.jpg'}></img>
          {requesterUsername === username && (
            <>
              <input type='file' ref={fileInputRef} onChange={handleImgUpdate} />
            </>
          )}
        </div>
        <div className='username-display'>
          <h1>{username}</h1>
        </div>
      </div>
      <div className='biography'>
        {isEditingBio ? (
          <div>
            <TextArea
              title='Biography'
              err=''
              mandatory={false}
              id={username as string}
              val={bio}
              setState={setBio}
            />
            <button onClick={handleSaveClick}>Save</button>
          </div>
        ) : (
          <div>
            <h3>Biography</h3>
            <p>{bio}</p>
            {requesterUsername === username && (
              <button onClick={handleEditClick}>Edit biography</button>
            )}
          </div>
        )}
      </div>
      <div className='history'>
        <h3>Activity History</h3>
        <ul className='history-list'>
          {activityHistory.length > 0 ? (
            activityHistory.map(post => (
              <li key={post.postID} className='history-item'>
                <p className='history-text'>
                  {username} added {getArticle(post.postType)} {post.postType.toLowerCase()} on{' '}
                  <Link to={`/question/${post.postID}`}>{post.postID}</Link>
                </p>
              </li>
            ))
          ) : (
            <p>No activity history for {username}</p>
          )}
        </ul>
      </div>
      <div className='collections'>
        <h3>Bookmarks</h3>
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map(collection => (
            <li key={collection._id} className='bookmark-collection'>
              <Link to={`/user/${collection._id}`}>{collection.title}</Link>
            </li>
          ))
        ) : (
          <p>{username} has no bookmarked posts</p>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
