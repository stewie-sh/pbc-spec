---
id: pbc-auth-signin-session-access-markdown-first
title: Sign-in & Session Access
context: auth
status: draft
updated: 2026-03-19
tags:
  - example
  - pbc
  - auth
  - sign-in
  - sessions
  - access-control
---

# Sign-in & Session Access

This worked example shows how an authentication and session-management surface
can be modeled in PBC form.

It focuses on sign-in state, session issuance, step-up verification, and
high-sensitivity access checks.

## Scope

- sign-in challenge flow
- authenticated session issuance
- session timeout and renewal policy
- step-up verification for sensitive actions
- account lock behavior after repeated failures

## Non-goals

- identity provider federation details
- password hashing/storage details
- device fingerprinting internals

## Terms

| Term | Definition |
| --- | --- |
| Authenticated session | The active application session for a signed-in user. |
| Step-up verification | An additional verification check required for a sensitive action. |
| Remembered device | A device that may bypass repeat step-up checks for a limited time. |
| Locked account | An account temporarily blocked from new sign-in attempts. |

```pbc:glossary
- term: Authenticated session
  definition: The active application session for a signed-in user.
- term: Step-up verification
  definition: An additional verification check required for a sensitive action.
- term: Remembered device
  definition: A device that may bypass repeat step-up checks for a limited time.
- term: Locked account
  definition: An account temporarily blocked from new sign-in attempts.
```

## Actors

```pbc:actors
- id: account_user
  name: Account user
  type: human
  description: The person attempting to sign in and access protected features.
- id: auth_experience
  name: Authentication experience
  type: system
  description: The product surface that collects credentials and verification challenges.
- id: auth_policy
  name: Authentication policy
  type: system
  description: The policy layer that evaluates sign-in risk, lock state, and access requirements.
```

## States

```pbc:states
- id: signed_out
  definition: No authenticated session currently exists.
  user_access: none
- id: challenge_required
  definition: A sign-in or step-up challenge must be completed before access is granted.
  user_access: limited
- id: authenticated
  definition: A valid session exists and normal product access is allowed.
  user_access: full
- id: locked
  definition: The account is temporarily blocked from starting a new authenticated session.
  user_access: none
```

## Example policy surface

```pbc:config
domain: auth_session_access
objects:
  sign_in:
    max_failed_attempts_before_lock: 5
    lock_duration_minutes: 15
    challenge_methods:
      - password
      - email_code
  session:
    idle_timeout_minutes: 30
    absolute_timeout_hours: 12
    renewal_window_minutes: 10
  step_up:
    remembered_device_days: 14
    required_for:
      - change_email
      - change_password
      - export_workspace_data
      - view_billing_details
```

## Rules

```pbc:rules
- id: AUT-RUL-001
  name: Failed-attempt lock threshold
  rule: New sign-in attempts are blocked temporarily after the configured failed-attempt threshold is reached.
- id: AUT-RUL-002
  name: Sensitive actions require fresh verification
  rule: Sensitive account and data-export actions require step-up verification unless a remembered-device exemption is still valid.
- id: AUT-RUL-003
  name: Idle sessions expire
  rule: An authenticated session expires after the configured idle timeout even if the absolute timeout has not yet been reached.
- id: AUT-RUL-004
  name: Locked accounts cannot create new sessions
  rule: A locked account cannot complete sign-in until the lock window has passed or administrative recovery occurs.
```

## Behaviors

```pbc:behavior
id: AUT-BHV-001
name: Start sign-in challenge
actor: auth_experience
description: The product starts a sign-in challenge when a user submits valid primary credentials for an unlocked account.
```

```pbc:preconditions
- The account exists.
- The account is not currently locked.
- Primary credentials were submitted.
```

```pbc:trigger
The user submits the sign-in form.
```

```pbc:outcomes
- Sign-in enters the challenge-required state.
- A verification challenge is issued using an allowed method.
```

```pbc:behavior
id: AUT-BHV-002
name: Grant authenticated session after successful challenge
actor: auth_policy
description: The policy layer issues an authenticated session when the required sign-in challenge is completed successfully.
```

```pbc:preconditions
- A sign-in challenge is active.
- The submitted challenge response is valid.
```

```pbc:trigger
The user completes the required verification challenge.
```

```pbc:outcomes
- An authenticated session is created.
- The session receives idle and absolute timeout policy.
- Normal product access is granted.
```

```pbc:behavior
id: AUT-BHV-003
name: Require step-up before sensitive action
actor: auth_policy
description: The policy layer blocks sensitive actions until step-up verification is satisfied when a fresh exemption is not present.
```

```pbc:preconditions
- The user already has an authenticated session.
- The requested action is marked as sensitive.
- No valid remembered-device exemption applies.
```

```pbc:trigger
The user attempts a sensitive action such as changing account credentials or exporting data.
```

```pbc:outcomes
- The requested action is paused.
- Step-up verification becomes required.
- The action continues only after successful verification.
```

## Transitions

```pbc:transitions
- from: signed_out
  to: challenge_required
  condition: Valid primary credentials are submitted for an unlocked account.
- from: challenge_required
  to: authenticated
  condition: The required verification challenge succeeds.
- from: challenge_required
  to: locked
  condition: Failed sign-in attempts reach the lock threshold.
- from: authenticated
  to: challenge_required
  condition: A sensitive action requires fresh step-up verification.
- from: authenticated
  to: signed_out
  condition: The user signs out or the session expires.
```

## Example notes

- The methods, thresholds, and timeouts here are illustrative.
- This example keeps sign-in policy compact and does not model every recovery path.
- It does not distinguish between different second-factor methods as separate behavioral variants.
