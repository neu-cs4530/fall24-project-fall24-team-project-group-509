import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import flagPost from '../../../services/flagService';

/**
 * FlagCommentPage component allows a user to flag a comment for moderator review.
 * It allows a user to select a reason for flagging the comment.
 * @returns
 */
const FlagCommentPage = () => {
  const { cid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [commentID, setCommentID] = useState<string>('');

  const location = useLocation();
  const { commentText, commentBy } = location.state || {};

  useEffect(() => {
    if (!cid) {
      setTextErr('Comment ID is missing.');
      navigate('/home');
      return;
    }

    setCommentID(cid);
  }, [cid, navigate]);

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
  };

  const submitFlaggedComment = async (reason: string) => {
    console.log('Flag reason:', reason);
    console.log('Content type: comment');
    console.log('Comment ID:', cid);
    console.log('CulpritUsername:', commentBy);
    console.log('FlagBy:', user.username);
    console.log('Comment:', commentText);
    const res = await flagPost(commentID, 'comment', reason, user.username);

    if (res) {
      navigate('/home');
      console.log('done');
    }

    // const res = await flagContent(questionID, 'question', selectedReason, user.username);
    // if (res && res._id) {
    // navigate('/home');
    // }
    // Perform the flagging action here (e.g., send the reason to the server)
  };

  //   const handleSubmit = (event: React.FormEvent) => {
  //     event.preventDefault();
  //     submitFlaggedComment();
  //   };

  return (
    <div>
      <h1>Flag Question</h1>
      <form>
        <div>
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
