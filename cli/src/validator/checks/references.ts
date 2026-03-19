import type { PbcDocument } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

function collectIds(doc: PbcDocument, blockType: string): Set<string> {
  const ids = new Set<string>();
  for (const block of doc.blocks) {
    if (block.type !== blockType) continue;
    const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
    for (const item of items) {
      if (typeof item === 'object' && item !== null && 'id' in item) {
        ids.add(String((item as Record<string, unknown>).id));
      }
    }
  }
  return ids;
}

export function checkReferences(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  const stateIds = collectIds(doc, 'states');
  const actorIds = collectIds(doc, 'actors');

  const hasStates = doc.blocks.some(b => b.type === 'states');
  const hasActors = doc.blocks.some(b => b.type === 'actors');

  // E009: transitions reference known states (only if states block exists)
  if (hasStates) {
    for (const block of doc.blocks) {
      if (block.type !== 'transitions') continue;
      const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
      for (const item of items) {
        if (typeof item !== 'object' || item === null) continue;
        const obj = item as Record<string, unknown>;
        if (obj.from && !stateIds.has(String(obj.from))) {
          results.push({
            checkId: 'E009',
            severity: 'error',
            message: `Transition references unknown state "${obj.from}" in \`from\` field.`,
            file,
            line: block.startLine,
            blockType: 'transitions',
          });
        }
        if (obj.to && !stateIds.has(String(obj.to))) {
          results.push({
            checkId: 'E009',
            severity: 'error',
            message: `Transition references unknown state "${obj.to}" in \`to\` field.`,
            file,
            line: block.startLine,
            blockType: 'transitions',
          });
        }
      }
    }
  }

  // E010: behavior references known actor (only if actors block exists)
  if (hasActors) {
    for (const block of doc.blocks) {
      if (block.type !== 'behavior') continue;
      const items = Array.isArray(block.parsed) ? block.parsed : [block.parsed];
      for (const item of items) {
        if (typeof item !== 'object' || item === null) continue;
        const obj = item as Record<string, unknown>;
        if (obj.actor && !actorIds.has(String(obj.actor))) {
          results.push({
            checkId: 'E010',
            severity: 'error',
            message: `Behavior references unknown actor "${obj.actor}".`,
            file,
            line: block.startLine,
            blockType: 'behavior',
          });
        }
      }
    }
  }

  return results;
}
