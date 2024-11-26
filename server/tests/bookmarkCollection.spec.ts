import mongoose from 'mongoose';
import supertest from 'supertest';
import * as util from '../models/application';
import { app } from '../app';
import { BookmarkCollection } from '../types';

describe('Post /addQuestionToCollection', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return 500 if error occurs in addQuestionToBookmarkCollection while adding a question to a bookmark collection', async () => {
    const mockAddQuestionToCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
      postId: '65e9b58910afe6e94fc6e6fe',
    };

    jest
      .spyOn(util, 'addQuestionToBookmarkCollection')
      .mockResolvedValueOnce({ error: 'Error adding question to collection' });

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/addQuestionToCollection')
      .send(mockAddQuestionToCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return bad request error if request body is missing collectionId', async () => {
    const mockAddQuestionToCollectionReqBody = {
      postId: '65e9b58910afe6e94fc6e6fe',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/addQuestionToCollection')
      .send(mockAddQuestionToCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing postId', async () => {
    const mockAddQuestionToCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/addQuestionToCollection')
      .send(mockAddQuestionToCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });
});

describe('Post /removeQuestionFromCollection', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return 500 if error occurs in removeQuestionFromBookmarkCollection while removing a question from a bookmark collection', async () => {
    const mockRemoveQuestionFromCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
      postId: '65e9b58910afe6e94fc6e6fe',
    };

    jest
      .spyOn(util, 'removeQuestionFromBookmarkCollection')
      .mockResolvedValueOnce({ error: 'Error removing question from collection' });

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/removeQuestionFromCollection')
      .send(mockRemoveQuestionFromCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return bad request error if request body is missing collectionId', async () => {
    const mockRemoveQuestionFromCollectionReqBody = {
      postId: '65e9b58910afe6e94fc6e6fe',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/removeQuestionFromCollection')
      .send(mockRemoveQuestionFromCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing postId', async () => {
    const mockRemoveQuestionFromCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/removeQuestionFromCollection')
      .send(mockRemoveQuestionFromCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });
});

describe('Get /getUserCollections/:username/:requesterUsername', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return an empty list if the username does not exist in database', async () => {
    const mockReqParams = {
      username: 'user123',
      requester: 'user456',
    };

    jest
      .spyOn(util, 'getUserBookmarkCollections')
      .mockResolvedValueOnce([] as BookmarkCollection[]);

    // Making the request

    const response = await supertest(app).get(
      `/bookmark/getUserCollections/${mockReqParams.username}/${mockReqParams.requester}`,
    );

    // Asserting the response

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('Post /followCollection', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return 500 if error occurs in followBookmarkCollection while following a bookmark collection', async () => {
    const mockFollowCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
      username: 'user123',
    };

    jest
      .spyOn(util, 'followBookmarkCollection')
      .mockResolvedValueOnce({ error: 'Error following collection' });

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/followCollection')
      .send(mockFollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return bad request error if request body is missing collectionId', async () => {
    const mockFollowCollectionReqBody = {
      username: 'user123',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/followCollection')
      .send(mockFollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing username', async () => {
    const mockFollowCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/followCollection')
      .send(mockFollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });

  it('should return a bad request error if the request body is missing the collectionId', async () => {
    const mockFollowCollectionReqBody = {
      username: 'user123',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/followCollection')
      .send(mockFollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });
});

describe('Post /unfollowCollection', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return 500 if error occurs in unfollowBookmarkCollection while unfollowing a bookmark collection', async () => {
    const mockUnfollowCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
      username: 'user123',
    };

    jest
      .spyOn(util, 'unfollowBookmarkCollection')
      .mockResolvedValueOnce({ error: 'Error unfollowing collection' });

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/unfollowCollection')
      .send(mockUnfollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return bad request error if request body is missing collectionId', async () => {
    const mockUnfollowCollectionReqBody = {
      username: 'user123',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/unfollowCollection')
      .send(mockUnfollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing username', async () => {
    const mockUnfollowCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
    };

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/unfollowCollection')
      .send(mockUnfollowCollectionReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
  });
});

describe('Get /getBookmarkCollectionById/:collectionId', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
    jest.resetAllMocks(); // Reset all mocks
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose
  });

  it('should return an error if the collectionId is not found in the database', async () => {
    const mockReqParams = {
      collectionId: '507f191e810c19729de860ea',
    };

    jest
      .spyOn(util, 'getBookmarkCollectionById')
      .mockResolvedValueOnce({ error: 'Collection not found' });

    // Making the request
    const response = await supertest(app).get(
      `/bookmark/getBookmarkCollectionById/${mockReqParams.collectionId}`,
    );

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return bad request error if request params is missing collectionId', async () => {
    // Making the request
    const response = await supertest(app).get('/bookmark/getBookmarkCollectionById/');

    // Asserting the response
    expect(response.status).toBe(404);
  });

  it('should return the bookmark collection if the collectionId is found in the database', async () => {
    const mockReqParams = {
      collectionId: '507f191e810c19729de860ea',
    };

    const mockBookmarkCollection: BookmarkCollection = {
      _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
      title: 'My Bookmark Collection',
      owner: 'user123',
      isPublic: true,
      followers: [],
      savedPosts: [],
    };

    jest
      .spyOn(util, 'getBookmarkCollectionById')
      .mockResolvedValueOnce(mockBookmarkCollection as BookmarkCollection);

    // Making the request
    const response = await supertest(app).get(
      `/bookmark/getBookmarkCollectionById/${mockReqParams.collectionId}`,
    );

    // Convert the _id field to a string for comparison
    const expectedResponse = {
      ...mockBookmarkCollection,
      _id: mockBookmarkCollection._id?.toString(),
    };

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });
});
