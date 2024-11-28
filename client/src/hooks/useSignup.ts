import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../services/userService';
import useLoginContext from './useLoginContext';

/**
 * Custom hook to handle signup input and submission.
 *
 * @returns username, password - The current values of the input fields.
 * @returns handleUsernameChange, handlePasswordChange - Functions to handle input changes.
 * @returns handleSubmit - Function to handle signup submission.
 */
const useSignup = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();

  /**
   * Handles username input change.
   * @param e - The change event object.
   */
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  /**
   * Handles password input change.
   * @param e - The change event object.
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  /**
   * Handles signup form submission.
   * @param event - The form event object.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addUser({ username, password });
      setUser({ username, password });
      navigate('/home');
    } catch (error) {
      setErrorMessage('Signup failed. Please try again.');
    }
  };

  return {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    errorMessage,
  };
};

export default useSignup;
