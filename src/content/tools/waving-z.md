---
slug: waving-z
name: Waving-Z
vendor: Paolo de Dios (baol)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/baol/waving-z'
software: []
status: mature
statusNote: >-
  Ten files of C++11 and Boost, no GNU Radio or Python to rot, and G.9959 did
  not change.
statusChecked: 2026-09-23
note: >-
  An ITU-T G.9959 (de)modulator for Z-Wave (started as a fork of
  andersesbensen/rtl-zwave). `wave-in` decodes Z-Wave frames from a raw I/Q
  stream piped in from an RTL-SDR (`rtl_sdr`) or HackRF; `wave-out` encodes
  frames and transmits them through `hackrf_transfer`. The rtl_433-style entry
  point for getting Z-Wave packets off a cheap SDR.
---
An ITU-T G.9959 (de)modulator for Z-Wave (started as a fork of andersesbensen/rtl-zwave). `wave-in` decodes Z-Wave frames from a raw I/Q stream piped in from an RTL-SDR (`rtl_sdr`) or HackRF; `wave-out` encodes frames and transmits them through `hackrf_transfer`. The rtl_433-style entry point for getting Z-Wave packets off a cheap SDR.
