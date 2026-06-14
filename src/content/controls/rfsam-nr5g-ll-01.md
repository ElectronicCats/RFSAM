---
id: RFSAM-NR5G-LL-01
title: Inventory identity and configuration exposed on the broadcast channels
protocol: NR5G
layer: LL
criticality: medium
applicability:
  - 5G NR
  - 5G Standalone (SA)
  - 5G Non-Standalone (NSA)
deferred: false
objective: >-
  Determine, from a purely passive capture, which identity and configuration
  data a 5G NR cell exposes on its broadcast channels — cell configuration from
  the MIB (PBCH) and SIB1 (PLMN, cell identity, TAC), and the form of the
  subscriber's long-term identifier on the air — and confirm whether the
  subscriber identity is concealed as a SUCI (and under which protection scheme)
  or sent effectively in the clear via the null-scheme.
intro: >-
  5G broadcasts its cell configuration (MIB, SIB1) in the clear, exactly as LTE
  does, but improves on the subscriber-identity exposure: the long-term identity
  (SUPI/IMSI) is concealed as a SUCI before it leaves the device. This control
  inventories what the broadcast channels actually expose — cell identity and
  tracking-area configuration that remain in the clear, and whether the SUCI is
  genuinely encrypted or falls back to the null-scheme that re-opens the
  LTE-style permanent-identity leak.
prerequisites:
  hardware:
    - 'A coherent, ideally GPSDO-disciplined SDR for clean CP-OFDM grid recovery: USRP B210 (preferred), bladeRF 2.0 micro, or SignalSDR Pro; FR1 sub-6 GHz only (FR2 mmWave ~24–52 GHz is out of reach of these tuners)'
    - 'Or, the no-SDR route: a Qualcomm-based 5G modem exposing the DIAG interface (e.g. Quectel RM500Q) with a registered/test SIM, read passively with QCSuper'
  software:
    - '5GSniffer (passive PDCCH/DCI blind decoder), or Sni5Gect (research MAC-NR over-the-air sniffer); srsRAN Project to stand up a controlled SA cell when no turnkey passive SA receiver exists; QCSuper for the modem DIAG route; Wireshark for MAC-NR / NGAP / NAS-5GS dissection'
  signal:
    freq: 'Licensed cellular FR1 ~410 MHz–7.125 GHz (common bands n1/2100, n3/1800, n78/3.5 GHz TDD, n28/700); the NR-ARFCN/band must be known first'
    bandwidth: 'Flexible numerology, subcarrier spacing 15·2^μ kHz (15/30/60/120 kHz); a carrier reaches up to 100 MHz in FR1, wider than a single HackRF (~20 MHz) or B210 (~56 MHz) view'
    modulation: 'CP-OFDM downlink and uplink (uplink may also use DFT-s-OFDM); QPSK/16/64/256-QAM. PSS/SSS in the SS/PBCH block (SSB) → PCI = 3·N_ID(1) + N_ID(2) (0–1007)'
  skill: advanced
attacks:
  - name: SUCI-catcher (null-scheme exposure and AKA-based linkability)
    refs:
      - chlosta2021suci
      - nist2026suci
    impact: >-
      Where the operator deploys the null-scheme (or has not provisioned the
      home-network public key), the SUPI/IMSI is transmitted effectively in the
      clear, reinstating an LTE-style permanent-identity harvest off the air.
      Even with proper ECIES concealment, captured SUCIs can be linked across
      sessions by abusing the AKA procedure, re-enabling targeted tracking.
    preconditions: >-
      Radio proximity and a receiver that recovers the grid and reads the
      registration exchange; the cleartext-SUPI case additionally requires the
      operator/SIM to be configured for the null-scheme or to lack the
      provisioned public key.
    summary: >-
      The SUCI conceals the permanent identity in the common case, but the
      null-scheme fallback exposes the SUPI in the clear and the AKA procedure
      still permits linkability — so a 5G "SUCI-catcher" remains possible under
      specific conditions.
  - name: Unauthenticated broadcast trust (fake-cell / pre-authentication surface)
    refs:
      - hussain2019reasoner
      - bitsikas2022pws
    impact: >-
      Because the MIB/SIB broadcast and pre-authentication RRC/NAS messages carry
      no source authentication, a UE has no way to validate the configuration it
      reads on first contact — the foundation a rogue gNB stands on to drive
      registration/identity exchanges, downgrades, and warning-message
      spoofing/suppression.
    preconditions: >-
      The active exploitation belongs to the Attack layer and requires
      transmitting; this control only reads the unauthenticated broadcast to
      document the exposed surface it creates.
    summary: >-
      The broadcast configuration this control reads is unauthenticated by
      design; the same property is what makes the documented 5G pre-auth /
      fake-cell and PWS attacks feasible.
references:
  - key: nist2026suci
    title: 'Protecting Subscriber Identifiers with Subscription Concealed Identifier (SUCI): Applying 5G Cybersecurity and Privacy Capabilities'
    authors: NIST NCCoE 5G Cybersecurity project
    venue: 'NIST Cybersecurity White Paper (CSWP) 36A'
    year: 2026
    url: 'https://www.nist.gov/publications/protecting-subscriber-identifiers-subscription-concealed-identifier-suci-applying-5g'
    type: standard
  - key: chlosta2021suci
    title: '5G SUCI-Catchers: Still catching them all?'
    authors: 'M. Chlosta, D. Rupprecht, C. Pöpper, T. Holz'
    venue: ACM WiSec 2021
    year: 2021
    url: 'https://informatik.rub.de/veroeffentlichungenbkp/syssec/veroeffentlichungen/2021/pdfs/2021_5G_SUCI_Catchers__Still_catching_them_all_.pdf'
    type: paper
  - key: hussain2019reasoner
    title: '5GReasoner: A Property-Directed Security and Privacy Analysis Framework for 5G Cellular Network Protocol'
    authors: 'S. R. Hussain, M. Echeverria, I. Karim, O. Chowdhury, E. Bertino'
    venue: ACM CCS 2019
    year: 2019
    url: 'https://syed-rafiul-hussain.github.io/wp-content/uploads/2019/10/5GReasoner.pdf'
    type: paper
  - key: bitsikas2022pws
    title: "You have been warned: Abusing 5G's Warning and Emergency Systems"
    authors: 'E. Bitsikas, C. Pöpper'
    venue: ACSAC 2022
    year: 2022
    url: 'https://arxiv.org/abs/2207.02506'
    type: paper
  - key: 5gsniffer-repo
    title: '5GSniffer — open-source 5G NR PDCCH blind decoder (source)'
    authors: Sprite Lab (Northeastern University)
    venue: GitHub
    year: 2023
    url: 'https://github.com/spritelab/5GSniffer'
    type: tool
  - key: sni5gect-repo
    title: 'Sni5Gect — 5G NR sniffing and (downlink) injection framework (source)'
    authors: ASSET Research Group (SUTD)
    venue: GitHub
    year: 2024
    url: 'https://github.com/asset-group/Sni5Gect-5GNR-sniffing-and-exploitation'
    type: tool
tools:
  - 5gsniffer
  - sni5gect
  - srsran-project
  - qcsuper
  - wireshark
  - usrp-b210
bsam: []
resources:
  - RFSAM-RES-22
  - RFSAM-RES-09
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

5G NR carries everything on a CP-OFDM resource grid with flexible numerology (subcarrier spacing 15·2^μ kHz, a FR1 carrier up to 100 MHz wide; this control inherits those signal facts from the NR5G Wayfinder). Cell search starts at the **SS/PBCH block (SSB)**: PSS gives N_ID(2) (0–2), SSS gives N_ID(1) (0–335), and the Physical Cell ID is `PCI = 3·N_ID(1) + N_ID(2)` → 1008 IDs (0–1007). The **MIB**, carried on PBCH inside the SSB, gives the SFN, the SSB position and the SIB1 scheduling; **SIB1**, carried on PDSCH, gives the PLMN (MCC+MNC, i.e. the operator), the cell identity, the Tracking Area Code (TAC) and access information. As in LTE, these broadcast messages are sent in the clear — no confidentiality, integrity or source authentication — so a passive receiver that has recovered the grid reads the cell's full identity and configuration without ever transmitting.

The headline 5G improvement is at the subscriber-identity exposure, and it is the core of this control. In LTE the permanent identity (IMSI) could be harvested in the clear off the air; 5G conceals the long-term identity (SUPI) as a **SUCI** before it leaves the device, using ECIES public-key encryption against the home operator's public key, so only the operator's core can recover the permanent identity [nist2026suci]. 3GPP standardises three protection schemes: **Profile A** (Curve25519) and **Profile B** (secp256r1), both with AES-128-CTR and HMAC-SHA-256, and a **null-scheme** that performs no encryption at all [nist2026suci]. The null-scheme is used when the home network is configured to use it or has not provisioned the public key the UE needs to compute a SUCI — in which case the SUPI (the IMSI's MSIN) is transmitted effectively in the clear, reinstating the LTE-style permanent-identity leak. NIST's guidance is explicit that operators should enable SUCI and configure it with a non-null encryption scheme [nist2026suci]; verifying which scheme is actually in use on the air is exactly what this control checks.

Concealment is necessary but not sufficient. Chlosta et al. show a practical **5G SUCI-catcher** in a standalone network: beyond the null-scheme case, even properly ECIES-concealed SUCIs can be **linked across sessions** by abusing the Authentication and Key Agreement (AKA) procedure, so an attacker can still confirm and track a target between encounters without ever recovering the cleartext SUPI [chlosta2021suci]. Separately, the broadcast and pre-authentication messages this control reads are **unauthenticated by design** — there is no source authentication on the MIB/SIB or on pre-auth RRC/NAS — which is the property that underpins the documented 5G fake-cell and protocol-flaw surface (5GReasoner's model-checking found new NAS/RRC design weaknesses including identity and tracking exposure [hussain2019reasoner], and the PWS work shows unauthenticated 5G warning broadcasts can be spoofed or suppressed [bitsikas2022pws]). Those active attacks belong to the Attack layer and require transmitting; here we only read the broadcast to inventory the exposure they build on.

The passive view is bounded the same way LTE's is. 5G-AKA derives the air-interface ciphering and integrity keys (NEA/NIA: SNOW 3G / AES / ZUC) from the secret on the USIM, shared only with the operator's core, so a passive capture yields no session key and no user-plane content — there is no weak-pairing shortcut. What passive decode yields is **configuration and identity-form exposure**: the cell's PLMN/identity/TAC, the PCI, and crucially *which* identity protection scheme the SUCI uses. Note also that passive 5G NR air-sniffing is markedly less mature than LTE — there is no drop-in passive SA receiver equivalent to srsUE's LTE cell search — so the practical routes (below) are a research PDCCH/MAC sniffer on a real cell, a controlled cell you stand up yourself, or the modem DIAG capture.

## Procedure

> Authorised testing only. The passive read steps below do not transmit, but you are receiving on licensed cellular spectrum — do so in line with local law and your engagement scope. Any step that stands up a cell (Step 2, alternative B) transmits in licensed spectrum and must be done on your own equipment, with a test SIM, inside RF shielding, under an authorised test licence — never radiate on a live operator's band.

1. **Confirm the target carrier first.** You must already know the band/NR-ARFCN and bandwidth (see RFSAM-RES-22 for the cellular identify-and-capture flow, and RFSAM-RES-09 for the disciplined-clock capture that OFDM grid recovery requires). Sanity-check on a waterfall that you are looking at a 5G downlink carrier and its SSB:
   ```bash
   gqrx
   ```
   Expected: a flat-topped CP-OFDM carrier (up to 100 MHz wide in FR1, so a single HackRF/B210 view shows only a slice — enough to locate the SSB) centred on the NR-ARFCN frequency. Note the centre frequency and the SSB.

2. **Recover the cell and read its broadcast identity.** Two routes — pick one:

   **(A) No-SDR modem route (fastest, fully passive).** Pull the serving cell's signalling off a Qualcomm modem's DIAG interface into Wireshark:
   ```bash
   ./qcsuper.py --usb-modem /dev/ttyUSB0 --wireshark-live
   ```
   Expected: a live GSMTAP PCAP in Wireshark; the modem reports the serving cell (band, NR-ARFCN, PLMN, cell identity) and the registration signalling. (5G frame support is modem/firmware-dependent.)

   **(B) Controlled-cell route, for studying cell search where no turnkey passive SA receiver exists.** Stand up your own SA gNB on an SDR with srsRAN Project behind a 5G core (Open5GS/free5GC) and a test UE, then read the SSB/MIB/SIB1 and NGAP end-to-end. (Radiates — authorised, RF-contained use only; the srsRAN_Project repo is archived, so take current builds from srsran.com.)

3. **Read the clear-text cell configuration** in Wireshark from whichever capture Step 2 produced. Filter `nr-rrc.SIB1` (and `nr-rrc.BCCH_BCH_Message` for the MIB). Expected: SIB1 shows the **PLMN (MCC+MNC = operator)**, the **cell identity** and the **TAC** — all in the clear, no decryption performed. Record them as the cell-configuration exposure.

4. **Observe the registration exchange and inventory the subscriber-identity form.** In the same capture, filter the NAS-5GS registration request (`nas-5gs.mm.type_id` / the Registration Request message) and inspect the **mobile identity IE**. Expected: a **SUCI** (the 5G-GUTI is used on re-registration; a fresh registration carries the SUCI). Read the SUCI's **Protection Scheme Identifier**:
   - `0` = **null-scheme** → the MSIN (the SUPI/IMSI body) is in the clear: a reportable permanent-identity exposure [nist2026suci][chlosta2021suci].
   - `1`/`2` = **Profile A / Profile B** → ECIES-concealed; the permanent identity is not recoverable from the capture, but record that SUCIs are still **linkable via the AKA procedure** [chlosta2021suci].
   This protection-scheme value is the headline finding of the control.

5. **(Optional) Passive control-channel view** with 5GSniffer to enumerate active RNTIs/DCIs from the PDCCH (a scheduling/activity inventory, FR1 FDD, research-grade — the current release recommends working from a recorded I/Q file):
   ```bash
   ./5g_sniffer config.toml
   ```
   Expected: a running list of decoded DCIs and the RNTIs active in the cell [5gsniffer-repo]. Sni5Gect gives an over-the-air MAC-NR view in Wireshark if you have the heavier USRP/host setup [sni5gect-repo].

6. **Inventory the result.** Record, as the control's finding, exactly what was recoverable purely passively: the cell PLMN/identity/TAC and PCI (broadcast, in the clear); and — the decisive item — whether the subscriber identity was concealed as a SUCI under Profile A/B (permanent identity protected, but linkable) or fell back to the **null-scheme** (permanent identity effectively in the clear). A null-scheme deployment is the headline exposure; a Profile A/B deployment downgrades the finding to configuration/metadata exposure plus AKA-linkability.

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative, reproducible procedure against an **authorised test cell** (your own srsRAN Project + Open5GS SA lab on a test NR-ARFCN inside RF shielding, or your own live subscription captured with operator permission via the QCSuper modem route), not a record of a measured engagement. No specific measured field finding is asserted below; every measured value is a `[FILL: …]` placeholder you replace with what you actually read off your own authorised capture.

- Step 1–2 located the n78 carrier and SSB and produced a Wireshark capture; the cell reported `PCI=[FILL: measured PCI]`.
- Step 3 read SIB1 in the clear: PLMN `[FILL: measured MCC-MNC]`, cell identity `[FILL: measured NCI]`, TAC `[FILL: measured TAC]` — no decryption performed.
- Step 4 inspected the NAS-5GS Registration Request mobile-identity IE and read the SUCI Protection Scheme Identifier as `[FILL: measured scheme id 0/1/2]`. In this lab the core was configured for `[FILL: null-scheme or Profile A/B]`:
  - If `[FILL: …]` = null-scheme, the MSIN `[FILL: measured/omit]` was visible in the clear — an LTE-style permanent-identity exposure that this control exists to catch [nist2026suci][chlosta2021suci].
  - If `[FILL: …]` = Profile A/B, the permanent identity was not recoverable; the reportable exposure is the in-the-clear cell configuration plus the documented AKA-based SUCI linkability [chlosta2021suci].

## Remediation

This is largely a standards/operator concern: in-the-clear broadcast configuration is inherent to the 5G air interface, so for most assessments the control *documents the exposure*; the one device/operator-actionable item is the SUCI protection scheme. Layered guidance:

- **Developer (UE / modem / SIM personalisation):** Ensure the USIM is provisioned with the home-network public key and a non-null protection scheme so the UE actually computes an ECIES-concealed SUCI; do not leak additional stable identifiers above the link that re-enable tracking once the 5G-GUTI rotates.
- **Integrator (network / operator):** Enable SUCI and configure it with a **non-null** encryption cipher scheme (Profile A or B) — the explicit NIST recommendation [nist2026suci]; provision the home-network public key on subscriber SIMs; rotate the 5G-GUTI frequently to break the continuity a passive observer needs for tracking; minimise sensitive configuration broadcast in SIBs.
- **Operator / programme (defence-in-depth):** Treat the in-the-clear, unauthenticated broadcast as observable and plan accordingly — note that even with a non-null SUCI, captured identifiers remain linkable via the AKA procedure [chlosta2021suci], and that the unauthenticated broadcast/pre-auth surface is what underpins the documented fake-cell and PWS attacks [hussain2019reasoner][bitsikas2022pws]; deploy false-base-station / cell-site-simulator monitoring where the threat model warrants it.
