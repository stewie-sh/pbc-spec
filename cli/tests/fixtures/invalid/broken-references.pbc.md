---
id: pbc-broken-refs
title: Broken References
status: draft
---

# Broken References

```pbc:states
- id: active
  definition: Active state.
  user_access: full
- id: inactive
  definition: Inactive state.
  user_access: none
```

```pbc:actors
- id: admin
  name: Admin
  type: human
  description: An admin.
```

```pbc:transitions
- from: active
  to: nonexistent_state
  condition: Something happens.
- from: ghost_state
  to: inactive
  condition: Something else.
```

```pbc:behavior
id: BHV-001
name: Test behavior
actor: nonexistent_actor
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
