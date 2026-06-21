---
id: pbc-external-export-confidence
title: External Export Confidence Boundary
status: draft
---

# External Export Confidence Boundary

Regression fixture: an external manual/export generator emits provenance `confidence`
values outside the spec's allowed set (`verified` | `inferred` | `assumed`). Locks the
E011 enum boundary so vendor-shaped exports cannot drift in non-standard values.

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
  ref: external-export/case-a.ts
  confidence: reviewed
  detail: External generator emitted an out-of-spec confidence value.
- kind: code
  ref: external-export/case-b.ts
  confidence: open
  detail: External generator emitted an out-of-spec confidence value.
```
