---
slug: pymodes
name: pyModeS
vendor: Junzi Sun (junzis)
type: software
protocols:
  - ADS-B
repo: 'https://github.com/junzis/pyModeS'
note: >-
  A pure-Python decoder library for Mode S and ADS-B messages: feed it hex
  frames (or stream them from dump1090 over TCP/Beast) and it returns the
  decoded fields, ICAO address, callsign, airborne/surface position (CPR),
  velocity, altitude, plus DF4/5/11/20/21 surveillance and Comm-B BDS
  registers. The reference way to interpret message contents and to run
  plausibility / anti-spoof checks on a decoded feed in your own code.
---
A pure-Python decoder library for Mode S and ADS-B messages: feed it hex frames (or stream them from dump1090 over TCP/Beast) and it returns the decoded fields, ICAO address, callsign, airborne/surface position (CPR), velocity, altitude, plus DF4/5/11/20/21 surveillance and Comm-B BDS registers. The reference way to interpret message contents and to run plausibility / anti-spoof checks on a decoded feed in your own code.
