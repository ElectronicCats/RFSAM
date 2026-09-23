---
slug: mfoc
name: mfoc
vendor: nfc-tools
type: software
protocols:
  - NFC
  - RFID
repo: 'https://github.com/nfc-tools/mfoc'
status: mature
statusNote: >-
  Packaged in Debian, Kali and Homebrew. For hardened cards use mfoc-
  hardnested or the Proxmark3 path instead.
statusChecked: 2026-09-23
note: >-
  MIFARE Classic Offline Cracker: given at least one known sector key it runs
  the nested attack to recover all remaining Crypto1 keys and dump the card,
  over a libnfc-driven PN532 reader. Default/transport keys are tried
  automatically.
---
MIFARE Classic Offline Cracker: given at least one known sector key it runs the nested attack to recover all remaining Crypto1 keys and dump the card, over a libnfc-driven PN532 reader. Default/transport keys are tried automatically.
