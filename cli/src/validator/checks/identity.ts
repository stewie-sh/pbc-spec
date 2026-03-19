import type { PbcDocument } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

function getIdFromItem(item: unknown): string | undefined {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return String((item as Record<string, unknown>).id);
  }
  return undefined;
}

function getItems(block: { parsed: unknown }): unknown[] {
  if (Array.isArray(block.parsed)) return block.parsed;
  if (typeof block.parsed === 'object' && block.parsed !== null) return [block.parsed];
  return [];
}

export function checkIdentity(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;
  const seenIds = new Map<string, number>(); // id -> first line

  for (const block of doc.blocks) {
    // E007, E008: behavior blocks need id and name
    if (block.type === 'behavior') {
      const items = getItems(block);
      for (const item of items) {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          if (!obj.id) {
            results.push({
              checkId: 'E007',
              severity: 'error',
              message: '`pbc:behavior` block missing `id` field.',
              file,
              line: block.startLine,
              blockType: 'behavior',
            });
          }
          if (!obj.name) {
            results.push({
              checkId: 'E008',
              severity: 'error',
              message: '`pbc:behavior` block missing `name` field.',
              file,
              line: block.startLine,
              blockType: 'behavior',
            });
          }
        }
      }
    }

    // W004: rules entries need id
    if (block.type === 'rules') {
      const items = getItems(block);
      for (const item of items) {
        if (typeof item === 'object' && item !== null) {
          if (!getIdFromItem(item)) {
            results.push({
              checkId: 'W004',
              severity: 'warning',
              message: '`pbc:rules` entry missing `id` field.',
              file,
              line: block.startLine,
              blockType: 'rules',
            });
          }
        }
      }
    }

    // W005: states entries need id
    if (block.type === 'states') {
      const items = getItems(block);
      for (const item of items) {
        if (typeof item === 'object' && item !== null) {
          if (!getIdFromItem(item)) {
            results.push({
              checkId: 'W005',
              severity: 'warning',
              message: '`pbc:states` entry missing `id` field.',
              file,
              line: block.startLine,
              blockType: 'states',
            });
          }
        }
      }
    }

    // W006: actors entries need id
    if (block.type === 'actors') {
      const items = getItems(block);
      for (const item of items) {
        if (typeof item === 'object' && item !== null) {
          if (!getIdFromItem(item)) {
            results.push({
              checkId: 'W006',
              severity: 'warning',
              message: '`pbc:actors` entry missing `id` field.',
              file,
              line: block.startLine,
              blockType: 'actors',
            });
          }
        }
      }
    }

    // E006: collect all IDs for duplicate detection
    const items = getItems(block);
    for (const item of items) {
      const id = getIdFromItem(item);
      if (id) {
        if (seenIds.has(id)) {
          results.push({
            checkId: 'E006',
            severity: 'error',
            message: `Duplicate semantic ID "${id}" (first seen at line ${seenIds.get(id)}).`,
            file,
            line: block.startLine,
            blockType: block.type,
          });
        } else {
          seenIds.set(id, block.startLine);
        }
      }
    }
  }

  return results;
}
