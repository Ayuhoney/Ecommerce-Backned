const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require(' mongodb+srv://ayush:ayush@cluster0.pfiybpo.mongodb.net/Ecommerce');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const paymentController = require('../../../controller/stripeController.js');
const orderModel = require('../../../model/orderModel.js');
app.use(express.json());

app.post('/api/payment', paymentController);
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

describe('POST /api/payment', () => {
  it('should return status 200 and a session object for a successful payment', async () => {
    
    stripe.checkout.sessions.create = jest.fn().mockResolvedValue({
      id: 'fakeSessionId',
    });
    orderModel.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .post('/api/payment')
      .send({
        body: {
          items: [
            {
              productId: {
                title: 'Fake Product',
                images: ['fake-image-url'],
                price: 10,
              },
              quantity: 2,
            },
          ],
          currency: 'USD',
          form: { email: 'fake@example.com' },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'fakeSessionId'});
  });

  it('should return status 400 for an invalid currency', async () => {
    const response = await request(app)
      .post('/api/payment')
      .send({
        body: {
          items: [
            {
              productId: {
                title: 'Fake Product',
                images: ['fake-image-url'],
                price: 10,
              },
              quantity: 2,
            },
          ],
          currency: 'GBP',
          form: { email: 'fake@example.com' },
        },
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid currency',
    });
  });
});
