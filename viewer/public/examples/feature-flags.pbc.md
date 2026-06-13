---
id: pbc-feature-flags-rollouts
title: Feature Flags & Rollouts
context: feature_flags
status: draft
updated: 2026-04-05
tags:
  - example
  - pbc
  - feature-flags
  - rollouts
  - configuration
---

# Feature Flags & Rollouts

This worked example shows how teams can author a feature-flag and rollout policy
surface as a Product Behavior Contract.

It treats flags as **stable configuration that materially affects behavior**:
the contract declares how flags are evaluated, what the precedence rules are,
and what happens when a flag is misconfigured or unknown.

## Scope

- feature flag evaluation behavior and precedence
- progressive rollouts (percentage and allowlist)
- safe fallback rules
- a minimal flag lifecycle

## Non-goals

- experimentation statistics design
- identity / segmentation implementation details
- delivery mechanisms (CDN vs config service vs env vars)

## Terms

| Term | Definition |
| --- | --- |
| Feature flag | A named boolean switch that gates product behavior. |
| Rollout | A controlled enabling of a flag over time or audience. |
| Targeting | Rules that decide whether a specific request sees a flag enabled. |
| Kill switch | A fast path to force a flag to disabled across all audiences. |

```pbc:glossary
- term: Feature flag
  definition: A named boolean switch that gates product behavior.
- term: Rollout
  definition: A controlled enabling of a flag over time or audience.
- term: Targeting
  definition: Rules that decide whether a specific request sees a flag enabled.
- term: Kill switch
  definition: A fast path to force a flag to disabled across all audiences.
```

## Actors

```pbc:actors
- id: flag_admin
  name: Flag admin
  type: human
  description: The person responsible for defining, modifying, and monitoring feature flags.
- id: flag_console
  name: Flag console
  type: system
  description: The product surface where a flag admin edits flags and rollout policy.
- id: flag_policy
  name: Flag policy
  type: system
  description: The policy layer that evaluates whether a flag is enabled for a request.
- id: application_runtime
  name: Application runtime
  type: system
  description: The product runtime that requests flag evaluation and branches behavior accordingly.
```

## Flag lifecycle (minimal)

This lifecycle is intentionally lightweight. Many teams will keep flags as pure
configuration without a formal lifecycle. The lifecycle here exists to make
rollout intent explicit and reviewable.

```pbc:states
- id: disabled
  definition: The flag is off for all audiences unless explicitly allowlisted.
  user_access: full
- id: ramping
  definition: The flag is enabled for a subset of audience by configured rollout policy.
  user_access: full
- id: enabled
  definition: The flag is fully on for all audiences.
  user_access: full
- id: killed
  definition: A kill switch forces the flag off regardless of rollout policy.
  user_access: full
```

```pbc:transitions
- from: disabled
  to: ramping
  condition: A rollout policy is set to enable the flag for a subset of audience.
- from: ramping
  to: enabled
  condition: The rollout policy reaches 100% and the flag is confirmed stable.
- from: enabled
  to: disabled
  condition: The flag is intentionally turned off.
- from: ramping
  to: killed
  condition: A kill switch is activated to force the flag off immediately.
- from: enabled
  to: killed
  condition: A kill switch is activated to force the flag off immediately.
- from: killed
  to: disabled
  condition: The kill switch is cleared and the flag returns to normal evaluation.
```

## Example configuration surface

This `pbc:config` block declares the canonical, machine-readable configuration
shape for the feature flag surface.

```pbc:config
domain: feature_flags
flags:
  checkout_v2:
    description: Gate for the new checkout experience.
    default: false
    state: ramping
    rollout:
      mode: percentage
      percentage: 10
    targeting:
      allowlist_user_ids: []
      denylist_user_ids: []
  billing_new_pricing_table:
    description: Gate for showing a new pricing table layout.
    default: false
    state: disabled
    rollout:
      mode: off
      percentage: 0
    targeting:
      allowlist_user_ids: []
      denylist_user_ids: []
```

## Rules

```pbc:rules
- id: FLG-RUL-001
  name: Deny by default for unknown flags
  rule: If a flag key is unknown or missing, it is treated as disabled and evaluation returns an explicit unknown-flag signal.
- id: FLG-RUL-002
  name: Kill switch precedence
  rule: When a flag is in killed state, it evaluates to disabled regardless of rollout or targeting configuration.
- id: FLG-RUL-003
  name: Targeting precedence
  rule: Denylist overrides allowlist; allowlist overrides percentage rollout; rollout overrides default.
- id: FLG-RUL-004
  name: Stable evaluation for a request
  rule: A single request must see a consistent evaluated value for a given flag key.
```

## Behaviors

```pbc:behavior
id: FLG-BHV-001
name: Evaluate a flag for a request
actor: flag_policy
description: The policy layer evaluates whether a feature flag is enabled for a specific request using declared precedence rules.
```

```pbc:preconditions
- A flag key is provided.
- The request has a stable user identity or stable anonymous identity for evaluation.
```

```pbc:trigger
The application runtime requests evaluation for a flag key.
```

```pbc:outcomes
- The evaluation returns enabled or disabled.
- If the key is unknown, the evaluation returns disabled and an unknown-flag signal.
- The evaluation uses precedence order: kill switch > denylist > allowlist > percentage rollout > default.
```

```pbc:behavior
id: FLG-BHV-002
name: Update rollout percentage
actor: flag_console
description: The console updates a flag rollout percentage and the policy layer begins using the new value for subsequent evaluations.
```

```pbc:preconditions
- The flag key exists.
- The rollout mode is percentage.
```

```pbc:trigger
The flag admin changes the rollout percentage for a flag.
```

```pbc:outcomes
- The new percentage is stored as configuration for the flag.
- Subsequent evaluations use the updated rollout percentage.
```

```pbc:behavior
id: FLG-BHV-003
name: Activate kill switch
actor: flag_console
description: The console activates a kill switch that forces a flag to evaluate as disabled across all audiences.
```

```pbc:preconditions
- The flag key exists.
```

```pbc:trigger
The flag admin activates the kill switch for a flag.
```

```pbc:outcomes
- The flag enters killed state.
- Subsequent evaluations return disabled regardless of rollout and targeting settings.
```

