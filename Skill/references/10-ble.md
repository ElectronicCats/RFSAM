# 10 — BLE (Bluetooth Low Energy)

> Wayfinder + RFSAM controls for BLE. Deference to BSAM at link-and-above. The reference
> depth control is `RFSAM-BLE-AT-01`. Source: `toolchains.js` (inline), controls `rfsam-ble-*.md`.

## Facts
- **Band**: 2.402–2.480 GHz (ISM 2.4 GHz). 40 channels × 2 MHz — 3 advertising (37/38/39) + 37 data; a connection hops every connection event.
- **Modulation**: GFSK · PHYs LE 1M (1 Mbps), LE 2M (BLE 5), LE Coded (long range, BLE 5).
- **Range**: ~10 m indoor; up to ~100 m with Coded PHY or high TX.
- **Versions**: 4.0 (2010) · 4.2 LE Secure Connections (2014) · 5.0 2M/Coded (2016) · 5.1–5.4.
- **External reference**: **BSAM (Tarlogic)** — RFSAM owns SP+PHY; at LL and above defers to BSAM.

## Layer-by-layer descent

### IG — `RFSAM-BLE-IG-01` Known vulnerabilities of the SoC and host stack
- **Objective**: identify SoC/host stack and cross-reference against CVEs (SweynTooth, KNOB, BLEEDINGBIT, BleedingTooth, BLESA) before capturing.
- **Kit**: host BLE adapter HCI + bettercap (discovery/GATT); Sniffle/CatSniffer for advertising PDUs.
- **Command**: read FCC ID on label → `https://fccid.io/`; `sudo bettercap -eval "ble.recon on; sleep 20; ble.show; q"`.
- **Deference**: BSAM-IG-01/02/03/04. `deferred: true`.
- **Cited attacks**: SweynTooth (CVE-2019-19194 Zero-LTK), KNOB (CVE-2019-9506), BLEEDINGBIT (CVE-2018-16986), BleedingTooth (CVE-2020-12351), BLESA.

### SP — `RFSAM-BLE-SP-01` Channel map and capture feasibility
- **Objective**: which channels can you observe simultaneously with your radio — feasibility of discovery/full-band/connection-following.
- **Kit**: Gqrx (waterfall, ~20 MHz HackRF / 122.88 MHz bladeRF oversampling); ESP32 Marauder/Minino (scan advertising); ESP32 AirTag scanner.
- **Caveat**: RTL-SDR cannot reach 2.4 GHz. HackRF sees a slice (1 of 3 advertising channels); bladeRF oversampling the entire band.
- **Criticality**: `info` (auditor-capability baseline, not a device finding).

### PHY — `RFSAM-BLE-PHY-01` Demodulation and bit recovery
- **Objective**: demodulate GFSK, correlate access address, de-whiten, validate CRC — clean bits per channel.
- **Kit**: Sniffle/ice9 (on-chip or channelised SDR); Wireshark to verify `CRC correct`.
- **Command**: `python3 -m sniffle.sniff_receiver -s /dev/ttyACM0 -a -o adv.pcap`.
- **Cited attacks**: passive access-address/CRCInit recovery (Ryan WOOT 2013); SweynTooth fuzzing (CVE-2019-16336, 17519).
- **Criticality**: `info`.

### LL — `RFSAM-BLE-LL-01` Advertising & identifier exposure · `RFSAM-BLE-LL-02` Connection-data capture
- **LL-01 Objective**: does it leak advertising identity/product (names, serials, UUIDs, manufacturer data) or a trackable identifier that defeats randomization?
- **LL-02 Objective**: follow and record data-channel PDUs of a connection (CSA#1/CSA#2, or already established via ice9)?
- **Kit**: Sniffle (CC1352/CatSniffer), nRF Sniffer, Ubertooth, ice9 (SDR all-channel), Wireshark.
- **Cited attacks**: connection-following sniffing (Ryan WOOT 2013); CSA#2 recovery (Cauquil DEF CON 27); established-conn recovery (Ballabriga 2020); address-carryover tracking (Becker PoPETs 2019); PHY-layer fingerprint (Givehchian S&P 2022).
- **Deference**: BSAM-DI-03/DI-04/DI-06 (LL-01), BSAM-DI-04/EN-02 (LL-02). `deferred: true`.

### CR — `RFSAM-BLE-CR-01` Pairing and encryption assessment
- **Objective**: LE Legacy or LESC? If Legacy → recover TK and decrypt session.
- **Kit**: crackle (brute TK), Wireshark (export PCAP), Sniffle/CatSniffer (capture pairing).
- **Command**: `crackle -i ble_pairing.pcap -o ble_decrypted.pcap`.
- **Cited attacks**: LE Legacy TK brute-force (Ryan WOOT 2013); KNOB BLE key-size downgrade (CVE-2019-9506, Antonioli TOPS 2020); SweynTooth Zero-LTK (CVE-2019-19194).
- **Deference**: BSAM-PA-01/PA-04/EN-02/EN-03. `deferred: true`. LESC (ECDH) is **not breakable** from capture.

### AT — `RFSAM-BLE-AT-01` Hijack a live BLE connection
- **Objective**: can you follow and take over an established connection (jam-and-hijack, injection, reconnection spoofing)?
- **⚠ MANDATORY AUTHORIZATION** — active step.
- **Kit**: Btlejack (BBC micro:bit), InjectaBLE firmware (nRF52840), bettercap (recon), ESP32 Marauder/Bruce/Sour Apple (spam).
- **Cited attacks**: InjectaBLE (Cayre DSN 2021), Btlejacking (Cauquil DEF CON 26), BLESA (CVE-2020-9770).
- **Deference**: BSAM-AP-06/AU-03/EN-01. `deferred: true`. Criticality `critical`.

### AP — Interact with GATT
- **Objective**: what does the device trust over the link? GATT reachable without auth.
- **Kit**: Bleak (script GATT), bettercap (enumerate), Bruce (Bad BLE HID).
- **No dedicated control in the coverage-map** — BLE AP is exercised via GATT interaction after CR/AT.

## Subflow (specialization of the master flow)

BLE-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG → SP | BLE device confirmed; SoC CVEs cross-referenced (KNOB/SweynTooth/BLESA) | — |
| SP → PHY+LL | Activity on advertising channels (37/38/39) confirmed. RTL-SDR cannot reach 2.4 GHz → HackRF/bladeRF | — |
| PHY+LL (LL-01/02) | 🔗BSAM: stop descent at LL and defer to BSAM. Resume at CR **only if** BSAM returns a finding that requires it | 🔗BSAM |
| CR → AT | Weak pairing confirmed (LE Legacy TK recoverable). LESC (ECDH) **not breakable** from capture → gap | — |
| AT | ⚠TX re-check `loot/scope.txt`; active/lab only | ⚠TX |
| AP (no control) | GATT/HID over what the device trusts; exercised after CR/AT | — |

**Defensive anomaly** (Defensive mode, RX-only): AirTag/Find My **not your own** in your environment = stalking. `minino`/`esp32-airtag-scanner` detects it. Register in `loot/notes/`; do **not** descend to AT.

## Legal warnings
- Passive RX (advertising/sniff) generally OK on your own devices.
- **Connect/hijack/inject/spam = active**: only on owned/authorized equipment.
- BLE spam (Sour Apple) **freezes others' iPhones** → illegal without permission, disruptive.
