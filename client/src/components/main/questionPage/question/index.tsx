import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { Question } from '../../../../types';
import BookmarkButton from '../../bookmarkButton';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  q: Question;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ q }: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: string) => {
    navigate(`/question/${questionID}`);
  };

  // Filter the flags to include only those with a status of 'pending'
  const pendingFlags = q.flags?.filter(flag => flag.status === 'pending') || [];

  // Determine the warning message based on the 'pending' flags
  const warningMessage =
    pendingFlags.length > 0
      ? `This question has been flagged for: ${pendingFlags.map(flag => flag.reason).join(', ')}`
      : '';

  return (
    <div className={`question-container ${warningMessage ? 'flagged-question' : ''}`}>
      {warningMessage && (
        <div className='warning-banner'>
          <span className='warning-icon'>⚠️</span>
          <span className='warning-text'>{warningMessage}</span>
        </div>
      )}
      <div
        className='question right_padding'
        onClick={() => {
          if (q._id) {
            handleAnswer(q._id);
          }
        }}>
        <div className='postStats'>
          <div>{q.answers.length || 0} answers</div>
          <div>{q.views.length} views</div>
        </div>
        <div className='question_mid'>
          <div className='postTitle'>{q.title}</div>
          <div className='question_tags'>
            {q.tags.map((tag, idx) => (
              <button
                key={idx}
                className='question_tag_button'
                onClick={e => {
                  e.stopPropagation();
                  clickTag(tag.name);
                }}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div className='lastActivity'>
          <div className='question_author'>{q.askedBy}</div>
          <div>&nbsp;</div>
          <div className='question_meta'>asked {getMetaData(new Date(q.askDateTime))}</div>
          {/* Bookmark button */}
          {q._id && (
            <div
              className='bookmark-icon-container'
              onClick={e => e.stopPropagation()} // Prevent navigation on icon click
            >
              <BookmarkButton questionId={q._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
