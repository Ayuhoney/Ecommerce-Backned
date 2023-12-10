const userModel = require('../../../model/userModel');
const { logout } = require('../../../controller/userController.js'); 

jest.mock('../../../model/userModel'); 

describe('logout function', () => {
  const mockUser = {
    _id: 'mockUserId',
    tokens: [
      { token: 'validToken1' },
      { token: 'validToken2' },
    ],
  };

  const mockRequest = {
    user: {
      userId: 'mockUserId',
      tokens: [{ token: 'validToken1' }, { token: 'validToken2' }],
    },
    headers: {
      'x-api-key': 'validToken1',
    },
  };

  const mockResponse = {
    status: jest.fn(() => mockResponse),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully logout the user', async () => {
    userModel.findById.mockResolvedValue(mockUser);
    userModel.findByIdAndUpdate.mockResolvedValue({});

    await logout(mockRequest, mockResponse);

    expect(userModel.findById).toHaveBeenCalledWith('mockUserId');
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockUserId',
      { tokens: [{ token: 'validToken2' }] },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: true,
      message: 'Sign out successfully!',
    });
  });

  it('should handle logout when the token is not found', async () => {
    userModel.findById.mockResolvedValue({ _id: 'mockUserId', tokens: [] });

    await logout(mockRequest, mockResponse);

    expect(userModel.findById).toHaveBeenCalledWith('mockUserId');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: true,
      message: 'Sign out successfully!',
    });
  });

  it('should handle errors during logout', async () => {
    userModel.findById.mockRejectedValue(new Error('Mocked error'));

    await logout(mockRequest, mockResponse);

    expect(userModel.findById).toHaveBeenCalledWith('mockUserId');
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      error: 'Mocked error',
    });
  });
});
