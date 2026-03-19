import type { PbcDocument } from '@cli/parser/types.js';
import type { CheckResult } from '@cli/validator/types.js';
import { checkFrontmatter } from '@cli/validator/checks/frontmatter.js';
import { checkBlockSyntax } from '@cli/validator/checks/block-syntax.js';
import { checkIdentity } from '@cli/validator/checks/identity.js';
import { checkReferences } from '@cli/validator/checks/references.js';
import { checkProvenance } from '@cli/validator/checks/provenance.js';
import { checkConfig } from '@cli/validator/checks/config.js';
import { checkCompleteness } from '@cli/validator/checks/completeness.js';

export type { CheckResult };

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
