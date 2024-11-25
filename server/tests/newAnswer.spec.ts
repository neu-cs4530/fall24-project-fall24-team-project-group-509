import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../app';
import * as util from '../models/application';
import * as profanityUtil from '../profanityFilter';

const saveAnswerSpy = jest.spyOn(util, 'saveAnswer');
const addAnswerToQuestionSpy = jest.spyOn(util, 'addAnswerToQuestion');
const popDocSpy = jest.spyOn(util, 'populateDocument');
const isUserBannedSpy = jest.spyOn(util, 'isUserBanned');
const isUserShadowBannedSpy = jest.spyOn(util, 'isUserShadowBanned');
const updateActivityHistorySpy = jest.spyOn(util, 'updateActivityHistoryWithQuestionID');
const checkProfanitySpy = jest.spyOn(profanityUtil, 'checkProfanity');

describe('POST /addAnswer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    updateActivityHistorySpy.mockResolvedValueOnce(undefined);

    const populatedAns = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    popDocSpy.mockResolvedValueOnce(populatedAns);

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validAid.toString(),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: mockAnswer.ansDateTime.toISOString(),
      comments: [],
    });
  });

  it('should return 403 if the user is banned', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'bannedUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    // Mock 'isUserBanned' to return true
    isUserBannedSpy.mockResolvedValueOnce(true);

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(403);
    expect(response.text).toBe('Your account has been banned');
  });

  it('should return 403 if the user is shadow banned', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'shadowBannedUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(true);

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(403);
    expect(response.text).toBe(
      'You are not allowed to post since you did not adhere to community guidelines',
    );
  });

  it('should return 400 if the answer text contains profanity', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a profane answer',
        ansBy: 'someUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({
      hasProfanity: true,
      censored: 'This is a *** answer',
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Profanity detected in answer text: This is a *** answer');
  });

  it('should return 500 if updateActivityHistoryWithQuestionID throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    updateActivityHistorySpy.mockImplementationOnce(() => {
      throw new Error('Failed to update activity history');
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer:');
    expect(response.text).toContain('Failed to update activity history');
  });

  it('should return 500 if checkProfanity throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'someUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockImplementationOnce(() => {
      throw new Error('Profanity service unavailable');
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Profanity service unavailable');
  });

  it('should return 500 if addAnswerToQuestion throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockImplementationOnce(() => {
      throw new Error('Failed to add answer to question');
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Failed to add answer to question');
  });

  it('should return 500 if saveAnswer throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    saveAnswerSpy.mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Database connection error');
  });

  it('should return 500 if populateDocument throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    updateActivityHistorySpy.mockResolvedValueOnce(undefined);

    popDocSpy.mockImplementationOnce(() => {
      throw new Error('Failed to populate document');
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Failed to populate document');
  });

  // Existing tests for invalid requests
  it('should return bad request error if answer text property is missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body has qid property missing', async () => {
    const mockReqBody = {
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if answer object has ansBy property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if answer object has ansDateTime property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/answer/addAnswer');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return database error in response if saveAnswer method returns an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Error when saving an answer');
  });

  it('should return database error in response if addAnswerToQuestion method returns an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain(
      'Error when adding answer: Error when adding answer to question',
    );
  });

  it('should return database error in response if populateDocument method returns an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    isUserBannedSpy.mockResolvedValueOnce(false);
    isUserShadowBannedSpy.mockResolvedValueOnce(false);
    checkProfanitySpy.mockResolvedValueOnce({ hasProfanity: false, censored: '' });

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
    updateActivityHistorySpy.mockResolvedValueOnce(undefined);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when adding answer: Error when populating document');
  });

  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validAid.toString(),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: mockAnswer.ansDateTime.toISOString(),
      comments: [],
    });
  });

  it('should return bad request error if answer text property is missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body has qid property missing', async () => {
    const mockReqBody = {
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansBy property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansDateTime property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/answer/addAnswer');

    expect(response.status).toBe(400);
  });

  it('should return database error in response if saveAnswer method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if update question method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if `populateDocument` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });
});
