import type { PbcDocument } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

function maxDepth(obj: unknown, current: number = 0): number {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return current;
  }
  let max = current;
  for (const value of Object.values(obj)) {
    const d = maxDepth(value, current + 1);
    if (d > max) max = d;
  }
  return max;
}

export function checkConfig(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  for (const block of doc.blocks) {
    if (block.type !== 'config') continue;

    const depth = maxDepth(block.parsed);
    if (depth > 4) {
      results.push({
        checkId: 'W009',
        severity: 'warning',
        message: `\`pbc:config\` nesting depth is ${depth} (recommended max 4).`,
        file,
        line: block.startLine,
        blockType: 'config',
      });
    }
  }

  return results;
}
