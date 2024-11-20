import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getMetaData } from '../../../tool';
import { Comment } from '../../../types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: Comment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({ comments, handleAddComment }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
  };

  /**
   * Determine if a comment is flagged and prepare its warning message.
   * @param comment - The comment to check
   * @returns An object with `hasPendingFlags` and `warningMessage`.
   */
  const getFlagStatus = (comment: Comment) => {
    // const hasPendingFlags = comment.flags?.some((flag) => flag.status === 'pending');
    // const warningMessage = hasPendingFlags
    //   ? 'Warning: This comment has been flagged for review.'
    //   : '';
    const hasPendingFlags = true;
    const warningMessage = 'Warning: This question has been flagged for review.';
    return { hasPendingFlags, warningMessage };
  };

  return (
    <div className='comment-section'>
      <button className='toggle-button' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className='comments-container'>
          <ul className='comments-list'>
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                const { hasPendingFlags, warningMessage } = getFlagStatus(comment);

                return (
                  <li
                    key={index}
                    className={`comment-item ${hasPendingFlags ? 'flagged-comment' : ''}`}>
                    {hasPendingFlags && (
                      <div className='warning-banner'>
                        <span className='warning-icon'>⚠️</span>
                        <span className='warning-text'>{warningMessage}</span>
                      </div>
                    )}
                    <p className='comment-text'>{comment.text}</p>
                    <small className='comment-meta'>
                      <Link to={`/user/${comment.commentBy}`}>{comment.commentBy}</Link>,{' '}
                      {getMetaData(new Date(comment.commentDateTime))}
                    </small>
                  </li>
                );
              })
            ) : (
              <p className='no-comments'>No comments yet.</p>
            )}
          </ul>

          <div className='add-comment'>
            <div className='input-row'>
              <textarea
                placeholder='Comment'
                value={text}
                onChange={e => setText(e.target.value)}
                className='comment-textarea'
              />
              <button className='add-comment-button' onClick={handleAddCommentClick}>
                Add Comment
              </button>
            </div>
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
