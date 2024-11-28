import React from 'react';
import { Link } from 'react-router-dom';
import { FaFlag } from 'react-icons/fa';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, Flag } from '../../../../types';

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
  _id: string;
  text: string;
  ansBy: string;
  meta: string;
  comments: Comment[];
  flags?: Flag[];
  handleAddComment: (comment: Comment) => void;
  handleFlagAnswer: (aid: string, aText: string, answeredBy: string) => void;
  handleFlagComment: (cid: string, cText: string, commentedBy: string) => void;
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
const AnswerView = ({
  _id,
  text,
  ansBy,
  meta,
  comments,
  flags = [],
  handleAddComment,
  handleFlagAnswer,
  handleFlagComment,
}: AnswerProps) => {
  // Filter the flags to include only those with a status of 'pending'
  const pendingFlags = flags.filter(flag => flag.status === 'pending');
  // Determine the warning message based on the flags
  const warningMessage =
    pendingFlags.length > 0 ? `This answer has been flagged for: ${flags[0].reason}` : '';

  return (
    <div className={`answer-container ${warningMessage ? 'flagged-answer' : ''}`}>
      {warningMessage && (
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
          }}>
          <FaFlag
            onClick={() => {
              handleFlagAnswer(_id, text, ansBy);
            }}
            style={{
              cursor: 'pointer',
              color: '#007bff', // Matching color of other buttons
              fontSize: '24px', // Adjust the size as needed
              marginRight: '20px',
            }}
          />
        </div>
        <CommentSection
          comments={comments}
          handleAddComment={handleAddComment}
          handleFlagComment={handleFlagComment}
        />
      </div>
    </div>
  );
};

export default AnswerView;
