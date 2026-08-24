---
id: RFSAM-RES-07
title: Capture and decode LoRa / LoRaWAN
---
Capture the ISM sub-band to I/Q, de-chirp with a soft-decision LoRa demodulator (gr-lora_sdr class), then parse the LoRaWAN frame: MHDR, MType, DevAddr, and, for joins, AppEUI/DevEUI/DevNonce in clear; application payload remains AES-128 encrypted. Classify by MType to profile the network passively.
