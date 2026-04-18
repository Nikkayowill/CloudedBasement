// tests/api/provisioning.test.js
// Run: node --test tests/api/provisioning.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../index');

describe('Admin / provisioning API — unauthenticated access', () => {
  test('GET /admin/data returns 401 without session (JSON client)', async () => {
    const res = await request(app)
      .get('/admin/data')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });

  test('POST /admin/delete-user/:id returns 401 without session (JSON client)', async () => {
    const res = await request(app)
      .post('/admin/delete-user/999')
      .set('Accept', 'application/json')
      .send({});
    assert.equal(res.statusCode, 401);
  });
});
