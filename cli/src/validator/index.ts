import type { PbcDocument } from '../parser/types.js';
import type { CheckResult } from './types.js';
import { checkFrontmatter } from './checks/frontmatter.js';
import { checkBlockSyntax } from './checks/block-syntax.js';
import { checkIdentity } from './checks/identity.js';
import { checkReferences } from './checks/references.js';
import { checkProvenance } from './checks/provenance.js';
import { checkConfig } from './checks/config.js';
import { checkCompleteness } from './checks/completeness.js';

const ALL_CHECKS = [
  checkFrontmatter,
  checkBlockSyntax,
  checkIdentity,
  checkReferences,
  checkProvenance,
  checkConfig,
  checkCompleteness,
];

export function validate(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  for (const check of ALL_CHECKS) {
    results.push(...check(doc));
  }
  return results;
}

export type { CheckResult, Severity } from './types.js';
