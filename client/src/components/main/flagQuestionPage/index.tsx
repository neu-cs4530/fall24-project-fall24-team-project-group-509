import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * FlagQuestionPage component allows a user to flag a question for moderator review.
 * It allows a user to select a reason for flagging the question.
 * @returns
 */
const FlagQuestionPage = () => {
  const { qid } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [questionID, setQuestionID] = useState<string>('');

  const location = useLocation();
  const { qTitle, qText, allQuestionText } = location.state || {};

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
  };

  const submitFlaggedQuestion = (reason: string) => {
    console.log('Flag reason:', reason);
    console.log('Content type: Question');
    console.log('Question ID:', questionID);
    console.log('Username:', user.username);
    console.log('Question:', allQuestionText);
    // const res = await flagContent(questionID, 'question', selectedReason, user.username);
    // if (res && res._id) {
    // navigate('/home');
    // }
    // Perform the flagging action here (e.g., send the reason to the server)
  };

  //   const handleSubmit = (event: React.FormEvent) => {
  //     event.preventDefault();
  //     submitFlaggedQuestion();
  //   };

  return (
    <div>
      <h1>Flag Question</h1>
      <form>
        <div>
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
