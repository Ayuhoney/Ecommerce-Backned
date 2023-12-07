const { createProduct } = require('../../../controller/productController.js'); // Adjust the path accordingly
const productModel = require('../../../model/productModel.js'); // Adjust the path accordingly
const Joi = require('joi');

jest.mock('../../../model/productModel.js'); // Adjust the path accordingly

describe('createProduct', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new product successfully with valid input', async () => {
    const req = {
      body: {
        title: 'Test Product',
        description: 'A test product',
        price: 20,
        brand: 'TestBrand',
        stock: 50,
        category: 'TestCategory',
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the validation result to indicate valid input
    const validInput = {
      error: null,
    };
    jest.spyOn(Joi, 'object').mockReturnValue(validInput);

    // Mocking the product creation
    productModel.create.mockResolvedValueOnce({
      _id: 'someProductId',
      title: 'Test Product',
      description: 'A test product',
      price: 20,
      brand: 'TestBrand',
      stock: 50,
      category: 'TestCategory',
    });

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Success',
      data: {
        _id: 'someProductId',
        title: 'Test Product',
        description: 'A test product',
        price: 20,
        brand: 'TestBrand',
        stock: 50,
        category: 'TestCategory',
      },
    });
  });

  it('should return an error for invalid input', async () => {
    const req = {
      body: {
        // Invalid input intentionally left blank
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the validation result to indicate invalid input
    const invalidInput = {
      error: {
        details: [{ message: 'Validation error message' }],
      },
    };
    jest.spyOn(Joi, 'object').mockReturnValue(invalidInput);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ status: false, message: "invalid request" });
  });

  it('should return an error for an invalid request', async () => {
    const req = {
      body: {
        // More than 6 properties intentionally added
        title: 'Test Product',
        description: 'A test product',
        price: 20,
        brand: 'TestBrand',
        stock: 50,
        category: 'TestCategory',
        extraProperty: 'Extra',
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the validation result to indicate valid input
    const validInput = {
      error: null,
    };
    jest.spyOn(Joi, 'object').mockReturnValue(validInput);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'invalid request',
    });
  });

  it('should handle internal server error', async () => {
    const req = {
      body: {
        title: 'Test Product',
        description: 'A test product',
        price: 20,
        brand: 'TestBrand',
        stock: 50,
        category: 'TestCategory',
      },
    };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mocking the validation result to indicate valid input
    const validInput = {
      error: null,
    };
    jest.spyOn(Joi, 'object').mockReturnValue(validInput);

    // Mocking the product creation to throw an error
    productModel.create.mockRejectedValueOnce(new Error('Internal server error'));

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});
