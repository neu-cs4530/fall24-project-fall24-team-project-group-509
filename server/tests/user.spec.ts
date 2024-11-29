import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { User } from '../types';
import * as utils from '../profanityFilter';

jest.mock('../profanityFilter', () => ({
  checkProfanity: jest.fn(),
}));

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

  it('should return 500 error if getUserByUsername throws an error', async () => {
    const mockReqParams = {
      username: 'user1',
    };
    const mockReqQuery = {
      requesterUsername: 'requesterUsername',
    };

    jest.spyOn(util, 'getUserByUsername').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching user by username: Database error');
  });
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

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'addUserBio').mockResolvedValueOnce(mockUser as User);
    jest.spyOn(utils, 'checkProfanity').mockResolvedValueOnce({
      hasProfanity: false,
      censored: 'I love capybaras',
    });

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 400 when request is invalid (missing username)', async () => {
    const invalidRequestBody = {
      bio: 'I love capybaras',
    };

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(invalidRequestBody);

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 403 when user is banned', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'I love capybaras',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(403);
    expect(response.text).toBe('Your account has been banned');
  });

  it('should return 403 when user is shadow banned', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'I love capybaras',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(true);

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(403);
    expect(response.text).toBe(
      'You are not allowed to post since you did not adhere to community guidelines',
    );
  });

  it('should return 400 when bio contains profanity', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'This is a bad word',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest.spyOn(utils, 'checkProfanity').mockResolvedValueOnce({
      hasProfanity: true,
      censored: 'This is a **** word',
    });

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Profanity detected in bio: This is a **** word');
  });

  it('should return 500 when addUserBio throws an error', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'I love capybaras',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest.spyOn(utils, 'checkProfanity').mockResolvedValueOnce({
      hasProfanity: false,
      censored: 'I love capybaras',
    });
    jest.spyOn(util, 'addUserBio').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user bio: Database error');
  });
});

describe('Post /addUserProfilePic', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should add a new profile picture', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    const mockUser: User = {
      username: 'user1',
      profilePictureURL: 'http://example.com/profile.jpg',
      password: '',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'addUserProfilePicture').mockResolvedValueOnce(mockUser as User);

    // Making the request
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 400 when username is missing', async () => {
    const mockFileBuffer = Buffer.from('fake image content');

    // Making the request without username
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 400 when profile picture file is missing', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    // Making the request without profilePictureFile
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username);

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 403 when user is banned', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    // Making the request
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    // Asserting the response
    expect(response.status).toBe(403);
    expect(response.text).toBe('Your account has been banned');
  });

  it('should return 403 when user is shadow banned', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(true);

    // Making the request
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    // Asserting the response
    expect(response.status).toBe(403);
    expect(response.text).toBe(
      'You are not allowed to post since you did not adhere to community guidelines',
    );
  });

  it('should return 400 when file type is invalid', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);

    // Making the request with invalid file type
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.txt');

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid file type. File must be a jpg, jpeg, or png');
  });

  it('should return 500 when addUserProfilePicture throws an error', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'addUserProfilePicture').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user profile picture: Database error');
  });
});

describe('Get /search/:username', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should return list of matching users when username is provided', async () => {
    const mockUsers: User[] = [
      {
        username: 'user1',
        bio: 'Bio 1',
        profilePictureURL: 'url1',
        password: '',
      },
      {
        username: 'user2',
        bio: 'Bio 2',
        profilePictureURL: 'url2',
        password: '',
      },
    ];

    jest.spyOn(util, 'searchUsersByUsername').mockResolvedValueOnce(mockUsers);

    // Making the request
    const response = await supertest(app).get(`/user/search/user`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  it('should return 500 when searchUsersByUsername throws an error', async () => {
    jest.spyOn(util, 'searchUsersByUsername').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app).get(`/user/search/user`);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching user by username: Database error');
  });
});

describe('Get /isBanned/:username', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should return true when user is banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    // Making the request
    const response = await supertest(app).get(`/user/isBanned/user1`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toBe(true);
  });

  it('should return false when user is not banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);

    // Making the request
    const response = await supertest(app).get(`/user/isBanned/user1`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toBe(false);
  });

  it('should return 500 when isUserBanned throws an error', async () => {
    jest.spyOn(util, 'isUserBanned').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app).get(`/user/isBanned/user1`);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when checking if user is banned: Database error');
  });
});
