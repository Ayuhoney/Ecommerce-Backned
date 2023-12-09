const { getAllproducts } = require('../../../controller/productController.js'); // Replace with the actual file name

// Mocking the necessary modules and functions
jest.mock('../../../model/productModel', () => ({
  find: jest.fn(),
}));

describe('getAllproducts controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: 'sampleId', // Provide a sample ID for testing
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  it('should get all products for a given ID successfully', async () => {
    // Mock the product model find method
    const mockProducts = [
      { _id: 'sampleProductId1', title: 'Product 1' },
      { _id: 'sampleProductId2', title: 'Product 2' },
    ];
    require('../../../model/productModel').find.mockResolvedValueOnce(mockProducts);

    // Call the controller function
    await getAllproducts(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      products: mockProducts,
    });
  });

  it('should handle internal server error', async () => {
    // Mock an internal server error
    require('../../../model/productModel').find.mockRejectedValueOnce(new Error('Internal server error'));

    // Call the controller function
    await getAllproducts(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});
