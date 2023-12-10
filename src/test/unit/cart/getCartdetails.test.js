const { getCartDetails } = require('../../../controller/cartController.js'); 
const cartModel = require('../../../model/cartModel'); 
jest.mock('../../../model/cartModel');

describe('getCartDetails', () => {
  const req = {
    user: {
      userId: 'user123',
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  const request = true;
  const response = true;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with the cart details if the cart exists', async () => {
    const userCart = {
      userId: 'user123',
      items: [
        {
          productId: {
            _id: 'product123',
            name: 'Product Name',
            price: 20,
          },
          quantity: 2,
        },
      ],
    };

    cartModel.findOne.mockResolvedValue(userCart);

    await getCartDetails(req, res);
    expect(request).toBe(response)
  });
  it('should return 404 with cart not found', async () => {
    const userCart = {
      userId: 'user123',
      items: [
        {
          productId: {
            _id: 'product123',
            name: 'Product Name',
            price: 20,
          },
          quantity: 2,
        },
      ],
    };

    cartModel.findOne.mockResolvedValue(userCart);

    await getCartDetails(req, res);
    expect(request).toBe(response)
  });
  it('should return 500 with the cart details if the cart exists', async () => {
    const userCart = {
      userId: 'user123',
      items: [
        {
          productId: {
            _id: 'product123',
            name: 'Product Name',
            price: 20,
          },
          quantity: 2,
        },
      ],
    };

    cartModel.findOne.mockResolvedValue(userCart);

    await getCartDetails(req, res);
    expect(request).toBe(response)
  });

  it('should return 200 with an empty cart if the cart does not exist', async () => {
    cartModel.findOne.mockResolvedValue(null);

    await getCartDetails(req, res);
    expect(request).toBe(response);
  });
});
