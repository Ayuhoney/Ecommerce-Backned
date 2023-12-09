const { signUp } = require('../../../controller/userController.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../../../model/userModel');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../model/userModel');

describe('Signup Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle a valid signup request', async () => {
    // Mock request and response objects
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
        mobile: '1234567890',
        role: 'user',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock dependencies
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    jwt.sign.mockReturnValueOnce('mockToken');
    userModel.findOne.mockResolvedValueOnce(null); // No existing user
    userModel.create.mockResolvedValueOnce({
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'John Doe',
      mobile: '1234567890',
      role: 'user',
      tokens: [{ token: 'mockToken' }],
    });

    // Call the signup controller function
    await signUp(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalledWith('x-api-key', 'mockToken');
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Signup successful',
      token: 'mockToken',
    });

    // Ensure that bcrypt.hash and jwt.sign are called with the expected arguments
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Ensure that userModel.create is called with the expected user object
    expect(userModel.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'John Doe',
      mobile: '1234567890',
      role: 'user',
      tokens: [{ token: 'mockToken' }],
    });
  });

  it('should handle a request with invalid data', async () => {
    const req = {
      body: {
        // Missing required fields
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Call the signup controller function
    await signUp(req, res);

    // Assertions for invalid request
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Invalid request',
    });
  });

  // Add more test cases to cover different scenarios
});
