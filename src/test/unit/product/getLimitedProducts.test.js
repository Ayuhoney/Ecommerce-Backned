const { getLimitedProducts } = require('../../../controller/productController.js');

// Mocking the necessary modules and functions
jest.mock('../../../model/productModel', () => ({
  find: jest.fn(),
}));

describe('getLimitedProducts controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  it('should get limited products successfully', async () => {
    // Mock the product model find method
    const mockProducts = [
      { _id: 'sampleId1', title: 'Product 1' },
      { _id: 'sampleId2', title: 'Product 2' },
    ];
    require('../../../model/productModel').find.mockReturnValueOnce({
      limit: jest.fn().mockResolvedValueOnce(mockProducts),
    });

    // Call the controller function
    await getLimitedProducts(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      products: mockProducts,
    });
  });

  it('should handle internal server error', async () => {
    // Mock an internal server error
    require('../../../model/productModel').find.mockReturnValueOnce({
      limit: jest.fn().mockRejectedValueOnce(new Error('Internal server error')),
    });

    // Call the controller function
    await getLimitedProducts(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});
