import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * FlagAnswerPage component allows a user to flag a question for moderator review.
 * It allows a user to select a reason for flagging the question.
 * @returns
 */
const FlagAnswerPage = () => {
  const { aid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
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

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
  };

  const submitFlaggedAnswer = (reason: string) => {
    console.log('Flag reason:', reason);
    console.log('Content type: Answer');
    console.log('Answer ID:', aid);
    console.log('Username:', answeredBy);
    console.log('FlagBy:', user.username);
    console.log('Answer:', answerText);
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
      <h1>Flag Question</h1>
      <form>
        <div>
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
