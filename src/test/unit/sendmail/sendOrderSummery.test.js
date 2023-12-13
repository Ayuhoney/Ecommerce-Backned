const mailTrackId = require('../../../validators/sendOrderSummaryMail');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('mailTrackId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an email with the correct content', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mockMessageId' });

    const mockTransporter = {
      sendMail: mockSendMail,
    };
    require('nodemailer').createTransport.mockReturnValue(mockTransporter);

    const email = 'test@example.com';
    const order = {
      _id: 'mockOrderId',
      shippingInfo: {
        name: 'John Doe',
        address: {
          city: 'Mock City',
        },
      },
      createdAt: new Date(),
      items: [
        { productId: { title: 'Product 1', price: 10 }, quantity: 2 },
        { productId: { title: 'Product 2', price: 15 }, quantity: 1 },
      ],
      totalPrice: 35,
    };

    const result = await mailTrackId(email, order);

    // Assertions
    expect(require('nodemailer').createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Thank you for your order.',
      html: expect.stringContaining('Thank you for your order!'),
    });


    expect(result).toEqual({ messageId: 'mockMessageId' });
  });

  it('should handle errors and return an error object', async () => {
    const mockSendMail = jest.fn().mockRejectedValue(new Error('Mocked error'));

    const mockTransporter = {
      sendMail: mockSendMail,
    };
    require('nodemailer').createTransport.mockReturnValue(mockTransporter);

    const email = 'test@example.com';
    const order = {
      _id: 'mockOrderId',
      shippingInfo: {
        name: 'John Doe',
        address: {
          city: 'Mock City',
        },
      },
      createdAt: new Date(),
      items: [
        { productId: { title: 'Product 1', price: 10 }, quantity: 2 },
        { productId: { title: 'Product 2', price: 15 }, quantity: 1 },
      ],
      totalPrice: 35,
    };

    const result = await mailTrackId(email, order);

    expect(require('nodemailer').createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Mocked error');
  });
});
