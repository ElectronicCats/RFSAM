---
slug: gr-zwave_poore
name: gr-zwave_poore
vendor: Chris Poore (cpoore1)
type: software
protocols:
  - Z-Wave
repo: 'https://github.com/cpoore1/gr-zwave_poore'
status: mature
statusNote: >-
  Upstream has had no commit since 2022-08-28, but FISSURE pulls it in as a git
  submodule and its installers build it on Ubuntu, Kali, DragonOS, Raspberry Pi
  OS, Parrot and BackBox. The default maint-3.10 branch is for GNU Radio 3.10
  and later.
statusSource: 'https://github.com/ainfosec/FISSURE/blob/Python3/.gitmodules'
statusChecked: '2026-09-28'
software: []
note: >-
  A GNU Radio out-of-tree module that transmits (and helps decode) Z-Wave
  signals, tested with a USRP B210; integrated into AINFOSEC's FISSURE RF
  framework. Branches for GNU Radio 3.7/3.8/3.10. A GNU Radio block path for
  Z-Wave TX when you want a flowgraph rather than the Scapy-radio stack.
---
A GNU Radio out-of-tree module that transmits (and helps decode) Z-Wave signals, tested with a USRP B210; integrated into AINFOSEC's FISSURE RF framework. Branches for GNU Radio 3.7/3.8/3.10. A GNU Radio block path for Z-Wave TX when you want a flowgraph rather than the Scapy-radio stack.
