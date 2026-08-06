# 16 — Sub-GHz ISM / Remotes

> Wayfinder + RFSAM controls for Sub-GHz (garage controls, sensors, TPMS, meters).

## Facts
- **Bands**: 315 MHz (NA/Asia remotes & TPMS) · 433.92 MHz (global, workhorse) · 868 MHz (EU, wM-Bus) · 915 MHz (US ISM 902–928).
- **Modulation**: almost all OOK/ASK (carrier blinks) or (G)FSK (two tones). No spread spectrum → easy to demodulate.
- **Encoding/baud**: PWM/Manchester/PPM at hundreds-to-thousands of baud, short repeated bursts.
- **Code type**: fixed (same payload always — trivial replay) vs rolling/hopping (KeeLoq/HCS301 — new value each press).
- **Crypto**: most **without confidentiality** (payload in cleartext). Rolling code = replay resistance, not encryption. KeeLoq requires the manufacturer key to forge the next code (not obtainable from passive capture).
- **Targets**: garage/gate remotes, car key fobs, TPMS, weather/soil sensors, smart-home plugs/doorbells, wM-Bus meters, alarm contacts.

## Layer-by-layer descent

### IG (fingerprinting)
- Frequency (FCC ID → fccid.io), modulation (OOK/ASK vs FSK), encoding/baud, **fixed vs rolling** (this decides everything), chip (CC1101, PT2262/EV1527, HCS301/KeeLoq), device class (rtl_433 has 320+ decoders).

### SP — `RFSAM-SUBG-SP-01` Burst discovery and characterisation
- **Objective**: where it transmits; see bursts on trigger. RTL-SDR suffices (sub-GHz).
- **Kit**: Gqrx (waterfall), rtl_433 (live device scan → JSON), catnip (SX1262 spectrum analyzer).
- **Command**: `rtl_433 -f 433.92M` → decodes a known device to JSON.

### PHY — `RFSAM-SUBG-PHY-01` Demodulation and framing
- **Objective**: clean recording of the burst, demod+frame in one pass (simple signal). Record I/Q centered on the carrier, at a rate that covers the bandwidth.

### LL — `RFSAM-SUBG-LL-01` Frame and addressing recovery
- **Objective**: burst → bits → fields. Known device: rtl_433 decodes directly to JSON. Unknown: Universal Radio Hacker (auto-detect mod/baud, diff bitstream). Pocket: rfcat (YARD Stick One), Flipper Zero (Read/Read RAW).
- **Kit**: rtl_433, Universal Radio Hacker, rfcat+yard-stick-one, Flipper Zero, catnip (SX1262 GFSK packets).

### CR — `RFSAM-SUBG-CR-01` Rolling-code assessment
- **Objective**: honesty — nothing to "break" in most cases (no crypto). Fixed code = read at LL. Rolling code = replay resistance, **not** an encrypted channel. To forge the next code you need the manufacturer key (not in passive capture). Academic KeeLoq cryptanalysis out of scope.
- **No offline crack tool** — read fixed codes, capture-and-replay rolling codes (AT).

### AT — `RFSAM-SUBG-AT-01` Replay and forge
- **⚠ MANDATORY AUTHORIZATION** (transmits sub-GHz; respect ISM power/duty-cycle).
- **Objective**: fixed code → trivial replay. Rolling code → RollJam (jam+capture an unused code, use it later), RollBack (desync counter via massive replay = DoS), brute force small keyspace (DIP-switch EV1527/PT2262).
- **Kit**: rfcat (replay fixed), Universal Radio Hacker (replay/edit TX), Flipper Zero (field replay fixed), catnip (scriptable GFSK TX).
- **Command**: rfcat → `d.RFxmit(captured_bytes)`.

### AP
- No separate stack: rtl_433 JSON = application layer (sensor values, IDs, flags). You forge those values to deceive the gateway/display.

## Subflow (specialization of the master flow)

Sub-GHz-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG → SP | Frequency and modulation confirmed. **FCC ID** (fccid.io) resolves exact freq/mod | — |
| SP → PHY | Short bursts confirmed on press/sensor report. RTL-SDR suffices | — |
| (PHY+LL in one pass) | Clean recording of the burst → demod+frame (simple signal, low baud) | — |
| LL → CR | **Fixed** code (in cleartext, replayable) or **rolling** (KeeLoq/HCS301)? | — |
| CR → AT | Fixed confirmed (replayable) or rolling (→ RollJam at AT). Most **without crypto** → CR is usually a "read" | — |
| AT | ⚠TX re-check (radio TX required: rfcat/YARD Stick/Flipper/catnip); ⚠ replay against third parties = **RA7** | ⚠TX |

**Defensive anomaly** (Defensive mode, RX-only): bursts in your band **without a known own device** = possible neighbor scanner/replay. Correlate with your activity.

## Legal warnings
- Passive RX sub-GHz OK.
- **TX/replay/forge = active**: own/authorized devices only. Opening someone else's garage/alarm = breaking and entering/theft. ISM jamming is illegal over the air in many jurisdictions.
- Flipper stock firmware **refuses** to save/replay rolling codes by design (fixed only).
