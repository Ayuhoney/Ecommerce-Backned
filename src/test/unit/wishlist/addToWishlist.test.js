const {addToWishlist} = require('../../../controller/wishlistController.js'); 
const productModel = require('../../../model/productModel.js'); 
const userModel = require('../../../model/userModel.js');
const wishlistModel = require('../../../model/wishlistModel.js');

jest.mock('../../../model/productModel');
jest.mock('../../../model/userModel');
jest.mock('../../../model/wishlistModel');

describe('addToWishlist', () => {
  test('should add product to wishlist', async () => {
    const req = {
      user: {
        userId: 'validUserId',
      },
      body: {
        productId: 'validProductId',
      },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mock the product and user
    productModel.findById.mockResolvedValueOnce({ _id: 'validProductId' });
    userModel.findById.mockResolvedValueOnce({ _id: 'validUserId' });

    // Mock the wishlist to not exist initially
    wishlistModel.findOne.mockResolvedValueOnce(null);

    // Mock the creation of the wishlist
    wishlistModel.create.mockResolvedValueOnce({
      userId: 'validUserId',
      products: ['validProductId'],
    });

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Added to wishlist',
      wishlist: {
        userId: 'validUserId',
        products: ['validProductId'],
      },
    });
  });

  test('should handle product already in wishlist', async () => {
    const req = {
      user: {
        userId: 'validUserId',
      },
      body: {
        productId: 'validProductId',
      },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Mock the product and user
    productModel.findById.mockResolvedValueOnce({ _id: 'validProductId' });
    userModel.findById.mockResolvedValueOnce({ _id: 'validUserId' });

    // Mock the wishlist to contain the product
    wishlistModel.findOne.mockResolvedValueOnce({
      userId: 'validUserId',
      products: ['validProductId'],
    });

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'This product is already in your wishlist',
    });
  });

});
