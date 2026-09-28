---
slug: 5gsniffer
name: 5GSniffer
vendor: Sprite Lab (Northeastern University)
type: software
protocols:
  - 5G NR
status: research
statusNote: >-
  Research code accompanying a 2023 IEEE Symposium on Security and Privacy
  paper: FDD only, and its README recommends using a recorded file for this
  release. Last commit 2024-11-14.
statusSource: 'https://github.com/spritelab/5GSniffer/blob/master/README.md'
statusChecked: '2026-09-28'
repo: 'https://github.com/spritelab/5GSniffer'
note: >-
  Open-source 5G NR Physical Downlink Control Channel (PDCCH) blind decoder:
  passively recovers the Downlink Control Information (DCI) and the RNTIs active
  in a cell, exposing scheduling/identity activity for traffic analysis. Written
  in C++ on srsRAN libraries; FDD, FR1 sub-6 GHz. Research-grade, the current
  release recommends working from a recorded I/Q file rather than live SDR, and
  live capture needs extra setup.
---
Open-source 5G NR Physical Downlink Control Channel (PDCCH) blind decoder: passively recovers the Downlink Control Information (DCI) and the RNTIs active in a cell, exposing scheduling/identity activity for traffic analysis. Written in C++ on srsRAN libraries; FDD, FR1 sub-6 GHz. Research-grade, the current release recommends working from a recorded I/Q file rather than live SDR, and live capture needs extra setup.
