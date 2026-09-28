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
  Last upstream commit 2020-12-12; packaged in kali-rolling as
  0.1~git01282014-0kali4, which is a 2014 snapshot. Its FAQ states it targets LE
  Legacy pairing and that LE Secure Connections was designed to mitigate the
  attacks it implements.
statusSource: 'https://pkg.kali.org/pkg/crackle'
statusChecked: '2026-09-28'
note: >-
  Cracks BLE LE Legacy pairing: brute-forces the TK (Just Works / 6-digit PIN),
  derives the session keys and decrypts the capture. Feed it a PCAP containing
  the pairing event (e.g. from Ubertooth). Does not apply to LE Secure
  Connections.
---
Cracks BLE LE Legacy pairing: brute-forces the TK (Just Works / 6-digit PIN), derives the session keys and decrypts the capture. Feed it a PCAP containing the pairing event (e.g. from Ubertooth). Does not apply to LE Secure Connections.
