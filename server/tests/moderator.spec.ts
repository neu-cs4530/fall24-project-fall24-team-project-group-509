import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';

const getPendingFlagsSpy = jest.spyOn(util, 'getPendingFlags');
const getFlagSpy = jest.spyOn(util, 'getFlag');
const deletePostSpy = jest.spyOn(util, 'deletePost');
const banUserSpy = jest.spyOn(util, 'banUser');

describe('Moderator Controller Tests', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /pendingFlags', () => {
    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app)
        .get('/moderator/pendingFlags')
        .query({ username: 'user456' });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(getPendingFlagsSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /getFlag/:fid', () => {
    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app)
        .get('/moderator/getFlag/1')
        .query({ username: 'user456' });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(getFlagSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /deletePost', () => {
    it('should return 403 if the user is not a moderator', async () => {
      const response = await supertest(app)
        .post('/moderator/deletePost')
        .send({ id: '1', type: 'question', moderatorUsername: 'user456' });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(deletePostSpy).not.toHaveBeenCalled();
    });

    it('should return 400 if data is missing in the request', async () => {
      const response = await supertest(app)
        .post('/moderator/deletePost')
        .send({ id: '1', type: 'question' }); // Missing moderatorUsername

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(deletePostSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /banUser', () => {
    it('should return 403 if the user is not a moderator', async () => {
      const response = await supertest(app)
        .post('/moderator/banUser')
        .send({ username: 'user123', moderatorUsername: 'user456' });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(banUserSpy).not.toHaveBeenCalled();
    });

    it('should return 400 if required data is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/banUser')
        .send({ username: 'user123' }); // Missing moderatorUsername

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(banUserSpy).not.toHaveBeenCalled();
    });
  });
});
