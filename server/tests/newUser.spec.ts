import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import * as util from '../models/application';
import { User } from '../types';

const mockUser: User = {
  username: 'user1',
  bio: '',
  profilePictureURL: '',
  password: '',
};
describe('Post /addUser', () => {
  afterEach(async () => {
    await mongoose.connection.close(); // Ensure the connection is properly closed
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

  // RUNNING THE TEST INDEPENDENTLY DOESTN'T WORK
  // ONLY SEEMS TO WORK WHEN RUNNING ENTIRE TEST SUITE
  it('should return 500 if error occurs in `saveUser` while adding a new user', async () => {
    jest.spyOn(util, 'saveUser').mockResolvedValueOnce({ error: 'Error while saving user' });

    // Making the request
    const response = await supertest(app).post('/user/addUser').send(mockUser);

    // Asserting the response
    expect(response.status).toBe(500);
  });

  it('should return 400 if username is empty string', async () => {
    const response = await supertest(app)
      .post('/user/addUser')
      .send({ ...mockUser, username: '' });

    expect(response.status).toBe(400);
  });
});
