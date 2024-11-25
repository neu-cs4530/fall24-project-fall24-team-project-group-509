import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import useLoginContext from './useLoginContext';
import { addUser, isUserBanned } from '../services/userService';

/**
 * Custom hook to handle login input and submission.
 *
 * @returns username - The current value of the username input.
 * @returns handleInputChange - Function to handle changes in the input field.
 * @returns handleSubmit - Function to handle login submission
 */
const useLogin = () => {
  const [username, setUsername] = useState<string>('');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [banMessage, setBanMessage] = useState<string>('');

  /**
   * Function to handle the username change event.
   *
   * @param e - the event object.
   */
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  /**
   * Function to handle the password change event.
   *
   * @param e - the event object.
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  /**
   * Function to handle the form submission event.
   *
   * @param event - the form event object.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        setBanMessage('You are banned from the site.');
        return;
      }
      await addUser({ username, password });
      setUser({ username, password });
      navigate('/home');
    } catch (error) {
      // REMOVE THIS LATER
      // eslint-disable-next-line no-console
      console.error('Error adding user:', error);
      // Proceed with login as usual if there is an error (e.g., user already exists)
    }
  };

  return {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    banMessage,
  };
};

export default useLogin;
