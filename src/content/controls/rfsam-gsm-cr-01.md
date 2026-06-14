---
id: RFSAM-GSM-CR-01
title: Assess A5 ciphering and IMSI/TMSI exposure
protocol: GSM
layer: CR
criticality: high
applicability:
  - GSM
  - 2G
deferred: false
objective: >-
  Determine, from passive capture of a GSM cell, which A5 ciphering algorithm the
  network negotiates (A5/0 none, A5/1, A5/2, or A5/3) and whether subscriber
  identities are exposed on the air — i.e. whether the cell ever pages or
  identity-requests the permanent IMSI rather than a temporary TMSI — establishing
  whether the session is confidentiality-protected and whether subscribers are
  trackable.
intro: >-
  GSM's confidentiality rests on the A5 stream ciphers and on hiding the permanent
  subscriber identity (IMSI) behind a temporary one (TMSI). Both are observable
  from the air: the Cipher Mode Command names the A5 algorithm in force, and paging
  / Identity Request messages reveal whether the IMSI is exposed. A5/1 and A5/2 have
  public, practical attacks, and GSM authenticates one-way (the network never proves
  itself), so a weak cipher or an exposed IMSI is both a confidentiality and a
  privacy finding. The BSAM registry is Bluetooth-only, so RFSAM owns this control
  end to end.
prerequisites:
  hardware:
    - 'An RTL-SDR V4 reaches GSM-850/900 and DCS-1800; for PCS-1900 (top of the RTL-SDR range) prefer a HackRF One, bladeRF 2.0 micro, or USRP B210'
    - 'Reception only — this control transmits nothing'
  software:
    - 'kalibrate-rtl to find a live ARFCN; gr-gsm (grgsm_livemon) to demodulate and decode the downlink; Wireshark to read the GSMTAP stream; Oros42 IMSI-catcher to extract paged identities; Kraken + the A5/1 rainbow tables only for the authorised lab key-recovery step'
  signal:
    freq: 'GSM-850 / E-GSM-900 / DCS-1800 / PCS-1900 MHz (band depends on region); downlink/uplink paired FDD, 45 MHz (900) / 95 MHz (1800) apart'
    bandwidth: '200 kHz per ARFCN carrier; each carrier TDMA-divided into 8 timeslots'
    modulation: 'GMSK (0.3 BT Gaussian-filtered MSK) at 270.833 kbit/s'
  skill: advanced
attacks:
  - name: A5/2 instant ciphertext-only cryptanalysis (and active A5/2 downgrade)
    refs:
      - barkan2003instant
    impact: >-
      Recovers the A5/2 session key from a few dozen milliseconds of ciphertext in
      under a second on a PC; because A5/1 and A5/2 derive the session key the same
      way, an active attacker can force a handset down to A5/2, recover the key, and
      decrypt previously-recorded A5/1 traffic.
    preconditions: >-
      Target call/SMS encrypted with A5/2 (passive break), or an active man-in-the-middle
      able to issue a Cipher Mode Command selecting A5/2 (downgrade). A5/2 is prohibited
      in modern handsets, so this is chiefly a legacy / lab finding.
    summary: >-
      The foundational ciphertext-only attack on A5/2 and the active downgrade that
      undermines A5/1, establishing why the negotiated A5 algorithm — not just its
      presence — is the finding.
  - name: A5/1 rainbow-table key recovery
    refs:
      - nohl2009gsm
    impact: >-
      Recovers the 64-bit A5/1 session key Kc from a known-keystream slice using
      precomputed rainbow tables; with Kc the rest of the captured A5/1 call or SMS
      decrypts.
    preconditions: >-
      The cell runs A5/1, the capture contains a recoverable known-keystream segment,
      and the operator holds the ~1.6–2 TB rainbow tables. Heavy but public. No effect
      on A5/3 (KASUMI).
    summary: >-
      The Berlin A5/1 Security Project's public rainbow tables, presented as
      "GSM SRSLY?" at 26C3, turned A5/1 key recovery from theory into an
      off-the-shelf capability.
  - name: IMSI exposure / one-way authentication (IMSI-catcher signature)
    refs:
      - dabrowski2014imsi
      - 3gpp24008
    impact: >-
      A cell that pages by IMSI or issues an Identity Request for the IMSI lets a
      passive observer harvest the permanent identity and track the subscriber; the
      same one-way-authentication weakness is what an active IMSI catcher abuses to
      force IMSI disclosure and weak/no ciphering.
    preconditions: >-
      Passive finding: the cell exposes the IMSI on the air (no valid TMSI held, or
      during location update). The active variant needs a rogue cell (out of scope
      for this passive control — see the AT-layer control).
    summary: >-
      GSM authenticates one-way, so on-air IMSI exposure is both a privacy finding
      and the signature an active IMSI catcher relies on; this control measures the
      passive exposure.
references:
  - key: barkan2003instant
    title: Instant Ciphertext-Only Cryptanalysis of GSM Encrypted Communication
    authors: 'E. Barkan, E. Biham, N. Keller'
    venue: CRYPTO 2003 (LNCS 2729)
    year: 2003
    url: 'https://www.iacr.org/archive/crypto2003/27290598/27290598.pdf'
    type: paper
  - key: nohl2009gsm
    title: GSM — SRSLY? (A5/1 rainbow tables / Berlin A5/1 Security Project)
    authors: 'K. Nohl, C. Paget'
    venue: 26th Chaos Communication Congress (26C3), Berlin
    year: 2009
    url: 'https://fahrplan.events.ccc.de/congress/2009/Fahrplan/attachments/1519_26C3.Karsten.Nohl.GSM.pdf'
    type: talk
  - key: dabrowski2014imsi
    title: 'IMSI-Catch Me If You Can: IMSI-Catcher-Catchers'
    authors: 'A. Dabrowski, N. Pianta, T. Klepp, M. Mulazzani, E. Weippl'
    venue: ACSAC 2014
    year: 2014
    url: 'https://publications.sba-research.org/publications/DabrowskiEtAl-IMSI-Catcher-Catcher-ACSAC2014.pdf'
    type: paper
  - key: 3gpp24008
    title: 'ETSI TS 124 008 (3GPP TS 24.008): Mobile radio interface Layer 3 specification; Core network protocols; Stage 3'
    authors: 3GPP / ETSI
    venue: ETSI / 3GPP
    year: 2000
    url: 'https://archive.org/details/etsi_ts_124_008_v03.19.00'
    type: standard
  - key: welte2010a52
    title: A brief history on the withdrawal of the A5/2 ciphering algorithm in GSM
    authors: H. Welte
    venue: laforge.gnumonks.org
    year: 2010
    url: 'https://laforge.gnumonks.org/blog/20101112-history_of_a52_withdrawal/'
    type: blog
tools:
  - kalibrate-rtl
  - gr-gsm
  - wireshark
  - imsi-catcher
  - kraken-a51
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-23
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

GSM confidentiality is supplied by the A5 family of ciphers, applied to the radio link after the network sends a Cipher Mode Command naming the algorithm to use. The algorithm in force is therefore *readable on the air* from that L3 signalling message — it is the single most decisive fact about the link. A5/0 is no ciphering at all; A5/1 is a 64-bit stream cipher; A5/2 is an export-weakened variant; A5/3 and A5/4 use the KASUMI block cipher and are far stronger [welte2010a52]. The negotiated algorithm matters more than its mere presence because the weaker options are publicly broken.

A5/2 falls to a **ciphertext-only** attack: Barkan, Biham and Keller showed that a few dozen milliseconds of A5/2 ciphertext yield the session key in under a second on a PC, and — crucially — because A5/1 and A5/2 derive the session key Kc the same way, an active man-in-the-middle can issue a Cipher Mode Command that forces a handset down to A5/2, recover Kc, and use it to decrypt traffic that was actually recorded under A5/1 [barkan2003instant]. This shared-key-generation downgrade is why A5/2 was eventually withdrawn from handsets entirely, a process Welte documents [welte2010a52]. A5/1 itself was moved from theory to off-the-shelf capability by the Berlin A5/1 Security Project: precomputed rainbow tables (~1.6–2 TB), published as "GSM SRSLY?" at 26C3, recover the 64-bit Kc from a known-keystream slice, after which the rest of the captured A5/1 call or SMS decrypts [nohl2009gsm]. None of this touches A5/3 (KASUMI), so confirming an A5/3 cell is a materially stronger result than confirming A5/1.

The second axis is identity. The permanent subscriber identity (IMSI) is meant to be hidden behind a network-assigned temporary identity (TMSI); the IMSI is only supposed to appear on the air during attach or location update when no valid TMSI is held. The network can, however, compel disclosure: the Identification procedure of the L3 mobility-management protocol lets the network send an Identity Request for the IMSI or IMEI, which the handset answers [3gpp24008]. Because GSM authentication is **one-way** — the handset authenticates to the network, but the network never proves itself to the handset — a passive observer that sees the cell paging by IMSI, or sees an IMSI in an Identity Response, has both a privacy finding (the subscriber is trackable) and the on-air signature that an active IMSI catcher exploits by impersonating the cell and demanding the IMSI plus weak or absent ciphering [dabrowski2014imsi]. This control measures the *passive* exposure; the active rogue-cell technique is authorised-testing-only and belongs to the GSM AT-layer control.

## Procedure

All steps are **passive reception** of what the network already broadcasts, on equipment you own or are authorised to test. Step 5 (key recovery) decrypts traffic and is **authorised-testing-only**: a licensed lab or RF-shielded enclosure with explicit permission and your own test SIMs — recovering keys from live traffic you are not authorised to intercept is illegal in most jurisdictions.

1. **Find a live cell and its ARFCN.** Sweep the regional band with kalibrate to list carriers with a live BTS, their power, and the radio's clock error:
   ```bash
   kal -s GSM900 -g 40
   ```
   Expected: a table of channels, e.g. `chan: 12 (944.4MHz ...) power: 159873.12`. Pick the strongest channel, then read its exact ppm offset so the receiver locks cleanly:
   ```bash
   kal -c 12 -g 40
   ```
   Expected: an `average absolute error: <N> ppm` line — note that ppm for the next step. (Use a HackRF/UHD kalibrate fork instead of `kal` (`kalibrate-rtl`) for those radios; PCS-1900 needs a HackRF/bladeRF/USRP.)

2. **Demodulate and decode the downlink.** Tune the found ARFCN's downlink frequency with gr-gsm, applying the ppm correction:
   ```bash
   grgsm_livemon_headless -f 944.4M -g 40 --ppm <N>
   ```
   It demodulates the GMSK bursts, decodes the BCCH/CCCH/SDCCH control channels, and forwards each frame as GSMTAP over UDP to localhost port 4729.

3. **Read the signalling in Wireshark.** Capture the GSMTAP stream on loopback:
   ```bash
   sudo wireshark -k -i lo -f 'udp port 4729' -Y 'gsmtap'
   ```
   Confirm System Information, paging and assignment frames are scrolling — this proves the decode chain is working before you assess crypto or identity.

4. **Determine the negotiated A5 algorithm.** In Wireshark, filter for the cipher-mode signalling:
   ```text
   gsm_a.dtap.msg_rr_type == 0x35
   ```
   Open the **Cipher Mode Command** and read the *Cipher Mode Setting* / algorithm identifier: it states A5/0 (no ciphering), A5/1, A5/2, or A5/3. This is the control's primary verdict. A cell that sets A5/0 or A5/2 is a finding on its own [barkan2003instant]; A5/1 is breakable with the rainbow tables [nohl2009gsm]; A5/3 is the hardened case.

5. **Assess identity exposure.** Two checks:
   - In Wireshark, inspect **Paging Request** messages — filter `gsm_a.dtap` and look at the mobile-identity IE: if the cell pages by **IMSI** (rather than TMSI), or you see an **Identity Request** for the IMSI followed by an **Identity Response** carrying it, the permanent identity is exposed [3gpp24008].
   - Cross-check passively with the Oros42 IMSI-catcher, which consumes the same GSMTAP stream and prints harvested identities:
     ```bash
     python3 simple_IMSI-catcher.py --sniff
     ```
     Expected: lines pairing TMSI/IMSI with country/operator for handsets the cell pages — concrete evidence of on-air identity exposure with **no transmission** [dabrowski2014imsi].

6. **(Authorised lab only) Recover the A5/1 key.** Where the cell runs A5/1 and you are authorised to decrypt, isolate a burst with a recoverable known-keystream segment from the capture and feed it to Kraken against the rainbow tables to recover Kc, which then decrypts the rest of the captured A5/1 session [nohl2009gsm]:
   ```bash
   ./kraken indexes
   crack 001110001100... (114-bit known keystream)
   ```
   Expected: Kraken searches the tables and, on success, prints the recovered internal state / Kc. No effect on A5/3.

## Field case

Illustrative walkthrough — substitute the values you capture. Assessing a fixed cellular alarm panel on a private, RF-shielded test cell, the negotiated cipher and identity behaviour are read passively before any key work. `kal -s GSM900` locates the test BTS's ARFCN; `grgsm_livemon_headless` decodes its downlink into GSMTAP, and Wireshark shows steady System Information and paging frames. Filtering the **Cipher Mode Command** reveals the algorithm the cell selected for the panel's signalling, and the **Paging Request** / **Identity Request** messages show how the panel is identified on the air. The Oros42 IMSI-catcher, reading the same GSMTAP feed, confirms the identity exposure passively (no transmit). Record the findings for the unit under test:

- ARFCN / downlink: [FILL: channel and frequency measured]
- Cipher Mode Command algorithm: [FILL: A5/0 | A5/1 | A5/2 | A5/3 read from the Cipher Mode Command]
- Identity seen on the air: [FILL: TMSI only, or IMSI exposed via paging / Identity Response]
- Verdict: [FILL: e.g. "A5/1 + IMSI exposed during location update — confidentiality and privacy finding" — fill from the measured cipher and identity above]

This walkthrough illustrates the passive cipher-and-identity workflow against a *test* cell; every bracketed `[FILL: …]` value must be supplied from your own capture. Do not cite a specific A5 algorithm, ARFCN or identity finding until measured. No claim is made about any production network.

## Remediation

**Developer (handset / modem vendors).** Reject A5/2 outright and refuse to fall back to A5/0 or A5/1 once a stronger algorithm has been used in the area, closing the shared-key-generation downgrade that lets a forced A5/2 session expose previously-recorded A5/1 traffic [barkan2003instant] [welte2010a52]. Surface the negotiated cipher to the user/operator where possible, and prefer A5/3 (KASUMI) where the network offers it.

**Integrator (device OEMs / IoT product owners).** For new designs, do not ship 2G-only radios for anything carrying sensitive data; where 2G is a fallback, treat the GSM link as unauthenticated and unconfidential by default and add end-to-end application-layer encryption and authentication above it, so an exposed IMSI or a recovered Kc does not yield plaintext. Disable 2G entirely on devices that do not need it, removing the downgrade target.

**Operator (network / defenders / assessors).** Run A5/3 and disable A5/1 and A5/2 on the radio network; A5/2 was withdrawn from handsets precisely because of the downgrade-to-A5/2 break [welte2010a52]. Minimise IMSI exposure by reallocating TMSIs promptly and avoiding IMSI paging, since frequent IMSI exposure is both a privacy weakness and the signature of an active IMSI catcher [dabrowski2014imsi] [3gpp24008]. For assessors: the cipher-and-identity read in steps 1–5 is fully passive and safe to run on equipment you are authorised to monitor; the key-recovery step 6 and any active rogue-cell work are authorised-testing-only (own equipment, test SIMs, RF shielding, explicit permission). There is no BSAM cellular control to defer to — this is RFSAM's domain.
