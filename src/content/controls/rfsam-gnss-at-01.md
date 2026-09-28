---
id: RFSAM-GNSS-AT-01
title: Test spoofing and jamming resilience
protocol: GNSS
layer: AT
criticality: critical
applicability:
  - GPS L1 C/A
  - GLONASS
  - Galileo E1 OS
  - BeiDou B1
  - GNSS-disciplined timing
deferred: false
objective: >-
  Determine whether a GNSS receiver can be made to report an attacker-chosen
  position or time by a counterfeit (spoofed) civilian signal, or be denied any
  fix by in-band jamming, and whether it detects, alarms on, or rejects either
  condition. Authorised, RF-contained testing only.
intro: >-
  Civilian GNSS signals (GPS L1 C/A, GLONASS, BeiDou B1, Galileo E1 OS) are
  unencrypted and unauthenticated, so a receiver trusts whatever signal it can
  decode. A counterfeit signal transmitted slightly stronger than the live sky
  can capture the receiver and drag its reported position and clock; broadband
  noise on the same band simply denies a fix. This control tests, in a shielded
  or cabled setup, how the target degrades and whether it notices.
prerequisites:
  hardware:
    - 'A TX-capable SDR: HackRF One, bladeRF 2.0 micro, or USRP B210 (RTL-SDR is receive-only and cannot transmit)'
    - 'The target GNSS receiver (module, handset, or timing reference) under test'
    - 'RF containment: a shielded enclosure or a cabled (conducted) path with attenuators, over-the-air GNSS TX is illegal in most jurisdictions'
    - 'Optionally a reference GNSS receiver (e.g. u-blox NEO) to observe satellite count and C/N0 during the test'
  software:
    - 'gps-sdr-sim (signal synthesis for the spoofing case)'
    - 'hackrf_transfer / bladeRF-cli / UHD tx tools (transmission)'
    - 'gpsd (gpsmon/cgps) or u-center to read the target/reference receiver output'
    - 'gqrx to monitor L1 during a jamming-resilience run'
  signal:
    freq: 'GPS L1 1575.42 MHz (Galileo E1 overlaps at 1575.42 MHz). Neighbours: GLONASS L1 ~1602 MHz, BeiDou B1 1561.098 MHz'
    bandwidth: '~2 MHz for L1 C/A (gps-sdr-sim default sample rate 2.6 MHz); ~20 MHz wideband recordings for high-fidelity test sets'
    modulation: 'BPSK on the carrier; 1023-chip C/A spreading code at 1.023 Mcps, repeating every 1 ms; navigation message at 50 bps (CDMA, one PRN per satellite)'
  skill: advanced
attacks:
  - name: Counterfeit-signal spoofing (position/time capture)
    refs:
      - humphreys2008spoof
      - utexas2013yacht
    impact: >-
      Receiver locks onto the counterfeit signal and reports an attacker-chosen
      position and/or clock, with no alarm, downstream navigation, geofencing,
      timestamping or PPS timing follows the false fix.
    preconditions: >-
      A receiver tracking unauthenticated civilian signals; the spoofer must
      align with or exceed the live signal power and (for a smooth takeover)
      match code phase and Doppler before pulling the solution away.
    summary: >-
      Synthesising a valid-looking civilian GNSS signal at higher power captures
      the receiver and lets the position/time be dragged to chosen values; first
      demonstrated with a portable software-defined spoofer.
  - name: In-band jamming (denial of fix)
    refs:
      - psiaki2016survey
    impact: >-
      Receiver loses lock and cannot compute a fix; safety- or timing-critical
      systems that trust continuous GNSS degrade or fail.
    preconditions: >-
      A transmitter raising the noise/interference floor over the target band
      above the receiver's despreading margin (GNSS is recovered ~30 dB below
      the noise floor, so modest in-band power denies it).
    summary: >-
      Flooding L1 with noise or a carrier denies any fix; the resilience question
      is whether the receiver flags the loss or silently coasts and reacquires.
references:
  - key: humphreys2008spoof
    title: 'Assessing the Spoofing Threat: Development of a Portable GPS Civilian Spoofer'
    authors: 'T. E. Humphreys, B. M. Ledvina, M. L. Psiaki, B. W. O''Hanlon, P. M. Kintner Jr.'
    venue: ION GNSS 2008
    year: 2008
    url: 'https://gps.mae.cornell.edu/humphreys_etal_iongnss2008.pdf'
    type: paper
  - key: psiaki2016survey
    title: GNSS Spoofing and Detection
    authors: 'M. L. Psiaki, T. E. Humphreys'
    venue: 'Proceedings of the IEEE, vol. 104, no. 6'
    year: 2016
    url: 'https://doi.org/10.1109/JPROC.2016.2526658'
    type: paper
  - key: texbat
    title: 'TEXBAT: Texas Spoofing Test Battery (civil GPS L1 C/A spoofing recordings)'
    authors: 'T. E. Humphreys, J. A. Bhatti, D. P. Shepard, K. D. Wesson (UT Austin Radionavigation Laboratory)'
    venue: UT Austin Radionavigation Laboratory
    year: 2012
    url: 'https://radionavlab.ae.utexas.edu/texbat/'
    type: paper
  - key: utexas2013yacht
    title: UT Austin Researchers Successfully Spoof an $80 million Yacht at Sea
    authors: UT Austin (Humphreys research group)
    venue: UT Austin News
    year: 2013
    url: 'https://news.utexas.edu/2013/07/29/ut-austin-researchers-successfully-spoof-an-80-million-yacht-at-sea/'
    type: blog
  - key: galileo-osnma
    title: Galileo Open Service Navigation Message Authentication (OSNMA) Signal-in-Space ICD v1.1
    authors: European Union Agency for the Space Programme (EUSPA) / GSC
    venue: European GNSS Service Centre
    year: 2023
    url: 'https://www.gsc-europa.eu/sites/default/files/sites/all/files/Galileo_OSNMA_SIS_ICD_v1.1.pdf'
    type: standard
  - key: gps-sdr-sim
    title: 'gps-sdr-sim, Software-Defined GPS Signal Simulator'
    authors: T. Ebinuma (osqzss)
    venue: GitHub
    year: 2024
    url: 'https://github.com/osqzss/gps-sdr-sim'
    type: tool
tools:
  - gps-sdr-sim
  - gqrx
  - gpsd
  - ublox-neo-gps
  - hackrf-one
  - bladerf-2-micro
  - usrp-b210
bsam: []
resources:
  - RFSAM-RES-20
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A civilian GNSS receiver derives position and time entirely from signals it cannot authenticate. GPS L1 C/A is BPSK on a 1575.42 MHz carrier, spread by a public 1023-chip code at 1.023 Mcps repeating every 1 ms, carrying a 50 bps navigation message; the same applies to GLONASS, BeiDou B1 and Galileo E1 OS, the codes and message format are published, so any receiver decodes them and, equally, anyone can generate them [galileo-osnma]. The recovered signal sits roughly 30 dB below the noise floor and is pulled out only by correlating against the known code, which is exactly why a marginally stronger counterfeit can win the correlation and capture the receiver [psiaki2016survey].

Two attack families exploit this. **Spoofing** synthesises a valid-looking signal and transmits it at higher power than the live sky; once the receiver locks onto it, the attacker can drag the reported position or clock to chosen values. A portable software-defined civilian spoofer was first built and characterised by Humphreys et al., who showed a commodity receiver could be captured and walked away from truth without raising any alarm [humphreys2008spoof]. The technique was later demonstrated against a moving target, a superyacht at sea, where counterfeit signals slowly overpowered the authentic ones and steered the vessel's navigation off course while its display still showed a straight line [utexas2013yacht]. The Texas Spoofing Test Battery (TEXBAT) standardised a set of recorded L1 C/A spoofing scenarios (static and dynamic, with matched clean recordings) so that receiver/detector resilience can be evaluated against a common reference [texbat].

**Jamming** is the blunt counterpart: raising the in-band noise or interference floor over the target band above the receiver's despreading margin denies any fix at all. Because the legitimate signal is so weak, modest in-band power is enough to deny it; the resilience question is whether the receiver flags the loss of integrity or silently coasts and accepts the first plausible fix it reacquires [psiaki2016survey].

The defensive state of the art splits into cryptographic and non-cryptographic checks. Galileo OSNMA adds optional navigation-message authentication on E1-B using a TESLA-style scheme (digitally signing the Open Service I/NAV message), letting an OSNMA-aware receiver verify the message originated from the system; EUSPA declared the OSNMA Initial Service operational on 24 July 2025 [galileo-osnma]. Crediting a target with message-authentication resilience requires confirming the specific receiver under test actually validates OSNMA, not merely that the constellation broadcasts it. Receivers can also apply non-cryptographic consistency checks, power/distortion monitoring, RAIM, clock-jump and inertial cross-checks, angle-of-arrival with multiple antennas, surveyed in [psiaki2016survey]. Legacy GPS L1 C/A on its own offers none of these, which is what this control tests for.

## Procedure

All transmit steps are **authorised, RF-contained testing only**: your own equipment, a target you own or have written permission to test, inside a shielded enclosure or over a cabled (conducted) path with attenuators. Over-the-air GNSS transmission is illegal in most jurisdictions.

1. Establish the baseline. Read the target's normal output and note its honest position, time, satellite count and C/N0 before any injection.
   ```bash
   gpsmon /dev/ttyACM0
   ```
   Expected: GGA/RMC sentences with a valid 3D fix, GSV showing several satellites at healthy C/N0 (typically 35 to 50 dB-Hz). Record the true position and fix quality.

2. Jamming resilience, monitor the band. In the contained setup, tune gqrx to L1 and confirm a clean baseline, then introduce the jamming source (a TX-capable SDR driving a carrier or noise over L1) and watch the band fill.
   ```bash
   gqrx   # tune to 1575.42 MHz, observe the waterfall
   ```
   Expected: baseline shows a quiet band (the GNSS signal itself is below the noise floor and not visible); during jamming a strong carrier or wideband hump appears over L1. gqrx observes only; it does not transmit.

3. Jamming resilience, observe the target. With the jammer active, watch the target receiver.
   ```bash
   cgps -s
   ```
   Expected: satellite count drops, C/N0 collapses, the fix is lost. Record whether the receiver raises an integrity/loss alarm, coasts on its last fix, or silently goes stale, and how long it takes to reacquire after the jammer stops.

4. Spoofing, synthesise the counterfeit signal. Fetch a current RINEX broadcast ephemeris (`brdc` file) and generate an L1 C/A baseband for a chosen static position. The `-b 8` option emits 8-bit signed I/Q for HackRF.
   ```bash
   gps-sdr-sim -e brdc0010.22n -l 30.286502,120.032669,100 -b 8
   ```
   Expected: a `gpssim.bin` baseband file for the chosen latitude,longitude,height. Use the matching sample rate/format for your radio (HackRF/bladeRF accept the 2.6 MHz default; USRP requires 2.5 MHz). A moving track can be supplied instead with `-u`/`-x`/`-g`.

5. Spoofing, transmit into the contained setup (authorised only). For HackRF the file must be 8-bit signed I/Q:
   ```bash
   hackrf_transfer -t gpssim.bin -f 1575420000 -s 2600000 -a 1 -x 0
   ```
   Expected: the synthesised signal is radiated into the shielded/cabled path. Start at low gain and raise it until the target prefers the counterfeit. (bladeRF replays via `bladeRF-cli`; USRP via `gps-sdr-sim-uhd.py` or `tx_samples_from_file --freq 1575420000`.)

6. Spoofing, confirm capture. Watch the target output while the counterfeit is live.
   ```bash
   cgps -s
   ```
   Expected: a resilient receiver rejects the spoof, flags an integrity fault, or refuses to move; a vulnerable one walks its reported position toward the synthesised coordinates (`30.286502,120.032669` in the example) and/or steps its clock, with no alarm. Record the transition and whether any anti-spoof flag was raised.

7. Reproducible offline variant. Where transmitting is not permitted at all, validate detector behaviour against the recorded TEXBAT scenarios (each spoofed set has a matched clean recording) by feeding them to a software receiver rather than radiating [texbat].

## Field case

A representative, reproducible bench example against a commodity L1-only GPS module in a shielded enclosure (conducted path, attenuated). Baseline: the module reports a stable 3D fix with [FILL: measured satellite count] satellites at [FILL: measured C/N0 range] dB-Hz.

Spoofing run: a counterfeit L1 C/A signal is generated for a static decoy position with

```bash
gps-sdr-sim -e brdc0010.22n -l 30.286502,120.032669,100 -b 8
```

and replayed into the enclosure with

```bash
hackrf_transfer -t gpssim.bin -f 1575420000 -s 2600000 -a 1 -x 0
```

raising `-a`/gain stepwise. Observed outcome: [FILL: at what relative power / after how many seconds] the module's reported position migrates from its true location toward `30.286502, 120.032669` and the fix follows the decoy, with [FILL: alarm raised? yes/no, record any integrity/anti-spoof flag]. Jamming run: a carrier at 1575.42 MHz is introduced; the module loses lock and [FILL: coasts / alarms / goes stale, record behaviour] and reacquires after [FILL: measured reacquisition time] once removed.

This mirrors the public demonstrations, a portable spoofer capturing a commodity receiver [humphreys2008spoof] and the same class of attack steering a superyacht's navigation while its display showed no anomaly [utexas2013yacht], at bench scale and under RF containment. No first-party measurements were taken for this control: every `[FILL: …]` marker (satellite count, C/N0, capture power/time, alarm behaviour, reacquisition time) is an unmeasured placeholder for the operator to complete from an actual contained run on their own hardware. They are method scaffolding, not asserted findings.

## Remediation

Layered, because no single check is sufficient against both spoofing and jamming [psiaki2016survey]:

- **Developer (receiver/firmware).** Implement consistency checks that legacy C/A omits: power/distortion (C/N0 and correlation-peak) monitoring, RAIM/integrity across satellites, clock-jump and position-jump sanity limits, and rejection of physically impossible velocity/altitude. Where the chipset supports it, enable Galileo OSNMA so the navigation message is cryptographically authenticated and a counterfeit E1 message is detected [galileo-osnma]. Validate the implementation against a standard spoofing test set such as TEXBAT [texbat].
- **Integrator (device/system).** Cross-check GNSS-derived position and time against independent sources, inertial navigation, wheel/odometry, a holdover oscillator for timing, multi-antenna angle-of-arrival, or a second constellation/band. Make loss of GNSS integrity an explicit, alarmed state rather than a silent coast; do not let the system accept the first plausible reacquired fix without re-validation.
- **Operator.** Treat continuous, unmonitored GNSS as untrusted for safety- or security-critical decisions. Monitor for jamming/interference (a sustained L1 carrier or noise floor is the tell), define a degraded-mode procedure for loss of fix, and prefer authenticated or multi-constellation/multi-band receivers where the application warrants it. Conduct any spoofing/jamming testing only under authorisation and RF containment.
