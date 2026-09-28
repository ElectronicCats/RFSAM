---
slug: dwm3000-dwt-driver
name: DW3000 driver / firmware (foldedtoad port)
vendor: 'open source (Callender), on Qorvo dwt_uwb_driver'
type: project
protocols:
  - UWB
repo: 'https://github.com/foldedtoad/dwm3000'
status: stale
statusNote: >-
  README requires Zephyr 3.6 (Zephyr stable is 4.4.2) and the last commit is
  2024-05-13. README states the nRF52840 (PCA10056) + DWS3000 combination is not
  completely functional, while nRF52832 is fully functional.
statusSource: 'https://github.com/foldedtoad/dwm3000/blob/master/README.md'
statusChecked: '2026-09-28'
note: >-
  An open port of Qorvo/Decawave's DWM3000 driver and ranging examples (the
  dwt_uwb_driver API) to the DWS3000 Arduino shield, runnable under Zephyr. The
  practical glue for bringing up a DW3000 board, configuring its 802.15.4z PHY
  parameters (channel, preamble, PRF, STS mode), and running two-way-ranging
  exchanges you can log, the dev-board path for capturing/characterising ranging
  behaviour. A development driver, not an attack tool.
---
An open port of Qorvo/Decawave's DWM3000 driver and ranging examples (the dwt_uwb_driver API) to the DWS3000 Arduino shield, runnable under Zephyr. The practical glue for bringing up a DW3000 board, configuring its 802.15.4z PHY parameters (channel, preamble, PRF, STS mode), and running two-way-ranging exchanges you can log, the dev-board path for capturing/characterising ranging behaviour. A development driver, not an attack tool.
