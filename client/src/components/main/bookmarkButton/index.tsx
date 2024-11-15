import React, { useState } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import useBookmark from '../../../hooks/useBookmark';

const BookmarkButton = ({ questionId }: { questionId: string }) => {
  const {
    isBookmarked,
    collections,
    isDropdownOpen,
    toggleBookmark,
    selectCollection,
    createCollection,
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
                <li key={collection._id}>
                  <button onClick={() => selectCollection(collection._id!)}>
                    {collection.title}
                  </button>
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
            <button onClick={() => createCollection(newCollectionName)}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkButton;
