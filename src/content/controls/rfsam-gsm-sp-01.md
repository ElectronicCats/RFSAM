---
id: RFSAM-GSM-SP-01
title: 'Survey ARFCNs and confirm a captureable GSM carrier'
protocol: GSM
layer: SP
criticality: info
applicability:
  - GSM
deferred: false
objective: >-
  Establish which GSM carriers (ARFCNs) carry a live base station in the target
  band, record each carrier's strength, ARFCN and the receiver's clock error, and
  confirm at least one BCCH carrier falls inside the receiver's tuning envelope —
  the spectrum-layer prerequisite that scopes every later GSM capture control.
intro: >-
  A GSM carrier is a 200 kHz channel indexed by ARFCN, and a downlink BCCH carrier
  transmits continuously, so cells show as steady 200 kHz pickets in the waterfall.
  The reliable way to find them is to scan for the FCCH/SCH synchronisation bursts
  every BTS emits — which also yields each carrier's ARFCN, its power and the
  radio's clock offset (ppm). This control records that carrier inventory and
  confirms a captureable channel; it is an environmental baseline, not a device
  finding. Receiving broadcast information is passive, but anything that transmits
  on licensed cellular spectrum is for authorised testing only.
prerequisites:
  hardware:
    - 'A receive SDR covering the target band: RTL-SDR Blog V4 reaches GSM-850/900 and DCS-1800; PCS-1900 is at the top of its range, so prefer HackRF One / bladeRF 2.0 / USRP B210 there'
    - 'A clean antenna for the band in use (850/900 or 1800/1900 MHz)'
  software:
    - 'kalibrate-rtl (kal) — sweeps a GSM band for live BTS carriers and reports ARFCN, power and ppm clock offset; use the matching HackRF/UHD kalibrate fork for those radios'
    - 'gqrx for the live spectrum/waterfall sanity check'
  signal:
    freq: 'GSM-850 / E-GSM-900 / DCS-1800 / PCS-1900 — band depends on region (900/1800 most of the world, 850/1900 in the Americas); FDD, downlink/uplink spaced 45 MHz (900) / 95 MHz (1800)'
    bandwidth: '200 kHz per ARFCN carrier; each carrier is TDMA-divided into 8 timeslots'
    modulation: 'GMSK (0.3 BT Gaussian-filtered MSK) at 270.833 kbit/s; EDGE adds 8-PSK'
  skill: intermediate
attacks:
  - name: Passive IMSI / identity reconnaissance
    refs:
      - dabrowski2014
    impact: >-
      The carrier survey is the first step of GSM identity reconnaissance: once a
      BCCH carrier is found and demodulated, the cell pages handsets and, during
      attach / location update, exposes the IMSI in the clear — harvestable
      passively with no transmit, and the same broadcast an IMSI catcher mimics.
    preconditions: >-
      GSM authenticates the network to the phone one-way only (the cell never
      proves itself), and the BCCH / synchronisation channels are broadcast
      unprotected, so any receiver in range can locate the carrier and read the
      cell broadcast without a credential.
    summary: >-
      Dabrowski et al. show GSM's one-way authentication and cleartext IMSI
      exposure are what make passive identity collection and fake-base-station
      IMSI catchers practical; locating the live carrier is the entry step this
      control performs.
references:
  - key: ts45005
    title: '3GPP TS 45.005 — GSM/EDGE Radio transmission and reception (200 kHz channel spacing, ARFCN, GMSK 270.833 kbit/s)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=2709'
    type: standard
  - key: ts45002
    title: '3GPP TS 45.002 — GSM/EDGE Multiplexing and multiple access on the radio path (FCCH/SCH bursts, 51-multiframe, BCCH/CCCH/SDCCH/TCH logical channels, 8-slot TDMA)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=2706'
    type: standard
  - key: arfcn
    title: 'Absolute radio-frequency channel number (GSM ARFCN ranges, 200 kHz spacing, 45/95 MHz duplex)'
    venue: Wikipedia
    url: 'https://en.wikipedia.org/wiki/Absolute_radio-frequency_channel_number'
    type: blog
  - key: dabrowski2014
    title: 'IMSI-Catch Me If You Can: IMSI-Catcher-Catchers'
    authors: 'A. Dabrowski, N. Pianta, T. Klepp, M. Mulazzani, E. Weippl'
    venue: ACSAC 2014
    year: 2014
    url: 'https://ics.uci.edu/~dabrowsa/dabrowski-acsac14-IMSICatcherCatcher.pdf'
    type: paper
  - key: kalibrate
    title: 'kalibrate-rtl — GSM frequency scanner / clock-offset calculator (RTL-SDR fork of Joshua Lackey''s kalibrate)'
    authors: steve-m (fork)
    venue: GitHub
    url: 'https://github.com/steve-m/kalibrate-rtl'
    type: tool
  - key: grgsm
    title: 'gr-gsm — GNU Radio blocks and tools for receiving GSM transmissions (grgsm_livemon → GSMTAP)'
    authors: P. Krysik (ptrkrysik)
    venue: GitHub
    url: 'https://github.com/ptrkrysik/gr-gsm'
    type: tool
  - key: imsicatcher
    title: 'IMSI-catcher — passive IMSI/TMSI extractor reading gr-gsm''s GSMTAP stream'
    authors: Oros42
    venue: GitHub
    url: 'https://github.com/Oros42/IMSI-catcher'
    type: tool
tools:
  - kalibrate-rtl
  - gqrx
  - rtl-sdr-v4
  - hackrf-one
  - bladerf-2-micro
  - usrp-b210
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-23
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A GSM deployment is a grid of cells, each served by a base station (BTS) that broadcasts on one or more 200 kHz carriers. The carrier is identified by its Absolute Radio Frequency Channel Number (ARFCN): the carrier-to-frequency mapping, the 200 kHz channel spacing and the GMSK modulation at 270.833 kbit/s are defined in 3GPP TS 45.005 [ts45005]. Bands are regional — GSM-850 / E-GSM-900 in the Americas and the 900/1800 split elsewhere — and the ARFCN ranges and the FDD duplex offsets (45 MHz on the 900 band, 95 MHz on the 1800 band) follow the standard band plan [arfcn][ts45005]. Each carrier is divided by TDMA into 8 timeslots, so one 200 kHz channel carries up to 8 logical-channel streams [ts45002].

Because a downlink BCCH carrier transmits continuously, a live cell shows on a waterfall as a steady 200 kHz picket. But the reliable detector is the synchronisation structure rather than the eye: every BTS sends a Frequency Correction Channel (FCCH) burst and a Synchronisation Channel (SCH) burst in timeslot 0 of the BCCH carrier, on a fixed schedule within the 51-frame control multiframe [ts45002]. The FCCH burst is an all-zeros sequence that, after GMSK modulation, produces a pure tone at one quarter of the bit rate — (1625000/6)/4 ≈ 67.708 kHz above the carrier — so a receiver can find a GSM carrier, and measure its own oscillator error, by searching each candidate channel for that tone [ts45002][kalibrate]. This is exactly what `kalibrate` does: it sweeps a band, reports every ARFCN with a live BTS, its relative power, and the ppm clock offset to feed forward into the capture step [kalibrate].

The survey is also the entry point of GSM identity reconnaissance. GSM authenticates the network to the phone one-way only — the cell never proves itself — and the broadcast/synchronisation channels are unprotected, so any receiver in range can locate the carrier and read the cell's broadcast without a credential [dabrowski2014]. Once the BCCH carrier is demodulated, the cell pages handsets and, during attach / location update, exposes the IMSI in the clear; Dabrowski et al. show this cleartext identity exposure and one-way authentication are what make passive identity collection and fake-base-station IMSI catchers practical [dabrowski2014]. This control owns the spectrum-layer half — find the live carrier and confirm it is captureable; the GMSK demodulation and BCCH/CCCH/SDCCH decode are the work of the GSM capture (PHY/LL) controls, which run gr-gsm on the ARFCN found here [grgsm].

## Procedure

> Authorised testing only. Every step below is receive-only — you read what the
> network already broadcasts. Do not transmit on licensed cellular spectrum.

1. **Pick the band for your region and confirm your radio reaches it.** Decide which GSM band the operators use locally — GSM-850/900 and DCS-1800 are within an RTL-SDR Blog V4's range; PCS-1900 sits at the top of its tuning range, so prefer a HackRF / bladeRF / USRP there [ts45005][arfcn].

2. **Sweep the band for live carriers with kalibrate.** Point `kal` at the chosen band and let it lock onto FCCH/SCH bursts:
   ```bash
   kal -s GSM900 -g 40
   ```
   Expected output is one line per ARFCN that carries a live BTS, with its detected power, for example:
   ```text
   GSM-900:
     chan: 12 (937.4MHz - 8.146kHz)   power: 124847.16
     chan: 50 (945.0MHz + 1.215kHz)   power:  98213.44
   ```
   Each `chan:` line is a captureable carrier; the frequency offset is the per-channel clock error and the `power` ranks signal strength [kalibrate]. Record the ARFCNs and pick the strongest as your capture target.

3. **Measure the radio's clock offset (ppm) against the strongest carrier.** Re-run `kal` in single-channel mode on a strong ARFCN so it averages the FCCH tone into a stable ppm figure:
   ```bash
   kal -c 12
   ```
   Expected tail of the output is an average absolute error you carry forward to the capture tools, for example:
   ```text
   average		[+/-  0.022]
   overruns: 0
   not found: 0
   average absolute error: 1.243 ppm
   ```
   A small, stable ppm and zero overruns mean a clean lock; feed this ppm to gr-gsm so its tuning lands on the carrier centre [kalibrate].

4. **Eyeball the carrier to confirm the 200 kHz picket** with gqrx as a sanity check before committing a capture:
   ```bash
   gqrx
   ```
   In the GUI set the device to your SDR, tune to the ARFCN's centre frequency and watch the waterfall. A live downlink BCCH carrier shows as a steady, continuous ~200 kHz block; confirm its width and that it does not drift, then note its centre frequency [ts45005].

5. **Record the inventory.** For each carrier capture: band, ARFCN, downlink centre frequency, relative power, and the measured ppm offset. Mark which carriers fall inside your SDR's tuning envelope (RFSAM-RES-01) — those are the sniffable targets that scope the GSM capture controls, which run gr-gsm on the chosen ARFCN to demodulate and decode the downlink [grgsm].

## Field case

> Authorised testing only — receive-only carrier survey on your own equipment.

Illustrative walkthrough — substitute the values you capture. The figures below are a representative, plausibly-shaped example of kalibrate's output format, not a measured engagement; reproduce on your own authorised equipment and replace them with real measured values before treating any number here as a finding.

A survey of a GSM-900 band runs `kal -s GSM900 -g 40` and surfaces a handful of live ARFCNs, the strongest reading as `chan: 12 (937.4MHz - 8.146kHz) power: 124847.16`. Re-running `kal -c 12` averages the FCCH tone to an `average absolute error: 1.243 ppm` clock offset, and tuning gqrx to that centre confirms a steady 200 kHz downlink picket. Carried forward into the capture step, `grgsm_livemon -f 937.4M` on the same ARFCN (with the measured ppm) demodulates the BCCH and streams GSMTAP into Wireshark — at which point the Oros42 IMSI-catcher reads the GSMTAP feed and prints the IMSI/TMSI the cell pages, with no transmit [grgsm][imsicatcher]. The carrier survey is the prerequisite: without the ARFCN, power and ppm from this step, the capture is aimed at nothing. [FILL: measured ARFCN / centre frequency / power / ppm from a real authorised survey]

## Remediation

This is an environmental baseline and target-selection step, not a device defect — the "weakness" it surfaces (a continuously-broadcast, unauthenticated carrier whose synchronisation bursts advertise the cell) is inherent to GSM's air-interface design [ts45002][dabrowski2014]. Layered guidance for what can be hardened around it:

- **Network operator** — you cannot hide the BCCH carrier or its FCCH/SCH bursts, but you can limit what the *post-survey* capture yields: page by TMSI rather than IMSI and minimise IMSI exposure during location update, run the strongest available ciphering (A5/3, not A5/1), and monitor for anomalous carriers / unexpected ARFCNs that signal a fake cell mimicking your network [dabrowski2014]. Where possible, retire 2G or gate downgrade from 4G/5G, since legacy GSM is what makes this survey-then-capture chain reachable.

- **Device integrator** — select basebands that resist silent downgrade to GSM and that surface 2G/rogue-cell indicators to the user; a device that never falls back to an unauthenticated GSM carrier removes itself from the population this survey targets [dabrowski2014].

- **Auditor / operator of the test** — keep this step strictly receive-only; do not transmit on licensed cellular spectrum. Treat the band/ARFCN/power/ppm inventory as scoping data, confirm each target carrier is inside your receiver's tuning envelope before committing capture hardware (RFSAM-RES-01), and conduct any identity-harvesting or active follow-on (rogue cell, decrypt) only on your own equipment with test SIMs, RF shielding and explicit written permission [dabrowski2014].
