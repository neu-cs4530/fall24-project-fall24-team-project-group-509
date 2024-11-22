import React from 'react';
import { Link } from 'react-router-dom';
import useUserSearchPage from '../../../hooks/useUserSearchPage';

/**
 * SearchResultsPage component displays search results for users based on the search query.
 */
const SearchResultsPage = () => {
  const { titleText, userList } = useUserSearchPage();

  // Safeguard against userList being null, undefined, or not an array
  const validUserList = Array.isArray(userList) ? userList : [];

  return (
    <div className='search-results-page'>
      <h2>{titleText}</h2>
      {validUserList.length > 0 ? (
        <ul>
          {validUserList.map(user => (
            <li key={user.username}>
              <Link to={`/profile/${user.username}`}>{user.username}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;
