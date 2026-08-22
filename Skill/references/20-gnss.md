# 20 - GNSS / GPS

> Wayfinder + RFSAM controls for GNSS. Civilian signals **without encryption or authentication** -> attack = imitate.
> **[!] GNSS spoofing/jamming over the air is a crime in almost all jurisdictions - conducted/wired + cage only.**

## Facts
- **Band**: L-band. GPS L1 1575.42 MHz - L2 1227.60 - L5 1176.45. Neighbors: GLONASS L1 ~1602, Galileo E1 1575.42 (overlap GPS L1), BeiDou B1 1561.098.
- **Signal (GPS L1 C/A)**: BPSK on 1575.42 MHz carrier; 1023-chip C/A spreading 1.023 Mcps repeats every 1 ms; nav message 50 bps. One PRN code per sat (CDMA).
- **Constellations**: GPS (US) - GLONASS (RU) - Galileo (EU) - BeiDou (CN) + regional QZSS/NavIC. 4+ sats in view for PVT.
- **Security**: civilian (GPS C/A, GLONASS, BeiDou B1, Galileo E1 OS) **without encryption or authentication** - public structure. Military P(Y)/M-code encrypted, out of scope. Galileo OSNMA adds optional auth; legacy C/A none.
- **Power at receiver**: very weak - ~-125 to -130 dBm, **below the noise floor**; recovered only by despreading the known PRN. This is why a slightly stronger attacker signal captures the receiver.

## Layer-by-layer descent

### IG (fingerprinting)
- Constellations/bands it tracks (GPS-only L1, multi-constellation, multi-band L1/L2/L5). Civilian signals unauthenticated - no key or credential, only signal to imitate. Chipset (FCC ID, NMEA vendor strings), anti-spoof (RAIM, consistency) / anti-jam. Behavior on loss of fix (coast/alarm/accept first reacquire - the latter exploits spoof). The u-blox NEO module gives direct NMEA/UBX.

### SP - `RFSAM-GNSS-SP-01` Signal presence and interference survey
- **Objective**: confirm L-band present and judge RF environment. The GNSS signal is below the noise floor - in the waterfall you look for what is **wrong**: strong carrier or wideband hump on L1 = jammer/interference; clean/quiet band = healthy.
- **Kit**: Gqrx (HackRF/bladeRF/USRP/RTL-SDR; RTL-SDR with bias-tee for active antenna). Standard GPS receiver (gpsd gpsmon/cgps or u-center) gives C/N0 per sat.

### PHY (no control - despreading on chip or software)
- GPS module: PRN correlated in chip hardware -> you read NMEA/UBX. SDR: despreading in software (GNSS-SDR). Signal below noise floor until something correlates against the known code.

### LL (no control - receiver = demod+decoder)
- Two paths. (a) Everyday: u-blox NEO USB/serial receiver -> NMEA 0183 + UBX -> gpsd (gpsmon/cgps) or u-center. (b) SDR: raw L-band I/Q -> GNSS-SDR -> PVT + NMEA/RINEX. No Wireshark; output is position/time.

### CR (no control - no crypto to break)
- Civilian without encryption or auth: spreading codes and formats published -> anyone can decode, anyone can generate. No session key (BLE pairing) or handshake (WPA). P(Y)/M-code out of scope. The real question = trust: does the receiver distinguish a genuine sat from spoof? Galileo OSNMA signs the nav message; RAIM/consistency checks. Legacy C/A does not -> that is why AT works.

### AT - `RFSAM-GNSS-AT-01` Spoofing and jamming resilience
- **[!] AUTHORIZED + RF-CONTAINED only (cage/conducted). TX GNSS over the air is illegal.** Without auth, the attack = imitate. **SPOOFING**: synthesize GPS L1 C/A (RINEX ephemeris + static/mobile track) at higher power than real sats -> captures receiver, drags position/clock to attacker-chosen values. **JAMMING**: flood L1 with noise/carrier, denies fix (resilience test). RTL-SDR RX-only (never transmits).
- **Kit**: gps-sdr-sim (synthesis + TX on HackRF/bladeRF/USRP), Gqrx (monitor jamming-resilience).
- **Caveat**: multi-constellation/OSNMA-aware receivers may detect/reject spoofing of GPS-only single-constellation.

### AP
- No interactive app layer over the air: GNSS is one-way broadcast, no uplink/session. App impact = false position/time trusted by downstream systems (nav, geofencing, timestamps, PPS timing reference). Evaluated on the victim system (does false position/time cause unsafe behavior?).

## Subflow (specialization of the master flow)

GNSS-specific transitions; verbatim commands live in `Layer-by-layer descent` above. One-way broadcast - no handshake or key.

| Advance | Advance criterion | Markers |
|---------|--------------------|---------|
| IG -> SP | Constellations/bands tracked by the receiver identified. Module anti-spoof/anti-jam documented | - |
| SP -> PHY | L-band present; RF environment judged (strong carrier / hump = jammer; clean band = healthy). RTL-SDR with bias-tee for active antenna | - |
| PHY -> LL | Despreading (GPS chip in hardware or GNSS-SDR in software) -> NMEA/UBX or PVT+RINEX | - |
| LL -> CR | No crypto to break (civilians without auth). Real question = trust: does the receiver distinguish a genuine sat from spoof? | - |
| CR -> AT | Legacy C/A without auth -> AT works. OSNMA/RAIM-aware may detect/reject single-constellation spoof | - |
| AT | [!]TX re-check; **never TX GNSS over the air** (crime). Conducted wired + cage only. Shielded GPSDO; wired receiver | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): anomalous C/N0 (jumps, selective fading), strong carrier on L1, or a fix that jumps to an impossible position = possible jamming/spoofing in your environment. Correlate with time/location; **do not** descend to AT (Defensive never TX).

## Legal warnings
- Passive L1 RX OK; normal GPS receiver OK.
- **GNSS spoofing/jamming over the air = crime** (aviation, maritime, critical infrastructure). Conducted wired + Faraday cage + explicit authorization only.
