# PBC Spec

Product Behavior Contract (PBC) is a Markdown-first specification format for
describing what a product promises to do.

PBC is meant to sit in the shared space between product, engineering, QA, and
design:

- product-facing enough to read as a real contract
- structured enough to parse, lint, normalize, and project
- flexible enough to start in fluent Markdown and become more formal over time

## What PBC Is

PBC is a format for authoring the canonical `WHAT` layer of a product:

- behaviors
- rules
- states
- actors
- workflows
- stable declarative configuration that materially affects behavior

PBC is designed to combine useful parts of DDD, BDD, PRDs, and structured
specification without collapsing into any one of them.

Short version:

```text
PRD explains why.
PBC specifies what.
Code/tests/runtime prove how.
```

## Why PBC Exists

Most teams already have PRDs, tickets, design notes, tests, and code.
What they often lack is a canonical authored `WHAT` layer for product behavior:
one place that states what the product promises to do in a form that product,
engineering, QA, and tools can all work from.

PBC exists to fill that gap.

The core distinction is:

- CommonMark/GFM solve authoring and rendering.
- PBC gives humans, tools, and agents a typed, lintable contract for what the
  product promises to do.

That means PBC is not just "Markdown with a style guide", and it is not just a
pure YAML/JSON schema either:

- Markdown/GFM alone are too convention-based. Headings and tables stay
  readable, but they do not declare product-behavior meaning strongly enough
  for deterministic validation.
- Pure YAML/JSON are too machine-centered. They carry structure, but lose the
  shared human document surface that product, design, QA, and engineering can
  all review directly.

PBC keeps both:

- Markdown as the readable authored shell
- structured `pbc:*` blocks as the canonical machine-parseable contract surface

This becomes even more important as autonomous coding agents take on more
implementation work. Agents usually have execution context, but not behavioral
context. Without an explicit contract layer, they can build the wrong thing
quickly and confidently. PBC gives them the missing grounding layer: valid
states, rules, transitions, exceptions, and promised outcomes.

For a deeper explanation, see
[docs/philosophy/pbc-markdown-first-direction-v0.md](docs/philosophy/pbc-markdown-first-direction-v0.md).

## Why Markdown-First

PBC uses Markdown as the human authoring shell and fenced `pbc:*` blocks as the
machine-readable contract surface.

That choice is deliberate:

- Markdown stays readable in raw form.
- Structured blocks let tools parse the canonical parts deterministically.
- Teams can keep narrative context, diagrams, and review notes near the
  contract without making prose the canonical data model.
- JSON remains derived output, never the authored source of truth.

PBC is BDD-inspired, but not BDD-constrained. `Given / When / Then` is useful
for atomic behaviors, but PBC does not require the whole document to be
rewritten as Gherkin.

## How Structured Blocks Fit

PBC documents are normal Markdown files with embedded fenced blocks such as:

- `pbc:glossary`
- `pbc:actors`
- `pbc:states`
- `pbc:behavior`
- `pbc:rules`
- `pbc:config`
- `pbc:provenance`
- `pbc:grounding`

This gives authors two layers:

- fluent Markdown for product-facing explanation
- disciplined semantic islands for canonical structure

## What This Repo Contains

- the current draft specification: [docs/specs/pbc-spec-v0.6.md](docs/specs/pbc-spec-v0.6.md)
- the GFM appendix: [docs/specs/pbc-spec-appendix-gfm.md](docs/specs/pbc-spec-appendix-gfm.md)
- a short Markdown-first philosophy note:
  [docs/philosophy/pbc-markdown-first-direction-v0.md](docs/philosophy/pbc-markdown-first-direction-v0.md)
- a quickstart for reading and writing PBCs: [docs/quickstart.md](docs/quickstart.md)
- worked examples: [examples/](examples/)
- a CLI for validation, listing, and stats: [cli/](cli/)
- a browser-based viewer for interactive PBC exploration: [viewer/](viewer/)

## Reference Tooling

This repo ships two reference tools for local evaluation. Both are
intentionally minimal — they exist to prove the format is machine-readable
and to give teams something concrete to run, not as production-grade tools.
Neither is published to a package registry yet; run them locally as shown.

### CLI

Structural validation and inspection for PBC files:

```bash
cd cli && npm install && npm run dev validate ../examples/
cd cli && npm run dev list ../examples/ --type behaviors
cd cli && npm run dev stats ../examples/
cd cli && npm run dev init my-feature.pbc.md
```

> **Note:** This is a reference implementation run via `npm run dev`. It is
> not yet published to npm — `npm i -g @pbc-spec/cli` will not work.

See [cli/README.md](cli/README.md) for full documentation.

### Viewer

A browser-based viewer that parses `pbc:*` blocks and renders them as
interactive panels, SVG state diagrams, and live validation results — from
the same `.pbc.md` file that reads cleanly in any Markdown renderer:

```bash
cd viewer && npm install && npm run dev
```

This gives teams the best of both worlds: technical contributors read and
author in Markdown, while other stakeholders get a richer visual interface —
from the same source file, with no export step.

> **Note:** This is a reference implementation for local exploration. No
> hosted demo is available yet.

See [viewer/README.md](viewer/README.md) for details.

## What This Repo Does Not Contain

This repo is not:

- a hosted runtime or product workflow
- the semantic grounding/runtime workflow
- a general-purpose requirements management system

Current ownership boundary:

- `pbc-spec` owns format, philosophy, examples, CLI tooling, viewer, and versioning
- product/runtime implementation repos own implementation behavior and support

## Read In This Order

1. [STATUS.md](STATUS.md)
2. [docs/quickstart.md](docs/quickstart.md)
3. [docs/specs/pbc-spec-v0.6.md](docs/specs/pbc-spec-v0.6.md)
4. [docs/specs/pbc-spec-appendix-gfm.md](docs/specs/pbc-spec-appendix-gfm.md)
5. [ROADMAP.md](ROADMAP.md)
6. [examples/README.md](examples/README.md)
7. [cli/README.md](cli/README.md)
8. [viewer/README.md](viewer/README.md)

## License

Licensing is path-based. See [LICENSING.md](LICENSING.md) for the full mapping.

- **Spec, docs, examples** — [CC BY-SA 4.0](LICENSE)
- **CLI and viewer** (`cli/`, `viewer/`) — [Apache-2.0](LICENSE-CODE)

## Built On This Format

[Stewie](https://stewie.sh) is the product built on top of this foundation —
AI-powered product analysis, grounding workflows, and living spec synthesis.
Open format, proprietary intelligence.

## Current Phase

This is the first public spec package.

The goal of this repo is to make the format legible, useful, and easy to
evaluate before the engine and hosted runtime are published more broadly.
