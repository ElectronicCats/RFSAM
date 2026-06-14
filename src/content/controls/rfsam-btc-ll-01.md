---
id: RFSAM-BTC-LL-01
title: Capture Bluetooth Classic baseband traffic
protocol: BTC
layer: LL
criticality: low
applicability:
  - Bluetooth Classic
deferred: false
objective: >-
  Determine whether Bluetooth Classic (BR/EDR) baseband frames can be pulled off
  the air into a dissector on commodity hardware — getting the BT header,
  channel, role, FHS, ACL and LMP of a live piconet into Wireshark/Scapy so the
  link-and-above assessment can begin.
intro: >-
  A software-defined radio cannot follow a BR/EDR piconet hopping ~1600 times a
  second across 79 channels, so the accessible capture path uses a device that
  owns a real Bluetooth controller. The reference option is the Garbelini ESP32
  BR/EDR sniffer — it patches the chip's ROM Bluetooth stack to dump baseband
  packets over USB serial into Wireshark/Scapy; the Ubertooth One is a legacy,
  partial Basic-Rate option. RFSAM owns this RF-capture floor and feeds the
  resulting frames to BSAM's link-and-above controls.
prerequisites:
  hardware:
    - 'An original ESP32 (BR/EDR-capable Classic radio — not an ESP32-S3/C-series, which are LE-only), e.g. ESP32-DOIT (~$4) or ESP32-DevKitC (~$10)'
    - 'Optionally an Ubertooth One for legacy partial Basic-Rate capture'
  software:
    - 'The Garbelini esp32_bluetooth_classic_sniffer firmware + BTSnifferBREDR.py host tool (Scapy, with the h4bcm Wireshark dissector)'
    - 'Ubertooth host tools (ubertooth-rx) + libbtbb for the legacy path'
    - 'Wireshark for dissection'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: intermediate
attacks:
  - name: BrakTooth baseband/LMP fuzzing
    refs:
      - garbelini2022braktooth
      - braktooth-repo
    impact: >-
      Captured baseband/LMP framing is the raw material for directed fuzzing of
      the BR/EDR Link Manager — crashes, deadlocks and, on some controllers,
      code execution — but this control covers only the capture step that
      exposes that framing.
    preconditions: An original ESP32 with the patched BR/EDR stack and a reachable, authorised target device.
    summary: >-
      The same research that produced this sniffer (Garbelini et al., SUTD/ASSET)
      patches the ESP32 BR/EDR baseband stack to observe and then fuzz Link
      Manager packets; the capture firmware here is the observational half of
      that toolchain.
references:
  - key: garbelini2022esp32sniffer
    title: 'esp32_bluetooth_classic_sniffer — Active Bluetooth BR/EDR Sniffer/Injector on the ESP32'
    authors: M. E. Garbelini
    venue: GitHub (GPL-2.0)
    year: 2021
    url: 'https://github.com/Matheus-Garbelini/esp32_bluetooth_classic_sniffer'
    type: tool
  - key: garbelini2022braktooth
    title: 'BrakTooth: Causing Havoc on Bluetooth Link Manager via Directed Fuzzing'
    authors: 'M. E. Garbelini, V. Bedi, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX Security 2022
    year: 2022
    url: 'https://www.usenix.org/conference/usenixsecurity22/presentation/garbelini'
    type: paper
  - key: braktooth-repo
    title: 'braktooth_esp32_bluetooth_classic_attacks — Baseband & LMP exploits against Bluetooth Classic controllers'
    authors: M. E. Garbelini
    venue: GitHub
    year: 2021
    url: 'https://github.com/Matheus-Garbelini/braktooth_esp32_bluetooth_classic_attacks'
    type: tool
  - key: ubertooth-rx
    title: 'ubertooth-rx(1) — Classic Bluetooth discovery, sniffing, and decoding'
    authors: Great Scott Gadgets
    venue: Ubertooth host tools
    year: 2023
    url: 'https://github.com/greatscottgadgets/ubertooth/blob/master/host/doc/ubertooth-rx.md'
    type: tool
  - key: bt-core-spec
    title: 'Bluetooth Core Specification (BR/EDR physical layer: 79 channels, GFSK/DQPSK, AFH hopping)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2023
    url: 'https://www.bluetooth.com/specifications/specs/core-specification-5-4/'
    type: standard
tools:
  - esp32-bt-classic-sniffer
  - ubertooth-tools
  - wireshark
bsam:
  - BSAM-IG-03
  - BSAM-AP-06
resources:
  - RFSAM-RES-25
  - RFSAM-RES-26
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Bluetooth Classic (BR/EDR) carries data over 79 RF channels of 1 MHz each across 2.402–2.480 GHz, using adaptive frequency hopping at roughly 1600 hops per second; Basic Rate is GFSK at 1 Mbps, while Enhanced Data Rate adds π/4-DQPSK (2 Mbps) and 8DPSK (3 Mbps) (bt-core-spec). This is a different PHY/MAC from BLE — never conflate the two. The fast 79-channel hop is exactly what makes a static software-defined radio impractical as a capture front end: by the time you have demodulated one burst, the piconet is several channels away, so there is no clean per-packet read of a live link from raw I/Q.

The accessible capture path therefore borrows a device that already owns a real Bluetooth controller and exposes the packets the controller has *already* demodulated. The reference approach is the Garbelini ESP32 BR/EDR sniffer: it patches the ESP32's ROM Bluetooth stack so that, after the standard paging procedure, baseband packets — the BT header, channel, device role, FHS, ACL and LMP — are forwarded over USB serial to a host Python tool, `BTSnifferBREDR.py`, which decodes them with Scapy and feeds Wireshark live via an extended `h4bcm` dissector (garbelini2022esp32sniffer). This is an **active** sniffer: it connects itself to the target to follow it, rather than passively listening, so it is for authorised testing only. The same research lineage (Garbelini et al., SUTD/ASSET) built directed Link-Manager fuzzing (BrakTooth) on top of this same baseband-stack patching, which is why a clean capture here is also the first step of the BR/EDR attack surface (garbelini2022braktooth, braktooth-repo).

A legacy alternative is the Ubertooth One with `ubertooth-rx`, which can passively pick up *some* Basic-Rate Classic — recovering the LAP/UAP and clock to follow a piconet — but it is partial and lower-fidelity next to the ESP32 baseband sniffer, and it does not see EDR (ubertooth-rx). Either way, the export target is Wireshark for dissection. This control owns only the RF-capture floor: the link-and-above findings (host-stack vulnerabilities, packet injection, replay) are assessed under BSAM once the frames are in a dissector (BSAM-IG-03, BSAM-AP-06).

## Procedure

> Authorised testing only: the ESP32 sniffer actively connects to the target to follow it. Run this against your own device or one you are explicitly contracted to assess, ideally in an RF-shielded or controlled environment.

1. Confirm the target speaks Classic (BR/EDR), not LE-only, and obtain its BD_ADDR (see the inquiry-scan step, RFSAM-RES-26). Flash the Garbelini BR/EDR sniffer firmware onto an **original** ESP32 and build the host tools and Wireshark dissector:
   ```bash
   git clone https://github.com/Matheus-Garbelini/esp32_bluetooth_classic_sniffer
   cd esp32_bluetooth_classic_sniffer
   ./requirements.sh   # installs Wireshark + standalone python3 runtime (sudo)
   ./build.sh          # builds BT host programs and the h4bcm Wireshark dissector
   ```
   `requirements.sh` and `build.sh` should complete without error and leave `BTSnifferBREDR.py` runnable (garbelini2022esp32sniffer).

2. Capture against a known target, streaming live into Wireshark and dumping to `logs/`:
   ```bash
   ./BTSnifferBREDR.py --port=/dev/ttyUSB0 --target=E0:D4:E8:19:C7:69 --live-terminal --live-wireshark
   ```
   The ESP32 pages the target, follows the connection, and forwards baseband packets; the live terminal prints decoded frames and Wireshark opens a live session. You should see baseband header, FHS, ACL and LMP frames for the followed piconet (garbelini2022esp32sniffer). Reading them: LMP carries the link-management exchange (pairing/encryption negotiation), ACL carries the data payloads above it.

3. To survey without a fixed target (let the firmware bridge whatever it sees), drop `--target`:
   ```bash
   ./BTSnifferBREDR.py --port=/dev/ttyUSB0 --live-terminal --live-wireshark
   ```
   Use this when you do not yet have the BD_ADDR; it confirms the capture chain end-to-end into Wireshark (RFSAM-RES-25).

4. *Legacy partial path (Ubertooth One, Basic Rate only):* if no ESP32 is to hand, recover the LAP and follow a piconet passively:
   ```bash
   ubertooth-rx          # survey: list piconets by LAP/UAP
   ubertooth-rx -l <lap> # follow a specific piconet once identified
   ```
   This yields partial Basic-Rate visibility (no EDR, lower fidelity) and is documented as the primary Classic interface for Ubertooth (ubertooth-rx).

5. Confirm the result: a PCAP / live Wireshark session containing dissected BR/EDR baseband frames (BT header, FHS, ACL, LMP) for the target piconet. That capture is the input to the link-and-above BSAM controls.

## Field case

Illustrative walkthrough — substitute the values you capture. Take a Bluetooth Classic OBD-II dongle on a bench (authorised, device owned) and point an original ESP32-DevKitC running the Garbelini sniffer at the dongle's BD_ADDR `[FILL: target BD_ADDR]`:

```bash
./BTSnifferBREDR.py --port=/dev/ttyUSB0 --target=[FILL: target BD_ADDR] --live-terminal --live-wireshark
```

The ESP32 pages and follows the link, and Wireshark's live session shows the baseband header plus LMP frames carrying the pairing/feature exchange, followed by ACL payloads. The captured LMP makes the device's pairing and encryption negotiation visible — the raw material the BSAM encryption controls (e.g. minimum key size, force-use-of-encryption) then assess. The same workflow applies unchanged to a Classic audio headset; the OBD dongle is simply a concrete, low-stakes example. By contrast, an Ubertooth One on the same target typically returns only intermittent Basic-Rate LAPs and never the LMP, illustrating the wayfinder's note that it is a partial, legacy option for serious BR/EDR work.

## Remediation

Capture feasibility itself is low-criticality — it is the price of using an unlicensed, hopping 2.4 GHz radio, and BR/EDR baseband is observable to anyone with the right controller — so remediation targets what the capture *exposes*, not the capture.

- **Developer / device maker:** do not treat the link as a confidential channel by default. Enforce encryption on every connection (reject unencrypted/role-switched-before-encryption links) and use Secure Simple Pairing with a strong association model; assume LMP and ACL are visible to an attacker with an ESP32. Keep the controller firmware patched against the BrakTooth family, since the same baseband visibility this control uses is the attacker's fuzzing entry point (garbelini2022braktooth).
- **Integrator:** prefer dual-mode/LE where the threat model allows, pin firmware to versions with current BR/EDR controller patches, and disable discoverability and unused profiles to shrink what a follower can reach.
- **Operator / assessor:** run active BR/EDR capture only under authorisation and ideally in an RF-shielded environment; treat the resulting PCAP as input to the BSAM host-stack and injection/replay controls (BSAM-IG-03, BSAM-AP-06) rather than a finding in itself. Frame any CVE corpus (BrakTooth and successors) as representative — check current vendor advisories, as BR/EDR controller patch status moves.
