---
id: pbc-workspaces-roles-markdown-first
title: Workspaces & Roles
context: workspaces
status: draft
updated: 2026-03-17
tags:
  - example
  - pbc
  - workspaces
  - roles
  - permissions
---

# Workspaces & Roles

This worked example shows how a workspace roles and permissions surface can be
modeled in PBC form.

It focuses on human-facing roles, capability boundaries, and role-related
policy rules.

## Scope

- current human-facing roles
- capability boundaries
- ownership and membership management rules
- data export and audit access permissions

## Non-goals

- full invite lifecycle
- archive/restore workflow details
- row-level policy implementation details

## Terms

| Term | Definition |
| --- | --- |
| Owner | The workspace role with full administrative control. |
| Member | A workspace collaborator with day-to-day operational access. |
| Viewer | A read-only collaborator. |
| Compat admin | A backward-compatible role value treated like owner for migration purposes. |

```pbc:glossary
- term: Owner
  definition: The workspace role with full administrative control.
- term: Member
  definition: A workspace collaborator with day-to-day operational access.
- term: Viewer
  definition: A read-only collaborator.
- term: Compat admin
  definition: A backward-compatible role value treated like owner for migration purposes.
```

## Actors

```pbc:actors
- id: workspace_owner
  name: Workspace owner
  type: human
  description: The person who controls workspace members, settings, and billing.
- id: workspace_member
  name: Workspace member
  type: human
  description: A collaborator who can do day-to-day operational work.
- id: workspace_viewer
  name: Workspace viewer
  type: human
  description: A collaborator who can read workspace data but cannot trigger writes.
- id: workspace_permission_policy
  name: Workspace permission policy
  type: system
  description: The policy layer that enforces role-based capability differences.
```

## Example role matrix

| Action | Owner | Member | Viewer |
| --- | --- | --- | --- |
| Create workspace | Yes | No | No |
| Invite teammates | Yes | No | No |
| Change member roles | Yes | No | No |
| Remove members | Yes | No | No |
| View workspace data | Yes | Yes | Yes |
| Upload/import documents | Yes | Yes | No |
| Edit workspace data | Yes | Yes | No |
| Export workspace data | Yes | Yes | No |
| View workspace audit history | Yes | Yes | No |
| Change workspace settings | Yes | No | No |

```pbc:config
domain: workspace_roles
objects:
  owner:
    can_create_workspace: true
    can_manage_members: true
    can_view_workspace_data: true
    can_upload_documents: true
    can_edit_workspace_data: true
    can_export_workspace_data: true
    can_view_workspace_audit_history: true
    can_change_workspace_settings: true
  member:
    can_create_workspace: false
    can_manage_members: false
    can_view_workspace_data: true
    can_upload_documents: true
    can_edit_workspace_data: true
    can_export_workspace_data: true
    can_view_workspace_audit_history: true
    can_change_workspace_settings: false
  viewer:
    can_create_workspace: false
    can_manage_members: false
    can_view_workspace_data: true
    can_upload_documents: false
    can_edit_workspace_data: false
    can_export_workspace_data: false
    can_view_workspace_audit_history: false
    can_change_workspace_settings: false
  compat_admin:
    treated_as: owner
```

## Rules

```pbc:rules
- id: WRK-RUL-001
  name: Single owner model
  rule: Each workspace currently has exactly one owner and ownership transfer is not supported.
- id: WRK-RUL-002
  name: Owner self-protection
  rule: Owners cannot remove or demote themselves from their own workspace.
- id: WRK-RUL-003
  name: Viewer is read-only
  rule: Viewers can view workspace data but cannot trigger write actions.
- id: WRK-RUL-004
  name: Compat admin mapping
  rule: The compat admin role value is treated as equivalent to owner during compatibility transitions.
```

## Behaviors

```pbc:behavior
id: WRK-BHV-001
name: Owner invites a teammate
actor: workspace_owner
description: The workspace owner creates and sends a workspace invite to another person.
```

```pbc:preconditions
- The acting user is an owner for the workspace.
- The workspace exists and is accessible.
```

```pbc:trigger
The owner confirms the invitation action from workspace member settings.
```

```pbc:outcomes
- A workspace invite is created for the target email.
- The invite can later be accepted, declined, or expire.
```

```pbc:behavior
id: WRK-BHV-002
name: Viewer is blocked from exporting workspace data
actor: workspace_permission_policy
description: The permission layer denies data export actions for viewer-role users.
```

```pbc:preconditions
- The acting user is a viewer for the workspace.
- The acting user attempts to export workspace data.
```

```pbc:trigger
The viewer selects the workspace data export action.
```

```pbc:outcomes
- The export action is denied.
- No data export is started.
```

## Example notes

- This version keeps capabilities as booleans and does not make role variants
  very explicit.
- It does not distinguish capability denial reasons such as `role_blocked`
  versus `billing_locked`.
