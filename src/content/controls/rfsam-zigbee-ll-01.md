---
id: RFSAM-ZIGBEE-LL-01
title: Map PAN, addressing and devices from cleartext headers
protocol: ZIGBEE
layer: LL
criticality: low
applicability:
  - Zigbee
  - IEEE 802.15.4
deferred: false
objective: >-
  Determine what network topology and identifiers a passive listener can recover
  from a Zigbee/802.15.4 network without any key — the PAN ID and extended PAN
  ID, the operating channel, per-device short (16-bit) and extended (EUI-64)
  addresses, and the coordinator/router/end-device relationships inferable by
  pairing source and destination addresses in unencrypted MAC and NWK headers.
intro: >-
  Zigbee encrypts NWK and APS payloads with AES-128-CCM*, but the IEEE 802.15.4
  MAC header and the Zigbee NWK header travel in the clear. A listener parked on
  the channel can read the PAN ID, both short and extended addresses, frame
  control fields and routing addresses without any key — enough to enumerate the
  devices, identify the coordinator, and infer the mesh topology. This is
  observational reconnaissance, not takeover; it establishes what the network
  leaks before any active step.
prerequisites:
  hardware:
    - 'An IEEE 802.15.4 capture radio parked on the target channel: nRF52840 dongle (nRF Sniffer 802.15.4), TI CC2531 (whsniff), CatSniffer (catnip), or an ApiMote/RZUSBstick (KillerBee). Minino captures standalone in the field.'
  software:
    - 'A capture tool (nRF Sniffer 802.15.4 / whsniff / catnip / KillerBee zbdump, or Kismet for a passive multi-channel survey) feeding Wireshark, whose 802.15.4/Zigbee dissector decodes MAC and NWK headers without a key.'
  signal:
    freq: '2.405–2.480 GHz ISM (16 channels, 11–26, spaced 5 MHz); sub-GHz 868 MHz (Europe) / 902–928 MHz (Americas)'
    bandwidth: '2 MHz per channel (2.4 GHz)'
    modulation: 'IEEE 802.15.4 O-QPSK with DSSS, 250 kbps at 2.4 GHz'
  skill: intermediate
attacks:
  - name: Passive topology inference (Zigator)
    refs:
      - akestoridis2020zigator
    impact: >-
      Reconstructs the network's device inventory and parent/child topology from
      encrypted traffic by pairing the cleartext short MAC addresses of source
      and destination packets — without ever holding the network key.
    preconditions: >-
      Passive capture on the target's channel only; the MAC/NWK headers are not
      encrypted, so no key is required.
    summary: >-
      Reconnaissance against Zigbee's lower layers: unencrypted header fields of
      otherwise-encrypted packets are parsed, and pairing short source/dest
      addresses reveals which devices talk to which, exposing the topology.
  - name: Passive device and event fingerprinting (ZLeaks)
    refs:
      - shafqat2022zleaks
    impact: >-
      Identifies in-home devices and infers user events (e.g. a sensor firing)
      from encrypted Zigbee traffic, using single-command inference and periodic
      reporting signatures keyed to the cleartext addressing/metadata.
    preconditions: >-
      Passive capture of a smart-home Zigbee network; no key required because the
      attack works on traffic metadata and patterns, not decrypted payloads.
    summary: >-
      Shows that even with payload encryption, the observable addressing and
      timing metadata leaks device identity and activity (reported 83.6% accuracy
      for unknown devices/events, 99.8% for known devices in the paper).
references:
  - key: ieee802154-2024
    title: 'IEEE Std 802.15.4-2024 — IEEE Standard for Low-Rate Wireless Networks'
    venue: IEEE
    year: 2024
    url: 'https://standards.ieee.org/ieee/802.15.4/11041/'
    type: standard
  - key: zigbee-spec-csa
    title: 'Zigbee Specification (document 05-3474-23)'
    authors: Connectivity Standards Alliance
    venue: CSA
    year: 2023
    url: 'https://csa-iot.org/wp-content/uploads/2023/04/05-3474-23-csg-zigbee-specification-compressed.pdf'
    type: spec
  - key: akestoridis2020zigator
    title: 'Zigator: Analyzing the Security of Zigbee-Enabled Smart Homes'
    authors: 'D.-G. Akestoridis, M. Harishankar, M. Weber, P. Tague'
    venue: ACM WiSec 2020
    year: 2020
    url: 'https://mews.sv.cmu.edu/papers/wisec-20.pdf'
    type: paper
  - key: akestoridis-zigator-repo
    title: 'Zigator — a security analysis tool for Zigbee and Thread networks'
    authors: D.-G. Akestoridis
    venue: GitHub
    year: 2020
    url: 'https://github.com/akestoridis/zigator'
    type: tool
  - key: shafqat2022zleaks
    title: 'ZLeaks: Passive Inference Attacks on Zigbee based Smart Homes'
    authors: 'N. Shafqat, D. J. Dubois, D. Choffnes, A. Schulman, D. Bharadia, A. Ranganathan'
    venue: ACNS 2022
    year: 2022
    url: 'https://arxiv.org/abs/2107.10830'
    type: paper
  - key: kabibo2025securelist
    title: 'Turn me on, turn me off: Zigbee assessment in industrial environments'
    authors: H. Kabibo
    venue: Securelist (Kaspersky)
    year: 2025
    url: 'https://securelist.com/zigbee-protocol-security-assessment/118373/'
    type: blog
  - key: killerbee-repo
    title: 'KillerBee — IEEE 802.15.4/ZigBee Security Research Toolkit'
    authors: River Loop Security
    venue: GitHub
    year: 2024
    url: 'https://github.com/riverloopsec/killerbee'
    type: tool
  - key: wireshark-802154
    title: 'Wireshark — IEEE 802.15.4 dissector reference'
    venue: Wireshark Wiki
    url: 'https://wiki.wireshark.org/IEEE_802.15.4'
    type: tool
tools:
  - kismet
  - whsniff
  - nrf-sniffer-802154
  - catnip
  - catsniffer
  - cc2531
  - killerbee
  - minino
  - wireshark
bsam: []
resources:
  - RFSAM-RES-16
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

Zigbee runs on IEEE 802.15.4, which carries security at the MAC and (for Zigbee) NWK/APS layers but **does not encrypt frame headers** — the MAC header and the Zigbee NWK header are always in the clear, even when the payload is AES-128-CCM* protected [akestoridis2020zigator] [ieee802154-2024] [zigbee-spec-csa]. A listener that parks an 802.15.4 radio on the target channel can therefore read, with no key at all: the 16-bit **PAN ID**, the **short (16-bit) and extended (EUI-64) source and destination addresses**, and the frame control fields [kabibo2025securelist]. The Securelist industrial assessment states it plainly: "Even when Zigbee payloads are encrypted, the network and MAC headers remain visible. That means we can usually read things like source and destination addresses, PAN ID, short and extended MAC addresses, and frame control fields" [kabibo2025securelist].

Two kinds of finding follow from those cleartext fields. First, **identifier enumeration**: the PAN ID and extended PAN ID name the network, the operating channel locates it (Zigbee pins a PAN to one 2 MHz channel, 11–26, and stays there), and each device exposes a short address and — when it sends frames with extended addressing — its globally-unique EUI-64, a stable per-device identifier that supports tracking [zigbee-spec-csa] [kabibo2025securelist]. Second, **topology inference**: the Zigator work shows that by pairing the cleartext short MAC addresses of source and destination across captured packets, an attacker infers which devices communicate with which — reconstructing the coordinator/router/end-device relationships of the mesh without ever decrypting a payload [akestoridis2020zigator] [akestoridis-zigator-repo]. ZLeaks extends the point to the application level: from encrypted traffic alone, addressing and periodic-reporting metadata identify in-home devices and infer user events [shafqat2022zleaks].

Device discovery has an active counterpart worth knowing: a joining device broadcasts a **beacon request** across channels, and nearby coordinators/routers answer with **beacons** that advertise PAN ID, extended PAN ID, the coordinator address and stack profile in cleartext [kabibo2025securelist] [zigbee-spec-csa]. An assessor can provoke this with an active scan (KillerBee `zbstumbler` transmits beacon requests while channel-hopping [killerbee-repo]) — but transmitting beacon requests is an **active** step and must be authorised. The purely passive path is to listen for the beacons that occur naturally and the data frames that reveal addressing.

## Procedure

Authorised testing only: capture on a network you own or are explicitly permitted to assess. Steps 1–4 are fully passive (receive-only). Step 5 (active beacon-request scan) **transmits** into the band and must be separately authorised — skip it if you only have passive authorisation.

1. **Find the channel.** Identify the operating channel before capturing. Use a passive survey rather than transmitting:
   ```bash
   kismet -c nrf52840_154-0:channels="11,15,20,25,26"
   ```
   Kismet channel-hops the 802.15.4 band and logs every PAN, coordinator and device it hears to pcapng without ever transmitting. Note which channel(s) show Zigbee PANs. (Channels 15, 20, 25 and 26 sit in the Wi-Fi gaps and are common Zigbee choices.)

2. **Park and capture on the target channel.** Pick the capture path for your radio. On an nRF52840 dongle with the nRF Sniffer 802.15.4 firmware, capture straight into Wireshark via its extcap; on a CC2531:
   ```bash
   whsniff -c 20 | wireshark -k -i -
   ```
   `-c 20` selects channel 20; frames stream live into Wireshark. With KillerBee instead:
   ```bash
   zbdump -f 20 -w capture.pcap
   ```
   `zbdump` is a tcpdump-like tool that writes 802.15.4 frames to a libpcap file [killerbee-repo]. On a CatSniffer, catnip streams 802.15.4/Zigbee frames into Wireshark over its extcap.

3. **Read the identifiers in Wireshark.** Open the capture; the 802.15.4 and Zigbee dissectors decode the headers with no key [wireshark-802154]. Filter to the target PAN and list the addressing:
   ```text
   wpan.dst_pan == 0x1a62 || wpan.src_pan == 0x1a62
   ```
   Read off, per frame: `wpan.src16` / `wpan.dst16` (short addresses), `wpan.src64` / `wpan.dst64` (EUI-64 when present), `wpan.src_pan` (PAN ID), and `zbee_nwk.src` / `zbee_nwk.dst` (NWK short addresses). Beacon frames (`wpan.frame_type == 0`) carry the PAN parameters and, for Zigbee, the extended PAN ID and stack profile.

4. **Build the inventory and infer topology.** Collect the distinct short addresses and EUI-64s into a device list, then pair source↔destination short addresses across data frames to infer who talks to whom — the coordinator (short address `0x0000`) sits at the root; routers relay; end devices talk only to their parent [akestoridis2020zigator]. The Zigator tool automates this parsing and pairing over a pcap:
   ```bash
   zigator parse-pcap-file capture.pcap
   ```
   Inspect the produced tables for the address pairings and inferred relationships [akestoridis-zigator-repo].

5. **(Active, authorised only) Provoke device discovery.** If passive listening did not surface every device, an active scan elicits beacons:
   ```bash
   zbstumbler -c 20
   ```
   `zbstumbler` transmits beacon requests while channel-hopping and prints summarized information about the devices that answer [killerbee-repo]. This **transmits** — only run it with explicit authorisation on your own/permitted network.

## Field case

Illustrative walkthrough — substitute the values you capture. The flow below is reproducible against any consenting network, but the specific identifiers are an example; replace each bracketed `[FILL: …]` item with your own measured data before citing this as evidence.

Target: a residential Zigbee 3.0 hub with a handful of sensors and a smart plug, assessed with passive authorisation. A Kismet survey across channels 11/15/20/25/26 showed a single PAN active on **channel 20**. Parking a CC2531 there with `whsniff -c 20 | wireshark -k -i -` produced a steady stream of 802.15.4 frames.

In Wireshark, with **no network key loaded**, the dissector still resolved every header. The coordinator announced itself at short address `0x0000`; a Zigbee beacon carried PAN ID `0x1a62` and extended PAN ID `[FILL: 64-bit EXTPANID from your capture]`. Filtering `wpan.src_pan == 0x1a62` and collecting distinct addresses yielded an inventory of `[FILL: N]` devices — short addresses `0x0000` (coordinator), `[FILL: short addr]`, `[FILL: short addr]` — and two of them disclosed their full EUI-64 (`[FILL: e.g. 00:0d:6f:xx:xx:xx:xx:xx]`) in extended-addressing frames, a stable per-device identifier that persists across rejoins. Pairing source/destination short addresses across data frames showed the smart plug exchanging only with `0x0000`, consistent with an end-device-to-coordinator relationship, while `[FILL: short addr]` relayed for others, marking it a router. None of this required the network key — only listening on the right channel — which is the finding the control verifies: **topology and persistent identifiers leak in the clear** [akestoridis2020zigator] [kabibo2025securelist].

## Remediation

The header exposure is inherent to IEEE 802.15.4 — MAC and NWK headers are not encrypted by design — so remediation is about limiting what those identifiers reveal and how usable they are, not eliminating the leak [ieee802154-2024] [akestoridis2020zigator].

- **Developer (stack/firmware).** Prefer NWK addressing that minimises extended-address (EUI-64) disclosure on air: once a device has a short address, avoid sending frames with the full EUI-64 in the clear where the spec allows the short form, to reduce the stable-identifier footprint [zigbee-spec-csa]. Do not place any sensitive identifier (serials, user IDs) in cleartext header or beacon fields. Where the platform supports MAC-layer source-address randomisation or topology-obfuscation features, expose and document them.
- **Integrator (product/hub).** Treat the network as observable: assume an unauthorised listener already knows the PAN ID, channel, device count and topology, and design so that knowledge alone grants nothing — keep all command authority behind the encrypted APS/ZCL layer with a properly provisioned network key and per-device install codes (not the well-known default Trust Center link key) [zigbee-spec-csa] [kabibo2025securelist]. Avoid encoding device function in predictable address patterns.
- **Operator (deployment).** Recognise that metadata leaks even under encryption: device presence, count and activity (event timing) are inferable passively [shafqat2022zleaks]. For sensitive sites, factor this into siting and shielding decisions, monitor for unexpected beacon-request scans (an active discovery attempt), and prefer the highest-assurance join model (install-code-only joining) so that observing the network yields reconnaissance but no path to join or decrypt.
