---
id: pbc-permissions-entitlements
title: Permissions & Entitlements
context: permissions
status: draft
updated: 2026-04-05
tags:
  - example
  - pbc
  - permissions
  - entitlements
  - access-control
---

# Permissions & Entitlements

This worked example shows a general permissions + entitlements surface in PBC
form.

The intent is to make the authorization model legible to product, engineering,
and QA while keeping the canonical parts machine-checkable.

## Scope

- permission keys and role bindings
- entitlement gating (paid vs free vs add-on)
- deny-by-default policy
- clear outcomes for allowed vs denied actions

## Non-goals

- storage schema for role assignments
- row-level access policy design
- audit log object model

## Terms

| Term | Definition |
| --- | --- |
| Permission | A named capability check (e.g., `workspace.export`). |
| Role | A named bundle of permissions. |
| Entitlement | A paid or plan-based allowance that gates a permission. |
| Authorization decision | The policy result: allowed or denied (with reason). |

```pbc:glossary
- term: Permission
  definition: A named capability check (for example, workspace.export).
- term: Role
  definition: A named bundle of permissions.
- term: Entitlement
  definition: A paid or plan-based allowance that gates a permission.
- term: Authorization decision
  definition: The policy result for an action request, allowed or denied with a reason.
```

## Actors

```pbc:actors
- id: end_user
  name: End user
  type: human
  description: The person attempting to perform an action on a resource.
- id: admin_user
  name: Admin user
  type: human
  description: The person responsible for role assignment and access administration.
- id: authorization_policy
  name: Authorization policy
  type: system
  description: The policy layer that computes authorization decisions from roles, permissions, and entitlements.
- id: product_surface
  name: Product surface
  type: system
  description: The UI or API layer that requests authorization decisions before performing protected actions.
```

## Example policy surface

```pbc:config
domain: permissions_entitlements
permissions:
  - workspace.view
  - workspace.edit
  - workspace.export
  - billing.view
  - billing.manage
roles:
  owner:
    permissions:
      - workspace.view
      - workspace.edit
      - workspace.export
      - billing.view
      - billing.manage
  member:
    permissions:
      - workspace.view
      - workspace.edit
      - workspace.export
  viewer:
    permissions:
      - workspace.view
entitlements:
  workspace.export:
    required: true
    plans:
      - pro
      - enterprise
```

## Rules

```pbc:rules
- id: PER-RUL-001
  name: Deny by default
  rule: If a permission is not explicitly granted by role, the authorization decision is denied.
- id: PER-RUL-002
  name: Entitlements gate permissions
  rule: If a permission requires an entitlement and the entitlement is not present, the authorization decision is denied even if the role grants the permission.
- id: PER-RUL-003
  name: Decision includes reason
  rule: Authorization decisions include a reason category such as role_denied, entitlement_missing, or allowed.
```

## Behaviors

```pbc:behavior
id: PER-BHV-001
name: Check permission for an action
actor: authorization_policy
description: The policy layer computes an authorization decision for an action request using roles and entitlements.
```

```pbc:preconditions
- A permission key is provided for the action.
- The acting user identity is known.
```

```pbc:trigger
The product surface requests an authorization decision before performing a protected action.
```

```pbc:outcomes
- If the role grants the permission and any required entitlement is present, the decision is allowed with reason allowed.
- If the role does not grant the permission, the decision is denied with reason role_denied.
- If the role grants the permission but a required entitlement is missing, the decision is denied with reason entitlement_missing.
```

```pbc:behavior
id: PER-BHV-002
name: Block export without entitlement
actor: product_surface
description: The product surface blocks an export action when the export entitlement is missing.
```

```pbc:preconditions
- The user has a role that grants workspace.export.
- The workspace.export entitlement is required.
- The entitlement is not present for the current workspace or account.
```

```pbc:trigger
The user attempts to export workspace data.
```

```pbc:outcomes
- The export action does not start.
- The user sees a clear denial message indicating plan or entitlement upgrade is required.
```

```pbc:behavior
id: PER-BHV-003
name: Assign a role to a user
actor: admin_user
description: An admin assigns a role to a user and subsequent authorization decisions reflect the new role bindings.
```

```pbc:preconditions
- The target user exists.
- The role value is one of the declared role keys.
```

```pbc:trigger
The admin selects a role assignment action for a target user.
```

```pbc:outcomes
- The role assignment is stored.
- Subsequent permission checks use the new role binding.
```

