---
slug: gr-gsm
name: gr-gsm
vendor: Piotr Krysik
type: software
protocols:
  - GSM
status: mature
statusNote: >-
  Upstream master stopped on 2021-05-05, but Debian and Kali ship
  1.0.0~20220727-3, taken from bkerler's maint-3.10_with_multiarfcn branch and
  built against GNU Radio 3.10.12.
statusSource: 'https://sources.debian.org/src/gr-gsm/1.0.0~20220727-3/debian/changelog/'
statusChecked: '2026-09-28'
repo: 'https://github.com/ptrkrysik/gr-gsm'
note: >-
  GNU Radio blocks and tools to receive and demodulate the GSM downlink from an
  SDR. grgsm_livemon tunes a found ARFCN, demodulates the GMSK bursts, decodes
  the control channels (BCCH/CCCH/SDCCH) and forwards the frames as GSMTAP over
  UDP to Wireshark. The de-facto open-source GSM receiver, successor to
  airprobe.
---
GNU Radio blocks and tools to receive and demodulate the GSM downlink from an SDR. grgsm_livemon tunes a found ARFCN, demodulates the GMSK bursts, decodes the control channels (BCCH/CCCH/SDCCH) and forwards the frames as GSMTAP over UDP to Wireshark. The de-facto open-source GSM receiver, successor to airprobe.
