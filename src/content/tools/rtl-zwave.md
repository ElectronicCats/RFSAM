---
slug: rtl-zwave
name: rtl-zwave
vendor: Anders Esbensen (andersesbensen)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/andersesbensen/rtl-zwave'
software: []
status: mature
statusNote: >-
  Frozen G.9959 demodulator: the classic PHY did not change, though it does
  not decode Z-Wave Long Range. The 2023 commit only added a licence file.
statusChecked: 2026-09-23
note: >-
  The original G.9959 (Z-Wave) demodulator for the RTL-SDR: pipe `rtl_sdr`
  samples into it and it prints decoded Z-Wave frames. Lightweight,
  receive-only, and the codebase Waving-Z grew out of — a minimal way to confirm
  Z-Wave traffic and read frame headers on a ~$30 dongle.
---
The original G.9959 (Z-Wave) demodulator for the RTL-SDR: pipe `rtl_sdr` samples into it and it prints decoded Z-Wave frames. Lightweight, receive-only, and the codebase Waving-Z grew out of — a minimal way to confirm Z-Wave traffic and read frame headers on a ~$30 dongle.
