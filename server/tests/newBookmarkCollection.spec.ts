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

describe('Post /createCollection', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
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
