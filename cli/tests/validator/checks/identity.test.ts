import { describe, it, expect } from 'vitest';
import { checkIdentity } from '../../../src/validator/checks/identity.js';
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

describe('checkIdentity', () => {
  it('E006: detects duplicate IDs', () => {
    const doc = makeDoc([
      block('actors', [{ id: 'user_one', name: 'User One', type: 'human', description: 'First.' }]),
      block('behavior', { id: 'user_one', name: 'Duplicate ID', actor: 'user_one' }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'E006')).toBe(true);
  });

  it('E007: reports behavior missing id', () => {
    const doc = makeDoc([
      block('behavior', { name: 'No ID behavior', actor: 'someone' }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'E007')).toBe(true);
  });

  it('E008: reports behavior missing name', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', actor: 'someone' }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'E008')).toBe(true);
  });

  it('W004: warns on rules entry without id', () => {
    const doc = makeDoc([
      block('rules', [{ name: 'No ID Rule', rule: 'Something.' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W004')).toBe(true);
  });

  it('W005: warns on states entry without id', () => {
    const doc = makeDoc([
      block('states', [{ definition: 'Some state.', user_access: 'full' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W005')).toBe(true);
  });

  it('W006: warns on actors entry without id', () => {
    const doc = makeDoc([
      block('actors', [{ name: 'No ID Actor', type: 'human', description: 'Missing ID.' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W006')).toBe(true);
  });

  it('passes clean document', () => {
    const doc = makeDoc([
      block('actors', [{ id: 'user', name: 'User', type: 'human', description: 'A user.' }]),
      block('behavior', { id: 'BHV-001', name: 'Do thing', actor: 'user' }),
      block('rules', [{ id: 'RUL-001', name: 'Rule', rule: 'Must hold.' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results).toHaveLength(0);
  });
});
