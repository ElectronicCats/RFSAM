---
slug: mobileinsight-core
name: MobileInsight
vendor: MobileInsight (UCLA/Purdue)
type: software
protocols:
  - LTE
status: stale
statusNote: >-
  Last release and Android app are 6.0.0 from March 2022 and the last commit is
  June 2022; install failures on Ubuntu 22.04 and Python 3.10+ are reported in
  open, unmerged issues and PRs. SCAT, which is maintained, parses Qualcomm and
  Samsung diagnostic messages into GSMTAP for Wireshark.
statusSource: 'https://github.com/mobile-insight/mobileinsight-core/releases'
statusChecked: '2026-09-28'
repo: 'https://github.com/mobile-insight/mobileinsight-core'
homepage: 'http://www.mobileinsight.net'
note: >-
  Passive UE-side cellular analyzer: decodes the device's own LTE control-plane
  messages (RRC, NAS, paging, measurement reports) from a diagnostic feed, so
  you can observe paging/tracking and measurement behaviour and confirm the
  effect of an attack from the victim UE's perspective.
---
Passive UE-side cellular analyzer: decodes the device's own LTE control-plane messages (RRC, NAS, paging, measurement reports) from a diagnostic feed, so you can observe paging/tracking and measurement behaviour and confirm the effect of an attack from the victim UE's perspective.
