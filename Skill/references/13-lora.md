# 13 — LoRa / LoRaWAN

> Wayfinder + controles RFSAM para LoRa. RFSAM dueño end-to-end.

## Facts
- **Banda**: sub-GHz ISM regional — EU868 (863–870) · US915 (902–928) · AS923 · EU433 · AU915/CN470/IN865/KR920.
- **Modulación**: CSS (Chirp Spread Spectrum); spreading factor SF7–SF12 (mayor SF = más lento, más alcance).
- **Ancho de banda**: 125/250/500 kHz en LoRaWAN.
- **MAC**: PHYPayload = MHDR | MACPayload | MIC(4B, AES-128-CMAC). MACPayload = FHDR(DevAddr,FCtrl,FCnt,FOpts)|FPort|FRMPayload.
- **Crypto**: FRMPayload AES-128 (AppSKey); MIC con NwkSKey. Claves raíz AppKey (1.0.x) / NwkKey+AppKey (1.1). Activación OTAA (claves derivadas en join) o ABP (claves estáticas).
- **Join OTAA**: JoinRequest = JoinEUI/AppEUI | DevEUI | DevNonce **en claro** (solo MIC); JoinAccept cifrado. 1.0.x DevNonce aleatorio (replay); 1.1 contador monótono + Join Server + split keys.

## Descenso por capa

### IG (fingerprinting)
- Chipset (Semtech SX127x/SX126x/SX130x gateway), banda regional, versión LoRaWAN (1.0.x vs 1.1), modo activación (OTAA vs ABP), gestión de claves (AppKey per-device vs default/compartido). Identifiers en aire: DevAddr (data), DevEUI/JoinEUI/DevNonce (join, en claro).

### SP — `RFSAM-LORA-SP-01` Sub-band occupancy and capture
- **Objetivo**: dónde transmite y confirma channel plan. RTL-SDR basta (sub-GHz); ver chirps diagonales en waterfall.
- **Kit**: Gqrx (RTL-SDR/HackRF); ChirpCat (RAK WisGate Connect, classification); catnip (SX1262 spectrum analyzer).
- **Comando**: `gqrx` tuneado a EU868/US915.

### PHY — `RFSAM-LORA-PHY-01` Chirp demodulation
- **Objetivo**: de-chirp CSS en software (multiplica por down-chirp ref + FFT). gr-lora_sdr lo implementa.
- **Kit**: gr-lora_sdr (HackRF/USRP/bladeRF/RTL-SDR).

### LL — `RFSAM-LORA-LL-01` LoRaWAN frame profiling
- **Objetivo**: capturar chirps → frames LoRaWAN; parsear MHDR/MType, FHDR(DevAddr, FCnt), join (JoinEUI/DevEUI/DevNonce en claro). Payload queda AES-128.
- **Kit**: gr-lora_sdr, LoRAttack (multicanal USRP), ChirpCat (gateway uplink+downlink), WHAD/STM32WLxx, catnip (LoRa/Meshtastic), LoRa Wideband Decoder.
- **Decoder**: Wireshark (LoRaTap).

### CR — `RFSAM-LORA-CR-01` Join and session-key assessment
- **Objetivo**: evaluar crypto — no hay brute force de AES-128 aleatorio. Debilidades: AppKey default/compartido, ABP claves estáticas sin rotación, DevNonce reuse (1.0.x replay).
- **Kit**: Loracrack (weak AppKey → deriva session keys, valida MIC), LAF (IOActive, parse/crack/forge).
- **Comando**: `loracrack` sobre PCAP con join + data + AppKey candidata.
- **Honestidad**: NO rompe AES-128 fuerte.

### AT (sin control dedicado — técnicas activas)
- **⚠ AUTORIZACIÓN OBLIGATORIA** (transmite sub-GHz ISM). Replay uplink/join (especialmente 1.0.x DevNonce / ABP FCnt reset), forge con session keys (CatSniffer TX, LAF), fuzz network server (ChirpStack).
- **Kit**: LoRAttack (replay/craft), CatSniffer (LoRa TX fuzzing vs ChirpStack), LAF (forge+send).

### AP
- Payload AES-128 cifrado; una vez con AppSKey, descifras con las mismas herramientas. Server-side (ChirpStack app server) fuera del toolchain RF.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de LoRa; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Radio+MAC identificados; banda regional fija el centro (EU868/US915…) | — |
| SP → PHY | Chirps diagonales CSS confirmados en waterfall. RTL-SDR basta (sub-GHz); devices duty-cycle limited | — |
| PHY → LL | PHYPayload recuperado (de-chirp en software: down-chirp ref × señal → FFT) | — |
| LL → CR | PHYPayload parseado. App payload **AES-128 siempre** (claro solo si ABP mal configurado) | — |
| CR → AT | AppKey débil/compartida o claves ABP estáticas confirmadas. **No** brute force de AES-128 aleatorio; 1.0.x DevNonce reuse = vector | — |
| AT | ⚠TX re-check; respeta duty-cycle/potencia ISM. 1.0.x DevNonce replay; ABP FCnt reset | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): chirps en tu banda **sin gateway propio conocido** = dispositivo desconocido o replay. Correlaciona con horario/actividad.

## Advertencias legales
- RX pasivo sub-GHz OK.
- **TX/replay/forge = activo**: respeta duty-cycle/potencia ISM; solo red propia/autorizada.
- Falsificar telemetría de un sensor ajeno (meter, alarma) = fraude/sabotaje.
