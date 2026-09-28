---
slug: adsb-out
name: ADSB-Out
vendor: Linar Yusupov (lyusupov)
type: project
protocols:
  - ADS-B
repo: 'https://github.com/lyusupov/ADSB-Out'
status: stale
statusNote: >-
  Last commit 2021-01-07, and ADSB_Encoder.py uses Python 2 print statements, so
  it raises a SyntaxError under Python 3. It still contains a readable DF17
  position-report encoder (df17_pos_rep_encode).
statusSource: 'https://github.com/lyusupov/ADSB-Out/blob/master/ADSB_Encoder.py'
statusChecked: '2026-09-28'
note: >-
  A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames
  (chosen ICAO address, position, altitude) into an I/Q sample file for
  transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete
  way to demonstrate ADS-B spoofing/injection, there is no authentication on the
  link, so a higher-power forged frame is accepted as a real aircraft. Author
  states it is for academic purposes only. AUTHORIZED, RF-CONTAINED testing
  only: never radiate on-air, use a shielded enclosure or a conducted (cabled)
  setup. Last commit January 2021; it is written for Python 2 and fails to parse
  under Python 3.
---
A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames (chosen ICAO address, position, altitude) into an I/Q sample file for transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete way to demonstrate ADS-B spoofing/injection, there is no authentication on the link, so a higher-power forged frame is accepted as a real aircraft. Author states it is for academic purposes only. AUTHORIZED, RF-CONTAINED testing only: never radiate on-air, use a shielded enclosure or a conducted (cabled) setup. Last commit January 2021; it is written for Python 2 and fails to parse under Python 3.
