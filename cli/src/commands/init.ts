import { writeFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const TEMPLATE_DEFAULT = `---
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

const TEMPLATE_FEATURE_FLAG = `---
id: {{ID}}
title: {{TITLE}}
status: draft
updated: {{DATE}}
---

# {{TITLE}}

Describe the flag surface: how flags are evaluated, how rollouts work, and what
safe fallback behavior looks like.

## Actors

\`\`\`pbc:actors
- id: flag_admin
  name: Flag admin
  type: human
  description: The person responsible for defining and modifying flags.
- id: flag_policy
  name: Flag policy
  type: system
  description: The policy layer that evaluates whether a flag is enabled.
\`\`\`

## Configuration

\`\`\`pbc:config
domain: feature_flags
flags:
  my_flag:
    description: What this flag gates.
    default: false
    state: disabled
    rollout:
      mode: off
      percentage: 0
    targeting:
      allowlist_user_ids: []
      denylist_user_ids: []
\`\`\`

## Rules

\`\`\`pbc:rules
- id: FLG-RUL-001
  name: Targeting precedence
  rule: Denylist overrides allowlist; allowlist overrides rollout; rollout overrides default.
\`\`\`

## Behaviors

\`\`\`pbc:behavior
id: FLG-BHV-001
name: Evaluate a flag
actor: flag_policy
description: The policy evaluates whether a feature flag is enabled for a request using declared precedence rules.
\`\`\`

\`\`\`pbc:preconditions
- A flag key is provided.
\`\`\`

\`\`\`pbc:trigger
The product requests evaluation for a flag key.
\`\`\`

\`\`\`pbc:outcomes
- The evaluation returns enabled or disabled using declared precedence rules.
\`\`\`
`;

const TEMPLATE_PERMISSIONS = `---
id: {{ID}}
title: {{TITLE}}
status: draft
updated: {{DATE}}
---

# {{TITLE}}

Describe the permissions surface: how permissions are granted, how entitlements
gate access, and what denial outcomes look like.

## Actors

\`\`\`pbc:actors
- id: authorization_policy
  name: Authorization policy
  type: system
  description: The policy layer that computes allow/deny decisions.
- id: product_surface
  name: Product surface
  type: system
  description: The UI or API layer that requests authorization decisions.
\`\`\`

## Configuration

\`\`\`pbc:config
domain: permissions_entitlements
permissions:
  - resource.view
  - resource.edit
  - resource.export
roles:
  owner:
    permissions:
      - resource.view
      - resource.edit
      - resource.export
  viewer:
    permissions:
      - resource.view
entitlements:
  resource.export:
    required: true
    plans:
      - pro
\`\`\`

## Rules

\`\`\`pbc:rules
- id: PER-RUL-001
  name: Deny by default
  rule: If a permission is not explicitly granted, the authorization decision is denied.
\`\`\`

## Behaviors

\`\`\`pbc:behavior
id: PER-BHV-001
name: Check permission
actor: authorization_policy
description: The policy computes an authorization decision using roles and entitlements.
\`\`\`

\`\`\`pbc:preconditions
- A permission key is provided for the action.
\`\`\`

\`\`\`pbc:trigger
The product surface requests an authorization decision.
\`\`\`

\`\`\`pbc:outcomes
- The decision is allowed or denied with a clear reason category.
\`\`\`
`;

const TEMPLATE_WORKFLOW = `---
id: {{ID}}
title: {{TITLE}}
status: draft
updated: {{DATE}}
---

# {{TITLE}}

Describe a multi-step workflow that spans several actions or screens.

## Workflow

\`\`\`pbc:workflow
id: WFL-001
name: Example workflow
description: A named multi-step workflow.
\`\`\`

\`\`\`pbc:steps
- id: step_1
  name: First step
  description: What happens in step one.
- id: step_2
  name: Second step
  description: What happens in step two.
\`\`\`

## Rules

\`\`\`pbc:rules
- id: WFL-RUL-001
  name: Step order is respected
  rule: Steps occur in the declared order unless an exception path is taken.
\`\`\`
`;

const TEMPLATES: Record<string, string> = {
  default: TEMPLATE_DEFAULT,
  'feature-flag': TEMPLATE_FEATURE_FLAG,
  permissions: TEMPLATE_PERMISSIONS,
  workflow: TEMPLATE_WORKFLOW,
};

export function runInit(filename: string | undefined, opts: { template?: string } = {}): number {
  const name = filename || 'new-feature.pbc.md';
  const filePath = resolve(name);

  if (existsSync(filePath)) {
    console.error(`File already exists: ${name}`);
    return 1;
  }

  const templateKey = (opts.template || 'default').trim();
  const template = TEMPLATES[templateKey];
  if (!template) {
    const available = Object.keys(TEMPLATES).sort().join(', ');
    console.error(`Unknown template: ${templateKey}`);
    console.error(`Available templates: ${available}`);
    return 1;
  }

  const base = basename(name);
  const id = 'pbc-' + base.replace(/\.pbc\.md$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const title = base
    .replace(/\.pbc\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  const date = new Date().toISOString().split('T')[0];

  const content = template
    .replace(/\{\{ID\}\}/g, id)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DATE\}\}/g, date);

  writeFileSync(filePath, content, 'utf-8');
  console.log(`Created ${name}`);
  return 0;
}
