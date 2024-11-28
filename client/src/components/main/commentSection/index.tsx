import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { FaFlag } from 'react-icons/fa';
import { getMetaData } from '../../../tool';
import { Comment, Flag } from '../../../types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 * - commentErr - error message for the comment section if profanity is detected
 */
interface CommentSectionProps {
  comments: Comment[];
  handleAddComment: (comment: Comment) => void;
  handleFlagComment: (cid: string, cText: string, commentBy: string) => void;
  flags?: Flag[];
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({
  comments,
  flags = [],
  handleAddComment,
  handleFlagComment,
}: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = async () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    // handleAddComment(newComment);
    // setText('');
    // setTextErr('');

    try {
      await handleAddComment(newComment);
      setText('');
      setTextErr('');
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (
          err.response.data ===
          'You are not allowed to post since you did not adhere to community guidelines'
        ) {
          setTextErr(
            'You are not allowed to post since you did not adhere to community guidelines',
          );
        } else if (err.response.data.includes('Profanity detected in comment')) {
          setTextErr('Profanity detected');
        } else {
          setTextErr('An error occurred while posting the comment');
        }
      } else {
        setTextErr('An unknown error occurred');
      }
    }
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
                // Determine the warning message for each individual comment with 'pending' flags only
                const pendingFlags = comment.flags?.filter(flag => flag.status === 'pending') || [];
                // Determine the warning message for each individual comment
                const warningMessage =
                  pendingFlags && pendingFlags.length > 0
                    ? `This comment has been flagged for: ${pendingFlags
                        .map(flag => flag.reason)
                        .join(', ')}`
                    : null;

                return (
                  <li
                    key={index}
                    className={`comment-item ${warningMessage ? 'flagged-comment' : ''}`}>
                    {/* Warning banner for flagged comments */}
                    {warningMessage && (
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                      }}>
                      <FaFlag
                        onClick={() => {
                          handleFlagComment(comment._id as string, comment.text, comment.commentBy);
                        }}
                        style={{
                          cursor: 'pointer',
                          color: '#007bff', // Matching color of other buttons
                          fontSize: '24px', // Adjust the size as needed
                          marginRight: '20px',
                        }}
                      />
                    </div>
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
