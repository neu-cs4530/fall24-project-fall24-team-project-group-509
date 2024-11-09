import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import useLoginContext from './useLoginContext';
import { addUser } from '../services/userService';

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

  /**
   * Function to handle the input change event.
   *
   * @param e - the event object.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  /**
   * Function to handle the form submission event.
   *
   * @param event - the form event object.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addUser({ username });
    } catch (error) {
      console.error('Error adding user:', error);
      // Proceed with login as usual if there is an error (e.g., user already exists)
    }
    setUser({ username });
    navigate('/home');
  };

  return { username, handleInputChange, handleSubmit };
};

export default useLogin;
