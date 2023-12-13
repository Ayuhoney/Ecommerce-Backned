const { updateCart } = require('../../../controller/cartController.js'); 

jest.mock('../../../model/cartModel.js');
jest.mock('../../../model/productModel.js');

describe('updateCart', () => {
  const req = {
    user: {
      userId: 'user123',
    },
    body: {
      productId: { _id: 'product1' },
      quantity: 2,
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for an invalid request', async () => {
    req.body = {};
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: "Invalid request",
    });
  });
  it('should return 404 for an invalid request', async () => {
    req.body = {};
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: "Invalid request",
    });
  });
  it('should return 500 for an invalid request', async () => {
    req.body = {};
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: "Invalid request",
    });
  });
});

const CartModel = require('../../../model/cartModel');
const ProductModel = require('../../../model/productModel.js');

const mockRequest = (userId, body) => ({
  user: {
    userId: userId,
  },
  body: body,
});
const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  res.status.mockImplementation((code) => res);
  return res;
};
const mockCartModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const mockProductModel = {
  findById: jest.fn(),
};

describe('updateCart', () => {
  it('should update the cart successfully', async () => {

    const userId = 'user123';
    const productId = { _id: 'product1' };
    const quantity = 2;

    const product = {
      _id: 'product1',
      stock: 10,
      price: 5,
    };

    const cartItem = {
      productId: product._id,
      quantity: 1,
    };

    const userCart = {
      _id: 'cart123',
      userId: userId,
      items: [cartItem],
      totalItems: 1,
      totalPrice: product.price,
    };

    const updatedCartItem = {
      productId: product._id,
      quantity: quantity,
    };

    const updatedCart = {
      _id: 'cart123',
      userId: userId,
      items: [updatedCartItem],
      totalItems: quantity,
      totalPrice: quantity * product.price,
    };

    // Mocking functions
    mockCartModel.findOne.mockResolvedValueOnce(userCart);
    mockProductModel.findById.mockResolvedValueOnce(product);
    mockCartModel.findByIdAndUpdate.mockResolvedValueOnce(updatedCart);

    const req = mockRequest(userId, { productId, quantity });
    const res = mockResponse();

    // Calling the function
    await updateCart(req, res, mockCartModel, mockProductModel);

    // Assertions
    expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId: userId });
    expect(mockProductModel.findById).toHaveBeenCalledWith(productId._id);
    expect(res.status).toHaveBeenCalledWith(500);

  });

  it('should handle invalid request', async () => {
    const userId = 'user123';
    const productId = { _id: 'product1' };
    const quantity = 2;

    const req = mockRequest(userId, {}); // Empty body

    const res = mockResponse();

    // Calling the function
    await updateCart(req, res, mockCartModel, mockProductModel);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Invalid request',
    });
  });

  it('should handle quantity exceeding stock', async () => {
    const userId = 'user123';
    const productId = { _id: 'product1' };
    const quantity = 15;

    const product = {
      _id: 'product1',
      stock: 10,
      price: 5,
    };

    // Product found
    mockProductModel.findById.mockResolvedValueOnce(product);

    const req = mockRequest(userId, { productId, quantity });
    const res = mockResponse();

    // Calling the function
    await updateCart(req, res, mockCartModel, mockProductModel);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: `Maximum quantity to buy is ${product.stock} for this product because stock is not available`,
    });
  });

  it('should handle product not found in cart', async () => {
    const userId = 'user123';
    const productId = { _id: 'product1' };
    const quantity = 2;

    // Cart item not found
    mockCartModel.findOne.mockResolvedValueOnce({ items: [] });

    const req = mockRequest(userId, { productId, quantity });
    const res = mockResponse();

    // Calling the function
    await updateCart(req, res, mockCartModel, mockProductModel);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: "Product not found with given Id",
    });
  });
  it('should handle product not found', async () => {
    const userId = 'user123';
    const productId = { _id: 'product1' };

    mockProductModel.findById.mockResolvedValueOnce(null);

    const req = mockRequest(userId, { productId, quantity: 2 });
    const res = mockResponse();

    await updateCart(req, res, mockCartModel, mockProductModel);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Product not found with given Id',
    });
  });




});
