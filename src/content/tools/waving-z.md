---
slug: waving-z
name: Waving-Z
vendor: Paolo de Dios (baol)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/baol/waving-z'
status: mature
statusNote: >-
  Small C++11 codebase whose only library dependency is Boost, with no GNU Radio
  or Python; last code change 2018-06-14 and a typo fix on 2022-04-03. G.9959
  (01/2015) is still the edition in force.
statusSource: 'https://github.com/baol/waving-z/blob/master/CMakeLists.txt'
statusChecked: '2026-09-28'
software: []
note: >-
  An ITU-T G.9959 (de)modulator for Z-Wave (started as a fork of
  andersesbensen/rtl-zwave). `wave-in` decodes Z-Wave frames from a raw I/Q
  stream piped in from an RTL-SDR (`rtl_sdr`) or HackRF; `wave-out` encodes
  frames and transmits them through `hackrf_transfer`. The rtl_433-style entry
  point for getting Z-Wave packets off a cheap SDR.
---
An ITU-T G.9959 (de)modulator for Z-Wave (started as a fork of andersesbensen/rtl-zwave). `wave-in` decodes Z-Wave frames from a raw I/Q stream piped in from an RTL-SDR (`rtl_sdr`) or HackRF; `wave-out` encodes frames and transmits them through `hackrf_transfer`. The rtl_433-style entry point for getting Z-Wave packets off a cheap SDR.
