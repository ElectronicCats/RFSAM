---
id: RFSAM-THREAD-CR-01
title: Assess mesh credential provisioning and protection
protocol: THREAD
layer: CR
criticality: medium
applicability:
  - Thread
  - Matter-over-Thread
deferred: false
objective: >-
  Determine whether the credentials that gate a Thread mesh — the Thread network
  key and the commissioning secrets that distribute it (the Commissioner PSKc, the
  Joiner PSKd, and, for Matter devices, the SPAKE2+ setup passcode) — are
  provisioned and protected such that an attacker cannot recover the network key
  or join the mesh from a weak, default, or exposed credential.
intro: >-
  Thread's link crypto (AES-128-CCM* under the network key) and Matter's
  operational crypto (certificate-authenticated CASE) are both strong, so the
  real credential exposure is at commissioning: a weak, default, or
  printed-and-photographed Joiner credential or Matter setup passcode lets an
  attacker obtain the network key and read or join the mesh, without breaking the
  cipher. This control verifies the strength and handling of those credentials,
  not the AES core.
prerequisites:
  hardware:
    - 'An IEEE 802.15.4 (2.4 GHz) capture radio: nRF52840 dongle (nRF Sniffer for 802.15.4 / OpenThread RCP via pyspinel), a CC1352-class CatSniffer, or a standalone Minino'
    - 'For Matter setup-code testing: a host Bluetooth LE adapter (the Matter onboarding transport)'
  software:
    - 'Wireshark (802.15.4 + Thread/6LoWPAN/MLE dissector, with the 802.15.4 decryption-keys table)'
    - 'nRF Sniffer for 802.15.4 / pyspinel for capture; chip-tool (Matter SDK) for setup-code / PASE testing'
  signal:
    freq: '2.405–2.480 GHz (IEEE 802.15.4 channels 11–26, 5 MHz spacing; a Thread network sits on one channel)'
    bandwidth: '2 MHz occupied per 5 MHz channel'
    modulation: 'O-QPSK (DSSS), 250 kbit/s'
  skill: advanced
attacks:
  - name: Weak / exposed Matter setup passcode (PASE)
    refs:
      - matter-core-spec
      - matter-security-analysis
    impact: >-
      Establishing the first (PASE) session and commissioning the device onto an
      attacker-controlled fabric; on a Matter-over-Thread device this yields the
      operational Thread credentials and a foothold on the mesh.
    preconditions: >-
      An open commissioning window and a setup passcode that is a known vendor
      default, printed and observable, or otherwise low-entropy; online guessing
      is rate-limited by the spec, so this targets weak or exposed codes, not
      brute force against a random 27-bit passcode.
    summary: >-
      SPAKE2+ keys the first Matter session entirely from the 27-bit setup
      passcode; that passcode — not the cipher — is the weak link when it is
      default, guessable, or exposed.
  - name: Thread commissioning credential recovery (PSKc / PSKd)
    refs:
      - thread-commissioning-wp
      - thread-meshcop-verification
    impact: >-
      Recovering or guessing the Joiner credential (PSKd) or Commissioner PSKc
      lets an attacker complete MeshCoP commissioning and obtain the Thread
      network key, after which Wireshark decrypts the whole mesh and a rogue node
      can join.
    preconditions: >-
      A reachable Commissioner / Border Agent and a weak, default, or exposed
      Joiner/Commissioner credential; MeshCoP runs an EC-JPAKE/DTLS handshake, so
      the exposure is credential strength and handling, not a break of the
      handshake itself.
    summary: >-
      Thread distributes the network key through MeshCoP under the PSKc/PSKd
      credentials; weak or exposed commissioning secrets, not the AES-CCM* link
      layer, are where the network key leaks.
  - name: CASE Sigma1 replay (commissioned-session DoS)
    cve:
      - CVE-2024-3297
    refs:
      - cve-2024-3297
    impact: >-
      Makes a commissioned Matter device unresponsive until it is power-cycled by
      replaying manipulated CASE Sigma1 messages — a denial of the operational
      session rather than a credential compromise.
    preconditions: >-
      Adjacent-network reach to a device running a Matter stack before Matter 1.1.
    summary: >-
      A replay weakness in CASE session establishment (before Matter 1.1) that
      bounds confidence in the operational handshake; included as a
      representative advisory — check current CSA advisories.
references:
  - key: matter-core-spec
    title: 'Matter Core Specification, Version 1.0'
    authors: Connectivity Standards Alliance
    venue: CSA (document 22-27349-001)
    year: 2022
    url: 'https://csa-iot.org/wp-content/uploads/2022/11/22-27349-001_Matter-1.0-Core-Specification.pdf'
    type: spec
  - key: thread-commissioning-wp
    title: Thread Commissioning (white paper)
    authors: Thread Group
    venue: Thread Group
    year: 2015
    url: 'https://www.threadgroup.org/Portals/0/documents/support/CommissioningWhitePaper_658_2.pdf'
    type: standard
  - key: thread-meshcop-verification
    title: 'Symbolic Security Verification of Mesh Commissioning Protocol in Thread (extended version)'
    authors: 'P. Upadhyay, S. Sharma, G. Bai'
    venue: arXiv 2312.12958
    year: 2023
    url: 'https://arxiv.org/abs/2312.12958'
    type: paper
  - key: matter-security-analysis
    title: "What's the Matter? An In-Depth Security Analysis of the Matter Protocol"
    venue: IACR Cryptology ePrint Archive 2025/1268
    year: 2025
    url: 'https://eprint.iacr.org/2025/1268'
    type: paper
  - key: cve-2024-3297
    title: 'CVE-2024-3297: Matter CASE Sigma1 replay denial of service (before Matter 1.1)'
    venue: NVD
    year: 2024
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3297'
    type: cve
  - key: cve-2024-3454
    title: 'CVE-2024-3454: Matter (connectedhomeip) intra-fabric device footprinting'
    venue: NVD
    year: 2024
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3454'
    type: cve
tools:
  - wireshark
  - chip-tool
  - nrf-sniffer-802154
  - pyspinel
  - catsniffer
bsam: []
resources:
  - RFSAM-RES-17
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

A Thread network is an IPv6 mesh whose MAC payloads are encrypted with AES-128-CCM* under a single shared **Thread network key**; possession of that key is what separates an insider from an outsider, and it is also what lets a passive capture be decrypted [thread-commissioning-wp]. The cipher is not the weak point — recovering the *credentials that distribute the key* is. New devices obtain the key through the **Mesh Commissioning Protocol (MeshCoP)**: a Joiner opens a DTLS session to the Commissioner and authenticates with a per-device Joiner credential (**PSKd**), while the Commissioner itself is admitted to the network using the **PSKc** (a pre-shared key derived from a commissioning passphrase); the handshake that protects this exchange is an EC-JPAKE password-authenticated key exchange over P-256 [thread-commissioning-wp][thread-meshcop-verification]. Because MeshCoP is a PAKE bootstrapped from these secrets, the practical exposure is the *strength and handling* of PSKc/PSKd — a default, printed, or low-entropy credential — not a break of the handshake; a formal symbolic analysis (ProVerif) of MeshCoP models exactly this commissioning protocol and its trust assumptions, and reports no exploitable weakness in the modelled handshake — it is cited here only to anchor that MeshCoP/EC-JPAKE is the modelled commissioning protocol, not a named attack [thread-meshcop-verification].

On a **Matter-over-Thread** device the same network key is reached through a second credential. Matter commissioning runs **PASE (Passcode-Authenticated Session Establishment)**, which is **SPAKE2+** over P-256 keyed entirely from a **27-bit setup passcode** (the printed 8-digit PIN); the device stores a SPAKE2+ *verifier*, not the passcode itself, and PASE only runs while a commissioning window is open [matter-core-spec][matter-security-analysis]. Once commissioned, all operational sessions use **CASE** — certificate-authenticated (a Node Operational Certificate under a fabric Root CA), not the passcode [matter-core-spec]. So for Matter the passcode, not the cipher, is the weak link: a default, guessable, or photographed setup code collapses the search, and a verifier extracted from an insecure device is open to offline recovery given the low passcode entropy [matter-security-analysis]. Online guessing is bounded by the spec (failed-PASE limits and a time-boxed commissioning window) and the obvious codes are disallowed — the reference connectedhomeip implementation rejects `00000000`, each repeated-digit value (`11111111` … `88888888`), `12345678` and `87654321`, and any value outside the `00000001`–`99999998` range — so the realistic win is a *weak vendor default or an exposed onboarding payload*, not brute force against a random code [matter-core-spec][matter-security-analysis].

Two further advisories bound confidence in the surrounding handshakes and should be treated as representative (check current CSA advisories): **CVE-2024-3297** lets an attacker replay manipulated **CASE Sigma1** messages to render a device unresponsive until power-cycled, in Matter stacks before 1.1 (a DoS of the operational session, not a credential break) [cve-2024-3297]; and **CVE-2024-3454** is an intra-fabric **footprinting** disclosure in the connectedhomeip SDK (Matter 1.2) where a same-fabric party learns information the protocol intends to hide [cve-2024-3454]. Neither recovers the network key, but both are worth recording when profiling a device's stack version.

## Procedure

Run every active or decrypt step only against your own equipment, test devices, and credentials you are authorised to hold — recovering a network key or driving PASE against a device you do not own is out of scope for an unauthorised tester.

1. **Capture the mesh and confirm it is Thread on its channel.** Park an 802.15.4 radio on the target channel (11–26) and stream frames into Wireshark.
   ```bash
   # nRF52840 with the nRF Sniffer for 802.15.4 extcap, or via pyspinel:
   python sniffer.py -c 15 -u /dev/ttyACM0 -b 460800 --crc -o - | wireshark -k -i -
   ```
   Expected: 802.15.4 frames in Wireshark. Thread shows 6LoWPAN + MLE (and IPv6) above the MAC; the MAC payload is shown encrypted until you supply the key. Read the channel, PAN ID, Extended PAN ID and Network Name from beacons/MLE without any key.

2. **Establish whether you hold (or can obtain) the network key, and that it decrypts the capture.** Enter the candidate Thread network key into Wireshark's 802.15.4 decryption-keys table (Preferences -> Protocols -> IEEE 802.15.4 -> Decryption Keys; key index/hash per the MLE security suite).
   - If the mesh becomes readable (6LoWPAN/MLE/IPv6 in clear), the key is valid — the finding is *how you came to hold it* (default/exposed/weak commissioning credential), not that AES was broken.
   - If it stays opaque, the key is unknown — proceed to assess the commissioning credentials below.

3. **Assess the Thread commissioning posture (PSKc / PSKd).** Determine how the Joiner credential and Commissioner passphrase are set: are they vendor defaults, printed on the label, shared across a product line, or low-entropy? Is a Commissioner / Border Agent reachable, and is the commissioning window left open? Record the credential source and entropy — a default or printed PSKd that admits a Joiner is the finding [thread-commissioning-wp].

4. **For a Matter device, decode the onboarding payload and test the setup passcode (authorised devices only).** Recover the passcode, discriminator and VID/PID from the printed QR / 11-digit manual code, then drive PASE with chip-tool against a *device you own* using the candidate (printed value or a known vendor default):
   ```bash
   # Pair over BLE onto Thread using the on-label setup code; this exercises PASE (SPAKE2+):
   chip-tool pairing ble-thread <node-id> hex:<operational-dataset> <setup-passcode> <discriminator>
   ```
   Expected: success means the passcode admitted a commissioner (commission onto an attacker-controlled fabric on your own bench is the demonstration); on a Matter-over-Thread device this also yields the operational Thread credentials. Repeated failure eventually drives the node out of commissioning mode — that closure is itself a positive finding about the rate-limit posture. A *default or printed* code succeeding is the weakness; a *random* code resisting guessing is the expected, healthy result.

5. **Record the stack version against the representative advisories.** Note the SoC/SDK (e.g. nRF52840 / EFR32 / ESP32-H2) and whether the Matter stack predates 1.1 (CVE-2024-3297) or 1.2 (CVE-2024-3454); these do not recover the key but characterise the operational-session and footprinting exposure [cve-2024-3297][cve-2024-3454].

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative example showing how the procedure reads out, not a measured engagement; every device-specific value is marked `[FILL: …]` and must not be treated as an observed finding.

A bench Matter-over-Thread sensor is profiled. Its label carries a QR code and an 11-digit manual setup code; decoding it yields a setup passcode of `[FILL: 8-digit setup passcode read from label]`, discriminator `[FILL: discriminator]`, and VID/PID `[FILL: VID]/[FILL: PID]`. An 802.15.4 capture on channel `[FILL: channel 11–26]` shows 6LoWPAN + MLE frames — confirming Thread, not Zigbee — with the MAC payload encrypted; without the network key, Wireshark leaves the payloads opaque (the expected, healthy state).

With the device's commissioning window open on the bench, driving PASE with the *on-label* passcode using `chip-tool pairing ble-thread` commissions the node onto a test fabric and returns the operational Thread dataset, which then decrypts the capture in Wireshark — demonstrating that the entire chain hinges on the printed setup code, not on the AES-CCM* link layer. The relevant audit question, and the value that determines criticality, is whether that passcode is a unique high-entropy per-device value or a shared/guessable vendor default: `[FILL: per-device random vs. shared default — determines whether this is a hardening note or a real exposure]`. No exact, measured finding is asserted here.

## Remediation

**Developer (device / stack).** Provision a unique, high-entropy setup passcode per device (never a shared default, never one of the spec-prohibited codes) and store only the SPAKE2+ *verifier*, never the passcode, in device flash [matter-core-spec]. Enforce the spec's PASE failed-attempt limit and time-boxed commissioning window so online guessing stays bounded [matter-core-spec]. Keep the Matter stack current — at minimum past the versions named in CVE-2024-3297 (CASE Sigma1 replay, ≥ 1.1) and CVE-2024-3454 (intra-fabric footprinting) [cve-2024-3297][cve-2024-3454]. On the Thread side, use per-device Joiner credentials (PSKd) with real entropy and never ship a common PSKc/PSKd across a product line [thread-commissioning-wp].

**Integrator (product / fabric).** Treat the printed onboarding payload as a secret: do not log, photograph into asset systems, or expose setup codes; rotate or retire them after commissioning where the platform allows. Keep the commissioning window closed except during an intended onboarding, and prefer per-device credentials so one leaked code compromises one device, not a fleet.

**Operator (deployment).** Close the BLE/Thread commissioning window after setup and monitor for unexpected re-opening (multi-admin). Physically protect device labels that carry the setup code, and rotate the Thread network key / re-commission if a credential is suspected exposed. Profile the deployed stack version against current CSA advisories rather than treating any fixed CVE list as exhaustive.
