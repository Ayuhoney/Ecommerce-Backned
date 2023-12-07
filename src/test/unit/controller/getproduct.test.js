const { getAllProducts } = require('../../../controller/productController.js'); 
const productModel = require('../../../model/productModel.js'); 

jest.mock('../../../model/productModel.js');

describe('getAllProducts', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should retrieve all products successfully', async () => {
    const req = {
      params: {
        id: 'someUserId',
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the productModel.find to return an array of products
    const mockProducts = [
      { _id: 'product1', title: 'Product 1', price: 20 },
      { _id: 'product2', title: 'Product 2', price: 30 },
    ];
    productModel.find.mockResolvedValueOnce(mockProducts);

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ status: true, products: mockProducts });
  });

  it('should handle an internal server error', async () => {
    const req = {
      params: {
        id: 'someUserId',
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the productModel.find to throw an error
    const errorMessage = 'Internal server error';
    productModel.find.mockRejectedValueOnce(new Error(errorMessage));

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ status: false, message: errorMessage });
  });
});
