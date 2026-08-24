# 21 — ADS-B (aviation)

> Wayfinder + RFSAM controls for ADS-B. Broadcast **without encryption or authentication** → injection trivial (in lab).
> **⚠ 1090 MHz = protected aviation spectrum. Forging/injecting over the air is a serious crime. Conducted + cage only.**

## Facts
- **Band**: 1090 MHz Mode S Extended Squitter (1090ES) worldwide; 978 MHz UAT (Universal Access Transceiver) additional in US for low-altitude general aviation.
- **Signal (1090ES)**: Pulse-Position Modulation (PPM) 1 Mbps on 1090 MHz carrier; Extended Squitter = 112-bit message (8 µs preamble + 112 µs data). 978 UAT waveform ~1.04 Mbps, message 272-bit.
- **Messages**: ADS-B "out" in Mode S downlink format DF17 (transponder) and DF18 (non-transponder/TIS-B). Each carries 24-bit ICAO aircraft address + type code: identification (callsign), airborne/surface position (CPR-encoded), velocity.
- **Identifiers**: ICAO 24-bit (unique radio ID), callsign 8-char, CPR-encoded lat/lon. **None authenticated** → all forgeable.
- **Security**: broadcast and **without encryption**. Public structure. **No auth or integrity** → receiver cannot distinguish a genuine frame from a forged one → spoofing/injection possible.

## Layer-by-layer descent

### IG (fingerprinting — what you hear)
- Which link: 1090ES (worldwide) vs 978 UAT (US general aviation). Link unauthenticated/unencrypted — positions, callsigns, ICAO in cleartext, no integrity check. ICAO 24-bit = unique ID in each frame. DF17 vs DF18 mix, type codes. RX setup: quarter-wave antenna (~6.9 cm) + 1090 MHz band-pass filter + LNA for weak/distant signals.

### SP — part of PHY (confirm 1090 energy)
- 1090 MHz within almost any SDR. In the waterfall, bursty pulses at the squitter (above noise floor, visible). RTL-SDR = canonical 1090 receiver, reaches 1090 and 978.

### PHY — `RFSAM-ADSB-PHY-01` Message capture and decode
- **Objective**: receive+decode ADS-B frames (plaintext broadcast). Tune 1090 → demod PPM → validate CRC → DF17/DF18 (ICAO, callsign, CPR position, velocity). 978 UAT → dump978.
- **Kit**: dump1090 (RTL-SDR, classic), readsb (high-perf fork), dump978 (US UAT), gr-air-modes (GNU Radio).
- **Decoder**: no Wireshark; output is decoded frames in Beast/raw/JSON for mapping/plausibility.

### LL — `RFSAM-ADSB-LL-01` Message authenticity assessment
- **Objective**: what authenticity guarantees, if any, does the link provide? (Answer: none — basis for injection).

### CR (no control — nothing to decrypt)
- Plaintext broadcast: format and CPR encoding public. Positions/callsigns/ICAO are read (decoded), not cracked. The real problem = the opposite of confidentiality: **no auth or integrity**. The receiver cannot prove the frame is from the aircraft it claims; no signature over position; no replay protection. This design gap = what makes AT possible: anyone transmitting a well-formed 1090ES frame is, for every receiver in range, indistinguishable from a real aircraft.

### AT — `RFSAM-ADSB-AT-01` Forge and inject (contained lab mandatory)
- **⚠ 1090 MHz = protected aviation spectrum. TX ADS-B affects real ATC systems. Authorized lab only via CONDUCTED/CABLE or CAGE — never over the air.** Without auth, the attack = imitate: transmit forged 1090ES frames (chosen ICAO/callsign/position) → every receiver in range accepts as a real aircraft → ghost aircraft, move an existing track, or flood the picture. RTL-SDR RX-only.
- **Kit**: ADSB-Out (Python encoder → I/Q → TX on HackRF via hackrf_transfer).
- **Caveat**: author states academic only; stable but inactive (~2021).

### AP
- "Air picture": decoded stream → tracked aircraft + fusion + plausibility. This is where missing auth is defended: sanity-check of the broadcast. tar1090 (live interactive map), pyModeS (decode in code → anti-spoof/plausibility checks: impossible kinematics, cross-receiver inconsistency, suspicious ICAO). MLAT (multilateration cross-receiver) = standard anti-spoof cross-check.
- **Kit**: tar1090 (map from readsb/dump1090), pyModeS (decode + plausibility).

## Subflow (specialization of the master flow)

ADS-B-specific transitions; verbatim commands live in `Layer-by-layer descent` above. Broadcast **without auth or integrity** → all IDs forgeable.

| Advance | Advance criterion | Markers |
|---------|--------------------|---------|
| IG → SP | Link identified (1090ES worldwide vs 978 UAT US). RX setup: quarter-wave antenna (~6.9 cm) + 1090 filter + LNA | — |
| SP → PHY+LL | Bursty pulses above noise floor at the squitter. RTL-SDR reaches 1090 and 978 | — |
| PHY+LL → CR | Frames decoded (ICAO/callsign/CPR position/velocity). Without encryption → nothing to decrypt; the problem is the **opposite**: no auth | — |
| CR → AT | No auth/integrity/replay-protection confirmed → any well-formed 1090ES frame is indistinguishable from a real aircraft. AT works | — |
| AT | ⚠TX re-check; **1090 MHz = protected aviation**, TX affects real ATC. Conducted + cage + authorization only. RTL-SDR RX-only never transmits | ⚠TX |

**Defensive anomaly** (Defensive mode, RX-only): ghost aircraft (ICAO/callsign that appears/disappears), impossible kinematics, or cross-receiver inconsistency = possible injection. pyModeS (plausibility checks) and MLAT (multilateration) are anti-spoof cross-checks. Log it; **do not** descend to AT.

## Legal warnings
- Passive 1090/978 RX OK (public signals; basis for trackers like Flightradar24).
- **TX/forge ADS-B over the air = serious crime** (aviation spectrum, safety-of-life). Conducted wired + cage + authorization only. Never radiate.
