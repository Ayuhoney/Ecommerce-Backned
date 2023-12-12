const { searchProduct } = require('../../../controller/productController.js'); 
const productModel = require('../../../model/productModel.js'); 

jest.mock('../../../model/productModel', () => ({
  find: jest.fn(),
}));

describe('searchProduct', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return products based on search query', async () => {

    const req = { query: { searchQuery: 'example-search-term' } };
    const res = {
      json: jest.fn(),
      status: jest.fn(),
    };

    const expectedProducts = [
      { title: 'Example Product 1', brand: 'Brand A', category: 'Category X' },
      { title: 'Example Product 2', brand: 'Brand B', category: 'Category Y' },
    ];
    productModel.find.mockResolvedValue(expectedProducts);

    await searchProduct(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: 'example-search-term', $options: 'i' } },
        { brand: { $regex: 'example-search-term', $options: 'i' } },
        { category: { $regex: 'example-search-term', $options: 'i' } },
      ],
    });

    expect(res.json).toHaveBeenCalledWith(expectedProducts);
  });

  it('should handle missing searchQuery and return a 400 status', async () => {
    const req = { query: {} };
    const res = {
      json: jest.fn(),
      status: jest.fn(),
    };

    await searchProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: false, message: 'Search query is required.' });
  });
});
