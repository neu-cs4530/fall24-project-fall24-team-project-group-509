import React from 'react';
import { Link } from 'react-router-dom';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment } from '../../../../types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: Comment[];
  handleAddComment: (comment: Comment) => void;
  flags?: { status: string }[]; // Optional flags property
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({ text, ansBy, meta, comments, flags, handleAddComment }: AnswerProps) => {
  /**
   * Determine if the answer is flagged and prepare its warning message.
   * @returns An object with `hasPendingFlags` and `warningMessage`.
   */
  const getFlagStatus = () => {
    // const hasPendingFlags = flags?.some(flag => flag.status === 'pending');
    // const warningMessage = hasPendingFlags
    //   ? 'Warning: This answer has been flagged for review.'
    //   : '';
    // THIS IS FOR TEST PURPOSES ONLY
    const hasPendingFlags = true;
    const warningMessage = 'Warning: This answer has been flagged for review.';
    return { hasPendingFlags, warningMessage };
  };

  const { hasPendingFlags, warningMessage } = getFlagStatus();

  return (
    <div className={`answer-container ${hasPendingFlags ? 'flagged-answer' : ''}`}>
      {hasPendingFlags && (
        <div className='warning-banner'>
          <span className='warning-icon'>⚠️</span>
          <span className='warning-text'>{warningMessage}</span>
        </div>
      )}
      <div className='answer right_padding'>
        <div id='answerText' className='answerText'>
          {handleHyperlink(text)}
        </div>
        <div className='answerAuthor'>
          <div className='answer_author'>
            <Link to={`/user/${ansBy}`}>{ansBy}</Link>
          </div>
          <div className='answer_question_meta'>{meta}</div>
        </div>
        <CommentSection comments={comments} handleAddComment={handleAddComment} />
      </div>
    </div>
  );
};

export default AnswerView;
