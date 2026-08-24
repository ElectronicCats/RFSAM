---
id: RFSAM-BLE-AT-01
title: Live connection hijacking
protocol: BLE
layer: AT
criticality: critical
applicability:
  - BLE
objective: >-
  Determine whether an established BLE connection can be followed and taken over,
  by jam-and-hijack, packet injection, or reconnection spoofing, giving an
  attacker control of the peripheral or a man-in-the-middle position.
intro: >-
  An unencrypted BLE connection can be taken over: the attacker follows the
  connection's channel hopping, then transmits as the master, evicting the
  legitimate central and gaining full control of the peripheral. RFSAM owns the
  PHY-layer prerequisite, following the hop sequence well enough to inject,
  while the link-layer injection and forced-disconnection findings are assessed
  under BSAM (BSAM-AP-06, BSAM-AU-03, BSAM-EN-01).
prerequisites:
  hardware:
    - 'A connection-following BLE sniffer: BBC micro:bit or nRF51822 (Btlejack), an nRF52840 dongle (InjectaBLE firmware), or a CC1352-class Sniffle sniffer (CatSniffer)'
  software:
    - 'Btlejack, Sniffle, or the InjectaBLE firmware/tooling'
  signal:
    freq: '2.402 to 2.480 GHz (40 channels, 2 MHz spacing)'
    bandwidth: '2 MHz per channel'
    modulation: 'GFSK (LE 1M / 2M PHY)'
  skill: advanced
attacks:
  - name: InjectaBLE
    refs:
      - cayre2021injectable
    impact: Arbitrary link-layer frame injection into a live connection; slave-role hijack or full man-in-the-middle.
    preconditions: An established connection the attacker can follow; effective regardless of pairing because injection targets the predictable connection-event timing.
    summary: >-
      Injects malicious packets into an established BLE connection by exploiting
      the predictability of the connection event timing, leading to hijacking of
      either central or peripheral role. The canonical reference for connection
      injection.
  - name: BtleJacking
    refs:
      - cauquil2018btlejack
    impact: Takeover of an already-established connection; the original central is jammed out and evicted.
    preconditions: Ability to follow the connection and out-transmit the original central, using low-cost hardware (BBC micro:bit / nRF51822).
    summary: >-
      Sniffs, jams and hijacks BLE connections using low-cost hardware;
      established the practical hijack-by-following-the-hop-sequence technique
      this control verifies.
  - name: BLESA
    cve:
      - CVE-2020-9770
    refs:
      - wu2020blesa
      - cve-2020-9770
    impact: Impersonation of a previously-paired peer, feeding spoofed data after a forced reconnect.
    preconditions: Target stack does not enforce reconnection authentication (reported in BlueZ, Android Fluoride, and iOS).
    summary: >-
      Spoofing attack abusing the optional reconnection authentication: many
      stacks do not require re-authentication on reconnect, allowing a hijacker
      that forces a reconnect to impersonate the peer.
references:
  - key: cayre2021injectable
    title: 'InjectaBLE: Injecting malicious traffic into established Bluetooth Low Energy connections'
    authors: 'R. Cayre, F. Galtier, G. Auriol, V. Nicomette, M. Kaâniche, G. Marconato'
    venue: IEEE/IFIP DSN 2021
    year: 2021
    url: 'https://ieeexplore.ieee.org/document/9505071/'
    type: paper
  - key: wu2020blesa
    title: 'BLESA: Spoofing Attacks against Reconnections in Bluetooth Low Energy'
    authors: J. Wu et al.
    venue: USENIX WOOT 2020
    year: 2020
    url: 'https://www.usenix.org/conference/woot20/presentation/wu'
    type: paper
  - key: cve-2020-9770
    title: 'CVE-2020-9770: BLE reconnection authentication bypass (BLESA)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-9770'
    type: cve
  - key: cauquil2018btlejack
    title: Btlejack, BLE sniffing, jamming and hijacking tool
    authors: D. Cauquil (virtualabs)
    venue: DEF CON 26
    year: 2018
    url: 'https://github.com/virtualabs/btlejack'
    type: tool
tools:
  - catsniffer
bsam:
  - BSAM-AP-06
  - BSAM-AU-03
  - BSAM-EN-01
resources:
  - RFSAM-RES-04
  - RFSAM-RES-06
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Connection hijacking follows the hop sequence of an established connection, stabilises over several connection events, then injects link-layer traffic as the master role. The original central desynchronises and is evicted; the peripheral now answers to the attacker. Because no pairing key is needed when the link is unencrypted, Just-Works/unencrypted devices have no cryptographic barrier to this. The clean operational pattern is hijack → terminate → reconnect: rather than fight the phone for the link, send LL_TERMINATE_IND as the new master, let the device re-advertise, and reconnect for full, uncontested GATT control.

Three families of takeover are documented in the literature. **Jam-and-hijack** (Btlejacking) follows the connection, jams the original central out, and assumes the master role using low-cost hardware such as a BBC micro:bit. **Injection-based** takeover (InjectaBLE) exploits the predictability of connection-event timing to inject link-layer frames into the live connection, enabling a slave-role hijack or a man-in-the-middle; the authors describe this as inherent to the BLE specification rather than to any single implementation. A distinct **reconnection-spoofing** variant (BLESA) targets stacks that do not enforce authentication on reconnection, letting an attacker impersonate a previously-paired peer after forcing a reconnect.

## Procedure

1. Sniff the target connection and learn the control handle and command format from legitimate traffic (RFSAM-RES-04).
2. Stabilise following over N connection events, then hijack the master role (RFSAM-RES-06).
3. Verify takeover by writing the learned command and observing device response.
4. Optionally terminate (LL_TERMINATE_IND) and reconnect cleanly for full GATT access.
5. Document the desynchronisation of the original central.

## Field case

Against the ELK-BLEDOM LED controller: sniffing the vendor app setting a colour revealed handle 0x000E with format 7e 07 05 RR GG BB 10 ef. After hijacking the live connection (DATA→CENTRAL), writing `w 0x000e 7e 07 05 03 ff 00 00 10 ef` drove the strip to the attacker's colour. The same technique applies unchanged to locks and medical devices, the LED strip is merely the harmless, vivid demonstration. A real implementation detail: the decoder's current Access Address must be set to the connection AA only after reaching CENTRAL (with a flush first), because advertisements seen during INITIATING reset it to the advertising AA and silently break data-PDU decoding.

## Remediation

Encrypt the link with LE Secure Connections, the InjectaBLE authors recommend exactly this as the primary countermeasure (LESC pairing with authentication and 128-bit keys), and it is the strongest single mitigation here. Note the precise effect: the timing-based injection itself is inherent to the BLE specification and is not stopped by encryption, but on an encrypted link any injected data PDU carries no valid MIC and is rejected by the peer, so forged commands and payloads do not take effect (cayre2021injectable). Add application-layer command authentication so a hijacked or injected link still cannot issue trusted commands. Enforce reconnection authentication to close the BLESA class (wu2020blesa). Treat the link as untrusted by default.
