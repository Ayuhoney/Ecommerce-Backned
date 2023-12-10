const { updateCart } = require('../../../controller/cartController.js'); // Replace with your actual file path
const cartModel = require('../../../model/cartModel.js'); // Replace with your actual cart model path
const productModel = require('../../../model/productModel.js'); // Replace with your actual product model path

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
      message: 'invlid request',
    });
  });
  it('should return 404 for an invalid request', async () => {
    req.body = {};
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'invlid request',
    });
  });
  it('should return 500 for an invalid request', async () => {
    req.body = {};
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'invlid request',
    });
  });
  
});
