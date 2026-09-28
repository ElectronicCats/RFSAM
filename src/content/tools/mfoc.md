---
slug: mfoc
name: mfoc
vendor: nfc-tools
type: software
protocols:
  - NFC
  - RFID
status: mature
statusNote: >-
  Packaged in Debian, Kali and Homebrew (0.10.7); last upstream commit November
  2023. It implements only the offline nested attack; mfoc-hardnested and
  Proxmark3 (hf mf hardnested) add the hardnested attack.
statusSource: 'https://sources.debian.org/api/src/mfoc/'
statusChecked: '2026-09-28'
repo: 'https://github.com/nfc-tools/mfoc'
note: >-
  MIFARE Classic Offline Cracker: given at least one known sector key it runs
  the nested attack to recover all remaining Crypto1 keys and dump the card,
  over a libnfc-driven PN532 reader. Default/transport keys are tried
  automatically.
---
MIFARE Classic Offline Cracker: given at least one known sector key it runs the nested attack to recover all remaining Crypto1 keys and dump the card, over a libnfc-driven PN532 reader. Default/transport keys are tried automatically.
