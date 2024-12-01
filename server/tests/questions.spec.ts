import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import * as util from '../models/application';
import { Answer, Question, Tag } from '../types';

const getQuestionsByOrderSpy: jest.SpyInstance = jest.spyOn(util, 'getQuestionsByOrder');
const filterQuestionsBySearchSpy: jest.SpyInstance = jest.spyOn(util, 'filterQuestionsBySearch');
const filterQuestionsByAskedBySpy: jest.SpyInstance = jest.spyOn(util, 'filterQuestionsByAskedBy');

const tag1: Tag = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  name: 'tag1',
  description: 'tag1 description',
};
const tag2: Tag = {
  _id: new mongoose.Types.ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  name: 'tag2',
  description: 'tag2 description',
};

const ans1: Answer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'Answer 1 Text',
  ansBy: 'answer1_user',
  ansDateTime: new Date('2024-06-09'), // The mock date is string type but in the actual implementation it is a Date type
  comments: [],
};

const ans2: Answer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'Answer 2 Text',
  ansBy: 'answer2_user',
  ansDateTime: new Date('2024-06-10'),
  comments: [],
};

const ans3: Answer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'Answer 3 Text',
  ansBy: 'answer3_user',
  ansDateTime: new Date('2024-06-11'),
  comments: [],
};

const ans4: Answer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'Answer 4 Text',
  ansBy: 'answer4_user',
  ansDateTime: new Date('2024-06-14'),
  comments: [],
};

const MOCK_QUESTIONS: Question[] = [
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Question 1 Title',
    text: 'Question 1 Text',
    tags: [tag1],
    answers: [ans1],
    askedBy: 'question1_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Question 2 Title',
    text: 'Question 2 Text',
    tags: [tag2],
    answers: [ans2, ans3],
    askedBy: 'question2_user',
    askDateTime: new Date('2024-06-04'),
    views: ['question1_user', 'question2_user', 'question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new mongoose.Types.ObjectId('34e9b58910afe6e94fc6e99f'),
    title: 'Question 3 Title',
    text: 'Question 3 Text',
    tags: [tag1, tag2],
    answers: [ans4],
    askedBy: 'question3_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

const EXPECTED_QUESTIONS = MOCK_QUESTIONS.map(question => ({
  ...question,
  _id: question._id?.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => ({ ...tag, _id: tag._id?.toString() })), // Converting tag ObjectId
  answers: question.answers.map(answer => ({
    ...answer,
    _id: answer._id?.toString(),
    ansDateTime: (answer as Answer).ansDateTime.toISOString(),
  })), // Converting answer ObjectId
  askDateTime: question.askDateTime.toISOString(),
}));

describe('GET /getQuestion', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should return the result of filterQuestionsBySearch as response even if request parameters of order and search are absent', async () => {
    getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_QUESTIONS);
    filterQuestionsBySearchSpy.mockReturnValueOnce(MOCK_QUESTIONS);
    // Making the request
    const response = await supertest(app).get('/question/getQuestion');

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(EXPECTED_QUESTIONS);
  });

  it('should return the result of filterQuestionsBySearch as response for an order and search criteria in the request parameters', async () => {
    // Mock request query parameters
    const mockReqQuery = {
      order: 'dummyOrder',
      search: 'dummySearch',
    };
    getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_QUESTIONS);
    filterQuestionsBySearchSpy.mockReturnValueOnce(MOCK_QUESTIONS);
    // Making the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(EXPECTED_QUESTIONS);
  });

  it('should return error if getQuestionsByOrder throws an error', async () => {
    // Mock request query parameters
    const mockReqQuery = {
      order: 'dummyOrder',
      search: 'dummySearch',
    };
    getQuestionsByOrderSpy.mockRejectedValueOnce(new Error('Error fetching questions'));
    // Making the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return error if filterQuestionsBySearch throws an error', async () => {
    // Mock request query parameters
    const mockReqQuery = {
      order: 'dummyOrder',
      search: 'dummySearch',
    };
    getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_QUESTIONS);
    filterQuestionsBySearchSpy.mockRejectedValueOnce(new Error('Error filtering questions'));
    // Making the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should filter questions by askedBy if askedBy is provided in query', async () => {
    // Mock request query parameters
    const mockReqQuery = {
      askedBy: 'question1_user',
    };

    getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_QUESTIONS);
    filterQuestionsByAskedBySpy.mockReturnValueOnce(
      MOCK_QUESTIONS.filter(question => question.askedBy === mockReqQuery.askedBy),
    );
    filterQuestionsBySearchSpy.mockResolvedValueOnce(
      MOCK_QUESTIONS.filter(question => question.askedBy === mockReqQuery.askedBy),
    );

    // Making the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Asserting the response
    const expectedFilteredQuestions = EXPECTED_QUESTIONS.filter(
      question => question.askedBy === mockReqQuery.askedBy,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedFilteredQuestions);
  });

  it('should return error if filterQuestionsByAskedBy throws an error', async () => {
    // Mock request query parameters
    const mockReqQuery = {
      askedBy: 'question1_user',
    };

    getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_QUESTIONS);
    filterQuestionsByAskedBySpy.mockImplementationOnce(() => {
      throw new Error('Error filtering questions by askedBy');
    });

    // Making the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toContain(
      'Error when fetching questions by filter: Error filtering questions by askedBy',
    );
  });

  it('should return 500 with a generic error message if an unknown error occurs', async () => {
    // Mock query parameters
    const mockReqQuery = {
      order: 'dummyOrder',
      search: 'dummySearch',
    };

    // Mock `getQuestionsByOrder` to throw a non-Error value
    getQuestionsByOrderSpy.mockImplementationOnce(() => {
      throw 'Unexpected error'; // A string instead of an Error object
    });

    // Make the request
    const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

    // Assert the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching questions by filter');
  });
});
