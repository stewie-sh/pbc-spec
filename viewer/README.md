# PBC Viewer

A browser-based viewer for Product Behavior Contract (`.pbc.md`) files.

## The Key Idea

A `.pbc.md` file is valid Markdown — it reads cleanly in any Markdown renderer
(GitHub, VS Code, a wiki, even `cat`). Engineers can author and review it as
plain text, in the tools they already use.

The viewer unlocks what the structured `pbc:*` blocks make possible: the same
file, rendered as an interactive visual contract. No export step. No separate
format. One source of truth, two experiences:

| Audience | How they read it |
|---|---|
| Engineers, PMs authoring or reviewing | Markdown preview — any editor or GitHub |
| Stakeholders exploring the contract | PBC Viewer — visual panels, state diagrams, validation |

## What It Renders

- **Header** — frontmatter metadata (id, status, version) with status badges
- **Validation** — live error and warning results across the document
- **Glossary** — term/definition pairs from `pbc:glossary`
- **Actors** — card grid with type badges (human / system / external)
- **States** — table + SVG state diagram with transition edges
- **Behaviors** — expandable accordion cards grouping each `pbc:behavior` with
  its preconditions, trigger, outcomes, events, transitions, and exceptions
- **Rules** — table from `pbc:rules`
- **Configuration** — collapsible tree from `pbc:config`

Clicking a state or actor highlights related elements across all panels.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The billing example loads
automatically. Switch examples from the dropdown or drop in any `.pbc.md` file.

## Build

```bash
npm run build   # outputs to dist/
```

The build output is a fully static site — no server required. Deploy to any
static host (GitHub Pages, Netlify, etc.).

## Architecture

The viewer is vanilla TypeScript + Vite with no framework. It reuses the parser
and validator from [`../cli/src`](../cli/src) directly via a Vite alias (`@cli`),
shimming Node-only modules (`node:fs`) so the same logic runs in the browser.
All rendering is DOM-first — no virtual DOM, no runtime dependencies beyond
what Vite bundles.
