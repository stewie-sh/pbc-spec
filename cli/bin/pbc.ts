#!/usr/bin/env node

import { Command } from 'commander';
import { runValidate } from '../src/commands/validate.js';
import { runList } from '../src/commands/list.js';
import { runStats } from '../src/commands/stats.js';
import { runInit } from '../src/commands/init.js';

const program = new Command();

program
  .name('pbc')
  .description('CLI tooling for Product Behavior Contract (PBC) files')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate PBC files for structural correctness')
  .argument('[patterns...]', 'files, globs, or directories to validate', ['.'])
  .option('--format <format>', 'output format (text, json)', 'text')
  .action((patterns: string[], opts: { format: string }) => {
    const code = runValidate(
      patterns.length > 0 ? patterns : ['.'],
      { format: opts.format as 'text' | 'json' },
    );
    process.exit(code);
  });

program
  .command('list')
  .description('List contract units from PBC files')
  .argument('[patterns...]', 'files, globs, or directories to scan', ['.'])
  .option('--type <type>', 'filter by block type (behavior, states, actors, rules, glossary, config, workflow, all)', 'all')
  .option('--format <format>', 'output format (text, json)', 'text')
  .action((patterns: string[], opts: { type: string; format: string }) => {
    const code = runList(
      patterns.length > 0 ? patterns : ['.'],
      { type: opts.type as any, format: opts.format as 'text' | 'json' },
    );
    process.exit(code);
  });

program
  .command('stats')
  .description('Show statistics for PBC files')
  .argument('[patterns...]', 'files, globs, or directories to scan', ['.'])
  .option('--format <format>', 'output format (text, json)', 'text')
  .action((patterns: string[], opts: { format: string }) => {
    const code = runStats(
      patterns.length > 0 ? patterns : ['.'],
      { format: opts.format as 'text' | 'json' },
    );
    process.exit(code);
  });

program
  .command('init')
  .description('Scaffold a new PBC file')
  .argument('[filename]', 'output filename (default: new-feature.pbc.md)')
  .action((filename: string | undefined) => {
    const code = runInit(filename);
    process.exit(code);
  });

program.parse();
