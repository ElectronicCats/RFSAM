---
slug: falcon
name: FALCON
vendor: falkenber9 (TU Dortmund)
type: software
protocols:
  - LTE
status: eol
statusNote: >-
  Last commit 2020-11-23 and last release v1.3.0 (2020-11-08); it requires a
  patched srsLTE 18.09. Open issues report build failures on ARM (#14) and
  against SoapySDR 0.8 (#7).
statusSource: 'https://github.com/falkenber9/falcon/issues/14'
statusChecked: '2026-09-28'
successor: ltesniffer
repo: 'https://github.com/falkenber9/falcon'
note: >-
  Fast Analysis of LTE Control channels, built on srsRAN to blind-decode the
  entire PDCCH in real time, exposing every DCI/RNTI scheduling grant in a cell.
  A passive view of live control-channel activity and resource usage. Its last
  commit is from November 2020 and it builds against a patched srsLTE 18.09.
  LTESniffer, also in this catalogue, is implemented on top of FALCON and was
  updated more recently (2024).
---
Fast Analysis of LTE Control channels, built on srsRAN to blind-decode the entire PDCCH in real time, exposing every DCI/RNTI scheduling grant in a cell. A passive view of live control-channel activity and resource usage. Its last commit is from November 2020 and it builds against a patched srsLTE 18.09. LTESniffer, also in this catalogue, is implemented on top of FALCON and was updated more recently (2024).
