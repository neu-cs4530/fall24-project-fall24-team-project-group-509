import { useRef } from 'react';
import './index.css';
import { useParams } from 'react-router-dom';
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
  const { username: profileUsername } = useParams();

  const {
    requesterUsername,
    bio,
    setBio,
    activityHistory,
    bookmarks,
    pfp,
    handleImgUpdate,
    handleBioUpdate,
    username, // This will be updated based on the profileUsername from useParams
    searchQuery,
    setSearchQuery,
    handleSearch,
  } = useProfilePage();

  const isOwnProfile = requesterUsername === profileUsername;

  return (
    <div className='user-profile'>
      <div className='profile-image'>
        <img src={pfp || 'defaultpfp.jpg'}></img>
        {isOwnProfile && (
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
        {isOwnProfile ? (
          <TextArea
            title='Biography'
            err='Error with biography'
            mandatory={false}
            id={username as string}
            val={bio}
            setState={setBio}
          />
        ) : (
          <p>{bio}</p>
        )}
        {isOwnProfile && <button onClick={() => handleBioUpdate()}>Edit biography</button>}
      </div>
      <div className='history'>
        {activityHistory.map(question => (
          <div key={question._id}>
            <a href={`/questions/${question._id}`}>{question.title}</a>
          </div>
        ))}
      </div>
      {/* Search Bar */}
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search for users...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className='collections'>
        {bookmarks.map(bookmark => (
          <div key={bookmark._id}>
            {(bookmark.isPublic || isOwnProfile) && (
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
