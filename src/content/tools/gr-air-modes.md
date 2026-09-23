---
slug: gr-air-modes
name: gr-air-modes
vendor: Nick Foster (bistromath)
type: software
protocols:
  - ADS-B
repo: 'https://github.com/bistromath/gr-air-modes'
status: mature
statusNote: >-
  Debian patches it against current GNU Radio; Mode S and ADS-B did not
  change.
statusChecked: 2026-09-23
note: >-
  A GNU Radio Mode S / ADS-B receiver: a flowgraph that demodulates 1090 MHz and
  decodes the Extended Squitter, with a live map output. The choice when you
  want the signal inside a GNU Radio flowgraph to see and modify each DSP block
  rather than a black-box decoder. Older codebase (last active ~2021) — a
  learning/DSP receiver rather than a polished aggregator.
---
A GNU Radio Mode S / ADS-B receiver: a flowgraph that demodulates 1090 MHz and decodes the Extended Squitter, with a live map output. The choice when you want the signal inside a GNU Radio flowgraph to see and modify each DSP block rather than a black-box decoder. Older codebase (last active ~2021) — a learning/DSP receiver rather than a polished aggregator.
