---
slug: esp32-bt-classic-sniffer
name: ESP32 Bluetooth Classic Sniffer
vendor: Matheus Garbelini
type: software
protocols:
  - Bluetooth Classic
repo: 'https://github.com/Matheus-Garbelini/esp32_bluetooth_classic_sniffer'
note: >-
  The reference active BR/EDR sniffer on commodity ESP32 hardware (~$4–10; ~590
  stars, GPL-2.0). It patches the ESP32 ROM Bluetooth stack to dump baseband
  packets — BT header, channel, device role, FHS, ACL and LMP — over USB serial
  to a host Python tool (BTSnifferBREDR.py) with Scapy/Wireshark output. This is
  Bluetooth CLASSIC (BR/EDR), not BLE. It actively connects to the target, so
  authorised testing only.
---
The reference active BR/EDR sniffer on commodity ESP32 hardware (~$4–10; ~590 stars, GPL-2.0). It patches the ESP32 ROM Bluetooth stack to dump baseband packets — BT header, channel, device role, FHS, ACL and LMP — over USB serial to a host Python tool (BTSnifferBREDR.py) with Scapy/Wireshark output. This is Bluetooth CLASSIC (BR/EDR), not BLE. It actively connects to the target, so authorised testing only.
