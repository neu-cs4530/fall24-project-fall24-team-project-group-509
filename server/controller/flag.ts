import express, { Response } from 'express';
import { FlagPostRequest, FakeSOSocket, QuestionResponse } from '../types';
import { flagPost } from '../models/application';

const flagController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Handles the request to flag a post as inappropriate.
   *
   * @param req The FlagPostRequest object containing the post ID, type, reason, and the username of the user flagging the post.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const flagPostRoute = async (req: FlagPostRequest, res: Response): Promise<void> => {
    const { id, type, reason, flaggedBy } = req.body;

    if (!id || !type || !reason || !flaggedBy) {
      res.status(400).send('Invalid request');
      return;
    }

    try {
      const result = await flagPost(id, type, reason, flaggedBy);
      if (result && 'error' in result) {
        throw new Error(result.error as string);
      }

      // Emit the 'postFlagged' event to the client
      socket.emit('postFlagged', { id, type });

      // Emit the updated post via the socket
      // If it's a question, emit a specific "questionUpdate" event
      if (type === 'question') {
        socket.emit('questionUpdate', result as QuestionResponse);
      }

      res.json({ message: 'Post flagged successfully' });
    } catch (err) {
      res.status(500).send(`Error when flagging post: ${(err as Error).message}`);
    }
  };

  // Define routes
  router.post('/flagPost', flagPostRoute);

  return router;
};

export default flagController;
