---
id: RFSAM-LTE-PHY-01
title: Recover the LTE resource grid with coherent capture
protocol: LTE
layer: PHY
criticality: info
applicability:
  - LTE
deferred: false
objective: >-
  Verify that the SDR capture chain is coherent enough to synchronise on
  PSS/SSS, lock the physical cell ID, and demodulate the OFDM resource grid
  (PBCH/MIB and the control region) before any higher-layer LTE analysis.
intro: >-
  LTE's downlink OFDMA physical layer is the wall that stops naive capture:
  six selectable channel widths up to 1200 subcarriers, a cyclic prefix, and
  tight symbol/frame timing. This control verifies the receiver can synchronise
  on the synchronisation signals and recover the resource grid cleanly — the
  prerequisite for reading the broadcast/control channels at the Link layer.
prerequisites:
  hardware:
    - 'A wide-band SDR that can sample a full LTE carrier: USRP B210 (GPSDO option recommended), bladeRF 2.0 micro, SignalSDR Pro, or HackRF One. RTL-SDR reaches only the low bands (stops near 1.766 GHz).'
  software:
    - 'srsRAN 4G (cell_search and pdsch_ue example apps), LTESniffer, FALCON, or gr-lte; gqrx for the initial waterfall'
  signal:
    freq: 'Licensed cellular, ~700 MHz–2.6 GHz (full E-UTRA ~450 MHz–3.8 GHz); carrier identified by EARFCN; FDD and TDD'
    bandwidth: 'One of 1.4, 3, 5, 10, 15, 20 MHz'
    modulation: 'Downlink OFDMA, QPSK/16/64/256-QAM; 10 ms frame → 10 subframes (1 ms) → 2 slots (0.5 ms)'
  skill: advanced
attacks: []
references:
  - key: ts36211
    title: 'ETSI TS 136 211 (3GPP TS 36.211): E-UTRA; Physical channels and modulation (V14.14.0)'
    authors: 3GPP / ETSI
    venue: ETSI / 3GPP
    year: 2020
    url: 'https://www.etsi.org/deliver/etsi_ts/136200_136299/136211/14.14.00_60/ts_136211v141400p.pdf'
    type: standard
  - key: bui2016owl
    title: 'OWL: a Reliable Online Watcher for LTE Control Channel Measurements'
    authors: N. Bui, J. Widmer
    venue: ACM All Things Cellular (ATC) 2016
    year: 2016
    url: 'https://arxiv.org/abs/1606.00202'
    type: paper
  - key: falkenberg2019falcon
    title: 'FALCON: An Accurate Real-Time Monitor for Client-Based Mobile Network Data Analytics'
    authors: R. Falkenberg, C. Wietfeld
    venue: IEEE GLOBECOM 2019
    year: 2019
    url: 'https://arxiv.org/abs/1907.10110'
    type: paper
  - key: hoang2023ltesniffer
    title: 'LTESniffer: An Open-source LTE Downlink/Uplink Eavesdropper'
    authors: 'T. D. Hoang, C. Park, M. Son, T. Oh, S. Bae, J. Ahn, B. Oh, Y. Kim'
    venue: ACM WiSec 2023
    year: 2023
    url: 'https://doi.org/10.1145/3558482.3590196'
    type: paper
  - key: srsran4g
    title: srsRAN 4G — open-source SDR 4G suite (srsUE cell_search / pdsch_ue)
    authors: Software Radio Systems
    venue: GitHub
    year: 2024
    url: 'https://github.com/srsran/srsRAN_4G'
    type: tool
  - key: grlte
    title: gr-lte — GNU Radio LTE receiver flowgraph (sync, channel estimation, PBCH)
    authors: KIT Communications Engineering Lab
    venue: GitHub
    year: 2020
    url: 'https://github.com/kit-cel/gr-lte'
    type: tool
tools:
  - usrp-b210
  - srsran-4g
  - ltesniffer
  - falcon
  - gr-lte
  - gqrx
  - hackrf-one
bsam: []
resources:
  - RFSAM-RES-08
  - RFSAM-RES-09
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

The LTE downlink is OFDMA: the carrier is divided into 15 kHz subcarriers grouped into resource blocks of 12 subcarriers, and a symbol plus its cyclic prefix occupies the time–frequency *resource grid*. A 20 MHz carrier carries 100 resource blocks (1200 subcarriers); the smallest, 1.4 MHz, carries 6 (72 subcarriers). Time is structured as a 10 ms radio frame of ten 1 ms subframes, each two 0.5 ms slots [[ts36211]]. Recovering anything above the antenna therefore means first reconstructing this grid — which is exactly where capture coherence matters: a free-running SDR clock drifts in frequency and time, rotating and smearing the QAM constellation on each subcarrier until the grid is unreadable. A disciplined reference (a GPSDO or equivalent) supplies the stable frequency/timing that keeps the subcarriers aligned (RFSAM-RES-09).

Synchronisation is bootstrapped from two signals the cell always transmits in the centre 62 subcarriers, independent of bandwidth. The Primary Synchronisation Signal (PSS) gives symbol timing and N_ID(2) ∈ {0,1,2}; the Secondary Synchronisation Signal (SSS) gives N_ID(1) ∈ {0..167} and frame timing. The Physical Cell ID is then PCI = 3·N_ID(1) + N_ID(2), one of 504 values [[ts36211]]. Once PSS/SSS are locked, the Physical Broadcast Channel (PBCH) around the centre carries the Master Information Block (MIB), which states the system bandwidth, PHICH configuration, and the System Frame Number — the bandwidth value is what tells the receiver how wide the rest of the grid actually is [[ts36211]]. With bandwidth known, the control region (PDCCH) and shared channel (PDSCH) of each subframe can be demapped.

The open-source LTE-receiver lineage establishes that this full chain — PSS/SSS sync, PCI, MIB on PBCH, then blind PDCCH and PDSCH decode — is reproducible on commodity SDRs, and that decode reliability is gated by capture quality and clock discipline rather than by any secret. OWL grounds reliable control-channel decoding on information from the random-access procedure and reports decoding the resource grid in over 99% of frames on inexpensive SDR hardware [[bui2016owl]]. FALCON blind-decodes the whole PDCCH (the DCI/RNTI scheduling grants in the cell) in real time and is an alternative to OWL that is less sensitive to non-ideal radio conditions [[falkenberg2019falcon]]. LTESniffer chains PDCCH → PDSCH/PUSCH to passively recover downlink and uplink scheduling and traffic, and documents that uplink capture across two USRP B-series units requires a GPSDO for inter-unit synchronisation — concrete evidence that grid recovery is coherence-bound [[hoang2023ltesniffer]]. This control verifies only the capture-feasibility prerequisite (sync + grid recovery); it is observational and reads what the network already broadcasts, so its criticality is `info`. Reading the broadcast/control information itself, and any active step, belong to the Link and Attack layers.

## Procedure

All steps below are passive reception only. LTE is licensed spectrum: receiving a downlink is generally permissible, but treat local regulation as authoritative, and never transmit on an operator's band — any active step (rogue cell, identity request) is a separate Attack-layer control and is for authorised testing on your own equipment in RF containment.

1. **Confirm a disciplined reference and a healthy receiver.** Lock the SDR to its GPSDO (or an external 10 MHz reference) and confirm it initialises before relying on the capture (RFSAM-RES-09). With UHD/USRP:
   ```bash
   uhd_usrp_probe --args "type=b200,clock_source=gpsdo,time_source=gpsdo"
   ```
   Expect the probe to enumerate the AD9361 daughterboard and report the reference source as locked. A free-running clock still captures, but report capture quality as a limiting factor for the control region.

2. **Find the carrier and read its width on a waterfall.** Sweep the candidate bands in gqrx and identify the steady OFDM "wall" of a downlink carrier; note its centre frequency (→ EARFCN) and visible width (1.4–20 MHz). A 20 MHz carrier fits in one HackRF view; a wider, disciplined SDR gives cleaner symbols later (RFSAM-RES-08).

3. **Run cell search to recover the PCI from PSS/SSS.** With srsRAN's `cell_search` example, scan a band (here band 3, ~1800 MHz):
   ```bash
   ./srsran/lib/examples/cell_search -b 3
   ```
   Useful flags from `usage()`: `-b band` (required), `-s earfcn_start`, `-e earfcn_end`, `-n nof_frames_total` (default 100), `-a "<RF args>"`, `-g RF_gain`, `-d RF_devicename`. Expected output line:
   ```
   Found CELL 1845.0 MHz, EARFCN=1500, PHYID=123, 100 PRB, 1 ports, PSS power=-65.0 dBm
   ```
   `PHYID` is the PCI (0–503), `nof PRB` confirms the bandwidth recovered from PBCH, and a sane `PSS power` indicates a clean lock. No "Found CELL" line means sync failed — revisit gain, centre frequency, or clock discipline.

4. **Decode the MIB and demodulate the grid on the chosen carrier.** Point the `pdsch_ue` example at the carrier (use the EARFCN's RX frequency from step 3):
   ```bash
   ./srsran/lib/examples/pdsch_ue -f 1845000000 -A 2
   ```
   Watch for:
   ```
   Tuning receiver to 1845.000 MHz
   Decoded MIB. SFN: 412, offset: 0
   ```
   followed by a live stats line at subframe 5 reporting `RSRP`, `PDCCH-Miss: x.xx%`, `PDSCH-BLER: x.xx%`. A low `PDCCH-Miss` and `PDSCH-BLER` with steady `Decoded MIB` confirms the grid is recovered coherently. Persistent `Cell not found after [ ... ] attempts. Trying again...` or a high PDCCH-Miss percentage is the symptom of an incoherent capture (clock drift, host-I/O underruns, or insufficient bandwidth).

5. **(Optional) Cross-check with a second receiver chain.** Run LTESniffer's downlink mode on the same carrier to confirm PDCCH/PDSCH recovery independently:
   ```bash
   sudo ./src/LTESniffer -A 2 -W 4 -f 1840e6 -C -m 0 -a "num_recv_frames=512"
   ```
   `-C` turns on cell search, `-m 0` is downlink mode, `-A 2` uses two RX antennas (needed for transmission modes 3/4), and `num_recv_frames=512` improves B210 synchronisation [[hoang2023ltesniffer]]. Consistent PCI and decode between srsRAN and LTESniffer is strong evidence the capture chain is sound. FALCON or a gr-lte flowgraph can serve the same cross-check role [[falkenberg2019falcon]][[grlte]].

6. **Record the verdict.** Capture-feasibility passes if PSS/SSS sync is stable, the PCI matches across runs, MIB decodes, and PDCCH-Miss/PDSCH-BLER stay low for sustained frames. Note the clock source and host so the result is reproducible.

## Field case

Illustrative walkthrough — substitute the values you capture; this is a reproducible example, not a measured engagement, and every unmeasured quantity is marked `[FILL: …]`.

Rig: a USRP B210 with the GPSDO option, fed a band-3 (1800 MHz FDD) downlink. After `uhd_usrp_probe` confirms the GPSDO reference, `cell_search -b 3` returns a `Found CELL` line reporting `EARFCN=[FILL: e.g. 1500]`, `PHYID=[FILL: PCI 0–503]`, `[FILL: nof] PRB`, and `PSS power=[FILL: dBm]`. Pointing `pdsch_ue -f [FILL: RX Hz] -A 2` at that carrier produces a steady `Decoded MIB. SFN: [FILL]` and, at subframe 5, `PDCCH-Miss: [FILL: %]` / `PDSCH-BLER: [FILL: %]`. The control passes when synchronisation holds, the PCI is stable across repeated runs, and the grid demodulates without timing-induced corruption.

A documented degradation pattern worth reproducing: the *same* recorded carrier that decoded MIB cleanly on a desktop host failed intermittently on an underpowered mini-PC — the SDR was fine, but host I/O could not sustain the sample rate, surfacing as `Cell not found` retries and elevated PDCCH-Miss. This is the practical lesson of RFSAM-RES-09: coherent OFDM capture is bounded by the *whole* chain (reference clock and host throughput), not the radio alone.

## Remediation

This is an auditor-side capture-quality control; "remediation" is mostly about reporting accurately, but the layered guidance still applies to the systems being assessed.

- **Auditor (capture chain):** Use a disciplined reference (GPSDO or external 10 MHz) for any OFDM capture and validate the host can sustain the sample rate before drawing conclusions (RFSAM-RES-08, RFSAM-RES-09). If sync is marginal, report capture quality as a limiting factor rather than asserting a clean negative result.
- **Developer / network integrator:** The information recovered by this control — PCI, system bandwidth, MIB/SFN, and the PDCCH scheduling picture — is broadcast or sent in the clear by design and *cannot* be hidden at the PHY layer [[ts36211]][[bui2016owl]]. Do not treat broadcast obscurity as a security boundary. Real protections live above the air interface: enable user-plane ciphering and integrity per bearer, and ensure identity privacy (S-TMSI rather than IMSI on paging) so that easy grid recovery does not translate into easy tracking.
- **Operator:** Recognise that passive resource-grid recovery and PDCCH monitoring are inexpensive and well-documented [[falkenberg2019falcon]][[hoang2023ltesniffer]]; treat the control plane visible from the air as observable, and base detection of rogue-infrastructure and tracking on the Attack-layer controls rather than assuming the PHY layer is private.
