---
id: RFSAM-BLE-LL-02
title: Capture an established connection's data channel
protocol: BLE
layer: LL
criticality: low
applicability:
  - BLE
deferred: true
objective: >-
  Determine whether the data-channel PDUs of a live BLE connection can be
  followed and recorded off the air — recovering the hop sequence either from a
  sniffed connection request or, for a connection already in progress, by
  reconstructing it — producing a PCAP of link-layer traffic for inspection.
intro: >-
  Once two BLE devices are connected, their traffic leaves the advertising
  channels and hops across the 37 data channels every connection event. RFSAM
  owns the RF-capture prerequisite: following that hop sequence and writing the
  data-channel PDUs to a PCAP. Whether the captured traffic constitutes a
  finding — sensitive data in the clear, or a link that should have been
  encrypted — is BSAM's judgement (BSAM-DI-04, BSAM-EN-02). Capture only your
  own devices or with explicit written authorisation.
prerequisites:
  hardware:
    - 'A connection-following BLE sniffer: a CC1352-class board (CatSniffer) for Sniffle, an nRF52840 dongle or nRF52 DK for the nRF Sniffer, an Ubertooth One, or a wide-band SDR (HackRF / bladeRF / USRP) for the all-channel ice9 path'
  software:
    - 'Sniffle, the nRF Sniffer firmware, Ubertooth host tools, or ice9-bluetooth-sniffer; Wireshark to dissect the resulting PCAP'
  signal:
    freq: '2.402–2.480 GHz (37 data channels, 2 MHz spacing; advertising on 37/38/39)'
    bandwidth: '2 MHz per channel; ~80 MHz to see the whole band at once (bladeRF oversampling / SDR path)'
    modulation: 'GFSK — LE 1M (1 Mbps), LE 2M and LE Coded (BLE 5)'
  skill: intermediate
attacks:
  - name: Connection-following sniffing (CSA #1)
    refs:
      - ryan2013btle
    impact: >-
      Passive recovery of all data-channel PDUs of a connection, exposing any
      unencrypted link traffic to an observer who never touched either endpoint.
    preconditions: >-
      The sniffer is present when the CONNECT_IND is transmitted, so the access
      address, CRCInit, channel map and hop parameters can be read directly from
      it; works on connections using Channel Selection Algorithm #1.
    summary: >-
      The foundational technique: recover the connection's parameters from the
      sniffed connection request, then follow the channel-hopping data
      connection and record every PDU.
  - name: BLE 5 hop-sequence recovery (CSA #2)
    refs:
      - cauquil2019csa2
    impact: >-
      Extends connection-following to BLE 5 devices using the more complex
      Channel Selection Algorithm #2, so newer connections are no harder to
      follow once the access address is known.
    preconditions: >-
      The access address (carried in every data PDU header) is observed; the
      CSA #2 counter and channel map are then derived by measuring hops across a
      handful of channels.
    summary: >-
      Reverse-engineers BLE 5's CSA #2 to predict the hop sequence from the
      access address alone, restoring connection-following on modern devices.
  - name: Established-connection recovery (no CONNECT_IND)
    refs:
      - ballabriga2020sdr
    impact: >-
      Lets an observer who arrived after the connection started still recover
      the hop sequence and capture the live data channel, removing the need to
      catch the connection setup.
    preconditions: >-
      A wide-band radio able to watch several data channels at once; the access
      address is read from data PDUs and the connection-event counter is found
      by process of elimination across observed events.
    summary: >-
      Reconstructs an already-running connection by listening across multiple
      channels and eliminating counter values incompatible with each observed
      connection event — the basis of the SDR all-channel capture path.
references:
  - key: ryan2013btle
    title: 'Bluetooth: With Low Energy Comes Low Security'
    authors: Mike Ryan
    venue: USENIX WOOT 2013
    year: 2013
    url: 'https://www.usenix.org/conference/woot13/workshop-program/presentation/ryan'
    type: paper
  - key: cauquil2019csa2
    title: Defeating Bluetooth Low Energy 5 PRNG for Fun and Jamming
    authors: Damien Cauquil (virtualabs)
    venue: DEF CON 27
    year: 2019
    url: 'https://media.defcon.org/DEF%20CON%2027/DEF%20CON%2027%20presentations/DEFCON-27-Damien-Cauquil-Defeating-Bluetooth-Low-Energy-5-PRNG-for-fun-and-jamming.PDF'
    type: talk
  - key: ballabriga2020sdr
    title: Sniffing established BLE connections with HackRF One
    authors: Clément Ballabriga (Lexfo)
    venue: Lexfo security blog
    year: 2020
    url: 'https://blog.lexfo.fr/sniffing-ble-sdr.html'
    type: blog
  - key: sniffle
    title: 'Sniffle — a sniffer for Bluetooth 5 and 4.x LE'
    authors: Sultan Qasim Khan (NCC Group)
    venue: GitHub
    year: 2024
    url: 'https://github.com/nccgroup/Sniffle'
    type: tool
  - key: btcorespec
    title: 'Bluetooth Core Specification 5.4 — Vol 6 Part B, Link Layer (§2.3.3.1 CONNECT_IND PDU; §4.5.8 data channel selection)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2023
    url: 'https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/low-energy-controller/link-layer-specification.html'
    type: spec
tools:
  - sniffle
  - catsniffer
  - nrf-sniffer
  - ubertooth-tools
  - ice9-bluetooth-sniffer
  - wireshark
bsam:
  - BSAM-DI-04
  - BSAM-EN-02
resources:
  - RFSAM-RES-04
reviewStatus: verified
confidence: medium
lastResearched: 2026-06-14
---
## Mechanism

When a central accepts an advertiser, it sends a `CONNECT_IND` (`CONNECT_REQ`) PDU whose `LLData` field carries everything a third party needs to follow the connection: the 32-bit access address that will tag every subsequent data PDU, the CRC initialisation value, the channel map, the hop increment and the connection interval (Vol 6 Part B §2.3.3.1) [btcorespec]. From that moment the two devices leave the advertising channels (37/38/39) and exchange data PDUs on the 37 data channels, changing channel every connection event according to a channel selection algorithm (Vol 6 Part B §4.5.8) [btcorespec]. A sniffer that read the `CONNECT_IND` can compute the same channel sequence and hop along with the connection, recording every PDU — the technique Mike Ryan established for BLE [ryan2013btle].

Two channel selection algorithms exist. Connections where at least one peer is pre-BLE-5, or where the `ChSel` bit is unset, use **CSA #1**, a simple `(channel + hopIncrement) mod 37` walk filtered by the channel map [btcorespec]. BLE 5 connections use **CSA #2**, a PRNG-style mapping that is harder to track; Cauquil reverse-engineered it and showed the hop sequence can be predicted from the access address alone, by measuring hops across a handful of channels [cauquil2019csa2]. Either way, following is a passive-observation problem, not a cryptographic one — the connection parameters are not secret.

The harder case is a connection that is **already established** when the sniffer arrives: there is no `CONNECT_IND` left to read. The access address is still recoverable because it is in the header of every data PDU, but the channel map and the connection-event counter must be reconstructed. A wide-band radio watching several data channels at once can do this by elimination — each observed connection event rules out every counter value incompatible with it — until the hop sequence is pinned down [ballabriga2020sdr]. This is the basis of the SDR all-channel capture path (ice9), which is the only practical way to grab a long-lived connection you did not see start.

This is a **capture-feasibility** control. It produces a PCAP of link-layer traffic; it does not itself decide whether that traffic is a finding. If the connection is unencrypted, the captured data PDUs are readable in the clear, and the judgement of whether that exposes sensitive data, or whether encryption should have been mandatory, is BSAM's (BSAM-DI-04 sensitive-data exposure, BSAM-EN-02 force use of encryption). RFSAM owns only the RF prerequisite — reaching the point where those BSAM controls can be applied to real captured traffic. The same captured hop sequence is also the prerequisite that the active controls build on: decrypting a weakly-paired link (RFSAM-BLE-CR-01) and hijacking a live connection (RFSAM-BLE-AT-01) both start from following the connection that this control captures (RFSAM-RES-04).

## Procedure

All steps are passive reception. Capture only devices you own or are explicitly authorised in writing to test; data-channel PDUs may carry another party's personal data.

1. **Identify the target connection.** Passively scan the advertising channels and note the advertiser's MAC and the moment it accepts a connection (its advertising stops). With Sniffle on a CatSniffer:
   ```bash
   ./sniff_receiver.py -c 37 -a -d
   ```
   `-a` stays in passive-scan mode (does not follow yet) and `-d` decodes advertising data, so you can read the device name and address and pick the target. Expected output is a running list of advertisements; the target's `AdvA` is the MAC you will filter on next.

2. **Follow the connection from its setup (CSA #1 or #2).** Restart Sniffle with a MAC filter and a PCAP output, then trigger or wait for the connection to form:
   ```bash
   ./sniff_receiver.py -c 37 -m AA:BB:CC:DD:EE:FF -o conn.pcap
   ```
   Sniffle hops the advertising channels to catch the `CONNECT_IND`, reads the access address and hop parameters from it, and switches to following the data channels. Expected output: the `CONNECT_IND` line, then a stream of `Data / LL Data` PDUs with a stable access address — confirmation you are following the connection. The PCAP `conn.pcap` accumulates every captured PDU. (Add `-e -H` if the device connects via BT5 extended advertising; add `-l` for the Coded long-range PHY.)

3. **Confirm the capture in Wireshark.** Open the PCAP and verify you have data-channel traffic, not just advertisements:
   ```bash
   wireshark conn.pcap
   ```
   Filter on `btle.data_header` (data PDUs) and `btle.access_address == 0x........` (the connection's AA). A populated list means the data channel was followed. Apply `!btle.length == 0` to drop empty keep-alive PDUs and see only PDUs that carry payload.

4. **Classify the link as encrypted or clear.** In Wireshark, look for `LL_ENC_REQ` / `LL_ENC_RSP` and `LL_START_ENC_REQ` near the start of the connection. If they are absent, the link is unencrypted and the L2CAP/ATT payloads dissect directly — this is the input BSAM-DI-04 / BSAM-EN-02 judge. If they are present, the data PDUs after `LL_START_ENC_RSP` appear as encrypted blobs (decryption, where the pairing was weak, is RFSAM-BLE-CR-01's scope, not this control's).

5. **(Already-running connection, no `CONNECT_IND`.)** If the connection is already up when you start, the dedicated sniffer in steps 1–2 cannot lock on. Use the SDR all-channel path, which recovers the access address from data PDUs and reconstructs the hop sequence by elimination [ballabriga2020sdr]. `-l`/`--capture` captures live and `-w` writes the PCAP; `-a` sniffs all channels (requires a bladeRF 2.0), or use `-c`/`-C` to capture a slice of the band on a HackRF/USRP:
   ```bash
   ice9-bluetooth -l -a -w established.pcap
   ```
   (HackRF slice instead of `-a`: `ice9-bluetooth -l -c 2440 -C 20 -w established.pcap`.) ice9 channelises the band, detects every BLE burst — including the PDUs of connections already in progress — and logs them to `established.pcap`; there is no separate "list addresses" step, so you filter the capture by the target's access address in Wireshark afterward (per step 3). Expected output: data PDUs accumulate in the PCAP and the connection's access address becomes visible once you filter on `btle.data_header`. This path needs CPU/GPU for channelisation and a wide-band radio (bladeRF for the full 80 MHz, HackRF for a slice).

## Field case

Illustrative walkthrough — substitute the values you capture: a fitness band and its phone app, on your own bench (a test device, not a third party's). With Sniffle on a CatSniffer parked on channel 37, the band advertises as a connectable peripheral; opening the app triggers the phone to connect, and Sniffle logs the `CONNECT_IND`, latches the access address, and switches to following the data channels. Filtering `conn.pcap` in Wireshark on the connection's access address shows a continuous stream of data PDUs; if no `LL_ENC_REQ` appears, the link is unencrypted and the ATT notifications (e.g. step-count and heart-rate handles) dissect in the clear.

That captured-in-the-clear traffic is exactly the input the BSAM judgement consumes: BSAM-DI-04 weighs whether those plaintext readings are sensitive-data exposure, and BSAM-EN-02 weighs whether the service should have refused to operate without encryption. RFSAM's part ends at producing the PCAP. Concrete per-device values — the exact access address, the connection interval, the specific ATT handles, and how many data PDUs were captured before the app disconnected — are left as placeholders rather than fabricated: [FILL: target device model, observed access address, connection interval (ms), ATT handles seen, PDU count]. Do not assert a specific finding until these are captured on real hardware.

## Remediation

**Developer.** Capture-in-the-clear is only a problem because the link is readable. Require LE Secure Connections and refuse to expose any sensitive characteristic before encryption starts, so a follower's PCAP contains only encrypted blobs (the judgement BSAM-EN-02 makes) [btcorespec]. Do not place secrets in pre-encryption link-layer or unencrypted ATT traffic.

**Integrator.** Verify that the product as shipped actually negotiates encryption for the services that matter — run this capture against the integrated device and confirm `LL_ENC_REQ`/`LL_START_ENC_REQ` appear and that no readable sensitive payload precedes them. Prefer components that support and default to LE Secure Connections over LE Legacy pairing.

**Operator.** Treat the RF link as observable: anyone within range can record an unencrypted connection's data channel with sub-$150 hardware [ryan2013btle]. Where the threat model includes a nearby observer, deploy only devices whose sensitive functions are gated behind encryption, and re-test after firmware updates that touch the Bluetooth stack. Following a connection is a passive act — encryption is the only control that denies the captured bytes their meaning.
