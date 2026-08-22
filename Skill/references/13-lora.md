# 13 - LoRa / LoRaWAN

> Wayfinder + RFSAM controls for LoRa. RFSAM owns end-to-end.

## Facts
- **Band**: regional sub-GHz ISM - EU868 (863-870) - US915 (902-928) - AS923 - EU433 - AU915/CN470/IN865/KR920.
- **Modulation**: CSS (Chirp Spread Spectrum); spreading factor SF7-SF12 (higher SF = slower, more range).
- **Bandwidth**: 125/250/500 kHz in LoRaWAN.
- **MAC**: PHYPayload = MHDR | MACPayload | MIC(4B, AES-128-CMAC). MACPayload = FHDR(DevAddr,FCtrl,FCnt,FOpts)|FPort|FRMPayload.
- **Crypto**: FRMPayload AES-128 (AppSKey); MIC with NwkSKey. Root keys AppKey (1.0.x) / NwkKey+AppKey (1.1). Activation OTAA (keys derived on join) or ABP (static keys).
- **OTAA join**: JoinRequest = JoinEUI/AppEUI | DevEUI | DevNonce **in cleartext** (only MIC); JoinAccept encrypted. 1.0.x DevNonce random (replay); 1.1 monotonic counter + Join Server + split keys.

## Layer-by-layer descent

### IG (fingerprinting)
- Chipset (Semtech SX127x/SX126x/SX130x gateway), regional band, LoRaWAN version (1.0.x vs 1.1), activation mode (OTAA vs ABP), key management (per-device AppKey vs default/shared). Identifiers on air: DevAddr (data), DevEUI/JoinEUI/DevNonce (join, in cleartext).

### SP - `RFSAM-LORA-SP-01` Sub-band occupancy and capture
- **Objective**: where it transmits and confirm channel plan. RTL-SDR suffices (sub-GHz); see diagonal chirps on waterfall.
- **Kit**: Gqrx (RTL-SDR/HackRF); ChirpCat (RAK WisGate Connect, classification); catnip (SX1262 spectrum analyzer).
- **Command**: `gqrx` tuned to EU868/US915.

### PHY - `RFSAM-LORA-PHY-01` Chirp demodulation
- **Objective**: de-chirp CSS in software (multiply by down-chirp ref + FFT). gr-lora_sdr implements it.
- **Kit**: gr-lora_sdr (HackRF/USRP/bladeRF/RTL-SDR).

### LL - `RFSAM-LORA-LL-01` LoRaWAN frame profiling
- **Objective**: capture chirps -> LoRaWAN frames; parse MHDR/MType, FHDR(DevAddr, FCnt), join (JoinEUI/DevEUI/DevNonce in cleartext). Payload remains AES-128.
- **Kit**: gr-lora_sdr, LoRAttack (multichannel USRP), ChirpCat (gateway uplink+downlink), WHAD/STM32WLxx, catnip (LoRa/Meshtastic), LoRa Wideband Decoder.
- **Decoder**: Wireshark (LoRaTap).

### CR - `RFSAM-LORA-CR-01` Join and session-key assessment
- **Objective**: assess crypto - there is no brute force of random AES-128. Weaknesses: default/shared AppKey, ABP static keys without rotation, DevNonce reuse (1.0.x replay).
- **Kit**: Loracrack (weak AppKey -> derives session keys, validates MIC), LAF (IOActive, parse/crack/forge).
- **Command**: `loracrack` on a PCAP with join + data + candidate AppKey.
- **Honesty note**: does NOT break strong AES-128.

### AT (no dedicated control - active techniques)
- **[!] MANDATORY AUTHORIZATION** (transmits sub-GHz ISM). Replay uplink/join (especially 1.0.x DevNonce / ABP FCnt reset), forge with session keys (CatSniffer TX, LAF), fuzz network server (ChirpStack).
- **Kit**: LoRAttack (replay/craft), CatSniffer (LoRa TX fuzzing vs ChirpStack), LAF (forge+send).

### AP
- Payload encrypted with AES-128; once you have the AppSKey, you decrypt with the same tools. Server-side (ChirpStack app server) is outside the RF toolchain.

## Subflow (specialization of the master flow)

LoRa-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | Radio+MAC identified; regional band fixes the center (EU868/US915...) | - |
| SP -> PHY | CSS diagonal chirps confirmed on waterfall. RTL-SDR suffices (sub-GHz); devices are duty-cycle limited | - |
| PHY -> LL | PHYPayload recovered (de-chirp in software: down-chirp ref x signal -> FFT) | - |
| LL -> CR | PHYPayload parsed. App payload **always AES-128** (cleartext only if misconfigured ABP) | - |
| CR -> AT | Weak/shared AppKey or static ABP keys confirmed. **No** brute force of random AES-128; 1.0.x DevNonce reuse = vector | - |
| AT | [!]TX re-check; respect ISM duty-cycle/power. 1.0.x DevNonce replay; ABP FCnt reset | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): chirps in your band **without a known own gateway** = unknown device or replay. Correlate with schedule/activity.

## Legal warnings
- Passive RX sub-GHz OK.
- **TX/replay/forge = active**: respect ISM duty-cycle/power; own/authorized network only.
- Falsifying telemetry of a third-party sensor (meter, alarm) = fraud/sabotage.
