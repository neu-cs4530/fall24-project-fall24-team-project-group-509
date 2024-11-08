import express, { Response, Request } from 'express';
import { ObjectId } from 'mongodb';
import path from 'path';
import {
  User,
  AddUserRequest,
  FakeSOSocket,
  AddUserBioRequest,
  AddUserProfilePicRequest,
  FindUserByUsernameRequest,
} from '../types';
import {
  saveUser,
  addUserBio,
  addUserProfilePicture,
  getUserByUsername,
} from '../models/application';
import UserModel from '../models/user';

const userController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates the user object to ensure all required fields are present.
   * @param user The user object to validate.
   * @returns 'true' if the user object is valid, otherwise 'false'.
   */
  const isUserBodyValid = (user: User): boolean =>
    user.username !== undefined && user.username !== '';

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
    if (!isUserBodyValid(req.body)) {
      res.status(400).send('Invalid user body');
      return;
    }

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

    try {
      const result = await addUserBio(username, bio);
      if ('error' in result) {
        throw new Error(result.error as string);
      }

      // do I need to deal with populateDocument here?

      socket.emit('profileUpdate', { username, bio });
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding user bio: ${(err as Error).message}`);
    }
  };

  const addUserProfilePicRoute = async (
    req: AddUserProfilePicRequest,
    res: Response,
  ): Promise<void> => {
    const { username, profilePictureFile } = req.body;

    if (!username || !profilePictureFile) {
      res.status(400).send('Invalid request');
      return;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
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

      // do I need to deal with populateDocument here?

      if (result.profilePictureURL) {
        socket.emit('profileUpdate', { username, profilePictureURL: result.profilePictureURL });
      } else {
        // eslint-disable-next-line no-console
        console.error('Error: profilePictureURL is undefined');
      }
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding user profile picture: ${(err as Error).message}`);
    }
  };

  // INCOMPLETE
  // need to account for the requester's username
  /**
   * Retrieves a user by their username. The user is first validated and then retrieved.
   * @param req The HTTP request object used to send back the user profile details.
   * @param res
   * @returns A Promise that resolves to void.
   */
  const getUserByUsernameRoute = async (
    req: FindUserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;
    const { requesterUsername } = req.query;

    if (!username || username.trim() === '' || username === undefined) {
      res.status(400).send('Invalid username');
      return;
    }
    if (requesterUsername === undefined) {
      res.status(400).send('Invalid username requesting user');
      return;
    }
    try {
      const u = await getUserByUsername(username, requesterUsername);

      if (u && !('error' in u)) {
        // need to deal with socket emit updates here
        res.json(u);
        return;
      }
      throw new Error('Error while fetching user by username');
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching user by username: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching user by username`);
      }
    }
  };

  /**
   * Searches for users based on a keyword in their bio or username.
   * @param req The HTTP request object containing the keyword in params.
   * @param res The HTTP response object used to send back the list of users.
   */
  const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { keyword } = req.params;
      const users = await UserModel.find(
        { $text: { $search: keyword } },
        { score: { $meta: 'textScore' } },
      ).sort({ score: { $meta: 'textScore' } });
      res.json(users);
    } catch (err: unknown) {
      res.status(500).send(`Error when searching for users: ${(err as Error).message}`);
    }
  };

  router.post('/addUser', addUser);
  router.post('/addUserBio', addUserBioRoute);
  router.post('/addUserProfilePic', addUserProfilePicRoute);
  router.get('/getUser/:username', getUserByUsernameRoute);
  router.get('/search/:keyword', searchUsers);

  return router;
};
export default userController;
