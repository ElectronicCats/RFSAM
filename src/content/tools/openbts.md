---
slug: openbts
name: OpenBTS
vendor: Range Networks
type: software
protocols:
  - GSM
repo: 'https://github.com/RangeNetworks/openbts'
status: eol
statusNote: >-
  Real development stopped in 2017 and openbts.org no longer resolves; Osmocom
  is the maintained path for standing up a BTS.
statusChecked: 2026-09-23
successor: osmo-bts
note: >-
  The original 'GSM in a box': a single application that presents a GSM air
  interface on a USRP and routes calls/SMS over SIP/Asterisk, replacing the
  traditional RAN+core. A self-contained alternative to the Osmocom stack for
  fake-BTS / IMSI-catcher work; build via the RangeNetworks 'dev' environment.
---
The original 'GSM in a box': a single application that presents a GSM air interface on a USRP and routes calls/SMS over SIP/Asterisk, replacing the traditional RAN+core. A self-contained alternative to the Osmocom stack for fake-BTS / IMSI-catcher work; build via the RangeNetworks 'dev' environment.
