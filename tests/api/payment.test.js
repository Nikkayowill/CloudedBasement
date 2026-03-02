// tests/api/payment.test.js
// Jest + Supertest test for payment processing API

const request = require('supertest');
const app = require('../../index'); // Adjust path if needed

describe('Payment Processing', () => {
  it('should reject unauthenticated payment attempts', async () => {
    const res = await request(app).post('/pay').send({ plan: 'basic' });
    expect(res.statusCode).toBe(401);
  });
  // Add more tests for Stripe session creation, webhook handling, etc.
});
