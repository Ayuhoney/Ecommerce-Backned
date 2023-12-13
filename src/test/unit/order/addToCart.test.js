const { findCartItemIndex
} = require('../../../controller/cartController.js'); 

jest.mock('../../../model/cartModel'); 

describe('findCartItemIndex', () => {
  it('should find the index of an item in the cart', () => {
    const cartItems = [
      { productId: { _id: 'product1' } },
      { productId: { _id: 'product2' } },
      { productId: { _id: 'product3' } },
    ];
    const productId = { _id: 'product2' };

    const index = findCartItemIndex(cartItems, productId);

    expect(index).toBe(1);
  });

  it('should return -1 if the item is not in the cart', () => {
    const cartItems = [
      { productId: { _id: 'product1' } },
      { productId: { _id: 'product3' } },
    ];
    const productId = { _id: 'product2' };

    const index = findCartItemIndex(cartItems, productId);

    expect(index).toBe(-1);
  });
});

const { addToCart } = require('../../../controller/cartController.js');
const cartModel = require('../../../model/cartModel.js'); 

describe('addToCart', () => {
  it('should create a new cart with items', async () => {
    // Mock the create function of the cartModel
    const mockCreate = jest.spyOn(cartModel, 'create').mockResolvedValueOnce({
      _id: 'cart123',
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 2 }],
      totalPrice: 10,
      totalItems: 2,
    });

    const userId = 'user123';
    const items = [{ productId: 'product1', quantity: 2 }];

    // Call the function
    const result = await addToCart(userId, items);

    // Assertions
    expect(mockCreate).toHaveBeenCalledWith({
      userId,
      items,
      totalPrice: 0,
      totalItems: 0,
    });
    expect(result).toEqual({
      _id: 'cart123',
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 2 }],
      totalPrice: 10,
      totalItems: 2,
    });
    mockCreate.mockRestore();
  });
});


const { updateCarts } = require('../../../controller/cartController.js'); 

describe('updateCarts', () => {

  it('should update the user cart with new items', async () => {
    const mockSave = jest.spyOn(cartModel.prototype, 'save').mockResolvedValueOnce({
      _id: 'cart123',
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 3 }],
      totalPrice: 15,
      totalItems: 3,
      save: jest.fn(),
    });

    const userCart = {
      _id: 'cart123',
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 2 }],
      totalPrice: 10,
      totalItems: 2,
      save: jest.fn(),
    };

    const items = [{ productId: 'product1', quantity: 1 }];

    // Call the function
    await updateCarts(userCart, items);

    expect(userCart.items).toEqual([{ productId: 'product1', quantity: 3 }]);
    expect(userCart.totalItems).toBe(3);
    expect(userCart.totalPrice).toBe(NaN);
    mockSave.mockRestore();
  });
});
