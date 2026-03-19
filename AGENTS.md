# Project Instructions

## Scope

This repo is the public home for the Product Behavior Contract (PBC) format.

It exists to publish:

- the specification
- philosophy and authoring direction
- worked examples
- roadmap and versioning context
- reference tooling for local evaluation (CLI and viewer)

## Boundaries

- Keep this repo self-contained and public-facing.
- Do not turn this repo into the deterministic engine implementation.
- Do not turn this repo into the hosted runtime or product workflow repo.
- Do not import private planning notes, handoff docs, or scratchpad material.

## Canonical Ownership

- `pbc-spec`
  - canonical for format, philosophy, examples, and versioning
- implementation repo(s)
  - canonical for deterministic implementation behavior, tests, fixtures, and
    support status

## Spec/Engine Coordination

- `pbc-spec` leads on meaning, examples, and versioning.
- implementation repo(s) declare implementation support.
- Do not silently redefine the spec from engine behavior.
- Raise implementation-driven spec changes explicitly.
- Classify material spec changes as `docs_only`, `additive`,
  `behavior_affecting`, or `breaking`.

## Reference Tooling

`cli/` and `viewer/` are reference tooling included in this repo for local
evaluation. They are **not yet published as standalone packages**.

- Do not document them as npm-installable until they are published.
- Frame them as local dev tools and evaluation aids, not products.
- When release cycles diverge from the spec, move them to a separate tooling
  repo under Apache-2.0.

## Licensing

This repo uses path-based licensing. See `LICENSING.md` for the full map.

- `docs/`, `examples/`, root Markdown files: **CC BY-SA 4.0**
- `cli/`, `viewer/`: **Apache-2.0**

Do not apply a single repo-wide license. Do not change this shape without
updating `LICENSE`, `LICENSE-CODE`, `LICENSING.md`, both `package.json` files,
`README.md`, and `CONTRIBUTING.md` together.

## Public Surface Guardrails

Before any public push, scan for private product concepts that must not appear
in this repo. Run:

```bash
grep -rn "Stewie\|contract-sentinel\|stewie-pbc-engine\|Supabase\|semantic bootstrap\|founder brief\|beta readout\|grounding queue\|trust blocker" \
  --include="*.md" --include="*.ts" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist .
```

These terms are acceptable in `*.override.md` files (gitignored) but must not
appear in tracked files.

What belongs here vs not:

- **OK:** provenance, grounding, evidence — as general supporting PBC concepts
- **Not here:** claims as primary model, trust blockers, grounding queues,
  semantic bootstrap artifacts, runtime/orchestration internals, Stewie-specific
  workflow or reasoning concepts

## Viewer and Examples Sync

`viewer/public/examples/` is a copy of `examples/` served by the static viewer.
When any file in `examples/` changes, copy it to `viewer/public/examples/` too.
The build does not do this automatically.

## Intentional Deferrals

These decisions were explicitly made and should not be re-litigated without
a clear reason:

- **No JSON/YAML schema yet.** The CLI validator is the de facto schema at
  draft stage. Add a formal schema when the format stabilizes toward v1.0.
- **No repo split yet.** CLI and viewer stay here until release cycles
  diverge or the CLI is published to npm. The trigger is operational, not
  architectural.
- **No hosted viewer yet.** The viewer is a local static tool. Deploy it
  separately when it becomes a product surface.

## Read First

1. `README.md`
2. `LICENSING.md`
3. `STATUS.md`
4. `docs/quickstart.md`
5. `docs/specs/pbc-spec-v0.6.md`
6. `ROADMAP.md`
7. `examples/README.md`
