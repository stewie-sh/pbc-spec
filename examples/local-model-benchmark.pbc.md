---
id: pbc-local-model-benchmark
title: Local Model Benchmark - Placement and Rejected Gates
context: local-model-benchmark
status: draft
updated: 2026-09-26
tags:
  - benchmark
  - local-models
  - gpu
  - rejected-rule
---

# Local Model Benchmark - Placement and Rejected Gates

A benchmark runner evaluates locally hosted language models across several
machines. Each run loads a model on a host, executes a task, grades it, and
records a result row.

This example shows a rule that was **considered and rejected**, kept in the
contract next to the rules that replaced it. An agent re-derived the rejected
gate from the code in later sessions. Keeping the rejection, its reason and its
decision reference in the file is what stops it from coming back.

## Scope

- Loading a local model on a benchmark host and recording where it was placed.
- Deciding whether a run proceeds, based on its measured placement.
- Recording placement evidence with every result row.

## Non-goals

- Tuning model placement, GPU power limits, or device visibility.
- Comparing hosts with different hardware as if they were one measurement.

## Terms

| Term | Definition |
| --- | --- |
| Placement | Where a loaded model's bytes reside, in GPU VRAM or system RAM, and on which cards. |
| Partial placement | A model with some of its bytes in system RAM instead of VRAM. |
| Parity profile | A host profile with two identical discrete cards, used to compare cards against each other. |

```pbc:glossary
- term: Placement
  definition: Where a loaded model's bytes reside, in GPU VRAM or system RAM, and on which cards.
- term: Partial placement
  definition: A model with some of its bytes in system RAM instead of VRAM.
- term: Parity profile
  definition: A host profile with two identical discrete cards, used to compare cards against each other.
```

## Actors

```pbc:actors
- id: runner
  name: Benchmark runner
  type: system
  description: Loads the model, executes the task, grades the result, and writes the result row.
- id: owner
  name: Benchmark owner
  type: human
  description: Decides which gates apply and records rulings, including rejections.
```

## States

```pbc:states
- id: loaded
  definition: The model is loaded on the host and its placement has been measured.
  user_access: none
- id: running
  definition: The task is executing against the loaded model.
  user_access: none
- id: recorded
  definition: The graded result row is written together with its placement evidence.
  user_access: none
- id: refused
  definition: The run was stopped before execution by an active gate, with the reason recorded.
  user_access: none
```

## Rules

`LMB-RUL-001` is rejected. It stays here so the ruling is visible to the next
author or agent, but it is never enforced. `LMB-RUL-002` is the rule that
replaced it. `LMB-RUL-003` is a narrower, still-active condition that is easy to
confuse with the rejected one: it is scoped to one host profile and is about
card count, not about partial placement being a disqualifier in general.

```pbc:rules
- id: LMB-RUL-001
  name: Full GPU Residency Required
  rule: A model must run fully GPU-resident to be benchmarked; any spill to system RAM stops the run.
  trust: rejected
  rejected_reason: Logged placement is the gate. Partial placement is recorded with the result row, not disqualifying; a partly spilled model can still be fast, and this gate blocked runs that were already proven.
  rejected_ref: "Owner ruling, 2026-09; stewie-sh/pbc-spec#12"
- id: LMB-RUL-002
  name: Placement Is Logged
  rule: Every result row records the measured placement at run time, meaning bytes in VRAM, total model bytes, and the cards used. A row without placement evidence is incomplete.
  trust: trusted
- id: LMB-RUL-003
  name: Single-Card Residency on the Parity Profile
  rule: On a host run under the parity profile, the model must be resident on exactly one card, with at least 90% of its bytes in that card's VRAM, or the run is refused. A model split across both cards is a different measurement, not a slower one. This does not apply to other profiles.
  trust: trusted
```

## Behaviors

```pbc:behavior
id: LMB-BHV-001
name: Record placement with the result
actor: runner
description: After loading a model, the runner measures its placement and writes that measurement into the result row, whatever the placement is. Governed by LMB-RUL-002.
trust: trusted
```

```pbc:preconditions
- The model is loaded on the host.
- The runner can query the model server for loaded-model placement.
```

```pbc:trigger
A model finishes loading for a benchmark run.
```

```pbc:outcomes
- The result row includes VRAM bytes, total bytes, and cards used.
- Partial placement is recorded, and the run proceeds.
```

```pbc:behavior
id: LMB-BHV-002
name: Refuse a split model on the parity profile
actor: runner
description: On the parity profile only, the runner refuses a run whose model is spread across both cards or is below 90% resident on one card, and records why. Governed by LMB-RUL-003.
trust: trusted
```

```pbc:preconditions
- The host is running under the parity profile.
- Placement has been measured for the loaded model.
```

```pbc:trigger
Measured placement shows allocation on more than one card, or under 90% of the model's bytes in one card's VRAM.
```

```pbc:outcomes
- The run is refused before execution.
- The refusal reason and the measured placement are recorded.
```

## Transitions

```pbc:transitions
- from: loaded
  to: running
  trigger: Placement is recorded and no active gate refuses the run.
- from: loaded
  to: refused
  trigger: LMB-RUL-003 applies and the measured placement fails it.
- from: running
  to: recorded
  trigger: The task finishes and is graded.
```

## Provenance

```pbc:provenance
- ref: https://github.com/stewie-sh/pbc-spec/issues/12
  confidence: verified
  note: Proposal and worked case for the rejected trust level; records why LMB-RUL-001 was overruled.
```
