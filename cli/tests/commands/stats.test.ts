import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { runStats } from '../../src/commands/stats.js';

const EXAMPLES_DIR = resolve(__dirname, '../../../examples');

describe('runStats command', () => {
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

  it('returns 0 for valid files', () => {
    const code = runStats([EXAMPLES_DIR], { format: 'text' });
    expect(code).toBe(0);
  });

  it('reports correct file count', () => {
    runStats([EXAMPLES_DIR], { format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.filesScanned).toBe(3);
  });

  it('reports correct behavior count', () => {
    runStats([EXAMPLES_DIR], { format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.totalBehaviors).toBe(9);
    expect(parsed.behaviorsWithIds).toBe(9);
  });

  it('reports all statuses as draft', () => {
    runStats([EXAMPLES_DIR], { format: 'json' });
    const output = consoleOutput.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.byStatus.draft).toBe(3);
  });
});
