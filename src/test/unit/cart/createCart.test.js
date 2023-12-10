const { createCart } = require('../../../controller/cartController.js'); 
const productModel = require('../../../model/productModel.js');
const { isValidId, isValidBody } = require('../../../validators/validator.js'); 

jest.mock('../../../model/cartModel.js');
jest.mock('../../../model/productModel.js');
jest.mock('../../../validators/validator.js')

describe('createCart', () => {
  const req = {
    user: {
      userId: 'user123',
    },
    body: {
      productId: 'product123',
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 with error message if request body is Authentication not work', async () => {
    isValidBody.mockReturnValue(true);

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'please provide request body',
    });
  });

  it('should return 400 with error message if productId is not valid', async () => {
    isValidBody.mockReturnValue(false);
    isValidId.mockReturnValue(false);

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'please provide valid product Id',
    });
  });

  it('should return 400 with error message if product is not found', async () => {
    isValidBody.mockReturnValue(false);
    isValidId.mockReturnValue(true);
    productModel.findById.mockResolvedValue(null);

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'this product is not found in product model',
    });
  });
});
