---
slug: openbts
name: OpenBTS
vendor: Range Networks
type: software
protocols:
  - GSM
repo: 'https://github.com/RangeNetworks/openbts'
status: stale
statusNote: >-
  Last functional commit upstream is from March 2017, with only a copyright-year
  commit in 2021 and build-fix PRs left unmerged. Osmocom's osmo-bts is actively
  maintained (last commit August 2026).
statusSource: 'https://github.com/RangeNetworks/openbts/commits/master'
statusChecked: '2026-09-28'
successor: osmo-bts
note: >-
  The original 'GSM in a box': a single application that presents a GSM air
  interface on a USRP and routes calls/SMS over SIP/Asterisk, replacing the
  traditional RAN+core. A self-contained alternative to the Osmocom stack for
  fake-BTS / IMSI-catcher work; build via the RangeNetworks 'dev' environment.
---
The original 'GSM in a box': a single application that presents a GSM air interface on a USRP and routes calls/SMS over SIP/Asterisk, replacing the traditional RAN+core. A self-contained alternative to the Osmocom stack for fake-BTS / IMSI-catcher work; build via the RangeNetworks 'dev' environment.
