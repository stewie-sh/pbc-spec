import { describe, it, expect } from 'vitest';
import { checkProvenance } from '../../../src/validator/checks/provenance.js';
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

describe('checkProvenance', () => {
  it('E011: reports missing confidence', () => {
    const doc = makeDoc([
      block('provenance', [{ kind: 'code', ref: 'file.ts', detail: 'Something.' }]),
    ]);
    const results = checkProvenance(doc);
    expect(results.some(r => r.checkId === 'E011')).toBe(true);
  });

  it('E011: reports invalid confidence value', () => {
    const doc = makeDoc([
      block('provenance', [{ kind: 'code', ref: 'file.ts', confidence: 'maybe', detail: 'Something.' }]),
    ]);
    const results = checkProvenance(doc);
    expect(results.some(r => r.checkId === 'E011')).toBe(true);
    expect(results[0].message).toContain('maybe');
  });

  it('W007: warns on missing ref', () => {
    const doc = makeDoc([
      block('provenance', [{ kind: 'code', confidence: 'verified', detail: 'Something.' }]),
    ]);
    const results = checkProvenance(doc);
    expect(results.some(r => r.checkId === 'W007')).toBe(true);
  });

  it('W010: warns when behaviors exist but no provenance', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Test', actor: 'someone' }),
    ]);
    const results = checkProvenance(doc);
    expect(results.some(r => r.checkId === 'W010')).toBe(true);
  });

  it('passes with valid provenance', () => {
    const doc = makeDoc([
      block('behavior', { id: 'BHV-001', name: 'Test', actor: 'someone' }),
      block('provenance', [{ kind: 'code', ref: 'src/file.ts', confidence: 'verified', detail: 'Covers behavior.' }]),
    ]);
    const results = checkProvenance(doc);
    expect(results).toHaveLength(0);
  });
});
