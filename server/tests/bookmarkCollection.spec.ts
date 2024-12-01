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

  it('should return the updated collection when a question is successfully removed', async () => {
    const mockRequestBody = {
      collectionId: '507f191e810c19729de860ea',
      postId: '65e9b58910afe6e94fc6e6fe',
    };

    const mockUpdatedCollection = {
      _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
      title: 'My Bookmark Collection',
      owner: 'user123',
      isPublic: true,
      followers: ['user456'],
      savedPosts: [], // Assuming the post was removed
    };

    jest
      .spyOn(util, 'removeQuestionFromBookmarkCollection')
      .mockResolvedValueOnce(mockUpdatedCollection);

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/removeQuestionFromCollection')
      .send(mockRequestBody);

    // Convert the _id field to a string for comparison
    const expectedResponse = {
      ...mockUpdatedCollection,
      _id: mockUpdatedCollection._id.toString(),
    };

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
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

  // Test for valid sortOption
  it('should correctly parse and use sortOption', async () => {
    jest.spyOn(util, 'getUserBookmarkCollections').mockResolvedValueOnce([]);

    const response = await supertest(app)
      .get('/bookmark/getUserCollections/user123/requester456')
      .query({ sortOption: 'date' });

    // Assert that the sortOption was accepted and the request processed successfully
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]); // Assuming mocked data is an empty array
  });

  // Test for invalid sortOption
  it('should return 400 if sortOption is invalid', async () => {
    const response = await supertest(app)
      .get('/bookmark/getUserCollections/user123/requester456')
      .query({ sortOption: 'invalidOption' });

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid sortOption');
  });

  // Test for unexpected errors
  it('should return 500 if an unexpected error occurs', async () => {
    jest.spyOn(util, 'getUserBookmarkCollections').mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const response = await supertest(app).get('/bookmark/getUserCollections/user123/requester456');

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when retrieving bookmark collections: Unexpected error');
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

  it('should return the updated collection when successfully unfollowed', async () => {
    const mockUnfollowCollectionReqBody = {
      collectionId: '507f191e810c19729de860ea',
      username: 'user123',
    };

    const mockUpdatedCollection = {
      _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'), // Use ObjectId
      title: 'My Bookmark Collection',
      owner: 'user123',
      isPublic: true,
      followers: ['user456'], // Assuming one less follower after unfollow
      savedPosts: [],
    };

    jest.spyOn(util, 'unfollowBookmarkCollection').mockResolvedValueOnce(mockUpdatedCollection);

    // Making the request
    const response = await supertest(app)
      .post('/bookmark/unfollowCollection')
      .send(mockUnfollowCollectionReqBody);

    // Convert the _id field to a string for comparison
    const expectedResponse = {
      ...mockUpdatedCollection,
      _id: mockUpdatedCollection._id.toString(),
    };

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
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

describe('GET /getUserCollections/:username/:requesterUsername (Invalid Sort Option)', () => {
  it('should return 400 if the sortOption is invalid', async () => {
    const response = await supertest(app).get(
      '/bookmark/getUserCollections/username/requesterUsername?sortOption=invalidOption',
    );

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid sortOption');
  });
});
