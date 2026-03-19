# @pbc-spec/cli

CLI tooling for [Product Behavior Contract (PBC)](../README.md) files.

## Usage

This CLI is currently local reference tooling, not yet published to npm.
Run it directly from this repo:

```bash
cd cli && npm install
npm run dev -- validate ../examples/
npm run dev -- list ../examples/ --type behaviors
npm run dev -- stats ../examples/
npm run dev -- init my-feature.pbc.md
```

## Commands

### `pbc validate [files...]`

Validate PBC files for structural correctness.

```bash
pbc validate examples/
pbc validate examples/billing.pbc.md
pbc validate . --format json
```

Checks include:

| ID | Severity | Description |
|----|----------|-------------|
| E001 | error | Missing YAML frontmatter |
| E002 | error | Frontmatter missing required `id` |
| E003 | error | Frontmatter missing required `title` |
| E004 | error | Unrecognized `pbc:*` block type |
| E005 | error | YAML parse failure inside a block |
| E006 | error | Duplicate semantic IDs within a file |
| E007 | error | `pbc:behavior` missing `id` |
| E008 | error | `pbc:behavior` missing `name` |
| E009 | error | Transition references unknown state |
| E010 | error | Behavior references unknown actor |
| E011 | error | Invalid provenance `confidence` value |
| W001 | warning | Missing recommended `status` field |
| W002 | warning | Missing recommended `updated` field |
| W003 | warning | No `pbc:*` blocks found |
| W004 | warning | `pbc:rules` entry missing `id` |
| W005 | warning | `pbc:states` entry missing `id` |
| W006 | warning | `pbc:actors` entry missing `id` |
| W007 | warning | `pbc:provenance` entry missing `ref` |
| W008 | warning | Behavior has no companion blocks |
| W009 | warning | `pbc:config` nesting too deep |
| W010 | warning | Behaviors without provenance |
| W011 | warning | Non-standard `status` value |

Exit code 0 if no errors (warnings are OK). Exit code 1 if any errors found.

### `pbc list [files...]`

List all contract units from PBC files.

```bash
pbc list examples/
pbc list examples/ --type behaviors
pbc list examples/ --type states --format json
```

Options:

- `--type <type>` — filter by block type (`behavior`, `states`, `actors`, `rules`, `glossary`, `config`, `workflow`, `all`)
- `--format <format>` — output format (`text`, `json`)

### `pbc stats [files...]`

Show aggregate statistics for PBC files.

```bash
pbc stats examples/
pbc stats . --format json
```

### `pbc init [filename]`

Scaffold a new PBC file with valid frontmatter and starter blocks.

```bash
pbc init billing-subscriptions.pbc.md
```

## Development

```bash
cd cli
npm install
npm test           # run tests
npm run dev -- validate ../examples/   # run without building
npm run build      # compile TypeScript
```

## License

[Apache-2.0](../LICENSE-CODE) — see [LICENSING.md](../LICENSING.md) for the full path map.
