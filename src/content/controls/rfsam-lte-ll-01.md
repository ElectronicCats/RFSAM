---
id: RFSAM-LTE-LL-01
title: Decode the control channel and inventory clear-text identifiers
protocol: LTE
layer: LL
criticality: medium
applicability:
  - LTE
deferred: false
objective: >-
  Determine, from a purely passive capture, which LTE control-channel and
  broadcast information a receiver can recover without transmitting, active
  RNTIs and per-cell scheduling from the PDCCH, cell configuration from the
  SIBs, and subscriber identifiers (S-TMSI, and where mis-configured, IMSI)
  from the paging channel, and document the identity- and tracking-exposure
  that follows.
intro: >-
  LTE shouts its control and broadcast information in the clear. A passive
  receiver that has recovered the resource grid can blind-decode the PDCCH to
  enumerate active RNTIs and scheduling, read the SIBs for cell identity, and
  watch the paging channel for the temporary (and sometimes permanent)
  subscriber identifiers, all without ever keying up. This control inventories
  exactly what is recoverable passively and the privacy exposure it creates.
prerequisites:
  hardware:
    - 'A coherent, ideally GPSDO-disciplined SDR for clean OFDM grid recovery: USRP B210 (preferred), bladeRF 2.0 micro, or SignalSDR Pro; a free-running HackRF One can do cell search and MIB/SIB but is twitchier on the PDCCH'
    - 'For low LTE bands only, an RTL-SDR V4 reaches up to ~1.766 GHz (700/800 MHz carriers) but not the 1.8 to 2.6 GHz carriers'
  software:
    - 'LTESniffer (downlink/uplink PDCCH+PDSCH/PUSCH eavesdropper) or FALCON (real-time whole-PDCCH blind decode); srsRAN 4G (srsUE cell search + MIB/SIB receiver, MAC-LTE/RRC PCAP); Wireshark for GSMTAP / MAC-LTE dissection'
  signal:
    freq: 'Licensed cellular, ~700 MHz to 2.6 GHz (full E-UTRA ~450 MHz to 3.8 GHz); the carrier EARFCN/band must be known first (see RFSAM-RES-08)'
    bandwidth: '1.4 / 3 / 5 / 10 / 15 / 20 MHz channel widths; a 20 MHz carrier fits one HackRF/B210 view'
    modulation: 'Downlink OFDMA (PDCCH/PDSCH), uplink SC-FDMA; QPSK/16/64/256-QAM; 10 ms frame → 10×1 ms subframes → 2×0.5 ms slots'
  skill: advanced
attacks:
  - name: Passive identity and location exposure via paging and broadcast
    refs:
      - shaik2016
    impact: >-
      An attacker within radio range correlates paging (S-TMSI) and the
      in-the-clear broadcast/SIB configuration to confirm a target's presence
      in a tracking area and, with the documented smart-paging trigger,
      narrow it toward a single cell, a location/privacy leak with no
      transmission required for the core observation.
    preconditions: >-
      Radio proximity to the serving cell and a receiver that recovers the grid
      and paging channel. The pre-authentication leakage is inherent: SIBs and
      paging are broadcast without confidentiality or integrity protection.
    summary: >-
      LTE access-network messages (SIBs, paging) are unauthenticated and
      unencrypted, allowing a low-cost passive/semi-passive attacker to leak a
      device's presence and coarse location and to expose temporary identifiers.
  - name: Passive control-channel sniffing and IMSI extraction (LTrack)
    refs:
      - kotuliak2022ltrack
    impact: >-
      Passive recovery of per-UE scheduling and timing-advance from the
      uplink/downlink control channels enables stealthy localisation; an
      enhanced sniffer additionally binds a UE's TMSI to its permanent IMSI.
    preconditions: >-
      A software-defined-radio uplink/downlink sniffer in radio range. The
      core localisation is fully passive; the IMSI binding step uses surgical
      message overshadowing (an active step requiring authorisation).
    summary: >-
      Demonstrates that the same passive PDCCH/scheduling decode this control
      verifies is sufficient for stealthy LTE phone tracking, and that a
      sniffer can extract and bind the permanent identifier.
  - name: Procedural attacks downstream of the passive view (LTEInspector)
    refs:
      - hussain2018lteinspector
    impact: >-
      The clear-text attach / paging / detach procedures this control reads
      passively are the same procedures that model checking shows to be
      vulnerable to authentication relay, paging-channel hijack and DoS, the
      active attacks the passive picture scopes and informs.
    preconditions: >-
      Carrying these out is active and out of scope for this passive control;
      listed to map where the passive findings lead.
    summary: >-
      Systematic adversarial testing of LTE attach/paging/detach surfaced ten
      new attacks; the passive control-channel view is the reconnaissance these
      procedural attacks build on.
references:
  - key: shaik2016
    title: 'Practical Attacks Against Privacy and Availability in 4G/LTE Mobile Communication Systems'
    authors: 'A. Shaik, R. Borgaonkar, N. Asokan, V. Niemi, J.-P. Seifert'
    venue: NDSS 2016
    year: 2016
    url: 'https://www.ndss-symposium.org/wp-content/uploads/2017/09/practical-attacks-against-privacy-availability-4g-lte-mobile-communication-systems.pdf'
    type: paper
  - key: kotuliak2022ltrack
    title: 'LTrack: Stealthy Tracking of Mobile Phones in LTE'
    authors: 'M. Kotuliak, S. Erni, P. Leu, M. Röschlin, S. Čapkun'
    venue: USENIX Security 2022
    year: 2022
    url: 'https://www.usenix.org/conference/usenixsecurity22/presentation/kotuliak'
    type: paper
  - key: hussain2018lteinspector
    title: 'LTEInspector: A Systematic Approach for Adversarial Testing of 4G LTE'
    authors: 'S. R. Hussain, O. Chowdhury, S. Mehnaz, E. Bertino'
    venue: NDSS 2018
    year: 2018
    url: 'https://www.ndss-symposium.org/wp-content/uploads/2018/02/ndss2018_02A-3_Hussain_paper.pdf'
    type: paper
  - key: hoang2023ltesniffer
    title: 'LTESniffer: An Open-source LTE Downlink/Uplink Eavesdropper'
    authors: 'T. D. Hoang, C. Park, M. Son, T. Oh, S. Bae, J. Ahn, B. Oh, Y. Kim'
    venue: ACM WiSec 2023
    year: 2023
    url: 'https://pure.kaist.ac.kr/en/publications/ltesniffer-an-open-source-lte-downlinkuplink-eavesdropper/'
    type: paper
  - key: ltesniffer-repo
    title: 'LTESniffer: open-source LTE downlink/uplink eavesdropper (source)'
    authors: SysSec-KAIST
    venue: GitHub
    year: 2023
    url: 'https://github.com/SysSec-KAIST/LTESniffer'
    type: tool
  - key: ltesniffer-dl-pcap
    title: 'LTESniffer downlink-mode sample capture (pcap_file_example/ltesniffer_dl_mode.pcap)'
    authors: SysSec-KAIST
    venue: GitHub
    year: 2023
    url: 'https://github.com/SysSec-KAIST/LTESniffer/blob/main/pcap_file_example/ltesniffer_dl_mode.pcap'
    type: tool
  - key: falcon-repo
    title: 'FALCON: Fast Analysis of LTE Control channels (source)'
    authors: 'R. Falkenberg et al. (TU Dortmund)'
    venue: GitHub
    year: 2019
    url: 'https://github.com/falkenber9/falcon'
    type: tool
  - key: rupprecht2019alter
    title: 'Breaking LTE on Layer Two (aLTEr)'
    authors: 'D. Rupprecht, K. Kohls, T. Holz, C. Pöpper'
    venue: IEEE S&P 2019
    year: 2019
    url: 'https://doi.org/10.1109/SP.2019.00006'
    type: paper
  - key: rupprecht2020revolte
    title: 'Call Me Maybe: Eavesdropping Encrypted LTE Calls With ReVoLTE'
    authors: 'D. Rupprecht, K. Kohls, T. Holz, C. Pöpper'
    venue: USENIX Security 2020
    year: 2020
    url: 'https://www.usenix.org/conference/usenixsecurity20/presentation/rupprecht'
    type: paper
tools:
  - ltesniffer
  - falcon
  - srsran-4g
  - wireshark
  - usrp-b210
bsam: []
resources:
  - RFSAM-RES-08
  - RFSAM-RES-10
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

LTE multiplexes everything onto an OFDM resource grid: a 10 ms frame of ten 1 ms subframes, each two 0.5 ms slots, carrying QPSK/16/64/256-QAM on downlink OFDMA and uplink SC-FDMA (this control inherits those signal facts from the LTE Wayfinder). Three of those channels are readable by a passive receiver because the network broadcasts them without confidentiality or integrity protection.

The **Physical Downlink Control Channel (PDCCH)** carries Downlink Control Information (DCI) that schedules every transfer. Each DCI is addressed by a Radio Network Temporary Identifier (RNTI), C-RNTI per active UE, SI-RNTI for system information, P-RNTI for paging, RA-RNTI for random access, and the addressing is implicit: the CRC of the DCI is masked (XORed) with the RNTI. A receiver therefore recovers the control channel by *blind decode*: for each candidate location in the common and UE-specific search spaces it runs the channel decoder and tests whether the CRC, de-masked by a candidate RNTI, checks out. This is exactly what open-source eavesdroppers implement, LTESniffer decodes the PDCCH to obtain the DCIs and RNTIs of all active users, then follows them into the scheduled PDSCH/PUSCH [hoang2023ltesniffer][ltesniffer-repo], and FALCON blind-decodes the entire PDCCH in real time to expose every DCI/RNTI grant in the cell [falcon-repo]. The product is a passive inventory of who is active and how the cell is scheduling them, operational metadata, recovered without transmitting.

The **broadcast channels** give the cell's identity: srsUE's cell search locks the PCI from PSS/SSS, decodes the MIB on PBCH for bandwidth and frame number, then reads SIB1 (carried on PDSCH via the SI-RNTI) for the PLMN (MCC+MNC, i.e. the operator), the cell identity and the Tracking Area Code, all in the clear, dissectable in Wireshark over MAC-LTE/GSMTAP. The **paging channel** then leaks per-subscriber activity: paging records normally carry the S-TMSI temporary identifier, and a passive observer who can map that to a target leaks the target's presence in the tracking area. Shaik et al. showed that because the LTE access-network messages (SIBs and paging) are unauthenticated, a low-cost passive/semi-passive attacker can leak a device's presence and coarse location, and that some networks page with the permanent IMSI, a direct identity exposure [shaik2016]. LTrack carried this further, showing the same passive uplink/downlink control-channel decode is sufficient for stealthy phone localisation (using Timing Advance recovered from the control plane) and that a sniffer can bind a UE's TMSI to its IMSI [kotuliak2022ltrack].

The passive view is bounded. EPS-AKA derives the air-interface keys (SNOW 3G / AES / ZUC) from the operator secret on the USIM, so user-plane payloads are not recoverable from a passive capture, and there is no weak-pairing shortcut as in BLE Just Works or WPA2 (a fact this control shares with the LTE Wayfinder CR layer). What passive decode yields is identity, scheduling and configuration exposure, not content. The active and cryptographic attacks that exploit the same procedures and integrity gaps, aLTEr's bit-flipping DNS redirection against the unauthenticated user plane [rupprecht2019alter], ReVoLTE's VoLTE keystream reuse [rupprecht2020revolte], and the authentication-relay / paging-hijack / DoS flaws LTEInspector found in the attach/paging/detach procedures [hussain2018lteinspector], sit downstream of this passive picture and are scoped by it, but carrying them out requires transmitting and belongs to the Attack layer, not here.

The exact number of PDCCH blind-decode candidates a receiver must test per subframe is release- and aggregation-level-dependent (per the search-space definition in 3GPP TS 36.213), so this control deliberately asserts no fixed candidate count; the modulation set (QPSK/16/64/256-QAM) is inherited from the LTE Wayfinder `facts`.

## Procedure

> Authorised testing only. This procedure is **receive-only**, it does not transmit. Even so, receive on licensed cellular spectrum in line with local law and your engagement scope; the goal is to inventory what is exposed, not to interfere.

1. **Confirm the target carrier first.** You must already know the band/EARFCN and bandwidth (see RFSAM-RES-08 for the identify-and-capture flow). Sanity-check on a waterfall that you are looking at a steady downlink OFDM "wall":
   ```bash
   gqrx
   ```
   Expected: a flat-topped OFDM carrier of the expected width (e.g. 20 MHz) centred on the EARFCN frequency. Note the centre frequency and width.

2. **Recover the cell and read its identity** with an srsRAN cell-search + MIB/SIB receiver, writing a MAC-LTE/RRC PCAP:
   ```bash
   srsue --rf.device_name=uhd \
         --rf.dl_earfcn=<EARFCN> \
         --pcap.enable=mac \
         --pcap.filename=/tmp/lte_mac.pcap
   ```
   Expected: srsUE logs `Found Cell:  PCI=<n>` from PSS/SSS, then decodes the MIB (bandwidth, SFN). The PCAP captures the SIBs. (A GPSDO-disciplined USRP B210 gives the steadiest grid; a HackRF works but is twitchier.)

3. **Read the clear-text cell configuration** from the PCAP in Wireshark:
   ```bash
   wireshark /tmp/lte_mac.pcap
   ```
   Filter `mac-lte` / `lte_rrc.SystemInformationBlockType1`. Expected: SIB1 shows the PLMN (MCC+MNC = operator), the cell identity and the TAC, all in the clear. Record them.

4. **Blind-decode the PDCCH** to enumerate active RNTIs and scheduling. With LTESniffer (downlink mode):
   ```bash
   LTESniffer -A 1 -W 4 -f <freq_Hz> -C -m 0
   ```
   Expected: a running list of decoded DCIs with their RNTIs (C-RNTI per active UE, plus SI-/P-/RA-RNTI) and the resource allocations they grant. This is the passive scheduling/activity inventory. FALCON gives an equivalent real-time whole-PDCCH view if you prefer.

5. **Watch the paging channel** for identifier exposure. In the same capture, filter paging in Wireshark (`lte_rrc.PagingRecord` / look for the P-RNTI traffic). Expected: paging records normally carry **S-TMSI** (temporary). Flag any record that pages with **IMSI** (permanent), that is a direct identity-exposure finding per [shaik2016].

6. **Inventory the result.** Record, as the control's finding, exactly which of the following were recoverable purely passively: cell PLMN/identity/TAC (SIB1); the set of active RNTIs and per-subframe scheduling (PDCCH); whether paging used S-TMSI only or ever fell back to IMSI; and whether any unciphered user-plane bearer was observable. The presence of IMSI paging, or of enough scheduling/TMSI continuity to track a known target, is the reportable exposure.

## Field case

Worked against the public downlink sample capture shipped with LTESniffer (SysSec-KAIST/LTESniffer, `pcap_file_example/ltesniffer_dl_mode.pcap`) [ltesniffer-dl-pcap], the data column reads exactly the way this control predicts. The capture is a 2,433-frame, ~`28.6 s` downlink recording (file timestamp 2023-04-25); dissecting it in Wireshark with the MAC-LTE/RRC dissector (USER0/DLT-147 mapped to `mac-lte-framed`) recovers the cell's identity and activity purely passively, no decryption is performed, because none of this is encrypted.

- The cell broadcasts its identity in the clear in SIB1 (BCCH-DL-SCH, SI-RNTI 65535, SFN 430): PLMN `901-55` (a non-geographic test/shared PLMN, MCC 901 "International Mobile, shared code"), cell identity `0x0019B010` (ECI `105217`, 28-bit), TAC `0x0007`, freqBandIndicator 7, Band 7.
- SIB2 reports a `20 MHz` channel: `ul-Bandwidth n100` (100 PRB), with `ul-CarrierFreq` EARFCN 21400 (Band 7 uplink). The downlink channel width follows the same 100-PRB grid.
- The PDCCH/MAC decode over the ~`28.6 s` capture enumerates exactly `one` distinct active C-RNTI (value 70, 642 frames) alongside the broadcast/random-access RNTIs (SI-RNTI 65535 across 1,790 frames; RA-RNTI 2 in 1 frame), a passive activity inventory of the cell, recovered without transmitting.

This is the metadata/identity exposure the control is built to surface: PLMN, ECI, TAC and per-cell scheduling are all readable from a passive downlink capture. The sample capture is downlink-only and contains no paging records that page with IMSI, so it demonstrates the SIB/PDCCH half of the check rather than a permanent-identifier leak. (Per [shaik2016], a network that ever pages with IMSI would convert this into a permanent-identity exposure; per [kotuliak2022ltrack], the same passive decode plus timing-advance is the basis for stealthy localisation.)

The `Found Cell: PCI=[FILL: measured PCI]` line in Step 2 is not asserted from this PCAP, the LTESniffer sample capture carries decoded MAC/RRC frames rather than the raw IQ a live srsUE cell search would lock onto, so the PCI placeholder is kept verbatim for a contributor running the full receive chain against a lab or authorised live cell.

## Remediation

This is largely a standards/operator concern: passive control-channel and broadcast exposure is inherent to the LTE air interface, so for most assessments the control *documents the exposure* rather than prescribing a device-side fix. Layered guidance:

- **Developer (UE / modem stack):** Reject networks that request the permanent identifier (IMSI) in the clear where the configuration allows; honour and prefer operator identity-protection features; do not leak additional stable identifiers above the link that re-enable tracking once the temporary identifier rotates.
- **Integrator (network / operator):** Page with S-TMSI, never IMSI; rotate temporary identifiers (S-TMSI/GUTI) frequently to break the continuity a passive observer needs for tracking; minimise sensitive configuration broadcast in SIBs. These are the concrete fixes for the leakage Shaik et al. and LTrack demonstrate [shaik2016][kotuliak2022ltrack].
- **Operator / programme (defence-in-depth):** Treat the in-the-clear control plane as observable and plan accordingly, deploy false-base-station / cell-site-simulator monitoring (the LTE Wayfinder Attack-layer detectors, e.g. Crocodile Hunter / Rayhunter), and where the threat model warrants it, migrate to 5G. Per 3GPP TS 33.501, 5G conceals the permanent identifier (the SUPI) inside an ECIES-encrypted SUCI sent at initial registration, closing the headline IMSI-in-the-clear exposure that this control documents in LTE, but it does not by itself end all control-plane metadata leakage: paging, temporary-identifier and broadcast behaviour still warrant their own analysis.
