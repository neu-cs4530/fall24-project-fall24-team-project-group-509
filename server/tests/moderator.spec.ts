import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { Flag } from '../types';

const getPendingFlagsSpy = jest.spyOn(util, 'getPendingFlags');
const getFlagSpy = jest.spyOn(util, 'getFlag');
const deletePostSpy = jest.spyOn(util, 'deletePost');
const banUserSpy = jest.spyOn(util, 'banUser');
const markFlagAsReviewedSpy = jest.spyOn(util, 'markFlagAsReviewed');
const unbanUserSpy = jest.spyOn(util, 'unbanUser');
const shadowBanUserSpy = jest.spyOn(util, 'shadowBanUser');
const unshadowBanUserSpy = jest.spyOn(util, 'unshadowBanUser');

describe('Moderator Controller Tests', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    it('should return 500 if getFlag throws an error', async () => {
      getFlagSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app)
        .get('/moderator/getFlag/flag1')
        .query({ username: 'mod1' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching flag: Database error');
      expect(getFlagSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getFlag returns an object with an error', async () => {
      getFlagSpy.mockResolvedValueOnce({ error: 'Unexpected error' });

      const response = await supertest(app)
        .get('/moderator/getFlag/flag1')
        .query({ username: 'mod1' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching flag: Unexpected error');
      expect(getFlagSpy).toHaveBeenCalledTimes(1);
    });

    it('should return the flag successfully if getFlag resolves with a valid flag', async () => {
      const mockFlag: Flag = {
        _id: 'flag1',
        flaggedBy: 'user123',
        reason: 'spam',
        dateFlagged: new Date(),
        status: 'pending',
        postId: 'post123',
        postType: 'question',
        postText: 'This is a flagged post',
        flaggedUser: 'user456',
      };

      getFlagSpy.mockResolvedValueOnce(mockFlag);

      const response = await supertest(app)
        .get('/moderator/getFlag/flag1')
        .query({ username: 'mod1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockFlag,
        dateFlagged: mockFlag.dateFlagged.toISOString(),
      });
      expect(getFlagSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /deletePost', () => {
    it('should delete a post successfully', async () => {
      // Mock successful deletion
      deletePostSpy.mockResolvedValueOnce({ success: true });

      const response = await supertest(app).post('/moderator/deletePost').send({
        id: 'post123',
        type: 'question',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post deleted successfully' });
      expect(deletePostSpy).toHaveBeenCalledWith('post123', 'question', 'mod1');
      expect(deletePostSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if deletePost returns an error', async () => {
      // Mock unsuccessful deletion with an error message
      deletePostSpy.mockResolvedValueOnce({
        success: false,
        message: 'Post could not be deleted',
      });

      const response = await supertest(app).post('/moderator/deletePost').send({
        id: 'post123',
        type: 'question',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Post could not be deleted');
      expect(deletePostSpy).toHaveBeenCalledWith('post123', 'question', 'mod1');
      expect(deletePostSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if deletePost throws an error', async () => {
      // Mock deletePost to throw an error
      deletePostSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/deletePost').send({
        id: 'post123',
        type: 'question',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when deleting post: Database error');
      expect(deletePostSpy).toHaveBeenCalledWith('post123', 'question', 'mod1');
      expect(deletePostSpy).toHaveBeenCalledTimes(1);
    });
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

    it('should return 400 if username or moderatorUsername is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/banUser')
        .send({ moderatorUsername: 'mod1' }); // Missing username

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(banUserSpy).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app).post('/moderator/banUser').send({
        username: 'user123',
        moderatorUsername: 'nonModeratorUser',
      });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(banUserSpy).not.toHaveBeenCalled();
    });

    it('should return 200 if the user is banned successfully', async () => {
      banUserSpy.mockResolvedValueOnce({
        username: 'user123',
        password: 'hashedpassword',
        bio: 'User bio',
        profilePictureURL: 'https://example.com/pic.jpg',
        activityHistory: [],
        bookmarkCollections: [],
        followedBookmarkCollections: [],
        isBanned: true,
        isShadowBanned: false,
      });

      const response = await supertest(app).post('/moderator/banUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User user123 has been banned' });
      expect(banUserSpy).toHaveBeenCalledWith('user123');
      expect(banUserSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if banUser returns an error', async () => {
      // Mock error response
      banUserSpy.mockResolvedValueOnce({ error: 'User could not be banned' });

      const response = await supertest(app).post('/moderator/banUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when banning user: User could not be banned');
      expect(banUserSpy).toHaveBeenCalledWith('user123');
      expect(banUserSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if banUser throws an error', async () => {
      // Mock exception
      banUserSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/banUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when banning user: Database error');
      expect(banUserSpy).toHaveBeenCalledWith('user123');
      expect(banUserSpy).toHaveBeenCalledTimes(1);
    });
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

    it('should return pending flags successfully for a moderator', async () => {
      const mockFlags: Flag[] = [
        {
          _id: 'flag1',
          flaggedBy: 'user123',
          reason: 'spam',
          dateFlagged: new Date('2024-11-29T08:14:16.441Z'),
          status: 'pending',
          postId: 'post123',
          postType: 'question',
          postText: 'This is a flagged post',
          flaggedUser: 'user456',
        },
      ];

      getPendingFlagsSpy.mockResolvedValueOnce(mockFlags);

      const response = await supertest(app)
        .get('/moderator/pendingFlags')
        .query({ username: 'mod1' });

      const expectedFlags = mockFlags.map(flag => ({
        ...flag,
        dateFlagged: flag.dateFlagged.toISOString(), // Convert Date object to string
      }));

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedFlags);
      expect(getPendingFlagsSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getPendingFlags throws an error', async () => {
      // Mock the function to throw an error
      getPendingFlagsSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app)
        .get('/moderator/pendingFlags')
        .query({ username: 'mod1' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching pending flags: Database error');
      expect(getPendingFlagsSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if getPendingFlags returns an object with an error', async () => {
      // Mock the function to return an object with an error property
      getPendingFlagsSpy.mockResolvedValueOnce({ error: 'Some error occurred' });

      const response = await supertest(app)
        .get('/moderator/pendingFlags')
        .query({ username: 'mod1' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching pending flags: Some error occurred');
      expect(getPendingFlagsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /reviewFlag', () => {
    it('should return 400 if flagId or moderatorUsername is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/reviewFlag')
        .send({ moderatorUsername: 'mod1' }); // Missing flagId

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(markFlagAsReviewedSpy).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app).post('/moderator/reviewFlag').send({
        flagId: 'flag123',
        moderatorUsername: 'nonModeratorUser',
      });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(markFlagAsReviewedSpy).not.toHaveBeenCalled();
    });

    it('should return 200 if the flag is marked as reviewed successfully', async () => {
      // Mock successful response
      markFlagAsReviewedSpy.mockResolvedValueOnce({ success: true });

      const response = await supertest(app).post('/moderator/reviewFlag').send({
        flagId: 'flag123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Flag marked as reviewed' });
      expect(markFlagAsReviewedSpy).toHaveBeenCalledWith('flag123', 'mod1');
      expect(markFlagAsReviewedSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if markFlagAsReviewed returns an error', async () => {
      // Mock failure response
      markFlagAsReviewedSpy.mockResolvedValueOnce({
        success: false,
        message: 'Failed to mark flag as reviewed',
      });

      const response = await supertest(app).post('/moderator/reviewFlag').send({
        flagId: 'flag123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Failed to mark flag as reviewed');
      expect(markFlagAsReviewedSpy).toHaveBeenCalledWith('flag123', 'mod1');
      expect(markFlagAsReviewedSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if markFlagAsReviewed throws an error', async () => {
      // Mock exception
      markFlagAsReviewedSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/reviewFlag').send({
        flagId: 'flag123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when marking flag as reviewed: Database error');
      expect(markFlagAsReviewedSpy).toHaveBeenCalledWith('flag123', 'mod1');
      expect(markFlagAsReviewedSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('POST /unbanUser', () => {
    it('should return 400 if username or moderatorUsername is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/unbanUser')
        .send({ moderatorUsername: 'mod1' }); // Missing username

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(unbanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app).post('/moderator/unbanUser').send({
        username: 'user123',
        moderatorUsername: 'nonModeratorUser',
      });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(unbanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 200 if the user is unbanned successfully', async () => {
      unbanUserSpy.mockResolvedValueOnce({
        username: 'user123',
        password: 'hashedpassword', // Add password if it's part of the User schema
        bio: 'Sample bio', // Optional field
        profilePictureURL: 'https://example.com/pic.jpg', // Optional field
        activityHistory: [], // Optional array
        bookmarkCollections: [], // Optional array
        followedBookmarkCollections: [], // Optional array
        isBanned: true, // Indicates user is banned
        isShadowBanned: false, // Optional field
      });

      const response = await supertest(app).post('/moderator/unbanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User user123 has been unbanned' });
      expect(unbanUserSpy).toHaveBeenCalledWith('user123');
    });

    it('should return 500 if unbanUser returns an error', async () => {
      unbanUserSpy.mockResolvedValueOnce({ error: 'User could not be unbanned' });

      const response = await supertest(app).post('/moderator/unbanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when unbanning user: User could not be unbanned');
    });

    it('should return 500 if unbanUser throws an error', async () => {
      unbanUserSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/unbanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when unbanning user: Database error');
    });
  });

  describe('POST /shadowBanUser', () => {
    it('should return 400 if username or moderatorUsername is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/shadowBanUser')
        .send({ moderatorUsername: 'mod1' });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(shadowBanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app).post('/moderator/shadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'nonModeratorUser',
      });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(shadowBanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 200 if the user is shadow banned successfully', async () => {
      shadowBanUserSpy.mockResolvedValueOnce({
        username: 'user123',
        password: 'hashedpassword', // Add password if it's part of the User schema
        bio: 'Sample bio', // Optional field
        profilePictureURL: 'https://example.com/pic.jpg', // Optional field
        activityHistory: [], // Optional array
        bookmarkCollections: [], // Optional array
        followedBookmarkCollections: [], // Optional array
        isBanned: true, // Indicates user is banned
        isShadowBanned: false, // Optional field
      });

      const response = await supertest(app).post('/moderator/shadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User user123 has been shadow banned' });
    });

    it('should return 500 if shadowBanUser returns an error', async () => {
      shadowBanUserSpy.mockResolvedValueOnce({ error: 'Shadow ban failed' });

      const response = await supertest(app).post('/moderator/shadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when shadow banning user: Shadow ban failed');
    });

    it('should return 500 if shadowBanUser throws an error', async () => {
      shadowBanUserSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/shadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when shadow banning user: Database error');
    });
  });

  describe('POST /unshadowBanUser', () => {
    it('should return 400 if username or moderatorUsername is missing', async () => {
      const response = await supertest(app)
        .post('/moderator/unshadowBanUser')
        .send({ moderatorUsername: 'mod1' });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
      expect(unshadowBanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not a moderator', async () => {
      const response = await supertest(app).post('/moderator/unshadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'nonModeratorUser',
      });

      expect(response.status).toBe(403);
      expect(response.text).toContain('User is not authorized');
      expect(unshadowBanUserSpy).not.toHaveBeenCalled();
    });

    it('should return 200 if the user is un-shadow banned successfully', async () => {
      unshadowBanUserSpy.mockResolvedValueOnce({
        username: 'user123',
        password: 'hashedpassword', // Add password if it's part of the User schema
        bio: 'Sample bio', // Optional field
        profilePictureURL: 'https://example.com/pic.jpg', // Optional field
        activityHistory: [], // Optional array
        bookmarkCollections: [], // Optional array
        followedBookmarkCollections: [], // Optional array
        isBanned: true, // Indicates user is banned
        isShadowBanned: false, // Optional field
      });

      const response = await supertest(app).post('/moderator/unshadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User user123 has been un-shadow banned' });
    });

    it('should return 500 if unshadowBanUser returns an error', async () => {
      unshadowBanUserSpy.mockResolvedValueOnce({ error: 'Un-shadow ban failed' });

      const response = await supertest(app).post('/moderator/unshadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when un-shadow banning user: Un-shadow ban failed');
    });

    it('should return 500 if unshadowBanUser throws an error', async () => {
      unshadowBanUserSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/moderator/unshadowBanUser').send({
        username: 'user123',
        moderatorUsername: 'mod1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when un-shadow banning user: Database error');
    });
  });
});
