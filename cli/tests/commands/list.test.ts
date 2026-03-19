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

  it('lists correct behavior count from billing example', () => {
    runList([resolve(EXAMPLES_DIR, 'billing.pbc.md')], { type: 'behavior', format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.filter((e: any) => e.blockType === 'behavior')).toHaveLength(4);
  });
});
