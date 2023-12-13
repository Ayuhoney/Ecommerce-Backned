const { paymentStatus } = require('../../../controller/stripeController');
const stripe = require('stripe'); 
const orderModel = require('../../../model/orderModel'); 
const productModel = require('../../../model/productModel'); 
const { mailTrackId } = require('../../../validators/sendOrderSummaryMail'); 

jest.mock('stripe');
jest.mock('../../../model/orderModel');
jest.mock('../../../model/productModel');
jest.mock('../../../validators/sendOrderSummaryMail');

describe('paymentStatus function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle the case where no order is found', async () => {
    // Arrange
    const req = {
      body: {
        id: 'nonexistentSessionId',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    orderModel.findOne.mockResolvedValue(null);

    // Act
    await paymentStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error"});

  });
});