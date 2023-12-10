
const orderModel = require('../../../model/orderModel');
const {getOrder}= require('../../../controller/orderController.js')

const reqMock = {
  user: {
    userId: 'sampleUserId',
  },
};

const resMock = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

describe('getOrder function', () => {

  it('should return a 500 error if an exception occurs', async () => {
    orderModel.find = jest.fn().mockImplementationOnce(() => {
      throw new Error('Sample error');
    });

    await getOrder(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.send).toHaveBeenCalledWith({
      status: false,
      error: 'Sample error',
    });
  });

  it('should return a 500 error if an exception occurs', async () => {
    // Mocking the find method of orderModel to throw an error
    orderModel.find = jest.fn().mockImplementationOnce(() => {
      throw new Error('Sample error');
    });

    await getOrder(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.send).toHaveBeenCalledWith({
      status: false,
      error: 'Sample error',
    });
  });
  it('should return a 404 error if an exception occurs', async () => {
    // Mocking the find method of orderModel to throw an error
    orderModel.find = jest.fn().mockImplementationOnce(() => {
      throw new Error('Sample error');
    });

    await getOrder(reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.send).toHaveBeenCalledWith({
      status: false,
      error: 'Sample error',
    });
  });
});
