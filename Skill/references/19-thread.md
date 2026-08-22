# 19 - Thread / Matter

> Wayfinder + RFSAM controls for Thread/Matter. Thread = IPv6 mesh over 802.15.4; Matter rides on top.

## Facts
- **Band**: 2.4 GHz ISM - IEEE 802.15.4 O-QPSK (same radio layer as Zigbee).
- **Channels**: 16 x 5 MHz, 11-26 (2.405-2.480); a Thread network on one channel.
- **Stack**: IPv6 mesh: 802.15.4 MAC -> 6LoWPAN -> MLE routing -> UDP. Matter (CHIP) on top.
- **Thread security**: MAC AES-128-CCM* with network key - strong link crypto. Commissioning: Commissioner auth with PSKc; Joiner admitted with PSKd via DTLS.
- **Matter transport**: Thread (via Border Router) or Wi-Fi; commissioned over BLE LE. DNS-SD: `_matterc._udp` (commissionable), `_matter._tcp` (operational), `_meshcop._udp` (Border Router Thread).
- **Matter onboarding**: QR (`MT:` Base-38) / 11-digit manual code -> 27-bit setup passcode + 12-bit discriminator + 16-bit Vendor ID + ProductID.
- **Matter crypto**: PASE = SPAKE2+ (P-256) from setup passcode (commissioning window only); CASE = cert (NOC under Root CA, SIGMA P-256) operational. **Passcode = weak link, not the cipher**.

## Layer-by-layer descent

### IG (fingerprinting - read QR/label)
- Thread or Zigbee? (both 802.15.4 - distinguish by upper layers 6LoWPAN+MLE). Matter device? QR/numeric code + BLE onboarding. Resolve VID/PID against **DCL** (Distributed Compliance Ledger - Test-Vendor VID 0xFFF1-0xFFF4 on a shipping product = red flag). Chipset/SDK + CVEs (CASE Sigma1-replay CVE-2024-3297, fabric-footprinting CVE-2024-3454).
- **Kit**: matter-dcl (resolve VID/PID), chip-tool (decode payload + discover BLE/DNS-SD).

### SP - how to see the band (part of Thread LL)
- Thread lives on one 802.15.4 channel. Gqrx (band), Minino (802.15.4 scanner), catnip (activity + topology). Matter BLE onboarding lives on BLE advertising channels (see BLE wayfinder).

### PHY (no control - demodulation on 802.15.4 radio)
- 802.15.4 radios demod+frame together; SDR only to find the channel.

### LL - `RFSAM-THREAD-LL-01` Mesh discovery and commissioning exposure
- **Objective**: park an 802.15.4 radio on the channel -> PCAP. MAC payload AES-128-CCM* under network key; Wireshark decrypts with that key.
- **Kit**: nRF Sniffer 802.15.4 (nRF52840), pyspinel (OpenThread NCP/RCP sniffer), CatSniffer, Minino, WHAD (nRF52840/APIMote).
- **Decoder**: Wireshark (802.15.4 + Thread/6LoWPAN/MLE).
- (Matter BLE commissioning handshake = separate BLE capture - see BLE wayfinder.)

### CR - `RFSAM-THREAD-CR-01` Network credential assessment
- **Objective**: honesty - strong crypto (AES-128-CCM*, SPAKE2+, CASE cert). **No offline key-recovery**. The prize is the Thread network key: it comes from weak/default/exposed commissioning credentials (PSKc/Joiner PSKd). Matter PASE is only as strong as the setup passcode (default/printable -> collapses). Verifier extracted from an insecure device -> offline recovery (low entropy). Online guessing is rate-limited (~20 attempts -> drops out of commissioning mode; window <=15 min in fabric).
- **Kit**: Wireshark (decrypts Thread with network key in decryption-keys table), chip-tool (PASE/passcode test with candidate).
- **No offline cracking tool** - attack commissioning/credentials.

### AT (no dedicated control - commissioning/fabric abuse)
- **[!] MANDATORY AUTHORIZATION**. The real surface is commissioning/fabric onboarding: join the mesh with captured/guessed creds (pyspinel), or commission a Matter device with an open BLE window/weak passcode (chip-tool `pairing ble-thread`). Multi-admin: the commissioning window can be opened/hijacked. The controller **does not verify trustworthiness** of the device -> whoever passes commissioning = full admin.
- **Kit**: pyspinel (join/probe mesh), chip-tool (commission onto fabric), chip-repl (multi-fabric scripting).

### AP
- Matter clusters/attributes over CASE (read/write/invoke/subscribe). ACL that constrains a newly added admin. Commissioned = full admin -> app layer is usually wide open.
- **Kit**: chip-tool (cluster interaction), chip-repl (enum cluster tree), python-matter-server (persistent controller).

## Subflow (specialization of the master flow)

Thread/Matter-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | Thread or Zigbee? (distinguish by upper layers 6LoWPAN+MLE). Matter device: QR/code + BLE onboarding. VID/PID against DCL | - |
| SP -> PHY+LL | 802.15.4 channel fixed (2.4 GHz, 16 channels 11-26, **no hopping**); radio parked. SDR does not decode O-QPSK/DSSS live | - |
| PHY+LL -> CR | MAC payload AES-128-CCM* under network key - Wireshark decrypts with that key. Thread crypto strong | - |
| CR -> AT | No offline key-recovery. Prizes: weak/default commissioning (PSKc/PSKd), Matter PASE limited by setup passcode | - |
| AT | [!]TX re-check; commissioning/fabric onboarding = real surface. Join/probe mesh (pyspinel), commission Matter (chip-tool) | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): unknown device attempting commissioning onto your fabric, or an open BLE commissioning window without your own activity = possible fabric hijack. Register; do **not** descend to AT.

## Legal warnings
- Passive RX 802.15.4 OK.
- **Join/commission/inject = active**: own/authorized mesh/fabric only. Commissioning someone else's device = unauthorized access.
