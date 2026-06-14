---
name: zbdsniff (KillerBee)
vendor: River Loop Security
type: software
protocols:
  - Zigbee
repo: 'https://github.com/riverloopsec/killerbee'
software: []
note: >-
  KillerBee's key-extraction tool. Scans a capture for an over-the-air key
  transport (APS Transport-Key during a device join) and recovers the Zigbee
  network key — the classic break when the key is sent under the well-known
  default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and
  it prints the network key.
---
KillerBee's key-extraction tool. Scans a capture for an over-the-air key transport (APS Transport-Key during a device join) and recovers the Zigbee network key — the classic break when the key is sent under the well-known default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and it prints the network key.
