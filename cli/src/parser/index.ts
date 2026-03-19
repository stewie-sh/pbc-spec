import { readFileSync } from 'node:fs';
import { extractFrontmatter } from './frontmatter.js';
import { extractBlocks } from './blocks.js';
import type { PbcDocument } from './types.js';

export function parseFile(filePath: string): PbcDocument {
  const raw = readFileSync(filePath, 'utf-8');
  return parseString(raw, filePath);
}

export function parseString(raw: string, filePath: string = '<stdin>'): PbcDocument {
  const { frontmatter, body, errors: fmErrors } = extractFrontmatter(raw);
  const { blocks, errors: blockErrors } = extractBlocks(body);

  // Adjust block line numbers to account for frontmatter
  // gray-matter strips frontmatter, so we need to count how many lines it took
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

  return {
    filePath,
    frontmatter,
    blocks,
    errors: [...fmErrors, ...blockErrors],
  };
}

export type { PbcDocument, PbcBlock, PbcFrontmatter, ParseError } from './types.js';
export { KNOWN_BLOCK_TYPES, RECOMMENDED_STATUSES, VALID_CONFIDENCE_VALUES } from './types.js';
