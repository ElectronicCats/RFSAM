---
id: RFSAM-BLE-SP-01
title: Establish BLE channel map and capture feasibility
protocol: BLE
layer: SP
criticality: info
applicability:
  - BLE
deferred: false
objective: >-
  Determine, before any analysis, which BLE advertising and data channels the
  available receiver can observe at once, and therefore whether discovery,
  full-band capture, or connection-following is reachable with the current
  hardware, or whether a 'not observed' is merely a visibility gap.
intro: >-
  Before any analysis, establish whether the BLE channels of interest can
  actually be observed with the available hardware. BLE spreads across 40
  channels over ~80 MHz of the 2.4 GHz band and a connection hops at every
  connection event, wider and faster than most affordable SDRs can capture in a
  single pass, so the radio is a visibility trade-off that bounds every later
  control.
prerequisites:
  hardware:
    - 'A 2.4 GHz-capable receiver: a wide-band SDR (HackRF One ~20 MHz IBW; bladeRF 2.0 micro ~56 MHz, up to 122.88 MHz oversampled; USRP B210 ~56 MHz) or a dedicated BLE sniffer (CatSniffer/CC1352, nRF52840 dongle, Ubertooth One). RTL-SDR will not reach 2.4 GHz.'
  software:
    - 'A spectrum viewer (Gqrx) to judge observable bandwidth; a BLE sniffer (Sniffle, ice9-bluetooth-sniffer, nRF Sniffer, or Ubertooth tools) to confirm what actually decodes'
  signal:
    freq: '2.402 to 2.480 GHz (2.4 GHz ISM)'
    bandwidth: '40 channels × 2 MHz spanning ~80 MHz; 2 MHz per channel'
    modulation: 'GFSK · PHYs: LE 1M (1 Mbps), LE 2M (BLE 5), LE Coded (BLE 5)'
  skill: beginner
attacks: []
references:
  - key: ble-primer
    title: The Bluetooth Low Energy Primer (v1.3.0)
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2024
    url: 'https://www.bluetooth.com/bluetooth-le-primer/'
    type: spec
  - key: ryan2013ble
    title: 'Bluetooth: With Low Energy Comes Low Security'
    authors: M. Ryan (iSEC Partners)
    venue: USENIX WOOT 2013
    year: 2013
    url: 'https://www.usenix.org/system/files/conference/woot13/woot13-ryan.pdf'
    type: paper
  - key: sniffle
    title: Sniffle, a sniffer for Bluetooth 5 and 4.x LE
    authors: NCC Group (S. Quinlan)
    venue: GitHub
    year: 2025
    url: 'https://github.com/nccgroup/Sniffle'
    type: tool
  - key: ice9
    title: 'ice9-bluetooth-sniffer, Wireshark-compatible all-channel BLE sniffer for SDRs'
    authors: M. Ryan (ICE9 Consulting)
    venue: GitHub
    year: 2025
    url: 'https://github.com/mikeryan/ice9-bluetooth-sniffer'
    type: tool
  - key: nuand122
    title: 'bladeRF 2023.02 release: 122.88 MHz instantaneous bandwidth via oversampling'
    authors: Nuand
    venue: Nuand
    year: 2023
    url: 'https://www.nuand.com/2023-02-release-122-88mhz-bandwidth/'
    type: blog
tools:
  - gqrx
  - hackrf-one
  - bladerf-2-micro
  - sniffle
  - ice9-bluetooth-sniffer
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-02
  - RFSAM-RES-03
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

BLE occupies the 2.4 GHz ISM band, 2400 to 2483.5 MHz, divided into 40 channels of 2 MHz width [ble-primer]. Three of these are the primary advertising channels, 37, 38 and 39, and the remaining 37 are general-purpose channels used for connection data [ble-primer]. The three advertising channels are deliberately spread across the band: channel 37 at 2402 MHz, channel 38 at 2426 MHz, and channel 39 at 2480 MHz, so an advertiser is hard to miss but the three cannot be tuned under one narrow receiver window simultaneously.

The signal is **GFSK** [ble-primer]. Once a central and peripheral connect, the connection does not stay on one channel: at the start of each connection event the radio deterministically selects a data channel via a channel-selection algorithm, hopping across the 37 data channels [ble-primer]. The practical consequence for an observer is that a single narrow window sees only the fraction of traffic that happens to land in it.

Following a live connection therefore means either (a) capturing the whole ~80 MHz at once and channelising it in software, or (b) recovering the hop parameters and retuning per hop. Mike Ryan's WOOT 2013 work is the canonical demonstration that a passive sniffer can recover the hop increment, channel map and access address from the connection request and then follow the hopping connection on commodity hardware [ryan2013ble]. That capability, and its prerequisite, *seeing enough of the band*, is what this control records.

The receiver bounds what is reachable:

- A **HackRF One** (~20 MHz instantaneous bandwidth) sees roughly a quarter of the band, one advertising channel at a time. Enough to camp channel 37 for discovery; not enough to watch all three advertising channels or follow a hopping connection by raw capture alone.
- A **bladeRF 2.0 micro** reaches ~56 MHz normally, and since the 2023.02 release an oversampling mode reaches 122.88 MHz instantaneous bandwidth (8-bit depth), enough to cover the whole 2.4 GHz BLE band in a single pass, the Nuand waterfall demonstration shows FHSS Bluetooth activity across the band at once [nuand122].
- The SDR all-channel path is realised by **ice9-bluetooth-sniffer**, which channelises a wide I/Q stream from a HackRF / bladeRF / USRP into per-channel BLE decoders and can grab connections that are *already established* [ice9], the case where you missed the connection request and so cannot replay Ryan's parameter-recovery [ryan2013ble].
- Dedicated sniffers sidestep the bandwidth question by hopping in firmware: **Sniffle** (CC1352/CatSniffer) follows connections across all BT5 PHYs and exports a PCAP [sniffle].

This is a **capture-feasibility / spectrum** check, not a device finding, hence `criticality: info`. It establishes the auditor-capability baseline so later controls are interpreted correctly.

## Procedure

> All steps below are passive reception only, no transmission. Even so, only observe RF you are authorised to capture; receiving BLE traffic from third-party devices may be regulated in your jurisdiction.

1. **Establish the receiver's usable instantaneous bandwidth.** For an SDR, open a live spectrum view centred on the BLE band and read how wide a slice is visible:
   ```bash
   gqrx
   ```
   In Gqrx set the device to your radio, tune to **2440 MHz** (band centre) and set the input rate to the radio's maximum (HackRF: 20 Msps → ~20 MHz visible; bladeRF oversampled: up to ~122 Msps). Expected: the waterfall shows a band slice whose width equals the sample rate. On a HackRF you will see ~20 MHz, you cannot place 2402, 2426 and 2480 MHz in one window (they span 78 MHz). Record the visible width.

2. **Confirm whether the full band fits in one pass.** The three advertising channels span 2402 to 2480 MHz = 78 MHz, and the data channels fill the gaps, so simultaneous capture needs ≥ ~80 MHz of instantaneous bandwidth.
   ```bash
   # bladeRF oversampling mode: sample the whole band at once
   bladeRF-cli -e "set samplerate 122000000; set frequency rx 2441000000"
   ```
   Expected: a bladeRF in oversampling mode accepts the rate and covers the band [nuand122]; a HackRF cannot (rate exceeds its IBW) and must tune to one channel at a time.

3. **If full-band capture is not possible, decide the strategy** (record which applies):
   - **Camp one channel** for discovery, tune the radio to 2402 MHz and rely on a sniffer to catch advertisements that land on channel 37.
   - **Channelise the whole band** with the SDR all-channel path (RFSAM-RES-03):
     ```bash
     ice9-bluetooth-sniffer -l    # list detected SDRs and capabilities
     ice9-bluetooth-sniffer -c BLE.pcap
     ```
     Expected: ice9 lists the SDR, then writes a Wireshark-readable PCAP carrying frames from across the band; with a bladeRF it can pick up already-established connections [ice9].
   - **Follow the hop sequence** with a dedicated sniffer that recovers the connection parameters from the connection request and hops in firmware (RFSAM-RES-02):
     ```bash
     python3 -m sniffle.sniff_receiver -c 37 -e -o BLE.pcap
     ```
     Expected: Sniffle scans the advertising channels, and on catching a `CONNECT_IND` follows the connection across the data channels, writing each frame to the PCAP [sniffle]. This is the firmware analogue of Ryan's parameter-recovery method [ryan2013ble].

4. **Record the observability gap.** Note, for the chosen radio: visible bandwidth, which advertising channels are observable simultaneously (one, for a HackRF; all, for a full-band bladeRF), and whether connection-following is by raw capture, channelisation, or firmware hopping. This is the line every later BLE control inherits: a 'not observed' under a 20 MHz window is a visibility gap, not evidence of absence.

## Field case

Auditing a generic BLE LED controller with a **HackRF One** in Gqrx, tuned to 2440 MHz at 20 Msps: the waterfall showed ~20 MHz of spectrum, about a quarter of the BLE band. Advertising channel 37 (2402 MHz) sat well outside that window, so to see the controller's advertisements the radio had to be retuned to 2402 MHz; once camped there, the periodic advertising bursts were visible and discovery (the IG/LL handoff) was feasible. Following the live connection by raw HackRF capture was **not** feasible, the connection hops across the 37 data channels that a 20 MHz window cannot hold at once, so connection work required either a firmware-hopping sniffer (Sniffle on a CatSniffer) or the ice9 channelisation path.

Switching to a **bladeRF 2.0 micro** in oversampling mode (122.88 MHz [nuand122]) and feeding ice9-bluetooth-sniffer, the whole band was captured in one pass and an already-established connection could be picked up without ever seeing its `CONNECT_IND` [ice9], the case Ryan's parameter-recovery cannot reach because there is no connection request to read [ryan2013ble].

Recorded capture-feasibility baseline for this engagement:

| Receiver | Visible BW | Adv channels at once | Connection-following |
|---|---|---|---|
| HackRF One | ~20 MHz | 1 of 3 | firmware sniffer or ice9 only |
| bladeRF 2.0 (oversampled) | ~80+ MHz | 3 of 3 | raw capture + ice9 (incl. established) |

This field case is a representative worked example, not a single measured engagement log. The qualitative outcomes (HackRF sees one advertising channel; bladeRF oversampling covers the band; ice9 grabs established connections) follow directly from the cited bandwidth figures [nuand122][ice9]; no specific measured received-signal-strength, packet count, or device MAC is asserted. [FILL: insert measured visible-bandwidth, channel list, and per-radio capture counts from your own bench run.]

## Remediation

This control is an **auditor-capability baseline**, not a device weakness, so the primary output is documentation, not a fix. Layered guidance:

- **Auditor / operator**, Record the capture envelope (radio, visible bandwidth, channels observable simultaneously, connection-following method) at the top of every BLE assessment. Interpret every later 'not observed' against it: under a 20 MHz window, absence of a signal is a visibility gap, never proof the device is silent. Where the budget radio cannot follow connections, escalate to a full-band SDR (bladeRF oversampling [nuand122]) or a firmware-hopping sniffer (Sniffle [sniffle]) before concluding.
- **Integrator**, Provision the kit to the threat being tested: discovery only needs a single-channel camp, but any connection-following, injection, or established-connection capture needs either ≥ ~80 MHz instantaneous bandwidth or a firmware sniffer with connection-following (and, for already-established connections, the ice9 SDR path [ice9]). Do not infer link security from a capture gap.
- **Developer**, For a device under test, predictable, fixed advertising and low-entropy connection parameters make a connection trivially followable on commodity hardware [ryan2013ble]; using a Resolvable Private Address and standard hopping does not stop capture (this is a spectrum property, not a control), but it raises the effort and is assessed at the link/crypto layers, not here.
