const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../../../model/userModel');
const express = require('express');
const app = express();
const request = require('supertest');
const { authSchema } = require('../../../model/userModel');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../model/userModel');

describe('Sign Up Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid request', async () => {
    const response = await request(app)
      .post('/signup')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ status: false, message: 'Invalid request' });
  });

  it('should return 400 for invalid request schema', async () => {
    authSchema.validate.mockReturnValueOnce({ error: { details: [{ message: 'Validation error' }] } });

    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
        mobile: '1234567890',
        role: 'user'
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Validation error');
  });

  it('should return 409 for existing email', async () => {
    userModel.findOne.mockReturnValueOnce({ email: 'test@example.com' });

    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
        mobile: '1234567890',
        role: 'user'
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ status: false, message: 'Email already exists' });
  });

  it('should return 201 and set cookie for successful signup', async () => {
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    userModel.create.mockResolvedValueOnce({
      email: 'test@example.com',
      tokens: [{ token: 'fakeToken' }]
    });
    jwt.sign.mockReturnValueOnce('fakeToken');

    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
        mobile: '1234567890',
        role: 'user'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: true,
      message: 'Signup successful',
      token: 'fakeToken'
    });
    expect(response.headers['set-cookie'][0]).toMatch(/^x-api-key=fakeToken;/);
  });

  it('should handle internal server error', async () => {
    bcrypt.hash.mockRejectedValueOnce(new Error('Mocked error'));

    const response = await request(app)
      .post('/signup')
      .send({
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
        mobile: '1234567890',
        role: 'user'
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ status: false, message: 'Mocked error' });
  });
});
