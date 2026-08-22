# 11 - Bluetooth Classic (BR/EDR)

> Wayfinder + RFSAM controls for Bluetooth Classic. Deference to BSAM at link-and-above.
> **Honesty note**: accessible BR/EDR tooling is younger/thinner than BLE/Wi-Fi; almost everything runs on the original ESP32 ($5).

## Facts
- **Band**: 2.402-2.480 GHz - 79 RF channels x 1 MHz, **adaptive frequency hopping ~1600 hops/s**. That fast hopping is what makes it hard to follow with a static SDR.
- **Modulation/rate**: Basic Rate (BR) GFSK 1 Mbps; EDR pi/4-DQPSK 2 Mbps and 8DPSK 3 Mbps.
- **Identifiers**: 48-bit BD_ADDR (24 high = OUI/vendor), Class of Device (CoD) hint of type.
- **Security**: legacy PIN pairing (short PIN -> offline attack); Secure Simple Pairing SSP ECDH (P-192 2.1, P-256 4.1+) - "Just Works" without MITM. Encryption E0 (legacy) or AES-CCM. **KNOB** key entropy downgrade.
- **Topology**: piconet 1 master + <=7 slaves; profiles SDP, RFCOMM, HID, A2DP/HFP, OBEX. Targets: headsets, HID, infotainment, OBD-II, PoS.

## Layer-by-layer descent

### IG - `RFSAM-BTC-IG-01` Identify device, BR/EDR mode and vulnerability corpus
- **Objective**: does it speak BR/EDR (Classic), dual-mode or LE-only? Fingerprint SoC/host stack, cross-reference against CVEs (BlueBorne, KNOB, BrakTooth).
- **Kit**: ESP32 (original DevKit, the only one with a BR/EDR radio), `esp32-classic-bt-scan` (inquiry), `esp32-bt-exp` (dual-mode dump). FCC ID/teardown.
- **Deference**: BSAM-IG-02/03/04. `deferred: true`. Attacks: BlueBorne (CVE-2017-1000251), KNOB (CVE-2019-9506), BrakTooth (~16 CVEs).

### SP - `RFSAM-BTC-SP-01` Inquiry-scan and confirm reachable BR/EDR device
- **Objective**: confirm it transmits and enumerate discoverable devices (analogous to BLE advertising scan).
- **Kit**: Gqrx (waterfall - activity, not clean decode due to fast hopping), `esp32-classic-bt-scan` (real BR/EDR inquiry -> BD_ADDR/name/RSSI/CoD).
- **Caveat**: only sees devices in discoverable/inquiry-scan; non-discoverable requires knowing the BD_ADDR.

### PHY (no control - hopping frustrates static SDR)
- Decoding live GFSK/DQPSK while hopping 1600/s is impractical for SDR. Practical capture does PHY+framing on a device with a real BR/EDR controller (ESP32 patched ROM).

### LL - `RFSAM-BTC-LL-01` Capture Bluetooth Classic baseband traffic
- **Objective**: capture/decode BR/EDR baseband frames (BT header, channel, role, FHS, ACL, LMP).
- **Kit**: `esp32-bt-classic-sniffer` (patches ESP32 Bluetooth ROM -> dump baseband via USB serial -> Python BTSnifferBREDR.py -> Scapy/Wireshark); Ubertooth-tools (partial Basic-Rate, legacy).
- **[!] Active sniffer**: connects to the target to follow hopping (not purely passive). Authorized only.
- **Deference**: BSAM. `deferred: true`.

### CR - `RFSAM-BTC-CR-01` Assess pairing and encryption key strength
- **Objective**: legacy PIN pairing with short/fixed PIN -> offline brute force recovers link key and decrypts. SSP (ECDH) resists offline. KNOB = entropy downgrade (not a break of E0/AES).
- **No point-and-click tool on cheap hardware**: capture analysis + BSAM pairing controls.
- **Attacks**: KNOB (CVE-2019-9506). `deferred: true`.

### AT - `RFSAM-BTC-AT-01` Test baseband/LMP resilience and availability
- **[!] MANDATORY AUTHORIZATION** (transmits 2.4 GHz, pokes a live device).
- **Objective**: BrakTooth (~16 CVEs, crash/deadlock/RCE in BR/EDR controllers of many SoCs). KNOB downgrade + brute force. Broadband 2.4 GHz jammer (illegal jamming unless inside a cage).
- **Kit**: BrakTooth PoC (ESP32, LMP/baseband fuzzing), `esp32-bluejammer` (broadband 2.4 GHz jamming with 2x nRF24L01+PA+LNA - **illegal over the air**).
- **Deference**: BSAM. `deferred: true`.

### AP - `RFSAM-BTC-AP-01` Enumerate and exercise exposed BR/EDR profiles
- **Objective**: map app surface - SDP, RFCOMM (AT commands hands-free/car), HID (keystroke injection), A2DP/HFP, OBEX.
- **Kit**: USB BT dongle + BlueZ host (`sdptool browse <BD_ADDR>`, `l2ping`, `bluetoothctl`, `obexftp`, HID/HFP utils).
- **Deference**: BSAM. `deferred: true`.

## Subflow (specialization of the master flow)

BTC-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | BR/EDR mode confirmed (BrakTooth ~16 CVEs, BlueBorne, KNOB) | - |
| SP -> PHY | Discoverable/inquiry-scan device detected. **1600 hops/s** -> static SDR cannot follow the hop; inquiry scan (ESP32) is the way | - |
| PHY+LL | BSAM: defer LL+ to BSAM. The BR/EDR sniffer is **active** (connects to follow the hop) -> authorized only | BSAM |
| CR -> AT | Just Works MITM or KNOB downgrade confirmed. SSP ECDH resists offline | - |
| AT | [!]TX re-check; [!] broadband 2.4 GHz jamming = over-the-air jamming (**RA3**, cage only). `esp32-bluejammer` needs nRF24L01+PA+LNA | [!]TX |
| AP | Only protocol with a formal AP control (`RFSAM-BTC-AP-01`): SDP/RFCOMM/HID/A2DP/OBEX profiles | - |

**Defensive anomaly** (Defensive mode, RX-only): BR/EDR does not have as common a stalking surface as BLE; watch for **unpaired** devices making LMP/SDP probes against your hosts (possible BlueBorne/BrakTooth).

## Legal warnings
- Passive RX (the little that is viable with SDR) OK.
- **Active sniffer, BrakTooth, jamming, HID injection = active**: owned/authorized only. BrakTooth crashes/RCes live devices. 2.4 GHz jamming is illegal over the air.
