import api from './config';
import { User, UserProfile } from '../types';

const USER_API_URL = `${process.env.REACT_APP_SERVER_URL}/user`;

/**
 * Function to add a profile picture to an existing user.
 *
 * @param username - The username of the user.
 * @param profilePictureFile - The file of the profile picture to upload.
 * @throws Error if there is an issue adding the profile picture.
 */
const addUserProfilePicture = async (
  username: string,
  profilePictureFile: File,
): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('profilePictureFile', profilePictureFile);

  const res = await api.post(`${USER_API_URL}/addUserProfilePic`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (res.status !== 200) {
    throw new Error('Error while adding user profile picture');
  }
  return res.data;
};

/**
 * Adds a new user to the database. The user is first validated and then saved.
 * If the user is invalid or saving fails, the HTTP response status is updated.
 * @param req The AddUserRequest object containing the user data.
 * @param res The HTTP response object used to send back the result of the operation.
 *
 * @returns A Promise that resolves to void.
 */
const addUser = async (user: User): Promise<UserProfile> => {
  // need to convert user to AddUserRequest, which it should be satisfied
  const res = await api.post(`${USER_API_URL}/addUser`, user);
  if (res.status !== 200) {
    throw new Error('Error while adding a new user');
  }
  return res.data;
};

/**
 * Function to add a biography to an existing user.
 *
 * @param username - The username of the user.
 * @param bio - The biography content to add to the user profile.
 * @throws Error if there is an issue adding the bio.
 */
const addUserBio = async (username: string, bio: string): Promise<UserProfile> => {
  const data = { username, bio };
  const res = await api.post(`${USER_API_URL}/addUserBio`, data);
  if (res.status !== 200) {
    throw new Error('Error while adding user bio');
  }
  return res.data;
};

/**
 * Function to get a user by their username.
 *
 * @param username - The username of the user to retrieve.
 * @param requesterUsername - The username of the requester.
 * @throws Error if there is an issue fetching the user by username.
 */
const getUserByUsername = async (
  username: string,
  requesterUsername: string,
): Promise<UserProfile> => {
  const res = await api.get(
    `${USER_API_URL}/getUser/${username}?requesterUsername=${requesterUsername}`,
  );
  if (res.status !== 200) {
    throw new Error('Error while fetching user by username');
  }
  return res.data;
};

/**
 * Searches for users by a partial or full username.
 *
 * @param username - The partial or full username to search for.
 * @returns A list of users matching the search criteria.
 */
const searchUsersByUsername = async (username: string): Promise<User[]> => {
  const res = await api.get(`${USER_API_URL}/search/${username}`);
  if (res.status !== 200) {
    throw new Error('Error while searching for users by username');
  }
  return res.data;
};

export { addUser, addUserBio, addUserProfilePicture, getUserByUsername, searchUsersByUsername };
