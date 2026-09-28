---
slug: esp32-airtag-scanner
name: ESP32 AirTag Scanner
vendor: MatthewKuKanich
type: project
protocols:
  - BLE
repo: 'https://github.com/MatthewKuKanich/ESP32-AirTag-Scanner'
status: mature
statusNote: >-
  Matches only the Apple Find My manufacturer-data patterns (1E FF 4C 00 and 4C
  00 12 19), so it does not match the DULT service-data payload (UUID 0xFCB2)
  that second-generation AirTags are reported to send near their owner. Last
  commit 2024-04-08, 5 commits, no license file.
statusSource: >-
  https://github.com/MatthewKuKanich/ESP32-AirTag-Scanner/blob/main/AirTag_Scanner.ino
statusChecked: '2026-09-28'
note: >-
  ESP32 firmware that scans for Apple AirTag / Find My MAC addresses and BLE
  payloads without an Android phone or nRF Connect (~110 stars, last push
  2024-04). Passive scan only, no spoofing or emulation; output over UART.
  Supports ESP32-WROOM and ESP32-S3. Useful at the survey step to detect
  trackers in the environment.
---
ESP32 firmware that scans for Apple AirTag / Find My MAC addresses and BLE payloads without an Android phone or nRF Connect (~110 stars, last push 2024-04). Passive scan only, no spoofing or emulation; output over UART. Supports ESP32-WROOM and ESP32-S3. Useful at the survey step to detect trackers in the environment.
