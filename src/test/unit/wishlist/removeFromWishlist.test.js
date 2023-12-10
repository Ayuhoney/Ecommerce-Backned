const { removeFromWishlist } = require('../../../controller/wishlistController.js'); 

jest.mock('../../../model/wishlistModel', () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('removeFromWishlist controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        userId: 'sampleUserId', // Provide a sample user ID for testing
      },
      body: {
        productId: 'sampleProductId', // Provide a sample product ID for testing
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });

  it('should handle internal server error', async () => {
    // Mock an internal server error
    require('../../../model/wishlistModel').findOne.mockRejectedValueOnce(new Error('Internal server error'));

    // Call the controller function
    await removeFromWishlist(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });

});
