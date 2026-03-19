import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { runValidate } from '../../src/commands/validate.js';

const EXAMPLES_DIR = resolve(__dirname, '../../../examples');
const FIXTURES_DIR = resolve(__dirname, '../fixtures/invalid');

describe('runValidate command', () => {
  let consoleOutput: string[];

  beforeEach(() => {
    consoleOutput = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleOutput.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleOutput.push(args.join(' '));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 for valid example files', () => {
    const code = runValidate([EXAMPLES_DIR], { format: 'text' });
    expect(code).toBe(0);
  });

  it('returns 1 for files with errors', () => {
    const code = runValidate([resolve(FIXTURES_DIR, 'missing-frontmatter.pbc.md')], { format: 'text' });
    expect(code).toBe(1);
  });

  it('produces valid JSON in json format', () => {
    runValidate([EXAMPLES_DIR], { format: 'json' });
    const output = consoleOutput.join('\n');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('returns 1 when no files found', () => {
    const code = runValidate(['/nonexistent/path/*.pbc.md'], { format: 'text' });
    expect(code).toBe(1);
  });
});
