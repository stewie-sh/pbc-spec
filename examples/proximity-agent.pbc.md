---
id: pbc-proximity-agent-single
title: ProximityAgent — Single-Sensor Close-Approach
context: proximity-single
status: draft
updated: 2026-06-04
tags:
  - proximity
  - hardware
  - hil
  - nrf52840
  - sensor
---

# ProximityAgent — Single-Sensor Close-Approach

ProximityAgent is a firmware-backed single-sensor system running on an nRF52840 microcontroller with an HC-SR04 ultrasonic sensor. It detects local close-approach events below a physics-derived distance threshold and signals them via GPIO.

## Scope

- distance measurement via a single HC-SR04 ultrasonic sensor
- close-approach alarm threshold enforcement (330mm)
- GPIO5 alarm signal behavior
- STATUS-bit handshake contract between harness and firmware
- HIL simulation path via LabWired shm_i2c bridge

## Non-goals

- multi-sensor coordination
- BLE communication or pairing
- battery-powered power characterization

## Terms

| Term | Definition |
| --- | --- |
| Close-approach | A detected distance below the alarm threshold (330mm). |
| Alarm threshold | The physics-derived distance bound below which GPIO5 is asserted. |
| Data-ready | Firmware has written a distance sample and set the STATUS bit. |
| HIL | Hardware-in-the-Loop — firmware running against a virtual sensor via LabWired. |

```pbc:glossary
- term: Close-approach
  definition: A detected distance below the alarm threshold (330mm).
- term: Alarm threshold
  definition: The physics-derived distance bound (330mm) below which GPIO5 is asserted.
- term: Data-ready
  definition: A harness-set STATUS bit indicating a new distance sample is available.
- term: HIL
  definition: Hardware-in-the-Loop — firmware running unmodified against a LabWired virtual sensor.
```

## Actors

```pbc:actors
- id: hcsr04
  name: HC-SR04 sensor
  type: hardware
  description: Ultrasonic distance sensor attached to the nRF52840 via I2C bridge.
- id: firmware
  name: nRF52840 firmware
  type: system
  description: Compiled firmware executing on the microcontroller; polls the sensor and drives GPIO5.
- id: harness
  name: External harness
  type: system
  description: Python runner that injects distance samples via the shm_i2c shared-memory bridge during HIL runs.
```

## States

```pbc:states
- id: idle
  definition: No distance sample is pending; firmware is polling STATUS.
  user_access: none
- id: data_ready
  definition: Harness has written a distance sample and set STATUS bit 1.
  user_access: none
- id: alert
  definition: Firmware has read a distance below the alarm threshold and asserted GPIO5.
  user_access: none
- id: acknowledged
  definition: Firmware has cleared the STATUS bit; harness may write the next sample.
  user_access: none
```

## Rules

```pbc:rules
- id: PROX-RUL-001
  name: Physics-derived alarm threshold
  rule: The alarm threshold is set at 330mm — derived from the HC-SR04 minimum reliable detection range. Thresholds below this bound produce structurally unreliable readings.
  trust: trusted
- id: PROX-RUL-002
  name: STATUS-bit handshake is mandatory
  rule: The firmware must not read DIST_H/DIST_L until STATUS bit 1 is set. The harness must not write the next sample until STATUS bit 1 is cleared by firmware.
  trust: trusted
- id: PROX-RUL-003
  name: Single-read alarm
  rule: A single distance reading below threshold is sufficient to assert GPIO5. No redundant-read averaging is applied in the current firmware.
  trust: provisional
- id: PROX-RUL-004
  name: GPIO5 is the only alarm output
  rule: The alarm surface is GPIO5 assertion only. No BLE notification, no UART output, no secondary signal.
  trust: trusted
```

## Behaviors

```pbc:behavior
id: PROX-BHV-001
name: Inject distance sample
actor: harness
description: The external harness writes a two-byte distance value (DIST_H, DIST_L) to the shm_i2c shared-memory file and sets STATUS bit 1 to signal data-ready.
trust: trusted
```

```pbc:preconditions
- STATUS bit 1 is cleared (previous sample acknowledged).
- The shm_i2c bridge is initialized and the firmware is running.
```

```pbc:trigger
The harness advances to the next sample in the replay sequence.
```

```pbc:outcomes
- DIST_H and DIST_L contain the new distance value.
- STATUS bit 1 is set.
- Firmware polling loop detects data-ready on its next cycle.
```

```pbc:behavior
id: PROX-BHV-002
name: Read distance and evaluate threshold
actor: firmware
description: The firmware polls STATUS, reads the two-byte distance when data-ready, and compares it against the alarm threshold.
trust: trusted
```

```pbc:preconditions
- STATUS bit 1 is set.
- DIST_H and DIST_L contain a valid distance sample.
```

```pbc:trigger
Firmware polling loop detects STATUS bit 1 set.
```

```pbc:outcomes
- Firmware reads DIST_H and DIST_L.
- If distance < 330mm, GPIO5 is asserted (PROX-BHV-003).
- STATUS bit 1 is cleared (acknowledged).
```

```pbc:behavior
id: PROX-BHV-003
name: Assert GPIO5 alarm
actor: firmware
description: The firmware asserts GPIO5 when a distance reading falls below the alarm threshold.
trust: provisional
```

```pbc:preconditions
- A distance sample has been read from DIST_H/DIST_L.
- The computed distance is below the alarm threshold (330mm).
```

```pbc:trigger
Distance comparison evaluates to below-threshold.
```

```pbc:outcomes
- GPIO5 is asserted.
- The alarm state persists until the next polling cycle.
```

## Transitions

```pbc:transitions
- from: idle
  to: data_ready
  condition: Harness writes a distance sample and sets STATUS bit 1.
- from: data_ready
  to: acknowledged
  condition: Firmware reads the distance sample and clears STATUS bit 1.
- from: acknowledged
  to: alert
  condition: The distance read was below the alarm threshold (330mm).
- from: acknowledged
  to: idle
  condition: The distance read was at or above the alarm threshold.
- from: alert
  to: idle
  condition: Next polling cycle begins; GPIO5 de-asserted pending next sample.
```

## Provenance

```pbc:provenance
- ref: docs/domain_runs/PROX-HIL-001/report.md
  confidence: verified
  note: HIL-001 materialized subset proof — firmware runs unmodified against LabWired virtual sensor.
- ref: docs/domain_runs/PROX-SWEEP-001/report.md
  confidence: verified
  note: Fault-tolerance sweep confirmed 330mm threshold via DIST_H structural FN bias analysis.
- ref: docs/domain_runs/PROX-HIL-003/run_log.txt
  confidence: verified
  note: HIL-003 first-light physical trace import verified distance reading evaluation.
```
