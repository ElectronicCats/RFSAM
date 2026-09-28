---
slug: ez-wave
name: EZ-Wave
vendor: Joseph Hall & Ben Ramsey (AFIT)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/cureHsu/EZ-Wave'
status: stale
statusNote: >-
  The original AFITWiSec/EZ-Wave GitHub repository now returns 404; what remains
  is a copy under another account whose last commit is dated 2016-01-17. Its
  README requires Python 2.7 and GNU Radio 3.7+ and says it was tested on Ubuntu
  14.04 only.
statusSource: 'https://github.com/cureHsu/EZ-Wave'
statusChecked: '2026-09-28'
software: []
note: >-
  The reference open Z-Wave assessment suite (GNU Radio + Scapy-radio):
  ezstumbler does passive discovery and active network enumeration, ezrecon
  interrogates a device (manufacturer/model, firmware version, supported command
  classes, configuration), and ezfingerprint identifies the Z-Wave module
  generation via a PHY preamble-length manipulation. Default config drives two
  HackRF One SDRs. Python 2.7 / GNU Radio 3.7 era, dated but still the canonical
  exploitation toolkit.
---
The reference open Z-Wave assessment suite (GNU Radio + Scapy-radio): ezstumbler does passive discovery and active network enumeration, ezrecon interrogates a device (manufacturer/model, firmware version, supported command classes, configuration), and ezfingerprint identifies the Z-Wave module generation via a PHY preamble-length manipulation. Default config drives two HackRF One SDRs. Python 2.7 / GNU Radio 3.7 era, dated but still the canonical exploitation toolkit.
