---
id: RFSAM-GNSS-SP-01
title: Survey L-band for GNSS signal presence and interference
protocol: GNSS
layer: SP
criticality: low
applicability:
  - GNSS
  - GPS
  - Galileo
  - GLONASS
  - BeiDou
deferred: false
objective: >-
  Confirm that the GNSS L-band is usable at the test site and detect any
  interference or jamming that would degrade or deny a receiver's fix — judged
  from the RF environment (waterfall) and the receiver's own carrier-to-noise
  (C/N0) and satellite-count reports, not from the GNSS signal itself, which sits
  below the noise floor.
intro: >-
  GNSS signals arrive far below the thermal noise floor, so on a spectrum
  waterfall you are not looking for the signal — you are looking for what is
  wrong on top of it. This control confirms the band is healthy and surveys for
  the interference and jamming that deny civilian receivers their fix. It is the
  RF-environment baseline that every later GNSS step (decode, spoof-resilience)
  depends on.
prerequisites:
  hardware:
    - 'An SDR that reaches L1 (1575.42 MHz): RTL-SDR V4 (single-band L1, ~2.4 MHz BW), HackRF One (~20 MHz), bladeRF 2.0 micro (~61 MHz) or USRP B210 (~56 MHz)'
    - 'An active GPS/GNSS antenna with a bias-tee to power it (on the RTL-SDR V4, enable the on-board bias-tee)'
    - 'A standard GNSS receiver module for the receiver-eye-view (a u-blox NEO-class USB/serial module)'
  software:
    - 'gqrx for the live spectrum/waterfall survey'
    - 'gpsd (gpsmon/cgps) or u-center to read per-satellite C/N0 and satellite count'
    - 'optional: gnss-sdr for a software-receiver C/N0 reading from the same I/Q'
  signal:
    freq: 'L1 1575.42 MHz (GPS L1 C/A · Galileo E1 OS overlap). Neighbours: GLONASS L1 ~1602 MHz, BeiDou B1 1561.098 MHz; wider band L2 1227.60 MHz, L5 1176.45 MHz'
    bandwidth: '~2 MHz null-to-null for the C/A main lobe (1.023 Mcps spreading); survey ~2.5–20 MHz around L1'
    modulation: 'BPSK on the carrier; 1023-chip C/A code at 1.023 Mcps repeating every 1 ms; received power about -128.5 dBm (-158.5 dBW), below the noise floor'
  skill: intermediate
attacks:
  - name: Broadband / matched-power jamming (denial of fix)
    refs:
      - qiao2023survey
      - easa2025gnss
    impact: >-
      Floods L1 with noise or a carrier so the receiver cannot despread any
      satellite — C/N0 collapses and the fix is lost, denying navigation,
      geofencing or a timing/PPS reference downstream.
    preconditions: >-
      A transmitter on or near L1 within range; trivial because civilian GNSS is
      a fixed-frequency public signal arriving below the noise floor, so even a
      low-power jammer overcomes it.
    summary: >-
      The denial case this survey detects: a strong carrier or wideband hump over
      L1 on the waterfall, with a simultaneous collapse in receiver-reported
      C/N0 and satellites-used.
  - name: Spoofing onset (interference signature)
    refs:
      - kriezis2025cots
    impact: >-
      A spoofer transmits a valid-looking, slightly stronger L1 C/A signal to
      capture the receiver and drag its position/time; its onset can present as
      a C/N0 that is implausibly high for the elevated received power — an
      abnormal imbalance between C/N0 and power.
    preconditions: >-
      A counterfeit L1 signal stronger than the live sky at the receiver. This
      SP-layer survey detects the interference signature only; the spoofing
      technique itself is an Attack-layer (AT) concern.
    summary: >-
      Distinguishing nominal from jammed, spoofed and blocked conditions by
      combining the waterfall with C/N0 and a calibrated received-power metric.
references:
  - key: spsps2020
    title: 'Global Positioning System Standard Positioning Service (SPS) Performance Standard, 5th Edition'
    authors: U.S. Department of Defense
    venue: gps.gov
    year: 2020
    url: 'https://www.gps.gov/sites/default/files/2025-07/2020-SPS-performance-standard.pdf'
    type: standard
  - key: qiao2023survey
    title: A survey of GNSS interference monitoring technologies
    authors: 'J. Qiao, Z. Lu, B. Lin, J. Song, Z. Xiao, Z. Wang, B. Li'
    venue: 'Frontiers in Physics, vol. 11'
    year: 2023
    url: 'https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2023.1133316/full'
    type: paper
  - key: kriezis2025cots
    title: GNSS Jamming and Spoofing Monitoring Using Low-Cost COTS Receivers
    authors: 'A. Kriezis, Y.-H. Chen, D. Akos, S. Lo, T. Walter'
    venue: 'arXiv:2509.13600'
    year: 2025
    url: 'https://arxiv.org/abs/2509.13600'
    type: paper
  - key: easa2025gnss
    title: EASA and IATA outline comprehensive plan to mitigate GNSS interference risks
    authors: EASA / IATA
    venue: EASA newsroom
    year: 2025
    url: 'https://www.easa.europa.eu/en/newsroom-and-events/press-releases/easa-and-iata-outline-comprehensive-plan-mitigate-gnss'
    type: blog
tools:
  - gqrx
  - gpsd
  - ublox-neo-gps
  - gnss-sdr
resources:
  - RFSAM-RES-01
  - RFSAM-RES-19
bsam: []
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

A GPS L1 C/A signal is BPSK on a 1575.42 MHz carrier, spread by a 1023-chip code at 1.023 Mcps that repeats every 1 ms, with one PRN code per satellite (CDMA). It arrives extremely weak: the GPS SPS Performance Standard guarantees a received signal power of only **-158.5 dBW (-128.5 dBm) for the L1 C/A-code** under the IS-GPS-200 reference conditions, which is below the thermal noise floor — the signal is recovered only by correlating against the known PRN code [spsps2020]. The practical consequence for an SP-layer survey is decisive: **you cannot see the GNSS signal on a waterfall.** A clean, quiet band at L1 *is* the healthy picture; what you survey for is everything that does not belong there.

Because the civilian signal is fixed-frequency, public and arriving below the noise, the entire attack surface at this layer is interference, not secrecy. Interference monitoring is conventionally split into detection/recognition, direction finding, and source location; the detection methods relevant to a single-site survey are **energy detection in the frequency domain (FFT-based)** for a spectrum view, **AGC monitoring** at the RF front end (the receiver's gain control swings under strong in-band power), and **C/N0 (carrier-to-noise) monitoring** in the tracking loops, which falls when interference raises the effective noise [qiao2023survey]. No single metric is sufficient alone: a robust read combines the waterfall with the receiver's own reports. Low-cost COTS receivers, when their C/N0 is paired with a calibrated received-power metric, can separate **nominal, jammed, spoofed and blocked** conditions — jamming collapses C/N0, while a spoof can present as a C/N0 that is implausibly high for the elevated received power (an abnormal imbalance between C/N0 and power that satellite signals, at fixed transmit power, cannot produce) [kriezis2025cots].

Two interference families bound the survey. **Jamming** (broadband noise or a CW carrier over L1) denies the fix — the case the waterfall and a C/N0 collapse make obvious. **Spoofing onset** is subtler: a counterfeit L1 signal slightly stronger than the live sky, detectable here only as an interference *signature* (the spoofing technique itself is an Attack-layer concern). The operational relevance is current: aviation authorities report GNSS jamming and spoofing incidents rising sharply, with GPS signal-loss events up roughly 220% between 2021 and 2024 across Eastern Europe and the Middle East [easa2025gnss].

## Procedure

All steps are passive receive-only. No transmission is involved at the SP layer, so no transmit authorisation is required; if you connect an antenna outdoors, normal site access rules still apply.

1. **Set up the receive chain.** Connect the active GNSS antenna through the bias-tee to the SDR. On the RTL-SDR V4, enable the on-board bias-tee so the active antenna is powered (without it you will see only noise):
   ```bash
   rtl_biast -b 1
   ```
   Expected: the command exits without error and the antenna's LNA draws current. A multi-constellation reading benefits from a clear sky view.

2. **Survey the RF environment at L1.** Launch gqrx, tune to 1575.42 MHz, and set a span of roughly 2.5–20 MHz around L1 (RFSAM-RES-01):
   ```text
   gqrx → Receiver Options → Frequency: 1575.420 MHz
   Input controls → bias-tee/LNA as needed; FFT span ≈ 8 MHz
   ```
   Expected (healthy band): a flat noise floor with **no** discrete carrier and **no** wideband hump centred on L1 — you do *not* see the GNSS signal, and that is correct [spsps2020]. Interference tells: a sharp spike (CW jammer), a raised wideband plateau over L1 (broadband jammer), or chirp/sweep streaks on the waterfall. Note the centre frequency, bandwidth and approximate level of anything anomalous [qiao2023survey].

3. **Get the receiver-eye view (C/N0 and satellite count).** Plug in the u-blox NEO module and read its per-satellite C/N0 with gpsd:
   ```bash
   gpsd -n /dev/ttyACM0
   cgps -s         # or: gpsmon /dev/ttyACM0
   ```
   Expected (healthy): several satellites with C/N0 in roughly the 35–50 dB-Hz range and a 3D fix within a few minutes. **Interference signature:** C/N0 across all tracked satellites drops together and satellites-used falls toward zero (jamming/blocked), versus C/N0 that stays implausibly high for the elevated received power with a stable-but-suspect fix (possible spoof) [kriezis2025cots]. Record C/N0 per PRN and the fix status.

4. **(Optional) Cross-check with a software receiver on the same I/Q.** If you captured raw L1 I/Q (RFSAM-RES-01), run gnss-sdr and compare its reported C/N0 against the COTS module — agreement strengthens the read and a divergence is itself a finding:
   ```bash
   gnss-sdr --config_file=gps_l1_survey.conf
   ```
   Expected: per-channel C/N0 estimates consistent with step 3. (Correlation is CPU-intensive; RTL-SDR's ~2.4 MHz bandwidth limits it to single-band L1 C/A.)

5. **Record the baseline.** Note timestamp, site, antenna, SDR, the waterfall observation at L1, and the receiver's C/N0/satellite/fix state. This is the RF-environment baseline that later GNSS steps compare against — and a degraded baseline (jammed/blocked) is the finding for this control.

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative bench survey at a single test site, illustrating how to read the two views rather than reporting a measured incident; the bracketed `[FILL: …]` figures are placeholders to be replaced with your own bench data, not asserted findings.

Antenna: active L1 patch through a bias-tee into an RTL-SDR V4 (`rtl_biast -b 1`), with a u-blox NEO-class module on `/dev/ttyACM0` for the receiver-eye view.

- **Nominal baseline.** gqrx at 1575.420 MHz showed a flat noise floor with no carrier over L1 — the expected "healthy = nothing visible" picture, since the C/A signal sits at about -128.5 dBm, below the noise [spsps2020]. `cgps -s` reported a 3D fix on [FILL: N] satellites with C/N0 of [FILL: dB-Hz range] dB-Hz.
- **Injected interference (contained).** With a CW source placed on L1 in a contained setup, gqrx showed a discrete spike at 1575.42 MHz rising above the floor; simultaneously C/N0 on every tracked PRN fell together and satellites-used dropped to [FILL: N], losing the fix — the jamming signature: a tell on the waterfall *and* a coordinated C/N0 collapse [qiao2023survey][kriezis2025cots].

The point is the two-view method: the waterfall says *something is on L1*, and the receiver's C/N0/satellite count says *and it is denying the fix*. Either alone is weaker than both together. The real-world stakes are not hypothetical — aviation regulators report GPS signal-loss events up roughly 220% from 2021 to 2024 across affected regions [easa2025gnss].

## Remediation

GNSS interference at the SP layer is a resilience-and-detection problem, not a confidentiality one (there is no key to protect); remediation is layered.

- **Developer (receiver / firmware).** Expose AGC level, C/N0 per satellite, and an interference/jamming flag in the receiver's output so downstream systems can *see* a degraded band rather than silently trusting a fix; many u-blox-class modules already surface jamming/interference indicators — consume them [qiao2023survey]. Implement consistency/RAIM checks so an implausible solution is rejected rather than accepted.
- **Integrator (system).** Do not let a single GNSS input be a single point of failure: hold over an internal clock or alternate timing source when C/N0/AGC indicate interference, and combine GNSS with inertial or other navigation so a denied or spoofed fix degrades gracefully [kriezis2025cots]. Prefer multi-constellation, multi-band receivers — a survey covering L1/L2/L5 across GPS/Galileo/GLONASS/BeiDou is harder to deny than GPS-L1-only.
- **Operator.** Run this survey as a periodic baseline so a *new* carrier or C/N0 collapse is detectable as a change, alarm on signal-loss rather than coasting silently, and report suspected interference through the appropriate channel — aviation and maritime authorities now run formal GNSS-interference reporting and mitigation programmes [easa2025gnss].
