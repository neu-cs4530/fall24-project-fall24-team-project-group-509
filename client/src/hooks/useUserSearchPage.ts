import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User } from '../types';
import { searchUsersByUsername } from '../services/userService';

/**
 * Custom hook for managing the user profile search page state and filtering by username.
 *
 * @returns titleText - The current title of the user search page
 * @returns userList - The list of users to display
 */
const useUserSearchPage = () => {
  const [searchParams] = useSearchParams();
  const [titleText, setTitleText] = useState<string>('All Users');
  const [search, setSearch] = useState<string>('');
  const [userList, setUserList] = useState<User[]>([]);

  useEffect(() => {
    let pageTitle = 'All Users';
    let searchString = '';

    const searchQuery = searchParams.get('query');

    if (searchQuery) {
      pageTitle = `Search Results for "${searchQuery}"`;
      searchString = searchQuery;
    }

    setTitleText(pageTitle);
    setSearch(searchString);
  }, [searchParams]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (search) {
          const users = await searchUsersByUsername(search);
          setUserList(users || []);
        } else {
          setUserList([]);
        }
      } catch (error) {
        // eslint-disable-next-line
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [search]);

  return { titleText, userList };
};

export default useUserSearchPage;
