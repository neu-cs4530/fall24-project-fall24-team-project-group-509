import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import flagPost from '../../../services/flagService';
import './index.css';

/**
 * FlagCommentPage component allows a user to flag a comment for moderator review.
 * It allows a user to select a reason for flagging the comment.
 * @returns
 */
const FlagCommentPage = () => {
  const { cid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [textErr, setTextErr] = useState<string>('');
  const [commentID, setCommentID] = useState<string>('');

  useEffect(() => {
    if (!cid) {
      setTextErr('Comment ID is missing.');
      navigate('/home');
      return;
    }

    setCommentID(cid);
  }, [cid, navigate]);

  const submitFlaggedComment = async (reason: string) => {
    const res = await flagPost(commentID, 'comment', reason, user.username);

    if (res) {
      navigate('/home');
    }
  };

  return (
    <div>
      <h1>Flag Comment</h1>
      <form>
        <div className='flag-buttons'>
          <button type='button' onClick={() => submitFlaggedComment('spam')}>
            Spam
          </button>
          <button type='button' onClick={() => submitFlaggedComment('offensive language')}>
            Offensive Language
          </button>
          <button type='button' onClick={() => submitFlaggedComment('irrelevant content')}>
            Irrelevant Content
          </button>
          <button type='button' onClick={() => submitFlaggedComment('other')}>
            Other
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlagCommentPage;
