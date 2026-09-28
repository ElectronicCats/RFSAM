---
slug: zbdsniff
name: zbdsniff (KillerBee)
vendor: River Loop Security
type: software
protocols:
  - Zigbee
repo: 'https://github.com/riverloopsec/killerbee'
status: mature
statusNote: >-
  KillerBee is not archived and zbdsniff is Python 3, but the last commit was
  2022-08-19. Wireshark's Zigbee dissector extracts the key from an APS
  Transport Key frame and adds it to its keyring once the link key is entered
  under Pre-configured Keys.
statusSource: >-
  https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-zbee-aps.c
statusChecked: '2026-09-28'
software: []
note: >-
  KillerBee's key-extraction tool. Scans a capture for an over-the-air key
  transport (APS Transport-Key during a device join) and recovers the Zigbee
  network key, the classic break when the key is sent under the well-known
  default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and
  it prints the network key.
---
KillerBee's key-extraction tool. Scans a capture for an over-the-air key transport (APS Transport-Key during a device join) and recovers the Zigbee network key, the classic break when the key is sent under the well-known default Trust Center link key 'ZigBeeAlliance09'. Feed it a PCAP of a join and it prints the network key.
