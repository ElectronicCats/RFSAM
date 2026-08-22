# 18 - Z-Wave

> Wayfinder + RFSAM controls for Z-Wave. Regional sub-GHz, source-routed mesh.

## Facts
- **Band**: regional sub-GHz ISM - 908.42 MHz (US) - 868.42 MHz (EU) - + regional channels (921.42 ANZ, 919.82 HK, 922-926 JP). **One region per device**.
- **Modulation/rate**: (G)FSK at 3 rates: 9.6 kbps (R1 legacy), 40 (R2), 100 (R3). Z-Wave Long Range (US 912/920) adds power and star topology.
- **PHY/MAC**: ITU-T G.9959 (open). Upper stack open after Silicon Labs release (~2016).
- **Identifiers**: 32-bit Home ID (the network) + 8-bit Node ID (device). Both **in cleartext** in every frame header.
- **Security**: legacy **S0** AES-128, but during inclusion the network key is encrypted under a **FIXED all-zero** temporary key -> capturing inclusion = recover the key. Modern **S2** (Gen5/700+): Curve25519 ECDH on inclusion - the secret is never sent.
- **Topology**: source-routed mesh: primary controller/hub + routing slaves + end devices. Targets: locks, sensors, thermostats, controller.

## Layer-by-layer descent

### IG (fingerprinting)
- Region/frequency (FCC ID/CE marking), chipset/generation (Sigma ZW0301/ZW0501 500-series vs SiLabs 700/800 EFR32ZG), security class (S0 vs S2 vs unencrypted), Home ID/Node ID, data rate (R1/R2/R3 vs Long Range).

### SP - `RFSAM-ZWAVE-SP-01` Region/frequency identification
- **Objective**: confirm it transmits on the regional channel. RTL-SDR reaches it (sub-GHz). FSK burst on report/poll.
- **Kit**: Gqrx (RTL-SDR/HackRF tuned to 908.42/868.42). Trigger the device (open a door) to make it talk.

### PHY (no control - demod+frame together)
- G.9959 (G)FSK demodulated and parsed in each tool. Match regional freq + rate (9.6/40/100 kbps use different deviation/bandwidth).

### LL (integrated into SP - capture/decode frames)
- Park radio on regional channel -> headers (Home ID, Node ID, frame control, command class). SDR: Waving-Z/rtl-zwave (RTL-SDR), EZ-Wave/Scapy-radio (HackRF). Vendor: Zniffer (Silicon Labs, UZB stick).
- **CRITICAL for S0**: capture an **inclusion** (pairing) - that is where the key travels.

### CR - `RFSAM-ZWAVE-CR-01` Key establishment assessment
- **Objective**: S0 -> capture inclusion, recover network key (encrypted under all-zero temp key). S2 (ECDH) -> **no shortcut** from capture.
- **Kit**: Zniffer (clean S0 inclusion capture, recovers key knowing the all-zero temp key), EZ-Wave (decrypts S0 with key).
- **Historical Z-Shave attack**: downgrade S2->S0 during inclusion (downgrade, not an S2 break).

### AT (no dedicated control - active techniques)
- **[!] MANDATORY AUTHORIZATION**. With S0 key or unencrypted command classes: forge/inject (EZ-Wave/Scapy-radio HackRF, gr-zwave_poore USRP B210). Replay/forge command classes (lock/unlock, switch). S2 + anti-replay nonces blocks encrypted forge.
- **Kit**: EZ-Wave, Scapy-radio, gr-zwave_poore.

### AP
- Command classes: Door Lock CC, Binary Switch, thermostat, sensor report, Version/Manufacturer-Specific. EZ-Wave `ezrecon` interrogates the device; Z-Wave PC Controller (SiLabs, UZB stick) is the legitimate driver.

## Subflow (specialization of the master flow)

Z-Wave-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | Region/frequency confirmed (FCC ID/CE marking). RTL-SDR reaches it (sub-GHz) | - |
| SP -> LL | Regional carrier (908.42/868.42 MHz) confirmed. FSK burst on report/poll | - |
| (PHY merged) | G.9959 (G)FSK demodulated and parsed in each tool | - |
| LL -> CR | Security class? **S0** (capture inclusion -> recover key) **S2**? (ECDH -> no shortcut) | - |
| CR -> AT | S0 keys recovered or gap declared (S2 ECDH -> stop). S2->S0 downgrade historically (Z-Shave), not an S2 break | - |
| AT | [!]TX re-check (HackRF/USRP for forge); [!] operating someone else's lock/switch = breaking and entering. S2 + anti-replay nonces blocks encrypted forge | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): Z-Wave frames with an **unknown** Home ID attempting inclusion/leave on your network, or unencrypted command classes operating on your actuators = possible takeover/rogue controller. Register; do **not** descend to AT.

## Legal warnings
- Passive RX sub-GHz OK.
- **Inject/replay/forge = active**: own/authorized network only. Operating someone else's lock/switch = breaking and entering.
