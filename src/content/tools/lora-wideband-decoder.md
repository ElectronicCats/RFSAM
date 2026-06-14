---
name: LoRa Wideband Decoder
vendor: persistentcache
type: software
protocols:
  - LoRa
  - LoRaWAN
  - Meshtastic
repo: 'https://github.com/persistentcache/Lora-Wideband-Decoder'
note: >-
  Self-hosted wideband LoRa intercept receiver: streams wideband IQ from a
  SoapySDR/bladeRF SDR and decodes Meshtastic, LoRaWAN and MeshCore across
  SF7-SF12 at every standard bandwidth (62.5/125/250/500 kHz) in software,
  near-real-time, surfacing decoded packets, node identities and a live spectrum
  waterfall in a local Flask web UI. Captures the whole sub-band at once (~28
  Msps on a multi-core host) rather than one channel — validated on bladeRF
  (native, 28 Msps) and USRP B210/B205mini (SoapyUHD).
---
Self-hosted wideband LoRa intercept receiver: streams wideband IQ from a SoapySDR/bladeRF SDR and decodes Meshtastic, LoRaWAN and MeshCore across SF7-SF12 at every standard bandwidth (62.5/125/250/500 kHz) in software, near-real-time, surfacing decoded packets, node identities and a live spectrum waterfall in a local Flask web UI. Captures the whole sub-band at once (~28 Msps on a multi-core host) rather than one channel — validated on bladeRF (native, 28 Msps) and USRP B210/B205mini (SoapyUHD).
