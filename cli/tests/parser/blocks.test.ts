import { describe, it, expect } from 'vitest';
import { extractBlocks } from '../../src/parser/blocks.js';

describe('extractBlocks', () => {
  it('extracts a simple pbc block', () => {
    const body = `# Test

\`\`\`pbc:actors
- id: test_user
  name: Test User
  type: human
  description: A test user.
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('actors');
    expect(result.blocks[0].parsed).toEqual([
      { id: 'test_user', name: 'Test User', type: 'human', description: 'A test user.' },
    ]);
    expect(result.errors).toHaveLength(0);
  });

  it('extracts multiple blocks', () => {
    const body = `
\`\`\`pbc:actors
- id: user
  name: User
  type: human
  description: A user.
\`\`\`

\`\`\`pbc:states
- id: active
  definition: Active state.
  user_access: full
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0].type).toBe('actors');
    expect(result.blocks[1].type).toBe('states');
  });

  it('handles plain text blocks like pbc:trigger', () => {
    const body = `
\`\`\`pbc:trigger
The user submits the form.
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('trigger');
    // Plain string gets parsed as a YAML scalar string
    expect(result.blocks[0].parsed).toBe('The user submits the form.');
  });

  it('handles pbc:behavior with object (non-list) YAML', () => {
    const body = `
\`\`\`pbc:behavior
id: BHV-001
name: Test behavior
actor: test_user
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].parsed).toEqual({
      id: 'BHV-001',
      name: 'Test behavior',
      actor: 'test_user',
    });
  });

  it('reports error for malformed YAML', () => {
    const body = `
\`\`\`pbc:actors
- id: test
  bad_indent:
 broken: true
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('YAML parse error');
  });

  it('reports error for unclosed block', () => {
    const body = `
\`\`\`pbc:actors
- id: test
  name: Unclosed
`;

    const result = extractBlocks(body);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('Unclosed');
  });

  it('ignores pbc blocks inside example code fences (4+ backticks)', () => {
    const body = `Some text.

\`\`\`\`markdown
\`\`\`pbc:actors
- id: inside_example
  name: Inside Example
  type: human
  description: Should be ignored.
\`\`\`
\`\`\`\`

\`\`\`pbc:actors
- id: real_actor
  name: Real Actor
  type: human
  description: Should be extracted.
\`\`\`
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('actors');
    expect((result.blocks[0].parsed as any[])[0].id).toBe('real_actor');
  });

  it('extracts blocks inside HTML details/summary wrappers', () => {
    const body = `
<details>
<summary>Contract blocks</summary>

\`\`\`pbc:states
- id: active
  definition: Active.
  user_access: full
\`\`\`

</details>
`;

    const result = extractBlocks(body);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('states');
  });
});
