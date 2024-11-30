import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import { Comment, AddCommentRequest, FakeSOSocket } from '../types';
import {
  addComment,
  findQuestionIDByAnswerID,
  isUserBanned,
  isUserShadowBanned,
  populateDocument,
  saveComment,
  updateActivityHistoryWithQuestionID,
} from '../models/application';
import { checkProfanity } from '../profanityFilter';

const commentController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddCommentRequest): boolean =>
    !!req.body.id &&
    !!req.body.type &&
    (req.body.type === 'question' || req.body.type === 'answer') &&
    !!req.body.comment &&
    req.body.comment.text !== undefined &&
    req.body.comment.commentBy !== undefined &&
    req.body.comment.commentDateTime !== undefined;

  /**
   * Validates the comment object to ensure it is not empty.
   *
   * @param comment The comment to validate.
   *
   * @returns `true` if the coment is valid, otherwise `false`.
   */
  const isCommentValid = (comment: Comment): boolean =>
    comment.text !== undefined &&
    comment.text !== '' &&
    comment.commentBy !== undefined &&
    comment.commentBy !== '' &&
    comment.commentDateTime !== undefined &&
    comment.commentDateTime !== null;

  /**
   * Handles adding a new comment to the specified question or answer. The comment is first validated and then saved.
   * If the comment is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddCommentRequest object containing the comment data.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param type The type of the comment, either 'question' or 'answer'.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommentRoute = async (req: AddCommentRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const id = req.body.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    const { comment, type } = req.body;

    if (!isCommentValid(comment)) {
      res.status(400).send('Invalid comment body');
      return;
    }

    const banned = await isUserBanned(comment.commentBy);
    if (banned) {
      res.status(403).send('Your account has been banned');
      return;
    }

    const shadowBanned = await isUserShadowBanned(comment.commentBy);
    if (shadowBanned) {
      res
        .status(403)
        .send('You are not allowed to post since you did not adhere to community guidelines');
      return;
    }

    try {
      const { hasProfanity, censored } = await checkProfanity(comment.text);

      if (hasProfanity) {
        res.status(400).send(`Profanity detected in comment text: ${censored}`);
        return;
      }
      const comFromDb = await saveComment(comment);

      if ('error' in comFromDb) {
        throw new Error(comFromDb.error);
      }

      const status = await addComment(id, type, comFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error);
      }

      if (type === 'question') {
        await updateActivityHistoryWithQuestionID(
          comment.commentBy,
          id,
          'comment',
          comment.commentDateTime,
        );
      } else if (type === 'answer') {
        const gainedQID = await findQuestionIDByAnswerID(id);
        await updateActivityHistoryWithQuestionID(
          comment.commentBy,
          gainedQID as string,
          'comment',
          comment.commentDateTime,
        );
      }

      const populatedDoc = await populateDocument(id, type);

      if (populatedDoc && 'error' in populatedDoc) {
        throw new Error(populatedDoc.error);
      }

      socket.emit('commentUpdate', {
        result: populatedDoc,
        type,
      });
      res.json(comFromDb);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding comment: ${(err as Error).message}`);
    }
  };

  router.post('/addComment', addCommentRoute);

  return router;
};

export default commentController;
