---
id: pbc-bad-provenance
title: Bad Provenance
status: draft
---

# Bad Provenance

```pbc:behavior
id: BHV-001
name: Test behavior
actor: someone
```

```pbc:preconditions
- Something.
```

```pbc:trigger
Something happens.
```

```pbc:outcomes
- Something results.
```

```pbc:provenance
- kind: code
  detail: Missing ref and confidence.
- kind: test
  ref: some/file.ts
  confidence: maybe_valid
```
