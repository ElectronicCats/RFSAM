---
id: RFSAM-RES-11
title: Wi-Fi monitor-mode capture and survey
---
Put a monitor-mode-capable adapter (e.g. ALFA AWUS036ACH / RTL8812AU, or ESP32-C6 Minino) into monitor mode, channel-hop across 2.4/5/6 GHz, and capture all 802.11 frames. Confirm injection support with `aireplay-ng --test` before relying on active controls. Add GPS for wardriving/geolocation of APs.
