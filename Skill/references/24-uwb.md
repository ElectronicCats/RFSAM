# 24 - Ultra-Wideband (UWB)

> Wayfinder + RFSAM controls for UWB (802.15.4z). Secure ranging/distance; **there is no key to break**.
> Attack = physical distance manipulation (Ghost Peak) - academic, specialist, no push-button tool.

## Facts
- **Band**: impulse-radio UWB ~3.1-10.6 GHz, >500 MHz channel bandwidth per pulse. In practice two channels dominate: ch5 6.5 GHz, ch9 8.0 GHz.
- **Standard**: IEEE 802.15.4z, two incompatible PHYs - HRP (High Rate Pulse-repetition ~64/249.6 MHz PRF - the one in phones/cars) and LRP (Low Rate, NXP/3db). Plus legacy 802.15.4-2011/4a (DW1000 old gen, no STS).
- **Modulation**: impulse radio - sub-nanosecond RF pulses, no continuous carrier. Bit rates 850 kbps / 6.81 Mbps. **Time-of-flight** of pulses (not signal strength) = distance -> that is why it is hard to spoof and so precise (~10 cm).
- **Purpose**: secure ranging / distance bounding and positioning, NOT bulk data. Two-Way Ranging (TWR), TDoA, PDoA/AoA. Uses: Apple U1/U2 (AirTag, iPhone Nearby Interaction), CCC Digital Key car access, Samsung SmartTag+, FiRa RTLS.
- **Security**: 802.15.4z adds **STS (Scrambled Timestamp Sequence)** - a pseudo-random sequence of AES-keyed pulses that the receiver correlates to authenticate the ranging timestamp -> an attacker cannot forge/replay a legitimate ranging pulse. Research surface = **physical distance manipulation** (early-detect/preamble-injection on the impulse waveform), NOT cracking AES.
- **Schemes**: same radio, app protocols on top - Apple Nearby Interaction (U1/U2), CCC Digital Key, FiRa (consortium RTLS/ranging cross-vendor).

## Layer-by-layer descent

### IG (fingerprinting - many forks)
- Silicon: Qorvo/Decawave DW1000 = OLD gen (legacy 802.15.4-2011, no STS); DW3000 (DW3110/DW3210) = modern 802.15.4z with STS. NXP Trimension (SR040/SR150), Apple U1/U2 = other families. PHY HRP (phones/AirTags/keys) vs LRP. Channel: almost always ch5 (6.5 GHz) or ch9 (8.0 GHz). App scheme: Apple Nearby Interaction, CCC Digital Key, FiRa. UWB is rarely standalone - Apple/CCC bootstrap over BLE (and CCC also NFC) for session keys/STS. CVEs: Ghost Peak (Apple U1 + NXP/Qorvo), relay/distance-reduction/preamble-injection academic.

### SP (no control - **you cannot "see" UWB in a normal waterfall**)
- Impulse-radio UWB: sub-nanosecond pulses spread >500 MHz, intermittent, very low power spectral density -> by design a faint rise in the noise floor, not a peak. Two things rule out common SDRs: **frequency** (ch5 6.5 GHz, ch9 8.0 GHz - **above the 6 GHz top end** of HackRF/bladeRF/B210/SignalSDR; RTL-SDR 1.766 GHz not even close) and **bandwidth** (>500 MHz channel, these radios offer ~20-122 MHz). The only nearby SDR: USRP X410 (7.2 GHz, 400 MHz BW - reaches ch5, still short of the >500 MHz channel, $10k+, research-grade impulse demod in software). In practice: you confirm/capture UWB with a real transceiver that already knows the channel (DW3000 dev boards in LL), or just to confirm energy, a >500 MHz real-time spectrum analyzer/scope.

### PHY (no control - despreading on the DW3000 transceiver)
- No commodity SDR demodulates impulse-radio UWB. A DW3000-class transceiver despreads pulses against the known channel/preamble (and STS if secure ranging) and frames the 802.15.4z packet in hardware. PHY+framing together on the real chip. **You must know the PHY params** (channel, preamble code, PRF, data rate, STS mode/length) to lock - these come from IG, not from scanning.

### PHY - `RFSAM-UWB-PHY-01` Ranging signal capture (PHY layer in RFSAM)
- **Objective**: capture 802.15.4z frames with a real UWB transceiver (nothing else can). Open path: SEEMOO uwb-sniffer - firmware for the Qorvo DWM3000EVB driven by a host MCU (NUCLEO-F429ZI ref build) -> pull 802.15.4z frames off the air -> Wireshark via the sensniff pipe with picosecond timestamps. **Catch**: you must configure the radio with the link's PHY params (channel, preamble, data rate, STS mode/length) - UWB does not blind-scan. Off-the-shelf alternative: Forthink sniffer software + Wireshark plugin (depends on a closed commercial dongle - flagged). Another: a controllable DW3000 peer (Makerfabs board, foldedtoad driver) to generate/log known ranging exchanges. **None defeats STS** - it captures frames you can already decode.
- **Kit**: seemoo-uwb-sniffer (DWM3000EVB + NUCLEO-F429ZI/nRF52840), forthink-uwb-sniffer (commercial dongle), dwm3000-dwt-driver (controllable peer).
- **Decoder**: Wireshark (sensniff).

### CR (no control - **there is no key to break, that is the point of .4z**)
- STS = a pseudo-random AES-keyed sequence that both ranging peers share -> the receiver correlates incoming impulses against the expected STS -> only the STS-authenticated arrival time is trusted as distance. An attacker without the STS key cannot forge/replay a legitimate ranging pulse -> no offline key recovery like BLE/Wi-Fi. The STS key is exchanged over a separate bootstrap channel (BLE for Apple/CCC, NFC for some CCC) - any crypto weakness lives in **that** handshake (see BLE/RFID wayfinder), not in UWB pulses. The genuine UWB research surface = **physics**: can the time-of-flight be manipulated at the physical layer (early detection, preamble/pulse injection) without the key? That is AT. **There is no open key-crack tool because there is no key-crack attack.**

### AT - `RFSAM-UWB-AT-01` Distance-manipulation resilience
- **[!] AUTHORIZED + academic specialist.** The real UWB attack = physical distance manipulation, NOT takeover. Distance from time-of-flight -> research attacks attempt to make the receiver register arrival **earlier** than actual (shortens measured distance) **without the STS key**: 'early-detect/late-commit' and preamble-injection on HRP 802.15.4z; relay that shuffles ranging between a distant car and key. **Public landmark: Ghost Peak** (Leu, Camurati, Heinrich et al., USENIX Security 2022) - practical distance-reduction on HRP UWB vs Apple U1 interop NXP/Qorvo, reduces 12 m to 0 m with ~4% success per attempt, off-the-shelf device ~$65 (DWM3000EVB + nRF52DK), **WITHOUT crypto material**. **Honesty note on tooling**: there is NO open push-button tool. Published work uses custom DW3000 firmware + bespoke setups not packaged as a product; reproducing = engineering against a DW3000 board, not downloading an exploit. Cite the research, provide controllable peer hardware - **do not deliver a weapon that does not openly exist**.
- **Kit**: dwm3000-dwt-driver (controllable UWB peer for research). No turnkey tool.
- **Caveat**: development peer, NOT a packaged distance-reduction exploit. Ref: Ghost Peak securepositioning.ch/ghost-peak (arXiv 2111.05313, USENIX Security 2022).

### AP
- The UWB "app" = the ranging/positioning decision and what trusts it - that is where impact lands even if the link is hard to break. UWB measurement feeds a security gate: CCC Digital Key car unlock/start only if phone/key ranged within a few tens of cm; Apple Nearby Interaction precise direction/distance; RTLS access/safety decisions. Assessment question: do consumers enforce SECURE-RANGING assumptions? Do they require STS-authenticated measurement (not legacy/non-secure)? Do they bound distance tightly? Do they reject implausible jumps? Do they fail safe if ranging is lost/manipulated? Evaluated in the victim system's logic (and the BLE/NFC bootstrap that keys the session) - UWB ranging does not expose its own interactive protocol surface.

## Subflow (specialization of the master flow)

UWB-specific transitions; verbatim commands live in `Layer-by-layer descent` above. Secure ranging by design - **there is no key to break**, the attack is physical.

| Advance | Advance criterion | Markers |
|---------|--------------------|---------|
| IG -> SP | Silicon (DW1000 legacy no STS vs DW3000 modern 802.15.4z), channel (ch5 6.5 / ch9 8.0 GHz), app scheme (Apple/CCC/FiRa). CVEs Ghost Peak | - |
| SP -> PHY+LL | **No commodity SDR sees UWB** (ch5/ch9 above the 6 GHz top end; >500 MHz channel). Capture requires a DW3000-class transceiver that knows the channel | - |
| PHY+LL -> CR | 802.15.4z frames with a real transceiver (SEEMOO uwb-sniffer). STS AES-keyed -> no offline key-recovery | - |
| CR -> AT | No key-crack attack (there is none). Research surface = physical distance manipulation (early-detect, preamble-injection) **without the STS key** | - |
| AT | [!]TX re-check; **physical** attack, academic specialist, no push-button tool. Ghost Peak: 12 m->0 m ~4% per attempt. Authorized testing on own setup only | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): UWB is a specialty near-field/positioning technology - few "anomalous" signals to listen for passively with common kit (without a controllable DW3000 you capture nothing). If you are defending a ranging-dependent asset, monitor the victim system (does it reject implausible jumps? does it require STS-authenticated?). Log it; **do not** descend to AT.

## Legal warnings
- RX/sniffing UWB with your own transceiver OK.
- Ghost-Peak-style distance manipulation = **physical attack on ranging**; authorized testing on own setup only (your car/key). Relay against someone else's car/key = theft (car key relay attack = real crime, growing vector).
