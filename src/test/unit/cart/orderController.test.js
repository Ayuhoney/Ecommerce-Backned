const request = require('supertest');
const orderModel = require('../../../model/orderModel');

describe('getOrder', () => {
  // Mock the order data for testing
  const mockOrderData = [
    {
      userId: '123455',
      items: [
        { productId: 'product1', quantity: 2 },
        { productId: 'product2', quantity: 1 },
      ],
    },
  ];

  jest.mock('../../../model/orderModel', () => ({
    find: jest.fn(),
  }));

  const mockReq = {
    user: { userId: 'user1' },
  };

  it('should return orders for a user', async () => {

    orderModel.find.mockResolvedValueOnce(mockOrderData);

    const response = await request(app).get('/getOrder').send(mockReq);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.message).toBe('Success');
    expect(response.body.data).toEqual(mockOrderData);
  });

  it('should handle the case when no orders are found', async () => {
    // Mock the find function to return an empty array
    orderModel.find.mockResolvedValueOnce([]);
    // Make a request to the getOrder endpoint
    const response = await request(app).get('/getOrder').send(mockReq);

    // Expectations
    expect(response.status).toBe(404);
    expect(response.body.status).toBe(false);
    expect(response.body.message).toBe('No cart found with given userId');
  });

  it('should handle internal server errors', async () => {
    // Mock the find function to throw an error
    orderModel.find.mockRejectedValueOnce(new Error('Internal Server Error'));

    // Make a request to the getOrder endpoint
    const response = await request(app).get('/getOrder').send(mockReq);

    // Expectations
    expect(response.status).toBe(500);
    expect(response.body.status).toBe(false);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
