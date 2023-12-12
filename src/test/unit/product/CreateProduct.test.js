const { createProduct } = require('../../../controller/productController.js'); 

jest.mock('../../../model/productModel', () => ({
  create: jest.fn(),
}));
jest.mock('../../../validators/schemaValidation', () => ({
  productSchema: {
    validate: jest.fn(() => ({ error: null })),
  },
}));

describe('createProduct controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        title: 'Sample Product',
        description: 'Sample description',
        price: 20.5,
        brand: 'Sample Brand',
        stock: 10,
        category: 'Sample Category',
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a product successfully', async () => {

    const createdProduct = { _id: 'sampleId', ...req.body };
    require('../../../model/productModel.js').create.mockResolvedValueOnce(createdProduct);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Success',
      data: createdProduct,
    });
  });

  it('should handle invalid request', async () => {
    req.body = {};

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'invalid request',
    });
  });

  it('should handle validation error', async () => {
    const validationError = {
      error: {
        details: [{ message: 'Validation error message' }],
      },
    };
    require('../../../validators/schemaValidation.js').productSchema.validate.mockReturnValueOnce(validationError);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Validation error message');
  });

  it('should handle internal server error', async () => {

    require('../../../model/productModel.js').create.mockRejectedValueOnce(new Error('Internal server error'));

    // Call the controller function
    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });

  it('should handle unexpected error during product creation', async () => {
    const unexpectedError = new Error('Unexpected error during product creation');
    require('../../../model/productModel.js').create.mockRejectedValueOnce(unexpectedError);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Unexpected error during product creation',
    });
  });
});


