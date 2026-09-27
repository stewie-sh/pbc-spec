---
id: pbc-rejection-test
title: Retained decisions
status: draft
updated: "2026-09-27"
---

```pbc:actors
- id: user
  name: User
  type: human
```

```pbc:states
- id: ready
  definition: Ready for a decision.
- id: stopped
  definition: Stopped by a gate.
```

```pbc:rules
- id: TEST-RUL-001
  name: Rejected gate
  rule: Stop all requests.
  trust: rejected
  rejected_reason: Valid requests must remain possible.
  rejected_ref: decisions.md#gate-review
- id: TEST-RUL-002
  name: Current gate
  rule: Record the decision.
  trust: trusted
```

```pbc:behavior
id: TEST-BHV-001
name: Stop all requests
actor: user
trust: rejected
rejected_reason: The unconditional stop was overruled.
rejected_ref: decisions.md#gate-review
```

```pbc:trigger
A request arrives.
```

```pbc:outcomes
- The request stops.
```

```pbc:transitions
- from: ready
  to: stopped
  condition: A request arrives.
```

```pbc:provenance
- kind: review
  ref: decisions.md#gate-review
  confidence: assumed
```
