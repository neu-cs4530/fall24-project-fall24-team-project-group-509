import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarkCollectionById } from '../../../services/bookmarkService';
import { BookmarkCollection, Question } from '../../../types';
import useUserContext from '../../../hooks/useUserContext';

// TODO: need to add functionality for sorting (date, # of answers), group by tags, socket updates
// TODO: need to add button functionality

const BookmarkPage = (collection_id: string) => {
  const { user } = useUserContext();
  const [collection, setCollection] = useState<BookmarkCollection>({
    title: '',
    owner: '',
    isPublic: false,
    followers: [],
    savedPosts: [],
  });
  const [savedPosts, setSavedPosts] = useState<Question[]>([]);

  const getSavedPosts = async () => {
    setCollection(await getBookmarkCollectionById(collection_id));
    if (collection?.savedPosts) {
      setSavedPosts(collection.savedPosts);
    }
    return savedPosts;
  };

  return (
    <div className='saved-posts'>
      <h2>{collection.title}</h2>
      {user.username === collection.owner && (
        <>
          <button>Make this collection public</button>
          <button>Delete this collection</button>
        </>
      )}
      <button>Follow this collection</button>
      {savedPosts && savedPosts.length > 0 ? (
        savedPosts.map(q => (
          <li key={q._id}>
            <Link to={`/question/${q._id}`}>
              <p>{q.title}</p>
            </Link>
          </li>
        ))
      ) : (
        <p>There are no saved posts in this bookmark collection.</p>
      )}
    </div>
  );
};

export default BookmarkPage;
