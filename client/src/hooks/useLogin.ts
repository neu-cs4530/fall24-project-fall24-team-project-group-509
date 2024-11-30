import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import useLoginContext from './useLoginContext';
import { isUserBanned, validateUserCredentials } from '../services/userService';

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
  const [errorMessage, setErrorMessage] = useState<string>('');
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
  /**
   * Function to handle the form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        setBanMessage('You are banned from the site.');
        return;
      }

      // Validate user credentials
      const userValid = await validateUserCredentials({ username, password });

      if (userValid) {
        setUser({ username, password });
        navigate('/home');
      } else {
        setErrorMessage('Invalid username or password.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again.');
    }
  };

  return {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    banMessage,
    errorMessage,
  };
};

export default useLogin;
