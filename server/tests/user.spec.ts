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
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    const expectedResponse = { ...mockUser };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

  it('should return bad request error if the username is not provided', async () => {
    const mockReqParams = {
      username: 'user1',
    };

    const response = await supertest(app).get(`/user/getUser/${mockReqParams.username}`);

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

    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

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

    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching user by username: Database error');
  });

  it('should return 400 when username is an empty string', async () => {
    const response = await supertest(app).get(`/user/getUser/%20`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid username');
  });

  it('should return 500 when an unexpected error occurs', async () => {
    const mockReqParams = {
      username: 'testuser',
    };
    const mockReqQuery = {
      requesterUsername: 'requester',
    };

    jest.spyOn(util, 'getUserByUsername').mockImplementationOnce(() => {
      throw new Error();
    });

    const response = await supertest(app).get(
      `/user/getUser/${mockReqParams.username}?requesterUsername=${mockReqQuery.requesterUsername}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching user by username');
  });
});

describe('Post /addUserBio', () => {
  afterEach(async () => {
    await mongoose.connection.close();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 400 when request is invalid (missing username)', async () => {
    const invalidRequestBody = {
      bio: 'I love capybaras',
    };

    const response = await supertest(app).post('/user/addUserBio').send(invalidRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 403 when user is banned', async () => {
    const mockRequestBody = {
      username: 'user1',
      bio: 'I love capybaras',
    };

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

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

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

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

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

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

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user bio: Database error');
  });

  it('should return 500 when addUserBio returns an error', async () => {
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
    jest.spyOn(util, 'addUserBio').mockResolvedValueOnce({ error: 'Unable to save bio' });

    const response = await supertest(app).post('/user/addUserBio').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user bio: Unable to save bio');
  });
});

describe('Post /addUserProfilePic', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 400 when username is missing', async () => {
    const mockFileBuffer = Buffer.from('fake image content');

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 400 when profile picture file is missing', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 403 when user is banned', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

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

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

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

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.txt');

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

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user profile picture: Database error');
  });

  it('should return 500 when addUserProfilePicture returns an error', async () => {
    const mockRequestBody = {
      username: 'user1',
    };

    const mockFileBuffer = Buffer.from('fake image content');

    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);
    jest.spyOn(util, 'isUserShadowBanned').mockResolvedValueOnce(false);
    jest
      .spyOn(util, 'addUserProfilePicture')
      .mockResolvedValueOnce({ error: 'Unable to upload profile picture' });

    const response = await supertest(app)
      .post('/user/addUserProfilePic')
      .field('username', mockRequestBody.username)
      .attach('profilePictureFile', mockFileBuffer, 'profile.jpg');

    expect(response.status).toBe(500);
    expect(response.text).toBe(
      'Error when adding user profile picture: Unable to upload profile picture',
    );
  });
});

describe('Get /search/:username', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    const response = await supertest(app).get(`/user/search/user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  it('should return 500 when searchUsersByUsername throws an error', async () => {
    jest.spyOn(util, 'searchUsersByUsername').mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(app).get(`/user/search/user`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching user by username: Database error');
  });

  it('should return 400 when username is not provided', async () => {
    const response = await supertest(app).get(`/user/search/%20`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Username query parameter is required');
  });
});

describe('Get /isBanned/:username', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return true when user is banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(true);

    const response = await supertest(app).get(`/user/isBanned/user1`);

    expect(response.status).toBe(200);
    expect(response.body).toBe(true);
  });

  it('should return false when user is not banned', async () => {
    jest.spyOn(util, 'isUserBanned').mockResolvedValueOnce(false);

    const response = await supertest(app).get(`/user/isBanned/user1`);

    expect(response.status).toBe(200);
    expect(response.body).toBe(false);
  });

  it('should return 500 when isUserBanned throws an error', async () => {
    jest.spyOn(util, 'isUserBanned').mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(app).get(`/user/isBanned/user1`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when checking if user is banned: Database error');
  });
});

describe('Get /notifications/:username', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return notifications when a valid username is provided', async () => {
    const mockUsername = 'user1';
    const mockNotifications = [
      {
        message: 'User1 followed you',
        timestamp: '2024-11-29T12:00:00Z',
        qTitle: 'How to fix errors in TypeScript?',
        collectionId: 'collection123',
        bookmarkCollectionTitle: 'My Favorites',
        createdAt: new Date('2024-11-29T12:00:00Z'),
      },
      {
        message: 'User2 liked your post',
        timestamp: '2024-11-29T12:30:00Z',
        qTitle: 'Understanding Express.js Middleware',
        collectionId: 'collection456',
        bookmarkCollectionTitle: 'Work Notes',
        createdAt: new Date('2024-11-29T12:30:00Z'),
      },
    ];

    jest.spyOn(util, 'getUserFollowUpdateNotifications').mockResolvedValueOnce(mockNotifications);

    const response = await supertest(app).get(`/user/notifications/${mockUsername}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockNotifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      })),
    );
  });

  it('should return 500 when getUserFollowUpdateNotifications throws an error', async () => {
    const mockUsername = 'user1';

    jest
      .spyOn(util, 'getUserFollowUpdateNotifications')
      .mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(app).get(`/user/notifications/${mockUsername}`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving notifications: Database error');
  });

  it('should return 400 when username is not provided', async () => {
    const response = await supertest(app).get(`/user/notifications/%20`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Username is required');
  });
});
