---
id: RFSAM-ZIGBEE-CR-01
title: Assess network-key provisioning and rotation
protocol: ZIGBEE
layer: CR
criticality: high
applicability:
  - Zigbee
deferred: false
objective: >-
  Determine how a Zigbee network's network key is established, transported to a
  joining device, and rotated, specifically whether the Trust Center transports
  the network key under the well-known default link key 'ZigBeeAlliance09' (or in
  the clear), so that anyone who captured a join can recover it, and whether the
  key is ever rotated over the device's lifetime.
intro: >-
  Zigbee encrypts the NWK and APS layers with AES-128-CCM*, so the whole mesh's
  confidentiality hangs off a single PAN-wide network key. The classic weakness is
  how that key reaches a joining device: a centralized Trust Center sends it in an
  APS Transport-Key, and if that transport is protected only by the publicly known
  default Trust Center link key 'ZigBeeAlliance09', anyone who sniffed the join can
  recover the key and decrypt, and forge, the entire network. This control checks
  the join key-transport and whether the key is ever rotated.
prerequisites:
  hardware:
    - 'An IEEE 802.15.4 capture radio for the 2.4 GHz band: a CatSniffer (CC1352), an nRF52840 dongle, a TI CC2531, an ApiMote, or an Electronic Cats Minino (ESP32-C6). The capture radios demodulate the O-QPSK/DSSS PHY and frame the MAC packets on their own 802.15.4 chipset.'
    - 'For the active rejoin-forcing variant, a transmit-capable 802.15.4 radio (ApiMote via KillerBee, or a CatSniffer via catnip); capture-only dongles (CC2531, nRF Sniffer) cannot inject.'
  software:
    - 'A capture path that feeds Wireshark (KillerBee zbdump/zbwireshark, catnip, the nRF 802.15.4 Sniffer extcap, or whsniff), plus KillerBee zbdsniff for network-key extraction and Wireshark for decryption.'
  signal:
    freq: '2.4 GHz ISM (2.405 to 2.480 GHz), 16 channels (11 to 26) spaced 5 MHz; sub-GHz 868 MHz (EU) / 902 to 928 MHz (Americas)'
    bandwidth: '2 MHz per channel (2.4 GHz)'
    modulation: 'IEEE 802.15.4 O-QPSK with DSSS, 250 kbps (2.4 GHz); BPSK/O-QPSK at lower rates sub-GHz'
  skill: intermediate
attacks:
  - name: Network-key recovery from a sniffed join under the default TC link key
    refs:
      - zillner2015
      - securelist2025
      - killerbee
    impact: >-
      Recovering the PAN-wide network key decrypts all NWK/APS traffic and lets an
      attacker forge frames and issue cluster commands the devices act on, a full
      break of the network's confidentiality and integrity.
    preconditions: >-
      The Trust Center transports the network key under the well-known default link
      key 'ZigBeeAlliance09' (or unencrypted on older devices), and the attacker has
      a passive capture of a device joining. A per-device install code defeats this.
    summary: >-
      Zillner (Cognosec, Black Hat 2015) showed the Home Automation / ZLL profiles
      require an insecure default-link-key join as a fallback, so the network key is
      transported under a publicly known key; sniffing one join recovers it, and
      KillerBee's zbdsniff automates the extraction.
  - name: Forced leave / rejoin to re-capture the key transport
    refs:
      - wang2022rejoin
      - securelist2025
      - killerbee
    impact: >-
      Provoking a fresh join puts the APS Transport-Key back on the air (re-enabling
      key recovery) and, per the rejoin-procedure flaws, ranges to denial of service
      and device hijacking.
    preconditions: >-
      A live network whose devices rejoin automatically; the attacker can transmit
      into the PAN (leave/rejoin floods or selective jamming) to force the device
      offline and back on while capturing.
    summary: >-
      Zigbee's Trust-Center rejoin procedure sacrifices authenticity for
      availability; Wang et al. (RAID 2022) formally verified design flaws that let
      unsolicited devices manipulate the rejoin, and a forced rejoin re-exposes the
      key transport for capture.
references:
  - key: zillner2015
    title: 'ZigBee Exploited: The Good, the Bad and the Ugly'
    authors: Tobias Zillner (Cognosec)
    venue: Black Hat USA 2015 (whitepaper)
    year: 2015
    url: 'https://media.kasperskycontenthub.com/wp-content/uploads/sites/43/2015/11/20081735/us-15-Zillner-ZigBee-Exploited-The-Good-The-Bad-And-The-Ugly-wp.pdf'
    type: talk
  - key: wang2022rejoin
    title: "Zigbee's Network Rejoin Procedure for IoT Systems: Vulnerabilities and Implications"
    authors: 'J. Wang, Z. Li, M. Sun, J. C. S. Lui'
    venue: 'RAID 2022 (Int. Symposium on Research in Attacks, Intrusions and Defenses)'
    year: 2022
    url: 'https://www.cse.cuhk.edu.hk/~cslui/PUBLICATION/RAID-22.pdf'
    type: paper
  - key: csa-zigbee-r23
    title: 'Zigbee Specification, Revision 23 (Zigbee Document 05-3474-23)'
    authors: Connectivity Standards Alliance
    venue: Connectivity Standards Alliance
    year: 2023
    url: 'https://csa-iot.org/wp-content/uploads/2023/04/05-3474-23-csg-zigbee-specification-compressed.pdf'
    type: spec
  - key: silabs-security
    title: 'Zigbee Security: Standard Security (network key, key rotation / Key Switch, install codes)'
    authors: Silicon Labs
    venue: Silicon Labs Documentation
    year: 2026
    url: 'https://docs.silabs.com/zigbee/latest/zigbee-security/03-standard-security'
    type: standard
  - key: securelist2025
    title: 'Turn me on, turn me off: Zigbee assessment in industrial environments'
    authors: Haidar Kabibo (Kaspersky)
    venue: Securelist (Kaspersky)
    year: 2025
    url: 'https://securelist.com/zigbee-protocol-security-assessment/118373/'
    type: blog
  - key: killerbee
    title: 'KillerBee: IEEE 802.15.4 / ZigBee Security Research Toolkit (zbdump, zbdsniff, zbreplay)'
    authors: River Loop Security
    venue: GitHub
    year: 2023
    url: 'https://github.com/riverloopsec/killerbee'
    type: tool
  - key: killerbee-control4-sample
    title: 'control4-sample.pcap / control4-sample.txt: KillerBee-shipped Control4 OTA network-key delivery capture'
    authors: River Loop Security
    venue: GitHub (riverloopsec/killerbee, sample/)
    url: 'https://github.com/riverloopsec/killerbee/blob/master/sample/control4-sample.pcap'
    type: tool
  - key: secbee
    title: 'SecBee: ZigBee security testing tool (built on scapy-radio and KillerBee)'
    authors: Cognosec
    venue: GitHub
    year: 2016
    url: 'https://github.com/Cognosec/SecBee'
    type: tool
  - key: wireshark-zbee-nwk
    title: 'Display Filter Reference: ZigBee Network Layer (zbee_nwk)'
    authors: The Wireshark team
    venue: Wireshark Documentation
    url: 'https://www.wireshark.org/docs/dfref/z/zbee_nwk.html'
    type: tool
tools:
  - killerbee
  - zbdsniff
  - wireshark
  - catnip
  - catsniffer
bsam: []
resources:
  - RFSAM-RES-16
  - RFSAM-RES-17
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

Zigbee secures both the network (NWK) and application-support (APS) layers with AES-128 in CCM* mode, providing encryption plus a message integrity code [csa-zigbee-r23][zillner2015]. There are two key types: a **network key** shared by every device in the PAN, used to secure NWK-layer (notably broadcast) traffic, and **link keys** shared pairwise between two devices and used by the APS sub-layer [zillner2015][csa-zigbee-r23]. Because the network key is PAN-wide, recovering it once decrypts the whole mesh, so this layer is about how that one key is *provisioned, transported and rotated*, not about the strength of AES.

**How the key is established and transported.** In a centralized network the coordinator is also the **Trust Center**, the security authority that hands out the network key [silabs-security]. When a device joins, the Trust Center delivers the network key in an **APS Transport-Key** command, which must be protected by a link key so the key is not exposed in plaintext [securelist2025][silabs-security]. The exposure is in *which* link key protects it. The standard defines a global default Trust Center link key, `ZigBeeAlliance09` (hex `5A6967426565416C6C69616E63653039`), included in pre-3.0 Zigbee to ease testing and interoperability [securelist2025][csa-zigbee-r23].

**Why the default-key transport is the classic break.** Zillner (Cognosec, Black Hat USA 2015) showed this is not merely a misconfiguration but a *profile requirement*: the Home Automation Public Application Profile states that "the current network key shall be transported using the default TC link key in the case where the joining device is unknown," and the ZigBee Light Link profile likewise mandates support for an insecure default-key join as a fallback [zillner2015]. Consequently, "if an attacker is able to sniff a device join using the default TC link key, the active network key is compromised and the confidentiality of the whole network communication can be considered as compromised" [zillner2015]. Many vendors left the default key enabled on shipping consumer devices, turning the fallback into the normal case [securelist2025]. KillerBee's `zbdsniff` automates exactly this recovery: it scans a join capture for the Transport-Key and decrypts it under `ZigBeeAlliance09` (or reads it directly when sent in the clear) [killerbee]. Cognosec released the SecBee framework (built on scapy-radio and KillerBee) to automate auditing Zigbee security services for these weaknesses [zillner2015][secbee].

**Why rejoin matters for key recovery.** If no join is on the air, the Transport-Key can be forced back onto it: making a device leave and rejoin re-runs the key transport [securelist2025]. The rejoin procedure is itself a documented weakness, Wang et al. (RAID 2022) formally verified that Zigbee's Trust-Center rejoin "sacrifices authenticity to achieve" availability, confirming a known design flaw and revealing two new ones, with proof-of-concept attacks ranging from denial of service to device hijacking against real hubs [wang2022rejoin].

**Rotation.** The Trust Center *may* periodically update the network key and switch devices to it via a broadcast or unicast Transport-Key followed by a Key-Switch command, and the specification recommends periodic rotation to limit the damage of a compromised key [silabs-security][csa-zigbee-r23]. In practice many deployments never rotate, so a key recovered once stays valid for the device's life [securelist2025]. Zillner found across the devices he tested that vendors "implement the minimum of the features required to be certified, including the default TC fallback key" and that "no automatic key rotation could be identified" [zillner2015].

The "ships with the default key enabled / never rotates" picture is a *representative industry pattern* reported by Zillner (2015) and Securelist (2025), not a per-device guarantee, treat it as a starting hypothesis and confirm against the specific device, stack version and Zigbee profile under test before asserting a given product is affected. Likewise the APS Transport-Key / Key-Switch and install-code key-derivation behaviour here is summarised from the Silicon Labs security documentation and the Securelist assessment; the authoritative normative text is the CSA Zigbee R23 specification (05-3474-23), which this control does not quote verbatim [silabs-security][securelist2025][csa-zigbee-r23].

## Procedure

> Authorised testing only. Capturing another network's join traffic, recovering its
> network key, and decrypting or forging frames require explicit written permission
> and must be lawful in your jurisdiction. Do not transmit (the forced-rejoin step)
> or decrypt traffic outside the agreed scope. Use your own / in-scope devices.

1. **Find the channel and PAN** (per the SP-layer step / RFSAM-ZIGBEE-SP-01) so you know which of channels 11 to 26 the target lives on and its PAN ID. Zigbee pins a PAN to one 2 MHz channel and stays there, a channel scan, not a hop chase.

2. **Park the capture radio on the target channel and capture a device joining.** The join is where the network key is transported and where the whole network opens up. With KillerBee:
   ```bash
   zbdump -f 15 -w join.pcap        # capture channel 15 to a PCAP
   ```
   With a CatSniffer, run catnip's 802.15.4/Zigbee sniffer into Wireshark instead. Expected: a PCAP that includes the join exchange, beacon request/response, association, and an **APS Transport-Key** command frame. To get a fresh join, power-cycle or re-pair the in-scope target while capturing.

3. **Recover the network key from the join capture** with KillerBee's `zbdsniff`:
   ```bash
   zbdsniff join.pcap
   ```
   Expected: when the Transport-Key was protected only by the default link key `ZigBeeAlliance09` (or sent unencrypted), `zbdsniff` prints the recovered 128-bit network key [killerbee]. If it finds no key, either the capture contains no Transport-Key (re-capture a join, step 2) or the transport was protected by a per-device install-code link key, which is the *secure* outcome and itself the finding (record it).

4. **Confirm the key decrypts the mesh in Wireshark.** Open the PCAP, then add the recovered key under **Edit → Preferences → Protocols → ZigBee → Pre-configured keys**, and add the default TC link key `ZigBeeAlliance09` as well [securelist2025][silabs-security]. Reload the capture.
   ```text
   wpan.dst_pan == 0xTARGET_PAN     # filter to the target PAN
   zbee_nwk                          # NWK-layer frames; decode once the key is loaded
   zbee_aps                          # APS-layer frames (cluster commands) after decryption
   ```
   Expected: previously-opaque NWK/APS payloads now dissect into readable cluster commands (on/off, level, lock, thermostat) [wireshark-zbee-nwk]. Decryption is the proof the recovered key is correct and that the join transport was weak.

5. **Assess rotation.** Capture the live network over an extended window (or across an authorised forced rejoin) and watch the network-key **sequence number** in NWK security headers. A Trust Center that rotates issues a new Transport-Key + Key-Switch and the sequence number advances [silabs-security][csa-zigbee-r23]. A sequence number that never changes across the observation window indicates the key is not being rotated, so a once-recovered key stays valid indefinitely.

6. **(Optional, transmit) Force a rejoin to re-expose the transport.** Only on an in-scope network and with a transmit-capable radio: provoke a leave/rejoin so a fresh Transport-Key hits the air for capture. KillerBee's framework drives the disruptive scans/floods that provoke a rejoin; note that the rejoin procedure itself carries the flaws Wang et al. document [wang2022rejoin].
   ```bash
   # KillerBee transmit-capable radio (e.g. ApiMote); disruptive, authorised use only
   zbstumbler -c 15                  # active beacon-request scan that can provoke activity
   ```
   Expected: the target leaves and rejoins, putting a new Transport-Key on the air; return to step 2 to capture and step 3 to extract. This step transmits into the live network, keep it in scope and time-boxed.

7. **Record the result:** join key-transport (default-key / clear / install-code), whether `zbdsniff` recovered the key, whether Wireshark then decrypted NWK/APS, and the rotation observation (sequence number static vs advancing). Each positive is a key-management failure that collapses the mesh's confidentiality.

## Field case

A public KillerBee-shipped sample grounds the default-key / clear-transport row of this field case, no first-party capture is needed to demonstrate the break. The repo's own note (riverloopsec/killerbee, `sample/control4-sample.txt`) describes `sample/control4-sample.pcap` as "a sample packet capture from a Control4 appliance that includes OTA key delivery to a downstream device" that you can "extract the key with zbdsniff, and decrypt the contents with Wireshark" [killerbee-control4-sample]. Dissecting that shipped capture, the join's APS Transport-Key command (a Standard Network Key with key sequence number 0) carries **APS Security: False**, so the network key is delivered over the air in the clear, not even wrapped under `ZigBeeAlliance09`, and `zbdsniff` reads it straight off: the recovered Control4 network key is `26546b723b396a727b5d5271517d392f` [killerbee-control4-sample][killerbee]. (As the same note warns, that key must be entered byte-reversed into Wireshark's pre-configured keys to decrypt the session.) To exercise the secure path for comparison, stand up your own authorised test network, provision one end device with a per-device **install code**, and repeat, `zbdsniff` should fail on that device because the Transport-Key is protected by a key the attacker does not hold.

```text
# network-key provisioning findings; row A = KillerBee-shipped control4-sample.pcap (public)
device / join          TC link key used     zbdsniff result      Wireshark decrypts   key rotated?
Control4 appliance     none (APS Sec=False) 26546b72…517d392f    y                    [FILL: seq static?]
[FILL: end device B]   per-device install   [FILL: no key]         [FILL: n]            [FILL: seq static?]
```

The shape is exactly as expected: the clear-transport Control4 device yields its full 128-bit network key from a single sniffed join (its whole mesh is then decryptable in Wireshark), while an install-code device defeats `zbdsniff` because the key never crosses the air in a recoverable form. The historical anchor for the default-key variant is Zillner's Black Hat 2015 result, sniffing a default-key join compromises the active network key, and because Home-Automation door-locks and HVAC use the same profile as light bulbs, the impact is not limited to harmless devices [zillner2015].

Row A is the documented public KillerBee sample (`control4-sample.pcap`), not a first-party live capture, re-derive it locally with `zbdsniff sample/control4-sample.pcap` to confirm [killerbee-control4-sample]. Row B's `[FILL: …]` cells, and both rotation cells, remain placeholders for the reader's own authorised lab run and must not be presented as measured findings.

## Remediation

**Developer (device / stack).** Do not rely on the well-known default Trust Center link key `ZigBeeAlliance09` for network-key transport: ship Zigbee 3.0+ with a per-device **install code** so the Trust Center derives a unique pre-configured link key for each joining device, and the Transport-Key is protected by a key an over-the-air attacker does not hold [securelist2025][silabs-security]. Never disable APS encryption of the Transport-Key (no clear-text key transport). Where the stack still supports a default-key fallback for interoperability, gate it tightly. Support and honour network-key rotation (Transport-Key + Key-Switch) so a key is not valid for the device's entire life [silabs-security][csa-zigbee-r23].

**Integrator (hub / Trust Center).** Configure the Trust Center to require install-code-based joining and to permit the insecure default-link-key fallback only during a brief, explicit commissioning window, not as a standing condition, since the well-known key should never protect a network-key transport during normal operation or a rejoin [securelist2025][silabs-security]. Enable periodic network-key rotation. Harden the rejoin path against the abuse Wang et al. document, rate-limit and authenticate rejoin/leave handling so unsolicited devices cannot trivially force rejoins or exhaust resources [wang2022rejoin].

**Operator (deployment).** Treat the network key as the crown jewel of the PAN: prefer install-code commissioning, keep the permit-join window closed except when deliberately adding a device, and where the hub supports it, rotate the network key periodically so a key recovered from one historic join stops being useful [securelist2025][silabs-security]. Periodically run this passive capture-and-extract audit against your own network, a `zbdsniff` recovery from a sniffed join, or a network-key sequence number that never advances, is a provisioning failure to fix, not merely an attacker's opportunity.
