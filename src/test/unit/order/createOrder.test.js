const bcrypt = require('bcrypt');
const { createOrder } = require('../../../controller/orderController.js'); 
const userModel = require('../../../model/userModel.js'); 
const cartModel = require('../../../model/cartModel.js'); 
const orderModel = require('../../../model/orderModel.js');
const productModel = require('../../../model/productModel.js'); 

jest.mock('../../../model/userModel.js');
jest.mock('../../../model/cartModel.js');
jest.mock('../../../model/orderModel.js');
jest.mock('../../../model/productModel.js');

describe('createOrder function', () => {
  const mockRequest = {
    body: {
      order: {
        userId: 'mockUserId',
        items: [{ productId: { _id: 'mockProductId', stock: 10 }, quantity: 2 }],
        totalItems: 2,
        totalPrice: 50,
      },
      form: {
        bname: 'Guest User',
        email: 'guest@example.com',
        password: 'guestPassword',
        name: 'Guest User',
        phone: '1234567890',
        house: '123 Street',
        city: 'City',
        state: 'State',
        pincode: '123456',
      },
    },
  };

  const mockResponse = {
    status: jest.fn(() => mockResponse),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order for guest user', async () => {
    const mockHash = 'mockHash';
    const mockUser = { _id: 'mockUserId' };
    const mockCreatedOrder = { _id: 'mockOrderId' };

    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue(mockUser);
    orderModel.create.mockResolvedValue(mockCreatedOrder);
    await createOrder(mockRequest, mockResponse);
  });
});
