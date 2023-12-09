const { trackOrderById } = require('../../../controller/orderController.js');

jest.mock('../../../model/orderModel');

describe('trackOrderById controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid orderId', async () => {
    const mockRequest = {
      params: {
        orderId: 'invalidOrderId',
      },
    };

    const mockResponse = {
      status: jest.fn(() => mockResponse),
      send: jest.fn(),
    };

    await trackOrderById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: false,
      message: 'Please enter a valid orderId',
    });
  });
});
