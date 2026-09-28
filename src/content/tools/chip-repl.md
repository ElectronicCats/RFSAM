---
slug: chip-repl
name: chip-repl (Matter Python controller)
vendor: Connectivity Standards Alliance / Project CHIP
type: software
protocols:
  - Thread
  - Wi-Fi
  - BLE
repo: 'https://github.com/project-chip/connectedhomeip'
note: >-
  The Python Matter controller and interactive REPL from the connectedhomeip SDK
  (src/controller/python, matter-repl.py). Same native CHIP device-controller
  stack as chip-tool but scriptable: stand up a fabric, commission over BLE,
  then read/subscribe/write attributes and invoke cluster commands from Python,
  convenient for automating commissioning-attack and cluster-enumeration
  workflows and for multi-fabric tests.
---
The Python Matter controller and interactive REPL from the connectedhomeip SDK (src/controller/python, matter-repl.py). Same native CHIP device-controller stack as chip-tool but scriptable: stand up a fabric, commission over BLE, then read/subscribe/write attributes and invoke cluster commands from Python, convenient for automating commissioning-attack and cluster-enumeration workflows and for multi-fabric tests.
