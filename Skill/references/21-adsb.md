# 21 — ADS-B (aviación)

> Wayfinder + controles RFSAM para ADS-B. Broadcast **sin cifrado ni autenticación** → injection trivial (en lab).
> **⚠ 1090 MHz = espectro protegido de aviación. Forjar/inject al aire es delito grave. Solo conducción + jaula.**

## Facts
- **Banda**: 1090 MHz Mode S Extended Squitter (1090ES) mundial; 978 MHz UAT (Universal Access Transceiver) adicional en US para general aviation baja cota.
- **Señal (1090ES)**: Pulse-Position Modulation (PPM) 1 Mbps en carrier 1090 MHz; Extended Squitter = 112-bit message (8 µs preamble + 112 µs data). 978 UAT waveform ~1.04 Mbps, message 272-bit.
- **Mensajes**: ADS-B "out" en Mode S downlink format DF17 (transponder) y DF18 (non-transponder/TIS-B). Cada uno lleva 24-bit ICAO aircraft address + type code: identification (callsign), airborne/surface position (CPR-encoded), velocity.
- **Identificadores**: ICAO 24-bit (radio ID único), callsign 8-char, CPR-encoded lat/lon. **Ninguno autenticado** → todos forjables.
- **Seguridad**: broadcast y **sin cifrado**. Estructura pública. **No hay auth ni integrity** → receiver no distingue frame genuino de forjado → spoofing/injection posibles.

## Descenso por capa

### IG (fingerprinting — lo que escuchas)
- Qué link: 1090ES (mundial) vs 978 UAT (US general aviation). Link unauthenticated/unencrypted — positions, callsigns, ICAO en claro, no integrity check. ICAO 24-bit = ID único en cada frame. DF17 vs DF18 mix, type codes. Setup RX: antena quarter-wave (~6.9 cm) + 1090 MHz band-pass filter + LNA para débil/distante.

### SP — parte de PHY (confirmar energía 1090)
- 1090 MHz dentro de casi cualquier SDR. En waterfall pulses bursty al squitter (sobre noise floor, visible). RTL-SDR = 1090 receiver canónico, llega 1090 y 978.

### PHY — `RFSAM-ADSB-PHY-01` Message capture and decode
- **Objetivo**: receive+decode ADS-B frames (plaintext broadcast). Tune 1090 → demod PPM → validate CRC → DF17/DF18 (ICAO, callsign, CPR position, velocity). 978 UAT → dump978.
- **Kit**: dump1090 (RTL-SDR, classic), readsb (high-perf fork), dump978 (US UAT), gr-air-modes (GNU Radio).
- **Decoder**: no Wireshark; output es frames decoded en Beast/raw/JSON para mapa/plausibility.

### LL — `RFSAM-ADSB-LL-01` Message authenticity assessment
- **Objetivo**: ¿qué garantías de autenticidad, si alguna, provee el link? (Respuesta: ninguna — base de injection).

### CR (sin control — no hay nada que descifrar)
- Plaintext broadcast: format y CPR encoding públicos. Positions/callsigns/ICAO leídos (decoded), no crackeados. Problema real = opuesto de confidencialidad: **no auth ni integrity**. Receiver no prueba frame del aircraft que dice; no signature sobre position; no replay protection. Ese gap de diseño = lo que hace AT posible: cualquiera que transmita frame 1090ES bien formado es, para todo receiver en rango, indistinguible de aircraft real.

### AT — `RFSAM-ADSB-AT-01` Forge and inject (lab contenido obligatorio)
- **⚠ 1090 MHz = espectro de aviación protegido. TX ADS-B afecta systems ATC reales. Solo lab autorizado por CONDUCCIÓN/CABLE o JAULA — jamás al aire.** Sin auth, ataque = imitar: transmitir frames 1090ES forjados (ICAO/callsign/position elegidos) → todo receiver en rango acepta como aircraft real → ghost aircraft, mover track existente, o flood el cuadro. RTL-SDR RX-only.
- **Kit**: ADSB-Out (encoder Python → I/Q → TX HackRF via hackrf_transfer).
- **Caveat**: autor states académico solo; estable pero inactivo (~2021).

### AP
- "Air picture": stream decoded → tracked aircraft + fusión + plausibility. Donde se defiende missing auth: sanity-check del broadcast. tar1090 (mapa live interactivo), pyModeS (decode en código → anti-spoof/plausibility checks: kinematics imposibles, inconsistency cross-receiver, ICAO sospechoso). MLAT (multilateration cross-receiver) = cross-check anti-spoof estándar.
- **Kit**: tar1090 (map desde readsb/dump1090), pyModeS (decode + plausibility).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de ADS-B; los comandos verbatim viven en `Descenso por capa` arriba. Broadcast **sin auth ni integrity** → todos los IDs forjables.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Link identificado (1090ES mundial vs 978 UAT US). Setup RX: antena quarter-wave (~6.9 cm) + filtro 1090 + LNA | — |
| SP → PHY+LL | Pulses bursty sobre noise floor al squitter. RTL-SDR llega 1090 y 978 | — |
| PHY+LL → CR | Frames decodificados (ICAO/callsign/CPR position/velocity). Sin cifrado → nada que descifrar; el problema es **opuesto**: no auth | — |
| CR → AT | Sin auth/integrity/replay-protection confirmado → cualquier frame 1090ES bien formado es indistinguible de aircraft real. AT funciona | — |
| AT | ⚠TX re-check; **1090 MHz = aviación protegida**, TX afecta ATC real. Solo conducción + jaula + autorización. RTL-SDR RX-only jamás transmite | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): aircraft ghost (ICAO/callsign que aparece/desaparece), kinematics imposibles, o inconsistencia cross-receiver = posible inyección. pyModeS (plausibility checks) y MLAT (multilateration) son cross-checks anti-spoof. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo 1090/978 OK (señales públicas; base de trackers como Flightradar24).
- **TX/forge ADS-B al aire = delito grave** (espectro aviación, safety-of-life). Solo conducción cableada + jaula + autorización. Nunca radiar.
