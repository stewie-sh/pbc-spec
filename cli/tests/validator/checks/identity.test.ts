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
  describe.each(['behavior', 'rules'])('rejection checks for %s', blockType => {
    const base = { id: 'REJ-001', name: 'Old gate', rule: 'Must hold.', trust: 'rejected' };

    it.each(['object', 'list'])('accepts a rejected %s with a reason', shape => {
      const entry = { ...base, rejected_reason: 'The gate excludes valid requests.' };
      const parsed = shape === 'list' ? [entry] : entry;
      expect(checkIdentity(makeDoc([block(blockType, parsed)]))).toEqual([]);
    });

    it.each([undefined, null, '', ' \n\t ', false, 0, [], {}])('W014: warns for invalid reason %j', reason => {
      const entry = { ...base, rejected_reason: reason };
      const results = checkIdentity(makeDoc([block(blockType, [entry])]));
      expect(results).toEqual([expect.objectContaining({
        checkId: 'W014', severity: 'warning', file: 'test.pbc.md', line: 1, blockType,
      })]);
      expect(results[0].message).toContain('REJ-001');
      expect(results[0].message).toContain('rejected_reason');
    });

    it.each(['trusted', 'provisional', 'scaffolding', undefined])('does not require a rejection reason for %s', trust => {
      expect(checkIdentity(makeDoc([block(blockType, { ...base, trust })]))).toEqual([]);
    });

    it('checks each rejected entry, not just the first', () => {
      const results = checkIdentity(makeDoc([block(blockType, [
        { ...base, id: 'REJ-001', rejected_reason: 'Not applicable.' },
        { ...base, id: 'REJ-002' },
      ])]));
      expect(results).toHaveLength(1);
      expect(results[0].checkId).toBe('W014');
      expect(results[0].message).toContain('REJ-002');
    });
  });

  it('keeps rejected IDs reserved for duplicate detection', () => {
    const results = checkIdentity(makeDoc([block('rules', [
      { id: 'RUL-001', trust: 'rejected', rejected_reason: 'Overruled.' },
      { id: 'RUL-001', trust: 'trusted' },
    ])]));
    expect(results.some(result => result.checkId === 'E006')).toBe(true);
  });

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

  it('E007 and E008: reject scalar behavior content', () => {
    const doc = makeDoc([
      block('behavior', 'not a behavior object'),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'E007')).toBe(true);
    expect(results.some(r => r.checkId === 'E008')).toBe(true);
  });

  it('E007 and E008: reject an empty behavior list', () => {
    const doc = makeDoc([
      block('behavior', []),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'E007')).toBe(true);
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
      block('behavior', { id: 'BHV-001', name: 'Do thing', actor: 'user', trust: 'trusted' }),
      block('rules', [{ id: 'RUL-001', name: 'Rule', rule: 'Must hold.', trust: 'provisional' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results).toHaveLength(0);
  });

  it('W013: reports behavior with invalid trust level', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Do thing', actor: 'someone', trust: 'unknown_trust' }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W013' && r.severity === 'warning')).toBe(true);
  });

  it('W013: reports rule with invalid trust level', () => {
    const doc = makeDoc([
      block('rules', [{ id: 'RUL-001', name: 'Rule', rule: 'Must hold.', trust: 'invalid_trust' }]),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W013' && r.severity === 'warning')).toBe(true);
  });

  it('W013: flags falsy-but-invalid trust values (false, not skipped)', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Do thing', actor: 'someone', trust: false }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W013')).toBe(true);
  });

  it('W013: does not flag a valid trust level', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Do thing', actor: 'someone', trust: 'provisional' }),
    ]);
    const results = checkIdentity(doc);
    expect(results.some(r => r.checkId === 'W013')).toBe(false);
  });
});
