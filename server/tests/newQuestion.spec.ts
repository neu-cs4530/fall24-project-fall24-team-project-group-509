import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { Answer, Question, Tag } from '../types';
import * as utils from '../profanityFilter';

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

const mockQuestion: Question = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6fe'),
  title: 'New Question Title',
  text: 'New Question Text',
  tags: [tag1, tag2],
  answers: [],
  askedBy: 'question3_user',
  askDateTime: new Date('2024-06-06'),
  views: [],
  upVotes: [],
  downVotes: [],
  comments: [],
  flags: [],
};

const simplifyQuestion = (question: Question) => ({
  ...question,
  _id: question._id?.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => ({ ...tag, _id: tag._id?.toString() })), // Converting tag ObjectId
  answers: question.answers.map(answer => ({
    ...answer,
    _id: answer._id?.toString(),
    ansDateTime: (answer as Answer).ansDateTime.toISOString(),
  })), // Converting answer ObjectId
  askDateTime: question.askDateTime.toISOString(),
});

describe('POST /addQuestion', () => {
  afterEach(async () => {
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should add a new question', async () => {
    jest.spyOn(util, 'processTags').mockResolvedValue([tag1, tag2]);
    jest.spyOn(util, 'saveQuestion').mockResolvedValue(mockQuestion);
    jest.spyOn(util, 'populateDocument').mockResolvedValue(mockQuestion);

    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({
        ...mockQuestion,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(simplifyQuestion(mockQuestion));
  });

  it('should return 500 if error occurs in `saveQuestion`', async () => {
    jest.spyOn(util, 'processTags').mockResolvedValue([tag1, tag2]);
    jest.spyOn(util, 'saveQuestion').mockResolvedValue({ error: 'Error while saving question' });

    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({
        ...mockQuestion,
      });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when saving question: Error while saving question');
  });

  it('should return 400 if tags are invalid', async () => {
    jest.spyOn(util, 'processTags').mockResolvedValue([]);

    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({
        ...mockQuestion,
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid tags');
  });

  it('should return 400 if question title is empty', async () => {
    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({ ...mockQuestion, title: '' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid question body');
  });

  it('should return 400 if question text is empty', async () => {
    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({ ...mockQuestion, text: '' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid question body');
  });

  it('should return 400 if `askedBy` is empty', async () => {
    const response = await supertest(app)
      .post('/question/addQuestion')
      .send({ ...mockQuestion, askedBy: '' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid question body');
  });

  it('should ensure only unique tags are added', async () => {
    const mockQuestionDuplicates = {
      ...mockQuestion,
      tags: [tag1, tag1, tag2, tag2],
    };

    jest.spyOn(util, 'processTags').mockResolvedValue([tag1, tag2]);
    jest.spyOn(util, 'saveQuestion').mockResolvedValue({
      ...mockQuestionDuplicates,
      tags: [tag1, tag2],
    });
    jest.spyOn(util, 'populateDocument').mockResolvedValue({
      ...mockQuestion,
      tags: [tag1, tag2],
    });

    const response = await supertest(app)
      .post('/question/addQuestion')
      .send(mockQuestionDuplicates);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      simplifyQuestion({
        ...mockQuestion,
        tags: [tag1, tag2],
      }),
    );
  });

  it('should return 403 if user is banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

    expect(response.status).toBe(403);
    expect(response.text).toBe('Your account has been banned');
  });

  it('should return 403 if user is shadow banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(true);

    const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

    expect(response.status).toBe(403);
    expect(response.text).toBe(
      'You are not allowed to post since you did not adhere to community guidelines',
    );
  });

  it('should return 400 if tags are missing or empty', async () => {
    const questionWithoutTags = {
      ...mockQuestion,
      tags: '',
    };

    const response = await supertest(app).post('/question/addQuestion').send(questionWithoutTags);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid question body');
  });

  it('should return 400 if profanity is detected in title or text', async () => {
    jest.spyOn(utils, 'checkProfanity').mockImplementation(async (text: string) => {
      if (text === 'New Question Title') {
        return { hasProfanity: true, censored: 'Censored Title' };
      }
      return { hasProfanity: false, censored: text };
    });

    const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Profanity detected: New Question Text');
  });
});
