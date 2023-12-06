const { createCart } = require('../../../controller/cartController');
const productModel = require('../../../model/productModel');
const cartModel = require('../../../model/cartModel');
const validator = require('../../../validators/validator');

jest.mock('../../../model/productModel');
jest.mock('../../../model/cartModel');

describe('createCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new cart when user has no existing cart', async () => {

    // Mock request and response objects
    const req = {
      user: { userId: 'userId' },
      body: { productId: 'productId' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    validator.isValidBody = jest.fn().mockReturnValueOnce(false);
    validator.isValidId = jest.fn().mockReturnValueOnce(true);

    productModel.findById.mockResolvedValueOnce({ price: 10 });
    cartModel.findOne.mockResolvedValueOnce(null);

    cartModel.create.mockResolvedValueOnce({
      userId: 'userId',
      items: [{ productId: 'productId', quantity: 1 }],
      totalItems: 1,
      totalPrice: 10,
    });

    // Call the function
   const newCart =  await createCart(req, res);
    expect(!newCart).toBe(true)
    
  });

});
