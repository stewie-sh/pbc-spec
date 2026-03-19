import type { PbcDocument } from '../../parser/types.js';
import { RECOMMENDED_STATUSES } from '../../parser/types.js';
import type { CheckResult } from '../types.js';

export function checkFrontmatter(doc: PbcDocument): CheckResult[] {
  const results: CheckResult[] = [];
  const file = doc.filePath;

  if (!doc.frontmatter) {
    results.push({
      checkId: 'E001',
      severity: 'error',
      message: 'Missing YAML frontmatter.',
      file,
      line: 1,
    });
    return results;
  }

  if (!doc.frontmatter.id) {
    results.push({
      checkId: 'E002',
      severity: 'error',
      message: 'Frontmatter missing required `id` field.',
      file,
      line: 1,
    });
  }

  if (!doc.frontmatter.title) {
    results.push({
      checkId: 'E003',
      severity: 'error',
      message: 'Frontmatter missing required `title` field.',
      file,
      line: 1,
    });
  }

  if (!doc.frontmatter.status) {
    results.push({
      checkId: 'W001',
      severity: 'warning',
      message: 'Frontmatter missing recommended `status` field.',
      file,
      line: 1,
    });
  } else if (!RECOMMENDED_STATUSES.includes(doc.frontmatter.status as any)) {
    results.push({
      checkId: 'W011',
      severity: 'warning',
      message: `Frontmatter \`status\` value "${doc.frontmatter.status}" is not a standard value (${RECOMMENDED_STATUSES.join(', ')}).`,
      file,
      line: 1,
    });
  }

  if (!doc.frontmatter.updated) {
    results.push({
      checkId: 'W002',
      severity: 'warning',
      message: 'Frontmatter missing recommended `updated` field.',
      file,
      line: 1,
    });
  }

  return results;
}
