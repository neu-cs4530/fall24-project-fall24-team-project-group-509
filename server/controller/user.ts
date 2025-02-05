import express, { Response } from 'express';
import path from 'path';
import multer from 'multer';
import {
  AddUserRequest,
  FakeSOSocket,
  AddUserBioRequest,
  AddUserProfilePicRequest,
  FindUserByUsernameRequest,
  isUserBannedRequest,
  SearchUserByUsernameRequest,
  GetUserNotificationsRequest,
  ValidateUserCredentialsRequest,
} from '../types';
import {
  saveUser,
  addUserBio,
  addUserProfilePicture,
  getUserByUsername,
  isUserBanned,
  isUserShadowBanned,
  searchUsersByUsername,
  getUserFollowUpdateNotifications,
} from '../models/application';
import { checkProfanity } from '../profanityFilter';

const userController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  /**
   * Validates the addUserBio request to ensure all required fields are present.
   * @param req The AddUserBioRequest object containing the username and bio to be validated
   * @returns 'true' if the request is valid, otherwise 'false'.
   */
  const isAddUserBioRequestValid = (req: AddUserBioRequest): boolean =>
    !!req.body.username && req.body.bio !== undefined && req.body.bio !== null;

  /**
   * Adds a new user to the database. The user is first validated and then saved.
   * If the user is invalid or saving fails, the HTTP response status is updated.
   * @param req The AddUserRequest object containing the user data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addUser = async (req: AddUserRequest, res: Response): Promise<void> => {
    const user = req.body;
    try {
      const result = await saveUser(user);
      if ('error' in result) {
        throw new Error(result.error as string);
      }

      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding user: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a biography to the user profile. The user is first validated and then saved.
   * If the user is invalid or saving fails, the HTTP response status is updated.
   * @param req The AddUserBioRequest object containing the username and bio
   * @param res The HTTP response object used to send back the result of the operation.
   */
  const addUserBioRoute = async (req: AddUserBioRequest, res: Response): Promise<void> => {
    if (!isAddUserBioRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { username } = req.body;
    const { bio } = req.body;

    const banned = await isUserBanned(username);
    if (banned) {
      res.status(403).send('Your account has been banned');
      return;
    }

    const shadowBanned = await isUserShadowBanned(username);
    if (shadowBanned) {
      res
        .status(403)
        .send('You are not allowed to post since you did not adhere to community guidelines');
      return;
    }

    try {
      const { hasProfanity, censored } = await checkProfanity(bio);

      if (hasProfanity) {
        res.status(400).send(`Profanity detected in bio: ${censored}`);
        return;
      }
      const result = await addUserBio(username, bio);
      if ('error' in result) {
        throw new Error(result.error as string);
      }

      socket.emit('profileUpdate', { username, bio });
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding user bio: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a profile picture to the user profile. Validates the file type and uploads it.
   * @param req The AddUserProfilePicRequest object containing the username and profile picture file.
   * @param res The HTTP response object used to send back the result of the operation.
   */
  const addUserProfilePicRoute = async (
    req: AddUserProfilePicRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.body;
    const profilePictureFile = req.file;

    if (!username || !profilePictureFile) {
      res.status(400).send('Invalid request');
      return;
    }

    const banned = await isUserBanned(username);
    if (banned) {
      res.status(403).send('Your account has been banned');
      return;
    }

    const shadowBanned = await isUserShadowBanned(username);
    if (shadowBanned) {
      res
        .status(403)
        .send('You are not allowed to post since you did not adhere to community guidelines');
      return;
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(profilePictureFile.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(400).send('Invalid file type. File must be a jpg, jpeg, or png');
      return;
    }

    try {
      const result = await addUserProfilePicture(username, profilePictureFile);
      if ('error' in result) {
        throw new Error(result.error as string);
      }

      socket.emit('profileUpdate', {
        username,
        profilePictureURL: result.profilePictureURL!,
      });
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding user profile picture: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves a user by their username, including activity history.
   * @param req The HTTP request object containing the username and requesterUsername.
   * @param res The HTTP response object used to send back the user profile details.
   */
  const getUserByUsernameRoute = async (
    req: FindUserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;
    const { requesterUsername } = req.query;

    if (!username || username.trim() === '') {
      res.status(400).send('Invalid username');
      return;
    }
    if (!requesterUsername || requesterUsername.trim() === '') {
      res.status(400).send('Invalid requester username');
      return;
    }
    try {
      const user = await getUserByUsername(username, requesterUsername);

      if (user && !('error' in user)) {
        res.json(user);
        return;
      }
      throw new Error('Error while fetching user by username');
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        res.status(500).send(`Error when fetching user by username: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching user by username`);
      }
    }
  };

  /**
   * Searches for users by a partial or full username.
   * @param req The request object containing the query parameter `username`.
   * @param res The response object to send back the list of matching users.
   */
  const searchUsersByUsernameRoute = async (
    req: SearchUserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      res.status(400).send('Username query parameter is required');
      return;
    }

    try {
      // Search for users by a case-insensitive partial match on the username
      const users = await searchUsersByUsername(username);
      res.json(users);
    } catch (err: unknown) {
      res.status(500).send(`Error when fetching user by username: ${(err as Error).message}`);
    }
  };

  /**
   * Checks if a user is banned.
   * @param req - The HTTP request object containing the username of the user to check.
   * @param res - The HTTP response object used to send back the result of the operation.
   */
  const isUserBannedRoute = async (req: isUserBannedRequest, res: Response): Promise<void> => {
    const { username } = req.params;
    try {
      const banned = await isUserBanned(username);
      res.json(banned);
    } catch (err: unknown) {
      res.status(500).send(`Error when checking if user is banned: ${(err as Error).message}`);
    }
  };

  /**
   * Handles the HTTP request to retrieve follow update notifications for a user.
   * @param req - The request object containing the username parameter.
   * @param res - The response object.
   */
  const getUserNotifications = async (
    req: GetUserNotificationsRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;

    if (!username || username.trim() === '') {
      res.status(400).send('Username is required');
      return;
    }

    try {
      const notifications = await getUserFollowUpdateNotifications(username);
      res.json(notifications);
    } catch (error) {
      res.status(500).send(`Error retrieving notifications: ${(error as Error).message}`);
    }
  };

  /**
   * Validates the credentials of a user.
   * @param req - The HTTP request object containing the username and password in the body.
   * @param res - The HTTP response object used to send back the validation result.
   */
  const validateUserCredentials = async (
    req: ValidateUserCredentialsRequest,
    res: Response,
  ): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    try {
      // Fetch user by username
      const user = await getUserByUsername(username, username);
      if (!user) {
        res.status(404).send({ success: false, message: 'User not found' });
        return;
      }

      // Compare the password
      if ('password' in user) {
        const isPasswordValid = user.password === password;
        if (!isPasswordValid) {
          res.status(401).send({ success: false, message: 'Invalid credentials' });
          return;
        }
      } else {
        res.status(500).send({ success: false, message: 'User data is invalid' });
        return;
      }

      res.status(200).send({ success: true });
    } catch (error: unknown) {
      res
        .status(500)
        .send({ success: false, message: `Server error: ${(error as Error).message}` });
    }
  };

  router.get('/notifications/:username', getUserNotifications);
  router.post('/addUser', addUser);
  router.post('/addUserBio', addUserBioRoute);
  router.post('/addUserProfilePic', upload.single('profilePictureFile'), addUserProfilePicRoute);
  router.get('/getUser/:username', getUserByUsernameRoute);
  router.get('/isBanned/:username', isUserBannedRoute);
  router.get('/search/:username', searchUsersByUsernameRoute);
  router.post('/validate', validateUserCredentials);

  return router;
};
export default userController;
