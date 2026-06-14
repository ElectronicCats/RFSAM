---
id: RFSAM-BTC-CR-01
title: Assess pairing and encryption key strength
protocol: BTC
layer: CR
criticality: high
applicability:
  - Bluetooth Classic (BR/EDR)
deferred: true
objective: >-
  Determine whether a Bluetooth Classic (BR/EDR) link's confidentiality can be
  broken or downgraded — recovering a legacy-PIN link key offline from a captured
  pairing, exploiting Secure Simple Pairing "Just Works" (no MITM protection), or
  forcing the negotiated encryption key down to brute-forceable entropy (KNOB) and
  impersonating a paired peer without the link key (BIAS).
intro: >-
  BR/EDR confidentiality rests on which association model the link uses and on the
  entropy of the negotiated encryption key. Legacy PIN pairing seeds the link key
  from a short/fixed PIN that falls to an offline brute force on a captured
  pairing; Secure Simple Pairing resists offline key recovery but its "Just Works"
  model has no MITM protection; and two protocol-level flaws — KNOB
  (encryption-key-entropy downgrade, CVE-2019-9506) and BIAS (impersonation of a
  paired peer, CVE-2020-10135) — undercut even SSP links. RFSAM owns the
  RF-capture prerequisite — getting the pairing/authentication exchange off the
  air into a dissector — while the judgement on rejecting legacy pairing and
  enforcing a minimum encryption key size is assessed under BSAM (BSAM-PA-04,
  BSAM-EN-03).
prerequisites:
  hardware:
    - 'An ESP32 (original, BR/EDR-capable) running the BTSnifferBREDR baseband sniffer to capture the LMP pairing/authentication exchange; an Ubertooth One is a weaker Basic-Rate fallback'
  software:
    - 'BTSnifferBREDR.py host tool (Scapy/Wireshark output) for capture; Wireshark to dissect the LMP exchange; offline analysis for legacy-PIN link-key recovery (Shaked & Wool method) and KNOB/BIAS assessment of the negotiated key size and authentication flow'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: advanced
attacks:
  - name: Legacy PIN pairing offline recovery
    refs:
      - shaked2005pin
    impact: >-
      Offline recovery of the PIN and hence the link key from a captured legacy
      pairing exchange, allowing decryption of the session and impersonation of
      either peer.
    preconditions: >-
      The link uses legacy PIN pairing and the attacker captured the pairing
      (IN_RAND, COMB_KEY, AU_RAND/SRES) exchange; short or fixed PINs (0000 /
      1234) fall fastest. Modern devices rarely use legacy pairing.
    summary: >-
      A passive attacker who captures a legacy pairing replays the SAFER+ key
      derivation offline to find the PIN; a 4-digit PIN was cracked in well under
      a second on 2005-era hardware, recovering the link key.
  - name: KNOB (Key Negotiation of Bluetooth)
    cve:
      - CVE-2019-9506
    refs:
      - antonioli2019knob
      - cve-2019-9506
    impact: >-
      Forces the negotiated encryption key down to as little as 1 byte of
      entropy, after which the key is brute-forced in real time, enabling
      decryption of the ciphertext and injection of valid encrypted frames.
    preconditions: >-
      An attacker in radio range during encryption setup; a flaw in the BR/EDR
      specification (v1.0–5.1), so it is largely implementation-independent.
      Devices that enforce a minimum key size reject the downgrade.
    summary: >-
      The BR/EDR encryption-key negotiation lets a man-in-the-middle lower the
      key entropy to 1 byte without either victim noticing — a downgrade, not a
      cryptographic break.
  - name: BIAS (Bluetooth Impersonation AttackS)
    cve:
      - CVE-2020-10135
    refs:
      - antonioli2020bias
      - cve-2020-10135
    impact: >-
      Impersonation of a previously-paired master or slave and completion of the
      authentication handshake without possessing the link key, giving the
      attacker an authenticated session.
    preconditions: >-
      The attacker knows the BD_ADDR of a peer the target has paired with; abuses
      the legacy authentication procedure and a role switch, and combines with
      KNOB on Secure Connections links.
    summary: >-
      Exploits weaknesses in the BR/EDR authentication procedure to impersonate a
      paired device without the link key, bypassing authentication for both
      legacy and Secure Connections pairing.
references:
  - key: shaked2005pin
    title: Cracking the Bluetooth PIN
    authors: Y. Shaked, A. Wool
    venue: ACM MobiSys 2005
    year: 2005
    url: 'https://www.usenix.org/legacy/event/mobisys05/tech/full_papers/shaked/shaked.pdf'
    type: paper
  - key: antonioli2019knob
    title: 'The KNOB is Broken: Exploiting Low Entropy in the Encryption Key Negotiation Of Bluetooth BR/EDR'
    authors: D. Antonioli, N. O. Tippenhauer, K. Rasmussen
    venue: USENIX Security 2019
    year: 2019
    url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/antonioli'
    type: paper
  - key: cve-2019-9506
    title: 'CVE-2019-9506: Bluetooth BR/EDR encryption key negotiation entropy downgrade (KNOB)'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-9506'
    type: cve
  - key: antonioli2020bias
    title: 'BIAS: Bluetooth Impersonation AttackS'
    authors: D. Antonioli, N. O. Tippenhauer, K. Rasmussen
    venue: IEEE Symposium on Security and Privacy 2020
    year: 2020
    url: 'https://doi.org/10.1109/SP40000.2020.00093'
    type: paper
  - key: cve-2020-10135
    title: 'CVE-2020-10135: Bluetooth BR/EDR authentication impersonation (BIAS)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-10135'
    type: cve
tools:
  - esp32-bt-classic-sniffer
  - wireshark
bsam:
  - BSAM-PA-04
  - BSAM-EN-03
resources:
  - RFSAM-RES-27
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

Bluetooth Classic confidentiality depends on two things: which association model derived the link key, and how much entropy the link encryption key carries. The KNOB authors frame both as protocol-level, not implementation-level, problems (antonioli2019knob).

**Legacy PIN pairing.** In legacy pairing a PIN seeds the link key through the SAFER+ key derivation. Because the PIN is often short or fixed (`0000`, `1234`), a passive attacker who captures the pairing exchange (the `IN_RAND`, `COMB_KEY` and `AU_RAND`/`SRES` messages) can replay the derivation offline and brute-force the PIN — Shaked & Wool cracked a 4-digit PIN in well under a second on 2005-era hardware, recovering the link key and hence the session (shaked2005pin). This requires capturing the pairing, and modern devices rarely use legacy pairing.

**Secure Simple Pairing (SSP).** SSP uses ECDH (P-192 in 2.1, P-256 in 4.1+) and resists offline key recovery. Its weak point is the **Just Works** association model, which has no MITM protection — an active man-in-the-middle problem rather than an offline crack. Establishing which SSP association model is in use (Just Works vs Passkey vs OOB) is the observable finding RFSAM contributes; the policy judgement is BSAM's (BSAM-PA-04).

**KNOB (CVE-2019-9506).** Independent of pairing model, the BR/EDR encryption-key-size negotiation lets a man-in-the-middle force the entropy down to as little as 1 byte without either victim being alerted; the key is then brute-forced in real time, the ciphertext decrypted and valid encrypted frames injected. NVD records this as the spec (up to v5.1) permitting a low key length and not preventing an attacker from influencing the negotiation (antonioli2019knob, cve-2019-9506). The defence is a host-enforced minimum key size (BSAM-EN-03).

**BIAS (CVE-2020-10135).** BIAS abuses the BR/EDR authentication procedure and a role switch to impersonate a previously-paired master or slave and complete authentication without the link key; it composes with KNOB to attack Secure Connections links as well (antonioli2020bias, cve-2020-10135).

This CVE coverage is representative, not exhaustive — KNOB and BIAS are spec-level flaws demonstrated across many BR/EDR chips, but patch status varies by vendor and firmware. Confirm against current advisories and the device's BR/EDR controller firmware before asserting a given target is or is not affected.

RFSAM's job at this floor is the RF-capture prerequisite — getting the LMP pairing/authentication exchange off the air and into a dissector — after which the pairing-policy and key-size verdicts are assessed under BSAM. There is no clean point-and-click ESP32 tool for the offline cracking step, so this floor is mostly analysis of the capture from the link layer plus the BSAM pairing controls.

## Procedure

> All active capture and any decryption/downgrade steps below are authorised-testing only: run them against your own devices or a target you are explicitly contracted to assess, in an RF-shielded or controlled environment, with test devices and recorded permission. The ESP32 baseband sniffer actively connects to follow the target — it is not purely passive.

1. Confirm the target is Bluetooth Classic (BR/EDR), not BLE, and note its `BD_ADDR` and Class of Device from the inquiry-scan step (see the SP-layer enumeration; RFSAM-RES-27 sets up the same BR/EDR kit).

2. Capture the pairing / authentication exchange with the ESP32 BR/EDR baseband sniffer, exporting to a PCAP for Wireshark:
   ```bash
   python3 BTSnifferBREDR.py -p /dev/ttyUSB0 -w btc-pairing.pcap
   ```
   Trigger a fresh pairing on the target during the capture (power-cycle / "forget device" then re-pair). The host tool dumps BT header, channel, role, FHS, ACL and LMP packets.

3. Open the capture and isolate the Link Manager Protocol exchange:
   ```bash
   wireshark btc-pairing.pcap
   # display filter:
   btbrlmp
   ```
   Read off the association model and key sizes:
   - Legacy PIN pairing shows `LMP_in_rand` / `LMP_comb_key` / `LMP_au_rand` / `LMP_sres`.
   - SSP shows the `LMP_encapsulated_*` / IO-capability exchange; identify Just Works vs Passkey vs OOB.
   - The encryption-key-size negotiation is `LMP_encryption_key_size_req` — record the **negotiated key length in bytes**. A value driven to 1 byte is the KNOB signature.

4. Classify the finding:
   - **Negotiated key size < the device's policy minimum (e.g. forced to 1 byte):** KNOB-style downgrade is feasible (antonioli2019knob, cve-2019-9506). Defer the minimum-key-size verdict to BSAM-EN-03.
   - **`LMP_in_rand` legacy pairing observed:** legacy-PIN link-key recovery applies if the pairing was captured (shaked2005pin). Defer the legacy-pairing-rejection verdict to BSAM-PA-04.
   - **SSP Just Works:** no MITM protection at association; flag for the active-MITM / impersonation path (BIAS, antonioli2020bias).

5. (Authorised, lab only) Validate exploitability rather than assert it: confirm a captured legacy pairing yields the link key offline, or that the device accepts a 1-byte key in the `LMP_encryption_key_size_req` negotiation. Record the negotiated entropy and the recovered key length as the evidence; do not claim a break you did not reproduce.

## Field case

Against a BR/EDR OBD-II dongle on the bench, an ESP32 baseband capture of a fresh pairing showed an `LMP_in_rand` / `LMP_comb_key` legacy-pairing exchange rather than SSP — the dongle still pairs with a fixed PIN. In Wireshark the `btbrlmp` filter isolated the exchange, and the `LMP_encryption_key_size_req` negotiated down to [FILL: observed key size in bytes] without the host objecting. The finding written up was: *legacy PIN pairing in use (fixed PIN), and the encryption key size is negotiable below policy* — the offline PIN/link-key recovery (shaked2005pin) and KNOB downgrade (antonioli2019knob) are both in scope. The link-key recovery and the policy verdicts (reject legacy pairing → BSAM-PA-04; enforce a minimum key size → BSAM-EN-03) were deferred to BSAM. The OBD dongle is a vivid, low-stakes demonstrator; the same procedure applies unchanged to car hands-free units and HID peripherals. [FILL: replace the bracketed key size and the device specifics with your own captured values — this is an illustrative bench example, not a logged finding.]

## Remediation

**Developer / firmware:** Reject legacy PIN pairing entirely and require Secure Simple Pairing with an authenticated association model (Passkey or OOB), never Just Works, for anything trust-bearing (BSAM-PA-04). Enforce a host-side minimum encryption key size and refuse links that negotiate below it — this is the direct defence against KNOB (BSAM-EN-03, cve-2019-9506). Where the controller and host support it, require Secure Connections (P-256) and refuse fallback to legacy authentication, which closes the BIAS legacy path (antonioli2020bias).

**Integrator:** Select BR/EDR controllers whose firmware patches the KNOB and BIAS classes, and verify the minimum-key-size enforcement is actually applied at the host (BlueZ `min_key_size` / equivalent), not just declared. Treat the KNOB/BIAS CVE list as representative — check the device's controller firmware against current vendor advisories.

**Operator:** Avoid pairing trust-bearing devices in untrusted RF environments; prefer OOB pairing where available; and where a device only offers legacy pairing or Just Works, treat its link as unauthenticated and do not place trust above it (BSAM-PA-04).
