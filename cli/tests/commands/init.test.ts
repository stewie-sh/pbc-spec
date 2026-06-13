import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInit } from '../../src/commands/init.js';

describe('runInit command', () => {
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

  it('creates a file with the default template', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pbc-init-'));
    const filePath = join(dir, 'my-feature.pbc.md');

    const code = runInit(filePath);
    expect(code).toBe(0);

    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('status: draft');
    expect(content).toContain('```pbc:actors');
  });

  it('creates a file with the requested template', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pbc-init-'));
    const filePath = join(dir, 'flags.pbc.md');

    const code = runInit(filePath, { template: 'feature-flag' });
    expect(code).toBe(0);

    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('```pbc:config');
    expect(content).toContain('domain: feature_flags');
  });

  it('fails for unknown templates', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pbc-init-'));
    const filePath = join(dir, 'x.pbc.md');

    const code = runInit(filePath, { template: 'nope' });
    expect(code).toBe(1);
    expect(consoleOutput.join('\n')).toContain('Unknown template');
  });
});
