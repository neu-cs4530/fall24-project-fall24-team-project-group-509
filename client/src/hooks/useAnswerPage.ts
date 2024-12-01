/* eslint-disable no-console */
import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Comment, Answer, Question, VoteData } from '../types';
import useUserContext from './useUserContext';
import addComment from '../services/commentService';
import { getQuestionById } from '../services/questionService';

/**
 * Custom hook for managing the answer page's state, navigation, and real-time updates.
 *
 * @returns questionID - The current question ID retrieved from the URL parameters.
 * @returns question - The current question object with its answers, comments, and votes.
 * @returns handleNewComment - Function to handle the submission of a new comment to a question or answer.
 * @returns handleNewAnswer - Function to navigate to the "New Answer" page
 */
const useAnswerPage = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user, socket } = useUserContext();
  const [questionID, setQuestionID] = useState<string>(qid || '');
  const [question, setQuestion] = useState<Question | null>(null);

  /**
   * Filters out a question's flagged content based on the user's username.
   * @param q - The question object to be filtered
   * @returns - The question object with flagged content filtered out
   */
  const filterFlaggedContentOfQuestion = useCallback(
    (q: Question) => {
      const filteredQuestion: Question = {
        ...q,
        answers: (q.answers as Answer[]).map(answer => ({
          ...answer,
          comments: answer.comments.filter(comment => {
            if (!comment.flags) return true;
            const commentFlaggedByUser = comment.flags.some(
              flag => flag.flaggedBy === user.username,
            );
            return !commentFlaggedByUser;
          }),
        })),
        comments: q.comments.filter(comment => {
          if (!comment.flags) return true;
          const commentFlaggedByUser = comment.flags.some(flag => flag.flaggedBy === user.username);
          return !commentFlaggedByUser;
        }),
      };

      // Filter out flagged answers by the user
      filteredQuestion.answers = filteredQuestion.answers.filter(answer => {
        if (!answer.flags) return true;
        const answerFlaggedByUser = answer.flags.some(flag => flag.flaggedBy === user.username);
        return !answerFlaggedByUser;
      });

      return filteredQuestion;
    },
    [user.username],
  );

  /**
   * Function to handle navigation to the "New Answer" page.
   */
  const handleNewAnswer = () => {
    navigate(`/new/answer/${questionID}`);
  };

  /**
   * Function to handle navigation to the "Flag Question" page.
   * qTitle and qText are the title and text of the question to be flagged.
   */
  const handleFlagQuestion = (qTitle: string, qText: string, askedBy: string) => {
    console.log('Flagging question:', qTitle, qText);
    const allQuestionText = `${qTitle}\n${qText}`;
    navigate(`/flag/question/${questionID}`, { state: { allQuestionText, askedBy } });
  };

  /**
   * Function to handle navigation to the Flag Answer page.
   * @param aid the answer id
   * @param aText the text of the answer
   */
  const handleFlagAnswer = (aid: string, aText: string, answeredBy: string) => {
    console.log('Flagging answer:', aText);
    navigate(`/flag/answer/${aid}`, { state: { answerText: aText, answeredBy } });
  };

  const handleFlagComment = (cid: string, cText: string, commentBy: string) => {
    console.log('Flagging comment:', cText);
    navigate(`/flag/comment/${cid}`, { state: { commentText: cText, commentBy } });
  };

  useEffect(() => {
    if (!qid) {
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to handle the submission of a new comment to a question or answer.
   *
   * @param comment - The comment object to be added.
   * @param targetType - The type of target being commented on, either 'question' or 'answer'.
   * @param targetId - The ID of the target being commented on.
   */
  const handleNewComment = async (
    comment: Comment,
    targetType: 'question' | 'answer',
    targetId: string | undefined,
  ) => {
    if (targetId === undefined) {
      return;
    }
    await addComment(targetId, targetType, comment);
  };

  useEffect(() => {
    /**
     * Function to fetch the question data based on the question ID.
     */
    const fetchData = async () => {
      try {
        const res = await getQuestionById(questionID, user.username);
        if (res) {
          const filteredQuestion = filterFlaggedContentOfQuestion(res);
          setQuestion(filteredQuestion);
        } else {
          setQuestion(res || null);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching question:', error);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(e => console.log(e));
  }, [filterFlaggedContentOfQuestion, questionID, user.username]);

  useEffect(() => {
    /**
     * Function to handle updates to the answers of a question.
     *
     * @param answer - The updated answer object.
     */
    const handleAnswerUpdate = ({ qid: id, answer }: { qid: string; answer: Answer }) => {
      if (id === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? { ...prevQuestion, answers: [...prevQuestion.answers, answer] }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the comments of a question or answer.
     *
     * @param result - The updated question or answer object.
     * @param type - The type of the object being updated, either 'question' or 'answer'.
     */
    const handleCommentUpdate = ({
      result,
      type,
    }: {
      result: Question | Answer;
      type: 'question' | 'answer';
    }) => {
      if (type === 'question') {
        const questionResult = result as Question;

        if (questionResult._id === questionID) {
          const filteredQuestion = filterFlaggedContentOfQuestion(questionResult);

          setQuestion(filteredQuestion);
        }
      } else if (type === 'answer') {
        const filteredAnswers: Answer = {
          ...(result as Answer),
          comments: result.comments.filter(comment => {
            if (!comment.flags) return true;
            const commentFlaggedByUser = comment.flags.some(
              flag => flag.flaggedBy === user.username,
            );
            return !commentFlaggedByUser;
          }),
        };
        setQuestion(prevQuestion =>
          prevQuestion
            ? // Updates answers with a matching object ID, and creates a new Question object
              {
                ...prevQuestion,
                answers: prevQuestion.answers.map(a =>
                  a._id === result._id ? filteredAnswers : a,
                ),
              }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the views of a question.
     *
     * @param q The updated question object.
     */
    const handleViewsUpdate = (q: Question) => {
      if (q._id === questionID) {
        const filteredQuestion = filterFlaggedContentOfQuestion(q);
        setQuestion(filteredQuestion);
      }
    };

    /**
     * Function to handle vote updates for a question.
     *
     * @param voteData - The updated vote data for a question
     */
    const handleVoteUpdate = (voteData: VoteData) => {
      if (voteData.qid === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? {
                ...prevQuestion,
                upVotes: [...voteData.upVotes],
                downVotes: [...voteData.downVotes],
              }
            : prevQuestion,
        );
      }
    };

    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('voteUpdate', handleVoteUpdate);

    return () => {
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('voteUpdate', handleVoteUpdate);
    };
  }, [filterFlaggedContentOfQuestion, questionID, socket, user.username]);

  useEffect(() => {
    const handleFlagNotification = (payload: { postId: string; postType: string }) => {
      if (payload.postType === 'question' && payload.postId === questionID) {
        navigate('/home');
      } else {
        setQuestion(prev => {
          if (!prev) return null;
          const updatedAnswers = prev.answers.filter(a => a._id !== payload.postId);
          const updatedComments = prev.comments.filter(c => c._id !== payload.postId);
          return { ...prev, answers: updatedAnswers, comments: updatedComments };
        });
      }
    };

    const handleDeletePostNotification = (payload: { postId: string; postType: string }) => {
      if (payload.postType === 'question' && payload.postId === questionID) {
        navigate('/home');
      } else {
        setQuestion(prev => {
          if (!prev) return null;
          const updatedAnswers = prev.answers.filter(a => a._id !== payload.postId);
          const updatedComments = prev.comments.filter(c => c._id !== payload.postId);
          return { ...prev, answers: updatedAnswers, comments: updatedComments };
        });
      }
    };

    socket.on('flagNotification', handleFlagNotification);
    socket.on('deletePostNotification', handleDeletePostNotification);

    return () => {
      socket.off('flagNotification', handleFlagNotification);
      socket.off('deletePostNotification', handleDeletePostNotification);
    };
  }, [questionID, socket, navigate]);

  return {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleFlagQuestion,
    handleFlagAnswer,
    handleFlagComment,
  };
};

export default useAnswerPage;
