import yaml from 'js-yaml';
import { extractBlocks } from '@cli/parser/blocks.js';
import type { PbcDocument, PbcFrontmatter, ParseError } from '@cli/parser/types.js';

export type { PbcDocument, PbcBlock, PbcFrontmatter } from '@cli/parser/types.js';
export { KNOWN_BLOCK_TYPES, RECOMMENDED_STATUSES } from '@cli/parser/types.js';

// Browser-safe frontmatter extraction — avoids gray-matter's Buffer dependency.
function extractFrontmatter(raw: string): { frontmatter: PbcFrontmatter | null; body: string; errors: ParseError[] } {
  const errors: ParseError[] = [];

  if (!raw.trimStart().startsWith('---')) {
    return { frontmatter: null, body: raw, errors };
  }

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: raw, errors };
  }

  try {
    const data = yaml.load(match[1]) as Record<string, unknown>;
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return { frontmatter: null, body: match[2], errors };
    }
    return { frontmatter: data as PbcFrontmatter, body: match[2], errors };
  } catch (err) {
    errors.push({ message: `Failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`, line: 1 });
    return { frontmatter: null, body: raw, errors };
  }
}

export function parseString(raw: string, filePath = '<viewer>'): PbcDocument {
  const { frontmatter, body, errors: fmErrors } = extractFrontmatter(raw);
  const { blocks, errors: blockErrors } = extractBlocks(body);

  const fmLineCount = raw.indexOf(body) > -1
    ? raw.substring(0, raw.indexOf(body)).split('\n').length - 1
    : 0;

  for (const block of blocks) {
    block.startLine += fmLineCount;
    block.endLine += fmLineCount;
  }
  for (const err of blockErrors) {
    if (err.line) err.line += fmLineCount;
  }

  return { filePath, frontmatter, blocks, errors: [...fmErrors, ...blockErrors] };
}
