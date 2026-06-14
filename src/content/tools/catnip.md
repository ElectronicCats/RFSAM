---
name: catnip
vendor: Electronic Cats
type: software
ec: true
protocols:
  - BLE
  - Zigbee
  - 802.15.4
  - Sub-GHz
  - LoRa
repo: 'https://github.com/ElectronicCats/CatSniffer-Tools'
note: >-
  The CatSniffer host toolset (CatSniffer-Tools). Its pycatsniffer drives a
  CatSniffer to sniff IEEE 802.15.4 / Zigbee and BLE with native Wireshark
  extcap integration; it also presents the CatSniffer as a virtual HCI (vHCI)
  Bluetooth adapter on Linux so host BLE tools like Bleak and bettercap can
  drive it. On the sub-1 GHz side the CatSniffer's Semtech SX1262 reads and
  transmits (G)FSK packets (and LoRa/Meshtastic) over a scriptable serial
  bridge, and the CC1352P sniffer firmware adds IEEE 802.15.4g into Wireshark.
---
The CatSniffer host toolset (CatSniffer-Tools). Its pycatsniffer drives a CatSniffer to sniff IEEE 802.15.4 / Zigbee and BLE with native Wireshark extcap integration; it also presents the CatSniffer as a virtual HCI (vHCI) Bluetooth adapter on Linux so host BLE tools like Bleak and bettercap can drive it. On the sub-1 GHz side the CatSniffer's Semtech SX1262 reads and transmits (G)FSK packets (and LoRa/Meshtastic) over a scriptable serial bridge, and the CC1352P sniffer firmware adds IEEE 802.15.4g into Wireshark.
