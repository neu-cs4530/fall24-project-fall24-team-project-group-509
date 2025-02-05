import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import * as util from '../models/application';
import { app } from '../app';
import { Question } from '../types';

const MOCKPOSTID = '507f191e810c19729de860ea';

describe('Flag Controller Tests', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /flagPost', () => {
    it('should return 200 and a success message when post flagging is successful', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      // Mock a valid Question object
      const mockQuestion: Question = {
        _id: new ObjectId(MOCKPOSTID),
        title: 'Mock Question Title',
        text: 'Mock question text',
        tags: [],
        askedBy: 'user123',
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
      };

      jest.spyOn(util, 'flagPost').mockResolvedValueOnce(mockQuestion);
      jest.spyOn(util, 'removePostFromUserCollections').mockResolvedValueOnce(undefined);
      jest.spyOn(util, 'removePostFromUserActivityHistory').mockResolvedValueOnce(undefined);

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post flagged successfully' });
    });

    it('should return 400 if request body is missing `id`', async () => {
      const mockReqBody = {
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should return 400 if request body is missing `type`', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        reason: 'spam',
        flaggedBy: 'user123',
      };

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should return 400 if request body is missing `reason`', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        flaggedBy: 'user123',
      };

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should return 400 if request body is missing `flaggedBy`', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
      };

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should handle errors returned by the `flagPost` function', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest
        .spyOn(util, 'flagPost')
        .mockResolvedValueOnce({ error: 'Post not found or already flagged' });

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });

    it('should handle unexpected errors during post flagging', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest.spyOn(util, 'flagPost').mockRejectedValueOnce(new Error('Unexpected error'));

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });

    it('should handle invalid `type` in the request body', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'invalidType',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest.spyOn(util, 'flagPost').mockRejectedValueOnce(new Error('Invalid post type'));

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });

    it('should handle invalid MongoDB ObjectID for `id`', async () => {
      const mockReqBody = {
        id: 'invalid-id',
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest.spyOn(util, 'flagPost').mockRejectedValueOnce(new Error('Invalid ID format'));

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });

    it('should handle errors when removing a post from user collections', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest
        .spyOn(util, 'removePostFromUserCollections')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });

    it('should handle errors when removing a post from user activity history', async () => {
      const mockReqBody = {
        id: MOCKPOSTID,
        type: 'question',
        reason: 'spam',
        flaggedBy: 'user123',
      };

      jest
        .spyOn(util, 'removePostFromUserActivityHistory')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/flag/flagPost').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when flagging post');
    });
  });
});
