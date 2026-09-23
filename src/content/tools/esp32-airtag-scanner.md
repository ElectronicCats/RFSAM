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
  Detects Find My separated mode, which is unchanged. It misses the second-
  generation AirTag's DULT payload when the tag is near its owner.
statusChecked: 2026-09-23
note: >-
  ESP32 firmware that scans for Apple AirTag / Find My MAC addresses and BLE
  payloads without an Android phone or nRF Connect (~110 stars, last push
  2024-04). Passive scan only — no spoofing or emulation; output over UART.
  Supports ESP32-WROOM and ESP32-S3. Useful at the survey step to detect
  trackers in the environment.
---
ESP32 firmware that scans for Apple AirTag / Find My MAC addresses and BLE payloads without an Android phone or nRF Connect (~110 stars, last push 2024-04). Passive scan only — no spoofing or emulation; output over UART. Supports ESP32-WROOM and ESP32-S3. Useful at the survey step to detect trackers in the environment.
