const { loginUser, getUserId } = require('../../../controller/userController.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../../../model/userModel.js');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../model/userModel');

describe('Login Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    // Call the login controller function
    await loginUser(req, res);

    // Assertions for invalid request
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'invalid request',
    });
  });

  it('should handle a request with incorrect email or password', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongPassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock findOne to simulate user not found
    userModel.findOne.mockResolvedValueOnce(null);

    // Call the login controller function
    await loginUser(req, res);

    // Assertions for incorrect email or password
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'email or Password are not correct',
    });
  });

});
