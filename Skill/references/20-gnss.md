# 20 — GNSS / GPS

> Wayfinder + controles RFSAM para GNSS. Señales civiles **sin cifrado ni autenticación** → ataque = imitar.
> **⚠ Spoofing/jamming GNSS al aire es delito en casi todas las jurisdicciones — solo conducción/cable + jaula.**

## Facts
- **Banda**: L-band. GPS L1 1575.42 MHz · L2 1227.60 · L5 1176.45. Vecinos: GLONASS L1 ~1602, Galileo E1 1575.42 (overlap GPS L1), BeiDou B1 1561.098.
- **Señal (GPS L1 C/A)**: BPSK en carrier 1575.42 MHz; 1023-chip C/A spreading 1.023 Mcps repite cada 1 ms; nav message 50 bps. Un PRN code por sat (CDMA).
- **Constelaciones**: GPS (US) · GLONASS (RU) · Galileo (EU) · BeiDou (CN) + regionales QZSS/NavIC. 4+ sats en view para PVT.
- **Seguridad**: civiles (GPS C/A, GLONASS, BeiDou B1, Galileo E1 OS) **sin cifrado ni autenticación** — estructura pública. Military P(Y)/M-code cifrado, fuera de scope. Galileo OSNMA adds auth opcional; legacy C/A ninguna.
- **Potencia en receptor**: muy débil — ~-125 a -130 dBm, **bajo el noise floor**; recuperada solo despreadiendo el PRN conocido. Por eso una señal atacante ligeramente más fuerte captura el receptor.

## Descenso por capa

### IG (fingerprinting)
- Constelaciones/bandas que trackea (GPS-only L1, multi-constellation, multi-band L1/L2/L5). Señales civiles unauthenticated — no hay key ni credencial, solo signal to imitate. Chipset (FCC ID, NMEA vendor strings), anti-spoof (RAIM, consistency) / anti-jam. Comportamiento al perder fix (coast/alarm/aceptar primer reacquire — esto último explota spoof). El módulo u-blox NEO da NMEA/UBX directo.

### SP — `RFSAM-GNSS-SP-01` Signal presence and interference survey
- **Objetivo**: confirmar L-band presente y juzgar ambiente RF. La señal GNSS está bajo noise floor — en waterfall buscas lo **wrong**: carrier fuerte o hump wideband sobre L1 = jammer/interferencia; banda limpia/quieta = sana.
- **Kit**: Gqrx (HackRF/bladeRF/USRP/RTL-SDR; RTL-SDR con bias-tee para antena activa). Receptor GPS std (gpsd gpsmon/cgps o u-center) da C/N0 por sat.

### PHY (sin control — despreading en chip o software)
- Módulo GPS: PRN correlated en hardware del chip → lees NMEA/UBX. SDR: despreading en software (GNSS-SDR). Señal bajo noise floor hasta que algo correlaciona contra código conocido.

### LL (sin control — receptor = demod+decoder)
- Dos paths. (a) Everyday: receptor u-blox NEO USB/serial → NMEA 0183 + UBX → gpsd (gpsmon/cgps) o u-center. (b) SDR: raw L-band I/Q → GNSS-SDR → PVT + NMEA/RINEX. Sin Wireshark; output es position/time.

### CR (sin control — no hay crypto que romper)
- Civiles sin cifrado ni auth: spreading codes y format publicados → cualquiera decode, cualquiera generate. No session key (BLE pairing) ni handshake (WPA). P(Y)/M-code fuera de scope. Pregunta real = trust: ¿distingue receptor sat genuino de spoof? Galileo OSNMA firma nav message; RAIM/consistency checks. Legacy C/A no → por eso AT funciona.

### AT — `RFSAM-GNSS-AT-01` Spoofing and jamming resilience
- **⚠ AUTORIZADO + RF-CONTENIDO solo (jaula/conducción). TX GNSS al aire ilegal.** Sin auth, el ataque = imitar. **SPOOFING**: sintetiza GPS L1 C/A (RINEX ephemeris + track estático/móvil) a más potencia que sats reales → captura receptor, arrastra position/clock a valores atacante. **JAMMING**: flood L1 con noise/carrier, niega fix (resilience test). RTL-SDR RX-only (jamás transmite).
- **Kit**: gps-sdr-sim (síntesis + TX en HackRF/bladeRF/USRP), Gqrx (monitor jamming-resilience).
- **Caveat**: multi-constellation/OSNMA-aware pueden detectar/rechazar spoof GPS-only single-constellation.

### AP
- Sin app layer interactiva al aire: GNSS es one-way broadcast, no uplink/session. Impacto app = false position/time confiado por sistemas downstream (nav, geofencing, timestamps, PPS timing reference). Se evalúa en sistema victim (¿posición/tiempo falso causa comportamiento inseguro?).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de GNSS; los comandos verbatim viven en `Descenso por capa` arriba. Broadcast unidireccional — sin handshake ni clave.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Constelaciones/bandas que trackea el receptor identificadas. Anti-spoof/anti-jam del módulo documentados | — |
| SP → PHY | L-band presente; ambiente RF juzgado (carrier fuerte / hump = jammer; banda limpia = sano). RTL-SDR con bias-tee para antena activa | — |
| PHY → LL | Despreading (chip GPS en hardware o GNSS-SDR en software) → NMEA/UBX o PVT+RINEX | — |
| LL → CR | Sin crypto que romper (civiles sin auth). Pregunta real = trust: ¿distingue receptor sat genuino de spoof? | — |
| CR → AT | Legacy C/A sin auth → AT funciona. OSNMA/RAIM-aware pueden detectar/rechazar spoof single-constellation | — |
| AT | ⚠TX re-check; **jamás TX GNSS al aire** (delito). Solo conducción cableada + jaula. GPSDO blindado; receptor por cable | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): C/N0 anómalo (saltos, desvanecimientos selectivos), portadora fuerte sobre L1, o fix que salta a posición imposible = posible jamming/spoofing en tu entorno. Correlaciona con horario/ubicación; **no** desciendas a AT (Defensivo nunca TX).

## Advertencias legales
- RX pasivo L1 OK; GPS receiver normal OK.
- **Spoofing/jamming GNSS al aire = delito** (aviación, marítimo, infraestructura crítica). Solo conducción cableada + jaula de Faraday + autorización explícita.
