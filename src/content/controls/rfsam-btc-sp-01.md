---
id: RFSAM-BTC-SP-01
title: Inquiry-scan and confirm a reachable BR/EDR device
protocol: BTC
layer: SP
criticality: low
applicability:
  - Bluetooth Classic
deferred: false
objective: >-
  Confirm a Bluetooth Classic (BR/EDR) device is present and reachable, and
  enumerate the discoverable devices in range — BD_ADDR, name, RSSI and Class of
  Device — corroborating that activity with an SDR waterfall over the 2.4 GHz
  band.
intro: >-
  The "see it" floor for Bluetooth Classic. An inquiry scan on a cheap ESP32
  lists every discoverable BR/EDR device's BD_ADDR, name, RSSI and Class of
  Device — the BR/EDR analogue of a BLE advertising scan — while an SDR waterfall
  confirms the band is busy. Be honest about the ceiling: ~1600 hops/s adaptive
  frequency hopping means the SDR shows activity, not a clean per-packet read,
  and the inquiry scan only finds devices currently in discoverable mode.
prerequisites:
  hardware:
    - 'An original ESP32 (BR/EDR-capable radio) DevKit — an ESP32-S3/C-series has no Bluetooth Classic radio and cannot run an inquiry scan'
    - 'Optional: a wideband SDR for the waterfall — HackRF One or bladeRF 2.0 micro'
  software:
    - 'ClassicBTScan or ESP32-BT-exp (Arduino-ESP32, Bluedroid GAP inquiry); Gqrx for the SDR waterfall'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per RF channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: beginner
attacks:
  - name: BlueBorne (SDP information leak)
    cve:
      - CVE-2017-0785
    refs:
      - cve-2017-0785
      - armis-blueborne
    impact: >-
      Leaks bytes of controller/host memory over the SDP service-discovery
      response — no pairing, authentication or user interaction — which the
      BlueBorne chain then uses to defeat ASLR ahead of a remote code-execution
      step.
    preconditions: >-
      The device is reachable on BR/EDR and answers service-discovery requests;
      a discoverable device found by this inquiry scan is exactly such a target.
      Patched on maintained stacks since 2017 — representative of the class, not
      a current finding.
    summary: >-
      Shows why "merely reachable and discoverable" is itself a finding at the
      spectrum layer: an unauthenticated SDP query against a reachable BR/EDR
      device can disclose memory, the entry point of the BlueBorne attack vector.
  - name: BrakTooth (baseband/LMP — downstream)
    refs:
      - garbelini-braktooth
    impact: >-
      Crash, deadlock or (on some controllers) code execution against the BR/EDR
      baseband/Link Manager — but this is an AT-layer follow-on; this control only
      establishes the reachability precondition it needs.
    preconditions: >-
      A reachable BR/EDR controller whose BD_ADDR is known — which is precisely
      what an inquiry scan yields. Treat the affected-chip list as representative;
      check current vendor advisories.
    summary: >-
      Listed here only to make the SP→AT link explicit: confirming a reachable
      device and capturing its BD_ADDR is the precondition for the baseband/LMP
      attack surface assessed later in the descent, not something this control
      performs.
references:
  - key: bt-baseband-spec
    title: 'Bluetooth Core Specification — Part B, Baseband Specification (inquiry procedure, BD_ADDR, inquiry access codes)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG Core Specification
    url: 'https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/br-edr-controller/baseband-specification.html'
    type: spec
  - key: bt-gap-spec
    title: 'Bluetooth Core Specification — Part C, Generic Access Profile (Class of Device, BR/EDR discoverability and inquiry procedures)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG Core Specification
    url: 'https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/host/generic-access-profile.html'
    type: spec
  - key: cve-2017-0785
    title: 'CVE-2017-0785: Android Bluetooth SDP server information disclosure (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-0785'
    type: cve
  - key: armis-blueborne
    title: 'BlueBorne — Bluetooth attack vector (technical white paper)'
    authors: Armis
    venue: Armis Labs
    year: 2017
    url: 'https://en.wikipedia.org/wiki/BlueBorne_(security_vulnerability)'
    type: blog
  - key: garbelini-braktooth
    title: 'BrakTooth: a series of baseband & LMP exploits against Bluetooth Classic controllers (PoC)'
    authors: 'M. E. Garbelini, S. Chattopadhyay et al., ASSET Research Group, SUTD'
    venue: 'GitHub / ASSET Research Group, SUTD'
    year: 2021
    url: 'https://github.com/Matheus-Garbelini/braktooth_esp32_bluetooth_classic_attacks'
    type: tool
  - key: antorfr-classicbtscan
    title: 'ClassicBTScan — Arduino-ESP32 Bluetooth Classic (BR/EDR) inquiry scanner'
    authors: AntorFr
    venue: GitHub
    url: 'https://github.com/AntorFr/ClassicBTScan'
    type: tool
tools:
  - esp32-classic-bt-scan
  - esp32-bt-exp
  - gqrx
bsam:
  - BSAM-IG-01
resources:
  - RFSAM-RES-26
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Bluetooth Classic (BR/EDR) is a different PHY/MAC from BLE: it occupies the same 2.4 GHz ISM band but uses 79 RF channels of 1 MHz each and hops across them under adaptive frequency hopping (AFH) at roughly 1600 hops per second (bt-baseband-spec). That fast hop is exactly why the spectrum layer for Classic splits into two complementary moves rather than one.

The first move is a **spectrum view**. A waterfall over 2.402–2.480 GHz shows BR/EDR bursts scattered across the band, confirming that "something Bluetooth is busy here" — but you cannot lock to one channel and follow a piconet packet-by-packet the way you can with a fixed-channel protocol. At 1600 hops/s a static SDR simply cannot keep up, so the waterfall is an *activity* indicator, not a decode. This is the honest ceiling of SDR at this layer.

The second, and usually more useful, move is an **inquiry scan**. A discoverable BR/EDR device parks in inquiry-scan mode and answers the general inquiry access code (GIAC, LAP 0x9E8B33) with an FHS packet carrying its 48-bit BD_ADDR and its Class of Device, and — after a name request — its user-facing name (bt-baseband-spec, bt-gap-spec). Cheap ESP32 firmware runs a *real* BR/EDR inquiry on the chip's own Bluetooth controller via the Bluedroid GAP API and lists each discoverable device's BD_ADDR, name, RSSI and Class of Device (antorfr-classicbtscan) — the BR/EDR analogue of a BLE advertising scan, and the most practical "see it" step for Classic. Two limits are intrinsic: it only finds devices currently in discoverable mode (a non-discoverable device must be addressed by a BD_ADDR you already know), and Classic inquiry needs the original ESP32 — an S3/C-series part has no BR/EDR radio.

Why this is a finding and not just reconnaissance: a device that is *reachable and discoverable* is, by itself, the precondition for the rest of the Classic attack surface. BlueBorne's SDP information-disclosure flaw (CVE-2017-0785) leaks memory from a reachable BR/EDR device with no pairing, authentication or user interaction at all (cve-2017-0785, armis-blueborne); the BrakTooth baseband/LMP suite needs only a reachable controller and its BD_ADDR to fire (garbelini-braktooth). Both are downstream of this control — listed to make the SP→CR/AT descent explicit — but they are the reason "I can see it and it answers" matters. Treat both CVE corpora as representative and patch-dependent; check current advisories.

## Procedure

> Authorised testing only — run this against devices you own or are explicitly contracted to assess. An inquiry scan is passive at the application layer but still transmits inquiry packets in a licensed-free band; the SDR waterfall is receive-only.

1. **Confirm band activity with the SDR waterfall (receive-only).** Bring up Gqrx on a HackRF One or bladeRF 2.0 micro, tune to the centre of the band and watch for hopping bursts:
   ```bash
   # HackRF: 2.441 GHz centre, 20 Msps, covers most of the 2.402–2.480 GHz band
   gqrx
   # Device string: hackrf=0   (or bladerf=0)
   # Set frequency 2.441 GHz, sample rate 20 Msps, enable the waterfall
   ```
   You should see short bursts skipping unpredictably across the span. That is BR/EDR (and BLE/Wi-Fi) activity — it confirms the band is busy, but you cannot follow one piconet here. Do not expect a clean per-packet decode (garbelini-braktooth, bt-baseband-spec).

2. **Run a BR/EDR inquiry scan on the original ESP32.** Flash ClassicBTScan (or ESP32-BT-exp for a dual-mode Classic+BLE dump) to an original ESP32 DevKit and open the serial monitor at 115200 baud:
   ```bash
   # Arduino-ESP32, original ESP32 target (BR/EDR radio required)
   arduino-cli compile --fqbn esp32:esp32:esp32 ClassicBTScan.ino
   arduino-cli upload  --fqbn esp32:esp32:esp32 -p /dev/ttyUSB0 ClassicBTScan.ino
   arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200
   ```
   The sketch calls the Bluedroid GAP inquiry API and prints one line per discoverable device. Read each field:
   - **BD_ADDR** — 48-bit address; the upper 24 bits are the OUI (vendor lookup).
   - **Name** — the user-facing name from the name request (may be empty).
   - **RSSI** — coarse proximity / link-budget indicator.
   - **Class of Device (CoD)** — the device-type hint (audio, peripheral/HID, phone, etc.).

3. **Record the inventory and cross-reference.** For each hit, note BD_ADDR, name, RSSI and CoD, and resolve the OUI to a vendor. Devices in this list are *reachable and discoverable* — flag that as the spectrum-layer finding, and carry the BD_ADDRs forward to the IG fingerprinting and the CR/AT layers.

4. **Note what you did not see.** A device that is paired-and-connected but non-discoverable will not appear. Absence from the inquiry list is not proof of absence on the air — corroborate with the step-1 waterfall (band busy but no inquiry hits ⇒ likely non-discoverable / already-bonded traffic). See RFSAM-RES-26 for the ESP32 inquiry-scanning walkthrough.

## Field case

Assessing a hands-free car kit and its paired peripherals on the bench, the SDR waterfall over 2.402–2.480 GHz showed steady hopping bursts the moment the head unit powered on — band confirmed busy, but, as expected, nothing followable at ~1600 hops/s. The ESP32 inquiry scan then returned a short inventory:

```
[BR/EDR inquiry]
 BD_ADDR=[FILL: 48-bit address, e.g. AA:BB:CC:11:22:33]  name="[FILL: device name]"  RSSI=-52  CoD=0x240404 (Audio, hands-free)
 BD_ADDR=[FILL: 48-bit address]                          name="[FILL: HID name]"     RSSI=-71  CoD=0x002540 (Peripheral, keyboard)
```

The CoD `0x240404` cleanly identified the hands-free audio unit, and its OUI [FILL: vendor from upper 24 bits] matched the expected infotainment vendor. The keyboard peripheral was discoverable too — an avoidable exposure, since an HID device only needs to be discoverable during pairing. The takeaway recorded at this layer was simply: two reachable, discoverable BR/EDR devices, BD_ADDRs captured, both now in scope for the IG/CR/AT descent. The bracketed `[FILL: …]` values above are illustrative placeholders, not a real capture — replace them with the actual inquiry output from your authorised engagement rather than treating them as findings.

## Remediation

**Developer / firmware.** Do not leave a device in general-discoverable (inquiry-scan) mode after provisioning. Make discoverability a time-boxed, user-initiated pairing window (limited-discoverable, then back to non-discoverable), so a passing inquiry scan returns nothing. Set the Class of Device honestly but minimally — it is a routing hint, not a place for extra detail. Keep the BR/EDR controller and host stack patched against the known reachable-surface classes (BlueBorne SDP leak and the BrakTooth baseband/LMP family); treat those CVE lists as representative and re-check current vendor advisories (cve-2017-0785, garbelini-braktooth).

**Integrator.** Prefer modules that ship non-discoverable by default and expose discoverability only behind an explicit user action. Where a generic device name leaks model/vendor, override it. These link-and-above concerns are owned by BSAM's Bluetooth controls — RFSAM stops at confirming reachability and capturing the inventory, and defers the controller lifecycle/patch assessment to BSAM (BSAM-IG-01).

**Operator.** Power devices down or disable Bluetooth when not in use; pair in a trusted location and within the shortest possible discoverable window. Periodically run an inquiry scan of your own estate to find devices that are needlessly discoverable. A device that never answers an inquiry scan denies an attacker the cheapest reconnaissance step in the entire Classic descent.
