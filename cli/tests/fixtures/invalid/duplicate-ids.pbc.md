---
id: pbc-duplicates
title: Duplicate IDs
status: draft
---

# Duplicate IDs

```pbc:actors
- id: user_alpha
  name: User Alpha
  type: human
  description: First actor.
```

```pbc:behavior
id: user_alpha
name: This duplicates the actor ID
actor: user_alpha
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
