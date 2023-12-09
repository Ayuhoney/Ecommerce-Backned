const { forgetPassword } = require('../../../controller/userController.js');
const userModel = require('../../../model/userModel');
const randomstring = require('randomstring');
const { sendResetPasswordMail } = require('../../../validators/sendMail.js'); // Assuming you have a mail service

jest.mock('../../../model/userModel');
jest.mock('randomstring');
jest.mock('../../../validators/sendMail.js');

describe('Forget Password Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle a request for a non-existent email', async () => {
    const req = {
      body: {
        email: 'nonexistent@example.com',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock findOne to simulate user not found
    userModel.findOne.mockResolvedValueOnce(null);

    // Call the forgetPassword controller function
    await forgetPassword(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'email not found',
    });
  });
});
