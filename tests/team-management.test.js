// tests/team-management.test.js
// Unit tests for team RBAC helpers and HTTP endpoint auth guards.
//
// teamRoleAtLeast and hasTeamPermission are pure — no DB required.
// Auth guard tests use supertest against the live Express app.

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');

const {
  TEAM_ROLE_OWNER,
  TEAM_ROLE_ADMIN,
  TEAM_ROLE_DEVELOPER,
  TEAM_ROLE_VIEWER,
  VALID_TEAM_ROLES,
  teamRoleAtLeast,
  hasTeamPermission,
} = require('../src/utils/rbac');

// ── teamRoleAtLeast ───────────────────────────────────────────────────────────

describe('teamRoleAtLeast — hierarchy enforcement', () => {
  test('owner satisfies all role checks', () => {
    assert.ok(teamRoleAtLeast(TEAM_ROLE_OWNER, TEAM_ROLE_OWNER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_OWNER, TEAM_ROLE_ADMIN));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_OWNER, TEAM_ROLE_DEVELOPER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_OWNER, TEAM_ROLE_VIEWER));
  });

  test('admin satisfies admin/developer/viewer but not owner', () => {
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_ADMIN, TEAM_ROLE_OWNER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_ADMIN, TEAM_ROLE_ADMIN));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_ADMIN, TEAM_ROLE_DEVELOPER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_ADMIN, TEAM_ROLE_VIEWER));
  });

  test('developer satisfies developer/viewer but not admin/owner', () => {
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_DEVELOPER, TEAM_ROLE_OWNER));
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_DEVELOPER, TEAM_ROLE_ADMIN));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_DEVELOPER, TEAM_ROLE_DEVELOPER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_DEVELOPER, TEAM_ROLE_VIEWER));
  });

  test('viewer only satisfies viewer', () => {
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_VIEWER, TEAM_ROLE_OWNER));
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_VIEWER, TEAM_ROLE_ADMIN));
    assert.ok(!teamRoleAtLeast(TEAM_ROLE_VIEWER, TEAM_ROLE_DEVELOPER));
    assert.ok(teamRoleAtLeast(TEAM_ROLE_VIEWER, TEAM_ROLE_VIEWER));
  });

  test('unknown role satisfies nothing', () => {
    assert.ok(!teamRoleAtLeast('hacker', TEAM_ROLE_VIEWER));
    assert.ok(!teamRoleAtLeast(undefined, TEAM_ROLE_VIEWER));
  });
});

// ── hasTeamPermission ─────────────────────────────────────────────────────────

describe('hasTeamPermission', () => {
  test('owner has wildcard permission', () => {
    assert.ok(hasTeamPermission(TEAM_ROLE_OWNER, 'deploy'));
    assert.ok(hasTeamPermission(TEAM_ROLE_OWNER, 'billing:read'));
    assert.ok(hasTeamPermission(TEAM_ROLE_OWNER, 'members:manage'));
  });

  test('admin can manage members and deploy', () => {
    assert.ok(hasTeamPermission(TEAM_ROLE_ADMIN, 'members:manage'));
    assert.ok(hasTeamPermission(TEAM_ROLE_ADMIN, 'deploy'));
    assert.ok(hasTeamPermission(TEAM_ROLE_ADMIN, 'billing:read'));
  });

  test('developer cannot manage members', () => {
    assert.ok(!hasTeamPermission(TEAM_ROLE_DEVELOPER, 'members:manage'));
    assert.ok(hasTeamPermission(TEAM_ROLE_DEVELOPER, 'deploy'));
  });

  test('viewer cannot deploy or write env', () => {
    assert.ok(!hasTeamPermission(TEAM_ROLE_VIEWER, 'deploy'));
    assert.ok(!hasTeamPermission(TEAM_ROLE_VIEWER, 'env:write'));
    assert.ok(hasTeamPermission(TEAM_ROLE_VIEWER, 'deploy:read'));
    assert.ok(hasTeamPermission(TEAM_ROLE_VIEWER, 'billing:read'));
  });
});

// ── VALID_TEAM_ROLES ──────────────────────────────────────────────────────────

describe('VALID_TEAM_ROLES', () => {
  test('contains all four expected roles', () => {
    assert.ok(VALID_TEAM_ROLES.includes('owner'));
    assert.ok(VALID_TEAM_ROLES.includes('admin'));
    assert.ok(VALID_TEAM_ROLES.includes('developer'));
    assert.ok(VALID_TEAM_ROLES.includes('viewer'));
  });
});

// ── Auth guards ───────────────────────────────────────────────────────────────

describe('GET /api/team/members — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .get('/api/team/members')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});

describe('POST /api/team/invite — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .post('/api/team/invite')
      .set('Accept', 'application/json')
      .send({ email: 'test@example.com', role: 'developer' });
    assert.equal(res.statusCode, 401);
  });
});

describe('PATCH /api/team/members/:id/role — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .patch('/api/team/members/1/role')
      .set('Accept', 'application/json')
      .send({ role: 'viewer' });
    assert.equal(res.statusCode, 401);
  });
});

describe('DELETE /api/team/members/:id — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .delete('/api/team/members/1')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});

describe('DELETE /api/team/invites/:id — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .delete('/api/team/invites/1')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});

// ── teamController input validation (no auth/DB needed for 401 tests) ─────────

describe('POST /api/team/invite/accept — token format validation', () => {
  test('GET with missing token redirects to login (unauthenticated)', async () => {
    const res = await request(app).get('/api/team/invite/accept');
    // Unauthenticated + no token: route handles redirect to login or 400
    assert.ok([302, 400].includes(res.statusCode),
      `expected 302 or 400, got ${res.statusCode}`);
  });

  test('GET with malformed token returns 302 redirect (unauthenticated) or 400', async () => {
    const res = await request(app).get('/api/team/invite/accept?token=not-a-real-token');
    assert.ok([302, 400].includes(res.statusCode),
      `expected 302 or 400, got ${res.statusCode}`);
  });
});
