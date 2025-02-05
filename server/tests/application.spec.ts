import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Tags from '../models/tags';
import QuestionModel from '../models/questions';
import {
  addTag,
  getQuestionsByOrder,
  filterQuestionsByAskedBy,
  filterQuestionsBySearch,
  fetchAndIncrementQuestionViewsById,
  saveQuestion,
  processTags,
  saveAnswer,
  addAnswerToQuestion,
  getTagCountMap,
  saveComment,
  addComment,
  addVoteToQuestion,
  saveUser,
  getUserByUsername,
  addUserBio,
  createBookmarkCollection,
  removeQuestionFromBookmarkCollection,
  getUserBookmarkCollections,
  followBookmarkCollection,
  unfollowBookmarkCollection,
  getFollowedBookmarkCollections,
  getBookmarkCollectionById,
  banUser,
  unbanUser,
  shadowBanUser,
  unshadowBanUser,
  isUserBanned,
  isUserShadowBanned,
  getPendingFlags,
  getFlaggedPosts,
  markFlagAsReviewed,
  deletePost,
  getFlag,
  populateDocument,
  getUserFollowUpdateNotifications,
  findQuestionIDByAnswerID,
  flagPost,
  addQuestionToBookmarkCollection,
  removePostFromAllCollections,
  removePostFromActivityHistory,
  removePostFromUserCollections,
  removePostFromUserActivityHistory,
} from '../models/application';
import { Answer, Question, Tag, Comment, User, BookmarkCollection, FlagReason } from '../types';
import { T1_DESC, T2_DESC, T3_DESC } from '../data/posts_strings';
import AnswerModel from '../models/answers';
import UserModel from '../models/user';
import BookmarkCollectionModel from '../models/bookmarkCollections';
import FlagModel from '../models/flag';
import CommentModel from '../models/comments';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const tag1: Tag = {
  _id: new ObjectId('507f191e810c19729de860ea'),
  name: 'react',
  description: T1_DESC,
};

const tag2: Tag = {
  _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  name: 'javascript',
  description: T2_DESC,
};

const tag3: Tag = {
  _id: new ObjectId('65e9b4b1766fca9451cba653'),
  name: 'android',
  description: T3_DESC,
};

const com1: Comment = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'com1',
  commentBy: 'com_by1',
  commentDateTime: new Date('2023-11-18T09:25:00'),
};

const ans1: Answer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'ans1',
  ansBy: 'ansBy1',
  ansDateTime: new Date('2023-11-18T09:24:00'),
  comments: [],
};

const ans2: Answer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'ans2',
  ansBy: 'ansBy2',
  ansDateTime: new Date('2023-11-20T09:24:00'),
  comments: [],
};

const ans3: Answer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'ans3',
  ansBy: 'ansBy3',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

const ans4: Answer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'ans4',
  ansBy: 'ansBy4',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

const QUESTIONS: Question[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3, tag2],
    answers: [ans1, ans2],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [ans1, ans2, ans3],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

const user1: User = {
  username: 'marcus',
  bio: 'I am a software developer',
  profilePictureURL: 'cats',
  password: '',
};
const user2: User = {
  username: 'petersmith',
  bio: '',
  profilePictureURL: '',
  password: '',
};
const user3: User = {
  username: 'john_doe',
  bio: 'I like turtles',
  profilePictureURL: '',
  password: '',
};
const user4: User = {
  username: 'jane_doe',
  bio: '',
  profilePictureURL: '',
  password: '',
};

describe('application module', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });
  describe('Question model', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    describe('filterQuestionsBySearch', () => {
      test('filter questions with empty search string should return all questions', () => {
        const result = filterQuestionsBySearch(QUESTIONS, '');

        expect(result.length).toEqual(QUESTIONS.length);
      });

      test('filter questions with empty list of questions should return empty list', () => {
        const result = filterQuestionsBySearch([], 'react');

        expect(result.length).toEqual(0);
      });

      test('filter questions with empty questions and empty string should return empty list', () => {
        const result = filterQuestionsBySearch([], '');

        expect(result.length).toEqual(0);
      });

      test('filter question by one tag', () => {
        const result = filterQuestionsBySearch(QUESTIONS, '[android]');

        expect(result.length).toEqual(1);
        expect(result[0]._id?.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      });

      test('filter question by multiple tags', () => {
        const result = filterQuestionsBySearch(QUESTIONS, '[android] [react]');

        expect(result.length).toEqual(2);
        expect(result[0]._id?.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
        expect(result[1]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
      });

      test('filter question by one user', () => {
        const result = filterQuestionsByAskedBy(QUESTIONS, 'q_by4');

        expect(result.length).toEqual(1);
        expect(result[0]._id?.toString()).toEqual('65e9b716ff0e892116b2de09');
      });

      test('filter question by tag and then by user', () => {
        let result = filterQuestionsBySearch(QUESTIONS, '[javascript]');
        result = filterQuestionsByAskedBy(result, 'q_by2');

        expect(result.length).toEqual(1);
        expect(result[0]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
      });

      test('filter question by one keyword', () => {
        const result = filterQuestionsBySearch(QUESTIONS, 'website');

        expect(result.length).toEqual(1);
        expect(result[0]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
      });

      test('filter question by tag and keyword', () => {
        const result = filterQuestionsBySearch(QUESTIONS, 'website [android]');

        expect(result.length).toEqual(2);
        expect(result[0]._id?.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
        expect(result[1]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
      });
    });

    describe('getQuestionsByOrder', () => {
      test('get active questions, newest questions sorted by most recently answered 1', async () => {
        mockingoose(QuestionModel).toReturn(QUESTIONS.slice(0, 3), 'find');
        QuestionModel.schema.path('answers', Object);
        QuestionModel.schema.path('tags', Object);

        const result = await getQuestionsByOrder('active', user3.username);

        expect(result.length).toEqual(3);
        expect(result[0]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
        expect(result[1]._id?.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
        expect(result[2]._id?.toString()).toEqual('65e9b9b44c052f0a08ecade0');
      });

      test('get active questions, newest questions sorted by most recently answered 2', async () => {
        const questions = [
          {
            _id: '65e9b716ff0e892116b2de01',
            answers: [ans1, ans3], // 18, 19 => 19
            askDateTime: new Date('2023-11-20T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de02',
            answers: [ans1, ans2, ans3, ans4], // 18, 20, 19, 19 => 20
            askDateTime: new Date('2023-11-20T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de03',
            answers: [ans1], // 18 => 18
            askDateTime: new Date('2023-11-19T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de04',
            answers: [ans4], // 19 => 19
            askDateTime: new Date('2023-11-21T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de05',
            answers: [],
            askDateTime: new Date('2023-11-19T10:24:00'),
          },
        ];
        mockingoose(QuestionModel).toReturn(questions, 'find');
        QuestionModel.schema.path('answers', Object);
        QuestionModel.schema.path('tags', Object);

        const result = await getQuestionsByOrder('active', user1.username);

        expect(result.length).toEqual(5);
        expect(result[0]._id?.toString()).toEqual('65e9b716ff0e892116b2de02');
        expect(result[1]._id?.toString()).toEqual('65e9b716ff0e892116b2de04');
        expect(result[2]._id?.toString()).toEqual('65e9b716ff0e892116b2de01');
        expect(result[3]._id?.toString()).toEqual('65e9b716ff0e892116b2de03');
        expect(result[4]._id?.toString()).toEqual('65e9b716ff0e892116b2de05');
      });

      test('get newest unanswered questions', async () => {
        mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');

        const result = await getQuestionsByOrder('unanswered', user1.username);

        expect(result.length).toEqual(2);
        expect(result[0]._id?.toString()).toEqual('65e9b716ff0e892116b2de09');
        expect(result[1]._id?.toString()).toEqual('65e9b9b44c052f0a08ecade0');
      });

      test('get newest questions', async () => {
        const questions = [
          {
            _id: '65e9b716ff0e892116b2de01',
            askDateTime: new Date('2023-11-20T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de04',
            askDateTime: new Date('2023-11-21T09:24:00'),
          },
          {
            _id: '65e9b716ff0e892116b2de05',
            askDateTime: new Date('2023-11-19T10:24:00'),
          },
        ];
        mockingoose(QuestionModel).toReturn(questions, 'find');

        const result = await getQuestionsByOrder('newest', user1.username);

        expect(result.length).toEqual(3);
        expect(result[0]._id?.toString()).toEqual('65e9b716ff0e892116b2de04');
        expect(result[1]._id?.toString()).toEqual('65e9b716ff0e892116b2de01');
        expect(result[2]._id?.toString()).toEqual('65e9b716ff0e892116b2de05');
      });

      test('get newest most viewed questions', async () => {
        mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');

        const result = await getQuestionsByOrder('mostViewed', user4.username);

        expect(result.length).toEqual(4);
        expect(result[0]._id?.toString()).toEqual('65e9b9b44c052f0a08ecade0');
        expect(result[1]._id?.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
        expect(result[2]._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
        expect(result[3]._id?.toString()).toEqual('65e9b716ff0e892116b2de09');
      });

      test('getQuestionsByOrder should return empty list if find throws an error', async () => {
        mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

        const result = await getQuestionsByOrder('newest', user1.username);

        expect(result.length).toEqual(0);
      });

      test('getQuestionsByOrder should return empty list if find returns null', async () => {
        mockingoose(QuestionModel).toReturn(null, 'find');

        const result = await getQuestionsByOrder('newest', user2.username);

        expect(result.length).toEqual(0);
      });
    });

    describe('fetchAndIncrementQuestionViewsById', () => {
      test('fetchAndIncrementQuestionViewsById should return question and add the user to the list of views if new', async () => {
        const question = QUESTIONS.filter(
          q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
        )[0];
        mockingoose(QuestionModel).toReturn(
          { ...question, views: ['question1_user', ...question.views] },
          'findOneAndUpdate',
        );
        QuestionModel.schema.path('answers', Object);

        const result = (await fetchAndIncrementQuestionViewsById(
          '65e9b5a995b6c7045a30d823',
          'question1_user',
        )) as Question;

        expect(result.views.length).toEqual(2);
        expect(result.views).toEqual(['question1_user', 'question2_user']);
        expect(result._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
        expect(result.title).toEqual(question.title);
        expect(result.text).toEqual(question.text);
        expect(result.answers).toEqual(question.answers);
        expect(result.askDateTime).toEqual(question.askDateTime);
      });

      test('fetchAndIncrementQuestionViewsById should return question and not add the user to the list of views if already viewed by them', async () => {
        const question = QUESTIONS.filter(
          q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
        )[0];
        mockingoose(QuestionModel).toReturn(question, 'findOneAndUpdate');
        QuestionModel.schema.path('answers', Object);

        const result = (await fetchAndIncrementQuestionViewsById(
          '65e9b5a995b6c7045a30d823',
          'question2_user',
        )) as Question;

        expect(result.views.length).toEqual(1);
        expect(result.views).toEqual(['question2_user']);
        expect(result._id?.toString()).toEqual('65e9b5a995b6c7045a30d823');
        expect(result.title).toEqual(question.title);
        expect(result.text).toEqual(question.text);
        expect(result.answers).toEqual(question.answers);
        expect(result.askDateTime).toEqual(question.askDateTime);
      });

      test('fetchAndIncrementQuestionViewsById should return null if id does not exist', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

        const result = await fetchAndIncrementQuestionViewsById(
          '65e9b716ff0e892116b2de01',
          'question1_user',
        );

        expect(result).toBeNull();
      });

      test('fetchAndIncrementQuestionViewsById should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = (await fetchAndIncrementQuestionViewsById(
          '65e9b716ff0e892116b2de01',
          'question2_user',
        )) as {
          error: string;
        };

        expect(result.error).toEqual('Error when fetching and updating a question');
      });
    });

    describe('saveQuestion', () => {
      test('saveQuestion should return the saved question', async () => {
        const mockQn = {
          title: 'New Question Title',
          text: 'New Question Text',
          tags: [tag1, tag2],
          askedBy: 'question3_user',
          askDateTime: new Date('2024-06-06'),
          answers: [],
          views: [],
          upVotes: [],
          downVotes: [],
          comments: [],
        };

        const result = (await saveQuestion(mockQn)) as Question;

        expect(result._id).toBeDefined();
        expect(result.title).toEqual(mockQn.title);
        expect(result.text).toEqual(mockQn.text);
        expect(result.tags[0]._id?.toString()).toEqual(tag1._id?.toString());
        expect(result.tags[1]._id?.toString()).toEqual(tag2._id?.toString());
        expect(result.askedBy).toEqual(mockQn.askedBy);
        expect(result.askDateTime).toEqual(mockQn.askDateTime);
        expect(result.views).toEqual([]);
        expect(result.answers.length).toEqual(0);
      });

      test('saveQuestion with missing required fields should throw an error', async () => {
        const invalidQuestion = {
          title: 'New Question Title',
          // Missing 'text', 'tags', and other fields
        };

        try {
          await saveQuestion(invalidQuestion as Question);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(Error);
          if (err instanceof Error) expect(err.message).toBe('Invalid question data');
        }
      });
    });

    describe('populateDocument', () => {
      beforeEach(() => {
        mockingoose.resetAll();
      });

      test('should return an error if ID is undefined', async () => {
        const result = await populateDocument(undefined, 'question');

        expect(result).toEqual({
          error:
            'Error when fetching and populating a document: Provided question ID is undefined.',
        });
      });

      test('should return an error if question is not found', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findOne');

        const result = await populateDocument('507f191e810c19729de860ea', 'question');

        expect(result).toEqual({
          error:
            'Error when fetching and populating a document: Failed to fetch and populate a question',
        });
      });

      test('should return an error if answer is not found', async () => {
        mockingoose(AnswerModel).toReturn(null, 'findOne');

        const result = await populateDocument('507f191e810c19729de860eb', 'answer');

        expect(result).toEqual({
          error:
            'Error when fetching and populating a document: Failed to fetch and populate a answer',
        });
      });

      test('should return an error if an exception occurs during fetching', async () => {
        mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOne');

        const result = await populateDocument('507f191e810c19729de860ea', 'question');

        expect(result).toEqual({
          error: 'Error when fetching and populating a document: Database error',
        });
      });
    });

    describe('addVoteToQuestion', () => {
      test('addVoteToQuestion should upvote a question', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: [],
          downVotes: [],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: ['testUser'], downVotes: [] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

        expect(result).toEqual({
          msg: 'Question upvoted successfully',
          upVotes: ['testUser'],
          downVotes: [],
        });
      });

      test('If a downvoter upvotes, add them to upvotes and remove them from downvotes', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: [],
          downVotes: ['testUser'],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: ['testUser'], downVotes: [] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

        expect(result).toEqual({
          msg: 'Question upvoted successfully',
          upVotes: ['testUser'],
          downVotes: [],
        });
      });

      test('should cancel the upvote if already upvoted', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: ['testUser'],
          downVotes: [],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: [], downVotes: [] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

        expect(result).toEqual({
          msg: 'Upvote cancelled successfully',
          upVotes: [],
          downVotes: [],
        });
      });

      test('addVoteToQuestion should return an error if the question is not found', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findById');

        const result = await addVoteToQuestion('nonExistentId', 'testUser', 'upvote');

        expect(result).toEqual({ error: 'Question not found!' });
      });

      test('addVoteToQuestion should return an error when there is an issue with adding an upvote', async () => {
        mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

        expect(result).toEqual({ error: 'Error when adding upvote to question' });
      });

      test('addVoteToQuestion should downvote a question', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: [],
          downVotes: [],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: [], downVotes: ['testUser'] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

        expect(result).toEqual({
          msg: 'Question downvoted successfully',
          upVotes: [],
          downVotes: ['testUser'],
        });
      });

      test('If an upvoter downvotes, add them to downvotes and remove them from upvotes', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: ['testUser'],
          downVotes: [],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: [], downVotes: ['testUser'] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

        expect(result).toEqual({
          msg: 'Question downvoted successfully',
          upVotes: [],
          downVotes: ['testUser'],
        });
      });

      test('should cancel the downvote if already downvoted', async () => {
        const mockQuestion = {
          _id: 'someQuestionId',
          upVotes: [],
          downVotes: ['testUser'],
        };

        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, upVotes: [], downVotes: [] },
          'findOneAndUpdate',
        );

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

        expect(result).toEqual({
          msg: 'Downvote cancelled successfully',
          upVotes: [],
          downVotes: [],
        });
      });

      test('addVoteToQuestion should return an error if the question is not found', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findById');

        const result = await addVoteToQuestion('nonExistentId', 'testUser', 'downvote');

        expect(result).toEqual({ error: 'Question not found!' });
      });

      test('addVoteToQuestion should return an error when there is an issue with adding a downvote', async () => {
        mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

        expect(result).toEqual({ error: 'Error when adding downvote to question' });
      });
    });
  });

  describe('Answer model', () => {
    describe('saveAnswer', () => {
      test('saveAnswer should return the saved answer', async () => {
        const mockAnswer = {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-06'),
          comments: [],
        };

        const result = (await saveAnswer(mockAnswer)) as Answer;

        expect(result._id).toBeDefined();
        expect(result.text).toEqual(mockAnswer.text);
        expect(result.ansBy).toEqual(mockAnswer.ansBy);
        expect(result.ansDateTime).toEqual(mockAnswer.ansDateTime);
      });
    });

    describe('findQuestionIDByAnswerID', () => {
      beforeEach(() => {
        mockingoose.resetAll();
      });

      test('should return the question ID if the answer exists within a question', async () => {
        const mockAnswerID = '507f191e810c19729de860ea';
        const mockQuestionID = '507f191e810c19729de860eb';
        const mockQuestion = {
          _id: new ObjectId(mockQuestionID),
          answers: [new ObjectId(mockAnswerID)],
        };

        mockingoose(QuestionModel).toReturn(mockQuestion, 'findOne');

        const result = await findQuestionIDByAnswerID(mockAnswerID);

        expect(result).toEqual(mockQuestionID);
      });

      it('should throw an error when the question containing the given answer ID is not found', async () => {
        const mockAnswerID = '1234567890abcdef12345678';

        // Mock the findOne operation to return null (no question found)
        mockingoose(QuestionModel).toReturn(null, 'findOne');

        // Attempt to call the function and expect an error to be thrown
        await expect(findQuestionIDByAnswerID(mockAnswerID)).rejects.toThrow(
          'Error when finding question ID by answer ID',
        );
      });

      test('should throw an error if the database query fails', async () => {
        const mockAnswerID = '507f191e810c19729de860ea';

        mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOne');

        await expect(findQuestionIDByAnswerID(mockAnswerID)).rejects.toThrow(
          'Error when finding question ID by answer ID',
        );
      });
    });
    describe('addAnswerToQuestion', () => {
      test('addAnswerToQuestion should return the updated question', async () => {
        const question = QUESTIONS.filter(
          q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
        )[0];
        (question.answers as Answer[]).push(ans4);
        jest.spyOn(QuestionModel, 'findOneAndUpdate').mockResolvedValueOnce(question);

        const result = (await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1)) as Question;

        expect(result.answers.length).toEqual(4);
        expect(result.answers).toContain(ans4);
      });

      test('addAnswerToQuestion should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

        if (result && 'error' in result) {
          expect(true).toBeTruthy();
        } else {
          expect(false).toBeTruthy();
        }
      });

      test('addAnswerToQuestion should return an object with error if findOneAndUpdate returns null', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

        const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

        if (result && 'error' in result) {
          expect(true).toBeTruthy();
        } else {
          expect(false).toBeTruthy();
        }
      });

      test('addAnswerToQuestion should throw an error if a required field is missing in the answer', async () => {
        const invalidAnswer: Partial<Answer> = {
          text: 'This is an answer text',
          ansBy: 'user123', // Missing ansDateTime
        };

        const qid = 'validQuestionId';

        try {
          await addAnswerToQuestion(qid, invalidAnswer as Answer);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(Error);
          if (err instanceof Error) expect(err.message).toBe('Invalid answer');
        }
      });
    });
  });

  describe('Tag model', () => {
    describe('addTag', () => {
      test('addTag return tag if the tag already exists', async () => {
        mockingoose(Tags).toReturn(tag1, 'findOne');

        const result = await addTag({ name: tag1.name, description: tag1.description });

        expect(result?._id).toEqual(tag1._id);
      });

      test('addTag return tag id of new tag if does not exist in database', async () => {
        mockingoose(Tags).toReturn(null, 'findOne');

        const result = await addTag({ name: tag2.name, description: tag2.description });

        expect(result).toBeDefined();
      });

      test('addTag returns null if findOne throws an error', async () => {
        mockingoose(Tags).toReturn(new Error('error'), 'findOne');

        const result = await addTag({ name: tag1.name, description: tag1.description });

        expect(result).toBeNull();
      });

      test('addTag returns null if save throws an error', async () => {
        mockingoose(Tags).toReturn(null, 'findOne');
        mockingoose(Tags).toReturn(new Error('error'), 'save');

        const result = await addTag({ name: tag2.name, description: tag2.description });

        expect(result).toBeNull();
      });
    });

    describe('processTags', () => {
      test('processTags should return the tags of tag names in the collection', async () => {
        mockingoose(Tags).toReturn(tag1, 'findOne');

        const result = await processTags([tag1, tag2]);

        expect(result.length).toEqual(2);
        expect(result[0]._id).toEqual(tag1._id);
        expect(result[1]._id).toEqual(tag1._id);
      });

      test('processTags should return a list of new tags ids if they do not exist in the collection', async () => {
        mockingoose(Tags).toReturn(null, 'findOne');

        const result = await processTags([tag1, tag2]);

        expect(result.length).toEqual(2);
      });

      test('processTags should return empty list if an error is thrown when finding tags', async () => {
        mockingoose(Tags).toReturn(Error('Dummy error'), 'findOne');

        const result = await processTags([tag1, tag2]);

        expect(result.length).toEqual(0);
      });

      test('processTags should return empty list if an error is thrown when saving tags', async () => {
        mockingoose(Tags).toReturn(null, 'findOne');
        mockingoose(Tags).toReturn(Error('Dummy error'), 'save');

        const result = await processTags([tag1, tag2]);

        expect(result.length).toEqual(0);
      });
    });

    describe('getTagCountMap', () => {
      test('getTagCountMap should return a map of tag names and their counts', async () => {
        mockingoose(Tags).toReturn([tag1, tag2, tag3], 'find');
        mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
        QuestionModel.schema.path('tags', Object);

        const result = (await getTagCountMap()) as Map<string, number>;

        expect(result.size).toEqual(3);
        expect(result.get('react')).toEqual(1);
        expect(result.get('javascript')).toEqual(2);
        expect(result.get('android')).toEqual(1);
      });

      test('getTagCountMap should return an object with error if an error is thrown', async () => {
        mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

        const result = await getTagCountMap();

        if (result && 'error' in result) {
          expect(true).toBeTruthy();
        } else {
          expect(false).toBeTruthy();
        }
      });

      test('getTagCountMap should return an object with error if an error is thrown when finding tags', async () => {
        mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
        mockingoose(Tags).toReturn(new Error('error'), 'find');

        const result = await getTagCountMap();

        if (result && 'error' in result) {
          expect(true).toBeTruthy();
        } else {
          expect(false).toBeTruthy();
        }
      });

      test('getTagCountMap should return null if Tags find returns null', async () => {
        mockingoose(QuestionModel).toReturn(QUESTIONS, 'find');
        mockingoose(Tags).toReturn(null, 'find');

        const result = await getTagCountMap();

        expect(result).toBeNull();
      });

      test('getTagCountMap should return default map if QuestionModel find returns null but not tag find', async () => {
        mockingoose(QuestionModel).toReturn(null, 'find');
        mockingoose(Tags).toReturn([tag1], 'find');

        const result = (await getTagCountMap()) as Map<string, number>;

        expect(result.get('react')).toBe(0);
      });

      test('getTagCountMap should return null if find returns []', async () => {
        mockingoose(QuestionModel).toReturn([], 'find');
        mockingoose(Tags).toReturn([], 'find');

        const result = await getTagCountMap();

        expect(result).toBeNull();
      });
    });
  });

  describe('Post Removal Utilities', () => {
    afterEach(() => {
      jest.restoreAllMocks(); // Restore mocks after each test
    });

    describe('removePostFromAllCollections', () => {
      test('should remove a post from all bookmark collections', async () => {
        const postId = '507f191e810c19729de860ea';
        const postType = 'question';

        const mockResponse = { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        jest
          .spyOn(BookmarkCollectionModel, 'updateMany')
          .mockResolvedValue(
            mockResponse as unknown as ReturnType<typeof BookmarkCollectionModel.updateMany>,
          );

        await expect(removePostFromAllCollections(postId, postType)).resolves.not.toThrow();

        expect(BookmarkCollectionModel.updateMany).toHaveBeenCalledTimes(1);
        expect(BookmarkCollectionModel.updateMany).toHaveBeenCalledWith(
          { posts: { $elemMatch: { postId, postType } } },
          { $pull: { posts: { postId, postType } } },
        );
      });

      test('should throw an error if the database operation fails', async () => {
        const postId = '507f191e810c19729de860ea';
        const postType = 'question';

        jest
          .spyOn(BookmarkCollectionModel, 'updateMany')
          .mockRejectedValue(new Error('Database error'));

        await expect(removePostFromAllCollections(postId, postType)).rejects.toThrow(
          'Database error',
        );
      });
    });

    describe('removePostFromActivityHistory', () => {
      test('should remove a post from all users’ activity histories', async () => {
        const postId = '507f191e810c19729de860ea';

        const mockResponse = { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        jest
          .spyOn(UserModel, 'updateMany')
          .mockResolvedValue(mockResponse as unknown as ReturnType<typeof UserModel.updateMany>);

        await expect(removePostFromActivityHistory(postId)).resolves.not.toThrow();

        expect(UserModel.updateMany).toHaveBeenCalledTimes(1);
        expect(UserModel.updateMany).toHaveBeenCalledWith(
          { 'activityHistory.postId': postId },
          { $pull: { activityHistory: { postId } } },
        );
      });

      test('should throw an error if the database operation fails', async () => {
        const postId = '507f191e810c19729de860ea';

        jest.spyOn(UserModel, 'updateMany').mockRejectedValue(new Error('Database error'));

        await expect(removePostFromActivityHistory(postId)).rejects.toThrow('Database error');
      });
    });

    describe('removePostFromUserCollections', () => {
      test('should remove a post from a specific user’s bookmark collections', async () => {
        const username = 'testUser';
        const postId = '507f191e810c19729de860ea';
        const postType = 'question';

        const mockResponse = { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        jest
          .spyOn(BookmarkCollectionModel, 'updateMany')
          .mockResolvedValue(
            mockResponse as unknown as ReturnType<typeof BookmarkCollectionModel.updateMany>,
          );

        await expect(
          removePostFromUserCollections(username, postId, postType),
        ).resolves.not.toThrow();

        expect(BookmarkCollectionModel.updateMany).toHaveBeenCalledTimes(1);
        expect(BookmarkCollectionModel.updateMany).toHaveBeenCalledWith(
          { username, posts: { $elemMatch: { postId, postType } } },
          { $pull: { posts: { postId, postType } } },
        );
      });

      test('should throw an error if the database operation fails', async () => {
        const username = 'testUser';
        const postId = '507f191e810c19729de860ea';
        const postType = 'question';

        jest
          .spyOn(BookmarkCollectionModel, 'updateMany')
          .mockRejectedValue(new Error('Database error'));

        await expect(removePostFromUserCollections(username, postId, postType)).rejects.toThrow(
          'Database error',
        );
      });
    });

    describe('removePostFromUserActivityHistory', () => {
      test('should remove a post from a specific user’s activity history', async () => {
        const username = 'testUser';
        const postId = '507f191e810c19729de860ea';

        const mockResponse = { matchedCount: 1, modifiedCount: 1, acknowledged: true };
        jest
          .spyOn(UserModel, 'updateOne')
          .mockResolvedValue(mockResponse as unknown as ReturnType<typeof UserModel.updateOne>);

        await expect(removePostFromUserActivityHistory(username, postId)).resolves.not.toThrow();

        expect(UserModel.updateOne).toHaveBeenCalledTimes(1);
        expect(UserModel.updateOne).toHaveBeenCalledWith(
          { username, 'activityHistory.postId': postId },
          { $pull: { activityHistory: { postId } } },
        );
      });

      test('should throw an error if the database operation fails', async () => {
        const username = 'testUser';
        const postId = '507f191e810c19729de860ea';

        jest.spyOn(UserModel, 'updateOne').mockRejectedValue(new Error('Database error'));

        await expect(removePostFromUserActivityHistory(username, postId)).rejects.toThrow(
          'Database error',
        );
      });
    });
  });

  describe('Comment model', () => {
    describe('saveComment', () => {
      test('saveComment should return the saved comment', async () => {
        const result = (await saveComment(com1)) as Comment;

        expect(result._id).toBeDefined();
        expect(result.text).toEqual(com1.text);
        expect(result.commentBy).toEqual(com1.commentBy);
        expect(result.commentDateTime).toEqual(com1.commentDateTime);
      });
    });

    describe('addComment', () => {
      test('addComment should return the updated question when given `question`', async () => {
        // copy the question to avoid modifying the original
        const question = { ...QUESTIONS[0], comments: [com1] };
        mockingoose(QuestionModel).toReturn(question, 'findOneAndUpdate');

        const result = (await addComment(
          question._id?.toString() as string,
          'question',
          com1,
        )) as Question;

        expect(result.comments.length).toEqual(1);
        expect(result.comments).toContain(com1._id);
      });

      test('addComment should return the updated answer when given `answer`', async () => {
        // copy the answer to avoid modifying the original
        const answer: Answer = { ...ans1 };
        (answer.comments as Comment[]).push(com1);
        mockingoose(AnswerModel).toReturn(answer, 'findOneAndUpdate');

        const result = (await addComment(
          answer._id?.toString() as string,
          'answer',
          com1,
        )) as Answer;

        expect(result.comments.length).toEqual(1);
        expect(result.comments).toContain(com1._id);
      });

      test('addComment should return an object with error if findOneAndUpdate throws an error', async () => {
        const question = QUESTIONS[0];
        mockingoose(QuestionModel).toReturn(
          new Error('Error from findOneAndUpdate'),
          'findOneAndUpdate',
        );
        const result = await addComment(question._id?.toString() as string, 'question', com1);
        expect(result).toEqual({ error: 'Error when adding comment: Error from findOneAndUpdate' });
      });

      test('addComment should return an object with error if findOneAndUpdate returns null', async () => {
        const answer: Answer = { ...ans1 };
        mockingoose(AnswerModel).toReturn(null, 'findOneAndUpdate');
        const result = await addComment(answer._id?.toString() as string, 'answer', com1);
        expect(result).toEqual({ error: 'Error when adding comment: Failed to add comment' });
      });

      test('addComment should throw an error if a required field is missing in the comment', async () => {
        const invalidComment: Partial<Comment> = {
          text: 'This is an answer text',
          commentBy: 'user123', // Missing commentDateTime
        };

        const qid = 'validQuestionId';

        try {
          await addComment(qid, 'question', invalidComment as Comment);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(Error);
          if (err instanceof Error) expect(err.message).toBe('Invalid comment');
        }
      });
    });
  });

  describe('User model', () => {
    describe('saveUser', () => {
      test('saveUser should return the saved user', async () => {
        const result = (await saveUser(user1)) as User;
        const result2 = (await saveUser(user2)) as User;

        expect(result.username).toEqual(user1.username);
        expect(result.bio).toEqual(user1.bio);
        expect(result.profilePictureURL).toEqual(user1.profilePictureURL);

        expect(result2.username).toEqual(user2.username);
        expect(result2.bio).toEqual(user2.bio);
        expect(result2.profilePictureURL).toEqual(user2.profilePictureURL);
      });
    });

    describe('getUserByUsername', () => {
      test('getUserByUsername should return the user with the given username', async () => {
        mockingoose(UserModel).toReturn(user1, 'findOne');

        const result = (await getUserByUsername('marcus', 'requesterUsername')) as User;

        expect(result.username).toEqual('marcus');
        expect(result.bio).toEqual('I am a software developer');
        expect(result.profilePictureURL).toEqual('cats');
      });

      test('getUserByUsername should return null if the username does not exist', async () => {
        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await getUserByUsername('nonExistentUsername', 'requesterUsername');

        expect(result).toBeNull();
      });

      test('getUserByUsername should return an object with error if findOne throws an error', async () => {
        mockingoose(UserModel).toReturn(new Error('error'), 'findOne');

        const result = (await getUserByUsername('marcus', 'requesterUsername')) as {
          error: string;
        };

        expect(result.error).toEqual('Error when fetching user by username');
      });
    });

    describe('addUserBio', () => {
      test('addUserBio should return the updated user', async () => {
        const user = { ...user2, bio: 'I like dogs' };
        mockingoose(UserModel).toReturn(user, 'findOneAndUpdate');

        const result = (await addUserBio('petersmith', 'I like dogs')) as User;
        expect(result.bio).toEqual('I like dogs');
      });

      test('addUserBio should return the updated user if a biography is removed', async () => {
        const user = { ...user1, bio: '' };
        mockingoose(UserModel).toReturn(user, 'findOneAndUpdate');

        const result = (await addUserBio('marcus', '')) as User;
        expect(result.bio).toEqual('');
      });

      test('addUserBio should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(UserModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = await addUserBio('marcus', 'I like dogs');

        expect(result).toEqual({ error: 'Error when adding bio to user' });
      });
      test('addUserBio should return an object with error if username does not exist', async () => {
        mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

        const result = await addUserBio('nonExistentUsername', 'I like dogs');

        expect(result).toEqual({ error: 'Error when adding bio to user' });
      });
    });

    describe('banUser', () => {
      test('banUser should set isBanned to true for the specified user', async () => {
        const username = 'testUser';
        const user = { username, isBanned: false };
        const updatedUser = { ...user, isBanned: true };

        mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

        const result = await banUser(username);

        expect(result).toMatchObject(updatedUser);
      });

      test('banUser should return an error if the user is not found', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

        const result = await banUser(username);

        expect(result).toEqual({ error: 'Error when banning user: User not found' });
      });

      test('banUser should return an error if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await banUser(username);

        expect(result).toEqual({ error: 'Error when banning user: Database error' });
      });
    });

    describe('unbanUser', () => {
      test('unbanUser should set isBanned to false for the specified user', async () => {
        const username = 'testUser';
        const user = { username, isBanned: true };
        const updatedUser = { ...user, isBanned: false };

        mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

        const result = await unbanUser(username);

        expect(result).toMatchObject(updatedUser);
      });

      test('unbanUser should return an error if the user is not found', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

        const result = await unbanUser(username);

        expect(result).toEqual({ error: 'Error when unbanning user: User not found' });
      });

      test('unbanUser should return an error if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await unbanUser(username);

        expect(result).toEqual({ error: 'Error when unbanning user: Database error' });
      });
    });

    describe('shadowBanUser', () => {
      test('shadowBanUser should set isShadowBanned to true for the specified user', async () => {
        const username = 'testUser';
        const user = { username, isShadowBanned: false };
        const updatedUser = { ...user, isShadowBanned: true };

        mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

        const result = await shadowBanUser(username);

        expect(result).toMatchObject(updatedUser);
      });

      test('shadowBanUser should return an error if the user is not found', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

        const result = await shadowBanUser(username);

        expect(result).toEqual({ error: 'Error when shadow banning user: User not found' });
      });

      test('shadowBanUser should return an error if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await shadowBanUser(username);

        expect(result).toEqual({ error: 'Error when shadow banning user: Database error' });
      });
    });

    describe('unshadowBanUser', () => {
      test('unshadowBanUser should set isShadowBanned to false for the specified user', async () => {
        const username = 'testUser';
        const user = { username, isShadowBanned: true };
        const updatedUser = { ...user, isShadowBanned: false };

        mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

        const result = await unshadowBanUser(username);

        expect(result).toMatchObject(updatedUser);
      });

      test('unshadowBanUser should return an error if the user is not found', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

        const result = await unshadowBanUser(username);

        expect(result).toEqual({ error: 'Error when un-shadow banning user: User not found' });
      });

      test('unshadowBanUser should return an error if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await unshadowBanUser(username);

        expect(result).toEqual({ error: 'Error when un-shadow banning user: Database error' });
      });
    });

    // Mock Google Cloud Storage
    jest.mock('@google-cloud/storage', () => {
      const mockedStorage = {
        bucket: jest.fn(),
      };
      return { Storage: jest.fn(() => mockedStorage) };
    });

    describe('isUserBanned', () => {
      test('isUserBanned should return true if the user is banned', async () => {
        const username = 'testUser';
        const user = { username, isBanned: true };

        mockingoose(UserModel).toReturn(user, 'findOne');

        const result = await isUserBanned(username);

        expect(result).toBe(true);
      });

      test('isUserBanned should return false if the user is not banned', async () => {
        const username = 'testUser';
        const user = { username, isBanned: false };

        mockingoose(UserModel).toReturn(user, 'findOne');

        const result = await isUserBanned(username);

        expect(result).toBe(false);
      });

      test('isUserBanned should return false if the user does not exist', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await isUserBanned(username);

        expect(result).toBe(false);
      });

      test('isUserBanned should return false if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOne');

        const result = await isUserBanned(username);

        expect(result).toBe(false);
      });
    });
    describe('isUserShadowBanned', () => {
      test('isUserShadowBanned should return true if the user is shadow banned', async () => {
        const username = 'testUser';
        const user = { username, isShadowBanned: true };

        mockingoose(UserModel).toReturn(user, 'findOne');

        const result = await isUserShadowBanned(username);

        expect(result).toBe(true);
      });

      test('isUserShadowBanned should return false if the user is not shadow banned', async () => {
        const username = 'testUser';
        const user = { username, isShadowBanned: false };

        mockingoose(UserModel).toReturn(user, 'findOne');

        const result = await isUserShadowBanned(username);

        expect(result).toBe(false);
      });

      test('isUserShadowBanned should return false if the user does not exist', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await isUserShadowBanned(username);

        expect(result).toBe(false);
      });

      test('isUserShadowBanned should return false if an exception occurs', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOne');

        const result = await isUserShadowBanned(username);

        expect(result).toBe(false);
      });
    });
  });

  describe('Bookmark model', () => {
    describe('createBookmarkCollection', () => {
      test('createBookmarkCollection should return the created bookmark collection', async () => {
        const result = (await createBookmarkCollection(
          'testUsername',
          'testBookmarkCollectionTitle',
          true,
        )) as BookmarkCollection;

        expect(result._id).toBeDefined();
        expect(result.owner).toEqual('testUsername');
        expect(result.title).toEqual('testBookmarkCollectionTitle');
        expect(result.savedPosts).toEqual([]);
      });

      test('createBookmarkCollection should return an object with error if save throws an error', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(new Error('error'), 'save');

        const result = await createBookmarkCollection(
          'testUsername',
          'testBookmarkCollectionTitle',
          true,
        );

        expect(result).toEqual({ error: 'Error when creating bookmark collection' });
      });
    });

    describe('removeQuestionFromBookmarkCollection', () => {
      test('removeQuestionFromBookmarkCollection should return an object with error if the bookmark collection id does not exist', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(null, 'findOneAndUpdate');

        const result = await removeQuestionFromBookmarkCollection(
          '507f191e810c19729de860ea',
          QUESTIONS[0]._id?.toString() || '',
        );

        expect(result).toEqual({
          error:
            'Error when removing question from bookmark collection: Bookmark collection not found',
        });
      });

      test('removeQuestionFromBookmarkCollection should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = await removeQuestionFromBookmarkCollection(
          '507f191e810c19729de860ea',
          QUESTIONS[0]._id?.toString() || '',
        );

        expect(result).toEqual({
          error: 'Error when removing question from bookmark collection: error',
        });
      });
    });

    describe('getUserBookmarkCollections', () => {
      test('getUserBookmarkCollections should return a list of all bookmark collections if the requesterUsername and username are the same', async () => {
        const user: User = {
          username: 'testUsername',
          password: '',
        };
        const bookmarkCollections = [
          {
            _id: new ObjectId('507f191e810c19729de860ea'),
            owner: 'testUsername',
            title: 'testBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: true,
          },
          {
            _id: new ObjectId('507f191e810c19729de860eb'),
            owner: 'testUsername',
            title: 'anotherBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: false,
          },
        ];

        mockingoose(UserModel).toReturn(user, 'findOne');
        mockingoose(BookmarkCollectionModel).toReturn(bookmarkCollections, 'find');

        const result = await getUserBookmarkCollections('testUsername', 'testUsername');

        expect(result.length).toEqual(2);
        expect(result[0].title).toEqual('testBookmarkCollectionTitle');
        expect(result[1].title).toEqual('anotherBookmarkCollectionTitle');
      });

      test('getUserBookmarkCollections should return a list of public bookmark collections if the requesterUsername and username are different', async () => {
        const user: User = {
          username: 'testUsername',
          password: '',
        };
        const bookmarkCollections = [
          {
            _id: new ObjectId('507f191e810c19729de860ea'),
            owner: 'testUsername',
            title: 'testBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: true,
          },
          {
            _id: new ObjectId('507f191e810c19729de860eb'),
            owner: 'testUsername',
            title: 'anotherBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: false,
          },
        ];

        mockingoose(UserModel).toReturn(user, 'findOne');
        mockingoose(BookmarkCollectionModel).toReturn(
          bookmarkCollections.filter(collection => collection.isPublic),
          'find',
        );

        const result = await getUserBookmarkCollections('testUsername', 'requesterUsername');

        expect(result.length).toEqual(1);
        expect(result[0].title).toEqual('testBookmarkCollectionTitle');
      });

      test('getUserBookmarkCollections should return all public bookmark collections and private ones if the requesterUsername follows them', async () => {
        const user: User = {
          username: 'someUsername',
          password: '',
        };

        const bookmarkCollections = [
          {
            _id: new ObjectId('507f191e810c19729de860ea'),
            owner: 'testUsername',
            title: 'testBookmarkCollectionTitle',
            savedPosts: [{ postId: QUESTIONS[0], savedAt: new Date() }],
            isPublic: true,
          },
          {
            _id: new ObjectId('507f191e810c19729de860eb'),
            owner: 'testUsername',
            title: 'anotherBookmarkCollectionTitle',
            followers: ['someUsername', 'bruh'],
            savedPosts: [
              { postId: QUESTIONS[0], savedAt: new Date() },
              { postId: QUESTIONS[1], savedAt: new Date() },
            ],
            isPublic: false,
          },
        ];

        mockingoose(UserModel).toReturn(user, 'findOne');
        mockingoose(BookmarkCollectionModel).toReturn(bookmarkCollections, 'find');

        const result = await getUserBookmarkCollections('testUsername', 'someUsername');

        expect(result.length).toEqual(2);
        expect(result[0].title).toEqual('testBookmarkCollectionTitle');
        expect(result[1].title).toEqual('anotherBookmarkCollectionTitle');
        expect(result[1].savedPosts.length).toEqual(2);
        expect(result[1].savedPosts[0].postId).toEqual(new ObjectId('65e9b58910afe6e94fc6e6dc'));
      });

      test('getUserBookmarkCollections should return an empty array if  the username does not exist', async () => {
        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await getUserBookmarkCollections('nonExistentUsername', 'requesterUsername');

        expect(result.length).toEqual(0);
      });
    });

    describe('followBookmarkCollection', () => {
      test('followBookmarkCollection should return the updated bookmark collection', async () => {
        const bookmarkCollection: BookmarkCollection = {
          _id: new ObjectId('507f191e810c19729de860ea'),
          owner: 'testUsername',
          title: 'testBookmarkCollectionTitle',
          savedPosts: [],
          isPublic: false,
          followers: ['mordecai', 'rigby'],
        };

        // Mock the findOneAndUpdate method to return the updated bookmark collection
        mockingoose(BookmarkCollectionModel).toReturn(
          {
            ...bookmarkCollection,
            followers: ['mordecai', 'rigby', 'someUsername'],
          },
          'findOneAndUpdate',
        );

        // mock the user's followedBookmarkCollections ???

        const result = (await followBookmarkCollection(
          '507f191e810c19729de860ea',
          'someUsername',
        )) as BookmarkCollection;

        expect(result.followers?.length).toEqual(3);
        expect(result.followers?.[2]).toEqual('someUsername');
      });

      test('followBookmarkCollection should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = await followBookmarkCollection('507f191e810c19729de860ea', 'someUsername');

        expect(result).toEqual({ error: 'Error when following bookmark collection: error' });
      });

      test('followBookmarkCollection should return an object with error if the bookmark collection id does not exist', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(null, 'findOneAndUpdate');

        const result = await followBookmarkCollection('507f191e810c19729de860ea', 'someUsername');

        expect(result).toEqual({
          error:
            'Error when following bookmark collection: Bookmark collection not found or is not public',
        });
      });
    });

    describe('getUserFollowUpdateNotifications', () => {
      test('should return an empty array if the user has no notifications', async () => {
        const username = 'testUserWithoutNotifications';

        mockingoose(UserModel).toReturn({ followUpdateNotifications: [] }, 'findOne');

        const result = await getUserFollowUpdateNotifications(username);

        expect(result).toEqual([]);
      });

      test('should return an error if the user is not found', async () => {
        const username = 'nonExistentUser';

        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await getUserFollowUpdateNotifications(username);

        expect(result).toEqual({
          error: 'Error when unfollowing bookmark collection: User not found',
        });
      });

      test('should return an error if an exception occurs during database access', async () => {
        const username = 'testUser';

        mockingoose(UserModel).toReturn(new Error('Database error'), 'findOne');

        const result = await getUserFollowUpdateNotifications(username);

        expect(result).toEqual({
          error: 'Error when unfollowing bookmark collection: Database error',
        });
      });
    });

    describe('unfollowBookmarkCollection', () => {
      test('unfollowBookmarkCollection should return the updated bookmark collection', async () => {
        const bookmarkCollection: BookmarkCollection = {
          _id: new ObjectId('507f191e810c19729de860ea'),
          owner: 'testUsername',
          title: 'testBookmarkCollectionTitle',
          savedPosts: [],
          isPublic: false,
          followers: ['mordecai', 'someUsername', 'rigby'],
        };

        // Mock the findOneAndUpdate method to return the updated bookmark collection
        mockingoose(BookmarkCollectionModel).toReturn(
          {
            ...bookmarkCollection,
            followers: ['mordecai', 'rigby'],
          },
          'findOneAndUpdate',
        );

        const result = (await unfollowBookmarkCollection(
          '507f191e810c19729de860ea',
          'someUsername',
        )) as BookmarkCollection;

        expect(result.followers?.length).toEqual(2);
        expect(result.followers).not.toContain('someUsername');
      });

      test('unfollowBookmarkCollection should return an object with error if findOneAndUpdate throws an error', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(new Error('error'), 'findOneAndUpdate');

        const result = await unfollowBookmarkCollection('507f191e810c19729de860ea', 'someUsername');

        expect(result).toEqual({ error: 'Error when unfollowing bookmark collection: error' });
      });

      test('unfollowBookmarkCollection should return an object with error if the bookmark collection id does not exist', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(null, 'findOneAndUpdate');

        const result = await unfollowBookmarkCollection('507f191e810c19729de860ea', 'someUsername');

        expect(result).toEqual({
          error: 'Error when unfollowing bookmark collection: Bookmark collection not found',
        });
      });
    });

    describe('getFollowedBookmarkCollections', () => {
      test('getFollowedBookmarkCollections should return a list of bookmark collections that the user follows', async () => {
        const user: User = {
          username: 'someUsername',
          password: '',
        };

        const bookmarkCollections = [
          {
            _id: new ObjectId('507f191e810c19729de860ea'),
            owner: 'testUsername',
            title: 'testBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: false,
            followers: ['someUsername'],
          },
          {
            _id: new ObjectId('507f191e810c19729de860eb'),
            owner: 'testUsername',
            title: 'anotherBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: false,
            followers: ['someUsername'],
          },
          {
            _id: new ObjectId('507f191e810c19729de860ec'),
            owner: 'anotherUser',
            title: 'thirdBookmarkCollectionTitle',
            savedPosts: [],
            isPublic: true,
            followers: ['bob', 'alice'],
          },
        ];

        mockingoose(UserModel).toReturn(user, 'findOne');

        mockingoose(BookmarkCollectionModel).toReturn(bookmarkCollections.slice(0, -1), 'find');

        const result = await getFollowedBookmarkCollections('someUsername');

        expect(result.length).toEqual(2);
        expect(result[0].title).toEqual('testBookmarkCollectionTitle');
        expect(result[1].title).toEqual('anotherBookmarkCollectionTitle');
      });

      test('getFollowedBookmarkCollections should return an empty array if the user does not exist', async () => {
        mockingoose(UserModel).toReturn(null, 'findOne');

        const result = await getFollowedBookmarkCollections('nonExistentUsername');

        expect(result.length).toEqual(0);
      });
    });

    describe('addQuestionToBookmarkCollection', () => {
      beforeEach(() => {
        mockingoose.resetAll();
      });

      test('should return error if question is not found', async () => {
        const collectionId = '507f191e810c19729de860eb';
        const questionId = 'nonexistentQuestionId';

        mockingoose(QuestionModel).toReturn(null, 'findOne');

        const result = await addQuestionToBookmarkCollection(collectionId, questionId);

        expect(result).toEqual({
          error: 'Error when adding question to bookmark collection: Question not found',
        });
      });

      test('should return error if bookmark collection is not found', async () => {
        const questionId = '507f191e810c19729de860ea';
        const collectionId = 'nonexistentCollectionId';

        const mockQuestion = {
          _id: questionId,
          title: 'Sample Question Title',
          answers: [],
        };

        mockingoose(QuestionModel).toReturn(mockQuestion, 'findOne');
        mockingoose(BookmarkCollectionModel).toReturn(null, 'findById');

        const result = await addQuestionToBookmarkCollection(collectionId, questionId);

        expect(result).toEqual({
          error: 'Error when adding question to bookmark collection: Bookmark collection not found',
        });
      });
    });

    describe('getBookmarkCollectionById', () => {
      test('getBookmarkCollectionById should return an object with error if the bookmark collection id does not exist', async () => {
        mockingoose(BookmarkCollectionModel).toReturn(null, 'findOne');

        const result = await getBookmarkCollectionById('507f191e810c19729de860ea');

        expect(result).toEqual({
          error: 'Error when retrieving bookmark collection: Bookmark collection not found',
        });
      });

      it('should return the bookmark collection if found', async () => {
        const mockCollectionId = new ObjectId('1234567890abcdef12345678');
        const mockCollection = {
          _id: mockCollectionId,
          title: 'My Collection',
          owner: 'user123',
          isPublic: true,
          followers: ['user456', 'user789'],
          savedPosts: [
            {
              _id: new ObjectId('674cf8c01b29a0965f9064fc'),
              savedAt: new Date('2024-12-02T00:01:04.086Z'),
            },
            {
              _id: new ObjectId('674cf8c01b29a0965f9064fd'),
              savedAt: new Date('2024-12-02T00:01:04.086Z'),
            },
          ],
        };
        // Mock the findOne operation to return the mock collection
        mockingoose(BookmarkCollectionModel).toReturn(mockCollection, 'findOne');

        // Call the function
        const result = await getBookmarkCollectionById(mockCollectionId.toString());

        // Assertions
        expect(result).toMatchObject(mockCollection);
      });
    });
  });

  describe('Flag model', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    describe('getPendingFlags', () => {
      test('should retrieve all pending flags', async () => {
        const flags = [
          {
            _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
            status: 'pending',
            dateFlagged: new Date(),
          },
          {
            _id: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
            status: 'pending',
            dateFlagged: new Date(),
          },
        ];

        mockingoose(FlagModel).toReturn(flags, 'find');

        const result = await getPendingFlags();

        expect(result).toMatchObject(flags);
      });

      test('should return an error if retrieval fails', async () => {
        mockingoose(FlagModel).toReturn(new Error('Database error'), 'find');

        const result = await getPendingFlags();

        expect(result).toEqual({
          error: 'Error when retrieving pending flags: Database error',
        });
      });
    });

    describe('flagPost functionality', () => {
      const mockFlagReason: FlagReason = 'spam'; // Replace with actual reasons defined in your system
      const mockFlaggedBy = 'testUser';

      afterEach(() => {
        mockingoose.resetAll();
      });

      test('should create a flag for a question and update the question flags array', async () => {
        const mockQuestion = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
          text: 'This is a question',
          askedBy: 'questionUser',
          flags: [],
        };

        const mockFlag = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
          flaggedBy: mockFlaggedBy,
          reason: mockFlagReason,
          postText: mockQuestion.text,
          flaggedUser: mockQuestion.askedBy,
          status: 'pending',
        };

        mockingoose(QuestionModel).toReturn(mockQuestion, 'findOne');
        mockingoose(FlagModel).toReturn(mockFlag, 'save');
        mockingoose(QuestionModel).toReturn(
          { ...mockQuestion, flags: [mockFlag._id] },
          'findOneAndUpdate',
        );

        const result = await flagPost(
          mockQuestion._id.toString(),
          'question',
          mockFlagReason,
          mockFlaggedBy,
        );

        expect(result.toString()).toContain(mockQuestion._id.toString());
      });

      test('should create a flag for an answer and update the answer flags array', async () => {
        const mockAnswer = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
          text: 'This is an answer',
          ansBy: 'answerUser',
          flags: [],
        };

        const mockFlag = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ec'),
          flaggedBy: mockFlaggedBy,
          reason: mockFlagReason,
          postText: mockAnswer.text,
          flaggedUser: mockAnswer.ansBy,
          status: 'pending',
        };

        mockingoose(AnswerModel).toReturn(mockAnswer, 'findOne');
        mockingoose(FlagModel).toReturn(mockFlag, 'save');
        mockingoose(AnswerModel).toReturn(
          { ...mockAnswer, flags: [mockFlag._id] },
          'findOneAndUpdate',
        );

        const result = await flagPost(
          mockAnswer._id.toString(),
          'answer',
          mockFlagReason,
          mockFlaggedBy,
        );

        expect(result.toString()).toContain(mockAnswer._id.toString());
      });

      test('should create a flag for a comment and update the comment flags array', async () => {
        const mockComment = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ec'),
          text: 'This is a comment',
          commentBy: 'commentUser',
          flags: [],
        };

        const mockFlag = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ed'),
          flaggedBy: mockFlaggedBy,
          reason: mockFlagReason,
          postText: mockComment.text,
          flaggedUser: mockComment.commentBy,
          status: 'pending',
        };

        mockingoose(CommentModel).toReturn(mockComment, 'findOne');
        mockingoose(FlagModel).toReturn(mockFlag, 'save');
        mockingoose(CommentModel).toReturn(
          { ...mockComment, flags: [mockFlag._id] },
          'findOneAndUpdate',
        );

        const result = await flagPost(
          mockComment._id.toString(),
          'comment',
          mockFlagReason,
          mockFlaggedBy,
        );

        expect(result.toString()).toContain(mockComment._id.toString());
      });

      test('should return an error if the post is not found', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findById');

        const result = await flagPost('nonExistentId', 'question', 'other', 'testUser');

        expect(result).toEqual({ error: 'Error when flagging post: Post not found' });
      });

      it('should throw an error for invalid post type', async () => {
        const invalidType = 'invalidType' as 'question' | 'answer' | 'comment';
        const postId = '1234567890abcdef12345678';
        const reason = 'spam'; // Assuming FlagReason is a string or enum
        const flaggedBy = 'user123';

        // Call the function with an invalid type
        const result = await flagPost(postId, invalidType, reason, flaggedBy);

        // Assertion
        expect(result).toEqual({
          error: 'Error when flagging post: Invalid type specified',
        });
      });

      it('should throw an error if the post is not found', async () => {
        const validType = 'question'; // Valid post type
        const postId = 'nonexistent1234567890abcdef'; // Non-existent post ID
        const reason = 'spam'; // Assuming FlagReason is a string or enum
        const flaggedBy = 'user123';

        // Mock the findById to return null (post not found)
        mockingoose(QuestionModel).toReturn(null, 'findOne');

        // Call the function with a non-existent post ID
        const result = await flagPost(postId, validType, reason, flaggedBy);

        // Assertion
        expect(result).toEqual({
          error: 'Error when flagging post: Post not found',
        });
      });

      it('should throw an error if the post update fails', async () => {
        const validType = 'question'; // Strict typing for post type
        const postId = '1234567890abcdef12345678'; // Valid post ID
        const reason = 'spam'; // Strict typing for reason
        const flaggedBy = 'user123';

        // Mock findById to return a valid post
        mockingoose(QuestionModel).toReturn(
          {
            _id: postId,
            text: 'Sample question text',
            askedBy: 'user456',
            flags: [],
          },
          'findOne',
        );

        // Mock save for the flag
        mockingoose(FlagModel).toReturn(
          {
            _id: 'flag123',
            flaggedBy,
            reason,
            dateFlagged: new Date(),
            status: 'pending',
            postId,
            postType: validType,
            postText: 'Sample question text',
            flaggedUser: 'user456',
          },
          'save',
        );

        // Mock findOneAndUpdate to return null (simulate post update failure)
        mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

        // Call the function and assert the result
        const result = await flagPost(postId, validType, reason, flaggedBy);

        // Assertion
        expect(result).toEqual({
          error: 'Error when flagging post: Post not found',
        });
      });
    });

    describe('getFlaggedPosts', () => {
      test('should return empty arrays if an error occurs', async () => {
        mockingoose(QuestionModel).toReturn(new Error('error'), 'find');
        mockingoose(AnswerModel).toReturn(new Error('error'), 'find');
        mockingoose(CommentModel).toReturn(new Error('error'), 'find');

        const result = await getFlaggedPosts();

        expect(result).toEqual({ questions: [], answers: [], comments: [] });
      });

      test('should return flagged answers with populated flags', async () => {
        const mockFlag = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
          flaggedBy: 'testUser',
          reason: 'spam',
          status: 'pending',
        };

        const mockAnswer = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
          text: 'Test Answer',
          ansBy: 'answerUser',
          ansDateTime: new Date(),
          flags: [mockFlag],
        };

        mockingoose(AnswerModel).toReturn([mockAnswer], 'find');
        mockingoose(FlagModel).toReturn(mockFlag, 'find');

        const result = await getFlaggedPosts();

        expect(result.answers.length).toBe(1);
        expect(result.answers[0]._id?.toString()).toEqual(mockAnswer._id.toString());
      });

      test('should return flagged comments with populated flags', async () => {
        const mockFlag = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
          flaggedBy: 'testUser',
          reason: 'offensive language',
          status: 'pending',
        };

        const mockComment = {
          _id: new mongoose.Types.ObjectId('507f191e810c19729de860ec'),
          text: 'Test Comment',
          commentBy: 'commentUser',
          commentDateTime: new Date(),
          flags: [mockFlag],
        };

        mockingoose(CommentModel).toReturn([mockComment], 'find');
        mockingoose(FlagModel).toReturn(mockFlag, 'find');

        const result = await getFlaggedPosts();

        expect(result.comments.length).toBe(1);
        expect(result.comments[0]._id?.toString()).toEqual(mockComment._id.toString());
      });

      test('should return empty arrays if no flagged posts exist', async () => {
        mockingoose(AnswerModel).toReturn([], 'find');
        mockingoose(CommentModel).toReturn([], 'find');
        mockingoose(QuestionModel).toReturn([], 'find');

        const result = await getFlaggedPosts();

        expect(result.questions.length).toBe(0);
        expect(result.answers.length).toBe(0);
        expect(result.comments.length).toBe(0);
      });

      test('should return empty arrays if an error occurs', async () => {
        mockingoose(AnswerModel).toReturn(new Error('Database error'), 'find');
        mockingoose(CommentModel).toReturn(new Error('Database error'), 'find');
        mockingoose(QuestionModel).toReturn(new Error('Database error'), 'find');

        const result = await getFlaggedPosts();

        expect(result.questions.length).toBe(0);
        expect(result.answers.length).toBe(0);
        expect(result.comments.length).toBe(0);
      });
    });

    describe('markFlagAsReviewed', () => {
      test('should mark a flag as reviewed by a moderator', async () => {
        const flagId = 'flagId1';
        const moderatorUsername = 'mod1';

        mockingoose(FlagModel).toReturn({ _id: flagId, status: 'reviewed' }, 'findOneAndUpdate');

        const result = await markFlagAsReviewed(flagId, moderatorUsername);

        expect(result).toEqual({ success: true });
      });

      test('should return an error if user is not authorized', async () => {
        const flagId = 'flagId1';
        const moderatorUsername = 'regularUser';

        const result = await markFlagAsReviewed(flagId, moderatorUsername);

        expect(result).toEqual({
          success: false,
          message: 'User is not authorized to perform this action',
        });
      });

      test('should return an error if flag not found', async () => {
        const flagId = 'nonExistentFlagId';
        const moderatorUsername = 'mod1';

        mockingoose(FlagModel).toReturn(null, 'findOneAndUpdate');

        const result = await markFlagAsReviewed(flagId, moderatorUsername);

        expect(result).toEqual({ success: false, message: 'Flag not found' });
      });

      test('should return an error if an exception occurs', async () => {
        const flagId = 'flagId1';
        const moderatorUsername = 'mod1';

        mockingoose(FlagModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

        const result = await markFlagAsReviewed(flagId, moderatorUsername);

        expect(result).toEqual({ success: false, message: 'Database error' });
      });
    });

    describe('deletePost', () => {
      test('should return an error if user is not authorized', async () => {
        const result = await deletePost('someId', 'question', 'regularUser');

        expect(result).toEqual({
          success: false,
          message: 'User is not authorized to perform this action',
        });
      });

      test('should return an error if question not found', async () => {
        mockingoose(QuestionModel).toReturn(null, 'findById');

        const result = await deletePost('invalidId', 'question', 'mod1');

        expect(result).toEqual({ success: false, message: 'Question not found' });
      });

      test('should return an error if the answer does not exist', async () => {
        mockingoose(AnswerModel).toReturn(null, 'findById');

        const result = await deletePost('invalidId', 'answer', 'mod1');

        expect(result).toEqual({ success: false, message: 'Answer not found' });
      });

      test('should delete a comment and its references in questions and answers', async () => {
        const commentId = '507f191e810c19729de860ea';
        const moderatorUsername = 'mod1';

        mockingoose(CommentModel).toReturn({}, 'deleteOne');
        mockingoose(QuestionModel).toReturn({}, 'updateMany');
        mockingoose(AnswerModel).toReturn({}, 'updateMany');
        mockingoose(FlagModel).toReturn({}, 'deleteMany');

        const result = await deletePost(commentId, 'comment', moderatorUsername);

        expect(result).toEqual({ success: true });
      });

      test('should return an error message if an exception occurs', async () => {
        const mockErrorMessage = 'Database error';
        jest.spyOn(QuestionModel, 'findById').mockRejectedValueOnce(new Error(mockErrorMessage));

        const result = await deletePost('507f191e810c19729de860ea', 'question', 'mod1');

        expect(result).toEqual({ success: false, message: mockErrorMessage });
      });

      it('should delete all comments associated with an answer and the answer itself', async () => {
        const answerId = '1234567890abcdef12345678';
        const questionId = 'abcdef123456789012345678';

        mockingoose(AnswerModel).toReturn(
          { _id: answerId, comments: ['comment1', 'comment2'] },
          'findOne',
        );
        mockingoose(CommentModel).toReturn([{ _id: 'comment1' }, { _id: 'comment2' }], 'find');
        mockingoose(QuestionModel).toReturn({ _id: questionId, answers: [answerId] }, 'findOne');

        const result = await deletePost(answerId, 'answer', 'mod1');
        expect(result).toEqual({ success: true });
      });

      it('should delete all answers and comments associated with a question and the question itself', async () => {
        const questionId = '1234567890abcdef12345678';
        const answerIds = ['answer1', 'answer2'];
        const commentIds = ['comment1', 'comment2'];

        // Mock the data returned by findById for the question
        mockingoose(QuestionModel).toReturn(
          { _id: questionId, answers: answerIds, comments: commentIds },
          'findOne',
        );

        // Mock the deletion operations for answers, comments, and the question
        mockingoose(AnswerModel).toReturn(null, 'deleteMany');
        mockingoose(CommentModel).toReturn(null, 'deleteMany');
        mockingoose(QuestionModel).toReturn(null, 'deleteOne');

        // Mock the update operation for BookmarkCollectionModel
        mockingoose(BookmarkCollectionModel).toReturn(null, 'updateMany');

        // Call the deletePost function
        const result = await deletePost(questionId, 'question', 'mod1');

        // Assertions
        expect(result).toEqual({ success: true });
      });
    });

    describe('getFlag', () => {
      test('should retrieve a flag by ID', async () => {
        const flagId = new mongoose.Types.ObjectId('507f191e810c19729de860ea');
        const flag = {
          _id: flagId,
          reason: 'spam',
          dateFlagged: new Date('2024-11-26T07:54:59.842Z'),
          status: 'pending',
          flaggedBy: 'user1',
          postType: 'question',
          postText: 'Sample question text',
          flaggedUser: 'user2',
        };

        mockingoose(FlagModel).toReturn(flag, 'findOne');

        const result = await getFlag(flagId.toString());

        expect(result).toMatchObject(flag);
      });

      test('should return an error if flag not found', async () => {
        mockingoose(FlagModel).toReturn(null, 'findOne');

        const result = await getFlag('invalidFlagId');

        expect(result).toEqual({ error: 'Error when retrieving flag: Flag not found' });
      });

      test('should return an error if an exception occurs', async () => {
        mockingoose(FlagModel).toReturn(new Error('Database error'), 'findOne');

        const result = await getFlag('someFlagId');

        expect(result).toEqual({
          error: 'Error when retrieving flag: Database error',
        });
      });
    });
  });
});
