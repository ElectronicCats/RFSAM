---
name: Kraken (A5/1 cracker)
vendor: SRLabs / Joshua Wright fork
type: project
protocols:
  - GSM
repo: 'https://github.com/joswr1ght/kraken'
note: >-
  GPU/CPU cracker that recovers an A5/1 session key from a captured keystream
  segment using the ~1.6–2 TB A5/1 rainbow tables (the Berlin A5/1 Security
  Project). Recovers Kc, which decrypts the rest of a captured call/SMS session.
  Old but the reference open A5/1 attack; requires the bulky precomputed tables
  and a known-keystream slice from the capture.
---
GPU/CPU cracker that recovers an A5/1 session key from a captured keystream segment using the ~1.6–2 TB A5/1 rainbow tables (the Berlin A5/1 Security Project). Recovers Kc, which decrypts the rest of a captured call/SMS session. Old but the reference open A5/1 attack; requires the bulky precomputed tables and a known-keystream slice from the capture.
