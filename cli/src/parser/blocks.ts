import yaml from 'js-yaml';
import type { PbcBlock, ParseError } from './types.js';

const BLOCK_OPEN_RE = /^ {0,3}```pbc:([^\s`]+)\s*$/;
const BLOCK_CLOSE_RE = /^ {0,3}```\s*$/;

export interface BlocksResult {
  blocks: PbcBlock[];
  errors: ParseError[];
}

export function extractBlocks(body: string): BlocksResult {
  const blocks: PbcBlock[] = [];
  const errors: ParseError[] = [];
  const lines = body.split('\n');

  let insideBlock = false;
  let currentType = '';
  let contentLines: string[] = [];
  let startLine = 0;
  // Track generic fenced code blocks to avoid matching pbc: blocks inside them
  let insideGenericFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // If we're inside a generic fenced block (e.g. ````markdown), skip everything
    if (insideGenericFence) {
      // Check for closing of the outer generic fence (4+ backticks or matching)
      if (/^ {0,3}````+\s*$/.test(line)) {
        insideGenericFence = false;
      }
      continue;
    }

    // Detect opening of a generic code fence (4+ backticks, used for examples)
    if (!insideBlock && /^ {0,3}````+/.test(line)) {
      insideGenericFence = true;
      continue;
    }

    if (!insideBlock) {
      const match = BLOCK_OPEN_RE.exec(line);
      if (match) {
        insideBlock = true;
        currentType = match[1];
        contentLines = [];
        startLine = lineNum;
      }
    } else {
      if (BLOCK_CLOSE_RE.test(line)) {
        const rawContent = contentLines.join('\n');
        let parsed: unknown = null;

        try {
          parsed = yaml.load(rawContent);
          // If yaml.load returns a string (plain text block like pbc:trigger),
          // that's fine — keep it as-is
        } catch (err) {
          errors.push({
            message: `YAML parse error in pbc:${currentType} block: ${err instanceof Error ? err.message : String(err)}`,
            line: startLine,
          });
        }

        blocks.push({
          type: currentType,
          rawContent,
          parsed: parsed ?? rawContent,
          startLine,
          endLine: lineNum,
        });

        insideBlock = false;
        currentType = '';
        contentLines = [];
      } else {
        contentLines.push(line);
      }
    }
  }

  if (insideBlock) {
    errors.push({
      message: `Unclosed pbc:${currentType} block.`,
      line: startLine,
    });
  }

  return { blocks, errors };
}
