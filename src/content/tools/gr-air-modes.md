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
  Upstream stopped in February 2021 on its gr3.9 branch, and Debian packages
  that snapshot (0.0.20210211-3.1 in trixie and sid) built against GNU Radio
  3.10.12. Debian carries two small patches (library soname, NumPy float), not a
  GNU Radio port.
statusSource: 'https://sources.debian.org/src/gr-air-modes/0.0.20210211-3.1/debian/changelog/'
statusChecked: '2026-09-28'
note: >-
  A GNU Radio Mode S / ADS-B receiver: a flowgraph that demodulates 1090 MHz and
  decodes the Extended Squitter, with a live map output. The choice when you
  want the signal inside a GNU Radio flowgraph to see and modify each DSP block
  rather than a black-box decoder. Older codebase (last active ~2021), a
  learning/DSP receiver rather than a polished aggregator.
---
A GNU Radio Mode S / ADS-B receiver: a flowgraph that demodulates 1090 MHz and decodes the Extended Squitter, with a live map output. The choice when you want the signal inside a GNU Radio flowgraph to see and modify each DSP block rather than a black-box decoder. Older codebase (last active ~2021), a learning/DSP receiver rather than a polished aggregator.
