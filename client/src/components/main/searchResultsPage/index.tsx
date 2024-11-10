import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchUsersByUsername } from '../../../services/userService';
import { User } from '../../../types';

const SearchResultsPage = () => {
  const [results, setResults] = useState<User[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery) {
        try {
          const users = await searchUsersByUsername(searchQuery);
          setResults(users);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };
    fetchResults();
  }, [searchQuery]);

  return (
    <div className='search-results-page'>
      <h2>Search Results for &quot;{searchQuery}&quot;</h2>
      {results.length > 0 ? (
        <ul>
          {results.map(user => (
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
