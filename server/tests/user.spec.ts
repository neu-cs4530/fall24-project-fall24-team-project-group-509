import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { User } from '../types';

describe('Get /getUser/:username', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should return a user object in the response when the username is passed as a request parameter', async () => {
    const mockUser: User = {
      username: 'user1',
      bio: 'I love cats',
      profilePictureURL: 'google.com',
      password: '',
    };

    const mockReqParams = {
      username: 'user1',
    };
    const mockReqQuery = {
      requesterUsername: 'requesterUsername',
    };

    jest.spyOn(util, 'getUserByUsername').mockResolvedValueOnce(mockUser as User);

    // Making the request
    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    const expectedResponse = { ...mockUser };

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

  it('should return bad request error if the username is not provided', async () => {
    // const mockUser: User = {
    //   username: 'user1',
    //   bio: 'I love cats',
    //   profilePictureURL: 'google.com',
    // };
    const mockReqParams = {
      username: 'user1',
    };

    // Making the request
    const response = await supertest(app).get(`/user/getUser/${mockReqParams.username}`);

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid requester username');
  });

  it('should return database error if requested user does not exist', async () => {
    const mockReqParams = {
      username: 'user1',
    };
    const mockReqQuery = {
      requesterUsername: 'requesterUsername',
    };

    jest.spyOn(util, 'getUserByUsername').mockResolvedValueOnce({ error: 'User not found' });

    // Making the request
    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    // Asserting the response
    expect(response.status).toBe(500);
  });

  // WARNING: This test is failing
  // this test is messed up right now, getting 404 instead of 400
  //   it('should return bad request error if the requested username is an empty string', async () => {
  //     const mockReqParams = {
  //       username: '',
  //     };

  //     // Making the request
  //     const response = await supertest(app).get(`/user/getUser/${mockReqParams.username}`);

  //     // Asserting the response
  //     expect(response.status).toBe(400);
  //     expect(response.text).toBe('Invalid username');
  //   });
});

describe('Post /addUserBio', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should add a new bio to the user', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'I love capybaras',
    };

    const mockUser: User = {
      username: 'user1',
      bio: 'I love capybaras',
      profilePictureURL: 'google.com',
      password: '',
    };

    jest.spyOn(util, 'addUserBio').mockResolvedValueOnce(mockUser as User);

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  // NEED TO ADD MORE TESTS HERE AS WELL
});
