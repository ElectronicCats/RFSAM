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
  The WPA2 target did not change and the prebuilt binaries work; building from
  source needs patches for ESP-IDF 5.x.
statusChecked: 2026-09-23
note: >-
  Focused ESP-IDF framework for ESP32 Wi-Fi attacks (~2.9k stars, MIT, last push
  2024-02). Captures WPA/WPA2 PMKIDs and 4-way handshakes (passively, via a
  rogue duplicate AP, or by forcing re-auth), formats captures to PCAP and
  converts them to a hashcat-ready HCCAPX; also runs deauthentication and DoS
  attacks. Driven entirely from an on-device management-AP web UI — no screen
  needed. Includes a WSL bypasser to emit arbitrary 802.11 frames on a plain
  ESP32.
---
Focused ESP-IDF framework for ESP32 Wi-Fi attacks (~2.9k stars, MIT, last push 2024-02). Captures WPA/WPA2 PMKIDs and 4-way handshakes (passively, via a rogue duplicate AP, or by forcing re-auth), formats captures to PCAP and converts them to a hashcat-ready HCCAPX; also runs deauthentication and DoS attacks. Driven entirely from an on-device management-AP web UI — no screen needed. Includes a WSL bypasser to emit arbitrary 802.11 frames on a plain ESP32.
