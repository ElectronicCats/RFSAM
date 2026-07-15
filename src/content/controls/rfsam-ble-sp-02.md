---
id: RFSAM-BLE-SP-02
title: Detect and inventory BLE trackers (Find My / AirTag)
protocol: BLE
layer: SP
criticality: low
applicability:
  - BLE
deferred: false
objective: >-
  Determine whether Apple Find My / AirTag (or comparable) trackers are
  transmitting in the surveyed space, and classify each detection, using the
  CatSniffer AirTag-scanner firmware as a standalone passive detector.
intro: >-
  Find My trackers advertise on the BLE advertising channels and are relayed by
  any nearby Apple device, making a lost or planted tag trackable across a city.
  This control is the passive survey that answers "is a covert tracker
  transmitting here, and which one" - distinct from LL-01, which judges what a
  device's advertising payload leaks.
prerequisites:
  hardware:
    - 'A CatSniffer V3 (CC1352P7) flashed with the AirTag-scanner firmware. Alternates: an Electronic Cats Minino (ESP32-C6) or an ESP32 running airtag-scanner firmware - standalone pocket scanners.'
  software:
    - 'catnip (CatSniffer-Tools) to flash and run the airtag_scanner firmware; a serial terminal (the scanner prints detections at 9600 baud).'
  signal:
    freq: 'BLE advertising channels 37/38/39 (2.402 / 2.426 / 2.480 GHz)'
    bandwidth: '2 MHz per channel'
    modulation: 'GFSK - LE 1M PHY'
  skill: beginner
attacks:
  - name: Covert location tracking (unwanted tracker)
    refs:
      - heinrich2021findmy
    impact: >-
      A planted tracker locates a victim continuously by riding the Find My
      crowd-sourced network, with city-scale coverage and no SIM or GPS on the
      tag itself.
    preconditions: >-
      The attacker plants an AirTag / Find My tag on the victim or their
      property; the victim moves within range of Apple relay devices.
    summary: >-
      The stalking threat this survey defends against - detecting the tag's BLE
      advertisements is the counter-surveillance measurement.
references:
  - key: heinrich2021findmy
    title: "Who Can Find My Devices? Security and Privacy of Apple's Crowd-Sourced Bluetooth Location Tracking System"
    authors: 'A. Heinrich, M. Stute, T. Kornhuber, M. Hollick'
    venue: 'Proceedings on Privacy Enhancing Technologies (PoPETs) 2021(3)'
    year: 2021
    url: 'https://petsymposium.org/popets/2021/popets-2021-0045.php'
    type: paper
  - key: openhaystack
    title: 'OpenHaystack - build your own Find My network / accessories'
    authors: SEEMOO Lab (TU Darmstadt)
    venue: GitHub
    year: 2024
    url: 'https://github.com/seemoo-lab/openhaystack'
    type: tool
  - key: airguard
    title: 'AirGuard - protecting users from stalking by AirTags and Find My accessories'
    authors: SEEMOO Lab (TU Darmstadt)
    venue: GitHub
    year: 2024
    url: 'https://github.com/seemoo-lab/AirGuard'
    type: tool
  - key: catnip-tools
    title: 'CatSniffer-Tools (catnip) - AirTag scanner firmware and runner'
    authors: Electronic Cats
    venue: GitHub
    year: 2026
    url: 'https://github.com/ElectronicCats/CatSniffer-Tools'
    type: tool
tools:
  - catnip
  - catsniffer
  - minino
  - esp32-airtag-scanner
bsam: []
resources:
  - RFSAM-RES-04
reviewStatus: reviewed
confidence: medium
lastResearched: 2026-07-14
---
## Mechanism

An Apple Find My tracker (AirTag and the wider Find My accessory ecosystem) broadcasts BLE advertisements that carry a rotating public key. Any nearby Apple device that hears one silently uploads an end-to-end-encrypted location report to Apple's servers, keyed to that public key, so the owner can later fetch the tag's location - offline finding built on a crowd-sourced network of hundreds of millions of relay devices, with no SIM or GPS in the tag [heinrich2021findmy]. Heinrich et al. reverse-engineered and analysed this system; OpenHaystack demonstrated the protocol is open enough to build custom accessories and your own tracking, which also means custom and clone tags exist in the wild [openhaystack].

The same reach that makes Find My useful makes a planted tag an effective covert tracker, which is the stalking threat that anti-stalking detectors such as AirGuard exist to counter [airguard]. Detection is a spectrum-layer question - "what is transmitting here" - specialised to trackers: the tag's advertisements are in the air on the BLE advertising channels whether or not you are its owner. The CatSniffer's airtag_scanner firmware turns the CC1352 into a standalone detector that surfaces these Find My / AirTag advertisements and prints each to the serial console [catnip-tools].

This is a **passive detection survey**, not a device weakness - hence `criticality: low`. It carries no transmit step; the separate `airtag_spoofer` firmware does transmit and is out of scope here. Distinguish this control from RFSAM-BLE-LL-01: LL-01 inventories what a device's advertising payload leaks about identity; SP-02 asks only whether a tracker is present in the surveyed space and classifies it.

## Procedure

Passive reception only - no transmission. Even so, only operate the radio where you are authorised to.

1. **Flash and run the AirTag scanner.** catnip handles the firmware and starts the scan:
   ```bash
   python catnip.py sniff airtag_scanner
   ```
   Expected: catnip confirms or flashes the `airtag_scanner_CC1352P_7_v1.0.hex` firmware, then instructs you to connect to the CatSniffer serial port at 9600 baud to read detections. Unlike the BLE sniff modes, this firmware prints to the serial console rather than writing a PCAP.

2. **Open the serial console.** Use the built-in helper, or any serial terminal at 9600 baud:
   ```bash
   python catnip.py sniff airtag_scanner --putty
   ```
   Expected: a serial terminal at 9600 baud showing each detected Find My / AirTag advertisement (its address and status/payload fields) as the board hears it. Let it run long enough to characterise the space.

3. **Classify each detection.** Separate expected owner devices (your own phone, watch, tags you brought) from unexpected or persistent ones. The signal that matters for counter-surveillance is a tag you do not own that stays with you across locations. Cross-check with a phone's built-in unknown-tracker alerting or the AirGuard app where available [airguard].

4. **(Alternates, no laptop.)** The Electronic Cats Minino (ESP32-C6) and an ESP32 running airtag-scanner firmware do the same standalone detection from a pocket device. Note the CatSniffer also has an `airtag_spoofer` firmware that transmits spoofed Find My advertisements - out of scope for this passive survey; use it only on your own equipment with explicit authorisation.

## Field case

Illustrative walkthrough - substitute what you capture; do not assert a finding until it is measured. Running `python catnip.py sniff airtag_scanner` flashes the scanner firmware and, on the serial console at 9600 baud, each Find My / AirTag advertisement the CC1352 hears is printed as it arrives [catnip-tools]. In an ordinary occupied space you typically see a handful of Find My detections - most of them the surveyed party's own devices and tags - which is the baseline you classify against.

For a real sweep, record: [FILL: scan-window length], [FILL: number of distinct Find My / AirTag detections], [FILL: how many resolved to owner devices vs unexpected], and specifically [FILL: any tag observed persisting across two or more locations] - the counter-surveillance finding. Capture the serial output; do not fabricate detections.

## Remediation

This control is a **counter-surveillance survey**, so the output is documentation and action, not a device fix.

- **Individual / operator:** Run periodic sweeps in sensitive spaces (vehicles, bags, meeting rooms). Act on any tracker that persists across locations and is not yours. Use built-in unknown-tracker alerts and the AirGuard app as continuous complements to a point-in-time scan [airguard].
- **Integrator / venue:** Where the threat model includes stalking or covert asset-tracking, make counter-surveillance sweeps policy, and provision a standalone scanner (CatSniffer, Minino) for staff.
- **Honest limit:** detectability depends on the tracker actually advertising in a format the scanner recognises. Silent, powered-down, or non-Apple trackers may evade a single-ecosystem Find My scan - state this gap rather than reporting "no trackers present" as proof of absence.
