const { cancelProductInOrder } = require('../../../controller/orderController.js'); // Replace with the correct path to your controller file

// Mocking the models for testing
jest.mock('../../../model/orderModel');
jest.mock('../../../model/productModel');

// Import the mocked modules
const orderModel = require('../../../model/orderModel');
const productModel = require('../../../model/productModel');

describe('cancelProductInOrder Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 status if orderId is not provided', async () => {
    // Mocking req and res objects
    const mockReq = { params: { orderId: undefined }, user: { userId: 'mockUserId' }, body: { productId: 'mockProductId' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Calling the controller function
    await cancelProductInOrder(mockReq, mockRes);

    // Assertions
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ status: false, message: 'Please provide orderId' });
  });

  // Add more test cases for other scenarios if needed
});
