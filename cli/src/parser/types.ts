export interface PbcFrontmatter {
  id?: string;
  title?: string;
  status?: string;
  context?: string;
  owners?: string[];
  updated?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface PbcBlock {
  type: string;
  rawContent: string;
  parsed: unknown;
  startLine: number;
  endLine: number;
}

export interface ParseError {
  message: string;
  line?: number;
}

export interface PbcDocument {
  filePath: string;
  frontmatter: PbcFrontmatter | null;
  blocks: PbcBlock[];
  errors: ParseError[];
}

export const KNOWN_BLOCK_TYPES = [
  // Stable core
  'glossary',
  'actors',
  'states',
  'behavior',
  'preconditions',
  'trigger',
  'outcomes',
  'events',
  'transitions',
  'exceptions',
  'rules',
  // Stable supporting
  'provenance',
  'include',
  'cross_references',
  'changelog',
  // Experimental
  'workflow',
  'steps',
  'config',
  'grounding',
  'computed',
  'presentation',
  'constraints',
  'import',
] as const;

export type KnownBlockType = (typeof KNOWN_BLOCK_TYPES)[number];

export const RECOMMENDED_STATUSES = ['draft', 'review', 'agreed', 'deprecated'] as const;

export const VALID_CONFIDENCE_VALUES = ['verified', 'inferred', 'assumed'] as const;

export const VALID_ACTOR_TYPES = ['human', 'system', 'external'] as const;
