---
slug: crackle
name: crackle
vendor: Mike Ryan
type: software
protocols:
  - BLE
repo: 'https://github.com/mikeryan/crackle'
status: mature
statusNote: >-
  Frozen by design and packaged in kali-rolling; the LE Legacy pairing attack
  is intact. It does not apply to LE Secure Connections.
statusChecked: 2026-09-23
note: >-
  Cracks BLE LE Legacy pairing: brute-forces the TK (Just Works / 6-digit PIN),
  derives the session keys and decrypts the capture. Feed it a PCAP containing
  the pairing event (e.g. from Ubertooth). Does not apply to LE Secure
  Connections.
---
Cracks BLE LE Legacy pairing: brute-forces the TK (Just Works / 6-digit PIN), derives the session keys and decrypts the capture. Feed it a PCAP containing the pairing event (e.g. from Ubertooth). Does not apply to LE Secure Connections.
