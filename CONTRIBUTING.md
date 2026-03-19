# Contributing

Thank you for your interest in contributing to the PBC specification.

## How to Contribute

### Reporting Issues

If you find a problem with the spec, examples, or documentation, please open an
issue in the repository issue tracker. Include:

- what you expected
- what you found instead
- a link to the relevant section if applicable

### Suggesting Changes

1. Fork the repository.
2. Create a branch from `main`.
3. Make your changes.
4. Open a pull request with a clear description of what changed and why.

### What We're Looking For

- clarity improvements to the spec or examples
- new worked examples that demonstrate PBC in different domains
- corrections to errors or inconsistencies
- documentation improvements

### What Doesn't Belong Here

This repo contains the spec, examples, and reference tooling (CLI and viewer).
It is not:

- the deterministic engine implementation
- the hosted runtime or product workflow
- a general-purpose requirements tool

See [README.md](README.md) for the full scope.

## Style Guidelines

- Write in clear, direct prose.
- Keep Markdown clean and readable in raw form.
- Follow the existing structure and conventions in the repo.
- Prefer small, focused pull requests over large sweeping changes.

## Spec Change Classification

Material changes to the specification should be classified as one of:

- **docs_only** — wording, formatting, or documentation improvements
- **additive** — new blocks, fields, or conventions that don't break existing usage
- **behavior_affecting** — changes that alter how existing PBC content is interpreted
- **breaking** — changes that invalidate previously valid PBC documents

Please note the classification in your pull request description.

## License

This repository uses path-based licensing. See [LICENSING.md](LICENSING.md)
for the full mapping.

- Spec, docs, and examples — CC BY-SA 4.0
- CLI and viewer (`cli/`, `viewer/`) — Apache-2.0

By contributing, you agree that your contributions will be licensed under the
terms applicable to the path you are contributing to.
