const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb+srv://ayush:ayush@cluster0.pfiybpo.mongodb.net/Ecommerce');

const app = express();
const createCart = require('../../../controller/cartController.js'); 

const productModel = require('../../../model/productModel.js');
const cartModel = require('../../../model/cartModel.js');

app.use(express.json());

app.post('/api/createCart', createCart);

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/createCart', () => {
  it('should return status 201 and a success message when adding an item to the cart', async () => {
  
    productModel.findById = jest.fn().mockResolvedValue({ _id: 'fakeProductId', price: 10 });

    cartModel.findOne = jest.fn().mockResolvedValue(null);
    cartModel.create = jest.fn().mockResolvedValue({
      userId: 'fakeUserId',
      items: [{ productId: 'fakeProductId', quantity: 1 }],
      totalItems: 1,
      totalPrice: 10,
    });

    const response = await request(app)
      .post('/api/createCart')
      .send({ user: { userId: 'fakeUserId' }, body: { productId: 'fakeProductId' } });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: true,
      message: 'item added successfully',
      cart: {
        userId: 'fakeUserId',
        items: [{ productId: 'fakeProductId', quantity: 1 }],
        totalItems: 1,
        totalPrice: 10,
      },
    });
  });

  it('should return status 400 and an error message for invalid product ID', async () => {
 

    productModel.findById = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .post('/api/createCart')
      .send({ user: { userId: 'fakeUserId' }, body: { productId: 'invalidProductId' } });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: false,
      message: 'please provide valid product Id',
    });
  });

});
