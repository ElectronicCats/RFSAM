# 00 — Taxonomía RFSAM

> **Leer siempre al inicio de toda auditoría.** Define los dos ejes de indexación de RFSAM
> (protocolo × capa), los IDs, la rubrica de criticidad, el coverage-map completo y la
> deferencia a BSAM. Fuente: `RFSAM/src/lib/taxonomy.js`, `src/data/layers.js`,
> `src/data/protocols.js`, `src/data/criticality.js`, `src/data/coverage-map.js`,
> `src/data/bsamRelation.js`.

## Índice
1. Las 7 capas de la metodología
2. Los 15 protocolos
3. Reglas del ID de control
4. Rubrica de criticidad
5. Ciclo de vida reviewStatus / confidence
6. Coverage-map completo (todos los controles por protocolo)
7. Relación RFSAM ↔ BSAM (deferencia)

---

## 1. Las 7 capas de la metodología

Una auditoría RF recorre un **descenso** top-down. IG es pre-descenso; SP→AP es el descenso.

| ID | Capa | Color | Qué pregunta |
|----|------|-------|--------------|
| `IG` | Info Gathering | #C9D4E0 | Identificar componentes y cruzar CVEs antes de tocar el aire |
| `SP` | Spectrum | #2FB8E0 | Qué transmite, dónde, y si tu radio lo puede ver |
| `PHY` | Signal / PHY | #3FD17C | De forma de onda a bits: modulación, demodulación, canalización |
| `LL` | Link / Protocol | #9B8CFF | Estructura de trama, direccionamiento, identificadores, discovery |
| `CR` | Crypto | #FFC24B | Pairing, intercambio de claves, confidencialidad e integridad del enlace |
| `AT` | Attack | #FF7A1A | Interacción activa: inyección, replay, hijack, infraestructura rogue |
| `AP` | Application | #FF5A5F | Lo que el dispositivo confía sobre el enlace: auth, firmas, updates |

**Principio rector**: el descenso es top-down. No se salta a CR/AT sin haber pasado por SP/PHY/LL.
La captura limpia es el piso de todo lo demás. "No observado" bajo una ventana de radio limitada
es un **gap de visibilidad, no evidencia de ausencia**.

## 2. Los 15 protocolos

| ID | Nombre | Banda | Prefijo | Estado |
|----|--------|-------|---------|--------|
| `BLE` | Bluetooth Low Energy | 2.400–2.480 GHz | RFSAM-BLE | deepen |
| `BTC` | Bluetooth Classic | 2.402–2.480 GHz (BR/EDR) | RFSAM-BTC | new |
| `WIFI` | Wi-Fi (802.11) | 2.4 / 5 / 6 GHz | RFSAM-WIFI | deepen |
| `LORA` | LoRa / LoRaWAN | ISM sub-GHz (US915 / EU868) | RFSAM-LORA | deepen |
| `LTE` | LTE / 4G | Celular licenciado | RFSAM-LTE | deepen |
| `RFID` | RFID / NFC | 125 kHz LF / 13.56 MHz HF | RFSAM-RFID | deepen |
| `SUBG` | Sub-GHz ISM / Remotes | 315 / 433 / 868 / 915 MHz | RFSAM-SUBG | deepen |
| `ZIGBEE` | Zigbee / 802.15.4 | 2.4 GHz (+ 868/915 MHz) | RFSAM-ZIGBEE | new |
| `ZWAVE` | Z-Wave | Sub-GHz regional (~868/908 MHz) | RFSAM-ZWAVE | new |
| `THREAD` | Thread / Matter | 2.4 GHz (802.15.4) | RFSAM-THREAD | new |
| `GNSS` | GNSS / GPS | L-band (GPS L1 1575.42 MHz) | RFSAM-GNSS | new |
| `ADSB` | ADS-B (aviación) | 1090 MHz / 978 MHz UAT | RFSAM-ADSB | new |
| `NR5G` | 5G NR | FR1 sub-6 GHz / FR2 mmWave | RFSAM-NR5G | new |
| `GSM` | GSM / 2G | 850 / 900 / 1800 / 1900 MHz | RFSAM-GSM | new |
| `UWB` | Ultra-Wideband | 3.1–10.6 GHz | RFSAM-UWB | new |

## 3. Reglas del ID de control

Formato: **`RFSAM-<PROTOCOL>-<LAYER>-<NN>`** — ej. `RFSAM-BLE-AT-01`.

- `<PROTOCOL>` ∈ los 15 IDs de arriba.
- `<LAYER>` ∈ `IG SP PHY LL CR AT AP`.
- `<NN>` = número de secuencia de dos dígitos.

**Invariante validada**: los segmentos PROTOCOL y LAYER del ID **deben coincidir** con los campos
`protocol` y `layer` del frontmatter/control. Si no coinciden, es un error.

Regex: `^RFSAM-(BLE|BTC|WIFI|LORA|LTE|RFID|SUBG|ZIGBEE|ZWAVE|THREAD|GNSS|ADSB|NR5G|GSM|UWB)-(IG|SP|PHY|LL|CR|AT|AP)-\d{2}$`

## 4. Rubrica de criticidad

| Nivel | Color | Cuándo |
|-------|-------|--------|
| `info` | #8B9AAB | Observacional; sin impacto directo (ej. viabilidad de captura) |
| `low` | #3FD17C | Exposición menor o brecha de endurecimiento |
| `medium` | #FFC24B | Debilidad significativa que requiere condiciones específicas |
| `high` | #FF7A1A | Debilidad fácilmente explotable con impacto significativo |
| `critical` | #FF5A5F | Compromiso total (toma de control, recuperación de clave, suplantación) |

**Regla**: la severidad refleja lo que **alcanzaste** con evidencia, no el máximo teórico.

## 5. Ciclo de vida reviewStatus / confidence

- `stub` → esqueleto migrado, poco contenido real.
- `draft` → investigado y citado, puede llevar `[!FLAG]` sin resolver. Lo que produce un sub-agente.
- `reviewed` → citas y método confirmados, pero el field case es plantilla ilustrativa.
- `verified` → revisado Y demostrado con un field case real; ≥1 referencia, cero `[!FLAG]`.

`confidence` ∈ `low medium high` — autoevaluación honesta del borrador.

## 6. Coverage-map completo

Mapa de todos los controles que RFSAM define (uno por celda protocolo×capra relevante).
`status: existing` = existe archivo; muchos son `stub`s a profundizar.

**BLE**: IG-01 (vulns SoC/host stack) · SP-01 (channel map) · PHY-01 (demod/bit recovery) ·
LL-01 (advertising/identifier exposure) · LL-02 (connection-data capture) · CR-01 (pairing/encryption) · AT-01 (hijack live connection)

**BTC**: IG-01 (identify device/BR-EDR/vuln corpus) · SP-01 (inquiry-scan) · LL-01 (baseband capture) · CR-01 (pairing/key strength) · AT-01 (LMP resilience) · AP-01 (exposed profiles)

**WIFI**: SP-01 (band/channel survey) · LL-01 (management-frame exposure) · CR-01 (WPA handshake/PMKID)

**LORA**: SP-01 (sub-band occupancy) · PHY-01 (chirp demod) · LL-01 (LoRaWAN frame profiling) · CR-01 (join/session-key)

**LTE**: IG-01 (baseband/modem vulns) · SP-01 (cell ID/capture) · PHY-01 (resource-grid) · LL-01 (control-channel/identity exposure)

**RFID**: SP-01 (carrier/standard ID) · CR-01 (Crypto1/key strength) · AT-01 (clone/emulate/relay)

**SUBG**: SP-01 (burst discovery) · PHY-01 (demod/framing) · LL-01 (frame/addressing recovery) · CR-01 (rolling-code) · AT-01 (replay/forge)

**ZIGBEE**: SP-01 (channel survey) · LL-01 (PAN/addressing/discovery) · CR-01 (network-key provisioning)

**ZWAVE**: SP-01 (region/frequency ID) · CR-01 (key establishment)

**THREAD**: LL-01 (mesh discovery/commissioning exposure) · CR-01 (network credential)

**GNSS**: SP-01 (signal presence/interference survey) · AT-01 (spoofing/jamming resilience)

**ADSB**: PHY-01 (message capture/decode) · LL-01 (message authenticity) · AT-01 (forge/inject, lab contenido)

**NR5G**: SP-01 (cell ID/capture) · LL-01 (broadcast/identity exposure)

**GSM**: SP-01 (ARFCN survey) · CR-01 (cipher/identity exposure)

**UWB**: PHY-01 (ranging signal capture) · AT-01 (distance-manipulation resilience)

> El script `scripts/coverage_check.py` automatiza la comparación contra este mapa.

## 7. Relación RFSAM ↔ BSAM

**RFSAM es complementario a BSAM (Tarlogic), no un reemplazo.** BSAM es la referencia madura para
Bluetooth; RFSAM es el norte multi-protocolo.

### Ownership
- **Spectrum (SP) + Signal/PHY** → RFSAM es dueño para todos los protocolos. BSAM no cubre aquí.
- **BLE link layer y arriba** → heredado de BSAM. RFSAM añade solo el prerequisito de captura RF
  y referencia los controles BSAM-xx específicos.
- **LoRa/LoRaWAN, LTE, y el resto** → RFSAM es dueño end-to-end. BSAM es solo Bluetooth.

### Registro BSAM que RFSAM referencia
- `BSAM-IG-01` Bluetooth controller lifecycle status
- `BSAM-IG-02` Bluetooth controller vulnerabilities
- `BSAM-IG-03` Host stack vulnerabilities
- `BSAM-IG-04` Standard vulnerabilities
- `BSAM-DI-03` Generic device naming
- `BSAM-DI-04` Sensitive data exposure
- `BSAM-DI-06` Use random MAC address
- `BSAM-PA-01` Device pairing mode
- `BSAM-PA-04` Rejection of legacy pairing
- `BSAM-PA-05` Pairing without interaction
- `BSAM-AU-03` Forced disconnection
- `BSAM-EN-01` Role switch before encryption
- `BSAM-EN-02` Force use of encryption
- `BSAM-EN-03` Minimum encryption key size
- `BSAM-SE-03` Service access control
- `BSAM-AP-05` Replay attacks
- `BSAM-AP-06` Packet injection

URL BSAM: <https://www.tarlogic.com/bsam/>

**Regla**: cuando un control BLE/BTC es `deferred: true`, NO redirivas el contenido de BSAM.
Describe solo el prerequisito de captura RF y cita el control BSAM (`BSAM-XX-NN`) al que se entrega.
