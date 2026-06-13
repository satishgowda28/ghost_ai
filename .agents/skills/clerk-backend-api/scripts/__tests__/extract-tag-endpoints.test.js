'use strict';

/**
 * Tests for the Node.js logic embedded in extract-tag-endpoints.sh.
 *
 * The script reads an OpenAPI YAML spec from stdin and a tag name as an
 * argument, then outputs all endpoints that carry that tag including their
 * operationId, summary, description, and any $ref component names.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT_PATH = path.join(__dirname, '..', 'extract-tag-endpoints.sh');

/**
 * A small multi-tag OpenAPI spec used as the fixture for most tests.
 * Indentation mirrors real Clerk BAPI specs:
 *   paths at 2 sp, method at 4 sp, operation keys at 6 sp.
 */
const FIXTURE_SPEC = `openapi: 3.0.0
info:
  title: Fixture API
  version: 1.0.0
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      description: Returns a paginated list of users.
      tags:
        - Users
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    post:
      operationId: createUser
      summary: Create a user
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: Created
  /users/{user_id}:
    get:
      operationId: getUser
      summary: Get a single user
      tags:
        - Users
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
    delete:
      operationId: deleteUser
      summary: Delete a user
      tags:
        - Users
      responses:
        '204':
          description: No Content
  /organizations:
    get:
      operationId: listOrganizations
      summary: List organizations
      tags:
        - Organizations
      responses:
        '200':
          description: OK
    post:
      operationId: createOrganization
      summary: Create an organization
      tags:
        - Organizations
      responses:
        '201':
          description: Created
  /organizations/{org_id}/memberships:
    get:
      operationId: listMemberships
      summary: List memberships
      description: Returns all memberships for an organization.
      tags:
        - Organizations
      responses:
        '200':
          description: OK
components:
  schemas:
    UserList:
      type: array
      items:
        $ref: '#/components/schemas/User'
    User:
      type: object
      properties:
        id:
          type: string
    CreateUserRequest:
      type: object
      properties:
        email:
          type: string
`;

/**
 * Run extract-tag-endpoints.sh with the given spec (stdin) and tag name.
 */
function runScript(spec, tagName) {
  return spawnSync('bash', [SCRIPT_PATH, tagName], {
    input: spec,
    encoding: 'utf8',
    timeout: 10000,
  });
}

describe('extract-tag-endpoints.sh', () => {
  describe('basic tag extraction', () => {
    test('exits with code 0 when the tag exists', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
    });

    test('outputs a top-level heading with the tag name and count', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## Endpoints for "Users"/);
    });

    test('reports the correct number of matched endpoints', () => {
      // The fixture has 4 endpoints tagged "Users"
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /\(4 total\)/);
    });

    test('lists all matched endpoints as sub-headings', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /### `GET` `\/users`/);
      assert.match(result.stdout, /### `POST` `\/users`/);
      assert.match(result.stdout, /### `GET` `\/users\/\{user_id\}`/);
      assert.match(result.stdout, /### `DELETE` `\/users\/\{user_id\}`/);
    });

    test('includes operationId for matched endpoints', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /\*\*operationId\*\*: `listUsers`/);
      assert.match(result.stdout, /\*\*operationId\*\*: `createUser`/);
    });

    test('includes summary for matched endpoints', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /\*\*summary\*\*: List all users/);
    });
  });

  describe('Organizations tag', () => {
    test('correctly extracts Organizations endpoints', () => {
      const result = runScript(FIXTURE_SPEC, 'Organizations');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## Endpoints for "Organizations"/);
      assert.match(result.stdout, /\(3 total\)/);
    });

    test('does not include Users endpoints when filtering by Organizations', () => {
      const result = runScript(FIXTURE_SPEC, 'Organizations');
      assert.equal(result.status, 0);
      assert.doesNotMatch(result.stdout, /listUsers/);
      assert.doesNotMatch(result.stdout, /createUser/);
    });
  });

  describe('tag matching is case-insensitive', () => {
    test('lowercase tag name matches the spec tag', () => {
      const result = runScript(FIXTURE_SPEC, 'users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /listUsers/);
    });

    test('uppercase tag name matches a lowercase-defined tag in a spec', () => {
      const specWithLowercaseTag = FIXTURE_SPEC.replace(
        /tags:\n        - Users/g,
        'tags:\n        - users'
      );
      const result = runScript(specWithLowercaseTag, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /listUsers/);
    });
  });

  describe('$ref output', () => {
    test('lists Referenced Components section when endpoints have $refs', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## Referenced Components/);
    });

    test('includes the schema names in the refs section', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /`UserList`/);
      assert.match(result.stdout, /`CreateUserRequest`/);
    });

    test('no Referenced Components section when no endpoints have $refs', () => {
      const result = runScript(FIXTURE_SPEC, 'Organizations');
      assert.equal(result.status, 0);
      assert.doesNotMatch(result.stdout, /## Referenced Components/);
    });
  });

  describe('description extraction', () => {
    test('includes description for endpoints that have one', () => {
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /Returns a paginated list of users/);
    });

    test('does not duplicate description when it equals the summary', () => {
      // The script only outputs description if description !== summary
      const result = runScript(FIXTURE_SPEC, 'Users');
      assert.equal(result.status, 0);
      // "List all users" appears as summary; description is different text
      const descMatches = result.stdout.match(/\*\*description\*\*/g) || [];
      // Only GET /users has a distinct description in the fixture
      assert.ok(descMatches.length >= 1);
    });
  });

  describe('error handling', () => {
    test('exits with code 1 when the tag is not found in the spec', () => {
      const result = runScript(FIXTURE_SPEC, 'Billing');
      assert.equal(result.status, 1);
    });

    test('error message includes the tag name that was not found', () => {
      const result = runScript(FIXTURE_SPEC, 'Billing');
      assert.equal(result.status, 1);
      assert.match(result.stderr, /No endpoints found for tag: "Billing"/);
    });

    test('exits with code 1 for an empty tag name', () => {
      // The script requires at least one argument
      const result = spawnSync('bash', [SCRIPT_PATH], {
        input: FIXTURE_SPEC,
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.notEqual(result.status, 0);
    });
  });

  describe('spec with a single endpoint', () => {
    const SINGLE_ENDPOINT_SPEC = `openapi: 3.0.0
paths:
  /health:
    get:
      operationId: healthCheck
      summary: Health check
      tags:
        - System
      responses:
        '200':
          description: OK
`;

    test('extracts the only endpoint correctly', () => {
      const result = runScript(SINGLE_ENDPOINT_SPEC, 'System');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## Endpoints for "System"/);
      assert.match(result.stdout, /\(1 total\)/);
      assert.match(result.stdout, /### `GET` `\/health`/);
    });
  });

  describe('refs are deduplicated across endpoints', () => {
    const SPEC_SHARED_REF = `openapi: 3.0.0
paths:
  /a:
    get:
      operationId: getA
      summary: Get A
      tags:
        - Tag
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SharedModel'
  /b:
    get:
      operationId: getB
      summary: Get B
      tags:
        - Tag
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SharedModel'
components:
  schemas:
    SharedModel:
      type: object
`;

    test('each shared $ref appears only once in the Referenced Components list', () => {
      const result = runScript(SPEC_SHARED_REF, 'Tag');
      assert.equal(result.status, 0);
      const matches = result.stdout.match(/`SharedModel`/g) || [];
      // It may appear in the per-endpoint refs line AND in the summary section,
      // but the "## Referenced Components (N unique)" section should say 1 unique.
      assert.match(result.stdout, /\(1 unique\)/);
    });
  });
});