---
name: Proxmark3 client (pm3)
vendor: RFID Research Group (Iceman fork)
type: software
protocols:
  - NFC
  - RFID
repo: 'https://github.com/RfidResearchGroup/proxmark3'
note: >-
  The host client that drives the Proxmark3 over USB — the `pm3` shell from the
  RfidResearchGroup/proxmark3 (Iceman) repo. Runs every Proxmark workflow from
  the laptop: `lf/hf search` to fingerprint a tag, read/dump LF IDs and HF
  cards, the full Crypto1 suite (`hf mf
  darkside`/`nested`/`hardnested`/`mfkey`), clone/simulate, and `hf 14a` sniff
  plus the `hf_reblay` standalone mode for an ISO 14443-A relay/MITM. The
  firmware and client ship together; this is the software you actually type
  into.
---
The host client that drives the Proxmark3 over USB — the `pm3` shell from the RfidResearchGroup/proxmark3 (Iceman) repo. Runs every Proxmark workflow from the laptop: `lf/hf search` to fingerprint a tag, read/dump LF IDs and HF cards, the full Crypto1 suite (`hf mf darkside`/`nested`/`hardnested`/`mfkey`), clone/simulate, and `hf 14a` sniff plus the `hf_reblay` standalone mode for an ISO 14443-A relay/MITM. The firmware and client ship together; this is the software you actually type into.
