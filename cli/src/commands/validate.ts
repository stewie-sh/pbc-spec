import { parseFile } from '../parser/index.js';
import { validate } from '../validator/index.js';
import { resolveFiles } from '../utils/glob.js';
import { formatResults } from '../utils/output.js';
import type { CheckResult } from '../validator/types.js';

export interface ValidateOptions {
  format: 'text' | 'json';
}

export function runValidate(patterns: string[], options: ValidateOptions): number {
  const files = resolveFiles(patterns);

  if (files.length === 0) {
    console.error('No .pbc.md files found.');
    return 1;
  }

  const resultsByFile = new Map<string, CheckResult[]>();
  let hasErrors = false;

  for (const file of files) {
    try {
      const doc = parseFile(file);
      const results = validate(doc);
      resultsByFile.set(file, results);
      if (results.some(r => r.severity === 'error')) {
        hasErrors = true;
      }
    } catch (err) {
      resultsByFile.set(file, [
        {
          checkId: 'E000',
          severity: 'error',
          message: `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
          file,
        },
      ]);
      hasErrors = true;
    }
  }

  console.log(formatResults(resultsByFile, options.format));
  return hasErrors ? 1 : 0;
}
