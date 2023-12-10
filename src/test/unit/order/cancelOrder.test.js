const { cancelOrder } = require('../../../controller/orderController.js');

jest.mock('../../../model/orderModel');
jest.mock('../../../model/productModel');

// Import the mocked modules
const orderModel = require('../../../model/orderModel');
const productModel = require('../../../model/productModel');

describe('cancelOrder Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should cancel an order successfully', async () => {
    // Mock ObjectId
    const mockObjectId = jest.fn().mockReturnValue('mockObjectId');

    // Mocking orderModel.findById
    orderModel.findById.mockResolvedValueOnce({
      _id: 'mockOrderId',
      userId: 'mockUserId',
      status: 'completed',
      items: [
        { productId: mockObjectId(), quantity: 2 },
        { productId: mockObjectId(), quantity: 1 },
      ],
    });

    productModel.findByIdAndUpdate.mockImplementation((productId, update, options) => {
      return { _id: productId, ...update.$set };
    });

    orderModel.findByIdAndUpdate.mockImplementation((orderId, update, options) => {
      return { _id: orderId, ...update.$set, items: [] };
    });

    // Mocking req and res objects
    const mockReq = { params: { orderId: 'mockOrderId' }, user: { userId: 'mockUserId' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Calling the controller function
    await cancelOrder(mockReq, mockRes);

    // Assertions
    // Your assertions here
  });

  it('should return 400 status if orderId is not provided', async () => {
    // Mocking req and res objects
    const mockReq = { params: { orderId: undefined }, user: { userId: 'mockUserId' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  
    // Calling the controller function
    await cancelOrder(mockReq, mockRes);
  
    // Assertions
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ status: false, message: 'Please provide orderId' });
  });
});
