# 24 — Ultra-Wideband (UWB)

> Wayfinder + controles RFSAM para UWB (802.15.4z). Ranging seguro/distancia; **no hay clave que romper**.
> Ataque = manipulación física de distancia (Ghost Peak) — académico, especialista, sin tool push-button.

## Facts
- **Banda**: impulse-radio UWB ~3.1–10.6 GHz, >500 MHz ancho de canal por pulso. En práctica 2 canales dominan: ch5 6.5 GHz, ch9 8.0 GHz.
- **Estándar**: IEEE 802.15.4z, dos PHYs incompatibles — HRP (High Rate Pulse-repetition ~64/124.8 MHz PRF — el de phones/cars) y LRP (Low Rate, NXP/3db). Plus legacy 802.15.4-2011/4a (DW1000 gen vieja, sin STS).
- **Modulación**: impulse radio — pulsos RF sub-nanosegundo, no carrier continuo. Bit rates 850 kbps / 6.81 Mbps. **Time-of-flight** de pulsos (no signal strength) = distance → por eso difícil spoofear y tan preciso (~10 cm).
- **Propósito**: secure ranging / distance bounding y posicionamiento, NO data bulk. Two-Way Ranging (TWR), TDoA, PDoA/AoA. Usos: Apple U1/U2 (AirTag, iPhone Nearby Interaction), CCC Digital Key acceso coche, Samsung SmartTag+, FiRa RTLS.
- **Seguridad**: 802.15.4z adds **STS (Scrambled Timestamp Sequence)** — secuencia pseudo-random de pulsos keyed AES que el receiver correlaciona para autenticar timestamp de ranging → atacante no puede forjar/replayar pulse ranging legítimo. Superficie research = **manipulación física de distancia** (early-detect/preamble-injection en impulse waveform), NO crack AES.
- **Esquemas**: mismo radio, protocolos app encima — Apple Nearby Interaction (U1/U2), CCC Digital Key, FiRa (consortium RTLS/ranging cross-vendor).

## Descenso por capa

### IG (fingerprinting — muchos forks)
- Silicon: Qorvo/Decawave DW1000 = gen VIEJA (legacy 802.15.4-2011, sin STS); DW3000 (DW3110/DW3210) = moderna 802.15.4z con STS. NXP Trimension (SR040/SR150), Apple U1/U2 = otras families. PHY HRP (phones/AirTags/keys) vs LRP. Canal: casi siempre ch5 (6.5 GHz) o ch9 (8.0 GHz). Esquema app: Apple Nearby Interaction, CCC Digital Key, FiRa. UWB raramente solo — Apple/CCC bootstrap sobre BLE (y CCC también NFC) para session keys/STS. CVEs: Ghost Peak (Apple U1 + NXP/Qorvo), relay/distance-reduction/preamble-injection académico.

### SP (sin control — **no puedes "ver" UWB en waterfall normal**)
- Impulse-radio UWB: pulsos sub-nanosecond spread >500 MHz, intermittente, muy baja power spectral density → por diseño faint rise en noise floor, no peak. Dos cosas descartan SDRs comunes: **frecuencia** (ch5 6.5 GHz, ch9 8.0 GHz — **encima del tope 6 GHz** de HackRF/bladeRF/B210/SignalSDR; RTL-SDR 1.766 GHz ni hablar) y **ancho** (>500 MHz channel, estos radios ofrecen ~20–122 MHz). Único SDR cercano: USRP X410 (7.2 GHz, 400 MHz BW — llega a ch5, aún short del channel >500 MHz, $10k+, demod impulse software research-grade). En práctica: confirmas/capturas UWB con transceiver real que ya conozca el canal (DW3000 dev boards en LL), o para solo confirmar energía, un >500 MHz real-time spectrum analyser/scope.

### PHY (sin control — despread en transceiver DW3000)
- Ningún SDR commodity demod impulse-radio UWB. DW3000-class transceiver despreads pulsos contra channel/preamble conocido (y STS si secure ranging) y enmarca 802.15.4z packet en hardware. PHY+framing juntos en chip real. **Debes conocer PHY params** (channel, preamble code, PRF, data rate, STS mode/length) para lock — vienen del IG, no de scan.

### LL — `RFSAM-UWB-PHY-01` Ranging signal capture (PHY layer en RFSAM)
- **Objetivo**: capturar frames 802.15.4z con transceiver UWB real (nada más puede). Path open: SEEMOO uwb-sniffer — firmware para Qorvo DWM3000EVB driven por host MCU (NUCLEO-F429ZI ref build) → pull frames 802.15.4z off air → Wireshark via sensniff pipe con timestamps picosegundo. **Catch**: debes configurar radio con PHY params del link (channel, preamble, data rate, STS mode/length) — UWB no blind-scan. Alternativa off-the-shelf: Forthink sniffer software + Wireshark plugin (depende dongle comercial cerrado — flagged). Otra: DW3000 peer controlable (Makerfabs board, foldedtoad driver) para generar/log known ranging exchanges. **Ninguno derrota STS** — captura frames que ya puedes decode.
- **Kit**: seemoo-uwb-sniffer (DWM3000EVB + NUCLEO-F429ZI/nRF52840), forthink-uwb-sniffer (dongle comercial), dwm3000-dwt-driver (peer controlable).
- **Decoder**: Wireshark (sensniff).

### CR (sin control — **no hay clave que romper, ese es el punto de .4z**)
- STS = secuencia pseudo-random keyed AES que los dos ranging peers comparten → receiver correlaciona incoming impulse contra STS esperada → solo arrival time STS-authenticated es trusted como distance. Atacante sin STS key no puede forjar/replayar pulse ranging legítimo → no offline key recovery tipo BLE/Wi-Fi. STS key se intercambia sobre canal bootstrap separado (BLE Apple/CCC, NFC algunos CCC) — cualquier weakness crypto vive en **ese** handshake (ver wayfinder BLE/RFID), no en pulsos UWB. Superficie research genuina UWB = **física**: ¿se puede manipular time-of-flight al physical layer (early detection, preamble/pulse injection) sin key? Eso es AT. **No hay tool open de key-crack porque no hay ataque de key-crack.**

### AT — `RFSAM-UWB-AT-01` Distance-manipulation resilience
- **⚠ AUTORIZADO + especialista académico.** Ataque real UWB = manipulación física de distancia, NO takeover. Distancia de time-of-flight → research attacks intentan que receiver registre arrival **más temprano** que el real (acorta distancia medida) **sin STS key**: 'early-detect/late-commit' y preamble-injection en HRP 802.15.4z; relay que shufflea ranging entre coche distante y key. **Landmark público: Ghost Peak** (Leu, Camurati, Heinrich et al., USENIX Security 2022) — distance-reduction práctica en HRP UWB vs Apple U1 interop NXP/Qorvo, reduce 12 m a 0 m con ~4% de éxito por intento, device off-the-shelf ~$65 (DWM3000EVB + nRF52DK), **SIN material crypto**. **Honestidad tooling**: NO hay tool open push-button. Trabajo publicado usa custom DW3000 firmware + setups bespoke no empaquetados como producto; reproducir = engineering contra board DW3000, no download exploit. Citar research, proveer peer hardware controlable — **no entregar arma que no existe abiertamente**.
- **Kit**: dwm3000-dwt-driver (peer UWB controlable research). Sin tool turnkey.
- **Caveat**: development peer, NO exploit empaquetado distance-reduction. Ref: Ghost Peak securepositioning.ch/ghost-peak (arXiv 2111.05313, USENIX Security 2022).

### AP
- "App" UWB = decisión ranging/positioning y qué confía en ella — ahí aterriza impacto aunque link sea difícil romper. Measurement UWB alimenta security gate: coche CCC Digital Key unlock/start solo si phone/key ranged dentro pocas decenas de cm; Apple Nearby Interaction precise direction/distance; RTLS decisiones access/safety. Pregunta assessment: ¿consumers enforce asunciones SECURE-RANGING? ¿Requieren measurement STS-authenticated (no legacy/non-secure)? ¿Bound distance tight? ¿Reject jumps implausibles? ¿Fail safe si ranging lost/manipulado? Evaluado en lógica victim system (y BLE/NFC bootstrap que keya session) — UWB ranging no expone protocol surface interactiva propia.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de UWB; los comandos verbatim viven en `Descenso por capa` arriba. Ranging seguro por diseño — **no hay clave que romper**, el ataque es físico.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Silicon (DW1000 legacy sin STS vs DW3000 moderna 802.15.4z), canal (ch5 6.5 / ch9 8.0 GHz), esquema app (Apple/CCC/FiRa). CVEs Ghost Peak | — |
| SP → PHY+LL | **Ningún SDR commodity ve UWB** (ch5/ch9 encima del tope 6 GHz; >500 MHz channel). Captura exige transceiver DW3000-class que conozca el canal | — |
| PHY+LL → CR | Frames 802.15.4z con transceiver real (SEEMOO uwb-sniffer). STS keyed AES → no offline key-recovery | — |
| CR → AT | Sin ataque de key-crack (no hay). Superficie research = manipulación física de distancia (early-detect, preamble-injection) **sin STS key** | — |
| AT | ⚠TX re-check; ataque **físico**, especialista académico, sin tool push-button. Ghost Peak: 12 m→0 m ~4% por intento. Solo authorized testing en setup propio | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): UWB es specialty near-field/posición — pocas señales "anómalas" que escuchar pasivamente con kit común (sin DW3000 controlable no capturas). Si defiendes un activo ranging-dependent, monitorea el sistema victim (¿rechaza jumps implausibles? ¿requiere STS-authenticated?). Registra; **no** desciendas a AT.

## Advertencias legales
- RX/sniff UWB con tu propio transceiver OK.
- Manipulación de distancia Ghost-Peak-style = **ataque físico a ranging**; solo authorized testing en setup propio (tu coche/key). Relay contra coche/key ajeno = robo (relay attack car key = delito real, vector creciente).
