---
id: pbc-tennis-agent
title: TennisAgent — Parent System Charter
context: tennis-agent
status: draft
updated: 2026-06-20
tags:
  - tennis
  - parent-charter
  - sensor-fusion
  - composition
anchor: tennis-agent
---

# TennisAgent — Parent System Charter

TennisAgent is a unified sensor-fusion and analysis system where an Apple Watch acts as a replacement for a Babolat POP wristband, using a racquet-mounted Zepp sensor as the training supervisor. The system extracts pre-contact features from 100Hz raw Watch accelerometer and gyroscope signals, trains prediction models, and validates the replacement quality against Babolat POP records.

This is a **parent (root) charter**. It owns the cross-cutting fusion, classification, and replacement-validation contract, and it **composes** a verified leaf charter — the Apple Watch ↔ Zepp alignment spec — via `pbc:include` rather than restating the leaf's internal rules. The leaf owns the *how* of producing aligned, supervised training pairs; the parent owns *what* the fused product promises on top of them.

## Scope

- Unified data access via `TennisDataClient` exposing Apple Watch, Zepp, and Babolat POP databases.
- Stroke classification (Serve / Forehand / Backhand) and Spin labeling (Flat / Topspin / Slice).
- Training POP replacement models on 15 pre-contact features from raw 100Hz Watch accelerometer and gyroscope streams, supervised by Zepp.
- Validating Apple Watch predictions against Babolat POP records (shot type, spin type, speed, PIQ score) to evaluate replacement quality.
- Composing the temporal-alignment leaf (`aw-zepp-alignment.pbc.md`) that produces the matched swing pairs this parent's models consume.

## Non-goals

- Golf, Garmin, or Proximity sensor agents (separate roots / domains).
- Real-time / in-match stroke notification (post-session only).
- Simultaneous wear of Babolat POP and Apple Watch sensors during training runs.
- Restating the leaf's alignment rules here — those stay owned by the included child (see `pbc:include`).

## Composition

This root composes one verified child charter. Ownership is explicit: the `owns` list names the leaf rules the parent delegates downward, so the contract tree has no overlap or silent duplication.

```pbc:include
- path: aw-zepp-alignment.pbc.md
  summary: Apple Watch to Zepp temporal alignment and supervised training-data construction — the leaf that produces the matched swing pairs feeding this parent's POP replacement models.
  owns:
    - AW-ZEPP-RUL-001
    - AW-ZEPP-RUL-002
    - AW-ZEPP-RUL-003a
    - AW-ZEPP-RUL-003b
    - AW-ZEPP-RUL-004
  status: draft
```

## Terms

| Term | Definition |
| --- | --- |
| Stroke label | The classification of a tennis swing (Forehand, Backhand, or Serve). |
| Spin label | The classification of swing spin (Flat, Slice, or Topspin). |
| POP replacement | The machine learning pipeline (logistic regression / regression models) that maps raw Apple Watch data to Babolat-format classifications, letting the Watch stand in for a Babolat POP wristband. |
| Replacement validation | Reconciling trained Apple Watch output predictions with Babolat POP classifications to evaluate replacement quality. |

```pbc:glossary
- term: Stroke label
  definition: The classification of a tennis swing (Forehand, Backhand, or Serve).
- term: Spin label
  definition: The classification of swing spin (Flat, Slice, or Topspin).
- term: POP replacement
  definition: The machine learning pipeline (logistic regression / regression models) that maps raw Apple Watch data to Babolat-format classifications, letting the Watch stand in for a Babolat POP wristband.
- term: Replacement validation
  definition: Reconciling trained Apple Watch output predictions with Babolat POP classifications to evaluate replacement quality.
```

## Actors

```pbc:actors
- id: tennis_data_client
  name: Tennis Data Client
  type: system
  description: Unified database accessor querying Watch, Zepp, and Babolat databases.
- id: stroke_classifier
  name: Stroke Classifier
  type: system
  description: Rule-based system that labels swing types and sides to identify strokes.
- id: spin_classifier
  name: Spin Classifier
  type: system
  description: Rule-based system that applies spin-side thresholds to label stroke spins.
- id: training_engine
  name: ML Training Engine
  type: system
  description: Component that extracts pre-contact features and trains Watch classification models using Zepp supervisor data.
- id: babolat_validator
  name: Babolat Validation Engine
  type: system
  description: Component that compares trained Apple Watch predictions against reference Babolat logs.
```

## States

```pbc:states
- id: data_retrieved
  definition: Raw SQLite sensor databases are queried and session datasets are loaded.
  user_access: none
- id: stroke_labeled
  definition: Swings have been classified into Serve, Forehand, or Backhand.
  user_access: none
- id: spin_labeled
  definition: Swings have been classified into Flat, Topspin, or Slice.
  user_access: none
- id: model_trained
  definition: Watch replacement models have been fit to training sessions using Zepp targets.
  user_access: none
- id: replacement_validated
  definition: Predictions are compared to reference Babolat logs, and replacement accuracy metrics are calculated.
  user_access: none
```

## Rules

These are the parent's own rules. The leaf's alignment rules (`AW-ZEPP-RUL-*`) are owned by the composed child and are not restated here.

```pbc:rules
- id: TEN-RUL-001
  name: Stroke Classification Rules
  rule: A swing is classified as a Serve if swing_type is 3. Otherwise, it is classified as a Backhand if swing_side is 1, and a Forehand if swing_side is 0.
  trust: trusted
- id: TEN-RUL-002
  name: Spin Classification Rules
  rule: A swing is classified as a Slice if swing_type is 0. For other swings, it is Flat if ball_spin < 0.36 (Backhand) or ball_spin < 13.0 (Forehand); otherwise Topspin.
  trust: trusted
- id: TEN-RUL-003
  name: POP Replacement ML Training
  rule: The POP replacement pipeline must extract 15 pre-contact features from 100Hz raw Watch signals and train models (logistic regression / speed regression) using simultaneous Zepp data.
  trust: provisional
- id: TEN-RUL-004
  name: Babolat Replacement Validation
  rule: Once Apple Watch models are trained via the Zepp supervisor, predictions must be validated against Babolat POP records (shot type, spin type, speed, PIQ score) without requiring simultaneous sensor wear.
  trust: provisional
- id: TEN-RUL-005
  name: ML Graduation Criteria
  rule: Graduating the training pipeline to trusted requires at least 8 total linked sessions (5 training, 3 holdouts) evaluated via Leave-One-Session-Out (LOSO) cross-validation, achieving classification stability of SD <= 5.0% (strong target <= 3.0%).
  trust: provisional
- id: TEN-RUL-006
  name: Calibration Axis Asymmetry and Mapping
  rule: Model training is subject to calibration asymmetry; serve vs. groundstroke features generalize globally, whereas FH/BH classification relies on per-session rot_y_mean calibration. This is empirically grounded by 2 stroke sessions (2026-01-05 and 2026-02-19) demonstrating a sign-flip in the rot_y_mean discriminating axis (fh_sign = -1 then +1), confirming per-session calibration is required to prevent global confusion. 2 calibration points are insufficient for full LOSO graduation, keeping FH/BH classification provisional.
  trust: provisional
- id: TEN-RUL-007
  name: Validation Performance Thresholds
  rule: Apple Watch replacement validation targets are >= 90.0% accuracy for shot type (grounded in 93.0% Zepp-Babolat baseline), >= 80.0% accuracy for spin type (subject to Babolat's low BH spin limit noise), and speed MAE <= 8.0 mph.
  trust: provisional
```

## Behaviors

```pbc:behavior
id: TEN-BHV-001
name: Query sensor databases
actor: tennis_data_client
description: Query databases (tennis_watch.db, ztennis.db, BabPopExt.db) via TennisDataClient to extract session details.
trust: trusted
```

```pbc:preconditions
- Database files are registered in settings.local.json or resolved default paths.
```

```pbc:trigger
The system requests session metrics.
```

```pbc:outcomes
- Return structured dataframes containing raw accelerometer traces, Zepp records, and Babolat POP logs.
```

```pbc:behavior
id: TEN-BHV-002
name: Classify stroke type and side
actor: stroke_classifier
description: Apply deterministic rules to swing type and side variables to assign Forehand, Backhand, or Serve labels.
trust: trusted
```

```pbc:preconditions
- Swing datasets containing swing_type and swing_side are loaded.
```

```pbc:trigger
The data client or analytics engine requests stroke labels.
```

```pbc:outcomes
- Assigns stroke labels: Serve, Backhand, Forehand.
```

```pbc:behavior
id: TEN-BHV-003
name: Classify spin type
actor: spin_classifier
description: Evaluate ball_spin against the thresholds of 0.36 (Backhand) and 13 (Forehand) or swing_type 0 (Slice) to assign spin labels.
trust: trusted
```

```pbc:preconditions
- Stroke labels are assigned, and ball_spin metrics are present.
```

```pbc:trigger
The analytics engine requests spin classification.
```

```pbc:outcomes
- Assigns spin labels: Flat, Topspin, Slice.
```

```pbc:behavior
id: TEN-BHV-004
name: Train POP replacement models
actor: training_engine
description: Extract 15 pre-contact features from raw 100Hz Watch data and train classifiers and regressors using the aligned Zepp session records (produced by the composed alignment leaf) as supervision.
trust: provisional
```

```pbc:preconditions
- Raw 100Hz Watch accelerometer and gyroscope streams are loaded.
- Aligned Zepp training pairs are available from the composed leaf (aw-zepp-alignment).
```

```pbc:trigger
The training pipeline is invoked.
```

```pbc:outcomes
- Fits logistic regression (serve/groundstroke, FH/BH calibration) and speed regression models.
```

```pbc:behavior
id: TEN-BHV-005
name: Validate Babolat replacement predictions
actor: babolat_validator
description: Compare Apple Watch swing predictions against historical reference Babolat POP classification logs to assess replacement quality.
trust: provisional
```

```pbc:preconditions
- Apple Watch prediction models are fit.
- Reference Babolat POP logs are available.
```

```pbc:trigger
Validation comparisons are initiated.
```

```pbc:outcomes
- Calculates accuracy metrics for shot type, spin type, and estimated speed.
```

## Transitions

```pbc:transitions
- from: data_retrieved
  to: stroke_labeled
  condition: Deterministic swing rules run, labeling all stroke types.
- from: stroke_labeled
  to: spin_labeled
  condition: Spin thresholds run, labeling spin types (Flat/Topspin/Slice).
- from: data_retrieved
  to: model_trained
  condition: Training engine fits models on pre-contact features using aligned Zepp data.
- from: model_trained
  to: replacement_validated
  condition: Validation engine verifies predictions against Babolat reference records.
```

## Provenance

```pbc:provenance
- kind: doc
  ref: docs/agent_docs/SENSOR_INSIGHTS.md
  detail: Cross-sensor match rates show median 93.0% agreement across 59 sessions (Babolat to Zepp Universal) and 85.6% across 33 sessions (Babolat to Zepp2), grounding the replacement-validation thresholds in TEN-RUL-007.
  confidence: verified
- kind: doc
  ref: examples/aw-zepp-alignment.pbc.md
  detail: Composed leaf charter (see pbc:include) — owns the Apple Watch to Zepp temporal alignment and supervised training-pair construction this parent's models consume.
  confidence: verified
```
