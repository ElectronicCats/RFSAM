# 00 — RFSAM Taxonomy

> **Always read at the start of every audit.** Defines the two RFSAM indexing axes
> (protocol × layer), the IDs, the criticality rubric, the full coverage-map, and the
> deference to BSAM. Source: `RFSAM/src/lib/taxonomy.js`, `src/data/layers.js`,
> `src/data/protocols.js`, `src/data/criticality.js`, `src/data/coverage-map.js`,
> `src/data/bsamRelation.js`.

## Index
1. The 7 layers of the methodology
2. The 15 protocols
3. Control ID rules
4. Criticality rubric
5. reviewStatus / confidence lifecycle
6. Full coverage-map (all controls by protocol)
7. RFSAM ↔ BSAM relationship (deference)

---

## 1. The 7 layers of the methodology

An RF audit follows a top-down **descent**. IG is pre-descent; SP→AP is the descent.

| ID | Layer | Color | What it asks |
|----|------|-------|--------------|
| `IG` | Info Gathering | #C9D4E0 | Identify components and cross-reference CVEs before touching the air |
| `SP` | Spectrum | #2FB8E0 | What it transmits, where, and whether your radio can see it |
| `PHY` | Signal / PHY | #3FD17C | From waveform to bits: modulation, demodulation, channelization |
| `LL` | Link / Protocol | #9B8CFF | Frame structure, addressing, identifiers, discovery |
| `CR` | Crypto | #FFC24B | Pairing, key exchange, link confidentiality and integrity |
| `AT` | Attack | #FF7A1A | Active interaction: injection, replay, hijack, rogue infrastructure |
| `AP` | Application | #FF5A5F | What the device trusts over the link: auth, signatures, updates |

**Guiding principle**: the descent is top-down. Do not jump to CR/AT without having passed through SP/PHY/LL.
A clean capture is the foundation of everything else. "Not observed" under a limited radio window
is a **visibility gap, not evidence of absence**.

## 2. The 15 protocols

| ID | Name | Band | Prefix | Status |
|----|------|-------|---------|--------|
| `BLE` | Bluetooth Low Energy | 2.402–2.480 GHz | RFSAM-BLE | deepen |
| `BTC` | Bluetooth Classic | 2.402–2.480 GHz (BR/EDR) | RFSAM-BTC | new |
| `WIFI` | Wi-Fi (802.11) | 2.4 / 5 / 6 GHz | RFSAM-WIFI | deepen |
| `LORA` | LoRa / LoRaWAN | ISM sub-GHz (US915 / EU868) | RFSAM-LORA | deepen |
| `LTE` | LTE / 4G | Licensed cellular | RFSAM-LTE | deepen |
| `RFID` | RFID / NFC | 125 kHz LF / 13.56 MHz HF | RFSAM-RFID | deepen |
| `SUBG` | Sub-GHz ISM / Remotes | 315 / 433 / 868 / 915 MHz | RFSAM-SUBG | deepen |
| `ZIGBEE` | Zigbee / 802.15.4 | 2.4 GHz (+ 868/915 MHz) | RFSAM-ZIGBEE | new |
| `ZWAVE` | Z-Wave | Sub-GHz regional (~868/908 MHz) | RFSAM-ZWAVE | new |
| `THREAD` | Thread / Matter | 2.4 GHz (802.15.4) | RFSAM-THREAD | new |
| `GNSS` | GNSS / GPS | L-band (GPS L1 1575.42 MHz) | RFSAM-GNSS | new |
| `ADSB` | ADS-B (aviation) | 1090 MHz / 978 MHz UAT | RFSAM-ADSB | new |
| `NR5G` | 5G NR | FR1 sub-6 GHz / FR2 mmWave | RFSAM-NR5G | new |
| `GSM` | GSM / 2G | 850 / 900 / 1800 / 1900 MHz | RFSAM-GSM | new |
| `UWB` | Ultra-Wideband | 3.1–10.6 GHz | RFSAM-UWB | new |

## 3. Control ID rules

Format: **`RFSAM-<PROTOCOL>-<LAYER>-<NN>`** — e.g. `RFSAM-BLE-AT-01`.

- `<PROTOCOL>` ∈ the 15 IDs above.
- `<LAYER>` ∈ `IG SP PHY LL CR AT AP`.
- `<NN>` = two-digit sequence number.

**Validated invariant**: the ID's PROTOCOL and LAYER segments **must match** the
`protocol` and `layer` fields of the frontmatter/control. If they do not match, it is an error.

Regex: `^RFSAM-(BLE|BTC|WIFI|LORA|LTE|RFID|SUBG|ZIGBEE|ZWAVE|THREAD|GNSS|ADSB|NR5G|GSM|UWB)-(IG|SP|PHY|LL|CR|AT|AP)-\d{2}$`

## 4. Criticality rubric

| Level | Color | When |
|-------|-------|------|
| `info` | #8B9AAB | Observational; no direct impact (e.g. capture feasibility) |
| `low` | #3FD17C | Minor exposure or hardening gap |
| `medium` | #FFC24B | Significant weakness requiring specific conditions |
| `high` | #FF7A1A | Easily exploitable weakness with significant impact |
| `critical` | #FF5A5F | Total compromise (takeover, key recovery, spoofing) |

**Rule**: severity reflects what you **achieved** with evidence, not the theoretical maximum.

## 5. reviewStatus / confidence lifecycle

- `stub` → migrated skeleton, little real content.
- `draft` → researched and cited, may carry unresolved `[!FLAG]`. What a sub-agent produces.
- `reviewed` → citations and method confirmed, but the field case is an illustrative template.
- `verified` → reviewed AND demonstrated with a real field case; ≥1 reference, zero `[!FLAG]`.

`confidence` ∈ `low medium high` — honest self-assessment of the draft.

## 6. Full coverage-map

Map of all controls that RFSAM defines (one per relevant protocol×layer cell).
`status: existing` = file exists; many are `stub`s to be deepened.

**BLE**: IG-01 (SoC/host stack vulns) · SP-01 (channel map) · PHY-01 (demod/bit recovery) ·
LL-01 (advertising/identifier exposure) · LL-02 (connection-data capture) · CR-01 (pairing/encryption) · AT-01 (hijack live connection)

**BTC**: IG-01 (identify device/BR-EDR/vuln corpus) · SP-01 (inquiry-scan) · LL-01 (baseband capture) · CR-01 (pairing/key strength) · AT-01 (LMP resilience) · AP-01 (exposed profiles)

**WIFI**: SP-01 (band/channel survey) · LL-01 (management-frame exposure) · CR-01 (WPA handshake/PMKID)

**LORA**: SP-01 (sub-band occupancy) · PHY-01 (chirp demod) · LL-01 (LoRaWAN frame profiling) · CR-01 (join/session-key)

**LTE**: IG-01 (baseband/modem vulns) · SP-01 (cell ID/capture) · PHY-01 (resource-grid) · LL-01 (control-channel/identity exposure)

**RFID**: SP-01 (carrier/standard ID) · CR-01 (Crypto1/key strength) · AT-01 (clone/emulate/relay)

**SUBG**: SP-01 (burst discovery) · PHY-01 (demod/framing) · LL-01 (frame/addressing recovery) · CR-01 (rolling-code) · AT-01 (replay/forge)

**ZIGBEE**: SP-01 (channel survey) · LL-01 (PAN/addressing/discovery) · CR-01 (network-key provisioning)

**ZWAVE**: SP-01 (region/frequency ID) · CR-01 (key establishment)

**THREAD**: LL-01 (mesh discovery/commissioning exposure) · CR-01 (network credential)

**GNSS**: SP-01 (signal presence/interference survey) · AT-01 (spoofing/jamming resilience)

**ADSB**: PHY-01 (message capture/decode) · LL-01 (message authenticity) · AT-01 (forge/inject, lab contained)

**NR5G**: SP-01 (cell ID/capture) · LL-01 (broadcast/identity exposure)

**GSM**: SP-01 (ARFCN survey) · CR-01 (cipher/identity exposure)

**UWB**: PHY-01 (ranging signal capture) · AT-01 (distance-manipulation resilience)

> The `scripts/coverage_check.py` script automates the comparison against this map.

## 7. RFSAM ↔ BSAM relationship

**RFSAM is complementary to BSAM (Tarlogic), not a replacement.** BSAM is the mature reference for
Bluetooth; RFSAM is the multi-protocol north star.

### Ownership
- **Spectrum (SP) + Signal/PHY** → RFSAM is the owner for all protocols. BSAM does not cover here.
- **BLE link layer and above** → inherited from BSAM. RFSAM adds only the RF capture prerequisite
  and references the specific BSAM-xx controls.
- **LoRa/LoRaWAN, LTE, and the rest** → RFSAM is the owner end-to-end. BSAM is Bluetooth only.

### BSAM registry that RFSAM references
- `BSAM-IG-01` Bluetooth controller lifecycle status
- `BSAM-IG-02` Bluetooth controller vulnerabilities
- `BSAM-IG-03` Host stack vulnerabilities
- `BSAM-IG-04` Standard vulnerabilities
- `BSAM-DI-03` Generic device naming
- `BSAM-DI-04` Sensitive data exposure
- `BSAM-DI-06` Use random MAC address
- `BSAM-PA-01` Device pairing mode
- `BSAM-PA-04` Rejection of legacy pairing
- `BSAM-PA-05` Pairing without interaction
- `BSAM-AU-03` Forced disconnection
- `BSAM-EN-01` Role switch before encryption
- `BSAM-EN-02` Force use of encryption
- `BSAM-EN-03` Minimum encryption key size
- `BSAM-SE-03` Service access control
- `BSAM-AP-05` Replay attacks
- `BSAM-AP-06` Packet injection

BSAM URL: <https://www.tarlogic.com/bsam/>

**Rule**: when a BLE/BTC control is `deferred: true`, do NOT redirect BSAM content.
Describe only the RF capture prerequisite and cite the BSAM control (`BSAM-XX-NN`) to which it is handed off.
