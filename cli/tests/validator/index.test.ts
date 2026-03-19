import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { parseFile } from '../../src/parser/index.js';
import { validate } from '../../src/validator/index.js';

const EXAMPLES_DIR = resolve(__dirname, '../../../examples');
const FIXTURES_DIR = resolve(__dirname, '../fixtures/invalid');

describe('validate integration', () => {
  describe('example files pass cleanly (no errors)', () => {
    const exampleFiles = [
      'billing.pbc.md',
      'workspaces-roles.pbc.md',
      'auth-signin-session-access.pbc.md',
    ];

    for (const file of exampleFiles) {
      it(`${file} has no errors`, () => {
        const doc = parseFile(resolve(EXAMPLES_DIR, file));
        const results = validate(doc);
        const errors = results.filter(r => r.severity === 'error');
        expect(errors).toHaveLength(0);
      });
    }
  });

  describe('invalid fixtures produce expected errors', () => {
    it('missing-frontmatter.pbc.md triggers E001', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'missing-frontmatter.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E001')).toBe(true);
    });

    it('missing-id.pbc.md triggers E002', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'missing-id.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E002')).toBe(true);
    });

    it('bad-yaml-block.pbc.md triggers E005', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'bad-yaml-block.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E005')).toBe(true);
    });

    it('duplicate-ids.pbc.md triggers E006', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'duplicate-ids.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E006')).toBe(true);
    });

    it('unknown-block-type.pbc.md triggers E004', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'unknown-block-type.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E004')).toBe(true);
    });

    it('broken-references.pbc.md triggers E009 and E010', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'broken-references.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E009')).toBe(true);
      expect(results.some(r => r.checkId === 'E010')).toBe(true);
    });

    it('missing-behavior-fields.pbc.md triggers E007 and E008', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'missing-behavior-fields.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E007')).toBe(true);
      expect(results.some(r => r.checkId === 'E008')).toBe(true);
    });

    it('bad-provenance.pbc.md triggers E011', () => {
      const doc = parseFile(resolve(FIXTURES_DIR, 'bad-provenance.pbc.md'));
      const results = validate(doc);
      expect(results.some(r => r.checkId === 'E011')).toBe(true);
    });
  });
});
