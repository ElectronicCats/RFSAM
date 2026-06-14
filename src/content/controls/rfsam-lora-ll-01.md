---
id: RFSAM-LORA-LL-01
title: Profile LoRaWAN frames and harvest cleartext join identifiers
protocol: LORA
layer: LL
criticality: low
applicability:
  - LoRaWAN
deferred: false
objective: >-
  Verify whether a LoRaWAN deployment can be inventoried passively — classifying
  frames by MType and harvesting the cleartext join-procedure identifiers
  (JoinEUI/AppEUI, DevEUI, DevNonce) and the data-frame DevAddr — without
  transmitting, and use the frame mix to scope downstream weaknesses.
intro: >-
  LoRaWAN encrypts the application payload (AES-128) but transmits the
  join-procedure metadata and frame headers in the clear. A passive observer who
  has de-chirped the CSS waveform into LoRaWAN frames can map a whole deployment
  and harvest stable device and application identifiers without ever
  transmitting.
prerequisites:
  hardware:
    - 'An SDR covering the regional sub-GHz band (RTL-SDR V4 for one channel, or HackRF One / USRP B210 / bladeRF 2.0 micro for wider capture), or a multi-channel LoRaWAN gateway (RAK WisGate Connect) if you have gateway access, or an STM32WLxx board for single-board capture'
  software:
    - 'A CSS demodulator that frames LoRaWAN and exports LoRaTap PCAP — gr-lora_sdr, LoRAttack, ChirpCat (gateway), catnip (CatSniffer), or the LoRa Wideband Decoder — plus Wireshark with its LoRaTap/LoRaWAN dissectors'
  signal:
    freq: '863–870 MHz (EU868) / 902–928 MHz (US915) / regional: AS923, EU433, AU915, CN470, IN865, KR920'
    bandwidth: '125 / 250 / 500 kHz per LoRaWAN channel'
    modulation: 'CSS (Chirp Spread Spectrum), SF7–SF12'
  skill: intermediate
attacks:
  - name: ABP replay / selective denial-of-service
    refs:
      - yang2018lorawan
    impact: >-
      Replaying a captured uplink against an ABP device whose frame counter
      resets on reboot causes the network server to accept stale frames or to
      desynchronise the legitimate device, denying it service.
    preconditions: >-
      An ABP-activated device with static session keys; a captured uplink; the
      target device's frame counter has reset (e.g. after a power cycle). The
      cleartext header harvested here identifies replayable targets.
    summary: >-
      Long-term ABP session keys outlive a single session, so a frame replayed
      after a counter reset is accepted — a selective DoS scoped by the
      passively harvested frame headers.
  - name: Plaintext recovery via keystream reuse
    refs:
      - yang2018lorawan
    impact: >-
      Two ciphertexts encrypted under the same key and frame counter share a
      keystream; XORing them recovers a combination of plaintexts (a two-time
      pad), leaking application data without the key.
    preconditions: >-
      A static session key (typical of ABP) and a frame counter that repeats
      after a reset, producing two frames with the same counter under the same
      key, both captured passively.
    summary: >-
      LoRaWAN's AES-CTR-style payload encryption reuses keystream when the frame
      counter repeats under a static key, enabling passive plaintext recovery.
  - name: Bit-flipping on the network-server-to-application-server leg
    refs:
      - lee2017bitflip
      - trendmicro2021lorawan
    impact: >-
      The MIC protects the device-to-network-server leg, but the payload the
      network server forwards to the application server is no longer
      cryptographically bound; an attacker positioned on that leg can flip bits
      to alter the delivered value undetected.
    preconditions: >-
      A position on the network-server-to-application-server interface (not the
      RF link). Passive RF capture of the frame structure scopes which fields
      are exposed but does not itself perform the flip.
    summary: >-
      Decrypted payloads forwarded from the network server to the application
      server lack end-to-end integrity, allowing bit-flipping unless an
      application-layer MIC or TLS tunnel is added.
references:
  - key: yang2018lorawan
    title: Security Vulnerabilities in LoRaWAN
    authors: 'X. Yang, E. Karampatzakis, C. Doerr, F. Kuipers'
    venue: 'IEEE/ACM IoTDI 2018, pp. 129–140'
    year: 2018
    url: 'https://ieeexplore.ieee.org/document/8366983/'
    type: paper
  - key: lee2017bitflip
    title: Risk analysis and countermeasure for bit-flipping attack in LoRaWAN
    authors: 'J. Lee, D. Hwang, J. Park, K.-H. Kim'
    venue: 'IEEE ICOIN 2017, pp. 549–551'
    year: 2017
    url: 'https://ieeexplore.ieee.org/document/7899554/'
    type: paper
  - key: trendmicro2021lorawan
    title: 'Low Powered and High Risk: Possible Attacks on LoRaWAN Devices'
    authors: Trend Micro Research
    venue: Trend Micro
    year: 2021
    url: 'https://www.trendmicro.com/en_us/research/21/a/Low-Powered-but-High-Risk-Evaluating-Possible-Attacks-on-LoRaWAN-Devices.html'
    type: blog
  - key: loraalliance2020l2
    title: 'LoRaWAN L2 1.0.4 Specification (TS001-1.0.4)'
    authors: LoRa Alliance
    venue: LoRa Alliance
    year: 2020
    url: 'https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf'
    type: standard
  - key: loratap
    title: 'LINKTYPE_LORATAP — LoRaTap pcap link-layer header'
    authors: 'E. de Jong (eriknl), tcpdump.org'
    venue: tcpdump / libpcap
    url: 'https://www.tcpdump.org/linktypes/LINKTYPE_LORATAP.html'
    type: spec
  - key: grlorasdr
    title: 'gr-lora_sdr — GNU Radio SDR implementation of a LoRa transceiver'
    authors: 'J. Tapparel et al., EPFL TCL'
    venue: GitHub
    url: 'https://github.com/tapparelj/gr-lora_sdr'
    type: tool
  - key: lorattackrepo
    title: 'LoRAttack — toolkit for assessing LoRaWAN network security'
    authors: konicst1
    venue: GitHub
    url: 'https://github.com/konicst1/lorattack'
    type: tool
tools:
  - gr-lora_sdr
  - lorattack
  - chirpcat
  - catnip
  - lora-wideband-decoder
  - wireshark
bsam: []
resources:
  - RFSAM-RES-07
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

LoRaWAN is a MAC/network layer carried over the LoRa CSS PHY. The over-the-air unit is the `PHYPayload = MHDR | MACPayload | MIC(4B)`; the `MHDR` carries the message type (`MType`), and the `MACPayload` carries an `FHDR` (`DevAddr`, `FCtrl`, `FCnt`, `FOpts`), an `FPort`, and the `FRMPayload` [loraalliance2020l2]. Only the `FRMPayload` is encrypted (AES-128 under the AppSKey); the headers — including the stable `DevAddr` — travel in the clear, and the MIC is an AES-128-CMAC keyed by the NwkSKey rather than an encryption layer [loraalliance2020l2].

The join procedure is even more exposed. In OTAA, the `JoinRequest` carries `JoinEUI`/`AppEUI`, `DevEUI`, and a `DevNonce` **before any session key exists**; these fields are sent in the clear and protected only by a MIC computed with the AppKey, so the key is never transmitted but the identifiers are fully readable [loraalliance2020l2]. A passive receiver that has de-chirped the waveform into frames can therefore classify traffic by `MType` (Join Request, Join Accept, Unconfirmed/Confirmed Data Up/Down) and inventory a whole deployment — which devices exist, which are joining, how often — and harvest fleet-wide identifiers, all without transmitting.

This passive frame profile is the scoping step for the documented LoRaWAN attack families, which this control does not itself execute:

- **ABP replay / selective DoS.** Yang et al. show that because ABP session keys are long-term and outlive a single session, an uplink replayed after a device's frame counter resets is accepted, causing a selective denial-of-service or desynchronisation [yang2018lorawan]. The cleartext `DevAddr` and `FCnt` harvested here identify which devices are replayable.
- **Plaintext recovery by keystream reuse.** The same work demonstrates that the AES-CTR-style payload encryption reuses keystream when the frame counter repeats under a static key, so XORing two such ciphertexts recovers plaintext — a classic two-time pad reachable from passive capture alone [yang2018lorawan].
- **Bit-flipping on the backend leg.** The MIC protects the device-to-network-server hop, but the payload the network server decrypts and forwards to the application server is no longer cryptographically bound; Lee et al. analyse the resulting bit-flipping risk and propose a field-shuffling countermeasure [lee2017bitflip], and Trend Micro independently note the same unprotected NS→AS leg and recommend an application-layer MIC or a TLS tunnel [trendmicro2021lorawan]. This attack targets the network-server-to-application-server backend interface, not the RF link: passive capture here only scopes which fields are exposed, so verify the backend topology before asserting exploitability for a given deployment.

A high proportion of `JoinRequest` frames relative to data frames is itself a finding: it indicates devices repeatedly failing to join (lost downlinks, poor coverage, mis-provisioned keys), so the network is in effect broadcasting its own poor health and offering more cleartext identifiers to harvest.

## Procedure

> Authorised testing only — capture is passive, but confirm you have written
> permission to receive and analyse the target network's traffic and that
> passive RF interception is lawful in your jurisdiction. Do not transmit at
> this layer.

1. **Confirm the band and channel plan** (from RFSAM-RES-07 / the IG and SP steps). Set the regional sub-band you will capture — e.g. EU868 (863–870 MHz) or US915 (902–928 MHz) — and the bandwidth (125/250/500 kHz) and spreading factor (SF7–SF12) in play.

2. **De-chirp the CSS waveform into LoRaWAN frames.** With an SDR, run a soft-decision LoRa receiver such as gr-lora_sdr [grlorasdr], which provides sync, timing and frequency-offset correction down to low SNR. Its example decoders take the centre frequency, bandwidth and spreading factor and emit decoded frames:
   ```bash
   # gr-lora_sdr ships GNU Radio example flowgraphs / apps under examples/ and apps/
   gnuradio-companion examples/rx.grc      # set: samp_rate ≥ bandwidth, center_freq, bw=125e3, sf=7..12
   ```
   Expected: decoded `PHYPayload` hex per received packet on stdout / the message sink. Confirm CRC-valid frames are appearing; if not, recheck SF/BW and that the sample rate covers the channel bandwidth.

3. **Or capture multi-channel into LoRaTap PCAP** with LoRAttack [lorattackrepo]. Set the centre frequency, bandwidth, sample rate and spreading factor in `config/sniffer.config`, then launch the interactive sniffer and choose bidirectional / uplink / downlink:
   ```bash
   ./run.sh        # menu: "Sniff Up/Down link (Bidirectional)"
   ```
   Expected: a PCAP per session under the tool's capture directory. The `*_wireshark` PCAPs have the UDP header stripped and the DLT set for Wireshark. (Author notes the sniffer is tested mainly at 125 kHz and is under active construction — verify against your band/SF.)

4. **Or, with gateway access**, read whole uplink+downlink frames off a concentrator with ChirpCat (RAK WisGate Connect, Semtech UDP packet forwarder), or capture the whole sub-band at once with the LoRa Wideband Decoder, or use catnip on a CatSniffer SX1262 for single-radio capture — each captures LoRaWAN frames without an SDR de-chirp flow.

5. **Dissect in Wireshark.** Open the LoRaTap PCAP; Wireshark's `loratap`/`lorawan` dissectors decode the `PHYPayload` [loratap]. The LoRaWAN dissector registers under LoRaTap and parses the `MHDR`/`MType`, `FHDR` (`DevAddr`, `FCtrl`, `FCnt`), and the join fields. Filter and classify:
   ```text
   lorawan.mtype == 0           # Join Request   (JoinEUI/AppEUI, DevEUI, DevNonce in clear)
   lorawan.mtype == 1           # Join Accept    (encrypted)
   lorawan.mtype == 2 || lorawan.mtype == 4   # Unconfirmed / Confirmed Data Up
   ```
   Expected: a per-frame breakdown with the cleartext identifiers visible; the `FRMPayload` remains AES-128 ciphertext.

6. **Inventory identifiers and compute the frame mix.** From the Join Requests, extract the cleartext `JoinEUI`/`AppEUI`, `DevEUI`, and `DevNonce`; from data frames, the `DevAddr`. Tabulate unique devices and compute the `JoinRequest`-to-data ratio as a network-health and attack-surface indicator. Flag any repeated `DevNonce` values: on LoRaWAN 1.0.x a repeated `DevNonce` indicates random-nonce join-replay exposure (1.0.4 and 1.1 require `DevNonce` to be a monotonic counter that is never reused) [loraalliance2020l2].

## Field case

Reported field observation (the author's own measurement on an authorised network, reproduced here as an illustrative figure — not independently re-measured for this control): a passive US915 capture of 51,304 LoRaWAN frames showed 45,815 (89.3%) were JoinRequests — nine of every ten frames were devices trying, and failing, to join. The structure read entirely in the clear (MHDR + DevAddr; AppEUI/DevEUI/DevNonce in the join), letting an observer harvest the fleet's identities and map the network without ever transmitting. The payloads stayed AES-protected — but the metadata alone profiled the deployment and exposed it as misconfigured. (Such a JoinRequest skew is consistent with the US915 channel-plan mismatch, where a 64-channel device randomly retries joins until one lands on the gateway's active 8-channel sub-band.)

To reproduce against your own authorised test network, stand up a couple of devices on a ChirpStack/RAK gateway, mis-provision one (wrong AppKey or a region/coverage mismatch) so it loops on join, then run the capture in step 3 and tabulate the `MType` mix:

```text
# example tally from a Wireshark export of an authorised test capture
MType                 frames      %
Join Request          [FILL: count]   [FILL: %]
Join Accept           [FILL: count]   [FILL: %]
Unconfirmed Data Up   [FILL: count]   [FILL: %]
...
unique DevEUI seen    [FILL: n]
unique DevAddr seen   [FILL: n]
repeated DevNonce     [FILL: y/n]
```

The expected shape: a mis-provisioned fleet skews heavily toward Join Requests, in line with the reported 89.3% observation above, and every Join Request hands you a `DevEUI`/`JoinEUI`/`DevNonce` in the clear. The `[FILL: …]` rows are placeholders for the reader's own authorised capture — substitute the values you capture; do not treat them as measured values.

## Remediation

**Developer (device / stack).** Use OTAA over ABP so session keys are derived afresh at each join and the frame counter cannot trivially reset into keystream reuse [yang2018lorawan]. Target LoRaWAN 1.0.4 or 1.1, where `DevNonce` is a monotonic counter that is never reused, closing the random-nonce join-replay window [loraalliance2020l2]. Treat `DevEUI`/`JoinEUI` as non-secret identifiers (they are unavoidably on the air) but do not derive any security from their secrecy.

**Integrator (network / application server).** Add end-to-end protection across the network-server-to-application-server leg — an application-layer MIC computed with the AppSKey, or a TLS tunnel (ideally with a client certificate) — so a decrypted, forwarded payload cannot be bit-flipped undetected [lee2017bitflip][trendmicro2021lorawan]. For ABP deployments, enforce server-side frame-counter validation that survives device reboots rather than accepting a reset counter, neutralising the replay/DoS path [yang2018lorawan].

**Operator (deployment).** Minimise join churn through correct provisioning and adequate downlink coverage: a deployment that constantly re-joins is leaking the maximum number of cleartext identifiers and advertising its own misconfiguration. Periodically run this passive profile against your own network as a monitoring control — a rising `JoinRequest` ratio is an early signal of provisioning or coverage failure, not just an attacker's reconnaissance aid.
