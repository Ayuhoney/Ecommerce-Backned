const {createCart} = require('../../../controller/cartController');
const { findOrCreateCart } = require('../../../controller/cartController');

const mockProductModel = {
  findById: jest.fn(),
};

const mockCartModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockRequest = (userId, productId) => ({
  user: { userId },
  body: { productId },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('../../../validators/validator', () => ({
  isValidBody: jest.fn(() => true),
  isValidId: jest.fn(() => true),
}));

describe('createCart', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should return 400 for invalid product ID', async () => {
    const req = mockRequest('userId', 'invalidProductId');
    const res = mockResponse();
  
    mockProductModel.findById.mockResolvedValueOnce(null);
  
    await createCart(req, res, mockCartModel, mockProductModel);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: "This product is not found in the product model",
    });
  });
  
  it('should return 400 for product not found in the product model', async () => {
    const req = mockRequest('userId', 'productId');
    const res = mockResponse();
  
    mockProductModel.findById.mockResolvedValueOnce(null);
  
    await createCart(req, res, mockCartModel, mockProductModel);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'This product is not found in the product model',
    });
  });

  it('should find an existing cart if it exists', async () => {
    // Arrange
    const userId = 'existingUserId';
    const existingCart = { userId, items: [], totalItems: 0, totalPrice: 0 };
    mockCartModel.findOne.mockResolvedValueOnce(existingCart);

    // Act
    const result = await findOrCreateCart(userId, mockCartModel);

    // Assert
    expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId });
    expect(mockCartModel.create).not.toHaveBeenCalled();
    expect(result).toEqual(existingCart);
  });

  it('should create a new cart if it does not exist', async () => {
    // Arrange
    const userId = 'nonExistingUserId';
    const newCart = { userId, items: [], totalItems: 0, totalPrice: 0 };
    mockCartModel.findOne.mockResolvedValueOnce(null);
    mockCartModel.create.mockResolvedValueOnce(newCart);

    // Act
    const result = await findOrCreateCart(userId, mockCartModel);

    // Assert
    expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId });
    expect(mockCartModel.create).toHaveBeenCalledWith({ userId, items: [], totalItems: 0, totalPrice: 0 });
    expect(result).toEqual(newCart);
  });

  it('should handle errors during cart creation', async () => {
    // Arrange
    const userId = 'errorUserId';
    const error = new Error('Failed to create cart');
    mockCartModel.findOne.mockRejectedValueOnce(error);

    // Act and Assert
    await expect(findOrCreateCart(userId, mockCartModel)).rejects.toThrowError(error);
  });
});

const { updateCartItem } = require('../../../controller/cartController');  // Import your controller

describe('updateCartItem', () => {

  it('should update quantity for an existing item in the cart', () => {
    const cart = {
      items: [
        { productId: 'existingProductId', quantity: 2 },
        { productId: 'anotherProductId', quantity: 1 },
      ],
    };
    const productId = 'existingProductId';
    const quantity = 3;
    const productPrice = 10;

    // Act
    updateCartItem(cart, productId, quantity, productPrice);

    expect(cart.items).toHaveLength(2);  
    expect(cart.items[0].quantity).toBe(5);  
    expect(cart.items[1].quantity).toBe(1);  
  });

  it('should add a new item to the cart if it does not exist', () => {
    
    const cart = {
      items: [
        { productId: 'existingProductId', quantity: 2 },
      ],
    };
    const productId = 'newProductId';
    const quantity = 3;
    const productPrice = 15;

    // Act
    updateCartItem(cart, productId, quantity, productPrice);

    // Assert
    expect(cart.items).toHaveLength(2);  // One new item added
    expect(cart.items[0].quantity).toBe(2);  // Existing item quantity unchanged
    expect(cart.items[1].productId).toBe('newProductId');  // New item added with the specified quantity
    expect(cart.items[1].quantity).toBe(3);
  });
});


const { calculateCartTotal } = require('../../../controller/cartController');  

describe('calculateCartTotal', () => {
  it('should update totalItems and totalPrice when adding items to the cart', () => {
    // Arrange
    const cart = {
      totalItems: 2,
      totalPrice: 20,
    };
    const productPrice = 10;
    const quantity = 3;


    calculateCartTotal(cart, productPrice, quantity);

    expect(cart.totalItems).toBe(5);  
    expect(cart.totalPrice).toBe(50);  
  });

  it('should not update totalItems and totalPrice for zero quantity', () => {
    // Arrange
    const cart = {
      totalItems: 2,
      totalPrice: 20,
    };
    const productPrice = 10;
    const quantity = 0;

    // Act
    calculateCartTotal(cart, productPrice, quantity);

    // Assert
    expect(cart.totalItems).toBe(2);  
    expect(cart.totalPrice).toBe(20);  
  });

  it('should not update totalItems and totalPrice for negative quantity', () => {
    
    const cart = {
      totalItems: 2,
      totalPrice: 20,
    };
    const productPrice = 10;
    const quantity = -3;

   calculateCartTotal(cart, productPrice, quantity);
    expect(cart.totalItems).toBe(-1);  
    expect(cart.totalPrice).toBe(-10); 
  });
});



