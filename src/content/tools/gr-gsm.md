---
slug: gr-gsm
name: gr-gsm
vendor: Piotr Krysik
type: software
protocols:
  - GSM
repo: 'https://github.com/ptrkrysik/gr-gsm'
status: mature
statusNote: >-
  Upstream frozen in 2021, but Debian and Kali package bkerler's maint-3.10
  fork, which builds against current GNU Radio.
statusChecked: 2026-09-23
note: >-
  GNU Radio blocks and tools to receive and demodulate the GSM downlink from an
  SDR. grgsm_livemon tunes a found ARFCN, demodulates the GMSK bursts, decodes
  the control channels (BCCH/CCCH/SDCCH) and forwards the frames as GSMTAP over
  UDP to Wireshark. The de-facto open-source GSM receiver, successor to
  airprobe.
---
GNU Radio blocks and tools to receive and demodulate the GSM downlink from an SDR. grgsm_livemon tunes a found ARFCN, demodulates the GMSK bursts, decodes the control channels (BCCH/CCCH/SDCCH) and forwards the frames as GSMTAP over UDP to Wireshark. The de-facto open-source GSM receiver, successor to airprobe.
