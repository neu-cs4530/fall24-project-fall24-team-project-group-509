import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileView from './userProfile';

const UserProfile = () => {
  const username = ''; // needs to be the username of the user whose page we want to view
  // can add search functionality here
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Function to handle the search action
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to the search results page with the query as a URL parameter
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Search bar for finding other users */}
      <div className='user-search'>
        <input
          type='text'
          placeholder='Search for a username...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Main profile view */}
      <ProfileView username={username}></ProfileView>
    </>
  );
};

export default UserProfile;
