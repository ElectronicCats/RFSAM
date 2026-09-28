---
slug: gps-sdr-sim
name: gps-sdr-sim
vendor: osqzss (Takuji Ebinuma)
type: software
protocols:
  - GNSS
repo: 'https://github.com/osqzss/gps-sdr-sim'
status: archived
statusNote: >-
  Archived (read-only) on GitHub since 2025-01-26; last commit 2025-01-07. The
  single-file generator still compiles with the README gcc command (checked
  2026-09-28 with Apple clang 21).
statusSource: 'https://github.com/osqzss/gps-sdr-sim'
statusChecked: '2026-09-28'
note: >-
  Generates a GPS L1 C/A baseband I/Q file from a RINEX broadcast ephemeris and
  a chosen static or moving position, for transmission by an SDR (HackRF /
  bladeRF / USRP). Because civilian C/A is unauthenticated, a
  replayed/synthesised signal at higher power can pull a receiver's position and
  clock to attacker-chosen values, the canonical GPS spoofing tool. AUTHORIZED,
  RF-CONTAINED testing only: transmitting GPS over the air is illegal in most
  jurisdictions, use a shielded enclosure or a cabled (conducted) setup. Repo is
  archived but remains the de-facto reference.
---
Generates a GPS L1 C/A baseband I/Q file from a RINEX broadcast ephemeris and a chosen static or moving position, for transmission by an SDR (HackRF / bladeRF / USRP). Because civilian C/A is unauthenticated, a replayed/synthesised signal at higher power can pull a receiver's position and clock to attacker-chosen values, the canonical GPS spoofing tool. AUTHORIZED, RF-CONTAINED testing only: transmitting GPS over the air is illegal in most jurisdictions, use a shielded enclosure or a cabled (conducted) setup. Repo is archived but remains the de-facto reference.
