---
id: RFSAM-BLE-LL-01
title: Audit advertising and identifier exposure
protocol: BLE
layer: LL
criticality: medium
applicability:
  - BLE
deferred: true
objective: >-
  Determine, from passive capture alone, whether a device's advertising leaks
  identity- or product-bearing data (names, serials, service UUIDs, manufacturer
  data) or carries a stable/linkable identifier that defeats address
  randomisation and enables passive tracking.
intro: >-
  BLE advertising packets are transmitted in the clear and readable by any
  passive observer — no connection or pairing required. Manufacturer-specific
  data, device names, and service UUIDs frequently leak product identity, user
  identity, or trackable identifiers, and a non-rotating identifier in the
  payload can re-link a device across address changes. The link-layer judgement
  of what counts as over-exposure is BSAM's (BSAM-DI-03 / DI-04 / DI-06); RFSAM
  owns the RF-capture prerequisite — the passive advertising sweep that produces
  the beacons to inspect.
prerequisites:
  hardware:
    - 'A CC1352-class BLE sniffer (CatSniffer / any Sniffle-capable board), an nRF52840 dongle (nRF Sniffer), or an Ubertooth One — anything that captures the three advertising channels and exports a PCAP.'
  software:
    - 'Sniffle (or nRF Sniffer / Ubertooth), Wireshark for dissection, and optionally a host BLE stack (Bleak) for confirmatory enumeration.'
  signal:
    freq: '2.402–2.480 GHz (2.4 GHz ISM); advertising on channels 37 (2.402), 38 (2.426), 39 (2.480 GHz)'
    bandwidth: '2 MHz per channel'
    modulation: 'GFSK · LE 1M / 2M / Coded PHY'
  skill: beginner
attacks:
  - name: Address-carryover tracking
    refs:
      - becker2019tracking
    impact: >-
      Passive re-identification and location tracking of a device across its
      randomised-address changes, defeating the privacy goal of address
      randomisation.
    preconditions: >-
      The device advertises continuously and carries an identifying token in the
      advertising payload (e.g. manufacturer data or a stable GATT/service
      signature) that changes on a different schedule than the random address.
    summary: >-
      Exploits the asynchronous timing of address vs. payload change: an
      unchanged token in the payload re-links a new random address back to a
      known device, so randomisation alone does not prevent tracking.
  - name: Physical-layer fingerprint tracking
    refs:
      - givehchian2022physical
    impact: >-
      Tracking of a specific device by a per-radio hardware fingerprint, which no
      amount of address or payload hygiene removes — an exposure to flag even
      when the advertising content itself is clean.
    preconditions: >-
      Sustained capture of the device's transmissions with a capable receiver;
      the fingerprint can drift with temperature and may collide between devices,
      limiting reliability.
    summary: >-
      Fingerprints the unique physical-layer imperfections of a BLE transmitter
      (carrier/I-Q offsets across the whole packet, not just the preamble) to
      identify and track a device independent of its over-the-air identifiers.
references:
  - key: becker2019tracking
    title: Tracking Anonymized Bluetooth Devices
    authors: J. K. Becker, D. Li, D. Starobinski
    venue: 'Proceedings on Privacy Enhancing Technologies (PoPETs) 2019(3)'
    year: 2019
    url: 'https://petsymposium.org/popets/2019/popets-2019-0036.pdf'
    type: paper
  - key: givehchian2022physical
    title: Evaluating Physical-Layer BLE Location Tracking Attacks on Mobile Devices
    authors: 'H. Givehchian, N. Bhaskar, E. Rodriguez Herrera, H. R. López Soto, C. Dameff, D. Bharadia, A. Schulman'
    venue: 'IEEE Symposium on Security and Privacy (S&P) 2022 (doc. 9833758)'
    year: 2022
    url: 'https://wcsng.ucsd.edu/ble/'
    type: paper
  - key: bt-core-spec
    title: 'Bluetooth Core Specification (GAP: privacy, resolvable private addresses, advertising data)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2024
    url: 'https://www.bluetooth.com/specifications/specs/core-specification/'
    type: spec
  - key: bt-assigned-numbers
    title: 'Bluetooth Assigned Numbers (Company Identifiers and Generic Access Profile / advertising AD types)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2024
    url: 'https://www.bluetooth.com/specifications/assigned-numbers/'
    type: standard
  - key: bt-rpa-timeout
    title: Enhancing device privacy and energy efficiency with Bluetooth Randomized RPA Updates
    authors: 'G. Lu, A. Perez (Bluetooth SIG)'
    venue: Bluetooth SIG blog
    year: 2025
    url: 'https://www.bluetooth.com/blog/enhancing-device-privacy-and-energy-efficiency-with-bluetooth-randomized-rpa-updates/'
    type: blog
tools:
  - sniffle
  - catsniffer
  - nrf-sniffer
  - wireshark
  - bleak
bsam:
  - BSAM-DI-03
  - BSAM-DI-04
  - BSAM-DI-06
resources:
  - RFSAM-RES-04
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

BLE advertising is sent in the clear on three primary advertising channels — 37, 38 and 39 (2.402, 2.426 and 2.480 GHz) — and any passive receiver can read it without a connection or pairing [bt-core-spec]. The advertising payload (AdvData) is a sequence of length-tagged AD structures: the complete/shortened Local Name, advertised Service UUIDs, and Manufacturer Specific Data (AD type `0xFF`, which begins with a 16-bit Company Identifier) are the common identity-bearing fields, all defined in the Bluetooth Assigned Numbers [bt-assigned-numbers]. Device names routinely embed a product model or a user-chosen label; manufacturer data may embed serials, MACs, or rotating-but-linkable tokens. This control captures advertisements and inventories every field for sensitive or identity-bearing content — the judgement of what is *too much* is owned by BSAM (BSAM-DI-03 generic naming, BSAM-DI-04 sensitive-data exposure).

Address randomisation is the BLE privacy mechanism intended to stop this leaking into trackability: a device using privacy advertises with a Resolvable Private Address (RPA) generated from an Identity Resolving Key, rotating it on a timer whose recommended default `RPA_Timeout` is 900 s / 15 minutes (a configurable parameter, not a hard requirement) [bt-rpa-timeout]. Two well-documented attack families defeat it. **Address-carryover tracking** (Becker et al.) exploits the fact that the random address and the payload change on different schedules: an identifying token left unchanged in the payload re-links a freshly rotated address back to a known device, so randomisation alone does not prevent tracking [becker2019tracking]. The authors observed this against Windows 10, iOS and macOS devices and some wearables; Android devices that do not continuously advertise were not affected [becker2019tracking]. **Physical-layer fingerprint tracking** (Givehchian et al.) goes a level deeper, identifying a device from the per-radio hardware imperfections in its transmissions — independent of any over-the-air identifier — though the fingerprint can drift with temperature and collide between devices, which limits reliability in the field [givehchian2022physical]. Even a payload that is clean by BSAM's content rules can therefore still be trackable; flag the physical-layer exposure where the threat model warrants it.

This control is **passive and observational** — capture and inventory only, no connection or transmission — so it carries no authorised-testing transmit step. It still requires authorisation to operate the radio in the target environment.

## Procedure

Passive capture only. No connection is opened and nothing is transmitted; you are reading advertisements that are already in the air.

1. Park a Sniffle-class sniffer on the advertising channels and capture to a PCAP (RFSAM-RES-04). Scanning mode hops 37/38/39 so you see each advertiser regardless of which channel it lands on:
   ```bash
   sniff_receiver.py -s /dev/ttyACM0 -o ble_adv.pcap
   ```
   Expected: a live table of advertisers with their address, address type (Public / Random Static / RPA), RSSI and advertising data. Let it run long enough to span at least one RPA-rotation interval (≥ 15 min) if you want to observe rotation.

2. Open the capture in Wireshark and isolate advertising PDUs:
   ```
   btle.advertising_header.pdu_type == 0 || btle.advertising_header.pdu_type == 2 || btle.advertising_header.pdu_type == 6
   ```
   Expected: `ADV_IND` / `ADV_NONCONN_IND` / `ADV_SCAN_IND` frames. Inspect the dissected AD structures under *Bluetooth Low Energy Link Layer → Advertising Data*.

3. Inventory every AD structure for each advertiser — Local Name (`0x08`/`0x09`), Service UUIDs (`0x02`–`0x07`), and Manufacturer Specific Data (`0xFF`). Map the leading 16-bit Company Identifier in the `0xFF` data against the Bluetooth Assigned Numbers company list [bt-assigned-numbers].

4. Classify the advertising address type and watch for stability:
   - **Public** or **Random Static** address → a fixed, directly trackable identifier (a BSAM-DI-06 finding).
   - **RPA** → check whether it actually rotates over the capture window. An RPA that never changes is equivalent to a static address.
   - For any **rotating** RPA, scan the payloads for a token (serial, counter, name, or unique service-data blob) that *persists across* a rotation — that is the address-carryover linkage [becker2019tracking]. A simple way to surface candidates is to group frames by a stable payload field and see whether multiple distinct addresses share it:
   ```bash
   tshark -r ble_adv.pcap -Y "btle.advertising_header.pdu_type==0" \
     -T fields -e btle.advertising_address -e btcommon.eir_ad.entry.company_id \
     -e btcommon.eir_ad.entry.data | sort | uniq -c
   ```
   Expected: if one payload value appears under two or more advertising addresses, randomisation is being defeated by a carried-over token.

5. Flag every human-meaningful name, embedded serial/MAC, and non-rotating identifier as a candidate exposure, and hand the over-exposure judgement to the BSAM controls (BSAM-DI-03 / DI-04 / DI-06). Optionally confirm a name field with a host scan — still passive, no pairing:
   ```bash
   python3 -c "import asyncio;from bleak import BleakScanner;asyncio.run(BleakScanner.discover(timeout=10))"
   ```
   Expected: the same advertised names/manufacturer data seen by the sniffer, as a cross-check that the leak is observable from a commodity host (RFSAM-RES-04).

## Field case

Illustrative walkthrough — substitute the values you capture. In a passive sweep of an ordinary room, advertisers typically surface human-readable names that expose device class and ownership directly in the clear: a pet tracker advertising as `PwnPet_C81F`, an asset tracker as `TRKM_608015814_7795`, and several earbuds/wearables broadcasting model strings. No connection is made — the identity leak is in discovery alone.

The asset tracker is the instructive one for this control. Its advertised name `TRKM_608015814_7795` embeds what reads as a fixed serial/asset number; even if the device were to randomise its BLE address, that constant string in the Local Name AD structure re-links every rotation straight back to the same unit — the address-carryover linkage in concrete form [becker2019tracking]. Over a [FILL: capture-window length] window, record the tracker's advertising address as [FILL: address type — public / static / RPA, and whether it rotated], and confirm whether the `TRKM_…` name stays constant throughout: a constant Local Name spanning two or more distinct addresses is the carryover finding in the field.

## Remediation

Layered, since the leak originates in product firmware but is inherited by integrators and seen by operators.

- **Developer (device firmware):** Use a generic, non-identifying Local Name — no model, serial, owner label, or hostname in advertising data (BSAM-DI-03). Keep model/serial and any sensitive attributes behind an authenticated, encrypted connection, never in AdvData (BSAM-DI-04). Advertise with a **Resolvable Private Address** and confirm it actually rotates (default 900 s; consider the randomized-RPA-update feature to break timing predictability) [bt-rpa-timeout], and put **no** stable token — serial, counter, or unique service-data blob — in the payload, or the RPA is defeated by carryover [becker2019tracking][bt-core-spec]. Be aware the physical-layer fingerprint is a residual exposure that content hygiene cannot close [givehchian2022physical].
- **Integrator:** During acceptance testing, run this passive sweep and reject builds that ship a public/static address, a never-rotating RPA, or identity-bearing AdvData. Verify any vendor "privacy mode" is enabled in the shipped configuration, not merely available (BSAM-DI-06).
- **Operator:** Treat BLE advertising as broadcast-to-the-world. For trackable assets, minimise continuous advertising where the use case allows (intermittent advertising materially reduces carryover-tracking feasibility [becker2019tracking]), and account for the residual physical-layer-fingerprint risk in the threat model for high-sensitivity deployments [givehchian2022physical].
</content>
</invoke>
