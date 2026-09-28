---
id: RFSAM-UWB-AT-01
title: Assess distance-manipulation resilience
protocol: UWB
layer: AT
criticality: high
applicability:
  - UWB
  - IEEE 802.15.4z HRP
  - CCC Digital Key
  - Apple Nearby Interaction
  - FiRa RTLS
deferred: false
objective: >-
  Determine whether a UWB ranging scheme can be made to report a shorter (or
  otherwise manipulated) distance than the true time-of-flight, by physical-layer
  distance reduction or by relay, such that a proximity security gate (car
  unlock/start, payment, access) can be satisfied from outside its intended range.
intro: >-
  UWB derives distance from the time-of-flight of sub-nanosecond pulses, not from
  signal strength, and 802.15.4z protects the timestamp with the AES-keyed STS so
  an attacker cannot forge or replay a ranging pulse without the key. The real
  attack surface is therefore physical: can a receiver be coerced into registering
  an *earlier* arrival than the true one (shortening the measured distance) without
  any cryptographic material, or can the whole exchange be relayed? This control
  assesses that resilience under authorised testing only, there is no turnkey
  open exploit, so it is engineered against a programmable DW3000 peer.
prerequisites:
  hardware:
    - 'A programmable DW3000-class UWB peer: Qorvo DWM3000EVB driven by a host MCU (an nRF52DK in the Ghost Peak platform; a NUCLEO-F429ZI in the SEEMOO sniffer build), or a Makerfabs ESP32-UWB-DW3000'
    - 'For observation: a SEEMOO uwb-sniffer (DWM3000EVB + host) to log the live 802.15.4z ranging round'
    - 'An RF-shielded test enclosure to bound the over-the-air experiment'
  software:
    - 'foldedtoad/dwm3000 (Qorvo dwt_uwb_driver port) to set the 802.15.4z PHY and run/log two-way ranging'
    - 'SEEMOO uwb-sniffer firmware + Wireshark (sensniff pipe) to capture frames with picosecond timestamps'
  signal:
    freq: '6489.6 MHz (ch 5) or 7987.2 MHz (ch 9); HRP impulse radio, ~3.1 to 10.6 GHz band'
    bandwidth: '>500 MHz per channel'
    modulation: 'Impulse radio (sub-nanosecond pulses), 850 kbps / 6.81 Mbps; distance from pulse time-of-flight, STS-authenticated'
  skill: advanced
attacks:
  - name: Ghost Peak (HRP distance reduction)
    refs:
      - leu2022ghostpeak
    impact: >-
      Reduces the measured distance (demonstrated 12 m to 0 m) on Apple U1
      interoperating with NXP/Qorvo chips, with no cryptographic material, enough
      to satisfy a proximity gate from outside its intended range when it succeeds.
    preconditions: >-
      HRP 802.15.4z ranging with a receiver design vulnerable to early-detection of
      injected pulses; a ~$65 DWM3000EVB + nRF52DK; line on the ranging round.
      Per-attempt success ~4%, so it is probabilistic and benefits from repetition.
    summary: >-
      First practical over-the-air distance-reduction attack on HRP UWB; injects
      pulses so the receiver commits to an earlier arrival, shortening time-of-flight.
  - name: Cicada++ / Adaptive Injection on the STS
    refs:
      - singh2021secanalysis
    impact: >-
      Distance-shortening against HRP STS ranging with success probabilities
      reported between 7% and over 90% depending on how the receiver is configured
      (miss-detection rate vs performance trade-off).
    preconditions: >-
      HRP STS mode where the receiver's leading-edge / time-of-arrival estimator can
      be biased by injected energy before the true pulse; no key needed.
    summary: >-
      Physical-layer injection variants (Cicada++, Adaptive Injection) that exploit
      the receiver's ToA estimator rather than the STS secret itself.
  - name: Distance enlargement
    refs:
      - singh2019uwbed
    impact: >-
      Lengthens the measured distance by delaying/annihilating the genuine pulse,
      can defeat schemes that fail-open on lost ranging, or be used to mask a relay.
    preconditions: >-
      Ability to overshadow or cancel the legitimate pulses at the receiver; the
      complement of reduction and the reason UWB-ED-style detection is needed.
    summary: >-
      Enlargement attacks (and their detection) motivate phase-interleaved pulses
      and empty slots so an adversary has only ~50% chance of annihilating a pulse.
  - name: UWBAD ranging blocking (jamming)
    refs:
      - yang2024uwbad
    impact: >-
      Selectively and quickly blocks ranging sessions on COTS Apple/NXP/Qorvo
      chips, a denial that, where the consumer fails open, becomes a security event
      (e.g. a lock that defaults to unlocked, or a fallback to a weaker channel).
    preconditions: >-
      Exploits the normalized cross-correlation in UWB ranging; demonstrated with
      COTS UWB chips, no key material.
    summary: >-
      Effective, low-visibility jamming that disrupts the ranging round; assesses
      the fail-safe behaviour of whatever consumes the measurement.
references:
  - key: leu2022ghostpeak
    title: 'Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging'
    authors: 'P. Leu, G. Camurati, A. Heinrich, M. Roeschlin, C. Anliker, M. Hollick, S. Capkun, J. Classen'
    venue: USENIX Security 2022
    year: 2022
    url: 'https://www.usenix.org/conference/usenixsecurity22/presentation/leu'
    type: paper
  - key: singh2021secanalysis
    title: 'Security analysis of IEEE 802.15.4z/HRP UWB time-of-flight distance measurement'
    authors: 'M. Singh, M. Roeschlin, E. Zalzala, P. Leu, S. Capkun'
    venue: ACM WiSec 2021 (ETH Research Collection)
    year: 2021
    url: 'https://www.research-collection.ethz.ch/handle/20.500.11850/497943'
    type: paper
  - key: singh2019uwbed
    title: 'UWB-ED: Distance Enlargement Attack Detection in Ultra-Wideband'
    authors: 'M. Singh, P. Leu, A. Abdou, S. Capkun'
    venue: USENIX Security 2019
    year: 2019
    url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/singh'
    type: paper
  - key: yang2024uwbad
    title: 'UWBAD: Towards Effective and Imperceptible Jamming Attacks Against UWB Ranging Systems with COTS Chips'
    authors: 'Y. Yang, Z. Wu, Y. Zhang, T. Chen, J. Li, J. Yang, W. Liu, X. Zhang, R. Shi, J. Li, Y. Jiang, Z. Su'
    venue: ACM CCS 2024
    year: 2024
    url: 'https://arxiv.org/abs/2407.00682'
    type: paper
  - key: ieee802154z
    title: 'IEEE Std 802.15.4z-2020: Enhanced Ultra Wideband (UWB) Physical Layers and Associated Ranging Techniques'
    venue: IEEE Standards Association
    year: 2020
    url: 'https://standards.ieee.org/ieee/802.15.4z/7460/'
    type: standard
  - key: ghostpeakproject
    title: 'Ghost Peak: project page, platform and code (DWM3000EVB + nRF52DK)'
    authors: 'Secure Positioning (ETH Zurich / TU Darmstadt)'
    venue: securepositioning.ch
    year: 2022
    url: 'https://securepositioning.ch/ghost-peak/'
    type: blog
tools:
  - dwm3000-dwt-driver
  - dwm3000evb
  - makerfabs-esp32-uwb-dw3000
  - seemoo-uwb-sniffer
  - wireshark
bsam: []
resources:
  - RFSAM-RES-24
reviewStatus: reviewed
confidence: medium
lastResearched: 2026-06-14
---

## Mechanism

UWB ranging measures distance from the **time-of-flight of sub-nanosecond impulse-radio pulses**, not from received signal strength, which is what makes it ~10 cm accurate and resistant to the amplitude-based relay tricks that defeat RSSI proximity (see the UWB Wayfinder `facts`). IEEE 802.15.4z protects the *integrity* of that measurement with the **STS (Scrambled Timestamp Sequence)**: an AES-keyed pseudo-random pulse sequence the two peers share, which the receiver correlates against to authenticate the arrival time, so an attacker without the key cannot forge or replay a legitimate-looking ranging pulse [`ieee802154z`]. The security claim is therefore about the *timestamp*, not confidentiality, and the research surface is correspondingly physical.

The decisive observation in the literature is that the attacker does **not need the STS key** to bias the measurement. The receiver estimates a leading edge / time-of-arrival from accumulated pulse energy; if an adversary injects energy that the estimator commits to *before* the genuine first path, the measured time-of-flight, and hence the distance, shortens [`singh2021secanalysis`]. **Ghost Peak** is the landmark practical result: the first over-the-air distance-reduction attack on HRP 802.15.4z, reducing a 12 m true distance to a reported 0 m against Apple U1 interoperating with NXP and Qorvo chips, with **no cryptographic material** and a ~$65 off-the-shelf device (a DWM3000EVB driven by an nRF52DK), at roughly a **4% per-attempt success rate** [`leu2022ghostpeak`, `ghostpeakproject`]. The earlier security analysis of HRP names the injection families, **Cicada++** and **Adaptive Injection**, and shows that, depending on how the receiver trades miss-detection against performance, the success probability of distance shortening ranges from about **7% to over 90%** [`singh2021secanalysis`].

The complementary primitive is **distance enlargement**: delaying or annihilating the genuine pulse so the receiver reports a *longer* distance, which matters because a scheme that fails open on lost or implausible ranging can be pushed off the secure path, and because enlargement can mask a relay. UWB-ED frames the detection side, interleaving pulses of different phases and empty pulse slots so an adversary has only ~50% chance of annihilating a given pulse [`singh2019uwbed`]. Finally, **relay and jamming** bound the picture from the other end: because the ranging round is short and latency-constrained, an attacker who cannot *reduce* distance may still **block** it, UWBAD selectively and quickly blocks ranging sessions on COTS Apple/NXP/Qorvo chips by exploiting the normalized cross-correlation in the receiver, turning the assessment into "what does the consumer do when ranging is manipulated or denied?" [`yang2024uwbad`].

The ~4% (Ghost Peak) and 7% to 90% (Singh et al.) success-probability figures are the papers' own evaluations against specific chip/receiver configurations; they vary with chip, firmware revision, channel and STS length, so treat them as representative of the attack class, not a guarantee against any given product, check current advisories.

There is **no open, turnkey distance-reduction exploit**. Ghost Peak and the injection variants use custom DW3000 firmware and bespoke RF engineering that are not released as a runnable product (the Ghost Peak project page gates the code, and the Wayfinder AT note states this explicitly). The procedure below characterises and stress-tests ranging behaviour on a programmable peer, it is not a packaged Ghost-Peak binary, and reproducing a full reduction is research-grade work.

## Procedure

> Authorised testing only: use your own devices/vehicle or an explicit test target, operate inside an RF-shielded enclosure, and keep the UWB transmitter on the regulator-permitted channels and power. Distance manipulation against a system you do not own is out of scope.

1. **Identify the scheme and PHY before touching the air** (Wayfinder IG step). Confirm silicon (DW3000 / NXP Trimension / Apple U1-U2, only 802.15.4z parts have STS), HRP vs LRP, the channel (5 or 9), and the application scheme (Apple Nearby Interaction / CCC Digital Key / FiRa). UWB cannot be blind-scanned, so these parameters are mandatory inputs to every later step.
   ```text
   Example target profile (record before testing):
     silicon  : Qorvo DW3110 (DW3000 family, 802.15.4z, STS supported)
     PHY      : HRP, channel 5 (6489.6 MHz), PRF 64 MHz, 6.81 Mbps
     STS      : mode 1, STS length 64
     scheme   : CCC Digital Key (bootstrapped over BLE)
   ```
   You cannot proceed without these; recover them from the FCC ID, a teardown, the host SDK, or the BLE/NFC bootstrap (see the BLE and RFID/NFC Wayfinders).

2. **Establish a known-good ranging baseline** with a controllable DW3000 peer, so you can measure manipulation as a deviation from truth. Bring up two boards at a tape-measured separation and log the reported distance.
   ```bash
   # foldedtoad/dwm3000, DWS3000 shield under Zephyr, two-way ranging example
   git clone https://github.com/foldedtoad/dwm3000
   west build -b nrf52840dk_nrf52840 dwm3000/examples/ex_05a_ds_twr_init
   west flash
   # on the responder board, build/flash ex_05b_ds_twr_resp
   ```
   Expected: the initiator's serial log prints a per-round distance that tracks the physical separation to ~10 cm (e.g. `DIST: 2.03 m` at a 2.00 m tape measurement). A baseline that does *not* track truth means the PHY config is wrong, fix it before any attack step.

3. **Capture the live ranging round passively** to confirm the frame format, STS mode and timing you must match. Drive the SEEMOO sniffer into Wireshark.
   ```bash
   # SEEMOO uwb-sniffer: DWM3000EVB firmware streaming to Wireshark via sensniff
   git clone https://github.com/seemoo-lab/uwb-sniffer
   # flash the EVB firmware per the repo, then pipe to Wireshark:
   python3 sensniff.py -d /dev/ttyACM0 | wireshark -k -i -
   ```
   Expected: 802.15.4z frames with the DW3000's 15.65 ps timestamp resolution, showing the ranging-round structure (poll / response / final) of the scheme. Malformed frames are forwarded too, read the dissector output critically. This captures frames you can already decode; it does **not** break the STS.

4. **Stress-test the ToA / leading-edge estimator** for an early-detection bias, the resilience question. Using the programmable peer, inject pulse energy ahead of the genuine first path (Cicada++/adaptive style) and watch whether the responder's reported distance drops below the true separation. This is the engineered, research-grade step; record the *rate* of any shortening, not a single lucky frame.
   ```text
   Observation to record per N rounds:
     true distance (tape)      : 12.00 m
     reported distance min     : [FILL: measured min, m]
     shortened-round fraction  : [FILL: shortened rounds / N]
   ```
   A receiver that never reports below truth across a large N is resilient to this primitive in this configuration; any consistent sub-truth reports indicate an exploitable early-detection bias [`leu2022ghostpeak`, `singh2021secanalysis`].

5. **Test denial / fail-safe** with a jamming primitive (UWBAD-style block) and observe the consumer. The security finding is often here: does the car/lock/payment **fail open** when ranging is blocked or implausible, fall back to a weaker channel (BLE RSSI), or refuse the action? [`yang2024uwbad`]

6. **Test the application gate against a reduced/blocked measurement.** The end-to-end question (Wayfinder AP step): if distance *were* reduced or denied, would the gate still trip? Confirm the consumer requires an **STS-authenticated** measurement (not a legacy/non-secure one), bounds distance tightly, rejects implausible jumps, and fails safe. Record the decision, not just the radio behaviour.

## Field case

Representative worked example (no measured author field data, values to be filled by the tester, marked `[FILL: …]`; do not treat the placeholders as findings):

A CCC Digital Key bench rig was set up under authorisation in an RF-shielded room: a Qorvo DWM3000EVB acting as the "vehicle anchor" (responder) and a second DWM3000EVB + nRF52DK as the "key" (initiator), both HRP channel 5, STS mode 1, configured from the BLE bootstrap parameters recovered at the IG step. Step 2 baselined the rig, at a tape-measured **12.00 m** the initiator logged `DIST: 11.9x m`, tracking truth to ~10 cm, confirming a valid ranging link before any attack.

A third programmable DW3000 peer was then introduced as the attacker and driven to inject pulse energy ahead of the genuine first path (Step 4). Across **N = [FILL: number of rounds]** ranging rounds, the responder reported a minimum distance of **[FILL: measured min, m]** with a shortened-round fraction of **[FILL: shortened/N]**. This is the place to be honest about effort: Ghost Peak's published platform, the *same* class of hardware used here (a ~$65 DWM3000EVB + nRF52DK), achieved 12 m → 0 m at only ~4% per attempt with custom firmware [`leu2022ghostpeak`, `ghostpeakproject`], so a bench reproduction that shows *any* consistent sub-truth report is already a meaningful resilience finding; a null result across a large N is itself the finding (this configuration resisted the primitive). The application-gate test (Step 6) then recorded whether the rig's "unlock" logic would trip on a `[FILL: reduced | blocked]` measurement: **[FILL: unlocked | refused | fell back to BLE]**.

> Note: no author-measured UWB distance-manipulation field data exists yet for this control; every `[FILL: …]` above is an unmeasured placeholder, not a result. The numeric reduction figures cited (12 m → 0 m, ~4%) are Ghost Peak's, not a local reproduction.

## Remediation

**Developer (silicon / receiver firmware).** Use an STS-protected 802.15.4z HRP (or LRP) part and a receiver design that resists early-detection injection, the published analyses show the receiver's ToA/leading-edge estimator, not the STS secret, is what gets attacked, and that configuration choices move the success rate across an order of magnitude [`singh2021secanalysis`, `leu2022ghostpeak`]. Prefer longer STS, validate the first-path against the STS accumulation rather than raw energy, and adopt enlargement/annihilation-resistant designs (phase-interleaved pulses, empty slots) so injection and cancellation are detectable [`singh2019uwbed`]. Treat DW1000-generation legacy parts (no STS) as non-secure for ranging.

**Integrator (the consuming system).** Require an **STS-authenticated secure** measurement before any gate decision, never accept a legacy or non-secure ranging result for a security-critical action. Bound the acceptable distance tightly, reject physically implausible jumps between rounds, and require multiple consistent secure measurements rather than a single round (this directly counters a probabilistic, ~4%-per-attempt reduction). Bind the UWB session to its BLE/NFC bootstrap so a ranging result cannot be accepted out of session context.

**Operator (deployment).** Configure the system to **fail safe** when ranging is lost, blocked or implausible, a jamming or distance-manipulation attempt must not default to unlocked/approved, and fallback to a weaker proximity signal (BLE RSSI) must not silently bypass the UWB gate [`yang2024uwbad`]. Keep firmware current against vendor advisories; the attack corpus here is representative of the class and dates quickly, so re-check NXP/Qorvo/Apple and OEM advisories rather than treating any single result as the last word.
