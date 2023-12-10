const { getOrderById } = require('../../../controller/orderController.js'); 

jest.mock('../../../model/orderModel');

const orderModel = require('../../../model/orderModel');

describe('getOrderById Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return order details for a valid orderId', async () => {
    const mockOrderId = 'mockOrderId';
    const mockOrder = {
      _id: mockOrderId,
      userId: 'mockUserId',
      status: 'completed',
      items: [{ productId: 'mockProductId', quantity: 2 }],
    };

    orderModel.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(mockOrder),
    });

    const mockReq = { params: { orderId: mockOrderId } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getOrderById(mockReq, mockRes);

    expect(orderModel.findOne).toHaveBeenCalledWith({ _id: mockOrderId });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: true,
      message: 'Order details',
      order: expect.objectContaining({ _id: mockOrderId, status: 'completed', items: mockOrder.items }),
    });
  });
  it('should handle errors and return 500 status', async () => {

    orderModel.findOne.mockImplementationOnce(() => {
      throw new Error('Some error occurred');
    });

    const mockReq = { params: { orderId: 'mockOrderId' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Calling the controller function
    await getOrderById(mockReq, mockRes);

    expect(orderModel.findOne).toHaveBeenCalledWith({ _id: 'mockOrderId' });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Some error occurred' });
  });
});
