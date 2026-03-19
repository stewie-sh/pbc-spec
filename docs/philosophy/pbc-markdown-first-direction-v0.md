# PBC Markdown-First Direction

**Status:** working direction  
**Date:** March 2026

## Purpose

This note explains the working Markdown-first direction behind PBC.

The direction is:

- Markdown-first for product memory and behavior contracts
- structured JSON as derived operational artifacts
- stricter machine enforcement only after a behavior/spec is mature enough

This is a change in **authoring and stewardship center**, not a rejection of structure.

## Why PBC Exists

Most teams already have many artifacts that describe a product indirectly:

- PRDs
- tickets
- design notes
- tests
- code
- runbooks and implementation docs

What they often do not have is a canonical authored `WHAT` layer for product
behavior: one place that states what the product promises to do in a form that
humans can read and tools can reason about.

That is the role PBC is trying to fill.

Short version:

```text
PRD explains why.
PBC specifies what.
Code/tests/runtime prove how.
```

PBC only deserves to exist if it gives teams something meaningfully stronger
than ordinary documentation:

- clearer product-behavior semantics than prose alone
- better separation between `WHY`, `WHAT`, and `HOW`
- progressive formalization rather than day-one schema rigidity
- eventual deterministic value without losing raw-document readability

## Why Not Just CommonMark or GFM

CommonMark and GFM are the authoring substrate, not the contract model.

They solve:

- readable raw documents
- headings, lists, tables, and diagrams
- portable rendering across common tooling

They do not by themselves solve:

- what counts as a behavior
- what counts as a rule
- what counts as a state transition
- what is canonical contract versus supporting context
- what should be machine-checkable

The clean distinction is:

- CommonMark/GFM solve authoring and rendering.
- PBC adds the product-behavior contract model.

### Style Guide vs Structure

A Markdown style guide can tell authors to put states under `## States` and
rules under `## Rules`.

That is useful, but still convention-driven.

A heading can contain anything:

- a paragraph
- a table
- a mixed list
- stale notes
- a partly-updated draft

The meaning is inferred socially, not declared structurally.

PBC tries to move important contract units from convention to declaration.

When a document uses `pbc:*` blocks, tooling can recognize intended semantic
types directly rather than guessing from layout.

### Concrete Example: State Tables vs Typed State Blocks

A GFM table can describe states and transitions clearly for a human reader.

But a table alone does not declare:

- that this is the canonical state list
- that a second table elsewhere is a transition graph
- that a transition references only declared states
- that the document is internally consistent

With explicit `pbc:states` and `pbc:transitions` blocks, those meanings become
structural rather than purely visual.

That difference is what makes later validation, linting, normalization, and
projection possible.

## Why Not Pure YAML or JSON

Pure YAML or JSON can be strongly machine-parseable, but they lose the shared
human document surface.

That matters because the authored product contract is not only for parsers. It
must still be reviewable by product, engineering, QA, design, and other humans
in raw form.

Pure structured data tends to become:

- config-like
- engineer-centered
- harder to read as a contract page
- weaker at carrying narrative, rationale, diagrams, and review context

PBC keeps a dual-layer model instead:

- Markdown for the readable authored shell
- structured `pbc:*` blocks for canonical machine-parseable meaning

JSON should remain derived from authored Markdown, not replace it.

## What "First-Class Product Behavior" Means

Product behavior becomes first-class when it is not only described in prose,
but expressed in a form that other tools and workflows can operate on.

In practice, that means behaviors, states, rules, and transitions can become:

- extractable
- lintable
- diffable
- queryable
- composable
- comparable against implementation evidence

Without that, behavior stays trapped inside prose and formatting conventions.
With it, behavior becomes a durable contract surface rather than just a
well-written document.

## Why This Matters More In The Agent Era

Autonomous coding agents make this problem sharper, not different.

Teams already needed a canonical behavioral contract layer before agentic
development became common. But once implementation work is delegated to agents,
the cost of missing behavioral context rises sharply.

Agents often have:

- execution context
- repository context
- issue or task context

What they often lack is behavioral context:

- which states are valid
- which rules must always hold
- which transitions are allowed
- which exceptions matter
- what the product has already promised to users

Without that layer, an agent can implement the wrong thing correctly at high
speed.

PBC is one answer to that gap. It gives humans first, and then tools and
agents, a typed contract surface for product behavior rather than leaving
behavior trapped in prose, conventions, tickets, or implementation details.

## Core Model

### 1. Central layer: `WHAT`

The central source of truth is product behavior and product contract memory, authored primarily as Markdown.

Primary artifact:

- PBC: Product Behavior Contract

This layer should express:

- what the product promises
- user-visible behaviors
- business rules and constraints
- state transitions
- exceptions
- open questions
- rationale when known

### 2. Evidence layer: `HOW`

Source code, repositories, configs, runtime artifacts, tests, and existing docs act as evidence.

This layer supports:

- grounding product behavior against implementation
- estimating confidence
- detecting divergence
- deriving machine-friendly signals

The `HOW` layer is not the product-facing source of truth. It is the strongest evidence for current implementation reality.

### 3. Rationale layer: `WHY`

Rationale is primarily human-supplied or human-confirmed.

Examples:

- product goals
- tradeoffs
- business constraints
- design justifications

`WHY` should normally support the contract rather than replace it as the
semantic center.

## Progressive Formalization

PBC should not force rigid structure too early.

Use this maturity path:

1. **Exploration**
   - Markdown-first
   - flexible
   - provisional
   - partial top-down / bottom-up connections are expected

2. **Stabilization**
   - stable IDs
   - stronger section conventions
   - clearer cross-links
   - more explicit confidence and grounding

3. **Enforcement**
   - derived JSON contracts
   - tests
   - drift checks
   - locked behavior guards

## Memory vs Signals vs Enforcement

The system should be understood in 3 layers.

### Memory layer

Human/LLM-friendly source artifacts:

- PBC Markdown files
- notes
- decisions
- questions
- indexes
- glossary entries

This is the living memory of product understanding.

### Signal layer

Derived structure:

- observations
- assumptions
- contract candidates
- concepts
- workflow signals
- projections for UI and tooling

This layer is machine-friendly and can be regenerated.

### Enforcement layer

Strict operational outputs:

- drift checks
- tests
- locked contracts
- alerts
- validation artifacts

## Naming Direction

Do not over-center the new model on the old generic term `claim`.

Prefer more concrete concepts:

- evidence
- observation
- assumption
- hypothesis
- question
- behavior
- contract
- decision
- rationale

`Claim` may remain as an internal extracted signal term if useful, but it
should not be the primary product-facing noun in the public format.

## Markdown Structure Principles

Markdown is the primary authoring surface, but it still needs discipline.

### Recommended metadata layers

1. **Frontmatter**
   - identity
   - version
   - status
   - confidence
   - grounding status
   - owners
   - tags
   - parents/children/related refs

2. **Inline callouts**
   - assumptions
   - questions
   - rationale
   - divergence notes

3. **Derived sidecars**
   - extracted JSON
   - normalized anchors
   - machine-oriented traceability

### Connection mechanisms

Do not rely only on tags.

Use 4 connection mechanisms:

1. explicit links / references
2. tags / facets
3. parent-child and index structure
4. shared glossary terms

## Decomposition and Aggregation

The product should start simple and split as complexity grows.

### Decomposition

Start with a root product spec and split into child specs when boundaries become meaningful, for example:

- capability
- workflow
- bounded context
- pricing / entitlements
- integration
- lifecycle / state machine

### Aggregation

The reverse operation is aggregation:

- summarize many child specs into a higher-level view
- select an aggregate root / representative document
- hide detail while retaining references back down

This allows the model to support both:

- top-down product understanding
- bottom-up evidence grounding

## Alignment Expectations

Do not assume early seamless alignment between:

- top-down intent/spec
- bottom-up implementation reality

Early stages should explicitly allow:

- gaps
- partial links
- inferred bridges
- unresolved questions
- contradictions
- deferred clarification

Higher coherence is a later-stage property of a mature product.

## Immediate Priorities

This direction focuses on:

1. defining a disciplined Markdown-first PBC authoring model
2. defining split/index/link conventions for a spec tree
3. deriving structured artifacts from Markdown, not the reverse
4. deciding which existing JSON/claim artifacts remain useful as derived signals only

## Public Framing Note

This note is a philosophy companion to the draft spec, not a separate competing
standard. The canonical public draft lives in `docs/specs/pbc-spec-v0.6.md`.

Use this direction note for:

- architectural center of gravity
- naming and layering decisions
- public framing of the Markdown-first model
