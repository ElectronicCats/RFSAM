---
slug: esp32-wifi-penetration-tool
name: ESP32 Wi-Fi Penetration Tool
vendor: risinek
type: project
protocols:
  - Wi-Fi
repo: 'https://github.com/risinek/esp32-wifi-penetration-tool'
status: mature
statusNote: >-
  Developed against ESP-IDF 4.1; building on ESP-IDF 5.x needs patches that
  exist only as an unmerged PR (61) and an open issue (143). Prebuilt binaries
  from 2021-05-05 are shipped in the repo's build/ directory.
statusSource: 'https://github.com/risinek/esp32-wifi-penetration-tool/issues/143'
statusChecked: '2026-09-28'
note: >-
  Focused ESP-IDF framework for ESP32 Wi-Fi attacks (~2.9k stars, MIT, last push
  2024-02). Captures WPA/WPA2 PMKIDs and 4-way handshakes (passively, via a
  rogue duplicate AP, or by forcing re-auth), formats captures to PCAP and
  converts them to a hashcat-ready HCCAPX; also runs deauthentication and DoS
  attacks. Driven entirely from an on-device management-AP web UI, no screen
  needed. Includes a WSL bypasser to emit arbitrary 802.11 frames on a plain
  ESP32.
---
Focused ESP-IDF framework for ESP32 Wi-Fi attacks (~2.9k stars, MIT, last push 2024-02). Captures WPA/WPA2 PMKIDs and 4-way handshakes (passively, via a rogue duplicate AP, or by forcing re-auth), formats captures to PCAP and converts them to a hashcat-ready HCCAPX; also runs deauthentication and DoS attacks. Driven entirely from an on-device management-AP web UI, no screen needed. Includes a WSL bypasser to emit arbitrary 802.11 frames on a plain ESP32.
