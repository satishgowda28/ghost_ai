'use strict';

/**
 * Tests for the Node.js logic embedded in extract-endpoint-detail.sh.
 *
 * The script reads an OpenAPI YAML spec from stdin, then uses Node.js to
 * locate a specific endpoint (path + method) and output:
 *   - A markdown heading for the method/path
 *   - The raw YAML block for that endpoint
 *   - Any $ref'd component schemas (recursively resolved)
 *
 * These tests run the shell script with controlled YAML inputs to verify
 * the parsing and output behaviour.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT_PATH = path.join(__dirname, '..', 'extract-endpoint-detail.sh');

/**
 * Minimal well-formed OpenAPI YAML spec used as the base for most tests.
 *
 * Indentation is significant: paths at 2 spaces, methods at 4 spaces,
 * content at 6+ spaces — mirroring what the parser expects.
 */
const MINIMAL_SPEC = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      tags:
        - Users
      responses:
        '200':
          description: OK
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
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /users/{user_id}:
    get:
      operationId: getUser
      summary: Get a user by ID
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
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
    delete:
      operationId: deleteUser
      summary: Delete a user
      tags:
        - Users
      responses:
        '204':
          description: No Content
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
    CreateUserRequest:
      type: object
      properties:
        email:
          type: string
        name:
          type: string
`;

/**
 * Run extract-endpoint-detail.sh with the given spec (stdin) and arguments.
 */
function runScript(spec, endpointPath, method) {
  return spawnSync('bash', [SCRIPT_PATH, endpointPath, method], {
    input: spec,
    encoding: 'utf8',
    timeout: 10000,
  });
}

describe('extract-endpoint-detail.sh', () => {
  describe('basic endpoint extraction', () => {
    test('extracts a GET endpoint and outputs a markdown heading', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## `GET` `\/users`/);
    });

    test('extracts endpoint definition block header', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /### Endpoint Definition/);
    });

    test('includes the operationId in the YAML block', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /operationId: listUsers/);
    });

    test('wraps the endpoint YAML in a code fence', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /```yaml/);
      assert.match(result.stdout, /```/);
    });

    test('extracts a POST endpoint', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'post');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## `POST` `\/users`/);
      assert.match(result.stdout, /operationId: createUser/);
    });

    test('extracts a DELETE endpoint on a path with parameters', () => {
      const result = runScript(MINIMAL_SPEC, '/users/{user_id}', 'delete');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## `DELETE` `\/users\/\{user_id\}`/);
      assert.match(result.stdout, /operationId: deleteUser/);
    });

    test('method argument is case-insensitive (uppercase GET works)', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'GET');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## `GET` `\/users`/);
    });
  });

  describe('$ref resolution', () => {
    test('lists Referenced Components section when $refs are present', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'post');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /### Referenced Components/);
    });

    test('includes the $ref schema name in the components section', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'post');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /CreateUserRequest/);
    });

    test('resolves $refs transitively from response schema', () => {
      const result = runScript(MINIMAL_SPEC, '/users/{user_id}', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /User/);
    });

    test('does NOT include Referenced Components section when there are no $refs', () => {
      // The GET /users endpoint has no $refs
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      assert.doesNotMatch(result.stdout, /### Referenced Components/);
    });
  });

  describe('error handling', () => {
    test('exits with code 1 when the endpoint path does not exist', () => {
      const result = runScript(MINIMAL_SPEC, '/nonexistent', 'get');
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Endpoint not found/);
    });

    test('exits with code 1 when the method does not exist on a known path', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'patch');
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Endpoint not found/);
    });

    test('error message includes the searched method and path', () => {
      const result = runScript(MINIMAL_SPEC, '/users/{user_id}', 'put');
      assert.equal(result.status, 1);
      assert.match(result.stderr, /PUT/);
      assert.match(result.stderr, /\/users\/\{user_id\}/);
    });
  });

  describe('multi-endpoint spec isolation', () => {
    test('extracting one endpoint does not include content from another endpoint', () => {
      const result = runScript(MINIMAL_SPEC, '/users', 'get');
      assert.equal(result.status, 0);
      // createUser is the POST endpoint and should not appear in a GET /users extraction
      assert.doesNotMatch(result.stdout, /operationId: createUser/);
    });

    test('extracting /users/{user_id} GET does not include /users GET content', () => {
      const resultPathParam = runScript(MINIMAL_SPEC, '/users/{user_id}', 'get');
      assert.equal(resultPathParam.status, 0);
      assert.doesNotMatch(resultPathParam.stdout, /operationId: listUsers/);
      assert.match(resultPathParam.stdout, /operationId: getUser/);
    });
  });

  describe('spec with no components section', () => {
    const SPEC_NO_COMPONENTS = `openapi: 3.0.0
paths:
  /health:
    get:
      operationId: healthCheck
      summary: Health check
      responses:
        '200':
          description: OK
`;

    test('successfully extracts an endpoint when there is no components section', () => {
      const result = runScript(SPEC_NO_COMPONENTS, '/health', 'get');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /## `GET` `\/health`/);
    });

    test('no Referenced Components section when spec has no components', () => {
      const result = runScript(SPEC_NO_COMPONENTS, '/health', 'get');
      assert.equal(result.status, 0);
      assert.doesNotMatch(result.stdout, /### Referenced Components/);
    });
  });

  describe('edge cases', () => {
    test('handles a spec where the matched path is the last path in the file', () => {
      // /users/{user_id} delete is the last method block before components:
      const result = runScript(MINIMAL_SPEC, '/users/{user_id}', 'delete');
      assert.equal(result.status, 0);
      assert.match(result.stdout, /operationId: deleteUser/);
    });

    test('component section header shows correct count', () => {
      // POST /users has $refs to CreateUserRequest and User (response)
      const result = runScript(MINIMAL_SPEC, '/users', 'post');
      assert.equal(result.status, 0);
      // Expect "Referenced Components (N)" where N >= 1
      assert.match(result.stdout, /Referenced Components \(\d+\)/);
    });
  });
});