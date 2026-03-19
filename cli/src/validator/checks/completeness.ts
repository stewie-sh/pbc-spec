import type { PbcDocument } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

const BEHAVIOR_COMPANION_TYPES = new Set(['preconditions', 'trigger', 'outcomes']);

export function checkCompleteness(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  // Associate companion blocks with their preceding behavior block
  // Walk blocks in document order; track behaviors and whether they have companions
  const behaviors: Array<{ id: string; name: string; line: number; hasCompanion: boolean }> = [];

  for (const block of doc.blocks) {
    if (block.type === 'behavior') {
      const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
      for (const item of items) {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          behaviors.push({
            id: String(obj.id ?? ''),
            name: String(obj.name ?? ''),
            line: block.startLine,
            hasCompanion: false,
          });
        }
      }
    } else if (BEHAVIOR_COMPANION_TYPES.has(block.type)) {
      // Mark the most recent behavior as having a companion
      if (behaviors.length > 0) {
        behaviors[behaviors.length - 1].hasCompanion = true;
      }
    }
  }

  for (const bhv of behaviors) {
    if (!bhv.hasCompanion) {
      results.push({
        checkId: 'W008',
        severity: 'warning',
        message: `Behavior "${bhv.id || bhv.name}" has no associated preconditions, trigger, or outcomes blocks.`,
        file,
        line: bhv.line,
        blockType: 'behavior',
      });
    }
  }

  return results;
}
