import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { validateHyperlink } from '../tool';
import addAnswer from '../services/answerService';
import useUserContext from './useUserContext';
import { Answer } from '../types';

/**
 * Custom hook for managing the state and logic of an answer submission form.
 *
 * @returns text - the current text input for the answer.
 * @returns textErr - the error message related to the text input.
 * @returns setText - the function to update the answer text input.
 * @returns postAnswer - the function to submit the answer after validation.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to post an answer to a question.
   * It validates the answer text and posts the answer if it is valid.
   */
  const postAnswer = async () => {
    let isValid = true;

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    // Hyperlink validation
    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
      comments: [],
    };

    try {
      const res = await addAnswer(questionID, answer);

      if (res && res._id) {
        // navigate to the question that was answered
        navigate(`/question/${questionID}`);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 400) {
          setErrorMessage('Profanity detected');
        } else {
          setErrorMessage('An error occurred while posting the question');
        }
      } else {
        setErrorMessage('An error occurred while posting the question');
      }
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
    errorMessage,
  };
};

export default useAnswerForm;
