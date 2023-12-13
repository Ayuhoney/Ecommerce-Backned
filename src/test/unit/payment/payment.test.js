const { getExchangeRate } = require('../../../controller/stripeController'); 
const { createStripeSession } = require('../../../controller/stripeController');

describe('getExchangeRate', () => {
  it('should return the exchange rate for a valid currency', () => {
    const currency = 'USD';
    const expectedExchangeRate = 0.012;

    const result = getExchangeRate(currency);

    expect(result).toEqual(expectedExchangeRate);
  });

  it('should return 1 for an invalid currency', () => {
    const invalidCurrency = 'XYZ';
    const expectedExchangeRate = 1;

    const result = getExchangeRate(invalidCurrency);

    expect(result).toEqual(expectedExchangeRate);
  });
  it('should return 1 for undefined currency', () => {
    const undefinedCurrency = undefined;
    const expectedExchangeRate = 1;

    const result = getExchangeRate(undefinedCurrency);

    expect(result).toEqual(expectedExchangeRate);
  });
});

const stripe = require('stripe')("sk_test_51OI6mCSHtZOZPQIvYEuqWfugOH7y5petyTLUtZE4WZIf7ZG9B2L3H6pkwoW8YBqfyT0ZUKtHE0m0fZo69FAgzXBk00bGJGyaAT"); 
jest.mock('stripe')

describe('createStripeSession', () => {
  it('should create a Stripe session with the correct parameters', async () => {
    // Your test data
    const items = [
      { productId: { title: 'Product 1', images: ['image1.jpg'], price: 10 }, quantity: 2 },
      { productId: { title: 'Product 2', images: ['image2.jpg'], price: 15 }, quantity: 1 },
    ];

    const currency = 'USD';

    // Set up the expected parameters for Stripe session creation
    const expectedSessionParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Product 1',
              images: ['image1.jpg'],
            },
            unit_amount: Math.round(10 * getExchangeRate(currency) * 100),
          },
          quantity: 2,
        },
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Product 2',
              images: ['image2.jpg'],
            },
            unit_amount: Math.round(15 * getExchangeRate(currency) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.HOST_URL}/success`,
      cancel_url: `${process.env.HOST_URL}/failed`,
    };
  });
});

jest.mock('../../../model/orderModel'); 
const { updateOrderPaymentInfo } = require('../../../controller/stripeController.js');
describe('updateOrderPaymentInfo', () => {
  it('should update order payment information correctly', async () => {
    // Arrange
    const session = { id: 'some-session-id' };
    const items = [
      { productId: { price: 10 }, quantity: 2 },
      { productId: { price: 20 }, quantity: 1 },
    ];
    const currency = 'USD';

    // Mock the order object and its save method
    const saveMock = jest.fn();
    const orderMock = {
      paymentId: null,
      totalAmount: null,
      save: saveMock,
    };

 
    await updateOrderPaymentInfo(orderMock, session, items, currency);

    // Assert
    expect(orderMock.paymentId).toBe('some-session-id');
    expect(orderMock.totalAmount).toBe(0.48); // (10 * 2 + 20 * 1) * 1.5
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});



const { payment } = require('../../../controller/stripeController.js');
const orderModel = require('../../../model/orderModel.js');
jest.mock('../../../model/orderModel');

describe('payment function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return an error response when order is not found', async () => {
    // Arrange
    const req = {
      body: {
        items: {
          userId: 'someUserId',
          // Other item properties...
        },
        form: {
          userId: 'someUserId', // Correct the property name
          // Other form properties...
        },
        currency: 'INR',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
  
    // Mock the orderModel.findOne to return null
    orderModel.findOne.mockResolvedValue(null);
  
    // Act
    await payment(req, res, next);
  
    // Assert
    expect(orderModel.findOne).toHaveBeenCalledWith({
      userId: 'someUserId',
      paymentStatus: 'payment_pending',
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Order not found or payment already processed' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should return an error response when  curreny change', async () => {
    // Arrange
    const req = {
      body: {
        items: {
          userId: 'someUserId',
          // Other item properties...
        },
        form: {
          userId: 'someUserId', // Correct the property name
          // Other form properties...
        },
        currency: 'INR',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
  
    // Mock the orderModel.findOne to return null
    orderModel.findOne.mockResolvedValue(null);
  
    // Act
    await payment(req, res, next);
  
    // Assert
    expect(orderModel.findOne).toHaveBeenCalledWith({
      userId: 'someUserId',
      paymentStatus: 'payment_pending',
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Order not found or payment already processed' });
    expect(next).not.toHaveBeenCalled();
  });
});

