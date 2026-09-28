---
slug: adsb-out
name: ADSB-Out
vendor: Linar Yusupov (lyusupov)
type: project
protocols:
  - ADS-B
repo: 'https://github.com/lyusupov/ADSB-Out'
note: >-
  A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames
  (chosen ICAO address, position, altitude) into an I/Q sample file for
  transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete
  way to demonstrate ADS-B spoofing/injection, there is no authentication on the
  link, so a higher-power forged frame is accepted as a real aircraft. Author
  states it is for academic purposes only. AUTHORIZED, RF-CONTAINED testing
  only: never radiate on-air, use a shielded enclosure or a conducted (cabled)
  setup. Stable but inactive (last commit ~2021).
---
A Python encoder that builds forged 1090ES ADS-B Extended Squitter frames (chosen ICAO address, position, altitude) into an I/Q sample file for transmission by a TX-capable SDR (HackRF via hackrf_transfer). The concrete way to demonstrate ADS-B spoofing/injection, there is no authentication on the link, so a higher-power forged frame is accepted as a real aircraft. Author states it is for academic purposes only. AUTHORIZED, RF-CONTAINED testing only: never radiate on-air, use a shielded enclosure or a conducted (cabled) setup. Stable but inactive (last commit ~2021).
