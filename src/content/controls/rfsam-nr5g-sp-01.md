---
id: RFSAM-NR5G-SP-01
title: Identify and capture the target 5G NR cell
protocol: NR5G
layer: SP
criticality: info
applicability:
  - 5G NR
  - 5G SA
  - 5G NSA
deferred: false
objective: >-
  Establish which operator (PLMN), band, NR-ARFCN and Physical Cell ID (PCI) a
  target 5G NR cell presents, confirm whether it is Standalone or Non-Standalone,
  and verify the cell falls inside the receiver's tuning and instantaneous-bandwidth
  envelope — the spectrum-layer prerequisite that scopes every later 5G NR control.
intro: >-
  5G NR FR1 lives in licensed slices scattered from roughly 700 MHz to 3.8 GHz,
  and a single carrier can be up to 100 MHz wide — wider than any LTE channel and
  wider than a single HackRF or B210 view. Before any capture is meaningful you
  must find the downlink carrier, read its centre frequency (NR-ARFCN) and width on
  a waterfall, then read the cell identity (PCI, PLMN, TAC) that 5G broadcasts in
  the clear. This control records that operator/band/NR-ARFCN/PCI inventory; it is
  an environmental baseline, not a device finding. Receiving broadcast information
  is passive, but anything that transmits is for authorised testing only.
prerequisites:
  hardware:
    - 'A receive SDR that covers the target FR1 band: HackRF One (1 MHz–6 GHz, ~20 MHz IBW), or a USRP B210 / bladeRF 2.0 micro / SignalSDR Pro for wider carriers and a steadier (GPSDO-disciplined) reference'
    - 'Optionally a Qualcomm-based 5G modem (Quectel RM500Q) or rooted Qualcomm phone exposing the DIAG port, with a registered/test SIM, for a no-SDR serving-cell read'
  software:
    - 'gqrx for the live spectrum / waterfall view (sub-6 GHz only)'
    - 'QCSuper for the modem DIAG → GSMTAP → Wireshark serving-cell read'
  signal:
    freq: >-
      Licensed cellular FR1 ~410 MHz–7.125 GHz (common bands n28/700, n1/2100,
      n3/1800, n78/3.3–3.8 GHz TDD); FR2 mmWave ~24.25–52.6 GHz is out of reach of
      common SDRs. Carrier identified by its NR-ARFCN
    bandwidth: >-
      Flexible numerology, subcarrier spacing 15·2^μ kHz (15/30/60/120 kHz); a
      carrier reaches up to 100 MHz in FR1 (400 MHz in FR2)
    modulation: 'CP-OFDM downlink and uplink (uplink can also use DFT-s-OFDM); QPSK/16/64/256-QAM'
  skill: intermediate
attacks:
  - name: Fake gNB / SUCI-catcher pre-authentication reconnaissance
    refs:
      - borgaonkar2019aka
      - hussain2019reasoner
    impact: >-
      The same passive, in-the-clear cell information this control inventories —
      PCI, NR-ARFCN, PLMN, TAC and the SIB configuration — is the reconnaissance an
      attacker performs to stand up a rogue gNB that mimics a legitimate cell and
      lure a target UE into the pre-authentication NAS/RRC exchange, where AKA
      activity-monitoring and other pre-auth weaknesses live.
    preconditions: >-
      5G NR synchronisation and broadcast channels (PSS/SSS in the SSB, MIB on
      PBCH, SIB1) are transmitted unprotected, so cell identity and configuration
      are readable by any receiver in range without any credential.
    summary: >-
      Reading the unauthenticated broadcast/pre-authentication information is both
      the auditor's scoping step and the first step of a fake-gNB operator; 5G
      conceals the long-term identity as a SUCI, but the AKA sequence-number
      side-channel and pre-auth RRC/NAS surface remain documented threats.
references:
  - key: ts38211
    title: '3GPP TS 38.211 — NR; Physical channels and modulation (PSS/SSS, SSB, PCI, CP-OFDM, numerology)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3213'
    type: standard
  - key: ts38101
    title: '3GPP TS 38.101-1 — NR; UE radio transmission and reception; Part 1: Range 1 Standalone (operating bands, NR-ARFCN, channel bandwidths)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3283'
    type: standard
  - key: ts38331
    title: '3GPP TS 38.331 — NR; Radio Resource Control (RRC); Protocol specification (MIB, SIB1: PLMN, cell identity, TAC)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3197'
    type: standard
  - key: borgaonkar2019aka
    title: 'New Privacy Threat on 3G, 4G, and Upcoming 5G AKA Protocols'
    authors: 'R. Borgaonkar, L. Hirschi, S. Park, A. Shaik'
    venue: 'Proceedings on Privacy Enhancing Technologies (PoPETs) 2019(3)'
    year: 2019
    url: 'https://petsymposium.org/popets/2019/popets-2019-0039.php'
    type: paper
  - key: hussain2019reasoner
    title: '5GReasoner: A Property-Directed Security and Privacy Analysis Framework for 5G Cellular Network Protocol'
    authors: 'S. R. Hussain, M. Echeverria, I. Karim, O. Chowdhury, E. Bertino'
    venue: ACM CCS 2019
    year: 2019
    url: 'https://dl.acm.org/doi/10.1145/3319535.3354263'
    type: paper
  - key: gqrx
    title: 'gqrx — software-defined radio receiver (GNU Radio + Qt) for spectrum/waterfall view'
    authors: A. Csete (OZ9AEC) et al.
    venue: GitHub
    url: 'https://github.com/gqrx-sdr/gqrx'
    type: tool
  - key: qcsuper
    title: 'QCSuper — capture raw 2G/3G/4G/5G radio frames from Qualcomm modems via the DIAG port (GSMTAP → Wireshark)'
    authors: P1 Security
    venue: GitHub
    url: 'https://github.com/P1sec/QCSuper'
    type: tool
tools:
  - gqrx
  - qcsuper
  - hackrf-one
  - usrp-b210
  - bladerf-2-micro
  - signalsdr-pro
  - quectel-rm500q
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-22
  - RFSAM-RES-09
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A 5G NR deployment is a grid of cells. Each cell transmits a downlink carrier identified by its NR-ARFCN, and the NR-ARFCN-to-frequency mapping and the set of FR1 operating bands are defined in 3GPP TS 38.101-1 [ts38101]. Unlike LTE's fixed channel grid, NR uses flexible numerology — subcarrier spacing 15·2^μ kHz (15/30/60/120 kHz) — and a single FR1 carrier can be up to 100 MHz wide [ts38211][ts38101]. Because the downlink is CP-OFDM, on a waterfall a live carrier appears as a steady, flat "wall" of energy whose width indicates the channel bandwidth [ts38211]. Which SDR can even tune it is a hard constraint: common SDR tuners stop near 6 GHz, so FR1 (410 MHz–7.125 GHz) is reachable but FR2 mmWave (24.25–52.6 GHz) is not — confirming an FR2 cell needs a mmWave front-end or a commercial scanner, not the SDRs in this kit. These FR1/FR2 spans are the 3GPP TS 38.101-1 / TS 38.101-2 range definitions; the common-band designations used here (n28/700, n1/2100, n3/1800, n78/3.3–3.8 GHz TDD) match the published operating-band tables, though precise per-band channel edges vary by region and operator licence and should be reconciled against the current TS 38.101-1 band table for a given market [ts38101].

Once the carrier is found, the cell identifies itself in the clear. Cell search synchronises on the SS/PBCH block (SSB): the Primary Synchronisation Signal (PSS) gives N_ID(2) (0–2) and the Secondary Synchronisation Signal (SSS) gives N_ID(1) (0–335), so the Physical Cell ID PCI = 3·N_ID(1) + N_ID(2), yielding 1008 PCIs (0–1007) — twice LTE's 504 [ts38211]. The Master Information Block (MIB) on the PBCH inside the SSB carries the SFN, the SSB position and the SIB1 scheduling; System Information Block 1 (SIB1), carried on the PDSCH, carries the operator identity (PLMN = MCC+MNC), the cell identity, the Tracking Area Code (TAC) and access information [ts38331]. None of this is encrypted — synchronisation, MIB and SIB1 are broadcast unprotected by design, exactly as in LTE, so any receiver in range reads the cell's identity without a credential [ts38211][ts38331].

Whether there is a 5G core to talk to at all is part of this baseline: a Standalone (SA) cell pairs 5G NR with a 5G core (AMF/SMF/UPF), while a Non-Standalone (NSA) cell is a 5G NR carrier anchored to an LTE eNB + EPC, so the control plane still rides LTE. That same unprotected broadcast and pre-authentication information is what an attacker exploits: a rogue gNB begins by reading this PCI/NR-ARFCN/PLMN/SIB configuration so it can mimic a legitimate cell and lure a target UE into the pre-authentication NAS/RRC exchange, where 5GReasoner documents control-plane weaknesses [hussain2019reasoner]. 5G is a genuine improvement over LTE here — the long-term identity (SUPI/IMSI) is concealed as a SUCI using the home network's public key (ECIES), closing the LTE-style cleartext-IMSI harvest off the air — but the concealment is not total: Borgaonkar et al. show a sequence-number side-channel in the AKA protocol (3G/4G/5G) that still enables subscriber-activity monitoring [borgaonkar2019aka]. Performing this inventory passively is therefore both the auditor's scoping step and a mirror of the attacker's reconnaissance phase. This control owns the spectrum-layer half — find the carrier and read the cell identity; the deeper, research-grade passive control-channel decode is the work of the later 5G NR capture controls.

## Procedure

> Authorised testing only. Every step below is receive-only — you read what the
> network already broadcasts. Do not transmit on licensed cellular spectrum.

1. **Scope the candidate bands and confirm your radio reaches them.** Decide which bands are plausible for the operators in your region (for example n28/700 MHz, n3/1800 MHz, n1/2100 MHz, n78/3.3–3.8 GHz TDD). Confirm your SDR tunes them: a HackRF/B210/bladeRF/SignalSDR reaches FR1, but none reach FR2 mmWave (~24–52 GHz) [ts38101]. A 100 MHz n78 carrier exceeds a single HackRF view (~20 MHz) and a B210 view (~56 MHz) — you will see a slice, enough to locate the SSB, not the whole carrier.

2. **Find the downlink carrier on a waterfall** with gqrx. Tune across the candidate band and look for the steady CP-OFDM "wall":
   ```bash
   gqrx
   ```
   In the GUI, set the device to your SDR, tune to a candidate downlink centre and watch the waterfall. A live 5G NR downlink shows as a flat, continuous block; read its centre frequency and estimate its width (e.g. a ~100 MHz n78 carrier will overflow a single narrow view). Record the centre frequency — this is the carrier you will map to an NR-ARFCN [ts38211][gqrx]. Note that gqrx is sub-6 GHz only; FR2 cannot be confirmed this way.

3. **(No-SDR cross-check) Read the serving cell from a Qualcomm 5G modem** over its DIAG interface with QCSuper, the fastest way to confirm which cell a target UE is camped on and read its identity before committing capture hardware. QCSuper pulls the raw radio frames the modem already receives, wraps them in GSMTAP and streams a live PCAP into Wireshark — passive, it reads what the modem receives:
   ```bash
   QCSuper.py --usb-modem /dev/ttyUSB0 --wireshark-live
   ```
   In Wireshark, filter on the 5G NR RRC frames and read the broadcast: the SIB1 carries the PLMN (MCC-MNC), cell identity and TAC, and the SSB/MIB carries the PCI and SFN — confirming operator, band and cell identity from a route that needs no SDR cell-search to get right [qcsuper][ts38331]. 5G frame support is modem/firmware-dependent (e.g. a Quectel RM500Q), so verify your modem reports NR before relying on this route.

4. **Determine SA vs NSA.** From the modem read (or from the SIB content), establish whether the cell is Standalone (its own 5G core; NR RRC/NAS-5GS) or Non-Standalone (5G NR carrier anchored to an LTE eNB, control plane on LTE). This decides whether there is a 5G core to interact with in later controls.

5. **Record the inventory.** For each cell, capture: operator (PLMN MCC-MNC), band, downlink NR-ARFCN, PCI, numerology/bandwidth, TAC and SA/NSA mode. Mark which cells fall inside your SDR's tuning and instantaneous-bandwidth envelope — those are the sniffable targets that scope the later 5G NR capture controls. For the full identify-then-capture flow on a disciplined reference, see RFSAM-RES-22, RFSAM-RES-09 and RFSAM-RES-01.

## Field case

Illustrative walkthrough — substitute the values you capture. No measured 5G NR
field capture backs this example; it is a representative reconstruction of running
the procedure, with every cell-specific value left as a `[FILL: ...]` placeholder to
be recorded when the procedure is reproduced against a real cell. It is not a
measured finding.

A representative walk-through against an n78 (3.5 GHz TDD) cell: gqrx, fed from a USRP B210, showed a wide CP-OFDM downlink "wall" near 3.5 GHz whose width plainly exceeded the ~56 MHz B210 view — consistent with a 100 MHz n78 carrier of which only a slice is visible, enough to locate the SSB. The carrier centre was [FILL: record the measured centre frequency and map it to the NR-ARFCN]. A Quectel RM500Q on the same bench, read over its DIAG port with QCSuper into Wireshark, independently reported the serving cell: PLMN [FILL: MCC-MNC], PCI [FILL: 0–1007], TAC [FILL: ...], band n78, and mode [FILL: SA or NSA]. Confirming operator, band, NR-ARFCN and PCI from two routes — the SDR waterfall and the modem DIAG read — is the prerequisite; without it, capture is aimed at nothing. FR2 mmWave cells, if any operate in the area, could not be checked: the SDRs in this kit stop at 6 GHz [ts38101].

## Remediation

This is an environmental baseline and target-selection step, not a device defect — the "weakness" it surfaces is inherent to 5G NR's unprotected broadcast design, the same as LTE [ts38211][ts38331]. Layered guidance for what *can* be hardened:

- **Network operator** — you cannot encrypt PSS/SSS/SSB/MIB/SIB1, but you can minimise what the *clear* broadcast leaks and exploit 5G's improvements: ensure subscriber identity is sent only as a SUCI and never falls back to a cleartext SUPI/IMSI, deploy the network-side false-base-station detection and broadcast-consistency measures defined for 5G, and monitor for anomalous PCIs/NR-ARFCNs/SIB configurations that indicate a rogue gNB mimicking your network [hussain2019reasoner][borgaonkar2019aka].

- **Device integrator** — select 5G basebands/modems that implement fake-base-station and downgrade detection, that resist being lured into a rogue cell's pre-authentication NAS/RRC exchange, and that do not leak device capabilities or activity patterns pre-authentication [hussain2019reasoner][borgaonkar2019aka]; expose modem diagnostics (the DIAG interface) only to authorised tooling, since the same passive read this control performs is also an attacker's reconnaissance feed.

- **Auditor / operator of the test** — keep this step strictly receive-only; do not transmit on licensed spectrum. Treat the operator/band/NR-ARFCN/PCI/SA-NSA inventory as scoping data for the assessment, and confirm each target cell is inside your receiver's tuning and bandwidth envelope (and within FR1, not FR2) before committing capture hardware (RFSAM-RES-22, RFSAM-RES-09).
