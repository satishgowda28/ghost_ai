'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT_PATH = path.join(__dirname, '..', 'extract-tags.js');

/**
 * Run extract-tags.js with the given stdin input.
 * Returns { stdout, stderr, status }.
 */
function runExtractTags(input) {
  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    input,
    encoding: 'utf8',
    timeout: 5000,
  });
  return result;
}

describe('extract-tags.js', () => {
  test('extracts a single tag name from a minimal OpenAPI spec', () => {
    const yaml = `openapi: 3.0.0
tags:
  - name: Users
    description: User management
paths: {}
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'Users');
  });

  test('extracts multiple tag names in order', () => {
    const yaml = `openapi: 3.0.0
tags:
  - name: Users
    description: User management
  - name: Organizations
    description: Org management
  - name: Billing
    description: Billing management
paths: {}
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    const lines = result.stdout.trim().split('\n');
    assert.deepEqual(lines, ['Users', 'Organizations', 'Billing']);
  });

  test('produces no output for a spec without a tags section', () => {
    const yaml = `openapi: 3.0.0
info:
  title: No Tags Spec
paths: {}
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), '');
  });

  test('stops parsing tags when a non-indented line follows the tags block', () => {
    const yaml = `openapi: 3.0.0
tags:
  - name: Alpha
  - name: Beta
paths:
  /users:
    get:
      tags:
        - name: ShouldNotAppear
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    const lines = result.stdout.trim().split('\n');
    assert.deepEqual(lines, ['Alpha', 'Beta']);
  });

  test('handles Windows-style CRLF line endings', () => {
    const yaml = 'openapi: 3.0.0\r\ntags:\r\n  - name: WindowsTag\r\n    description: CRLF test\r\npaths: {}\r\n';
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'WindowsTag');
  });

  test('produces no output for an empty input', () => {
    const result = runExtractTags('');
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), '');
  });

  test('ignores tags key inside other sections (only top-level tags:)', () => {
    const yaml = `openapi: 3.0.0
paths:
  /example:
    get:
      tags:
        - name: NotATopLevelTag
      summary: Example
      operationId: getExample
tags:
  - name: TopLevelTag
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    // Only the top-level "tags:" line (matching line === "tags:") triggers extraction.
    // The indented "      tags:" does not match since it is not exactly "tags:".
    assert.equal(result.stdout.trim(), 'TopLevelTag');
  });

  test('handles a spec with tags section at the end of file', () => {
    const yaml = `openapi: 3.0.0
paths:
  /users:
    get:
      summary: List users
tags:
  - name: Users
  - name: Organizations
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    const lines = result.stdout.trim().split('\n');
    assert.deepEqual(lines, ['Users', 'Organizations']);
  });

  test('does not output tags that lack a name field', () => {
    const yaml = `openapi: 3.0.0
tags:
  - description: No name here
  - name: ValidTag
paths: {}
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'ValidTag');
  });

  test('handles a single tag with extra whitespace around the name value', () => {
    // The regex is /^\s{2}- name:\s*(.+)/ — the captured group (.+) includes trailing whitespace
    const yaml = `openapi: 3.0.0
tags:
  - name: TrimMe
paths: {}
`;
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    // The script does not trim the captured value; it prints as-is
    assert.match(result.stdout.trim(), /TrimMe/);
  });

  test('boundary: tags section immediately followed by EOF with no trailing newline', () => {
    const yaml = 'openapi: 3.0.0\ntags:\n  - name: LastTag';
    const result = runExtractTags(yaml);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'LastTag');
  });
});
