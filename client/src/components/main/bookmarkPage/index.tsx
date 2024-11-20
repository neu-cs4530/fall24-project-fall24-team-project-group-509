import { Link } from 'react-router-dom';
import Modal from './modal';
import useBookmarkPage from '../../../hooks/useBookmarkPage';
import './index.css';

const BookmarkPage = () => {
  const {
    user,
    collection,
    showModal,
    setShowModal,
    sortOption,
    sortedPosts,
    handleSortChange,
    handleFollowCollection,
    handleUnfollowCollection,
    handleSharingCollection,
    handleDeleteFromCollection,
  } = useBookmarkPage();

  return (
    <div className='saved-posts'>
      <h2>{collection.title}</h2>
      <div className='buttons'>
        {user.username === collection.owner && (
          <>
            <button onClick={() => setShowModal(true)}>Share this collection</button>
          </>
        )}
        {collection.followers.includes(user.username) ? (
          <button onClick={handleUnfollowCollection}>Unfollow this collection</button>
        ) : (
          <button onClick={handleFollowCollection}>Follow this collection</button>
        )}
        <select value={sortOption} onChange={handleSortChange} className='sort-dropdown'>
          <option value='recency'>Sort by Recency</option>
          <option value='mostAnswers'>Sort by Most Answers</option>
        </select>
      </div>
      <h3>Bookmarked Posts</h3>
      {sortedPosts && sortedPosts.length > 0 ? (
        sortedPosts.map(post => (
          <li key={post._id}>
            <Link to={`/question/${post.postId}`}>{post.qTitle}</Link>
            {user.username === collection.owner && (
              <button className='deleteq' onClick={() => handleDeleteFromCollection(post.postId)}>
                Delete from this collection
              </button>
            )}
          </li>
        ))
      ) : (
        <p>There are no saved posts in this bookmark collection.</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSharingCollection}
      />
    </div>
  );
};

export default BookmarkPage;
