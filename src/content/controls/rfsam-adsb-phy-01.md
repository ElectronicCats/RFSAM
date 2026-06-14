---
id: RFSAM-ADSB-PHY-01
title: Capture and decode ADS-B messages
protocol: ADSB
layer: PHY
criticality: info
applicability:
  - ADS-B
  - 1090ES
  - 978 UAT
deferred: false
objective: >-
  Determine whether the target's ADS-B transmissions can be received and decoded
  from the air with a low-cost SDR — recovering the 24-bit ICAO address, callsign,
  CPR-encoded position and velocity from DF17/DF18 Extended Squitter frames — which
  establishes the capture baseline every downstream plausibility and spoofing
  assessment depends on.
intro: >-
  ADS-B is a one-way, unencrypted, unauthenticated broadcast: there is nothing to
  decrypt, only a public waveform to receive and decode. This PHY control verifies
  the capture baseline — demodulating the 1 Mbps pulse-position waveform and reading
  out the 112-bit Extended Squitter — that the spectrum, attack and air-picture
  controls all build on. It is observational; forging frames is assessed separately
  at the Attack layer.
prerequisites:
  hardware:
    - 'A receive-only SDR: RTL-SDR Blog V4 is the canonical cheap 1090/978 MHz receiver. A 1090 MHz quarter-wave (~6.9 cm) antenna; for weak/distant traffic a 1090 MHz band-pass filter and an LNA.'
  software:
    - 'A 1090ES decoder (dump1090-fa, readsb, or gr-air-modes); for the US 978 MHz link, dump978; pyModeS to decode/inspect individual frames.'
  signal:
    freq: '1090 MHz (Mode S Extended Squitter, worldwide); additionally 978 MHz (UAT, US lower-altitude general aviation)'
    bandwidth: '~2 MHz around the carrier (a single bursty channel; no hopping)'
    modulation: 'Pulse-position modulation (PPM) at 1 Mbps; an Extended Squitter is a 112-bit frame (8 µs preamble + 112 µs data). 978 UAT uses a different ~1.04 Mbps waveform with a 272-bit message.'
  skill: beginner
attacks:
  - name: Passive eavesdropping of ADS-B
    refs:
      - costin2012ghost
      - strohmeier2013survey
    impact: >-
      Full recovery of every transmitting aircraft's identity (ICAO address,
      callsign), position and velocity in the clear — supports tracking, targeting
      and reconnaissance, and is the prerequisite observation step for any active
      spoofing.
    preconditions: A receive-capable SDR within radio range of the transmitter; no keys, no association.
    summary: >-
      Because ADS-B is an unencrypted broadcast, any receiver decodes the full
      message contents passively. The eavesdropping baseline this control verifies.
  - name: Forged-frame injection / ghost aircraft (capability enabled by missing authentication)
    refs:
      - costin2012ghost
      - schafer2013experimental
      - strohmeier2017perception
    impact: >-
      Injection of non-existent ('ghost') aircraft, modification of an existing
      track, or flooding of the air picture — every receiver in range accepts a
      well-formed 1090ES frame as a genuine aircraft.
    preconditions: >-
      A TX-capable SDR and the ability to emit a well-formed higher-power 1090ES
      frame. Out of scope for this PHY capture control; assessed at the Attack layer
      and only over a conducted/shielded path on authorised research equipment.
    summary: >-
      The same missing link-layer authentication that makes capture trivial also
      makes forged frames indistinguishable from real ones; documented experimentally
      but actively performed only under the Attack-layer control.
references:
  - key: costin2012ghost
    title: 'Ghost in the Air(Traffic): On insecurity of ADS-B protocol and practical attacks on ADS-B devices'
    authors: 'A. Costin, A. Francillon'
    venue: Black Hat USA 2012
    year: 2012
    url: 'https://www.eurecom.fr/publication/3788'
    type: talk
  - key: schafer2013experimental
    title: Experimental Analysis of Attacks on Next Generation Air Traffic Communication
    authors: 'M. Schäfer, V. Lenders, I. Martinovic'
    venue: 'Applied Cryptography and Network Security (ACNS) 2013'
    year: 2013
    url: 'https://disco.cs.rptu.de/downloads/publicationfiles/SLM13.pdf'
    type: paper
  - key: strohmeier2013survey
    title: On the Security of the Automatic Dependent Surveillance-Broadcast Protocol
    authors: 'M. Strohmeier, V. Lenders, I. Martinovic'
    venue: 'arXiv:1307.3664 (later IEEE Communications Surveys & Tutorials)'
    year: 2013
    url: 'https://arxiv.org/abs/1307.3664'
    type: paper
  - key: strohmeier2017perception
    title: On Perception and Reality in Wireless Air Traffic Communications Security
    authors: 'M. Strohmeier, M. Schäfer, R. Pinheiro, V. Lenders, I. Martinovic'
    venue: 'IEEE Transactions on Intelligent Transportation Systems 18(6) (arXiv:1602.08777)'
    year: 2017
    url: 'https://arxiv.org/abs/1602.08777'
    type: paper
  - key: sun2021riddle
    title: 'The 1090 Megahertz Riddle: A Guide to Decoding Mode S and ADS-B Signals (2nd edition)'
    authors: J. Sun
    venue: TU Delft OPEN Publishing
    year: 2021
    url: 'https://mode-s.org/1090mhz/'
    type: standard
tools:
  - rtl-sdr-v4
  - gqrx
  - dump1090
  - readsb
  - dump978
  - gr-air-modes
  - pymodes
bsam: []
resources:
  - RFSAM-RES-21
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

ADS-B 'out' is a periodic, one-way broadcast in which an aircraft reports its own
state — identity, position, velocity — with no interrogation, no association, no
encryption and no authentication [costin2012ghost][strohmeier2013survey]. Worldwide
it rides the 1090 MHz Mode S Extended Squitter (1090ES); in the US, lower-altitude
general aviation additionally uses a separate 978 MHz UAT link [strohmeier2017perception].
On 1090 MHz the signal is pulse-position modulation at 1 Mbps, and an Extended
Squitter is a fixed 112-bit frame (an 8 µs preamble followed by 112 µs of data
bits) [sun2021riddle]. There is no frequency hopping and no channelisation: every
aircraft squitters on the same carrier, so a single ~2 MHz receiver sees the whole
picture, and the only contention is overlapping bursts. On 1090 MHz the bit period
is 1 µs (a pulse in the first half of the period is a `1`, in the second half a `0`),
giving the 1 Mbps rate; the 978 MHz UAT link instead uses CPFSK at 1.041667 Mbps with
a 272-bit long message [sun2021riddle].

The 112-bit frame begins with a 5-bit downlink format. ADS-B uses **DF17** for
transponder-equipped aircraft and **DF18** for non-transponder / TIS-B transmitters;
it then carries the 24-bit ICAO aircraft address and a 5-bit type code that selects
the payload — aircraft identification (the 8-character callsign), airborne or surface
position (latitude/longitude in Compact Position Reporting, CPR, encoding), or
velocity [sun2021riddle]. A 24-bit parity field lets a receiver validate the frame.
Crucially, **none of the identifiers is authenticated**: the ICAO address, callsign
and CPR position are broadcast in the clear with no signature and no integrity over
the source, so a receiver cannot tell a genuine aircraft from a forged one
[costin2012ghost][strohmeier2013survey].

This control verifies only the **receive-and-decode** baseline — the passive
eavesdropping that the literature established is trivially feasible with a cheap SDR
[costin2012ghost]. That same absent authentication is what makes the active attack
families possible: experimental work has demonstrated message injection ('ghost
aircraft'), track modification, jamming and flooding against ADS-B receivers
[schafer2013experimental][strohmeier2017perception]. Those are **legally sensitive
transmit operations** on protected aviation safety spectrum and are assessed under
the Attack-layer control, not here; this PHY control stays receive-only.

## Procedure

> Receive-only throughout. Capturing and decoding ADS-B is passive and generally
> lawful, but transmitting on 1090/978 MHz is not — do not transmit at any step here.

1. Confirm the band is alive before committing a decoder. Tune an SDR to 1090 MHz in
   a waterfall viewer and watch for the short, bursty Extended-Squitter pulses (ADS-B
   sits above the noise floor, so they are visibly bursty):
   ```bash
   gqrx
   # set the device to your RTL-SDR, tune 1090.000 MHz, sample rate ~2.4 MSPS
   ```
   Expected: intermittent narrow pulses popping up at the carrier as aircraft
   squitter. If you see nothing, check the antenna/filter chain (a 1090 MHz band-pass
   filter + LNA dramatically lifts weak traffic) before blaming the decoder.

2. Decode the 1090ES link with a primary decoder. dump1090-fa demodulates the PPM
   bursts, validates the parity and decodes DF17/DF18, with an interactive table:
   ```bash
   dump1090-fa --device-type rtlsdr --gain -10 --interactive
   ```
   Expected: a live table of aircraft keyed by ICAO hex address, with callsign,
   altitude, position (once a CPR even/odd pair is collected) and speed. A handful of
   rows means a few local aircraft; a busy sky fills the table. `--gain -10` selects
   the tuner's automatic gain.

3. Serve the decoded feed for downstream tooling. For a permanent or busy receiver,
   run readsb and emit network output (Beast/raw/JSON) instead of (or as well as) the
   interactive view:
   ```bash
   readsb --device-type rtlsdr --net --write-json /run/readsb
   ```
   Expected: readsb starts, tracks many aircraft at once, and serves a JSON
   `aircraft.json` (consumed by a map such as tar1090) plus Beast/raw ports — the
   handoff point to the Application-layer air-picture and plausibility controls.

4. (US only) Add the 978 MHz UAT link. The 1090 decoders do not cover UAT; tune a
   second SDR to 978 MHz and run dump978 alongside:
   ```bash
   dump978-fa --sdr driver=rtlsdr | readsb --net --net-only --uat-in-port 30978
   ```
   Expected: UAT downlink frames from lower-altitude general aviation, merged into the
   same aircraft picture.

5. Verify decode correctness on individual frames with pyModeS — the decode you can
   reason about by hand. Feed a hex frame to the CLI:
   ```bash
   modes decode 8D406B902015A678D4D220AA4BDA
   ```
   Expected: `df 17`, `icao 406B90`, `typecode 4` (identification), callsign
   `EZY85MH` — confirming the demodulated bits decode to a sensible identity. This is
   the per-frame ground truth behind the live table.

6. (Optional) Demodulate inside a flowgraph instead of a black-box decoder, when you
   want to see each DSP stage (preamble correlation, bit slicing):
   ```bash
   uhd_modes.py     # gr-air-modes receiver, or run its GNU Radio flowgraph
   ```
   Expected: the same DF17/DF18 decode, with the signal processing exposed for
   inspection or modification.

## Field case

A reproducible bench check using pyModeS's own published example frames (no air
capture or transmitter required), confirming the decode chain end to end. Decode a
matched CPR even/odd airborne-position pair plus an identification and a velocity
frame:

```bash
modes decode 8D40058B58C901375147EFD09357,8D40058B58C904A87F402D3B8C59,8D406B902015A678D4D220AA4BDA
```

The two `8D40058B…` frames are the even and odd halves of one CPR position for ICAO
`40058B`; together they resolve to a single latitude/longitude. The
`8D406B902015A678D4D220AA4BDA` frame is a DF17 type-code-4 identification for ICAO
`406B90`, decoding to callsign `EZY85MH`. A globally-referenced position decode for a
single even frame (no pair needed) confirms the CPR maths against a known receiver
location:

```bash
modes decode 8D40058B58C901375147EFD09357 --reference 49.0 6.0
```

These are the canonical pyModeS test vectors, so the expected outputs are stable: a
`40058B` position near the 49.0 N, 6.0 E reference and the `406B90` / `EZY85MH`
identity. This is the verifiable, reproducible core of the field case — the decode
chain confirmed against fixed, published frames, with no air capture or transmitter
required.

Illustrative walkthrough — substitute the values you capture: on a real over-the-air
session you would replace these vectors with live frames from step 2/3 and record the
receiver-side numbers for the local environment. No author-measured live ADS-B capture
is recorded here; the representative over-the-air figures — distinct aircraft seen over
a session, fraction of frames passing parity, maximum range with/without a 1090 MHz
LNA+filter — are [FILL: measured receiver statistics], to be filled from an authorised
on-site capture.

## Remediation

ADS-B's exposure is architectural — the link is plaintext and unauthenticated by
design [costin2012ghost][strohmeier2013survey] — so "remediation" at this layer is
about not over-trusting the feed rather than securing the radio.

- **Developer (avionics / receiver firmware):** do not treat a decoded DF17/DF18
  frame as a trusted assertion of position or identity. Parity (the 24-bit CRC)
  proves the frame arrived intact, not that it came from the aircraft it names
  [sun2021riddle]. Where feasible, design toward the authenticated/integrity-protected
  ADS-B extensions and broadcast-authentication schemes proposed in the literature
  rather than the bare link [strohmeier2017perception].

- **Integrator (tracking / display / fusion systems):** never rely on ADS-B as a sole
  source of truth. Fuse it with independent sensors (primary/secondary radar,
  multilateration that times the same frame at several stations to fix an aircraft
  independently of what it claims) and run plausibility checks — impossible
  kinematics, positions inconsistent across receivers, ICAO addresses that should not
  be airborne [schafer2013experimental][strohmeier2017perception]. These detections
  are implemented at the Application layer; this PHY capture is their input.

- **Operator (researcher / SOC running a receiver):** keep receive-only — capturing
  and decoding ADS-B is passive and generally lawful, but transmitting on 1090/978 MHz
  is protected aviation safety spectrum and must never be radiated; any spoofing/
  injection assessment belongs to the Attack-layer control and is done only on
  authorised research equipment over a conducted (cabled) or shielded (Faraday)
  path, never on-air [strohmeier2017perception]. Log receiver statistics so an
  anomalous flood or a ghost track is visible against a known baseline.
