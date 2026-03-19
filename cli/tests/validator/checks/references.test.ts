import { describe, it, expect } from 'vitest';
import { checkReferences } from '../../../src/validator/checks/references.js';
import type { PbcDocument, PbcBlock } from '../../../src/parser/types.js';

function makeDoc(blocks: PbcBlock[]): PbcDocument {
  return {
    filePath: 'test.pbc.md',
    frontmatter: { id: 'pbc-test', title: 'Test' },
    blocks,
    errors: [],
  };
}

function block(type: string, parsed: unknown): PbcBlock {
  return { type, rawContent: '', parsed, startLine: 1, endLine: 5 };
}

describe('checkReferences', () => {
  it('E009: detects transition to unknown state', () => {
    const doc = makeDoc([
      block('states', [
        { id: 'active', definition: 'Active.', user_access: 'full' },
        { id: 'inactive', definition: 'Inactive.', user_access: 'none' },
      ]),
      block('transitions', [
        { from: 'active', to: 'nonexistent', condition: 'Something.' },
      ]),
    ]);
    const results = checkReferences(doc);
    expect(results.some(r => r.checkId === 'E009')).toBe(true);
    expect(results[0].message).toContain('nonexistent');
  });

  it('E009: detects transition from unknown state', () => {
    const doc = makeDoc([
      block('states', [
        { id: 'active', definition: 'Active.', user_access: 'full' },
      ]),
      block('transitions', [
        { from: 'ghost', to: 'active', condition: 'Something.' },
      ]),
    ]);
    const results = checkReferences(doc);
    expect(results.some(r => r.checkId === 'E009')).toBe(true);
  });

  it('E010: detects behavior with unknown actor', () => {
    const doc = makeDoc([
      block('actors', [{ id: 'admin', name: 'Admin', type: 'human', description: 'Admin.' }]),
      block('behavior', { id: 'BHV-001', name: 'Test', actor: 'nonexistent_actor' }),
    ]);
    const results = checkReferences(doc);
    expect(results.some(r => r.checkId === 'E010')).toBe(true);
  });

  it('skips reference checks when no states block present', () => {
    const doc = makeDoc([
      block('transitions', [{ from: 'any', to: 'state', condition: 'No states defined.' }]),
    ]);
    const results = checkReferences(doc);
    expect(results.filter(r => r.checkId === 'E009')).toHaveLength(0);
  });

  it('skips actor checks when no actors block present', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Test', actor: 'any_actor' }),
    ]);
    const results = checkReferences(doc);
    expect(results.filter(r => r.checkId === 'E010')).toHaveLength(0);
  });

  it('passes with valid references', () => {
    const doc = makeDoc([
      block('states', [
        { id: 'active', definition: 'Active.', user_access: 'full' },
        { id: 'inactive', definition: 'Inactive.', user_access: 'none' },
      ]),
      block('actors', [{ id: 'admin', name: 'Admin', type: 'human', description: 'Admin.' }]),
      block('transitions', [{ from: 'active', to: 'inactive', condition: 'Something.' }]),
      block('behavior', { id: 'BHV-001', name: 'Test', actor: 'admin' }),
    ]);
    const results = checkReferences(doc);
    expect(results).toHaveLength(0);
  });
});
