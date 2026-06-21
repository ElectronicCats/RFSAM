# 11 — Bluetooth Classic (BR/EDR)

> Wayfinder + controles RFSAM para Bluetooth Classic. Deferencia BSAM en link-and-above.
> **Honestidad**: tooling BR/EDR accesible es más joven/delgado que BLE/Wi-Fi; casi todo corre en el ESP32 original ($5).

## Facts
- **Banda**: 2.402–2.480 GHz — 79 canales RF × 1 MHz, **adaptive frequency hopping ~1600 hops/s**. Ese hop rápido es lo que lo hace difícil de seguir con SDR estático.
- **Modulación/rate**: Basic Rate (BR) GFSK 1 Mbps; EDR π/4-DQPSK 2 Mbps y 8DPSK 3 Mbps.
- **Identificadores**: 48-bit BD_ADDR (24 altos = OUI/vendor), Class of Device (CoD) hint de tipo.
- **Seguridad**: legacy PIN pairing (PIN corto → offline attack); Secure Simple Pairing SSP ECDH (P-192 2.1, P-256 4.1+) — "Just Works" sin MITM. Cifrado E0 (legacy) o AES-CCM. **KNOB** downgrade de entropía de clave.
- **Topología**: piconet 1 master + ≤7 slaves; perfiles SDP, RFCOMM, HID, A2DP/HFP, OBEX. Targets: headsets, HID, infotainment, OBD-II, PoS.

## Descenso por capa

### IG — `RFSAM-BTC-IG-01` Identify device, BR/EDR mode and vulnerability corpus
- **Objetivo**: ¿habla BR/EDR (Classic), dual-mode o LE-only? Fingerprint SoC/host stack, cruzar CVEs (BlueBorne, KNOB, BrakTooth).
- **Kit**: ESP32 (DevKit original, único con radio BR/EDR), `esp32-classic-bt-scan` (inquiry), `esp32-bt-exp` (dual-mode dump). FCC ID/teardown.
- **Deferencia**: BSAM-IG-02/03/04. `deferred: true`. Ataques: BlueBorne (CVE-2017-1000251), KNOB (CVE-2019-9506), BrakTooth (≈16 CVEs).

### SP — `RFSAM-BTC-SP-01` Inquiry-scan and confirm reachable BR/EDR device
- **Objetivo**: confirmar transmite y enumerar dispositivos descubribles (análogo a advertising scan BLE).
- **Kit**: Gqrx (waterfall — actividad, no decode limpio por hop rápido), `esp32-classic-bt-scan` (inquiry real BR/EDR → BD_ADDR/name/RSSI/CoD).
- **Caveat**: solo ve dispositivos en discoverable/inquiry-scan; no-discoverable hay que conocer BD_ADDR.

### PHY (sin control — hop frustra SDR estático)
- Decoding live GFSK/DQPSK mientras hoppa 1600/s es impráctico para SDR. La captura práctica hace PHY+framing en un device con controlador BR/EDR real (ESP32 patched ROM).

### LL — `RFSAM-BTC-LL-01` Capture Bluetooth Classic baseband traffic
- **Objetivo**: capturar/decodificar frames baseband BR/EDR (BT header, channel, role, FHS, ACL, LMP).
- **Kit**: `esp32-bt-classic-sniffer` (patchea ROM Bluetooth ESP32 → dump baseband por USB serial → Python BTSnifferBREDR.py → Scapy/Wireshark); Ubertooth-tools (Basic-Rate parcial, legacy).
- **⚠ Sniffer activo**: se conecta al target para seguir hop (no puramente pasivo). Solo autorizado.
- **Deferencia**: BSAM. `deferred: true`.

### CR — `RFSAM-BTC-CR-01` Assess pairing and encryption key strength
- **Objetivo**: legacy PIN pairing con PIN corto/fijo → offline brute force recupera link key y descifra. SSP (ECDH) resiste offline. KNOB = downgrade de entropía (no break de E0/AES).
- **Sin tool point-and-click en hardware barato**: análisis de captura + controles BSAM pairing.
- **Ataques**: KNOB (CVE-2019-9506). `deferred: true`.

### AT — `RFSAM-BTC-AT-01` Test baseband/LMP resilience and availability
- **⚠ AUTORIZACIÓN OBLIGATORIA** (transmite 2.4 GHz, pokea device vivo).
- **Objetivo**: BrakTooth (≈16 CVEs, crash/deadlock/RCE en controllers BR/EDR de muchos SoC). KNOB downgrade + brute force. Jammer broadband 2.4 GHz (jamming ilegal salvo jaula).
- **Kit**: BrakTooth PoC (ESP32, fuzzing LMP/baseband), `esp32-bluejammer` (jam broadband 2.4 GHz con 2× nRF24L01+PA+LNA — **ilegal al aire**).
- **Deferencia**: BSAM. `deferred: true`.

### AP — `RFSAM-BTC-AP-01` Enumerate and exercise exposed BR/EDR profiles
- **Objetivo**: mapear superficie app — SDP, RFCOMM (AT commands hands-free/car), HID (keystroke injection), A2DP/HFP, OBEX.
- **Kit**: USB BT dongle + BlueZ host (`sdptool browse <BD_ADDR>`, `l2ping`, `bluetoothctl`, `obexftp`, HID/HFP utils).
- **Deferencia**: BSAM. `deferred: true`.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de BTC; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Modo BR/EDR confirmado (BrakTooth ≈16 CVEs, BlueBorne, KNOB) | — |
| SP → PHY | Dispositivo discoverable/inquiry-scan detectado. **1600 hops/s** → SDR estático no sigue el hop; inquiry scan (ESP32) es la vía | — |
| PHY+LL | 🔗BSAM: deferir LL+ a BSAM. El sniffer BR/EDR es **activo** (se conecta para seguir hop) → solo autorizado | 🔗BSAM |
| CR → AT | Just Works MITM o KNOB downgrade confirmados. SSP ECDH resiste offline | — |
| AT | ⚠TX re-check; ⚠ jamming broadband 2.4 GHz = jamming al aire (**RA3**, solo jaula). `esp32-bluejammer` necesita nRF24L01+PA+LNA | ⚠TX |
| AP | Único protocolo con control AP formal (`RFSAM-BTC-AP-01`): perfiles SDP/RFCOMM/HID/A2DP/OBEX | — |

**Anomalía defensiva** (modo Defensivo, RX-only): BR/EDR no tiene superficie de stalking tan común como BLE; vigila dispositivos **no emparejados** haciendo probes LMP/SDP contra tus hosts (posible BlueBorne/BrakTooth).

## Advertencias legales
- RX pasivo (lo poco viable con SDR) OK.
- **Sniffer activo, BrakTooth, jamming, HID injection = activos**: solo propios/autorizados. BrakTooth cae/RCea devices vivos. Jamming 2.4 GHz ilegal al aire.
