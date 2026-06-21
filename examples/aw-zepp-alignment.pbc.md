---
id: pbc-aw-zepp-alignment
title: Apple Watch to Zepp Motion Bridge — Swing Alignment
context: aw-zepp-alignment
status: draft
updated: 2026-06-12
tags:
  - tennis
  - apple-watch
  - zepp
  - alignment
---

# Apple Watch to Zepp Motion Bridge — Swing Alignment

Apple Watch to Zepp Motion Bridge is a temporal alignment and supervised training system that reconciles tennis swing events captured by an Apple Watch accelerometer with reference shot records from a Zepp sensor. Its purpose is to train *POP replacement models* — machine learning models that let the Apple Watch stand in for a Babolat POP wristband, producing Babolat-format shot classifications, with the racquet-mounted Zepp sensor acting as the training supervisor.

## Scope

- Ingesting raw triaxial Apple Watch accelerometer and gyroscope sensor data (100Hz).
- Peak acceleration detection above a tuned threshold of 10.0 G.
- Ingesting reference Zepp tennis shot records with timestamps.
- Computing a global temporal offset using a two-pass global anchor alignment with Mean Template correlation.
- Verifying strict 1-to-1 match alignment within a tight search window of 1.5s.
- Constructing supervised training features (15 pre-contact variables) from matched swings to feed POP replacement models.

## Non-goals

- Generalization to multi-session settings with variable clock drift rates.
- Babolat, Garmin, or other wearable sensor alignment (replacement validation is decoupled from simultaneous alignment).
- Real-time streaming alignment (offline/post-session only).

## Terms

| Term | Definition |
| --- | --- |
| Peak threshold | The acceleration magnitude threshold (10.0 G) used to detect swing candidates on Apple Watch. |
| Global anchor alignment | The two-pass correlation method used to establish the base temporal offset between Apple Watch and Zepp records. |
| Residual jitter | The remaining difference in alignment between a matched swing peak and the reference Zepp shot time. |
| Temporal discontinuity | A sudden discrete shift in recording clocks (e.g., a 2-second shift in swings 1–9 of the 58shot session). |

```pbc:glossary
- term: Peak threshold
  definition: The acceleration magnitude threshold (10.0 G) used to detect swing candidates on Apple Watch.
- term: Global anchor alignment
  definition: The two-pass correlation method used to establish the base temporal offset between Apple Watch and Zepp records.
- term: Residual jitter
  definition: The remaining difference in alignment between a matched swing peak and the reference Zepp shot time.
- term: Temporal discontinuity
  definition: A sudden discrete shift in recording clocks (e.g., a 2-second shift in swings 1–9 of the 58shot session).
```

## Actors

```pbc:actors
- id: apple_watch
  name: Apple Watch
  type: hardware
  description: Wearable device recording raw triaxial accelerometer and gyroscope data.
- id: zepp_sensor
  name: Zepp Sensor
  type: hardware
  description: Racket-mounted sensor recording reference tennis shot events.
- id: alignment_engine
  name: Alignment Engine
  type: system
  description: Python implementation that processes sensor streams, detects peaks, and calculates alignment offsets.
```

## States

```pbc:states
- id: raw_data_loaded
  definition: Both raw Apple Watch accelerometer data and Zepp shot records are successfully loaded into memory.
  user_access: none
- id: peaks_extracted
  definition: Accelerometer signal has been processed and peaks exceeding the 10.0 G threshold are identified.
  user_access: none
- id: aligned
  definition: Global anchor offset has been computed and applied to the Apple Watch timestamps.
  user_access: none
- id: closed
  definition: One-to-one mapping has been verified for all swings in the session (e.g., 60/60 matched).
  user_access: none
- id: partial_alignment
  definition: Alignment is established but constrained by temporal discontinuity, leaving some swings unmatched.
  user_access: none
```

## Rules

```pbc:rules
- id: AW-ZEPP-RUL-001
  name: Acceleration Peak Threshold
  rule: The candidate peak threshold must be set to 10.0 G. Lowering this from 15.0 G is required to capture lower-intensity swing peaks and ensure sufficient candidate coverage.
  trust: trusted
- id: AW-ZEPP-RUL-002
  name: Strict One-to-One Matching
  rule: Each candidate Apple Watch swing peak must map to at most one Zepp reference shot record within a search window of 1.5s, ensuring no duplicate assignments.
  trust: trusted
- id: AW-ZEPP-RUL-003a
  name: Serve Speed Regression Model Validation
  rule: The serve speed regression pipeline uses Model B (with intercept speed = slope * peak_rad + intercept) and is graduated to trusted. Under Leave-One-Session-Out (LOSO) cross-validation across N=7 serve calibration sessions, it achieved an average MAE of 6.02 mph (SD 1.44 mph), meeting the graduation threshold of <= 8.0 mph.
  trust: trusted
- id: AW-ZEPP-RUL-003b
  name: Stroke and Spin Classification Model Validation
  rule: The stroke classification (serve vs. groundstroke, forehand vs. backhand) and spin type classification pipelines are provisional, requiring further groundstroke data collection (blocked by court access) to run full LOSO validation. However, the FH/BH per-session calibration mechanism is empirically grounded by 2 stroke sessions (2026-01-05 and 2026-02-19) confirming a discriminating axis sign-flip (fh_sign = -1 on 2026-01-05, fh_sign = +1 on 2026-02-19) under physical strap/tightness variations.
  trust: provisional
- id: AW-ZEPP-RUL-004
  name: Temporal Discontinuity Handling
  rule: Discrete clock jumps in sensor recordings (e.g., 2-second shift in swings 1–9 of the 58shot session) prevent global offset closure and require piecewise or multi-anchor alignment.
  trust: provisional
```

## Behaviors

```pbc:behavior
id: AW-ZEPP-BHV-001
name: Ingest sensor datasets
actor: alignment_engine
description: The alignment engine loads raw Apple Watch accelerometer streams and reference Zepp shot tables from their respective database entries.
trust: trusted
```

```pbc:preconditions
- Apple Watch database file and Zepp database file are accessible.
- The target session IDs exist in both databases.
```

```pbc:trigger
The alignment runner is executed for a target session.
```

```pbc:outcomes
- Accelerometer coordinates (x, y, z) and timestamps are loaded.
- Zepp shot reference timestamps are loaded.
```

```pbc:behavior
id: AW-ZEPP-BHV-002
name: Detect acceleration peaks
actor: alignment_engine
description: The alignment engine calculates the vector norm of the raw accelerometer data and identifies peaks exceeding 10.0 G.
trust: trusted
```

```pbc:preconditions
- Raw accelerometer data is loaded in memory.
```

```pbc:trigger
The peak detection algorithm runs with PEAK_THRESHOLD = 10.0 G.
```

```pbc:outcomes
- A list of candidate Apple Watch swing timestamps is generated.
```

```pbc:behavior
id: AW-ZEPP-BHV-003
name: Compute global alignment offset
actor: alignment_engine
description: The alignment engine performs a two-pass global anchor alignment using Mean Template correlation to find the offset that maximizes matching within a tight 1.5s search window.
trust: trusted
```

```pbc:preconditions
- Candidate swing peaks are extracted from Apple Watch data.
- Reference Zepp shot timestamps are loaded.
```

```pbc:trigger
The alignment correlation solver is executed.
```

```pbc:outcomes
- A single global temporal offset value is computed.
- Offsets are applied to normalize Apple Watch timestamps.
```

```pbc:behavior
id: AW-ZEPP-BHV-004
name: Verify full-set session closure
actor: alignment_engine
description: The alignment engine verifies that every swing matches 1-to-1 with a Zepp reference shot (achieving 60/60 matches on the 60shot session).
trust: trusted
```

```pbc:preconditions
- Global temporal offset has been applied to the session.
- The recording is free of temporal discontinuities (e.g., the 60shot session).
```

```pbc:trigger
The matching verification loop evaluates the aligned peaks.
```

```pbc:outcomes
- 100% session closure is confirmed (60/60 matched swings).
- Residual jitter statistics are recorded (StDev <= 357.63 ms).
```

```pbc:behavior
id: AW-ZEPP-BHV-005
name: Detect temporal discontinuity
actor: alignment_engine
description: The engine detects sudden shifts in offset alignment by evaluating local residuals, identifying discontinuity jumps.
trust: provisional
```

```pbc:preconditions
- Global alignment has been applied.
- Unmatched peaks exist at the beginning or end of a session (e.g., swings 1–9 in 58shot).
```

```pbc:trigger
Residual jitter analysis runs on unmatched candidates.
```

```pbc:outcomes
- A discrete temporal shift is identified (e.g., a 2-second offset shift in the first 9 swings of the 58shot session).
```

## Transitions

```pbc:transitions
- from: raw_data_loaded
  to: peaks_extracted
  condition: Accelerometer norm peaks are successfully identified above 10.0 G.
- from: peaks_extracted
  to: aligned
  condition: Two-pass alignment computes a global offset maximizing correlation.
- from: aligned
  to: closed
  condition: Peak-to-shot mapping resolves to 1-to-1 full closure (e.g., 60/60 matched).
- from: aligned
  to: partial_alignment
  condition: Residual analysis reveals a clock jump, leaving a subset of swings unmatched.
```

## Provenance

```pbc:provenance
- kind: doc
  ref: docs/domain_runs/AW-ZEPP-003/report.md
  detail: Similarity tuning achieved 60/60 (100%) closure on the 60shot session and identified the 2s temporal discontinuity on 58shot.
  confidence: verified
- kind: doc
  ref: docs/domain_runs/AW-ZEPP-002/report.md
  detail: Initial baseline report showing 27/58 and 39/60 matches prior to peak threshold tuning.
  confidence: verified
- kind: doc
  ref: docs/domain_runs/AW-QUAT-001/finding.md
  detail: Quaternion attitude tested as an alternative FH/BH feature. Within-session LOO reached 100% but cross-session generalization was only 73 percent with no advantage over rotation means, confirming classification (AW-ZEPP-RUL-003b) remains provisional pending N>=6 stroke sessions. Same finding established quaternion attitude does recover a usable swing path for simulation.
  confidence: verified
```
