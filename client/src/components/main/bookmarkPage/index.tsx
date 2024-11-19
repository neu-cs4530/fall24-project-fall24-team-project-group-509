import { Link } from 'react-router-dom';
import { OrderType, orderTypeDisplayName } from '../../../types';
import Modal from './modal';
import OrderButton from '../questionPage/header/orderButton';
import useBookmarkPage from '../../../hooks/useBookmarkPage';
import './index.css';

const BookmarkPage = () => {
  const {
    user,
    collection,
    savedPosts,
    showModal,
    setShowModal,
    setQuestionOrder,
    handleFollowCollection,
    handleUnfollowCollection,
    handleSharingCollection,
    handleDeleteFromCollection,
  } = useBookmarkPage();

  return (
    <div className='saved-posts'>
      <h2>{collection.title}</h2>
      <div className='buttons'>
        <div className='btns'>
          {Object.keys(orderTypeDisplayName).map((order, idx) => (
            <OrderButton
              key={idx}
              orderType={order as OrderType}
              setQuestionOrder={setQuestionOrder}
            />
          ))}
        </div>
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
      </div>
      <h3>Bookmarked Posts</h3>
      {savedPosts && savedPosts.length > 0 ? (
        savedPosts.map(post => (
          <li key={post._id}>
            {/* <Link to={`/question/${post.postId}`}>{post.postId}</Link> */}
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
