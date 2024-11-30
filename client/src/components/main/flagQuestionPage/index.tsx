import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import flagPost from '../../../services/flagService';
import './index.css';

/**
 * FlagQuestionPage component allows a user to flag a question for moderator review.
 * It allows a user to select a reason for flagging the question.
 * @returns
 */
const FlagQuestionPage = () => {
  const { qid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  const submitFlaggedQuestion = async (reason: string) => {
    const res = await flagPost(questionID, 'question', reason, user.username);
    if (res) {
      navigate('/home');
    }
  };

  return (
    <div>
      <h1>Flag Question</h1>
      <form>
        <div className='flag-buttons'>
          <button type='button' onClick={() => submitFlaggedQuestion('spam')}>
            Spam
          </button>
          <button type='button' onClick={() => submitFlaggedQuestion('offensive language')}>
            Offensive Language
          </button>
          <button type='button' onClick={() => submitFlaggedQuestion('irrelevant content')}>
            Irrelevant Content
          </button>
          <button type='button' onClick={() => submitFlaggedQuestion('other')}>
            Other
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlagQuestionPage;
