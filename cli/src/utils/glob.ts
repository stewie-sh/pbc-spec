import { globSync } from 'glob';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveFiles(patterns: string[]): string[] {
  const files = new Set<string>();

  for (const pattern of patterns) {
    const resolved = resolve(pattern);

    try {
      const stat = statSync(resolved);
      if (stat.isDirectory()) {
        // Search recursively for .pbc.md files
        const found = globSync('**/*.pbc.md', { cwd: resolved, absolute: true });
        for (const f of found) files.add(f);
        continue;
      }
    } catch {
      // Not a real path; treat as glob pattern
    }

    if (pattern.includes('*')) {
      const found = globSync(pattern, { absolute: true });
      for (const f of found) files.add(f);
    } else {
      files.add(resolved);
    }
  }

  return [...files].sort();
}
