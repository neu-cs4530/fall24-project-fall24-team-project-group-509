import React from 'react';
import { Link } from 'react-router-dom';
import useUserSearchPage from '../../../hooks/useUserSearchPage';
import './index.css';

/**
 * SearchResultsPage component displays search results for users based on the search query.
 */
const SearchResultsPage = () => {
  const { titleText, userList } = useUserSearchPage();

  // Safeguard against userList being null, undefined, or not an array
  const validUserList = Array.isArray(userList) ? userList : [];

  return (
    <div className='search-results-page'>
      <h2 className='search-results-title'>{titleText}</h2>
      {validUserList.length > 0 ? (
        <ul className='search-results-list'>
          {validUserList.map(user => (
            <li key={user.username} className='search-result-item'>
              <Link to={`/profile/${user.username}`} className='search-result-link'>
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className='no-results'>No users found.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;
