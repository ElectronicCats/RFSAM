# 19 — Thread / Matter

> Wayfinder + controles RFSAM para Thread/Matter. Thread = mesh IPv6 sobre 802.15.4; Matter monta encima.

## Facts
- **Banda**: 2.4 GHz ISM — IEEE 802.15.4 O-QPSK (misma capa radio que Zigbee).
- **Canales**: 16 × 5 MHz, 11–26 (2.405–2.480); red Thread en un canal.
- **Stack**: mesh IPv6: 802.15.4 MAC → 6LoWPAN → MLE routing → UDP. Matter (CHIP) encima.
- **Seguridad Thread**: MAC AES-128-CCM* con network key — link crypto fuerte. Commissioning: Commissioner auth con PSKc; Joiner admitido con PSKd via DTLS.
- **Matter transport**: Thread (via Border Router) o Wi-Fi; comisionado sobre BLE LE. DNS-SD: `_matterc._udp` (commissionable), `_matter._tcp` (operational), `_meshcop._udp` (Border Router Thread).
- **Matter onboarding**: QR (`MT:` Base-38) / 11-digit manual code → 27-bit setup passcode + 12-bit discriminator + 16-bit Vendor ID + ProductID.
- **Matter crypto**: PASE = SPAKE2+ (P-256) desde setup passcode (solo ventana comisionado); CASE = cert (NOC bajo Root CA, SIGMA P-256) operational. **Passcode = weak link, no el cipher**.

## Descenso por capa

### IG (fingerprinting — leer QR/label)
- ¿Thread o Zigbee? (ambos 802.15.4 — distinguir por upper layers 6LoWPAN+MLE). ¿Matter device? QR/numeric code + BLE onboarding. Resolver VID/PID contra **DCL** (Distributed Compliance Ledger — Test-Vendor VID 0xFFF1–0xFFF4 en producto shipping = red flag). Chipset/SDK + CVEs (CASE Sigma1-replay CVE-2024-3297, fabric-footprinting CVE-2024-3454).
- **Kit**: matter-dcl (resolve VID/PID), chip-tool (decode payload + discover BLE/DNS-SD).

### SP — cómo ver la banda (parte de LL Thread)
- Thread vive en un canal 802.15.4. Gqrx (banda), Minino (scanner 802.15.4), catnip (cativity + topology). BLE onboarding de Matter vive en advertising channels BLE (ver wayfinder BLE).

### PHY (sin control — demod en radio 802.15.4)
- Las radios 802.15.4 demod+frame juntas; SDR solo para encontrar canal.

### LL — `RFSAM-THREAD-LL-01` Mesh discovery and commissioning exposure
- **Objetivo**: park radio 802.15.4 en canal → PCAP. MAC payload AES-128-CCM* bajo network key; Wireshark descifra con esa key.
- **Kit**: nRF Sniffer 802.15.4 (nRF52840), pyspinel (OpenThread NCP/RCP sniffer), CatSniffer, Minino, WHAD (nRF52840/APIMote).
- **Decoder**: Wireshark (802.15.4 + Thread/6LoWPAN/MLE).
- (Matter BLE commissioning handshake = captura BLE separada — ver wayfinder BLE.)

### CR — `RFSAM-THREAD-CR-01` Network credential assessment
- **Objetivo**: honestidad — crypto fuerte (AES-128-CCM*, SPAKE2+, CASE cert). **No offline key-recovery**. El premio es la Thread network key: viene de credenciales de comisioning débiles/default/expuestas (PSKc/Joiner PSKd). Matter PASE solo tan fuerte como setup passcode (default/printable → colapsa). Verifier extraído de device inseguro → offline recovery (baja entropía). Online guessing rate-limited (~20 intentos → sale de commissioning mode; ventana ≤15 min en fabric).
- **Kit**: Wireshark (descifra Thread con network key en tabla decryption-keys), chip-tool (PASE/passcode test con candidato).
- **Sin herramienta de crackeo offline** — ataca comisioning/credenciales.

### AT (sin control dedicado — comisioning/fabric abuse)
- **⚠ AUTORIZACIÓN OBLIGATORIA**. La superficie real es comisioning/fabric onboarding: unirse al mesh con creds capturadas/adivinadas (pyspinel), o comisionar Matter device con ventana BLE abierta/passcode débil (chip-tool `pairing ble-thread`). Multi-admin: ventana de comisioning puede abrirse/hijackearse. Controller **no prueba trustworthiness** al device → quien pase comisioning = admin total.
- **Kit**: pyspinel (join/probe mesh), chip-tool (commission onto fabric), chip-repl (script multi-fabric).

### AP
- Matter clusters/atributos sobre CASE (read/write/invoke/subscribe). ACL que refrena admin recién añadido. Comisionado = admin total → app layer suele wide open.
- **Kit**: chip-tool (cluster interaction), chip-repl (enum cluster tree), python-matter-server (controller persistente).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de Thread/Matter; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | ¿Thread o Zigbee? (distinguir por upper layers 6LoWPAN+MLE). Matter device: QR/code + BLE onboarding. VID/PID contra DCL | — |
| SP → PHY+LL | Canal 802.15.4 fijado (2.4 GHz, 16 canales 11–26, **no hoppa**); radio aparcada. SDR no decodifica O-QPSK/DSSS live | — |
| PHY+LL → CR | MAC payload AES-128-CCM* bajo network key — Wireshark descifra con esa key. Thread crypto fuerte | — |
| CR → AT | Sin offline key-recovery. Premios: comisioning débil/default (PSKc/PSKd), Matter PASE limitado por setup passcode | — |
| AT | ⚠TX re-check; comisioning/fabric onboarding = superficie real. Join/probe mesh (pyspinel), commission Matter (chip-tool) | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): device desconocido intentando commissioning sobre tu fabric, o ventana BLE de comisioning abierta sin actividad propia = posible fabric hijack. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo 802.15.4 OK.
- **Join/commission/inject = activo**: solo mesh/fabric propio/autorizado. Comisionar device ajeno = acceso no autorizado.
