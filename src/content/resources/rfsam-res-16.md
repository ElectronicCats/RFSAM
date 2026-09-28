---
id: RFSAM-RES-16
title: Survey and capture IEEE 802.15.4 (Zigbee / Thread)
---
Find the channel first with an energy / cativity scan (Zigbee/Thread pin one of the 16 channels 11 to 26 at 2.4 GHz), then park a real 802.15.4 radio on it, an nRF52840 (nRF Sniffer), a CatSniffer (catnip), a CC2531 (whsniff) or a KillerBee radio, and stream the raw frames into Wireshark over its extcap, where the 802.15.4 + Zigbee/6LoWPAN/Thread dissector decodes MAC, NWK and (with the network key) the upper layers. Crucially, capture a device *joining*, that is where the key is transported and where the network opens up.
