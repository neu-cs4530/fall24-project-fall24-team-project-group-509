import { useRef } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import TextArea from '../../baseComponents/textarea';
import useProfilePage from '../../../../hooks/useProfilePage';

// TODO: add functionality abt following bookmarked collections (when implemented)

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
            activityHistory.map((post, index) => (
              <li key={index} className='history-item'>
                <p className='history-text'>
                  {username} made a {post.postType} on <Link to=''>{post.postID}</Link>
                </p>
              </li>
            ))
          ) : (
            <p>No activity history for {username}</p>
          )}
        </ul>
      </div>
      <div className='collections'>
        <h3>Saved Posts</h3>
        {bookmarks && bookmarks.length === 0 && <p>No saved posts for {username}</p>}
        {bookmarks &&
          bookmarks.map(bookmark => (
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
