import { parseFile } from '../parser/index.js';
import { resolveFiles } from '../utils/glob.js';
import { formatTable } from '../utils/output.js';
import { relative } from 'node:path';

const LISTABLE_TYPES = ['behavior', 'states', 'actors', 'rules', 'glossary', 'config', 'workflow'] as const;

type ListableType = (typeof LISTABLE_TYPES)[number] | 'all';

export interface ListOptions {
  type: ListableType;
  format: 'text' | 'json';
}

interface ListEntry {
  file: string;
  blockType: string;
  id: string;
  name: string;
  trust?: string;
  rejected_reason?: string;
  rejected_ref?: string;
}

function extractEntries(filePath: string, blockType: string, parsed: unknown): ListEntry[] {
  const entries: ListEntry[] = [];
  const items = Array.isArray(parsed) ? parsed : [parsed];
  const relFile = relative(process.cwd(), filePath);

  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;

    const entry: ListEntry = {
      file: relFile,
      blockType,
      id: String(obj.id || obj.term || '-'),
      name: String(obj.name || obj.term || obj.definition || obj.rule || '-'),
    };
    if (blockType === 'behavior' || blockType === 'rules') {
      if (obj.trust != null) entry.trust = String(obj.trust);
      if (obj.trust === 'rejected') {
        if (typeof obj.rejected_reason === 'string') entry.rejected_reason = obj.rejected_reason;
        if (typeof obj.rejected_ref === 'string') entry.rejected_ref = obj.rejected_ref;
      }
    }
    entries.push(entry);
  }

  return entries;
}

export function runList(patterns: string[], options: ListOptions): number {
  const files = resolveFiles(patterns);

  if (files.length === 0) {
    console.error('No .pbc.md files found.');
    return 1;
  }

  const entries: ListEntry[] = [];

  for (const file of files) {
    try {
      const doc = parseFile(file);
      for (const block of doc.blocks) {
        if (options.type !== 'all' && block.type !== options.type) continue;
        if (!LISTABLE_TYPES.includes(block.type as any)) continue;
        entries.push(...extractEntries(file, block.type, block.parsed));
      }
    } catch (err) {
      console.error(`Error reading ${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (entries.length === 0) {
    console.log('No matching entries found.');
    return 0;
  }

  if (options.format === 'json') {
    console.log(JSON.stringify(entries, null, 2));
    return 0;
  }

  const rows = entries.map(entry => [
    entry.file, entry.blockType, entry.id, entry.trust || '-', truncate(entry.name, 60),
  ]);
  console.log(formatTable(rows, ['File', 'Type', 'ID', 'Trust', 'Name']));
  for (const entry of entries.filter(entry => entry.trust === 'rejected')) {
    const reason = entry.rejected_reason?.trim() ? entry.rejected_reason : 'Rejection reason missing or invalid.';
    console.log(`\n${entry.file} / ${entry.id}: Rejected — not an active obligation.\n  Reason: ${reason}`);
    if (entry.rejected_ref) console.log(`  Decision: ${entry.rejected_ref}`);
  }
  return 0;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + '\u2026' : s;
}
