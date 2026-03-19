import type { PbcDocument } from '../../parser/types.js';
import { VALID_CONFIDENCE_VALUES } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

export function checkProvenance(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  const hasBehaviors = doc.blocks.some(b => b.type === 'behavior');
  const hasProvenance = doc.blocks.some(b => b.type === 'provenance');

  for (const block of doc.blocks) {
    if (block.type !== 'provenance') continue;
    const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const item of items) {
      if (typeof item !== 'object' || item === null) continue;
      const obj = item as Record<string, unknown>;

      // E011: confidence must be valid
      if (!obj.confidence) {
        results.push({
          checkId: 'E011',
          severity: 'error',
          message: '`pbc:provenance` entry missing `confidence` field.',
          file,
          line: block.startLine,
          blockType: 'provenance',
        });
      } else if (!VALID_CONFIDENCE_VALUES.includes(obj.confidence as any)) {
        results.push({
          checkId: 'E011',
          severity: 'error',
          message: `\`pbc:provenance\` entry has invalid confidence value "${obj.confidence}" (must be ${VALID_CONFIDENCE_VALUES.join(', ')}).`,
          file,
          line: block.startLine,
          blockType: 'provenance',
        });
      }

      // W007: ref should exist
      if (!obj.ref) {
        results.push({
          checkId: 'W007',
          severity: 'warning',
          message: '`pbc:provenance` entry missing `ref` field.',
          file,
          line: block.startLine,
          blockType: 'provenance',
        });
      }
    }
  }

  // W010: behaviors without provenance
  if (hasBehaviors && !hasProvenance) {
    results.push({
      checkId: 'W010',
      severity: 'warning',
      message: 'File has behaviors but no `pbc:provenance` blocks.',
      file,
    });
  }

  return results;
}
