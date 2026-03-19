import matter from 'gray-matter';
import type { PbcFrontmatter, ParseError } from './types.js';

export interface FrontmatterResult {
  frontmatter: PbcFrontmatter | null;
  body: string;
  errors: ParseError[];
}

export function extractFrontmatter(raw: string): FrontmatterResult {
  const errors: ParseError[] = [];

  if (!raw.trimStart().startsWith('---')) {
    return { frontmatter: null, body: raw, errors };
  }

  try {
    const result = matter(raw);
    const data = result.data as PbcFrontmatter;

    if (Object.keys(data).length === 0) {
      return { frontmatter: null, body: result.content, errors };
    }

    return { frontmatter: data, body: result.content, errors };
  } catch (err) {
    errors.push({
      message: `Failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`,
      line: 1,
    });
    return { frontmatter: null, body: raw, errors };
  }
}
