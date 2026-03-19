import type { PbcDocument } from '../../parser/types.js';
import { KNOWN_BLOCK_TYPES } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

export function checkBlockSyntax(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  if (doc.blocks.length === 0) {
    results.push({
      checkId: 'W003',
      severity: 'warning',
      message: 'No structured `pbc:*` blocks found in file.',
      file,
    });
  }

  for (const block of doc.blocks) {
    if (!KNOWN_BLOCK_TYPES.includes(block.type as any)) {
      results.push({
        checkId: 'E004',
        severity: 'error',
        message: `Unrecognized block type \`pbc:${block.type}\`.`,
        file,
        line: block.startLine,
        blockType: block.type,
      });
    }
  }

  // E005: YAML parse failures are already captured in doc.errors during parsing
  // We promote them to check results here
  for (const err of doc.errors) {
    if (err.message.includes('YAML parse error')) {
      results.push({
        checkId: 'E005',
        severity: 'error',
        message: err.message,
        file,
        line: err.line,
      });
    }
  }

  return results;
}
