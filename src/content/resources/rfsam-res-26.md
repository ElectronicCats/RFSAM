---
id: RFSAM-RES-26
title: Inquiry-scan Bluetooth Classic devices with an ESP32
---
The BR/EDR analogue of a BLE advertising scan is an inquiry scan, and an ESP32 can run a real one using its own Bluetooth Classic controller through the Bluedroid GAP API, no SDR required. AntorFr's `ClassicBTScan` and esp32beans's `ESP32-BT-exp` (a dual-mode Classic + BLE scanner) both bring up the stack and enumerate each discoverable device's 48-bit BD_ADDR, friendly name, RSSI and Class of Device, which together hint at the device type before any deeper RF work. This only sees devices currently in discoverable / inquiry-scan mode; a non-discoverable device will not answer and must already be addressed by a known BD_ADDR. It also requires the original ESP32 with the BR/EDR radio, the ESP32-S3 and C-series are LE-only and cannot run Classic inquiry. Treat it as the cheap "is anything Classic here, and what is it?" enumeration step that feeds the rest of the descent.
