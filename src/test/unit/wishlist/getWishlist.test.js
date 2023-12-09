const { getWishlist } = require('../../../controller/wishlistController.js'); // Replace with the actual file name

// Mocking the necessary modules and functions
jest.mock('../../../model/wishlistModel', () => ({
  findOne: jest.fn(),
}));

describe('getWishlist controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        userId: '1222', // Provide a sample user ID for testing
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
  });
  it('should handle user wishlist not found', async () => {
    // Mock a scenario where the user wishlist is not found
    require('../../../model/wishlistModel').findOne.mockResolvedValueOnce(null);

    // Call the controller function
    await getWishlist(req, res);

    // Check if the response is as expected
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      error: 'User wishlist not found',
    });
  });
});
