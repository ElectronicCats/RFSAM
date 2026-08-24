---
slug: imsi-catcher
name: IMSI-catcher (Oros42)
vendor: Oros42
type: software
protocols:
  - GSM
repo: 'https://github.com/Oros42/IMSI-catcher'
note: >-
  Python tool that reads the GSMTAP stream produced by gr-gsm and pulls the IMSI
  / TMSI identities the network pages over the air, printing the cellphones it
  sees around you. A PASSIVE IMSI catcher, it harvests identities off the
  broadcast/control channels without transmitting anything (no rogue cell); the
  active catcher is a rogue BTS (osmo-bts / OpenBTS).
---
Python tool that reads the GSMTAP stream produced by gr-gsm and pulls the IMSI / TMSI identities the network pages over the air, printing the cellphones it sees around you. A PASSIVE IMSI catcher, it harvests identities off the broadcast/control channels without transmitting anything (no rogue cell); the active catcher is a rogue BTS (osmo-bts / OpenBTS).
