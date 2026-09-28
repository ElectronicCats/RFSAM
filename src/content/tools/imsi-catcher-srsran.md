---
slug: imsi-catcher-srsran
name: srsRAN active IMSI catcher
vendor: roskeys
type: software
protocols:
  - LTE
status: research
statusNote: >-
  A demonstration made by modifying srsRAN 4G, described by its author as made
  for research purpose and to demonstrate how an IMSI catcher works. All commits
  date from 2024-12-14 and there are no releases.
statusSource: 'https://github.com/roskeys/imsi-catcher'
statusChecked: '2026-09-28'
repo: 'https://github.com/roskeys/imsi-catcher'
note: >-
  A small research project that modifies srsRAN_4G's srsENB into an active IMSI
  catcher, stands up a fake base station that lures UEs and issues an identity
  request to extract the IMSI over the unauthenticated pre-AKA NAS exchange. A
  concrete worked example of the IMSI-catcher attack on srsRAN.
---
A small research project that modifies srsRAN_4G's srsENB into an active IMSI catcher, stands up a fake base station that lures UEs and issues an identity request to extract the IMSI over the unauthenticated pre-AKA NAS exchange. A concrete worked example of the IMSI-catcher attack on srsRAN.
