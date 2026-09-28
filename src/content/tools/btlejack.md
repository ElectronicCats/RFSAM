---
slug: btlejack
name: Btlejack
vendor: Damien Cauquil (virtualabs)
type: software
protocols:
  - BLE
repo: 'https://github.com/virtualabs/btlejack'
status: stale
statusNote: >-
  Supports micro:bit V1 and V2 since 2.1.0, but the author states that on the V2
  (nRF52) the current firmware does not correctly detect access addresses, which
  affects sniffing already-established connections. Last commit 2023-10-04 and
  last PyPI release 2.1.1 (2022-11-18); no deprecation notice is published.
statusSource: 'https://github.com/virtualabs/btlejack/issues/80#issuecomment-1493441509'
statusChecked: '2026-09-28'
successor: whad
note: >-
  Sniff, jam and hijack BLE connections from low-cost hardware (BBC micro:bit /
  nRF51822). Established the practical jam-and-hijack technique for taking over
  a live connection. Version 2.1.0 (2022) added BBC micro:bit V2 support, but
  its author reported that on the V2 the detection of access addresses of
  already-established connections is unreliable, while sniffing new connections
  works. WHAD with an nRF52840 dongle, both in this catalogue, is an alternative
  for the same job.
---
Sniff, jam and hijack BLE connections from low-cost hardware (BBC micro:bit / nRF51822). Established the practical jam-and-hijack technique for taking over a live connection. Version 2.1.0 (2022) added BBC micro:bit V2 support, but its author reported that on the V2 the detection of access addresses of already-established connections is unreliable, while sniffing new connections works. WHAD with an nRF52840 dongle, both in this catalogue, is an alternative for the same job.
