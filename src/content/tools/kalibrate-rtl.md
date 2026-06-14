---
name: kalibrate-rtl
vendor: steve-m (kalibrate fork)
type: software
protocols:
  - GSM
repo: 'https://github.com/steve-m/kalibrate-rtl'
note: >-
  GSM frequency scanner: sweeps a band (GSM850/900/1800/1900) for active
  base-station carriers by locking onto their FCCH/SCH bursts, reporting each
  ARFCN, its power and the radio's clock-frequency offset (ppm). The
  kalibrate-rtl fork drives an RTL-SDR; sibling forks exist for HackRF and UHD.
  The first step before any capture: it tells you which ARFCNs have a live BTS.
---
GSM frequency scanner: sweeps a band (GSM850/900/1800/1900) for active base-station carriers by locking onto their FCCH/SCH bursts, reporting each ARFCN, its power and the radio's clock-frequency offset (ppm). The kalibrate-rtl fork drives an RTL-SDR; sibling forks exist for HackRF and UHD. The first step before any capture: it tells you which ARFCNs have a live BTS.
