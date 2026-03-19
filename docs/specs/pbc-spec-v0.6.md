# Product Behavior Contract (PBC) — Specification

**Version:** 0.6.0-draft  
**Status:** Working Draft  
**Date:** March 2026  
**Format:** Markdown-first contract documents with embedded `pbc:*` structured blocks

---

## 1. Purpose

A **Product Behavior Contract (PBC)** is the canonical authored source of truth
for what a product promises to do.

PBC is designed to combine the strongest parts of:

- **DDD**: ubiquitous language, bounded contexts, states, invariants
- **BDD**: trigger/outcome thinking and atomic testable promises, without forcing the whole contract into Gherkin-style shape
- **PRD**: product-facing readability and decision context
- **SRS / SDD**: structured, reviewable, versioned specification

The center of gravity remains the same:

```text
PBCs describe product logic and behavioral intent.
They do not use implementation or infrastructure as the primary model.
```

Markdown is the human authoring shell.
Structured `pbc:*` blocks are the machine-parseable contract and annotation
surface.
JSON is derived from Markdown, never the reverse.

---

## 2. What Changed in v0.6

Version `0.6` extends `v0.5` around three practical lessons:

1. **Stable product configuration matters.**
   Products need a first-class way to express plans, capabilities, limits,
   access conditions, and other declarative facts that materially affect
   behavior.

2. **Anchors matter more than line numbers.**
   PBCs need a semantic grounding model so supporting context and history can
   remain attached even when authors edit Markdown manually.

3. **Supporting context should stay attached to the contract without becoming
   the contract.**
   Provenance, review notes, grounding context, decision history, and change
   history need a clean place in the document model.

Key additions and clarifications:

- introduces **semantic anchors** as a core document concept
- clarifies **anchored annotation / supporting blocks**
- adds **canonicality rules** to avoid duplicated truth
- introduces **`pbc:config`** as an experimental reusable block for stable
  declarative configuration
- clarifies how fenced blocks can serve as attached context around a
  Markdown-authored contract unit

---

## 3. Design Principles

### 3.1 Core Principles

- **Human-first, machine-friendly.** PBCs should read well in raw Markdown and
  parse cleanly into structured outputs.
- **Behavioral, not technical.** The primary model is product behavior, not
  APIs, tables, services, or infrastructure.
- **Canonical, not exhaustive.** PBCs capture the agreed product contract, not
  every implementation detail.
- **Evidence-aware.** Important contract units should carry provenance or
  supporting trust context.
- **Composable.** PBCs can grow, split, and link into larger product trees.
- **Progressively formalized.** Teams may begin with rough understanding and
  increase structure over time.
- **Anchor-stable.** Semantic identity should survive ordinary Markdown edits.
- **Markdown-first.** Fluent product/module prose remains a first-class authored
  surface; structured blocks clarify and stabilize canonical meaning rather
  than forcing every concept into one rigid scenario template.
- **Type-aware.** Important domain concepts should move toward explicit semantic
  types, states, records, and units rather than vague primitives or scattered
  flags.

### 3.2 Anti-Goals

PBC is not meant to be:

- a database schema language
- an architecture diagram language
- a runbook or ops manual
- a claim graph as the primary authored model
- a replacement for source code, tests, or infra configuration
- an arbitrary nested config dump

---

## 4. Layer Model

PBC sits in a layered product-knowledge stack.

```text
WHY
- rationale
- tradeoffs
- product decisions
- design notes

WHAT
- Product Behavior Contracts (canonical)
- behaviors, rules, states, actors, workflows, config, presentation promises

SUPPORTING CONTEXT
- provenance
- review / grounding context
- decision history
- change history
- ambiguity / assumptions

HOW
- code
- tests
- runtime
- infra
- operational config
```

`v0.6` still defines the **WHAT** layer directly.

It also clarifies how **supporting context** may attach to the WHAT layer
without displacing it as the semantic center of gravity.

The **HOW** layer remains evidence, not the authored contract.

---

## 5. Canonical vs Supporting Knowledge

### 5.1 Canonical Contract

The canonical PBC contract is the set of agreed product promises:

- glossary
- actors
- states
- behaviors
- preconditions
- triggers
- outcomes
- events
- transitions
- exceptions
- rules
- workflows
- computed values
- presentation promises
- stable declarative configuration that materially affects behavior

### 5.2 Supporting Trust / Context Layer

Some information is essential, but should not become the semantic center of the
contract:

- provenance
- confidence
- evidence references
- unresolved ambiguity
- assumptions
- hypotheses
- review context
- decision notes
- change history

These are **supporting trust and context metadata** around the contract.

### 5.3 Canonicality Rule

Every important semantic fact should have **one canonical home**.

Avoid:

- putting the same fact in prose and a block as two equal authorities
- duplicating the same rule in a table and a fenced block
- keeping a “real” value in one place and a stale copy nearby

Allowed:

- narrative explanation of a canonical fact
- supporting annotations attached to a canonical unit
- derived projections that are clearly not authored truth

### 5.4 Assumptions and Hypotheses

Assumptions and hypotheses are still not the semantic center of PBC.

They may appear:

- in surrounding Markdown narrative
- in provenance and supporting context blocks
- in grounding / review workflows outside the canonical contract surface

They should not displace agreed behaviors, rules, config, and states as the
center of the PBC.

---

## 6. Structural Contract vs Content Quality

PBC quality still has two layers.

### 6.1 Hard Contract

The hard contract is deterministic and mostly machine-checkable:

- required frontmatter exists
- supported blocks parse
- references resolve
- anchor attachment is valid
- derived outputs can be generated
- supporting blocks attach to valid semantic anchors

### 6.2 Soft Contract

The soft contract is semantic and editorial:

- behaviors are product-facing
- config is declarative and scoped correctly
- glossary reflects shared language
- implementation detail does not dominate
- annotations help explain and trust the contract rather than replace it

The hard contract belongs to deterministic tooling.  
The soft contract belongs to human review and refinement.

---

## 6.3 Contract Invariants

These invariants define what must remain true at the specification layer.

### 6.3.1 Markdown Is the Authored Source of Truth

The authored PBC document in Markdown remains canonical.

- Markdown is authored truth
- structured JSON is derived output
- tooling may normalize or project the contract, but should not replace the authored source as the semantic authority

### 6.3.2 Canonical Contract and Supporting Context Must Stay Distinct

Supporting context may attach to the contract, but should not silently become the contract itself.

Examples of supporting context:

- provenance
- review notes
- grounding metadata
- decision history
- unresolved ambiguity

These may inform trust and interpretation, but they do not automatically become canonical contract facts.

### 6.3.3 Every Important Fact Should Have One Canonical Home

The same semantic fact should not be maintained as equal authored truth in multiple places.

Allowed:

- narrative explanation around a canonical fact
- attached supporting annotations
- derived views and projections

Avoid:

- duplicate rule definitions
- multiple conflicting authoritative copies
- hidden “real” values behind stale visible values

### 6.3.4 Semantic Identity Should Not Depend Primarily on Line Numbers

Line numbers are too fragile to serve as canonical semantic identity.

Preferred grounding/identity should rely on:

- semantic anchors
- stable IDs
- block or unit identity

Line numbers may be used as fallback implementation detail, but not as the primary specification model.

### 6.3.5 Structured Config Must Stay Declarative and Product-Facing

If `pbc:config` is used, it should capture stable declarative product facts that materially affect behavior.

It should not become:

- a generic implementation-config dump
- a finance-only special case
- a replacement for application runtime configuration

### 6.3.6 Uncertainty Must Not Be Flattened into Canonical Truth

Assumptions, hypotheses, and grounding context may be attached around the contract.

They should not silently present unresolved uncertainty as if it were already agreed canonical behavior or policy.

### 6.3.7 Product Roots Should Follow Product Truth Boundaries

PBC roots should usually follow coherent product truth boundaries, not repository boundaries.

Default interpretation:

- one coherent product should usually have one root PBC
- multiple repos may inform the same product root
- repo boundaries should usually remain provenance/evidence or implementation scope
- separate roots should be reserved for genuinely separate products or separate product truths

---

## 7. Document Model

### 7.1 Markdown Shell

A PBC document is authored as Markdown with embedded fenced `pbc:*` blocks.

Narrative Markdown remains valuable for:

- explanation
- context
- rationale
- progressive refinement

Structured blocks remain the preferred machine-extractable surface.

### 7.2 Frontmatter

Every PBC document should begin with YAML frontmatter.

Minimum required frontmatter:

```yaml
id: pbc-example
title: Example Module
```

Recommended frontmatter:

```yaml
id: pbc-example
title: Example Module
status: draft
context: Example Context
owners:
  - PM
  - Eng
updated: 2026-03-16
```

Recommended status values:

- `draft`
- `review`
- `agreed`
- `deprecated`

### 7.3 Semantic Anchors

`v0.6` introduces **semantic anchors** as the preferred attachment model for
supporting context.

The primary identity of a contract unit should come from stable semantic
identity, not raw line numbers.

Preferred anchor order:

1. explicit stable IDs in contract content
2. heading/section identity
3. table row IDs where applicable
4. section path / document path
5. raw line position only as a temporary fallback, never as the primary identity

Examples of valid anchors:

- behavior IDs
- rule IDs
- state IDs
- glossary row IDs
- config object IDs
- section IDs

### 7.4 Progressive Structuring

PBC authoring is allowed to mature over time:

```text
rough understanding
-> narrative explanation
-> candidate structured blocks
-> validated structured contract
-> agreed product memory
```

Narrative Markdown may temporarily hold incomplete understanding, but the goal
is to progressively move important product knowledge into stable structured
blocks.

### 7.4b Markdown-First Fluent Authoring

`v0.6` is intentionally **BDD-inspired, not BDD-constrained**.

That means:

- `Given / When / Then` style structure is useful for many atomic behaviors
- but it is not the required authoring grammar for the whole document
- fluent module/product docs are valid and often preferable at the higher level

Good Markdown-first product sections often include:

- purpose
- scope / non-goals
- role matrix
- high-level flow
- constraints / edge cases
- pointers
- known gaps / open questions

Use structured blocks to anchor the canonical units inside that broader authored
surface.

The intended shape is:

```text
Markdown-first module contract
-> purpose / scope / roles / flows / rules / gaps
-> canonical structured units where needed
-> optional Given / When / Then style blocks for atomic behaviors
```

This keeps the contract readable for real product work without forcing every
module into a rigid scenario template.

### 7.4c Type-Oriented Domain Modeling

`v0.6` also leans toward a more type-aware contract style inspired by strong
domain modeling practice.

This does **not** mean turning PBC into a programming language.

It does mean preferring:

- semantic concepts over vague primitives
- explicit alternatives over free-form status text
- explicit lifecycle/state models over scattered booleans
- named records/tables over implied positional meaning
- typed quantities and units over naked numbers where meaning matters

Examples:

- `candidate | in_review | trusted` is better than several loosely-related flags
- `credits/month` is better than an unlabeled numeric threshold
- a role/capability matrix is better than scattered prose if capability policy matters

The intended discipline is:

```text
make important domain truth easier to express correctly
and harder to express incorrectly
```

This should improve rigor without sacrificing markdown-first ergonomics.

### 7.4d F#-Inspired YAML Profile

The most practical near-term path for stronger type-aware PBC authoring is not
to invent a new programming language.

It is to borrow strong domain-modeling ideas into YAML-authored semantic blocks
inside markdown-first contracts.

Practical examples:

- YAML objects as semantic records
- explicit `kind` fields for meaningful variants
- explicit `states` and `transitions` for lifecycle modeling
- `value` + `unit` pairs for typed quantities
- stable `id` and `ref` fields for semantic linkage

This keeps the authored surface:

- readable
- declarative
- agent-friendly
- deterministically processable

while still moving the contract toward stronger semantic discipline.

### 7.5 Anchored Supporting Context

Supporting blocks may attach to:

- the nearest valid contract unit
- an explicit anchor ID
- a section-level anchor

This allows the document to keep:

- provenance
- review notes
- decision history
- change history
- grounding context

near the contract without turning that context into the main contract itself.

### 7.6 Tables and Native Markdown

Markdown-native sections, lists, and tables may be valid authoring tools.

However:

- native Markdown should not create duplicated canonical meaning
- if a table row or section is semantically important, give it a stable ID
- treat important tables and YAML objects as semantic records when they express
  roles, plans, states, pricing, limits, or policies
- prefer explicit units and quantity meaning when tables carry thresholds,
  quotas, prices, or durations
- prefer bringing stronger type-like semantics into YAML blocks and table
  structure before introducing a separate authored DSL
- fenced blocks are still preferred when Markdown becomes ambiguous or overly
  implicit for deterministic tooling

### 7.7 Line Numbers

Raw line numbers are not a durable semantic identity and should not be treated
as the primary grounding model.

They may be used by tools temporarily, but the authored contract should rely on
semantic anchors.

---

## 8. Block Maturity Model

Each block type in the specification has a maturity level.

### 8.1 Stable

Stable blocks are suitable for deterministic tooling and normal authoring use.

### 8.2 Experimental

Experimental blocks are valid parts of the language, but teams should expect
some schema or tooling evolution.

### 8.3 Planned

Planned blocks are directionally important but not yet part of the stable
contract surface.

---

## 9. Stable Blocks

### 9.1 Core Stable Blocks

| Block Type | Purpose | Notes |
|---|---|---|
| `pbc:glossary` | Ubiquitous language definitions | Domain-facing terms only |
| `pbc:actors` | Human, system, or external actors | Use product-relevant actors |
| `pbc:states` | Named product/domain states | Prefer user/business meaning |
| `pbc:behavior` | Identity of a promised behavior | Product-facing name and actor |
| `pbc:preconditions` | What must already be true | Optional: “Given” for atomic behaviors |
| `pbc:trigger` | What initiates the behavior | Optional: “When” for atomic behaviors |
| `pbc:outcomes` | What the product promises | Optional: “Then” for atomic behaviors |
| `pbc:events` | Important domain events emitted | Product-significant only |
| `pbc:transitions` | Product/domain state changes | Explicit state movement |
| `pbc:exceptions` | Important edge cases and handling | Business-relevant edge cases |
| `pbc:rules` | Always-true business rules / invariants | Not tied to one trigger |

### 9.2 Stable Supporting Blocks

| Block Type | Purpose | Notes |
|---|---|---|
| `pbc:provenance` | Evidence and confidence attached to a contract unit | Prefer anchor-attached usage |
| `pbc:include` | Local composition of child PBC documents | Root/child composition model |
| `pbc:cross_references` | High-level links to related PBCs | Keep lightweight |
| `pbc:changelog` | Human-readable change history | Optional |

### 9.3 `pbc:provenance`

`pbc:provenance` records how strongly a contract unit is supported by available
evidence.

It is a supporting trust block, not the main contract itself.

Schema:

```yaml
- kind: string              # code | test | doc | runtime | review | inference
  ref: string               # file path, URL, note id, or evidence handle
  detail: string            # What this evidence supports
  confidence: string        # verified | inferred | assumed
  rationale: string         # Optional explanation
```

Rules:

- `confidence` must be one of `verified`, `inferred`, or `assumed`
- provenance should attach to a specific semantic anchor
- provenance should not silently change the meaning of the contract itself
- implementation details should live here before they leak into behavior names

### 9.4 `pbc:include`

`pbc:include` remains the stable local composition primitive for product PBC
trees.

Schema:

```yaml
- path: string
  summary: string
  owns: [string]
  status: string
```

Use `pbc:include` when:

- a root PBC composes local child PBC files
- a product tree is being built from multiple modules
- a summary/index document points to deeper module documents

Remember:

- a product root may compose modules informed by multiple repos
- technical verticals such as web/api/database should not force separate roots by default
- repo boundaries should usually remain attached through provenance or supporting context

---

## 10. Experimental Blocks

Experimental blocks are useful and often valuable, but should not yet be
assumed stable across future revisions.

| Block Type | Purpose |
|---|---|
| `pbc:workflow` | Named multi-step workflows |
| `pbc:steps` | Steps inside a workflow |
| `pbc:config` | Stable declarative configuration that materially affects behavior |
| `pbc:grounding` | Attached review / grounding context |
| `pbc:computed` | Derived values the product promises to calculate/display |
| `pbc:presentation` | Product-level UX visibility/messaging promises |
| `pbc:constraints` | Non-functional limits with product impact |
| `pbc:import` | Standard-library or external module import |

### 10.1 `pbc:config`

`pbc:config` is the preferred experimental direction for stable declarative
product configuration.

Use it for:

- plans
- packages
- capabilities
- limits
- access conditions
- role mappings
- availability scopes

Do not use it for:

- dynamic behavior flows
- event-driven side effects
- procedural logic
- arbitrary application or infrastructure config

Authoring format:

```yaml
domain: entitlements
objects:
  plans:
    free:
      limits:
        repos: 1
      capabilities:
        standard_library: false
    pro:
      limits:
        repos: unlimited
      capabilities:
        standard_library: true
```

Guardrails:

- keep nesting shallow and readable
- keep it declarative, not executable
- prefer stable IDs and meaningful keys
- use it only for facts that materially affect behavior

### 10.2 `pbc:grounding`

`pbc:grounding` is an experimental attached context block for review and
clarification workflows.

It may record:

- open questions
- discussion notes
- assumptions
- decisions
- replacement or follow-up pointers

It should remain supporting context, not the canonical contract itself.

Example direction:

```yaml
anchor: WRK-BHV-001
questions:
  - Is access retained during grace period?
assumptions:
  - Plan enforcement likely happens at workspace scope.
decision: defer
```

### 10.3 `pbc:import`

`pbc:import` remains experimental in `v0.6`.

Use `pbc:import` only for:

- future standard-library reuse
- imported baseline modules that may later be overridden locally

Do not use `pbc:import` for normal local composition. Use `pbc:include`
instead.

---

## 11. Planned Areas

The following areas are intentionally acknowledged but not fully standardized in
`v0.6`:

- richer cross-module invariants
- formal bridge / realization mappings
- behavior-to-test/component/API/event traceability
- stronger review / refinement history
- native Markdown table extraction rules
- standard-library packaging

---

## 12. Authoring Rules: WHAT vs HOW

### 12.1 Good PBC Behavior Wording

A good PBC behavior should:

- read as a product promise
- remain understandable if the tech stack changes
- be meaningful to PM, BA, dev, QA, and other stakeholders
- identify the actor and product outcome clearly

Good:

- `Invite a teammate by email`
- `Restore an archived workspace`
- `Determine whether billing blocks product access`

Too technical:

- `Call create_workspace RPC`
- `Validate signed upload URL`
- `Persist file_path metadata to extraction_jobs`

### 12.1b When to Use Given / When / Then

Use `pbc:preconditions`, `pbc:trigger`, and `pbc:outcomes` when a behavior is
best expressed as an atomic event-response promise.

Good fit:

- user action -> product response
- system event -> product response
- clear preconditions and clear promised outcomes

Poor fit:

- broad module overviews
- permissions / role matrices
- ongoing policies or invariants
- multi-stage workflows that span several screens or jobs
- scope, non-goals, or known gaps

In those cases, prefer fluent Markdown sections and other block types such as:

- `pbc:rules`
- `pbc:workflow`
- `pbc:steps`
- `pbc:config`
- `pbc:grounding`

### 12.2 Config Guidance

Good `pbc:config` content should:

- describe stable product facts
- remain readable by product and engineering stakeholders
- explain behaviorally meaningful differences
- avoid implementation-specific knobs

Good:

- `Free plan allows 1 workspace`
- `Viewer role is non-billable`
- `Standard Library requires pro plan`

Usually too technical:

- database connection pool sizes
- queue retry tuning
- provider-specific request options
- build-time feature flag internals

### 12.2b F#-Inspired YAML Authoring Guidance

The current mainline authoring profile is:

```text
markdown-first page/module shell
-> richer YAML semantic islands where rigor matters
-> deterministic checks where they improve trust and consistency
```

Good uses of richer YAML:

- plan and pricing policy
- role/capability policy
- state/lifecycle modeling
- typed thresholds and limits
- guard rules and finalization/materialization rules

Good conventions:

- `kind` for meaningful variants
- `value` + `unit` for typed quantities
- stable `id` for important units
- `ref` when semantic linkage matters
- explicit `states` and `transitions` where workflow state matters

Poor uses:

- forcing every narrative section into YAML
- requiring `kind` on every object regardless of value
- replacing module-level prose with config-heavy structure

The intent is stronger semantic discipline, not schema maximalism.

### 12.3 Glossary Guidance

Glossary terms should describe domain/product language, not implementation
internals.

Good:

- Workspace
- Trial
- Invoice
- Pending Invite

Usually too technical for the glossary center:

- PostgREST
- SECURITY DEFINER RPC
- `getSession()` / `getUser()`
- `file_path` column

Those may still appear in provenance if they matter as evidence.

### 12.4 Actor Guidance

Actors should usually be:

- humans
- external systems
- product surfaces
- product-relevant internal capabilities

Avoid using raw implementation helpers as the main actors unless they are the
clearest product-level abstraction available.

### 12.5 Module-Level Authoring Guidance

A strong module PBC should often read more like a high-quality product spec page
than like a collection of rigid test scenarios.

Good module-level shape:

- purpose
- current scope / non-goals
- role or actor surface
- high-level flows or lifecycle
- rules / constraints
- known gaps / TODOs
- pointers / provenance

Then, inside that module, use atomic behavior blocks where the product promise
benefits from explicit preconditions, trigger, and outcomes.

---

## 13. Async and Integration Semantics

Modern products often rely on asynchronous processing, webhooks, polling, and
eventual consistency. `v0.6` still treats these as legitimate product
behaviors, but they should be expressed in product terms.

Use:

- `pbc:behavior` for the product promise
- `pbc:events` for significant emitted events
- `pbc:transitions` for resulting state changes
- `pbc:workflow` / `pbc:steps` when the product meaning spans several steps
- `pbc:provenance` for queues, jobs, providers, or retry machinery
- `pbc:grounding` when important uncertainty or review questions remain

Example distinction:

Good:

- `Process an uploaded statement and make results available`

Too technical as the primary behavior:

- `Enqueue extraction job and poll OCR provider until callback persists rows`

---

## 14. Composition and Product Trees

PBC documents can be used at multiple scales:

- one file for a small feature
- a root plus child modules for a medium domain
- a product tree for a full system

Recommended lifecycle:

```text
seed
-> expand
-> split
-> compose
```

Rules:

- do not split too early
- split when cognitive load and ownership boundaries justify it
- keep shared glossary/actors/states/config in the root when several children
  inherit them
- use a root `README.md` or root `.pbc.md` as the top-level product map

---

## 15. Quality Gates

### 15.1 Minimum Structural Quality

A serious PBC module should have:

- frontmatter `id` and `title`
- at least one stable or experimental structured block
- valid semantic anchors for important contract units
- provenance on important behaviors or high-risk contract areas

### 15.2 Strong Product-Contract Quality

A strong PBC module should also have:

- clear product-facing glossary
- actors that make sense across functions
- behaviors expressed at the right abstraction level
- config separated cleanly from behavior and rule logic
- supporting context that clarifies trust without replacing contract meaning

### 15.3 Candidate Deterministic Checks

These are reasonable candidate checks for future deterministic tooling, but they
do not all need to be enforced immediately.

Good early checks:

- important rules require stable identity plus explicit human-readable wording
- provenance entries require enough source detail to be reviewable
- transitions reference known states when both are present
- `value` fields should usually carry `unit`
- duplicate semantic IDs should be rejected

Checks to phase in carefully:

- warning on naked quantity fields in policy-heavy config
- warning on inconsistent capability modeling within the same policy surface
- warning on policy-heavy modules that rely only on prose where stable YAML structure would help

Checks to avoid forcing too early:

- `kind` on every object
- typed units on every number
- IDs on every table row
- identical section templates for every module

---

## 16. Minimal Example

````markdown
---
id: pbc-workspaces
title: Workspaces & Membership
status: review
---

# Workspaces & Membership

This module describes how people create, join, and manage workspaces.

```pbc:glossary
- id: G-WORKSPACE
  term: Workspace
  definition: The primary shared operating space for a team.
- id: G-INVITE
  term: Invite
  definition: A time-bound permission for someone to join a workspace.
```

```pbc:actors
- id: workspace_owner
  name: Workspace owner
  type: human
  description: The person accountable for the workspace.
- id: workspace_experience
  name: Workspace experience
  type: system
  description: The product surface where workspaces are created and managed.
```

```pbc:states
- id: active
  definition: Workspace exists and is usable.
  user_access: full
- id: archived
  definition: Workspace is inactive and managed outside the normal flow.
  user_access: limited
```

```pbc:config
domain: access
objects:
  roles:
    owner:
      can_archive_workspace: true
    viewer:
      can_archive_workspace: false
```

## Purpose

Describe what workspace access means for the product and who it serves.

## Scope

- how workspaces are created
- who can enter and manage them
- role boundaries that affect product access

## Known gaps

- clarify whether personal workspaces are ever allowed for viewers

```pbc:behavior
id: WRK-BHV-001
name: Create a workspace
actor: workspace_owner
description: A signed-in person creates a new workspace from the workspace setup flow.
```

```pbc:preconditions
- The person is signed in.
- The chosen workspace name is available.
```

```pbc:trigger
The person confirms workspace creation.
```

```pbc:outcomes
- A new workspace is created.
- The creator becomes the workspace owner.
- The new workspace becomes the active workspace.
```

```pbc:provenance
- kind: code
  ref: repos/example/apps/web/workspaces.ts
  detail: Workspace creation flow and ownership assignment.
  confidence: verified
```

```pbc:grounding
anchor: WRK-BHV-001
questions:
  - Should a viewer ever be allowed to create a personal workspace?
decision: discuss
```
````

---

## 17. Non-Goals for v0.6

`v0.6` does not try to solve:

- fully automatic repo-to-PBC generation
- a universal ontology for every software/system category
- replacing human review with deterministic checks alone
- treating claim graphs as the primary authored model
- turning PBC into a generic config language
- making line numbers the primary contract identity

It focuses on a narrower goal:

```text
Keep Markdown-first PBCs trustworthy while adding semantic anchors,
attached supporting context, and a cleaner path for declarative config.
```
