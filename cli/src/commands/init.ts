import { writeFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const TEMPLATE = `---
id: {{ID}}
title: {{TITLE}}
status: draft
updated: {{DATE}}
---

# {{TITLE}}

Brief description of what this module covers.

## Scope

- ...

## Non-goals

- ...

## Glossary

\`\`\`pbc:glossary
- term: Example Term
  definition: What this term means in the product context.
\`\`\`

## Actors

\`\`\`pbc:actors
- id: primary_user
  name: Primary user
  type: human
  description: The main person interacting with this feature.
\`\`\`

## States

\`\`\`pbc:states
- id: active
  definition: The default operational state.
  user_access: full
\`\`\`

## Behaviors

\`\`\`pbc:behavior
id: BHV-001
name: Example behavior
actor: primary_user
description: Describe what the product promises to do.
\`\`\`

\`\`\`pbc:preconditions
- The user is signed in.
\`\`\`

\`\`\`pbc:trigger
The user performs the initiating action.
\`\`\`

\`\`\`pbc:outcomes
- The expected product response occurs.
\`\`\`

## Rules

\`\`\`pbc:rules
- id: RUL-001
  name: Example rule
  rule: Describe an invariant that must always hold.
\`\`\`
`;

export function runInit(filename: string | undefined): number {
  const name = filename || 'new-feature.pbc.md';
  const filePath = resolve(name);

  if (existsSync(filePath)) {
    console.error(`File already exists: ${name}`);
    return 1;
  }

  const base = basename(name);
  const id = 'pbc-' + base.replace(/\.pbc\.md$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const title = base
    .replace(/\.pbc\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  const date = new Date().toISOString().split('T')[0];

  const content = TEMPLATE
    .replace(/\{\{ID\}\}/g, id)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DATE\}\}/g, date);

  writeFileSync(filePath, content, 'utf-8');
  console.log(`Created ${name}`);
  return 0;
}
