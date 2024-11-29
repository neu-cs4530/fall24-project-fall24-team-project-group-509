import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { User } from '../types';

const mockUser: User = {
  username: 'user1',
  bio: '',
  profilePictureURL: '',
  password: 'password123',
};
describe('Post /addUser', () => {
  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Ensure mongoose is disconnected after all tests
  });

  it('should add a new user', async () => {
    jest.spyOn(util, 'saveUser').mockResolvedValueOnce(mockUser as User);

    // Making the request
    const response = await supertest(app).post('/user/addUser').send(mockUser);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 500 when saveUser throws an error', async () => {
    jest.spyOn(util, 'saveUser').mockRejectedValueOnce(new Error('Database error'));

    // Making the request
    const response = await supertest(app).post('/user/addUser').send(mockUser);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user: Database error');
  });

  it('should return 500 when saveUser returns an error', async () => {
    const mockRequestBody = {
      username: 'testuser',
      password: 'password123',
    };

    jest.spyOn(util, 'saveUser').mockResolvedValueOnce({ error: 'Unable to save user' });

    // Making the request
    const response = await supertest(app).post('/user/addUser').send(mockRequestBody);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding user: Unable to save user');
  });
});
