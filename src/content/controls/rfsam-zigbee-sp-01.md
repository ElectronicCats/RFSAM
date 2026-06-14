---
id: RFSAM-ZIGBEE-SP-01
title: Survey the 802.15.4 channels and confirm capture feasibility
protocol: ZIGBEE
layer: SP
criticality: info
applicability:
  - Zigbee
  - IEEE 802.15.4
deferred: false
objective: >-
  Determine which 802.15.4 channel(s) carry the target PAN and whether that PAN
  can be observed from the assessment position — i.e. confirm the channel, PAN ID
  and a usable signal before committing a capture radio to the link layer.
intro: >-
  A 2.4 GHz Zigbee PAN is pinned to one of sixteen fixed 802.15.4 channels and
  stays there — it does not frequency-hop. The Spectrum-layer job is therefore a
  channel scan, not a hop chase: find the channel the network lives on, read its
  PAN ID, and judge whether the signal is strong and clean enough (against heavy
  Wi-Fi overlap in this band) to capture. This control is observational; it
  establishes capture feasibility before any link-layer work.
prerequisites:
  hardware:
    - 'An 802.15.4 capture radio for the channel/energy scan: CatSniffer (CC1352), nRF52840 dongle, TI CC2531, or an Electronic Cats Minino (ESP32-C6, standalone)'
    - 'Optionally a wideband SDR (HackRF One / bladeRF 2.0 micro) for a coarse spectrum/waterfall cross-check'
  software:
    - 'A channel/PAN scanner: KillerBee (zbstumbler, active) or Kismet (passive 802.15.4 survey); catnip cativity on a CatSniffer; gqrx for the SDR waterfall'
  signal:
    freq: '2.4 GHz: 16 channels 11–26, centre Fc = 2405 + 5(k−11) MHz (2405–2480 MHz), spaced 5 MHz'
    bandwidth: '~2 MHz occupied per channel'
    modulation: 'IEEE 802.15.4 O-QPSK with DSSS, 250 kbps (2.4 GHz PHY)'
  skill: beginner
attacks:
  - name: Active network discovery (beacon-request scan)
    refs:
      - killerbee
      - ieee802154-2020
    impact: >-
      Enumerates reachable PANs — channel, 16-bit PAN ID and stack/profile hints —
      without joining or decrypting; the reconnaissance that precedes any capture
      or attack, not an exploit in itself.
    preconditions: >-
      A transmit-capable 802.15.4 radio within range of the PAN; the network's
      devices answer a MAC beacon request (the default behaviour of a
      beacon-enabled or association-permitting coordinator).
    summary: >-
      zbstumbler walks the channels transmitting 802.15.4 beacon requests and
      logs the PANs that answer (PAN ID, channel, stack profile) — an active scan
      that locates the network fast. Because it transmits, prefer a passive
      energy/Kismet sweep where stealth or non-interference matters.
references:
  - key: ieee802154-2020
    title: 'IEEE Std 802.15.4-2020 — IEEE Standard for Low-Rate Wireless Networks (PHY/MAC; 2.4 GHz O-QPSK PHY, channel pages 11–26, ED and active scanning)'
    authors: IEEE 802.15 Working Group
    venue: IEEE Standards Association
    year: 2020
    url: 'https://standards.ieee.org/ieee/802.15.4/7029/'
    type: standard
  - key: killerbee
    title: 'KillerBee — IEEE 802.15.4/ZigBee Security Research Toolkit (zbstumbler active network discovery)'
    authors: River Loop Security (riverloopsec)
    venue: GitHub
    year: 2023
    url: 'https://github.com/riverloopsec/killerbee'
    type: tool
  - key: catsniffer-tools
    title: 'CatSniffer-Tools / catnip — cativity 802.15.4 channel-activity monitor and topology discovery'
    authors: Electronic Cats
    venue: GitHub
    year: 2025
    url: 'https://github.com/ElectronicCats/CatSniffer-Tools'
    type: tool
  - key: kismet
    title: 'Kismet — passive 802.15.4 / Zigbee channel survey and pcapng logging'
    authors: Mike Kershaw (kismetwireless)
    venue: GitHub
    year: 2025
    url: 'https://github.com/kismetwireless/kismet'
    type: tool
  - key: silabs-an1017
    title: 'Driving Wi-Fi, ZigBee and Thread Coexistence in the 2.4 GHz Band, Part 1: Unmanaged Coexistence (Silicon Labs AN1017 content — frequency separation tolerates ~20 dB more Wi-Fi than adjacent-channel; Zigbee ch 25/26 require reduced TX power for FCC in North America)'
    authors: Silicon Labs
    venue: Embedded Computing Design
    year: 2017
    url: 'https://embeddedcomputing.com/application/networking-5g/visualization-orchestration-management/driving-wi-fi-zigbee-and-thread-coexistence-in-the-2-4-ghz-band-part-1-unmanaged-coexistence'
    type: blog
  - key: metageek-coex
    title: 'ZigBee and Wi-Fi Coexistence — Wi-Fi non-overlapping channels 1/6/11 occupy the same frequencies as Zigbee channels 11–22'
    authors: MetaGeek (now Oscium)
    venue: Oscium Training Resources
    year: 2024
    url: 'https://www.oscium.com/training/zigbee-wifi-coexistence/'
    type: blog
  - key: haade-zigbee-channels
    title: 'Interference between Zigbee and Wi-Fi at 2.4 GHz — the non-overlapping Zigbee channels 15, 20, 25 and 26 sit outside almost all standard Wi-Fi settings'
    authors: Haade
    venue: Haade Blog
    year: 2023
    url: 'https://haade.fr/en/blog/interference-zigbee-wifi-2-4ghz-to-know'
    type: blog
tools:
  - killerbee
  - kismet
  - catnip
  - minino
  - gqrx
bsam: []
resources:
  - RFSAM-RES-16
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A 2.4 GHz Zigbee PAN operates on a single IEEE 802.15.4 channel and stays there for the life of the network — unlike BLE, it does not frequency-hop across the band [ieee802154-2020]. The 2.4 GHz PHY defines sixteen channels numbered 11–26, spaced 5 MHz apart, with channel `k` centred at `Fc = 2405 + 5(k − 11)` MHz — i.e. 2405 MHz (ch 11) to 2480 MHz (ch 26) — each occupying roughly 2 MHz, modulated as O-QPSK with DSSS at 250 kbps [ieee802154-2020]. Because the PAN is pinned to one channel, the Spectrum-layer task is a channel scan to find that channel and read the PAN's identity, not a hop chase.

There are two ways to find the channel, and they differ in whether they transmit. An **active scan** sends a MAC beacon request on each channel and records the beacons that answer, yielding the channel, the 16-bit PAN ID and stack/profile hints in seconds; KillerBee's `zbstumbler` is the canonical implementation, walking the channels and logging every PAN that responds [killerbee]. Active scanning is defined by the standard as the coordinator/device discovery primitive [ieee802154-2020], but it is observable to anyone listening and perturbs the network. A **passive survey** instead listens only — an energy/ED-style sweep or a frame-logging channel hop that never sends a beacon request. Kismet channel-hops the 802.15.4 band and logs every PAN, coordinator and device it hears to pcapng without transmitting [kismet]; on a CatSniffer, catnip's `cativity` mode draws a live per-channel activity table and can map coordinator/router/end-device topology [catsniffer-tools]. A wideband SDR waterfall (gqrx) is only a coarse cross-check: it shows energy, not Zigbee frames, and cannot by itself tell Zigbee from Wi-Fi or BLE in the shared band.

Capture feasibility is dominated by Wi-Fi coexistence: 802.15.4 shares 2.4 GHz with 802.11, whose ~20 MHz channels overlap several Zigbee channels at once, so a target on a Wi-Fi-congested channel may be hard to capture cleanly. AN1017 frames the defence as *frequency separation* — place the 802.15.4 channel as far as possible from the Wi-Fi channel, ideally at the opposite end of the 2.4 GHz ISM band — because adjacent-channel performance can be up to 20 dB worse than the "far-away" case [silabs-an1017]. The non-overlapping Wi-Fi channels 1/6/11 occupy the same frequencies as Zigbee channels 11–22 [metageek-coex], so practitioners commonly place a PAN on a higher channel above that traffic; the non-overlapping Zigbee channels 15, 20, 25 and 26 sit in the gaps outside almost all standard Wi-Fi settings and are the common choices [haade-zigbee-channels], with channel 26 often the least Wi-Fi-affected but supported by fewer devices. Note a North-American regulatory constraint: AN1017 states Zigbee channels 25 and 26 require reduced transmit power to meet FCC requirements [silabs-an1017].

## Procedure

> Authorised testing only. Step 1 (active scan) transmits 802.15.4 beacon requests into the RF environment; run it only against networks you are authorised to assess, ideally in an RF-shielded setup or with explicit permission. Where stealth or non-interference is required, skip to the passive survey in step 2.

1. **Active scan — find the channel and PAN ID fast (transmits).** Walk the 16 channels with KillerBee, sending beacon requests and logging responders:
   ```bash
   zbstumbler
   ```
   Expected output: one line per discovered PAN, e.g. `New Network: PANID 0x1A62 Source 0x0000 Ext PANID ... Channel 15 Stack Profile: ZigBee PRO`. Record the **Channel** and **PANID** of the target — that is the channel you will park a capture radio on. No responders on any channel means the network is out of range, on a non-default channel set, or not answering beacon requests (try the passive survey).

2. **Passive survey — confirm without transmitting.** Channel-hop and log every PAN/device heard, sending nothing:
   ```bash
   kismet -c nrf52840.0:name=zigbee
   ```
   (Substitute your 802.15.4 datasource; a CatSniffer v3 Zigbee source is specified manually as a serial port.) Expected: Kismet's UI lists 802.15.4 devices/PANs with their channel as it hops, and writes a `.kismet`/pcapng log. Cross-check the channel and PAN ID against step 1; a passive hit on the same channel confirms the PAN is observable from your position.

3. **CatSniffer: per-channel activity and topology (CatSniffer kit).** On a CatSniffer, see which channel is busy at a glance and optionally map the mesh:
   ```bash
   python3 catnip.py cativity
   python3 catnip.py cativity --channel 15 --topology --protocol zigbee
   ```
   Expected: a live per-channel activity table (default mode) highlighting the busy channel, then a fixed-channel detail view and a coordinator/router/end-device topology for the chosen channel.

4. **SDR waterfall — coarse spectrum cross-check (optional).** Tune an SDR to the target channel's centre to judge signal strength and Wi-Fi overlap before committing:
   ```bash
   gqrx
   ```
   Tune to `Fc = 2405 + 5(k − 11)` MHz for channel `k` (e.g. 2425 MHz for channel 15). Expected: a ~2 MHz Zigbee burst pattern at the channel centre, often beside much wider Wi-Fi energy. This only confirms energy is present — it does not decode frames; use steps 1–3 to confirm it is Zigbee.

5. **Record feasibility.** Note channel, PAN ID, observed signal level and the Wi-Fi overlap. This is the hand-off to the LL-layer capture control: the channel to park on and whether capture is clean or contended.

## Field case

Illustrative walkthrough — substitute the values you capture. A bench survey of a Zigbee 3.0 smart-bulb hub on an authorised test network would run as follows. `zbstumbler` (KillerBee, nRF52840) reports a single PAN: PANID `[FILL: observed PAN ID]` on **channel 15** with Stack Profile `ZigBee PRO`. A passive Kismet sweep over the same band confirms the PAN on channel 15 and records `[FILL: device count]` distinct 802.15.4 devices, sending nothing on air. On gqrx tuned to 2425 MHz (channel 15 centre), the ~2 MHz Zigbee bursts appear in a gap beside a Wi-Fi AP on Wi-Fi channel 6, signal `[FILL: measured RSSI/dBm]` — read this against your environment to judge whether capture is clean. Conclusion in this illustration: capture feasible on channel 15; hand off to the LL capture control parked on that channel. The `[FILL: …]` items are placeholders for the values you measure on your own engagement, not reported findings.

## Remediation

Channel survey is reconnaissance; "remediation" here is reducing the exposure and interference it depends on, layered by role.

- **Developer / stack vendor:** Do not leak network identity before encryption is in force. The channel and PAN ID are inherently observable (they are layer-1/MAC), so the defence is to ensure nothing of value is readable from beacons or pre-join traffic, and to support install-code / Zigbee 3.0 joining so that locating the network does not advance an attacker toward the key (see the CR-layer control).
- **Integrator:** Choose a channel deliberately. Maximizing frequency separation from local Wi-Fi improves reliability [silabs-an1017], and placing the PAN on a higher channel above the common Wi-Fi traffic (e.g. 15/20/25/26) is the usual channel-planning advice [haade-zigbee-channels] — which incidentally also makes the network easier to capture cleanly, so weigh coexistence against exposure, and prefer install-code joining so a located PAN is not a joinable one. Avoid the well-known default Trust Center link key.
- **Operator:** Treat the RF environment as observable. A surveyable, fixed-channel PAN is normal and cannot be hidden; monitor for anomalous beacon-request floods or unexpected rejoin activity (signs of active scanning/disruption) and ensure devices that briefly expose identifiers (e.g. at join) do so only during controlled commissioning, not continuously.
