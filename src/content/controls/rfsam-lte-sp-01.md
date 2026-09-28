---
id: RFSAM-LTE-SP-01
title: 'Identify the operator, band and cell before capture'
protocol: LTE
layer: SP
criticality: info
applicability:
  - LTE
deferred: false
objective: >-
  Establish which operator, band, downlink EARFCN and Physical Cell ID (PCI) are
  present in the environment, and confirm each target cell falls inside the
  receiver's tuning and capture envelope, the spectrum-layer prerequisite that
  scopes every later LTE control.
intro: >-
  LTE lives in narrow licensed slices scattered from roughly 700 MHz to 2.6 GHz,
  and a carrier is 1.4 to 20 MHz wide. Before any capture is meaningful you must find
  the downlink carrier and read its centre frequency (EARFCN) and width, then
  identify the cell, operator (PLMN), band and PCI. This control records that
  operator/band/EARFCN/PCI inventory; it is an environmental baseline, not a
  device finding. Receiving broadcast information is passive, but anything that
  transmits is for authorised testing only.
prerequisites:
  hardware:
    - 'A receive SDR that covers the target band: HackRF One (1 MHz to 6 GHz, ~20 MHz IBW) or USRP B210/bladeRF 2.0 for wide carriers; an RTL-SDR Blog V4 reaches only the low bands (stops near 1.766 GHz, below the 1.8 to 2.6 GHz carriers)'
    - 'Optionally a commercial Qualcomm-based LTE modem (SIMCom SIM7600) with a valid/test SIM, for a no-SDR serving-cell read over AT commands'
  software:
    - 'gqrx for the live spectrum/waterfall view'
    - 'srsRAN 4G (srsue) for PSS/SSS cell search → PCI, MIB and SIB1 decode'
    - 'An AT terminal (and optionally QCSuper) for the modem route'
  signal:
    freq: 'Licensed cellular, common bands ~700 MHz to 2.6 GHz (full E-UTRA set ~450 MHz to 3.8 GHz); FDD and TDD'
    bandwidth: 'Six channel widths: 1.4, 3, 5, 10, 15, 20 MHz; the carrier is identified by its EARFCN'
    modulation: 'Downlink OFDMA, uplink SC-FDMA; QPSK/16/64/256-QAM; 10 ms frame → 10 subframes'
  skill: intermediate
attacks:
  - name: Fake base station / IMSI catcher reconnaissance
    refs:
      - shaik2016lte
    impact: >-
      The same passive identity reconnaissance, PCI, EARFCN, PLMN, TAC and the
      in-the-clear SIB configuration, is the first step an IMSI catcher or
      fake-eNodeB operator performs to mimic a legitimate cell and lure a target
      UE; reading it is observation, but it is also the attacker's setup phase.
    preconditions: >-
      LTE broadcast and synchronisation channels (PSS/SSS, PBCH, SIB1) are
      transmitted unprotected, so the cell identity and configuration are
      readable by any receiver in range without any credential.
    summary: >-
      Shaik et al. show that the unauthenticated broadcast/pre-authentication
      information this control inventories is exactly what enables low-cost fake
      base stations and LTE IMSI catchers.
references:
  - key: ts36211
    title: '3GPP TS 36.211: E-UTRA; Physical channels and modulation (PSS/SSS, PCI, OFDMA)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=2425'
    type: standard
  - key: ts36101
    title: '3GPP TS 36.101: E-UTRA; UE radio transmission and reception (operating bands, EARFCN)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=2411'
    type: standard
  - key: ts36331
    title: '3GPP TS 36.331: E-UTRA; Radio Resource Control (RRC) protocol (MIB, SIB1: PLMN, cell ID, TAC)'
    venue: 3GPP
    url: 'https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=2440'
    type: standard
  - key: shaik2016lte
    title: 'Practical Attacks Against Privacy and Availability in 4G/LTE Mobile Communication Systems'
    authors: 'A. Shaik, R. Borgaonkar, N. Asokan, V. Niemi, J.-P. Seifert'
    venue: NDSS 2016
    year: 2016
    url: 'https://arxiv.org/abs/1510.07563'
    type: paper
  - key: srsran4g
    title: 'srsRAN 4G: open-source SDR 4G suite (srsUE cell search, MIB/SIB receiver, MAC-LTE/RRC pcap)'
    authors: Software Radio Systems (SRS)
    venue: GitHub
    url: 'https://github.com/srsran/srsRAN_4G'
    type: tool
  - key: qcsuper
    title: 'QCSuper: capture raw 2G/3G/4G radio frames from Qualcomm modems via the Diag port'
    authors: P1 Security
    venue: GitHub
    url: 'https://github.com/P1sec/QCSuper'
    type: tool
tools:
  - gqrx
  - sim7600
  - srsran-4g
  - hackrf-one
  - rtl-sdr-v4
  - usrp-b210
bsam: []
resources:
  - RFSAM-RES-08
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

An LTE deployment is a grid of cells. Each cell transmits on a downlink carrier identified by its EARFCN (E-UTRA Absolute Radio Frequency Channel Number), and the EARFCN-to-frequency mapping and the set of operating bands are defined in 3GPP TS 36.101 [ts36101]. A carrier occupies one of six channel widths, 1.4, 3, 5, 10, 15 or 20 MHz, and the downlink is OFDMA, so on a waterfall it appears as a steady, flat "wall" of energy whose width tells you the channel bandwidth [ts36211]. Because the carrier sits in licensed spectrum, with the most common deployed bands scattered from roughly 700 MHz to 2.6 GHz (the full E-UTRA operating-band set defined in TS 36.101 extends wider still, from the ~450 MHz low bands up into the 3.x GHz range), which SDR can even tune it is a hard constraint: an RTL-SDR Blog V4 stops near 1.766 GHz and cannot reach the 1.8 to 2.6 GHz carriers, while a HackRF or USRP/bladeRF reaches the full set [ts36101].

Once the carrier is found, the cell identifies itself in the clear. The Primary and Secondary Synchronisation Signals (PSS/SSS) on the centre subcarriers give the Physical Cell ID: PSS yields N_ID(2) (0 to 2), SSS yields N_ID(1) (0 to 167), and PCI = 3·N_ID(1) + N_ID(2), so 504 PCIs (0 to 503) exist [ts36211]. The Master Information Block (MIB) on the PBCH then carries the system bandwidth and frame number, and System Information Block 1 (SIB1) carries the operator identity (PLMN = MCC+MNC), the cell identity and the Tracking Area Code (TAC) [ts36331]. None of this is encrypted, synchronisation, MIB and SIB are broadcast unprotected by design, so any receiver in range reads the cell's identity without a credential [ts36211][ts36331].

That same unprotected broadcast and pre-authentication information is what an attacker exploits: Shaik et al. demonstrate that low-cost fake base stations and LTE IMSI catchers begin by reading exactly this PCI/EARFCN/PLMN/SIB configuration so they can mimic a legitimate cell and lure a target UE [shaik2016lte]. Performing this inventory passively is therefore both the auditor's scoping step and a mirror of the attacker's reconnaissance phase. This control owns the spectrum-layer half, find the carrier and read the cell identity; the deeper control-channel and broadcast decode is the work of the LTE capture controls.

## Procedure

> Authorised testing only. Every step below is receive-only, you read what the
> network already broadcasts. Do not transmit on licensed cellular spectrum.

1. **Scope the candidate bands and confirm your radio reaches them.** Decide which bands are plausible for the operators in your region (for example B28/700 MHz, B20/800 MHz, B3/1800 MHz, B7/2.6 GHz). If you are using an RTL-SDR V4, restrict yourself to the low bands, it cannot tune the 1.8 to 2.6 GHz carriers [ts36101].

2. **Find the downlink carrier on a waterfall** with gqrx. Tune across the candidate band and look for the steady OFDM "wall":
   ```bash
   gqrx
   ```
   In the GUI, set the device to your SDR, tune to a candidate downlink centre and watch the waterfall. A live LTE downlink shows as a flat, continuous block; read its centre frequency and estimate its width (e.g. ~20 MHz). Record the centre frequency, this is the carrier you will map to an EARFCN [ts36211].

3. **Run a cell search to recover PCI, MIB and SIB1** with srsRAN's `srsue` against the carrier you found. Cell search synchronises on PSS/SSS to get the PCI, then decodes the MIB and SIB1:
   ```bash
   srsue --rat.eutra.dl_earfcn=<EARFCN> --phy.cfo_is_doppler=true ./ue.conf
   ```
   In the srsUE log you should see lines reporting the found cell, for example: `Found Cell:  PCI=<n>, PRB=<bandwidth>, Ports=<n>, CFO=...` followed by MIB decode (bandwidth, SFN) and, once attached/sniffing, SIB1 contents (PLMN, cell ID, TAC). A non-zero PCI and a decoded MIB confirm the carrier and identity [srsran4g][ts36211][ts36331].

4. **(No-SDR cross-check) Read the serving cell from a commercial modem.** A Qualcomm-based SIM7600 reports its serving cell over AT commands, the fastest way to confirm which cell a target is camped on:
   ```text
   AT+CPSI?
   ```
   Per the SIMCom AT command manual the LTE read returns `LTE,<Operation Mode>,<MCC>-<MNC>,<TAC>,<ScellID>,<PcellID>,<Frequency Band>,<earfcn>,<dlbw>,<ulbw>,...`, i.e. operator, Tracking Area Code, serving-cell ID, PCI, band and EARFCN on one line, e.g. `+CPSI: LTE,Online,<MCC>-<MNC>,0x<TAC>,<CellID>,<PCI>,EUTRAN-BAND<n>,<EARFCN>,...`. For a deeper, still-passive read of the broadcast/paging the modem already receives, stream its Diag port into Wireshark with QCSuper [qcsuper].

5. **Record the inventory.** For each cell, capture: operator (PLMN MCC-MNC), band, downlink EARFCN, PCI, system bandwidth and TAC. Mark which cells fall inside your SDR's tuning and instantaneous-bandwidth envelope, those are the sniffable targets that scope the later LTE capture controls (RFSAM-RES-08).

## Field case

A scan in Mexico surfaced 5 cells, 4 of them sniffable: Telcel on B4/B66/B5 and AT&T on B2, with real PCIs (58 / 287 / 301) and measured EARFCNs. Knowing operator, band and EARFCN is the prerequisite, without it, capture is aimed at nothing.

That inventory is exactly what the procedure above produces and what scopes the later LTE capture controls: one of those cells (the B4 Telcel cell, PCI 58) sits well inside a HackRF's tuning and instantaneous-bandwidth envelope, so it is a viable capture target; the AT&T B2 cell at ~1.9 GHz is reachable by a HackRF/USRP but not by an RTL-SDR V4. The full SIB1 fields for the PCI-58 cell, PLMN, cell ID, TAC, were [FILL: not captured to the report in this baseline; record from the srsUE SIB1 decode when reproducing].

## Remediation

This is an environmental baseline and target-selection step, not a device defect, the "weakness" it surfaces is inherent to LTE's unprotected broadcast design [ts36211][ts36331]. Layered guidance for what *can* be hardened:

- **Network operator**, you cannot encrypt PSS/SSS/MIB/SIB1, but you can minimise what the *clear* identifiers leak: prefer S-TMSI over IMSI on the paging channel and avoid IMSI paging where possible, and monitor for anomalous PCIs/EARFCNs/SIB configurations that indicate a fake cell mimicking your network [shaik2016lte]. Where the network supports it, enable false-base-station mitigations and consistency checks on broadcast information.

- **Device integrator**, select basebands/modems that implement fake-base-station detection and that resist downgrade/redirection driven from a rogue cell's broadcast; expose modem diagnostics (e.g. the Diag interface) only to authorised tooling, since the same passive read this control performs is also an attacker's reconnaissance feed [shaik2016lte].

- **Auditor / operator of the test**, keep this step strictly receive-only; do not transmit on licensed spectrum. Treat the operator/band/EARFCN/PCI inventory as scoping data for the assessment, and confirm each target cell is inside your receiver's tuning and bandwidth envelope before committing capture hardware (RFSAM-RES-08).
