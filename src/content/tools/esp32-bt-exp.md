---
slug: esp32-bt-exp
name: ESP32-BT-exp
vendor: esp32beans
type: software
protocols:
  - Bluetooth Classic
  - BLE
repo: 'https://github.com/esp32beans/ESP32-BT-exp'
status: eol
statusNote: >-
  A single-commit demo sketch; the official arduino-esp32 examples cover the
  same ground and are maintained.
statusChecked: 2026-09-23
note: >-
  An Arduino-ESP32 sketch that brings up the Bluedroid stack in dual-mode
  (Classic + BLE) and dumps discovered devices in pairing/inquiry mode (MIT).
  Discovery only — no pairing or connection. Classic (BR/EDR) discovery needs
  the original ESP32, not the C-series, which has no Bluetooth Classic radio.
---
An Arduino-ESP32 sketch that brings up the Bluedroid stack in dual-mode (Classic + BLE) and dumps discovered devices in pairing/inquiry mode (MIT). Discovery only — no pairing or connection. Classic (BR/EDR) discovery needs the original ESP32, not the C-series, which has no Bluetooth Classic radio.
