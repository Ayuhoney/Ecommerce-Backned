const jwt = require('jsonwebtoken');
const { authentication } = require('../../../middleware/auth');

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user and set user information in req', async () => {
    const token = 'validToken';
    req.headers['x-api-key'] = token;

    jwt.verify.mockReturnValueOnce({ userId: '123' });

    await authentication(req, res, next);

    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.token).toBe(token);
    expect(req.user).toEqual({ userId: '123' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return 401 if token is not present', async () => {
    await authentication(req, res, next);

    // Assertions
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(req.token).toBeUndefined();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Token is not present please provide token',
    });
  });

  it('should return 500 if jwt.verify throws an error', async () => {
    const token = 'invalidToken';
    req.headers['x-api-key'] = token;

    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await authentication(req, res, next);

    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.token).toBeUndefined();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
  });
});
