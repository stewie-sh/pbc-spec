import chalk from 'chalk';
import type { CheckResult } from '../validator/types.js';
import { relative } from 'node:path';

export function formatResults(
  resultsByFile: Map<string, CheckResult[]>,
  format: 'text' | 'json',
): string {
  if (format === 'json') {
    const obj: Record<string, CheckResult[]> = {};
    for (const [file, results] of resultsByFile) {
      obj[file] = results;
    }
    return JSON.stringify(obj, null, 2);
  }

  const lines: string[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [file, results] of resultsByFile) {
    const relPath = relative(process.cwd(), file);
    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (results.length === 0) {
      lines.push(`${chalk.green('\u2713')} ${chalk.dim(relPath)}`);
      continue;
    }

    lines.push(`${chalk.white(relPath)}`);
    for (const r of results) {
      const icon = r.severity === 'error' ? chalk.red('\u2717') : chalk.yellow('\u26a0');
      const loc = r.line ? chalk.dim(`:${r.line}`) : '';
      const id = chalk.dim(`[${r.checkId}]`);
      lines.push(`  ${icon} ${id} ${r.message}${loc}`);
    }
    lines.push('');
  }

  const summary: string[] = [];
  if (totalErrors > 0) summary.push(chalk.red(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`));
  if (totalWarnings > 0) summary.push(chalk.yellow(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`));
  if (totalErrors === 0 && totalWarnings === 0) {
    summary.push(chalk.green('All files passed validation.'));
  }
  lines.push(summary.join(', '));

  return lines.join('\n');
}

export function formatTable(rows: string[][], headers: string[]): string {
  const colWidths = headers.map((h, i) => {
    const maxData = rows.reduce((max, row) => Math.max(max, (row[i] || '').length), 0);
    return Math.max(h.length, maxData);
  });

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
  const separator = colWidths.map(w => '-'.repeat(w)).join('  ');

  const dataLines = rows.map(row =>
    row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join('  '),
  );

  return [headerLine, separator, ...dataLines].join('\n');
}
