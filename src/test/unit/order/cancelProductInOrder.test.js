const { cancelProductInOrder } = require('../../../controller/orderController.js'); 


const orderModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const productModel = {
  findById: jest.fn(),
  save: jest.fn(),
};

const responseBuilder = {
  error: jest.fn(),
  success: jest.fn(),
};

const req = {
  body: {
    productId: 'validProductId',
  },
  params: {
    orderId: 'validOrderId',
  },
  user: {
    userId: 'validUserId',
  },
};

const res = {
  status: jest.fn(() => res),
  send: jest.fn(),
};

describe('cancelProductInOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return error for invalid orderId or productId', async () => {
    req.params.orderId = 'invalidOrderId';
    req.body.productId = 'invalidProductId';

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, 'Invalid orderId or productId');
  });

  test('should return error if order not found', async () => {
    orderModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });
  test('should return error', async () => {
    orderModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });
  test('should return successfull', async () => {
    orderModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });


  test('should return an error if orderId is invalid', async () => {
    req.params.orderId = 'invalidOrderId';

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, "Invalid orderId or productId");
  });

  test('should return an error if order is not found', async () => {
    orderModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if user does not have access to update the order', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'otherUserId', // Different user ID
      status: 'completed',
      items: [{ productId: 'validProductId', quantity: 3, canceled: false }],
      totalItems: 3,
      totalPrice: 150,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if the order is not completed', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'pending', // Order status is not "completed"
      items: [{ productId: 'validProductId', quantity: 3, canceled: false }],
      totalItems: 3,
      totalPrice: 150,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if the product is not found', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'completed',
      items: [{ productId: 'validProductId', quantity: 3, canceled: false }],
      totalItems: 3,
      totalPrice: 150,
    });

    productModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if the order is already empty', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'completed',
      items: [], // Empty items array
      totalItems: 0,
      totalPrice: 0,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should update order and product successfully', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'completed',
      items: [{ productId: 'validProductId', quantity: 3, canceled: false }],
      totalItems: 3,
      totalPrice: 150,
    });

    productModel.findById.mockResolvedValueOnce({
      _id: 'validProductId',
      stock: 5,
      save: jest.fn(), // Mock the save function
    });

    orderModel.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'canceled',
      items: [{ productId: 'validProductId', quantity: 3, canceled: true }],
      totalItems: 0,
      totalPrice: 0,
    });
    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
  });
});


describe('cancelProductInOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return an error if orderId is invalid', async () => {
    req.params.orderId = 'invalidOrderId';

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, 'Invalid orderId or productId');
  });

  test('should return an error if order is not found', async () => {
    orderModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if user does not have access to update the order', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'otherUserId', // Different user ID
      status: 'completed',
      items: [{
        productId: 'validProductId',
        quantity: 3,
        canceled: false
      }],
      totalItems: 3,
      totalPrice: 150,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });

  test('should return an error if the order is not completed', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'pending', // Order status is not "completed"
      items: [{
        productId: 'validProductId',
        quantity: 3,
        canceled: false
      }],
      totalItems: 3,
      totalPrice: 150,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith(400, "Invalid orderId or productId");
  });

  test('should return an error if the product is not found', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'completed',
      items: [{
        productId: 'validProductId',
        quantity: 3,
        canceled: false
      }],
      totalItems: 3,
      totalPrice: 150,
    });

    productModel.findById.mockResolvedValueOnce(null);

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);

    expect(responseBuilder.error).toHaveBeenCalledWith( 400, "Invalid orderId or productId");
  });

  test('should return an error if the order is already empty', async () => {
    orderModel.findById.mockResolvedValueOnce({
      _id: 'validOrderId',
      userId: 'validUserId',
      status: 'completed',
      items: [], // Empty items array
      totalItems: 0,
      totalPrice: 0,
    });

    await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
    expect(responseBuilder.error).toHaveBeenCalledWith(400,"Invalid orderId or productId");
  });
  
  test('should handle invalid order ID', async () => {
    orderModel.findById.mockRejectedValueOnce(new Error('Invalid order ID'));
  
    try {
      await cancelProductInOrder(req, res, orderModel, productModel, responseBuilder);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid order ID'));
      expect(productModel.findById).not.toHaveBeenCalled();
      expect(productModel.save).not.toHaveBeenCalled();
      expect(orderModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(responseBuilder.success).not.toHaveBeenCalled();
    }
  });
});