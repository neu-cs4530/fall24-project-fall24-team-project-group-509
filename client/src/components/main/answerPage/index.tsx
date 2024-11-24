import React from 'react';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleFlagQuestion,
    handleFlagAnswer,
    handleFlagComment,
  } = useAnswerPage();

  if (!question) {
    return null;
  }

  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader ansCount={question.answers.length} title={question.title} />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
      />
      <CommentSection
        comments={question.comments}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        handleFlagComment={handleFlagComment}
      />
      {question.answers.map((a, idx) => (
        <AnswerView
          key={idx}
          _id={a._id as string}
          text={a.text}
          ansBy={a.ansBy}
          meta={getMetaData(new Date(a.ansDateTime))}
          comments={a.comments}
          handleAddComment={(comment: Comment) => handleNewComment(comment, 'answer', a._id)}
          handleFlagAnswer={handleFlagAnswer}
          handleFlagComment={handleFlagComment}
        />
      ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
      <button
        className='bluebtn FlagQuestionButton'
        onClick={() => {
          handleFlagQuestion(question.title, question.text, question.askedBy);
        }}>
        Flag Question
      </button>
    </>
  );
};

export default AnswerPage;
