/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import flagPost from '../../../services/flagService';
import './index.css';

/**
 * FlagAnswerPage component allows a user to flag a question for moderator review.
 * It allows a user to select a reason for flagging the question.
 * @returns
 */
const FlagAnswerPage = () => {
  const { aid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [textErr, setTextErr] = useState<string>('');
  const [answerID, setAnswerID] = useState<string>('');

  const location = useLocation();
  const { answerText, answeredBy } = location.state || {};

  useEffect(() => {
    if (!aid) {
      setTextErr('Answer ID is missing.');
      navigate('/home');
      return;
    }

    setAnswerID(aid);
  }, [aid, navigate]);

  const submitFlaggedAnswer = async (reason: string) => {
    console.log('Flag reason:', reason);
    console.log('Content type: Answer');
    console.log('Answer ID:', answerID);
    console.log('Username:', answeredBy);
    console.log('FlagBy:', user.username);
    console.log('Answer:', answerText);
    const res = await flagPost(answerID, 'answer', reason, user.username);

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
  //     submitFlaggedAnswer();
  //   };

  return (
    <div>
      <h1>Flag Answer</h1>
      <form>
        <div className='flag-buttons'>
          <button type='button' onClick={() => submitFlaggedAnswer('spam')}>
            Spam
          </button>
          <button type='button' onClick={() => submitFlaggedAnswer('offensive language')}>
            Offensive Language
          </button>
          <button type='button' onClick={() => submitFlaggedAnswer('irrelevant content')}>
            Irrelevant Content
          </button>
          <button type='button' onClick={() => submitFlaggedAnswer('other')}>
            Other
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlagAnswerPage;
