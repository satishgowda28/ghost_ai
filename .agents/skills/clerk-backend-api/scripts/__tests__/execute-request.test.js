'use strict';

/**
 * Tests for execute-request.sh
 *
 * These tests verify the scope-enforcement logic that runs BEFORE any curl
 * call is made. Tests intentionally do NOT exercise the actual HTTP request
 * path (curl) to avoid network dependencies.
 *
 * Scope rules under test:
 *   GET     — always allowed by scope check (exits 0 from scope logic)
 *   POST/PUT/PATCH — requires CLERK_BAPI_SCOPES containing "write"
 *   DELETE  — requires CLERK_BAPI_SCOPES containing both "write" AND "delete"
 *   --admin — bypasses ALL scope checks
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT_PATH = path.join(__dirname, '..', 'execute-request.sh');

/**
 * Run execute-request.sh with the given args and environment overrides.
 * CLERK_SECRET_KEY is injected so the script does not fail on an empty-key
 * guard (the key guard is evaluated only when curl actually executes, but
 * we set it anyway for correctness).
 * CLERK_REST_API_URL is set to an unreachable address so that on any code
 * path where curl is reached the curl call exits immediately with an error
 * rather than making a real network request.
 */
function runScript(args, envOverrides = {}) {
  const env = {
    ...process.env,
    CLERK_SECRET_KEY: 'sk_test_fake_key_for_testing',
    // Point to localhost so curl returns fast with a connection-refused error
    CLERK_REST_API_URL: 'http://127.0.0.1:0',
    CLERK_BAPI_SCOPES: '',
    ...envOverrides,
  };

  return spawnSync('bash', [SCRIPT_PATH, ...args], {
    encoding: 'utf8',
    timeout: 5000,
    env,
  });
}

describe('execute-request.sh — scope enforcement', () => {
  describe('GET requests', () => {
    test('GET is allowed without any CLERK_BAPI_SCOPES value', () => {
      const result = runScript(['GET', '/users'], { CLERK_BAPI_SCOPES: '' });
      // The scope check passes; curl will fail for an unrelated reason (no
      // real server), but the scope-enforcement exit code must NOT be 1.
      // We verify we did NOT receive the scope-error message.
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('GET is allowed even when CLERK_BAPI_SCOPES is completely absent', () => {
      const env = { ...process.env, CLERK_SECRET_KEY: 'sk_test_fake', CLERK_REST_API_URL: 'http://127.0.0.1:0' };
      delete env.CLERK_BAPI_SCOPES;
      const result = spawnSync('bash', [SCRIPT_PATH, 'GET', '/users'], {
        encoding: 'utf8',
        timeout: 5000,
        env,
      });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });
  });

  describe('POST requests — require "write" scope', () => {
    test('POST without any scopes exits with code 1 and prints the error', () => {
      const result = runScript(['POST', '/organizations'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /POST requests require CLERK_BAPI_SCOPES="write"/);
    });

    test('POST with only "delete" scope (no "write") exits with code 1', () => {
      const result = runScript(['POST', '/organizations'], { CLERK_BAPI_SCOPES: 'delete' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /require CLERK_BAPI_SCOPES="write"/);
    });

    test('POST with "write" scope passes the scope check', () => {
      const result = runScript(['POST', '/organizations'], { CLERK_BAPI_SCOPES: 'write' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('POST with "write,delete" scope passes the scope check', () => {
      const result = runScript(['POST', '/organizations'], { CLERK_BAPI_SCOPES: 'write,delete' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });
  });

  describe('PUT requests — require "write" scope', () => {
    test('PUT without scopes exits with code 1', () => {
      const result = runScript(['PUT', '/users/user_123'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /PUT requests require CLERK_BAPI_SCOPES="write"/);
    });

    test('PUT with "write" scope passes the scope check', () => {
      const result = runScript(['PUT', '/users/user_123'], { CLERK_BAPI_SCOPES: 'write' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });
  });

  describe('PATCH requests — require "write" scope', () => {
    test('PATCH without scopes exits with code 1', () => {
      const result = runScript(['PATCH', '/users/user_123'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /PATCH requests require CLERK_BAPI_SCOPES="write"/);
    });

    test('PATCH with "write" scope passes the scope check', () => {
      const result = runScript(['PATCH', '/users/user_123'], { CLERK_BAPI_SCOPES: 'write' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('lowercase "patch" is normalised to uppercase before scope check', () => {
      const result = runScript(['patch', '/users/user_123'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /PATCH requests require CLERK_BAPI_SCOPES="write"/);
    });
  });

  describe('DELETE requests — require "write" AND "delete" scopes', () => {
    test('DELETE without any scopes exits with code 1', () => {
      const result = runScript(['DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /DELETE requests require CLERK_BAPI_SCOPES="write,delete"/);
    });

    test('DELETE with only "write" scope (no "delete") exits with code 1', () => {
      const result = runScript(['DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: 'write' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /DELETE requests require CLERK_BAPI_SCOPES="write,delete"/);
    });

    test('DELETE with only "delete" scope (no "write") exits with code 1', () => {
      const result = runScript(['DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: 'delete' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /DELETE requests require CLERK_BAPI_SCOPES="write,delete"/);
    });

    test('DELETE with "write,delete" scope passes the scope check', () => {
      const result = runScript(['DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: 'write,delete' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('DELETE with "delete,write" (reversed order) passes the scope check', () => {
      const result = runScript(['DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: 'delete,write' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });
  });

  describe('--admin flag bypasses scope checks', () => {
    test('--admin allows POST without any scopes', () => {
      const result = runScript(['--admin', 'POST', '/organizations'], { CLERK_BAPI_SCOPES: '' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('--admin allows DELETE without any scopes', () => {
      const result = runScript(['--admin', 'DELETE', '/users/user_123'], { CLERK_BAPI_SCOPES: '' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });

    test('--admin allows PATCH without "write" scope', () => {
      const result = runScript(['--admin', 'PATCH', '/users/user_123'], { CLERK_BAPI_SCOPES: 'delete' });
      assert.doesNotMatch(result.stderr, /require CLERK_BAPI_SCOPES/);
    });
  });

  describe('unknown HTTP methods', () => {
    test('an unsupported method exits with code 1 and prints an error', () => {
      const result = runScript(['CONNECT', '/users'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Unknown HTTP method/);
    });

    test('HEAD method exits with unknown-method error', () => {
      const result = runScript(['HEAD', '/users'], { CLERK_BAPI_SCOPES: '' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Unknown HTTP method/);
    });
  });

  describe('scope error message includes the current scopes', () => {
    test('error output contains the current CLERK_BAPI_SCOPES value', () => {
      const result = runScript(['POST', '/invitations'], { CLERK_BAPI_SCOPES: 'read_only' });
      assert.match(result.stderr, /Current CLERK_BAPI_SCOPES: "read_only"/);
    });
  });
});