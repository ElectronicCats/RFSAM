---
slug: chip-tool
name: chip-tool
vendor: Connectivity Standards Alliance / Project CHIP
type: software
protocols:
  - Thread
  - Wi-Fi
  - BLE
repo: 'https://github.com/project-chip/connectedhomeip'
note: >-
  The Matter controller/commissioner CLI from the connectedhomeip SDK
  (examples/chip-tool). Commissions a Matter device over Bluetooth LE,
  establishing a PASE (SPAKE2+) session from the setup passcode, handing over
  Thread/Wi-Fi credentials with `pairing ble-thread` / `pairing ble-wifi` (or
  `pairing onnetwork` / `pairing code` once on-network), then drives it with
  CASE-secured operational commands. Also opens a second commissioning window
  (`pairing open-commissioning-window`) to test multi-admin. The tool for
  assessing Matter onboarding and the application-layer cluster interface.
---
The Matter controller/commissioner CLI from the connectedhomeip SDK (examples/chip-tool). Commissions a Matter device over Bluetooth LE, establishing a PASE (SPAKE2+) session from the setup passcode, handing over Thread/Wi-Fi credentials with `pairing ble-thread` / `pairing ble-wifi` (or `pairing onnetwork` / `pairing code` once on-network), then drives it with CASE-secured operational commands. Also opens a second commissioning window (`pairing open-commissioning-window`) to test multi-admin. The tool for assessing Matter onboarding and the application-layer cluster interface.
