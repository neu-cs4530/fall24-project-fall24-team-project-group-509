import express, { Response } from 'express';
import { GetFlaggedPostsRequest, ReviewFlagRequest, DeletePostRequest } from '../types';
import {
  MODERATORUSERNAME,
  getFlaggedPosts,
  deletePost,
  markFlagAsReviewed,
} from '../models/application';

const moderatorController = () => {
  const router = express.Router();

  const getFlaggedPostsRoute = async (
    req: GetFlaggedPostsRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.query;

    if (!username || !MODERATORUSERNAME.includes(username)) {
      res.status(403).send('User is not authorized to perform this action');
      return;
    }

    try {
      const flaggedPosts = await getFlaggedPosts();
      res.json(flaggedPosts);
    } catch (err) {
      res.status(500).send(`Error when fetching flagged posts: ${(err as Error).message}`);
    }
  };

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
        res.json({ message: 'Post deleted successfully' });
      } else {
        res.status(500).send(result.message || 'Error when deleting post');
      }
    } catch (err) {
      res.status(500).send(`Error when deleting post: ${(err as Error).message}`);
    }
  };

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

  router.get('/flaggedPosts', getFlaggedPostsRoute);
  router.post('/deletePost', deletePostRoute);
  router.post('/reviewFlag', reviewFlagRoute);

  return router;
};

export default moderatorController;
