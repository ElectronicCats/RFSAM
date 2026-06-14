---
id: RFSAM-THREAD-LL-01
title: Map mesh discovery and commissioning exposure
protocol: THREAD
layer: LL
criticality: low
applicability:
  - Thread
  - Matter-over-Thread
deferred: false
objective: >-
  Determine what network-identifying and commissioning-posture data a Thread mesh
  leaks at the link layer to an unauthenticated 802.15.4 sniffer — PAN ID, Extended
  PAN ID, Network Name, channel and steering/commissioning state — and whether the
  commissioning credential (PSKc/Joiner PSKd) or onboarding window is exposed,
  default, or guessable, without breaking the network key.
intro: >-
  A Thread network's link crypto (AES-128-CCM* under the network key) is strong, so
  the link-layer finding is not decryption but exposure: beacons and MLE discovery
  responses carry the PAN ID, Extended PAN ID and human-readable Network Name in the
  clear, and the MeshCoP commissioning path (PSKc/PSKd over DTLS, Border Agent
  advertised by DNS-SD) is the real attack surface. This control inventories that
  exposure and the commissioning posture from a passive capture.
prerequisites:
  hardware:
    - 'An IEEE 802.15.4 (2.4 GHz) sniffer radio: nRF52840 dongle (nRF Sniffer for 802.15.4 / OpenThread RCP via pyspinel), a CC1352 CatSniffer, or a standalone ESP32-C6 Minino'
    - 'Optionally a wideband SDR (HackRF / bladeRF) to find the active channel before committing the sniffer'
  software:
    - 'nRF Sniffer for 802.15.4 (Wireshark extcap), pyspinel sniffer.py, or Minino capture; Wireshark with its 802.15.4 / 6LoWPAN / MLE dissectors'
  signal:
    freq: '2.405–2.480 GHz (16 channels, 11–26, 5 MHz spacing); one Thread network occupies a single channel'
    bandwidth: '~2 MHz occupied per channel (5 MHz channel spacing)'
    modulation: 'IEEE 802.15.4 O-QPSK (DSSS), 250 kbit/s'
  skill: intermediate
attacks:
  - name: Beacon / MLE discovery identifier exposure
    refs:
      - akestoridis2022thread
      - ot-network-discovery
    impact: >-
      An unauthenticated sniffer recovers the PAN ID, Extended PAN ID and
      human-readable Network Name, and can fingerprint the deployment and infer
      mesh structure from MLE traffic — all without the network key.
    preconditions: An 802.15.4 sniffer parked on the target channel; an active mesh emitting beacons / MLE discovery responses.
    summary: >-
      Thread answers active scans with beacons carrying PAN ID, XPAN ID and Network
      Name in the clear, so network identity and commissioning availability leak at
      the link layer regardless of the strong MAC crypto.
  - name: Online commissioning password guessing (DoS / energy depletion)
    refs:
      - akestoridis2022thread
    impact: >-
      Repeated joiner authentication attempts during an open commissioning window;
      not key recovery, but usable as a denial-of-service and energy-depletion
      vector against the commissioner and joiner.
    preconditions: >-
      A commissioner accepting new devices without pinning the joiner's 64-bit IEEE
      address; the attacker can transmit on the channel (authorised testing only).
    summary: >-
      If the commissioner does not pin a specific joiner EUI-64, an attacker can run
      repeated password guesses during the join window; the paper shows this is
      impractical for credential recovery but effective as DoS / energy depletion.
  - name: Matter fabric footprinting
    cve:
      - CVE-2024-3454
    refs:
      - cve-2024-3454
    impact: Disclosure of devices belonging to the same Matter fabric (footprinting), which the protocol is meant to prevent.
    preconditions: Adjacent-network access to a Matter-over-Thread node implemented on the affected connectedhomeip SDK (Matter 1.2).
    summary: >-
      A connectedhomeip implementation issue lets a third party enumerate
      co-fabric devices; relevant when the Thread mesh carries Matter, adding an
      operational-layer footprinting leak above the link exposure.
references:
  - key: akestoridis2022thread
    title: 'On the Security of Thread Networks: Experimentation with OpenThread-Enabled Devices'
    authors: 'D.-G. Akestoridis, V. Sekar, P. Tague'
    venue: ACM WiSec 2022
    year: 2022
    url: 'https://doi.org/10.1145/3507657.3528544'
    type: paper
  - key: ot-network-discovery
    title: 'OpenThread Thread Primer — Network Discovery and Formation'
    venue: OpenThread (Google / Thread Group)
    year: 2024
    url: 'https://openthread.io/guides/thread-primer/network-discovery'
    type: spec
  - key: upadhyay2023meshcop
    title: 'Symbolic Security Verification of Mesh Commissioning Protocol in Thread (extended version)'
    authors: 'P. Upadhyay, S. Sharma, G. Bai'
    venue: arXiv
    year: 2023
    url: 'https://arxiv.org/abs/2312.12958'
    type: paper
  - key: zigator
    title: 'Zigator: A security analysis tool for Zigbee and Thread networks'
    authors: D.-G. Akestoridis
    venue: GitHub
    year: 2022
    url: 'https://github.com/akestoridis/zigator'
    type: tool
  - key: cve-2024-3454
    title: 'CVE-2024-3454: Matter 1.2 / connectedhomeip co-fabric device footprinting'
    venue: NVD
    year: 2024
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3454'
    type: cve
  - key: cve-2024-3297
    title: 'CVE-2024-3297: Matter CASE Sigma1 replay denial of service'
    venue: NVD
    year: 2024
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3297'
    type: cve
tools:
  - nrf-sniffer-802154
  - pyspinel
  - catsniffer
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

Thread is an IPv6 mesh over the IEEE 802.15.4 2.4 GHz O-QPSK PHY (16 channels, 11–26),
the same radio layer as Zigbee; a single network sits on one channel. The MAC payload
is protected with AES-128-CCM* keyed by the Thread network key, so this is **not** a
decryption control — it is an exposure inventory. The link layer still leaks identity:
during an active scan, Routers and Router-Eligible End Devices answer a Beacon Request
with a beacon that contains the network's **PAN ID, Extended PAN ID (XPAN ID) and
human-readable Network Name** in the clear [ot-network-discovery]. Not all MLE
information is protected at the MAC layer, so an unauthenticated sniffer can both read
these identifiers and analyse MLE traffic patterns to fingerprint the deployment and
infer mesh structure [akestoridis2022thread].

The real attack surface is **commissioning**, not the cipher. Thread admits new devices
via the Mesh Commissioning Protocol (MeshCoP): a Commissioner authenticates to a Border
Agent over DTLS using the Pre-Shared Key for the Commissioner (**PSKc**), and a Joiner is
admitted with its Joiner credential (**PSKd**), also over DTLS [akestoridis2022thread].
The Border Agent is discoverable by DNS-SD — a co-located `_meshcop._udp` /
`_meshcop-e._udp` service is the on-network signature of a reachable commissioning entry
point. A symbolic (ProVerif) analysis of MeshCoP models its DTLS-based authentication and
its security goals [upadhyay2023meshcop]. The practical link-layer weakness is posture,
not protocol breakage: if the commissioner accepts new devices without pinning the
joiner's 64-bit IEEE address, an attacker can issue **repeated online password guesses**
during the join window — shown to be impractical for recovering a joiner credential but
usable as a **denial-of-service / energy-depletion** attack, optionally amplified by
preventing the legitimate device from joining so the user restarts commissioning
[akestoridis2022thread]. Open tooling for this analysis (Wireshark Thread dissectors plus
the Zigator security-analysis tool) repurposes Zigbee-era 802.15.4 tradecraft for Thread
[zigator].

Where the mesh carries **Matter-over-Thread**, two further leaks sit just above the link:
co-fabric device **footprinting** in the connectedhomeip SDK (CVE-2024-3454, low) and a
CASE **Sigma1-replay** denial of service in pre-1.1 Matter (CVE-2024-3297) [cve-2024-3454]
[cve-2024-3297]. The honest headline: AES-128-CCM* holds, so the finding here is what
identity, topology and commissioning state the mesh discloses to a passive observer.

## Procedure

> Authorised testing only: capture passively on networks you own or are explicitly
> permitted to assess. Any transmit step (active scan, join attempt) is an active control
> — use your own equipment, test devices, and explicit written permission, ideally inside
> RF shielding.

1. **Find the channel.** If unknown, sweep the 2.4 GHz band to spot the active 802.15.4
   channel, then park a real radio on it. With a CatSniffer's channel monitor:
   ```bash
   # CatSniffer / catnip — show live 802.15.4 channel activity (11–26)
   catnip cativity
   ```
   Read off the channel with sustained traffic; that is the mesh's channel.

2. **Capture link-layer frames into Wireshark.** Stream raw 802.15.4/Thread frames with
   the nRF Sniffer extcap, or via an OpenThread RCP and pyspinel:
   ```bash
   # OpenThread RCP on an nRF52840 -> Wireshark, channel 15
   python sniffer.py -c 15 -u /dev/ttyACM0 --crc -b 460800 | wireshark -k -i -
   ```
   Wireshark's 802.15.4 / 6LoWPAN / MLE dissectors decode frame headers without any key.

3. **Read the network identifiers (no key needed).** In the capture, filter for beacons
   and MLE discovery responses and record what is in the clear:
   ```
   wpan.frame_type == 0x0 || mle
   ```
   Expected: beacon / discovery-response frames exposing the **PAN ID** (`wpan.src_pan`),
   the **Extended PAN ID** and the **Network Name** [ot-network-discovery]. These three
   identify and fingerprint the deployment.

4. **Profile the mesh structure.** Tabulate source/destination short and extended
   addresses and MLE message types over the capture window to infer roles
   (Leader/Router/REED/End Device) and parent-child links from traffic patterns
   [akestoridis2022thread]. A representative report:
   ```bash
   zigator parsing  capture.pcap   # parse 802.15.4/Thread frames to a database
   zigator analysis capture.pcap   # derive per-device / topology statistics
   ```

5. **Check commissioning posture (on-network DNS-SD).** From a host on the same LAN as a
   Border Router, look for a reachable Border Agent / commissioning entry point:
   ```bash
   avahi-browse -rt _meshcop._udp
   ```
   A returned service indicates a Border Agent advertising the commissioning path; note
   whether an onboarding/commissioning window is open (a finding about posture, not a
   break).

6. **Record the posture, do not brute-force.** Document whether the network key is
   distributed out-of-band, whether the commissioner pins joiner EUI-64s, and whether the
   PSKc/PSKd is default/weak/printed. Online guessing against an open window is bounded and
   is properly treated as a DoS/energy-depletion finding, not credential recovery
   [akestoridis2022thread].

## Field case

Illustrative walkthrough — substitute the values you capture. Take a representative
Matter-over-Thread smart-home bulb on a lab bench (your own devices, shielded). A wideband
sweep shows activity around channel 15; an nRF52840 RCP driven by
`python sniffer.py -c 15 -u /dev/ttyACM0 --crc -b 460800` streams frames into Wireshark.
With the filter `wpan.frame_type == 0x0 || mle`, the beacon response discloses, with no
key supplied, the identifiers below — record the actual values from your own capture:

- PAN ID: `[FILL: 0xNNNN]`
- Extended PAN ID: `[FILL: NN:NN:NN:NN:NN:NN:NN:NN]`
- Network Name: `[FILL: e.g. "OpenThread-abcd"]`
- Channel: 15

`avahi-browse -rt _meshcop._udp` on the same LAN returns a Border Agent entry when a
commissioning path is reachable. MAC payloads remain AES-128-CCM* encrypted and are left
undecrypted (no network key in scope), so the finding is strictly the
**identifier and commissioning-posture exposure** — exactly the link-layer leak this
control inventories — not message content.

## Remediation

**Developer (stack / firmware).** Treat link-layer identifiers as inherently public:
do not encode secrets in the Network Name or PAN/XPAN ID, and avoid stable identifiers
that aid long-term tracking. Keep the MeshCoP/DTLS commissioning implementation current
and rate-limit failed joiner authentications so an open window cannot be turned into a
cheap energy-depletion or DoS vector [akestoridis2022thread]. For Matter-over-Thread,
ship on a connectedhomeip revision that fixes co-fabric footprinting (CVE-2024-3454) and
the CASE Sigma1-replay DoS (CVE-2024-3297) [cve-2024-3454][cve-2024-3297].

**Integrator (product / commissioning workflow).** When commissioning, **pin the joiner's
64-bit IEEE address** rather than accepting any device, which removes the
multiple-guess / restart-trick amplification [akestoridis2022thread]. Use a strong,
per-device PSKc/PSKd — never a shared default — and distribute the network key out of band.
Keep the commissioning window as short as the workflow allows and close it promptly.

**Operator (deployment).** Assume an attacker in RF range already knows the network name,
PAN ID and channel; these are not secrets and should not gate trust. Open the commissioning
window only when adding a device and confirm it closes afterwards. Periodically re-run this
passive inventory to detect unexpected beaconing, a left-open Border Agent, or an
unexpected onboarding window — and treat any of those as posture findings to fix, since the
strong link crypto means the exposure, not the cipher, is the way in.
