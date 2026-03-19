import { describe, it, expect } from 'vitest';
import { extractFrontmatter } from '../../src/parser/frontmatter.js';

describe('extractFrontmatter', () => {
  it('extracts valid frontmatter', () => {
    const raw = `---
id: pbc-test
title: Test Module
status: draft
---

# Test Module`;

    const result = extractFrontmatter(raw);
    expect(result.frontmatter).not.toBeNull();
    expect(result.frontmatter!.id).toBe('pbc-test');
    expect(result.frontmatter!.title).toBe('Test Module');
    expect(result.frontmatter!.status).toBe('draft');
    expect(result.errors).toHaveLength(0);
  });

  it('returns null frontmatter when no frontmatter present', () => {
    const raw = '# No Frontmatter\n\nJust content.';
    const result = extractFrontmatter(raw);
    expect(result.frontmatter).toBeNull();
    expect(result.errors).toHaveLength(0);
  });

  it('handles empty frontmatter', () => {
    const raw = `---
---

# Empty Frontmatter`;

    const result = extractFrontmatter(raw);
    expect(result.frontmatter).toBeNull();
  });

  it('extracts array and complex fields', () => {
    const raw = `---
id: pbc-complex
title: Complex
owners:
  - PM
  - Eng
tags:
  - billing
  - example
---

# Complex`;

    const result = extractFrontmatter(raw);
    expect(result.frontmatter!.owners).toEqual(['PM', 'Eng']);
    expect(result.frontmatter!.tags).toEqual(['billing', 'example']);
  });
});
