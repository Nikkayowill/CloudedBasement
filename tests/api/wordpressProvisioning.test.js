// tests/api/wordpressProvisioning.test.js
// Jest + Supertest test for WordPress provisioning API

const request = require('supertest');
const app = require('../../index'); // Adjust path if needed

describe('WordPress Provisioning', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app).post('/onboarding/provision-wordpress').send({});
    expect(res.statusCode).toBe(401);
  });
  // Add more tests for authenticated provisioning, error cases, etc.
});
