---
slug: seemoo-uwb-sniffer
name: SEEMOO uwb-sniffer
vendor: 'SEEMOO Lab, TU Darmstadt'
type: software
protocols:
  - UWB
repo: 'https://github.com/seemoo-lab/uwb-sniffer'
status: research
statusNote: >-
  The artefact behind Ghost Peak (USENIX Security 2022), not a push-button
  capture tool. The Decawave SDK its README requires is no longer
  downloadable.
statusChecked: 2026-09-23
note: >-
  The reference OPEN UWB sniffer: firmware for a Qorvo DWM3000EVB driven by a
  host (a NUCLEO-F429ZI in the reference build; an nRF52840 with code changes)
  that captures IEEE 802.15.4z UWB frames and forwards them to Wireshark over a
  sensniff named pipe, with timestamps at the DW3000's 15.65 ps accuracy. Comes
  out of the SEEMOO/ETH Ghost Peak line of research. Honest limits: UWB has many
  PHY parameters (channel, preamble code, data rate, STS mode and length) that
  must be known IN ADVANCE to lock onto a link, and it forwards malformed frames
  too — so it is a research instrument, not a push-button capture. It does NOT
  break the STS or recover keys; it captures the over-the-air frames you can
  already decode.
---
The reference OPEN UWB sniffer: firmware for a Qorvo DWM3000EVB driven by a host (a NUCLEO-F429ZI in the reference build; an nRF52840 with code changes) that captures IEEE 802.15.4z UWB frames and forwards them to Wireshark over a sensniff named pipe, with timestamps at the DW3000's 15.65 ps accuracy. Comes out of the SEEMOO/ETH Ghost Peak line of research. Honest limits: UWB has many PHY parameters (channel, preamble code, data rate, STS mode and length) that must be known IN ADVANCE to lock onto a link, and it forwards malformed frames too — so it is a research instrument, not a push-button capture. It does NOT break the STS or recover keys; it captures the over-the-air frames you can already decode.
