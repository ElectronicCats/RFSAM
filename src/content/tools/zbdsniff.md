---
slug: zbdsniff
name: zbdsniff (KillerBee)
vendor: River Loop Security
type: software
protocols:
  - Zigbee
repo: 'https://github.com/riverloopsec/killerbee'
software: []
status: eol
statusNote: >-
  Wireshark recovers the network key from a join capture with the well-known
  link key loaded, without the KillerBee install.
statusChecked: 2026-09-23
successor: wireshark
note: >-
  KillerBee's key-extraction tool. Scans a capture for an over-the-air key
  transport (APS Transport-Key during a device join) and recovers the Zigbee
  network key — the classic break when the key is sent under the well-known
  default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and
  it prints the network key.
---
KillerBee's key-extraction tool. Scans a capture for an over-the-air key transport (APS Transport-Key during a device join) and recovers the Zigbee network key — the classic break when the key is sent under the well-known default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and it prints the network key.
