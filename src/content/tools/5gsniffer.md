---
slug: 5gsniffer
name: 5GSniffer
vendor: Sprite Lab (Northeastern University)
type: software
protocols:
  - 5G NR
repo: 'https://github.com/spritelab/5GSniffer'
status: research
statusNote: >-
  An IEEE S&P 2023 artefact: FDD only, and its own README recommends working
  from a recorded file rather than live SDR.
statusChecked: 2026-09-23
note: >-
  Open-source 5G NR Physical Downlink Control Channel (PDCCH) blind decoder:
  passively recovers the Downlink Control Information (DCI) and the RNTIs active
  in a cell, exposing scheduling/identity activity for traffic analysis. Written
  in C++ on srsRAN libraries; FDD, FR1 sub-6 GHz. Research-grade — the current
  release recommends working from a recorded I/Q file rather than live SDR, and
  live capture needs extra setup.
---
Open-source 5G NR Physical Downlink Control Channel (PDCCH) blind decoder: passively recovers the Downlink Control Information (DCI) and the RNTIs active in a cell, exposing scheduling/identity activity for traffic analysis. Written in C++ on srsRAN libraries; FDD, FR1 sub-6 GHz. Research-grade — the current release recommends working from a recorded I/Q file rather than live SDR, and live capture needs extra setup.
