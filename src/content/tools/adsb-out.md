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
  Python 2 only: it fails to parse under Python 3, so it does not start on a
  current pentest distro. Kept for the DF17 encoding walkthrough.
statusChecked: 2026-09-23
note: >-
  A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames
  (chosen ICAO address, position, altitude) into an I/Q sample file for
  transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete
  way to demonstrate ADS-B spoofing/injection — there is no authentication on
  the link, so a higher-power forged frame is accepted as a real aircraft.
  Author states it is for academic purposes only. AUTHORIZED, RF-CONTAINED
  testing only: never radiate on-air — use a shielded enclosure or a conducted
  (cabled) setup. Unchanged since ~2021 and written for Python 2, so it will not run as-is on a current distribution.
---
A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames (chosen ICAO address, position, altitude) into an I/Q sample file for transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete way to demonstrate ADS-B spoofing/injection — there is no authentication on the link, so a higher-power forged frame is accepted as a real aircraft. Author states it is for academic purposes only. AUTHORIZED, RF-CONTAINED testing only: never radiate on-air — use a shielded enclosure or a conducted (cabled) setup. Unchanged since ~2021 and written for Python 2, so it will not run as-is on a current distribution.
