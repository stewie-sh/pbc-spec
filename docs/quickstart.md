# Quickstart

This repo is about reading and authoring Product Behavior Contracts, not about
running the engine.

## A Minimal PBC

At minimum, a PBC is a Markdown file with frontmatter and one or more structured
`pbc:*` blocks:

````markdown
---
id: pbc-billing
title: Billing & Subscriptions
status: draft
---

# Billing & Subscriptions

This module describes the product's billing behavior.

```pbc:actors
- id: subscriber
  name: Subscriber
  type: human
  description: The person responsible for billing.
```

```pbc:states
- id: active
  definition: Billing is current.
  user_access: full
- id: past_due
  definition: Billing payment failed and recovery is in progress.
  user_access: limited
```

```pbc:behavior
id: BIL-BHV-001
name: Recover a failed renewal payment
actor: subscriber
```

```pbc:preconditions
- The subscription is in past_due state.
```

```pbc:trigger
The subscriber updates the payment method and retries payment.
```

```pbc:outcomes
- The renewal payment succeeds.
- The subscription returns to active state.
```
````

## Authoring Pattern

The intended flow is:

1. Write fluent Markdown for people.
2. Add structured `pbc:*` blocks for the canonical contract parts.
3. Keep supporting context attached, but separate from the main contract.
4. Let deterministic tooling derive JSON and validation later.

## What Belongs In A PBC

Good fit:

- product behaviors
- business rules
- states and transitions
- actors and permissions
- workflows
- stable product-facing configuration

Poor fit:

- raw infrastructure configuration
- storage schema as the primary model
- implementation-only details
- opaque internal flags with no product meaning

## Viewing PBCs

PBC files are Markdown — they render in any Markdown viewer (GitHub, VS Code,
wiki, etc.).

For a richer interactive view, use the included browser-based viewer:

```bash
cd viewer && npm install && npm run dev
```

The viewer parses `pbc:*` blocks and renders actors, states, behaviors, rules,
and configuration as interactive cards, SVG diagrams, and validation results.
Drop any `.pbc.md` file into the viewer or paste content directly.

## Recommended Reading

- [pbc-spec-v0.6.md](specs/pbc-spec-v0.6.md)
- [pbc-spec-appendix-gfm.md](specs/pbc-spec-appendix-gfm.md)
- [../examples/README.md](../examples/README.md)

## Deterministic Engine

The deterministic reference implementation lives separately from this repo.
This repo focuses on the format and its examples first.
