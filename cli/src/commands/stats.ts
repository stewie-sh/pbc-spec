import { parseFile } from '../parser/index.js';
import { resolveFiles } from '../utils/glob.js';
import chalk from 'chalk';

export interface StatsOptions {
  format: 'text' | 'json';
}

interface Stats {
  filesScanned: number;
  totalBlocks: number;
  byBlockType: Record<string, number>;
  byStatus: Record<string, number>;
  filesWithProvenance: number;
  behaviorsWithIds: number;
  totalBehaviors: number;
  totalStates: number;
  totalActors: number;
  totalRules: number;
  totalGlossaryTerms: number;
}

function countItems(parsed: unknown): number {
  if (Array.isArray(parsed)) return parsed.length;
  if (typeof parsed === 'object' && parsed !== null) return 1;
  return 0;
}

export function runStats(patterns: string[], options: StatsOptions): number {
  const files = resolveFiles(patterns);

  if (files.length === 0) {
    console.error('No .pbc.md files found.');
    return 1;
  }

  const stats: Stats = {
    filesScanned: 0,
    totalBlocks: 0,
    byBlockType: {},
    byStatus: {},
    filesWithProvenance: 0,
    behaviorsWithIds: 0,
    totalBehaviors: 0,
    totalStates: 0,
    totalActors: 0,
    totalRules: 0,
    totalGlossaryTerms: 0,
  };

  for (const file of files) {
    try {
      const doc = parseFile(file);
      stats.filesScanned++;

      const status = doc.frontmatter?.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      let fileHasProvenance = false;

      for (const block of doc.blocks) {
        stats.totalBlocks++;
        stats.byBlockType[block.type] = (stats.byBlockType[block.type] || 0) + 1;

        if (block.type === 'provenance') fileHasProvenance = true;

        if (block.type === 'behavior') {
          const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
          for (const item of items) {
            if (typeof item === 'object' && item !== null) {
              stats.totalBehaviors++;
              if ((item as Record<string, unknown>).id) stats.behaviorsWithIds++;
            }
          }
        }

        if (block.type === 'states') stats.totalStates += countItems(block.parsed);
        if (block.type === 'actors') stats.totalActors += countItems(block.parsed);
        if (block.type === 'rules') stats.totalRules += countItems(block.parsed);
        if (block.type === 'glossary') stats.totalGlossaryTerms += countItems(block.parsed);
      }

      if (fileHasProvenance) stats.filesWithProvenance++;
    } catch (err) {
      console.error(`Error reading ${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (options.format === 'json') {
    console.log(JSON.stringify(stats, null, 2));
    return 0;
  }

  const lines: string[] = [];
  lines.push(chalk.bold('PBC Statistics'));
  lines.push('');
  lines.push(`  Files scanned:      ${stats.filesScanned}`);
  lines.push(`  Total blocks:       ${stats.totalBlocks}`);
  lines.push('');
  lines.push(chalk.bold('  By block type:'));
  const sortedTypes = Object.entries(stats.byBlockType).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    lines.push(`    ${type.padEnd(20)} ${count}`);
  }
  lines.push('');
  lines.push(chalk.bold('  By status:'));
  for (const [status, count] of Object.entries(stats.byStatus)) {
    lines.push(`    ${status.padEnd(20)} ${count}`);
  }
  lines.push('');
  lines.push(chalk.bold('  Contract units:'));
  lines.push(`    Behaviors:        ${stats.totalBehaviors} (${stats.behaviorsWithIds} with IDs)`);
  lines.push(`    States:           ${stats.totalStates}`);
  lines.push(`    Actors:           ${stats.totalActors}`);
  lines.push(`    Rules:            ${stats.totalRules}`);
  lines.push(`    Glossary terms:   ${stats.totalGlossaryTerms}`);
  lines.push('');
  lines.push(chalk.bold('  Coverage:'));
  lines.push(`    Files with provenance:  ${stats.filesWithProvenance} / ${stats.filesScanned}`);

  console.log(lines.join('\n'));
  return 0;
}
