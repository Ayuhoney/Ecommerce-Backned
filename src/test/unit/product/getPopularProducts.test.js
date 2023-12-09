const { getPopularProducts } = require('../../../controller/productController.js'); 


jest.mock('../../../model/productModel', () => ({
  find: jest.fn(),
}));

describe('getPopularProducts controller', () => {

  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  it('should get popular products successfully', async () => {

    const mockProducts = [
      { _id: 'sampleId1', title: 'Product 1' },
      { _id: 'sampleId2', title: 'Product 2' },
    ];
    require('../../../model/productModel').find.mockReturnValueOnce({
      limit: jest.fn().mockResolvedValueOnce(mockProducts),
    });
    await getPopularProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      products: mockProducts,
    });
  });

  it('should handle internal server error', async () => {

    require('../../../model/productModel').find.mockReturnValueOnce({
      limit: jest.fn().mockRejectedValueOnce(new Error('Internal server error')),
    });

    await getPopularProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});
