---
slug: rtl-zwave
name: rtl-zwave
vendor: Anders Esbensen (andersesbensen)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/andersesbensen/rtl-zwave'
status: mature
statusNote: >-
  Code unchanged since 2015-03-18; the only later commit (2023-09-17) added
  LICENSE.md. It demodulates the G.9959 FSK rates (9.6/40/100 kbps; G.9959
  01/2015 is still the edition in force) and has no support for the DSSS-OQPSK
  Z-Wave Long Range PHY.
statusSource: 'https://github.com/andersesbensen/rtl-zwave'
statusChecked: '2026-09-28'
software: []
note: >-
  The original G.9959 (Z-Wave) demodulator for the RTL-SDR: pipe `rtl_sdr`
  samples into it and it prints decoded Z-Wave frames. Lightweight,
  receive-only, and the codebase Waving-Z grew out of, a minimal way to confirm
  Z-Wave traffic and read frame headers on a ~$30 dongle.
---
The original G.9959 (Z-Wave) demodulator for the RTL-SDR: pipe `rtl_sdr` samples into it and it prints decoded Z-Wave frames. Lightweight, receive-only, and the codebase Waving-Z grew out of, a minimal way to confirm Z-Wave traffic and read frame headers on a ~$30 dongle.
