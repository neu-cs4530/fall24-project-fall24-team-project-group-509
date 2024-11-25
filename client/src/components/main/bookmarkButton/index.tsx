import React, { useState } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import useBookmark from '../../../hooks/useBookmark';
import './index.css';

const BookmarkButton = ({ questionId }: { questionId: string }) => {
  const {
    isBookmarked,
    collections,
    isDropdownOpen,
    toggleBookmark,
    selectCollection,
    createCollection,
    createPrivateCollection,
    removeFromCollection,
  } = useBookmark(questionId);
  const [newCollectionName, setNewCollectionName] = useState('');

  return (
    <div className='bookmark-button-container' onClick={e => e.stopPropagation()}>
      <button onClick={toggleBookmark}>
        {isBookmarked ? <FaBookmark size={24} /> : <FaRegBookmark size={24} />}
      </button>

      {isDropdownOpen && (
        <div className='bookmark-dropdown'>
          <h4>Select Collection</h4>
          {collections.length > 0 ? (
            <ul>
              {collections.map(collection => (
                <li key={collection._id} style={{ marginBottom: '10px', listStyleType: 'disc' }}>
                  <span>{collection.title}</span>
                  <button onClick={() => selectCollection(collection._id!)}>Add</button>
                  <button onClick={() => removeFromCollection(collection._id!)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No collections found</p>
          )}
          <div className='create-collection'>
            <input
              type='text'
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder='New collection name'
            />
            <button onClick={() => createCollection(newCollectionName)}>Create Public</button>
            <button onClick={() => createPrivateCollection(newCollectionName)}>
              Create Private
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkButton;
