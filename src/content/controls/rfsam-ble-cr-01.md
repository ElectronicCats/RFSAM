---
id: RFSAM-BLE-CR-01
title: Assess BLE pairing and decrypt weak pairings
protocol: BLE
layer: CR
criticality: high
applicability:
  - BLE
deferred: true
objective: >-
  Determine which pairing method a BLE link uses (LE Legacy vs LE Secure
  Connections; Just Works vs authenticated) and, where LE Legacy pairing was
  captured, recover the Temporary Key and decrypt the session — establishing
  whether the link's confidentiality can be broken from a passive capture.
intro: >-
  BLE confidentiality rests entirely on the pairing exchange. LE Legacy pairing
  (Just Works / 6-digit passkey) derives the session from a low-entropy
  Temporary Key that is brute-forceable offline from a single captured pairing,
  and the encryption key size can be negotiated down to 7 bytes. RFSAM owns the
  RF-capture prerequisite — sniffing the pairing event well enough to feed a
  cracker — while the judgement on pairing mode, legacy-pairing rejection and
  minimum key size is assessed under BSAM (BSAM-PA-01, BSAM-PA-04, BSAM-EN-02,
  BSAM-EN-03).
prerequisites:
  hardware:
    - 'A connection-following BLE sniffer that captures the pairing event: a CC1352-class Sniffle sniffer (CatSniffer), an nRF52840 dongle (nRF Sniffer), or an Ubertooth One'
  software:
    - 'Sniffle / nRF Sniffer / Ubertooth for capture, Wireshark to export the PCAP, and crackle to brute-force the LE Legacy TK and decrypt'
  signal:
    freq: '2.402–2.480 GHz (40 × 2 MHz channels: 3 advertising 37/38/39 + 37 data; a connection hops every event)'
    bandwidth: '2 MHz per channel'
    modulation: 'GFSK (LE 1M / 2M / Coded PHY)'
  skill: advanced
attacks:
  - name: LE Legacy TK brute-force (crackle)
    refs:
      - ryan2013woot
    impact: >-
      Offline recovery of the Temporary Key, hence the STK/LTK and full session
      decryption of any link that paired with LE Legacy Just Works or 6-digit
      passkey.
    preconditions: >-
      A passive capture of the LE Legacy pairing exchange; the connection paired
      with LE Legacy (not LE Secure Connections / ECDH).
    summary: >-
      LE Legacy pairing derives the session from a 128-bit TK that is 0 for Just
      Works and a 6-digit value (≤ 999999) for passkey — both brute-forceable
      offline, after which the session is decrypted. The canonical BLE-pairing
      weakness and the reference method for this control.
  - name: KNOB on BLE (key-size entropy downgrade)
    cve:
      - CVE-2019-9506
    refs:
      - antonioli2020knobble
      - cve-2019-9506
    impact: >-
      Downgrades the negotiated long-term/session key entropy to 7 bytes,
      reducing brute-force cost and enabling decryption / valid-ciphertext
      injection.
    preconditions: >-
      Ability to influence the key-size negotiation (the BLE feature exchange is
      neither encrypted nor integrity-protected); peers that accept a 7-byte
      maximum key size.
    summary: >-
      The BLE key-negotiation exchange permits a minimum key size of 7 bytes, so
      an attacker posing as each peer can force both sides down to 7-byte
      entropy without breaking standard compliance.
  - name: SweynTooth Zero-LTK Installation
    cve:
      - CVE-2019-19194
    refs:
      - garbelini2020sweyntooth
      - cve-2019-19194
    impact: >-
      Establishes an encrypted session with an all-zero Long Term Key, bypassing
      LE Secure Connections entirely and giving arbitrary read/write to
      protected GATT data on affected SoCs.
    preconditions: >-
      A target SoC running an affected SMP implementation (Telink SDKs before
      Nov 2019) that does not check pairing state before accepting an
      out-of-order encryption request.
    summary: >-
      An implementation flaw that installs a zero LTK on an out-of-order
      link-layer encryption request during Secure Connections pairing — a
      reminder that even LESC is only as strong as the SoC's SMP state machine.
references:
  - key: ryan2013woot
    title: 'Bluetooth: With Low Energy Comes Low Security'
    authors: M. Ryan
    venue: USENIX WOOT 2013
    year: 2013
    url: 'https://www.usenix.org/conference/woot13/workshop-program/presentation/ryan'
    type: paper
  - key: antonioli2020knobble
    title: 'Key Negotiation Downgrade Attacks on Bluetooth and Bluetooth Low Energy'
    authors: 'D. Antonioli, N. O. Tippenhauer, K. Rasmussen'
    venue: 'ACM Transactions on Privacy and Security (TOPS), Vol. 23, No. 3'
    year: 2020
    url: 'https://francozappa.github.io/publication/knob-ble/paper.pdf'
    type: paper
  - key: cve-2019-9506
    title: 'CVE-2019-9506: Bluetooth encryption key negotiation (KNOB)'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-9506'
    type: cve
  - key: garbelini2020sweyntooth
    title: 'SweynTooth: Unleashing Mayhem over Bluetooth Low Energy'
    authors: 'M. E. Garbelini, C. Wang, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX ATC 2020
    year: 2020
    url: 'https://www.usenix.org/conference/atc20/presentation/garbelini'
    type: paper
  - key: cve-2019-19194
    title: 'CVE-2019-19194: Telink BLE SMP zero-LTK installation (SweynTooth)'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-19194'
    type: cve
tools:
  - crackle
  - sniffle
  - catsniffer
  - wireshark
bsam:
  - BSAM-PA-01
  - BSAM-PA-04
  - BSAM-EN-02
  - BSAM-EN-03
resources:
  - RFSAM-RES-04
  - RFSAM-RES-05
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

BLE confidentiality is decided entirely at pairing. Two regimes exist: **LE Legacy** pairing (4.0/4.1, still selectable on later devices) and **LE Secure Connections** (LESC, added in 4.2). They differ in how the key that protects the session is established, and that difference is the whole of this control.

In **LE Legacy** pairing the link is bootstrapped from a 128-bit **Temporary Key (TK)**. For *Just Works* the TK is fixed at zero; for the *6-digit passkey* method the TK is the passkey value, so at most 999999 — about 20 bits of entropy [ryan2013woot]. From the TK and the random/confirm values exchanged in the pairing packets, the Short Term Key and then the Long Term Key are derived. Because every input except the TK is sent in the clear, an observer who captured the pairing exchange can brute-force the TK offline, rederive the keys, and decrypt the whole session — the method Mike Ryan published with the `crackle` tool [ryan2013woot]. LESC replaces this with an Elliptic-Curve Diffie–Hellman (P-256) key agreement, so the session key is never derivable from the captured exchange; `crackle` and the LE-Legacy TK brute-force do not apply to it [ryan2013woot].

Two further weaknesses sit beside the legacy-vs-LESC split. The **key-size negotiation** is itself unprotected: the BLE feature/SMP exchange that sets the encryption key size is neither encrypted nor integrity-protected and permits a minimum of 7 bytes, so an attacker impersonating each peer can force both down to 7-byte entropy without violating the spec — the BLE form of the **KNOB** key-negotiation downgrade [antonioli2020knobble]. The KNOB family is tracked under CVE-2019-9506 [cve-2019-9506]; the NVD text is written against Bluetooth BR/EDR, while the BLE applicability — downgrading any BLE long-term and session key to 7-byte entropy — comes from the Antonioli et al. follow-up analysis [antonioli2020knobble], for which no separate CVE was assigned. And even where LESC is selected, the SoC's Security Manager state machine can be flawed: **SweynTooth Zero-LTK Installation** installs an all-zero LTK when an out-of-order encryption request arrives during Secure Connections pairing on affected Telink SDKs, fully bypassing LESC [garbelini2020sweyntooth], tracked as CVE-2019-19194 [cve-2019-19194].

So the security-relevant questions this control answers are: *did the link pair with LE Legacy or LESC; if Legacy, can the session be decrypted from a passive capture; and what key size was negotiated.* The judgement on whether the device **should** have rejected legacy pairing, required interaction, or enforced a key-size floor belongs to BSAM (BSAM-PA-01 device pairing mode, BSAM-PA-04 rejection of legacy pairing, BSAM-EN-02 force use of encryption, BSAM-EN-03 minimum encryption key size); RFSAM supplies only the RF capture that reaches those checks.

## Procedure

> Authorised testing only: capture, decrypt and key-recovery steps must be run against your own equipment or test devices, with explicit written permission, ideally inside RF shielding so you do not touch third-party links.

1. **Capture the pairing exchange.** A session can only be cracked if its pairing packets were recorded. Drive a Sniffle-class sniffer to follow the target and trigger a fresh pairing (power-cycle / forget-and-re-pair on your test device) while capturing (RFSAM-RES-04):
   ```bash
   python3 -m sniffle.sniff_receiver -s <SERIAL> -e -l -o ble_pairing.pcap
   ```
   Sniffle follows connections by default (CONN_FOLLOW mode, unless `-a`/`-A` is given), so the connection-following that this capture relies on needs no extra flag; `-e` adds BT5 extended (auxiliary) advertising capture, `-l` enables the long-range (coded) PHY on the primary advertising channels, and `-o` writes the PCAP. Confirm the capture contains the SMP exchange — in Wireshark, filter `btsmp` and look for `Pairing Request` / `Pairing Response`.

2. **Read the pairing mode straight from the capture.** In the `Pairing Request`/`Response`, inspect the **AuthReq** flags and the **SC (Secure Connections)** bit:
   ```
   wireshark ble_pairing.pcap
   # filter: btsmp.opcode == 0x01 || btsmp.opcode == 0x02
   ```
   `SC = 0` → **LE Legacy** (crackable below). `SC = 1` → **LE Secure Connections** (ECDH; not crackable from the capture — record it and stop at step 5). Also read the **Maximum Encryption Key Size** field: a value of `7` is the KNOB-relevant floor [antonioli2020knobble]; `16` is full strength.

3. **Confirm the association model.** From the same packets read **IO Capability** and the **MITM** AuthReq bit. `MITM = 0` with IO `NoInputNoOutput` is *Just Works* (TK = 0). `MITM = 1` with a display/keyboard is *passkey* (TK = the 6-digit value). This tells `crackle` how hard the TK search is.

4. **Crack the LE Legacy session (Legacy only).** Feed the PCAP to `crackle`; it brute-forces the TK and, on success, derives the keys:
   ```bash
   crackle -i ble_pairing.pcap
   ```
   Expected output names the recovered TK/keys, e.g. `TK found: 0` (Just Works) or a 6-digit value (passkey), followed by `LTK found: <16 bytes>`. If it prints `Specify a pcap file with -i` or reports it could not find a complete pairing, the capture is missing packets — re-capture a full exchange.

5. **Decrypt the session and confirm.** Use the recovered keys to produce a cleartext capture, then verify the decrypted GATT traffic is readable:
   ```bash
   crackle -i ble_pairing.pcap -o ble_decrypted.pcap
   ```
   Open `ble_decrypted.pcap` in Wireshark and confirm post-encryption ATT/GATT operations (e.g. `Write Request`, `Handle Value Notification`) are now in cleartext — that is the proof the link's confidentiality was broken from a passive capture. Enumerating the now-readable GATT table is the hand-off to RFSAM-RES-05 and to the BSAM service-access checks. For LESC captures, record `SC = 1` and the key size and defer the pairing-strength judgement to BSAM-PA/EN with no decryption claim.

## Field case

Illustrative walkthrough — substitute the values you capture. Against a representative LE Legacy fitness peripheral on a bench (your own device, RF-shielded), a Sniffle capture on the CatSniffer catches the full SMP exchange during a forced re-pair. Wireshark shows `Pairing Request` with `SC = 0`, `MITM = 0`, IO Capability `NoInputNoOutput` — i.e. LE Legacy *Just Works* — and `Maximum Encryption Key Size = 16`. Running

```bash
crackle -i ble_pairing.pcap
```

reports the Just-Works case (`TK = 0`) and recovers the LTK, and `crackle -i ble_pairing.pcap -o ble_decrypted.pcap` produces a capture in which the previously-encrypted `Write Request` to the control handle is now cleartext — confirming the session was decryptable from a passive capture alone. Record the measured values from your own engagement — `[FILL: recovered LTK, device address, control handle from a real measured capture]` — in place of this illustration.

## Remediation

- **Developer (firmware / stack).** Require **LE Secure Connections** and reject LE Legacy pairing for any link carrying sensitive data or control — LESC's ECDH defeats the captured-pairing TK brute-force entirely [ryan2013woot]. Enforce a **minimum encryption key size of 16 bytes** and refuse a negotiated maximum below that, closing the BLE KNOB downgrade [antonioli2020knobble]. Keep the SoC's SMP/Security-Manager up to date and verify it against the SweynTooth class — in particular that it checks pairing state before honouring an encryption request, so a zero LTK can never be installed [garbelini2020sweyntooth].
- **Integrator.** Select SoCs/modules whose vendor has patched the SweynTooth Zero-LTK and related SMP flaws [cve-2019-19194], and disable Just-Works association on devices that have any input/output capability so authenticated pairing (passkey/OOB, with MITM protection) is used. Treat key size and pairing mode as procurement requirements, not defaults.
- **Operator.** Pair sensitive devices once, in a controlled (low-RF-exposure) environment, since the offline crack needs the pairing exchange to have been captured; avoid repeated re-pairing in public. Where the platform allows, prefer devices that advertise LESC support and reject downgrades, and monitor for unexpected re-pairing prompts that could indicate a forced re-pair to harvest a fresh exchange.
