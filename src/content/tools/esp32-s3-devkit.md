---
slug: esp32-s3-devkit
name: ESP32-S3 DevKitC
vendor: Espressif
type: hardware
protocols:
  - Wi-Fi
  - BLE
spec: Xtensa LX7 dual-core · 2.4 GHz Wi-Fi · Bluetooth 5 (LE) · native USB-OTG
homepage: >-
  https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html
software:
  - esp32-marauder
  - bruce
  - ghost-esp
  - esp32-sour-apple
  - esp32-airtag-scanner
status: active
statusNote: >-
  Listed by Espressif among current ESP32-S3 development boards, not under its
  EOL boards section. The documentation moved from esp-idf to esp-dev-kits and
  the old URL returns a 301 redirect to the new page.
statusSource: >-
  https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/index.html
statusChecked: '2026-09-28'
note: >-
  Espressif's ESP32-S3: LX7 dual-core with Bluetooth 5 (LE), native USB-OTG and
  more RAM than the original ESP32, which is why most modern handheld pentest
  boards (Cardputer, LilyGo T-series) are S3-based. Supported by Marauder, Bruce
  and Ghost ESP, and the BLE-capable target for the focused BLE tools. Note: the
  S3 has BLE but NO Bluetooth Classic radio, for BR/EDR work use the original
  ESP32.
---
Espressif's ESP32-S3: LX7 dual-core with Bluetooth 5 (LE), native USB-OTG and more RAM than the original ESP32, which is why most modern handheld pentest boards (Cardputer, LilyGo T-series) are S3-based. Supported by Marauder, Bruce and Ghost ESP, and the BLE-capable target for the focused BLE tools. Note: the S3 has BLE but NO Bluetooth Classic radio, for BR/EDR work use the original ESP32.
