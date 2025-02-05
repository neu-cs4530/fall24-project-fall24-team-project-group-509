import React from 'react';
import { FaFlag } from 'react-icons/fa';
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
        }}>
        <FaFlag
          onClick={() => {
            handleFlagQuestion(question.title, question.text, question.askedBy);
          }}
          style={{
            cursor: 'pointer',
            color: '#007bff', // Matching color of other buttons
            fontSize: '24px', // Adjust the size as needed
            marginRight: '80px',
          }}
        />
      </div>
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
      />
      <CommentSection
        comments={question.comments}
        flags={question.flags || []}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        handleFlagComment={handleFlagComment}
      />
      <div className='answer_list'>
        {question.answers.map((a, idx) => (
          <div key={idx} className='answer_item'>
            <AnswerView
              _id={a._id as string}
              text={a.text}
              ansBy={a.ansBy}
              meta={getMetaData(new Date(a.ansDateTime))}
              comments={a.comments}
              flags={a.flags}
              handleAddComment={(comment: Comment) => handleNewComment(comment, 'answer', a._id)}
              handleFlagAnswer={handleFlagAnswer}
              handleFlagComment={handleFlagComment}
            />
          </div>
        ))}
      </div>
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
