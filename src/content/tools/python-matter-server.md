---
slug: python-matter-server
name: Python Matter Server
vendor: Open Home Foundation / Nabu Casa
type: software
protocols:
  - Thread
  - Wi-Fi
  - BLE
repo: 'https://github.com/matter-js/python-matter-server'
status: eol
statusNote: >-
  Rewritten and moved to matterjs-server; its README names 8.1.2 as the final
  Python release, with no further updates.
statusChecked: 2026-09-23
note: >-
  A CSA-certified Matter Controller Server (the one behind Home Assistant's
  Matter integration) that wraps the CHIP SDK and exposes commissioning and the
  operational cluster model over a WebSocket API. Acts as a standing
  controller/commissioner you can drive programmatically — commission a node
  over BLE, then enumerate and exercise its clusters. Maintenance mode (being
  rebuilt on matter.js), but a real, working Matter controller.
---
A CSA-certified Matter Controller Server (the one behind Home Assistant's Matter integration) that wraps the CHIP SDK and exposes commissioning and the operational cluster model over a WebSocket API. Acts as a standing controller/commissioner you can drive programmatically — commission a node over BLE, then enumerate and exercise its clusters. Maintenance mode (being rebuilt on matter.js), but a real, working Matter controller.
