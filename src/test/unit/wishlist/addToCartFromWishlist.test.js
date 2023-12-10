const { addToCartFromWishlist } = require('../../../controller/wishlistController.js'); 

jest.mock('../../../model/wishlistModel', () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock('../../../model/cartModel', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../../../model/productModel', () => ({
  findById: jest.fn(),
}));

describe('addToCartFromWishlist controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        userId: 'sampleUserId', // Provide a sample user ID for testing
      },
      body: {
        wishlistId: 'sampleWishlistId', // Provide a sample wishlist ID for testing
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  it('should handle missing wishlistId in request body', async () => {
    // Omitted the wishlistId in the request body to simulate a missing parameter
    req.body.wishlistId = undefined;

    // Call the controller function
    await addToCartFromWishlist(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Please provide a wishlist Id',
    });
  });

  // Add more test cases as needed
});
