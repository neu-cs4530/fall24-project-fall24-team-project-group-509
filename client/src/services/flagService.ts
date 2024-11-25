import { Answer, Question } from '../types';
import api from './config';

const FLAG_API_URL = `${process.env.REACT_APP_SERVER_URL}/flag`;

/**
 * Function to flag a post and send it to the backend.
 * @param id - The ID of the post to flag. This can be a question, answer, or comment id.
 * @param type - The type of the post to flag. This can be 'question', 'answer', or 'comment'.
 * @param reason - The reason for flagging the post. This can be 'spam', 'offensive language', 'irrelevant content', or 'other'.
 * @param flaggedBy - The username of the person flagging the post.
 */
const flagPost = async (
  id: string,
  type: string,
  reason: string,
  flaggedBy: string,
): Promise<Question | Answer | Comment> => {
  const res = await api.post(`${FLAG_API_URL}/flagPost`, { id, type, reason, flaggedBy });

  if (res.status !== 200) {
    throw new Error('Error while flagging post');
  }

  return res.data;
};

export default flagPost;
