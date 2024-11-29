import { useRef } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import TextArea from '../../baseComponents/textarea';
import useProfilePage from '../../../../hooks/useProfilePage';

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
    searchQuery,
    setSearchQuery,
    handleSearch,
  } = useProfilePage();

  const getArticle = (type: string) => (type.toLowerCase() === 'answer' ? 'an' : 'a');

  return (
    <div className='user-profile'>
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search for users...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className='profile-button' onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className='profile-image-container'>
        <div className='profile-image'>
          <img src={pfp || 'defaultpfp.jpg'}></img>
          {requesterUsername === username && (
            <>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleImgUpdate}
                className='file-input'
              />
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
            <button className='profile-button' onClick={handleSaveClick}>
              Save
            </button>
          </div>
        ) : (
          <div>
            <h3>Biography</h3>
            <p>{bio}</p>
            {requesterUsername === username && (
              <button className='profile-button' onClick={handleEditClick}>
                Edit biography
              </button>
            )}
          </div>
        )}
      </div>
      <div className='collections'>
        <h3>Bookmark Collections</h3>
        <div className='bookmark-grid'>
          {bookmarks && bookmarks.length > 0 ? (
            bookmarks.map(collection => (
              <div key={collection._id} className='bookmark-card'>
                <Link to={`/user/bookmarks/${collection._id}`}>{collection.title}</Link>
              </div>
            ))
          ) : (
            <p>{username} has no bookmarked posts</p>
          )}
        </div>
      </div>
      <div className='history'>
        <h3>Activity History</h3>
        <ul className='history-list'>
          {activityHistory.length > 0 ? (
            activityHistory.map((post, idx) => (
              <li key={post.postID + idx} className='history-item'>
                <p className='history-text'>
                  {username} added {getArticle(post.postType)} {post.postType.toLowerCase()} on{' '}
                  <Link to={`/question/${post.postID}`}>{post.qTitle}</Link>
                </p>
              </li>
            ))
          ) : (
            <p>No activity history for {username}</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProfileView;
