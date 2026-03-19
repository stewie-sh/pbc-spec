import { describe, it, expect } from 'vitest';
import { checkFrontmatter } from '../../../src/validator/checks/frontmatter.js';
import type { PbcDocument } from '../../../src/parser/types.js';

function makeDoc(overrides: Partial<PbcDocument> = {}): PbcDocument {
  return {
    filePath: 'test.pbc.md',
    frontmatter: { id: 'pbc-test', title: 'Test', status: 'draft', updated: '2026-01-01' },
    blocks: [],
    errors: [],
    ...overrides,
  };
}

describe('checkFrontmatter', () => {
  it('returns no issues for valid frontmatter', () => {
    const results = checkFrontmatter(makeDoc());
    expect(results).toHaveLength(0);
  });

  it('E001: reports missing frontmatter', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: null }));
    expect(results).toHaveLength(1);
    expect(results[0].checkId).toBe('E001');
    expect(results[0].severity).toBe('error');
  });

  it('E002: reports missing id', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: { title: 'Test', status: 'draft' } }));
    expect(results.some(r => r.checkId === 'E002')).toBe(true);
  });

  it('E003: reports missing title', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: { id: 'pbc-test', status: 'draft' } }));
    expect(results.some(r => r.checkId === 'E003')).toBe(true);
  });

  it('W001: warns on missing status', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: { id: 'pbc-test', title: 'Test', updated: '2026-01-01' } }));
    expect(results.some(r => r.checkId === 'W001')).toBe(true);
  });

  it('W002: warns on missing updated', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: { id: 'pbc-test', title: 'Test', status: 'draft' } }));
    expect(results.some(r => r.checkId === 'W002')).toBe(true);
  });

  it('W011: warns on non-standard status', () => {
    const results = checkFrontmatter(makeDoc({ frontmatter: { id: 'pbc-test', title: 'Test', status: 'wip', updated: '2026-01-01' } }));
    expect(results.some(r => r.checkId === 'W011')).toBe(true);
  });
});
