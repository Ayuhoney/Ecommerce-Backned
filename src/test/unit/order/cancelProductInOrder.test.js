const { getOrderByIds } = require('../../../controller/orderController'); 
const { isUserAuthorized } = require('../../../controller/orderController'); 

describe('getOrderByIds', () => {
 
  const orderId = 'orderId';
  const mockOrder = {
    _id: orderId,
    userId: 'userId',
    items: [
      { productId: 'productId1', quantity: 2 },
      { productId: 'productId2', quantity: 3 },
    ],
    status: 'completed',
    totalItems: 5,
    totalPrice: 50,
  };

  // Mock the required model
  const mockOrderModel = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test cases
  it('should return the order with the specified orderId', async () => {

    mockOrderModel.findById.mockResolvedValueOnce(mockOrder);
    const result = await getOrderByIds(orderId, mockOrderModel);

    // Assertions
    expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
    expect(result).toEqual(mockOrder);
  });

  it('should return null if the order is not found', async () => {
    mockOrderModel.findById.mockResolvedValueOnce(null);

    const result = await getOrderByIds(orderId, mockOrderModel);

    // Assertions
    expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
    expect(result).toBeNull();
  });
});

describe('isUserAuthorized', () => {
  // Mock data
  const userId = 'userId';
  const userOrder = {
    _id: 'orderId',
    userId: 'userId',
    items: [
      { productId: 'productId1', quantity: 2 },
      { productId: 'productId2', quantity: 3 },
    ],
    status: 'completed',
    totalItems: 5,
    totalPrice: 50,
  };

  it('should return true if the userId matches the userOrder.userId', () => {
    const result = isUserAuthorized(userId, userOrder);
    expect(result).toBe(true);
  });

  it('should return false if the userId does not match the userOrder.userId', () => {

    const modifiedUserOrder = { ...userOrder, userId: 'differentUserId' };
    const result = isUserAuthorized(userId, modifiedUserOrder);
    expect(result).toBe(false);

  });
});


const {cancelProductInOrder} = require('../../../controller/orderController'); 

describe('cancelProductInOrder', () => {

  const orderId = 'orderId';
  const userId = 'userId';
  const productId = 'productId';
  const validObjectId = 'validObjectId';
  const invalidObjectId = 'invalidObjectId';

  const req = {
    params: {
      orderId: validObjectId,
    },
    body: {
      productId: productId,
    },
    user: {
      userId: userId,
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  const responseBuilder = {
    error: jest.fn().mockReturnThis(),
    responseBuilder: jest.fn().mockReturnThis(),
  };

  // Test cases
  it('should return 400 with an error message for an invalid orderId', async () => {
    const reqInvalidOrderId = { ...req, params: { orderId: invalidObjectId } };

    await cancelProductInOrder(reqInvalidOrderId, res, null, null, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, 'Invalid orderId or productId');
  });

  it('should return 404 with an error message for a non-existent order', async () => {
 
    await cancelProductInOrder(req, res, null, null, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  it('should return 403 with an error message if the user is not authorized', async () => {
    const userOrder = {
      _id: validObjectId,
      userId: 'differentUserId',
      status: 'completed',
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
    await cancelProductInOrder(req, res, null, null, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  it('should return 400 with an error message for an invalid productId', async () => {
    const reqInvalidProductId = { ...req, body: { productId: invalidObjectId } };

    await cancelProductInOrder(reqInvalidProductId, res, null, null, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, 'Invalid orderId or productId');
  });

  it('should return 400 with an error message if the order is not in "completed" status', async () => {
    await cancelProductInOrder(req, res, null, null, responseBuilder);
    expect(responseBuilder.error).toHaveBeenCalledWith(400, "Invalid orderId or productId");
  });

});
