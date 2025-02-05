import express, { Response } from 'express';
import {
  GetPendingFlagsRequest,
  ReviewFlagRequest,
  DeletePostRequest,
  BanUserRequest,
  GetFlagByIdRequest,
  FakeSOSocket,
} from '../types';
import {
  MODERATORUSERNAME,
  getPendingFlags,
  deletePost,
  markFlagAsReviewed,
  banUser,
  unbanUser,
  shadowBanUser,
  unshadowBanUser,
  getFlag,
  removePostFromAllCollections,
  removePostFromActivityHistory,
} from '../models/application';

const moderatorController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Route to get all pending flags.
   * @param req - The GetPendingFlagsRequest object containing the username of the moderator.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const getPendingFlagsRoute = async (
    req: GetPendingFlagsRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.query;

    if (!username || !MODERATORUSERNAME.includes(username)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const flags = await getPendingFlags();
      if ('error' in flags) {
        throw new Error(flags.error);
      }
      res.json(flags);
    } catch (err) {
      res.status(500).send(`Error when fetching pending flags: ${(err as Error).message}`);
    }
  };

  /**
   * Route to get a flag by its ID.
   * @param req - The GetFlagByIdRequest object containing the flag ID and the username of the moderator.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const getFlagByIdRoute = async (req: GetFlagByIdRequest, res: Response): Promise<void> => {
    const { fid } = req.params;
    const { username } = req.query;
    if (!username || !MODERATORUSERNAME.includes(username)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }
    try {
      const flag = await getFlag(fid);
      if ('error' in flag) {
        throw new Error(flag.error);
      }
      res.json(flag);
    } catch (err) {
      res.status(500).send(`Error when fetching flag: ${(err as Error).message}`);
    }
  };

  /**
   * Route to delete a post.
   * @param req - The DeletePostRequest object containing the post ID, type, and moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const deletePostRoute = async (req: DeletePostRequest, res: Response): Promise<void> => {
    const { id, type, moderatorUsername } = req.body;

    if (!id || !type || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await deletePost(id, type, moderatorUsername);
      if (result.success) {
        await removePostFromAllCollections(id, type);
        await removePostFromActivityHistory(id);

        socket.emit('deletePostNotification', {
          postId: id,
          postType: type,
          message:
            'A post has been deleted by a moderator and removed from your collections and activity history.',
        });

        res.json({ message: 'Post deleted successfully' });
      } else {
        res.status(500).send(result.message || 'Error when deleting post');
      }
    } catch (err) {
      res.status(500).send(`Error when deleting post: ${(err as Error).message}`);
    }
  };

  /**
   * Route to mark a flag as reviewed.
   * @param req - The ReviewFlagRequest object containing the flag ID and moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const reviewFlagRoute = async (req: ReviewFlagRequest, res: Response): Promise<void> => {
    const { flagId, moderatorUsername } = req.body;

    if (!flagId || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await markFlagAsReviewed(flagId, moderatorUsername);
      if (result.success) {
        res.json({ message: 'Flag marked as reviewed' });
      } else {
        res.status(500).send(result.message || 'Error when marking flag as reviewed');
      }
    } catch (err) {
      res.status(500).send(`Error when marking flag as reviewed: ${(err as Error).message}`);
    }
  };

  /**
   * Route to ban a user.
   * @param req - The BanUserRequest object containing the username of the user to ban and the moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const banUserRoute = async (req: BanUserRequest, res: Response): Promise<void> => {
    const { username, moderatorUsername } = req.body;

    if (!username || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await banUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: `User ${username} has been banned` });
    } catch (err) {
      res.status(500).send(`Error when banning user: ${(err as Error).message}`);
    }
  };

  /**
   * Route to unban a user.
   * @param req - The BanUserRequest object containing the username of the user to unban and the moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const unbanUserRoute = async (req: BanUserRequest, res: Response): Promise<void> => {
    const { username, moderatorUsername } = req.body;

    if (!username || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await unbanUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: `User ${username} has been unbanned` });
    } catch (err) {
      res.status(500).send(`Error when unbanning user: ${(err as Error).message}`);
    }
  };

  /**
   * Route to shadow ban a user.
   * @param req - The BanUserRequest object containing the username of the user to shadow ban and the moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const shadowBanUserRoute = async (req: BanUserRequest, res: Response): Promise<void> => {
    const { username, moderatorUsername } = req.body;

    if (!username || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await shadowBanUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: `User ${username} has been shadow banned` });
    } catch (err) {
      res.status(500).send(`Error when shadow banning user: ${(err as Error).message}`);
    }
  };

  /**
   * Route to un-shadow ban a user.
   * @param req - The BanUserRequest object containing the username of the user to un-shadow ban and the moderator username.
   * @param res - The HTTP response object used to send back the result of the operation.
   * @returns - A Promise that resolves to void.
   */
  const unshadowBanUserRoute = async (req: BanUserRequest, res: Response): Promise<void> => {
    const { username, moderatorUsername } = req.body;

    if (!username || !moderatorUsername) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!MODERATORUSERNAME.includes(moderatorUsername)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const result = await unshadowBanUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: `User ${username} has been un-shadow banned` });
    } catch (err) {
      res.status(500).send(`Error when un-shadow banning user: ${(err as Error).message}`);
    }
  };

  router.post('/banUser', banUserRoute);
  router.post('/unbanUser', unbanUserRoute);
  router.post('/shadowBanUser', shadowBanUserRoute);
  router.post('/unshadowBanUser', unshadowBanUserRoute);
  router.get('/pendingFlags', getPendingFlagsRoute);
  router.get('/getFlag/:fid', getFlagByIdRoute);
  router.post('/deletePost', deletePostRoute);
  router.post('/reviewFlag', reviewFlagRoute);

  return router;
};

export default moderatorController;
