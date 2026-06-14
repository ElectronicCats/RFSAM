---
id: RFSAM-ZWAVE-CR-01
title: Assess the key-establishment scheme (S0 vs S2)
protocol: ZWAVE
layer: CR
criticality: medium
applicability:
  - Z-Wave
  - Z-Wave Plus
  - Z-Wave Long Range
deferred: false
objective: >-
  Determine which security class and key-establishment scheme a Z-Wave device
  and its controller actually negotiate at inclusion — legacy S0 (AES-128 with
  the network key transported under a fixed all-zero temporary key), modern S2
  (Curve25519 ECDH), unencrypted command classes, or an S2-capable device that
  still falls back to S0 — so the exploitability of the rest of the descent is
  known before any key-recovery is attempted.
intro: >-
  Z-Wave has two security worlds. Legacy S0 sends the network key during
  inclusion encrypted under a fixed, all-zero temporary key, so capturing one
  inclusion recovers the key; modern S2 uses a Curve25519 ECDH exchange whose
  shared secret is never transmitted, removing the capture-the-join shortcut.
  This control classifies which scheme is in force — and whether an S2-capable
  device still offers S0 (the Z-Shave downgrade) — without yet breaking
  anything.
prerequisites:
  hardware:
    - 'A sub-GHz SDR tuned to the device region: RTL-SDR V4 (narrow, first-class on this band) or HackRF One (wider survey); or a Silicon Labs UZB stick re-flashed with Zniffer firmware for a turnkey, fully-dissected capture'
  software:
    - 'Waving-Z or rtl-zwave (SDR demod), EZ-Wave / Scapy-radio (HackRF assessment stack), or Silicon Labs Zniffer (vendor sniffer) — to capture and dissect the inclusion exchange and the security command classes'
  signal:
    freq: '908.42 MHz (US) · 868.42 MHz (EU) · regional channels (ANZ 921.42, HK 919.82, JP 922–926 MHz); Z-Wave Long Range US 912/920 MHz — one region per device'
    bandwidth: 'Narrowband channel per data rate (9.6 / 40 / 100 kbps, R1/R2/R3)'
    modulation: '(G)FSK, ITU-T G.9959 PHY/MAC'
  skill: intermediate
attacks:
  - name: S0 inclusion network-key recovery
    refs:
      - fouladi2013
      - silabs-ins13474
    impact: >-
      Recovery of the S0 network key from a single captured inclusion, after
      which all S0 traffic on that network can be decrypted and forged.
    preconditions: >-
      The target is on an S0 network and an inclusion (pairing) is captured —
      either observed opportunistically or forced by excluding and re-including
      the device while capturing. Without an inclusion capture there is no S0 key.
    summary: >-
      During S0 inclusion the controller transmits the network key encrypted
      under a hardcoded temporary key found to be 16 bytes of zero, so anyone
      who captured that exchange can decrypt the key transport and recover the
      network key.
  - name: Z-Shave S2-to-S0 downgrade
    refs:
      - tierney2018zshave
      - silabs-ins13474
    impact: >-
      Forces an S2-capable device to complete inclusion under S0, re-enabling
      the all-zero-key network-key recovery against a device that would
      otherwise have used Curve25519 ECDH.
    preconditions: >-
      The S2-capable device also advertises S0 for backward compatibility, and
      the attacker is within RF range during the (re-)inclusion to spoof the
      unencrypted, unauthenticated Node Info frame.
    summary: >-
      The Node Info frame sent at inclusion is unencrypted and unauthenticated;
      stripping COMMAND_CLASS_SECURITY_2 (0x9F) from it makes the controller
      believe the device lacks S2 and fall back to weak S0.
  - name: Unencrypted-inclusion DoS (Crushing the Wave)
    refs:
      - boucif2020crushing
    impact: >-
      Denial of service against a Z-Wave gateway, blocking its communication
      processing and disabling the whole connected network.
    preconditions: >-
      RF range to inject modified unencrypted packets (Nonce Get / S2 Nonce Get,
      Find Nodes In Range) used in the inclusion phase and normal operation.
    summary: >-
      Two DoS attacks abuse the fact that inclusion-phase control packets are
      unencrypted and unauthenticated, illustrating that the inclusion exchange
      is the protocol's exposed seam — the same seam the S0 key break exploits.
references:
  - key: fouladi2013
    title: Security Evaluation of the Z-Wave Wireless Protocol
    authors: B. Fouladi, S. Ghanoun
    venue: Black Hat USA / SensePost
    year: 2013
    url: 'https://web.archive.org/web/20251209224352/https://sensepost.com/cms/resources/conferences/2013/bh_zwave/Security%20Evaluation%20of%20Z-Wave_WP.pdf'
    type: paper
  - key: tierney2018zshave
    title: 'Z-Shave. Exploiting Z-Wave downgrade attacks'
    authors: A. Tierney
    venue: Pen Test Partners
    year: 2018
    url: 'https://www.pentestpartners.com/security-blog/z-shave-exploiting-z-wave-downgrade-attacks/'
    type: blog
  - key: silabs-ins13474
    title: 'Z-Wave Security Whitepaper (INS13474-3)'
    authors: Silicon Labs
    venue: Silicon Labs
    year: 2018
    url: 'https://www.silabs.com/documents/public/white-papers/INS13474-Z-Wave-Security-Whitepaper.pdf'
    type: standard
  - key: hall2016ezwave
    title: A Practical Wireless Exploitation Framework for Z-Wave Networks (EZ-Wave)
    authors: J. L. Hall
    venue: Air Force Institute of Technology (M.Sc. thesis)
    year: 2016
    url: 'https://scholar.afit.edu/etd/304/'
    type: paper
  - key: boucif2020crushing
    title: 'Crushing the Wave – new Z-Wave vulnerabilities exposed'
    authors: 'N. Boucif, F. Golchert, A. Siemer, P. Felke, F. Gosewehr'
    venue: arXiv:2001.08497
    year: 2020
    url: 'https://arxiv.org/abs/2001.08497'
    type: paper
tools:
  - zwave-zniffer
  - waving-z
  - ez-wave
  - rtl-sdr-v4
  - hackrf-one
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-18
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Z-Wave runs over the open ITU-T G.9959 (G)FSK PHY/MAC in a region-locked sub-GHz ISM slice, and the network is fingerprinted in the clear: a 32-bit Home ID and 8-bit Node ID sit in every frame header. Security is layered above this as command-class encryption, and which scheme is in force is decided once — at device **inclusion** (pairing). This control reads that decision off the air.

**Legacy S0** uses AES-128 for confidentiality and a single network key shared by all nodes [silabs-ins13474], with data-origin authentication built on a CBC-MAC over AES (the payload itself is encrypted in an AES feedback mode such as OFB) [fouladi2013]. Its flaw is in how that key is delivered: during inclusion the controller transmits the network key encrypted under a hardcoded temporary key that Fouladi and Ghanoun found to be **16 bytes of zero** [fouladi2013]. Because the temporary key is fixed and public, anyone who captured the inclusion exchange can decrypt the key transport and recover the network key, then decrypt — and forge — the rest of the S0 traffic [fouladi2013]. The same work showed the temporary key can also be abused to *reset* a device's network key [fouladi2013]. This is why the paired capture step insists on grabbing an inclusion: no inclusion capture, no S0 key.

**Modern S2** (Z-Wave Gen5 / 700-series and later) closes this. Inclusion uses an Elliptic Curve Diffie-Hellman exchange over **Curve25519**; the size of exchanged keys is reduced enough for constrained IoT nodes, and the ECDH shared secret is never transmitted, so an S2 recording yields no key offline [silabs-ins13474]. S2 divides the network into three security classes — Access Control (door locks, garage doors), Authenticated (normal devices), and Unauthenticated — each with its own key, and authenticates the joining node via a Device Specific Key (DSK) whose value is the first 16 bytes of the node's 32-byte ECDH public key [silabs-ins13474].

Two findings make "which scheme?" a security question rather than a label. First, the **Z-Shave downgrade**: the Node Info frame sent at inclusion is unencrypted and unauthenticated, so stripping `COMMAND_CLASS_SECURITY_2` (`0x9F`) from it makes the controller believe an S2-capable device lacks S2 and fall back to S0 — re-opening the all-zero-key break against a device that would otherwise have been safe [tierney2018zshave]. For interoperability, S2 nodes may still hold an S0 key, but they transfer it using the S2 temporary ECDH key rather than the vulnerable S0 exchange [silabs-ins13474]. Second, the inclusion-phase control packets are themselves an exposed, unauthenticated seam: Boucif et al. abuse unencrypted inclusion/operation packets (Nonce Get / S2 Nonce Get, Find Nodes In Range) for denial of service against the gateway [boucif2020crushing]. The open-source assessment methodology for reading these exchanges off an SDR is documented in the EZ-Wave framework [hall2016ezwave].

Generation-to-scheme mapping is a heuristic, not a guarantee: a 700/800-series SoC *supports* S2 but a given network may still have included the device as S0 (or with unencrypted classes) — a node can request several classes yet be granted only the S0 class by a constrained controller [silabs-ins13474]. Confirm the scheme by observing the actual inclusion / security command classes on the wire — do not infer it from the chipset alone.

The all-zero temporary key was demonstrated by Fouladi and Ghanoun against the AES Z-Wave door locks of the era (their work predates the 500-series and S2) [fouladi2013]; later S2-capable silicon and S2-only configurations remove the exposure. Re-confirm the scheme against the specific target generation and firmware before asserting recoverability rather than inferring it from the protocol's history.

## Procedure

Authorised testing only — on devices you own or have explicit written permission to assess. Steps 1–4 are passive receive; step 5, if performed, **transmits** to force a re-inclusion and must be confined to your own equipment / an RF-shielded environment.

1. **Confirm the region and frequency first.** Read the FCC ID / CE marking on the label to fix the band (a radio tuned to the wrong region hears nothing). Park an SDR on the regional centre and watch for the short FSK bursts (RFSAM-RES-01):
   ```bash
   gqrx   # tune 908.42 MHz (US) / 868.42 MHz (EU); trigger the device and watch the waterfall
   ```
   Expected: brief narrowband bursts when the device reports or is polled, confirming it is alive on the channel you expect.

2. **Capture and decode frames; read the clear-text header.** Pipe SDR I/Q into a G.9959 decoder and pull Home ID / Node ID / command class:
   ```bash
   rtl_sdr -f 908420000 -s 2048000 -g 25 - | ./wave-in -1
   ```
   Expected: decoded Z-Wave frames printed to stdout. The Home ID (32-bit) and Node ID (8-bit) are in the clear and let you filter to the target network. Set the data rate to match the device (9.6 / 40 / 100 kbps); a decoder set for the wrong rate silently misses frames.

3. **Capture a device inclusion.** The scheme is only fully visible during pairing. With the Zniffer (the cleanest view of the security handshake) or an SDR decoder running, observe an inclusion. Classify the security command classes seen:
   - `COMMAND_CLASS_SECURITY` (`0x98`) key-transport during inclusion → **S0**.
   - `COMMAND_CLASS_SECURITY_2` (`0x9F`) with an ECDH/public-key exchange → **S2** (note the granted class: Access Control / Authenticated / Unauthenticated).
   - Neither, with payloads readable without a key → **unencrypted command classes** (these exist even on secure networks).
   ```text
   Expected (S0):  a SECURITY key-set/key-transport frame at inclusion — the network
                   key encrypted under the fixed all-zero temporary key.
   Expected (S2):  a SECURITY_2 KEX/public-key exchange — no recoverable key on the wire.
   ```

4. **Check whether an S2-capable device still offers S0.** Inspect the device's advertised command classes in its Node Info: if both `0x9F` (S2) and `0x98` (S0) are present, the device is downgrade-eligible (Z-Shave) [tierney2018zshave]. EZ-Wave's recon enumerates supported command classes and the module generation [hall2016ezwave]:
   ```bash
   python2 ezstumbler.py      # passive discovery
   python2 ezrecon.py         # manufacturer/model, firmware, supported command classes
   ```
   Expected: a command-class list. Presence of both security classes = the device can be coerced to S0; S2-only = the all-zero-key break does not apply.

5. **(Optional, transmit) Force a re-inclusion to observe the scheme.** If no inclusion can be observed passively and you are authorised to do so on your own test network, exclude and re-include the device while capturing, so the key-establishment exchange hits the air. Confine this to shielded / owned equipment.

Read the result as: **S0 present** → exploitable via the paired capture + key-recovery controls; **S2 only** → recognise it and stop (no offline key); **S2 but S0 still offered** → flag the downgrade exposure; **unencrypted classes** → note them regardless of the secure-class scheme.

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative bench assessment of a US Z-Wave door lock and hub on your own test network, not a measured engagement; the bracketed `[FILL: …]` values are placeholders, and no specific Home ID, Node ID or observed scheme is asserted. Record your own measured values (and the actual security command classes seen) before citing anything here as a finding — do not present the placeholders as a result.

- **Region.** FCC ID on the lock places it in the US band; survey at 908.42 MHz shows event-driven bursts when the bolt is thrown — capture rate set to R3/100 kbps after a no-decode at R1.
- **Header.** `wave-in` prints the network in the clear: Home ID `[FILL: 0xXXXXXXXX]`, lock at Node ID `[FILL: NN]`, hub at Node ID `01`. This is the filter for everything that follows.
- **Inclusion.** Excluding and re-including the lock while the Zniffer captures shows the security handshake. If a `COMMAND_CLASS_SECURITY` (`0x98`) key-transport frame appears, the network is **S0** and the network key is being carried encrypted under the all-zero temporary key [fouladi2013] — the recovery is then performed under the paired capture/crypto control, not here. If a `COMMAND_CLASS_SECURITY_2` (`0x9F`) KEX/public-key exchange appears instead, the network is **S2** over Curve25519 [silabs-ins13474] and there is no key to recover offline; the assessment of this control ends at that classification.
- **Downgrade check.** The lock's Node Info `[FILL: lists / does not list]` both `0x9F` and `0x98`; if both are present the device is Z-Shave-eligible [tierney2018zshave].

## Remediation

- **Developer (device / silicon).** Ship S2 and refuse to include under S0: do not advertise `COMMAND_CLASS_SECURITY` (`0x98`) on new products. S2's Curve25519 ECDH never puts a recoverable key on the wire [silabs-ins13474]; the S0 all-zero temporary key is the root cause to eliminate [fouladi2013]. Disable the temporary key after the initial network-key set so it cannot be reused to reset the key [fouladi2013].
- **Integrator (controller / hub).** Use a certified S2 controller and configure it to require S2 (reject S0 fallback) for security-relevant devices — door locks belong in the S2 Access Control class [silabs-ins13474]. Verify the device's DSK out-of-band (QR/printed) at inclusion so a downgraded or spoofed Node Info cannot silently weaken the join [tierney2018zshave]. Treat any device that still negotiates S0 as needing replacement or isolation.
- **Operator (deployment).** Perform inclusion in a controlled setting (S2 authentication via the DSK), minimising the window an attacker could sit in RF range to capture or downgrade a pairing event [tierney2018zshave]. Periodically re-audit which scheme each node actually runs (chipset capability is not configuration) and watch for unexpected re-inclusions — the inclusion phase is the exposed seam for both key recovery and DoS [boucif2020crushing].
