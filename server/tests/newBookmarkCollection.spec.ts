import mongoose from 'mongoose';
import supertest from 'supertest';
import * as util from '../models/application';
import { BookmarkCollection } from '../types';
import { app } from '../app';

const mockBookmarkCollection: BookmarkCollection = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  title: 'My Bookmark Collection',
  owner: 'user123',
  isPublic: true,
  followers: [],
  savedPosts: [],
};

describe('Bookmark Controller Tests', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  // Test Create Bookmark Collection
  describe('POST /createCollection', () => {
    it('should create a new bookmark collection successfully', async () => {
      const mockReqBody = {
        username: 'user123',
        title: 'My New Bookmark Collection',
        isPublic: true,
      };

      jest
        .spyOn(util, 'createBookmarkCollection')
        .mockResolvedValueOnce(mockBookmarkCollection as BookmarkCollection);

      const response = await supertest(app).post('/bookmark/createCollection').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockBookmarkCollection,
        _id: mockBookmarkCollection._id?.toString(),
      });
    });

    it('should handle missing username in request body', async () => {
      const mockReqBody = { title: 'My Bookmark Collection', isPublic: true };
      const response = await supertest(app).post('/bookmark/createCollection').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should handle errors during bookmark collection creation', async () => {
      const mockReqBody = { username: 'user123', title: 'My Collection', isPublic: true };

      jest
        .spyOn(util, 'createBookmarkCollection')
        .mockResolvedValueOnce({ error: 'Error creating collection' });

      const response = await supertest(app).post('/bookmark/createCollection').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when creating bookmark collection: Error creating collection',
      );
    });

    it('should create a new bookmark collection', async () => {
      const mockCreateBookmarkCollectionReqBody = {
        username: 'user123',
        title: 'My Bookmark Collection',
        isPublic: true,
      };
      jest
        .spyOn(util, 'createBookmarkCollection')
        .mockResolvedValueOnce(mockBookmarkCollection as BookmarkCollection);

      // Making the request
      const response = await supertest(app)
        .post('/bookmark/createCollection')
        .send(mockCreateBookmarkCollectionReqBody);

      const expectedResponse = {
        _id: mockBookmarkCollection._id?.toString(),
        title: mockBookmarkCollection.title,
        owner: mockBookmarkCollection.owner,
        isPublic: mockBookmarkCollection.isPublic,
        followers: [],
        savedPosts: [],
      };

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it('should return 500 if error occurs in createBookmarkCollection while creating a new bookmark collection', async () => {
      const mockCreateBookmarkCollectionReqBody = {
        username: 'user123',
        title: 'My Bookmark Collection',
        isPublic: true,
      };
      jest
        .spyOn(util, 'createBookmarkCollection')
        .mockResolvedValueOnce({ error: 'Error creating collection' });

      // Making the request
      const response = await supertest(app)
        .post('/bookmark/createCollection')
        .send(mockCreateBookmarkCollectionReqBody);

      // Asserting the response
      expect(response.status).toBe(500);
    });

    it('should return bad request error if request body is missing username', async () => {
      const mockCreateBookmarkCollectionReqBody = {
        title: 'My Bookmark Collection',
        isPublic: true,
      };

      // Making the request
      const response = await supertest(app)
        .post('/bookmark/createCollection')
        .send(mockCreateBookmarkCollectionReqBody);

      // Asserting the response
      expect(response.status).toBe(400);
    });

    it('should return bad request error if request body is missing title', async () => {
      const mockCreateBookmarkCollectionReqBody = {
        username: 'user123',
        isPublic: true,
      };

      // Making the request
      const response = await supertest(app)
        .post('/bookmark/createCollection')
        .send(mockCreateBookmarkCollectionReqBody);

      // Asserting the response
      expect(response.status).toBe(400);
    });

    it('should return bad request error if request body is missing isPublic', async () => {
      const mockCreateBookmarkCollectionReqBody = {
        username: 'user123',
        title: 'My Bookmark Collection',
      };

      // Making the request
      const response = await supertest(app)
        .post('/bookmark/createCollection')
        .send(mockCreateBookmarkCollectionReqBody);

      // Asserting the response
      expect(response.status).toBe(400);
    });
  });

  // Test Add Question to Bookmark Collection
  describe('POST /addQuestionToCollection', () => {
    it('should return 400 for missing collectionId', async () => {
      const response = await supertest(app)
        .post('/bookmark/addQuestionToCollection')
        .send({ postId: '65e9b58910afe6e94fc6e6fe' });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should return 500 for addQuestionToBookmarkCollection error', async () => {
      const mockReqBody = {
        collectionId: '507f191e810c19729de860ea',
        postId: '65e9b58910afe6e94fc6e6fe',
      };

      jest
        .spyOn(util, 'addQuestionToBookmarkCollection')
        .mockResolvedValueOnce({ error: 'Error adding question' });

      const response = await supertest(app)
        .post('/bookmark/addQuestionToCollection')
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when adding question to collection');
    });
  });

  // Test Follow Bookmark Collection
  describe('POST /followCollection', () => {
    it('should allow a user to follow a collection successfully', async () => {
      const mockReqBody = {
        collectionId: '507f191e810c19729de860ea',
        username: 'user456',
      };

      const updatedCollection = {
        ...mockBookmarkCollection,
        followers: ['user456'],
      };

      jest
        .spyOn(util, 'followBookmarkCollection')
        .mockResolvedValueOnce(updatedCollection as BookmarkCollection);

      const response = await supertest(app).post('/bookmark/followCollection').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.followers).toContain('user456');
    });

    it('should return 400 for missing username in follow request', async () => {
      const response = await supertest(app)
        .post('/bookmark/followCollection')
        .send({ collectionId: '507f191e810c19729de860ea' });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Invalid request');
    });

    it('should return 500 for followBookmarkCollection error', async () => {
      const mockReqBody = {
        collectionId: '507f191e810c19729de860ea',
        username: 'user123',
      };

      jest
        .spyOn(util, 'followBookmarkCollection')
        .mockResolvedValueOnce({ error: 'Error following collection' });

      const response = await supertest(app).post('/bookmark/followCollection').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when following collection');
    });
  });

  // Additional Tests for Edge Cases
  describe('Edge Cases', () => {
    it('should handle invalid MongoDB IDs gracefully', async () => {
      const response = await supertest(app)
        .post('/bookmark/addQuestionToCollection')
        .send({ collectionId: 'invalid-id', postId: '65e9b58910afe6e94fc6e6fe' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when adding question to collection');
    });

    it('should return empty array for non-existent user collections', async () => {
      jest.spyOn(util, 'getUserBookmarkCollections').mockResolvedValueOnce([]);

      const response = await supertest(app).get('/bookmark/getUserCollections/user123/user456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /createCollection (Banned and Shadow-Banned Users)', () => {
    afterEach(async () => {
      jest.resetAllMocks(); // Reset all mocks
    });

    it('should return 403 if the user is banned', async () => {
      const mockReqBody = {
        username: 'bannedUser',
        title: 'Collection Title',
        isPublic: true,
      };

      jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

      const response = await supertest(app).post('/bookmark/createCollection').send(mockReqBody);

      expect(response.status).toBe(403);
      expect(response.text).toBe('Your account has been banned');
    });

    it('should return 403 if the user is shadow-banned', async () => {
      const mockReqBody = {
        username: 'shadowBannedUser',
        title: 'Collection Title',
        isPublic: true,
      };

      jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
      jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(true);

      const response = await supertest(app).post('/bookmark/createCollection').send(mockReqBody);

      expect(response.status).toBe(403);
      expect(response.text).toBe(
        'You are not allowed to post since you did not adhere to community guidelines',
      );
    });
  });
});
