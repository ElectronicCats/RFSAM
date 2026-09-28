---
slug: esp32-classic-bt-scan
name: ClassicBTScan
vendor: AntorFr
type: software
protocols:
  - Bluetooth Classic
repo: 'https://github.com/AntorFr/ClassicBTScan'
status: eol
statusNote: >-
  Espressif ships Bluetooth Classic discovery in arduino-esp32 with a maintained
  example (bt_classic_device_discovery, added 2021-04). This library's last
  commit is 2020-12-27 and issue 1, an undefined reference to
  BTAdvertisedDevice::getServiceUUID(), has been open since 2019-08-11.
statusSource: 'https://github.com/AntorFr/ClassicBTScan/issues/1'
statusChecked: '2026-09-28'
note: >-
  A small Arduino-ESP32 library that performs a true Bluetooth Classic (BR/EDR)
  inquiry scan via the Bluedroid GAP API, returning each discovered device's MAC
  address, name, RSSI and Class-of-Device (CoD). The BR/EDR analogue of a BLE
  advertising scan (MIT, last push 2020). Only finds devices in discoverable /
  inquiry-scan mode; pin it to a known ESP-IDF as it is unmaintained.
---
A small Arduino-ESP32 library that performs a true Bluetooth Classic (BR/EDR) inquiry scan via the Bluedroid GAP API, returning each discovered device's MAC address, name, RSSI and Class-of-Device (CoD). The BR/EDR analogue of a BLE advertising scan (MIT, last push 2020). Only finds devices in discoverable / inquiry-scan mode; pin it to a known ESP-IDF as it is unmaintained.
