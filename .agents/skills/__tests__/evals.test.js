'use strict';

/**
 * Tests for all evals.json files added in this PR.
 *
 * Validates that each file:
 *   1. Parses as valid JSON
 *   2. Has the required top-level structure (skill_name, evals array)
 *   3. Has sequential, unique, non-zero integer IDs
 *   4. Each eval entry has a non-empty prompt, expected_output, and scaffold
 *   5. Each eval entry has a non-empty array of evaluation criteria
 *      (the field is named "expectations" in most files, "assertions" in
 *       clerk-billing; we accept either)
 *   6. No required string fields are empty
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_DIR = path.join(__dirname, '..');

const EVALS_FILES = [
  {
    label: 'clerk-astro-patterns',
    filePath: path.join(SKILLS_DIR, 'clerk-astro-patterns', 'evals', 'evals.json'),
    expectedSkillName: 'clerk-astro-patterns',
    criteriaKey: 'expectations',
  },
  {
    label: 'clerk-backend-api',
    filePath: path.join(SKILLS_DIR, 'clerk-backend-api', 'evals', 'evals.json'),
    expectedSkillName: 'clerk-backend-api',
    criteriaKey: 'expectations',
  },
  {
    label: 'clerk-billing',
    filePath: path.join(SKILLS_DIR, 'clerk-billing', 'evals', 'evals.json'),
    expectedSkillName: 'clerk-billing',
    criteriaKey: 'assertions',
  },
];

for (const { label, filePath, expectedSkillName, criteriaKey } of EVALS_FILES) {
  describe(`evals.json — ${label}`, () => {
    let parsed;

    // Parse once so individual tests can reference the parsed object
    test('file exists and parses as valid JSON', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw); // throws if invalid JSON
      assert.ok(parsed, 'parsed value must be truthy');
    });

    test('has a "skill_name" string field', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      assert.equal(typeof parsed.skill_name, 'string');
      assert.ok(parsed.skill_name.length > 0, 'skill_name must be non-empty');
    });

    test(`skill_name matches expected value "${expectedSkillName}"`, () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      assert.equal(parsed.skill_name, expectedSkillName);
    });

    test('has an "evals" array', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      assert.ok(Array.isArray(parsed.evals), '"evals" must be an array');
      assert.ok(parsed.evals.length > 0, '"evals" must have at least one entry');
    });

    test('eval IDs are sequential integers starting at 1', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, index) => {
        assert.equal(typeof ev.id, 'number', `eval[${index}].id must be a number`);
        assert.equal(ev.id, index + 1, `eval[${index}].id must be ${index + 1}, got ${ev.id}`);
      });
    });

    test('eval IDs are unique', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      const ids = parsed.evals.map((ev) => ev.id);
      const uniqueIds = new Set(ids);
      assert.equal(uniqueIds.size, ids.length, 'eval IDs must be unique');
    });

    test('each eval has a non-empty "prompt" string', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, index) => {
        assert.equal(typeof ev.prompt, 'string', `eval[${index}].prompt must be a string`);
        assert.ok(ev.prompt.trim().length > 0, `eval[${index}].prompt must not be empty`);
      });
    });

    test('each eval has a non-empty "expected_output" string', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, index) => {
        assert.equal(typeof ev.expected_output, 'string', `eval[${index}].expected_output must be a string`);
        assert.ok(ev.expected_output.trim().length > 0, `eval[${index}].expected_output must not be empty`);
      });
    });

    test('each eval has a non-empty "scaffold" string', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, index) => {
        assert.equal(typeof ev.scaffold, 'string', `eval[${index}].scaffold must be a string`);
        assert.ok(ev.scaffold.trim().length > 0, `eval[${index}].scaffold must not be empty`);
      });
    });

    test(`each eval has a non-empty "${criteriaKey}" array`, () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, index) => {
        const criteria = ev[criteriaKey];
        assert.ok(
          Array.isArray(criteria),
          `eval[${index}].${criteriaKey} must be an array`
        );
        assert.ok(
          criteria.length > 0,
          `eval[${index}].${criteriaKey} must have at least one item`
        );
      });
    });

    test(`each "${criteriaKey}" entry is a non-empty string`, () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      parsed.evals.forEach((ev, evalIndex) => {
        const criteria = ev[criteriaKey] ?? [];
        criteria.forEach((item, itemIndex) => {
          assert.equal(
            typeof item,
            'string',
            `eval[${evalIndex}].${criteriaKey}[${itemIndex}] must be a string`
          );
          assert.ok(
            item.trim().length > 0,
            `eval[${evalIndex}].${criteriaKey}[${itemIndex}] must not be empty`
          );
        });
      });
    });

    test('no top-level unknown fields other than the expected ones', () => {
      const raw = fs.readFileSync(filePath, 'utf8');
      parsed = JSON.parse(raw);
      const allowedKeys = new Set(['skill_name', 'evals']);
      const actualKeys = Object.keys(parsed);
      for (const key of actualKeys) {
        assert.ok(allowedKeys.has(key), `Unexpected top-level key: "${key}"`);
      }
    });
  });
}

// Cross-file structural consistency checks
describe('evals.json — cross-file consistency', () => {
  test('all evals files exist on disk', () => {
    for (const { filePath, label } of EVALS_FILES) {
      assert.ok(fs.existsSync(filePath), `${label} evals.json not found at ${filePath}`);
    }
  });

  test('clerk-astro-patterns has exactly 7 evals', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-astro-patterns', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    assert.equal(parsed.evals.length, 7);
  });

  test('clerk-backend-api has exactly 6 evals', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-backend-api', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    assert.equal(parsed.evals.length, 6);
  });

  test('clerk-billing has exactly 12 evals', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-billing', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    assert.equal(parsed.evals.length, 12);
  });

  test('all clerk-astro-patterns evals use the astro-basic-auth scaffold', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-astro-patterns', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    for (const ev of parsed.evals) {
      assert.equal(ev.scaffold, 'astro-basic-auth', `eval ${ev.id} uses wrong scaffold`);
    }
  });

  test('all clerk-backend-api evals use the nextjs-basic-auth scaffold', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-backend-api', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    for (const ev of parsed.evals) {
      assert.equal(ev.scaffold, 'nextjs-basic-auth', `eval ${ev.id} uses wrong scaffold`);
    }
  });

  test('all clerk-billing evals use the nextjs-basic-auth scaffold', () => {
    const raw = fs.readFileSync(
      path.join(SKILLS_DIR, 'clerk-billing', 'evals', 'evals.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw);
    for (const ev of parsed.evals) {
      assert.equal(ev.scaffold, 'nextjs-basic-auth', `eval ${ev.id} uses wrong scaffold`);
    }
  });
});