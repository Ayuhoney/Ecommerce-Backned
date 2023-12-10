const { payment } = require('../../../controller/stripeController.js'); 

jest.mock('stripe');

const stripe = require('stripe');
const orderModel = require('../../../model/orderModel.js'); 

describe('payment function', () => {
  let req, res, next;

  beforeEach(() => {
    
    req = {
      body: {
        items: [
          {
            productId: {
              title: 'Product 1',
              images: ['image1.jpg'],
              price: 10,
            },
            quantity: 2,
          },
        ],
        currency: 'USD',
        form: {
          email: 'test@example.com',
        },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle an INR currency', async () => {
    req.body.currency = 'GBP'; 

    await payment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
  it('should handle an USD currency', async () => {
    req.body.currency = 'GBP'; 

    await payment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
  it('should handle an invalidcurrency', async () => {
    req.body.currency = 'GBP'; 

    await payment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

});
