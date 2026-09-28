---
slug: kraken-a51
name: Kraken (A5/1 cracker)
vendor: SRLabs / Joshua Wright fork
type: project
protocols:
  - GSM
status: mature
statusNote: >-
  Frozen since 2014-10-22; the a5_ati backend needs the ATI CAL SDK (cal.h), so
  build with make noati and use a5_cpu. The tables are separate and need 1.7 to
  2 TB of storage.
statusSource: 'https://github.com/joswr1ght/kraken/issues/5'
statusChecked: '2026-09-28'
repo: 'https://github.com/joswr1ght/kraken'
note: >-
  GPU/CPU cracker that recovers an A5/1 session key from a captured keystream
  segment using the ~1.6 to 2 TB A5/1 rainbow tables (the Berlin A5/1 Security
  Project). Recovers Kc, which decrypts the rest of a captured call/SMS session.
  Old but the reference open A5/1 attack; requires the bulky precomputed tables
  and a known-keystream slice from the capture.
---
GPU/CPU cracker that recovers an A5/1 session key from a captured keystream segment using the ~1.6 to 2 TB A5/1 rainbow tables (the Berlin A5/1 Security Project). Recovers Kc, which decrypts the rest of a captured call/SMS session. Old but the reference open A5/1 attack; requires the bulky precomputed tables and a known-keystream slice from the capture.
