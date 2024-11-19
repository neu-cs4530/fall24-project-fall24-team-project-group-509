import express, { Request, Response } from 'express';
import { reviewFlaggedContent, getFlaggedContent } from '../models/application';
import { ModeratorActionRequest, FakeSOSocket } from '../types';
import UserModel from '../models/user';

const moderatorController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves all flagged content pending review.
   */
  const getAllFlaggedContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const flaggedContent = await getFlaggedContent();
      res.json(flaggedContent);
    } catch (error) {
      res.status(500).send(`Error when fetching flagged content: ${(error as Error).message}`);
    }
  };

  /**
   * Allows a moderator to review flagged content and take action.
   */
  const reviewFlaggedContentRoute = async (
    req: ModeratorActionRequest,
    res: Response,
  ): Promise<void> => {
    const { contentId, contentType, action, comment, username } = req.body;

    if (!contentId || !contentType || !action || !username) {
      res.status(400).send('Invalid request');
      return;
    }

    // Simulate role checking
    const user = await UserModel.findOne({ username });
    if (!user || user.role !== 'moderator') {
      res.status(403).send('Access denied. Only moderators can perform this action.');
      return;
    }

    try {
      const result = await reviewFlaggedContent(contentId, contentType, action, comment);

      if (result.success) {
        // Emit appropriate events
        if (action === 'removed') {
          socket.emit('contentRemoved', { contentId, contentType });
        } else if (action === 'userBanned') {
          if (result.bannedUsername) {
            socket.emit('userBanned', { username: result.bannedUsername });
          }
          socket.emit('contentRemoved', { contentId, contentType });
        }

        res.json({ message: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      res.status(500).send(`Error when reviewing flagged content: ${(error as Error).message}`);
    }
  };

  router.get('/flaggedContent', getAllFlaggedContent);
  router.post('/reviewFlaggedContent', reviewFlaggedContentRoute);

  return router;
};

export default moderatorController;
