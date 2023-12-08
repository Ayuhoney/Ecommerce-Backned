const {signUp} = require('../../../controller/userController.js');
const userModel = require('../../../model/userModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../../model/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('signUp', () => {
test('should sign up a new user', async () => {
  const req = {
    body: {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      mobile: '1234567890',
      role: 'user',
    },
  };

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
    cookie: jest.fn(),
  };

  // Mock validation success
  const authSchemaMock = { validate: jest.fn(() => ({ error: null })) };

  // Mock the user to not exist initially
  userModel.findOne.mockResolvedValueOnce(null);

  // Mock bcrypt hash
  bcrypt.hash.mockResolvedValueOnce('hashedPassword');

  // Mock JWT sign
  jwt.sign.mockReturnValueOnce('fakeToken');

  // Mock the creation of the user
  userModel.create.mockResolvedValueOnce({
    email: 'test@example.com',
    name: 'Test User',
    mobile: '1234567890',
    role: 'user',
    tokens: [{ token: 'fakeToken' }],
  });

  await signUp(req, res);

  expect(res.status).toHaveBeenCalledWith(500)
  expect(res.cookie).toHaveBeenCalledWith('x-api-key', 'fakeToken');
  expect(res.send).toHaveBeenCalledWith({
    status: true,
    message: 'Signup successful',
    token: 'fakeToken',
  });
});


  test('should handle invalid request', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        mobile: '1234567890',
        role:'user'
      },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Invalid request',
    });
  });

  test('should handle email already exists', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        mobile: '1234567890',
        role: 'user',
      },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mock the user to already exist
    userModel.findOne.mockResolvedValueOnce({
      email: 'test@example.com',
      name: 'Existing User',
      mobile: '1234567890',
      role: 'user',
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Email already exists',
    });
  });
});
