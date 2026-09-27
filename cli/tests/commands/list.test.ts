import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { runList } from '../../src/commands/list.js';

const EXAMPLES_DIR = resolve(__dirname, '../../../examples');

describe('runList command', () => {
  let consoleOutput: string[];

  beforeEach(() => {
    consoleOutput = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleOutput.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists all contract units', () => {
    const code = runList([EXAMPLES_DIR], { type: 'all', format: 'text' });
    expect(code).toBe(0);
    const output = consoleOutput.join('\n');
    expect(output).toContain('BIL-BHV-001');
    expect(output).toContain('WRK-BHV-001');
    expect(output).toContain('AUT-BHV-001');
  });

  it('filters by type', () => {
    const code = runList([EXAMPLES_DIR], { type: 'behavior', format: 'text' });
    expect(code).toBe(0);
    const output = consoleOutput.join('\n');
    expect(output).toContain('BIL-BHV-001');
    expect(output).not.toContain('BIL-RUL-001');
  });

  it('produces valid JSON', () => {
    runList([EXAMPLES_DIR], { type: 'all', format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('preserves rejection metadata for rules and behaviors in JSON', () => {
    runList([resolve(__dirname, '../fixtures/valid/rejected.pbc.md')], { type: 'all', format: 'json' });
    const entries = JSON.parse(consoleOutput.join('\n'));
    expect(entries.filter((entry: { trust?: string }) => entry.trust === 'rejected')).toEqual([
      expect.objectContaining({ id: 'TEST-RUL-001', rejected_reason: 'Valid requests must remain possible.', rejected_ref: 'decisions.md#gate-review' }),
      expect.objectContaining({ id: 'TEST-BHV-001', rejected_reason: 'The unconditional stop was overruled.', rejected_ref: 'decisions.md#gate-review' }),
    ]);
    expect(entries.find((entry: { id: string }) => entry.id === 'TEST-RUL-002').trust).toBe('trusted');
  });

  it('distinguishes retained decisions from active obligations in text', () => {
    runList([resolve(__dirname, '../fixtures/valid/rejected.pbc.md')], { type: 'all', format: 'text' });
    const output = consoleOutput.join('\n');
    expect(output).toContain('Trust');
    expect(output).toContain('Rejected — not an active obligation.');
    expect(output).toContain('Valid requests must remain possible.');
    expect(output).toContain('The unconditional stop was overruled.');
    expect(output).toContain('decisions.md#gate-review');
  });

  it('lists correct behavior count from billing example', () => {
    runList([resolve(EXAMPLES_DIR, 'billing.pbc.md')], { type: 'behavior', format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.filter((e: any) => e.blockType === 'behavior')).toHaveLength(4);
  });
});
