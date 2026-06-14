---
id: RFSAM-SUBG-PHY-01
title: Demodulate and frame a Sub-GHz burst
protocol: SUBG
layer: PHY
criticality: low
applicability:
  - OOK/ASK
  - 2-FSK
  - GFSK
  - Manchester
  - PWM
  - PPM
deferred: false
objective: >-
  Verify whether a captured Sub-GHz burst can be demodulated to a clean
  bitstream and framed into symbols — recovering the modulation, bit rate and
  line coding well enough to deliver bits to the link layer — without any key
  material.
intro: >-
  Most ISM-band devices transmit narrowband OOK/ASK or (G)FSK with no spreading
  or scrambling, so a captured burst demodulates to bits with SDR tooling plus a
  CC1101-class radio. This control turns the waveform into framed symbols — the
  prerequisite that every downstream replay, forgery or analysis depends on.
prerequisites:
  hardware:
    - 'A receive-capable SDR for I/Q capture: RTL-SDR Blog V4 (sub-GHz, RX only) or HackRF One (wideband, half-duplex)'
    - 'Optionally a CC1101/CC1111-class transceiver for hardware demodulation: YARD Stick One, or the CatSniffer SX1262 for (G)FSK'
  software:
    - 'Universal Radio Hacker (demodulate + auto-detect modulation/bit rate)'
    - 'rtl_433 (pulse demodulator and analyzer, -A / -X flex)'
    - 'rfcat (drive a YARD Stick One at recovered layer-1 settings)'
  signal:
    freq: '315 / 433.92 / 868 / 915 MHz regional ISM (sub-1.7 GHz)'
    bandwidth: 'Narrowband — a few kHz to low tens of kHz; sample rate must cover the burst bandwidth'
    modulation: 'OOK/ASK or (G)FSK; line coding usually PWM, PPM, Manchester or raw NRZ at a few hundred to a few thousand baud'
  skill: intermediate
attacks:
  - name: Clear-channel demodulation (rapid radio reversing)
    refs:
      - ossmann2015rrr
      - rtl433primer
    impact: >-
      Recovers the device's bitstream from a passive capture with no key, exposing
      the frame contents and enabling the downstream capture/replay and forgery steps.
    preconditions: >-
      A clean I/Q recording centred on the carrier; the signal is unspread,
      unscrambled OOK/ASK or (G)FSK, as nearly all sub-GHz ISM devices are.
    summary: >-
      Because the waveform carries the bits in the clear, demodulating and framing
      it is a tooling exercise, not a cryptographic one — the PHY layer offers no
      barrier on its own.
  - name: Automatic demodulation-parameter detection
    refs:
      - pohl2018urh
      - pohl2019autopre
    impact: >-
      Estimates modulation, bit length/rate and line coding directly from the I/Q,
      letting an auditor skip the physical layer and work at the protocol level.
    preconditions: A captured signal loaded into URH; enough samples to estimate the bit length.
    summary: >-
      URH and its auto-detection routine infer the demodulation parameters from the
      recording, lowering the skill needed to frame an unknown burst.
references:
  - key: rtl433primer
    title: 'rtl_433 — Primer on ISM-band signal modulation and pulse coding (OOK/ASK, FSK, PWM/PPM/Manchester/NRZ)'
    authors: 'B. Larsson (merbanan) et al.'
    venue: rtl_433 project documentation
    year: 2024
    url: 'https://github.com/merbanan/rtl_433/blob/master/docs/PRIMER.md'
    type: spec
  - key: ossmann2015rrr
    title: 'Rapid Radio Reversing'
    authors: M. Ossmann
    venue: ToorCon 2015
    year: 2015
    url: 'https://archive.org/details/ossmann-rapid-radio-reversing-toorcon-2015'
    type: talk
  - key: pohl2018urh
    title: 'Universal Radio Hacker: A Suite for Analyzing and Attacking Stateful Wireless Protocols'
    authors: 'J. Pohl, A. Noack'
    venue: USENIX WOOT 2018
    year: 2018
    url: 'https://www.usenix.org/conference/woot18/presentation/pohl'
    type: paper
  - key: pohl2019autopre
    title: 'Automatic Wireless Protocol Reverse Engineering'
    authors: 'J. Pohl, A. Noack'
    venue: USENIX WOOT 2019
    year: 2019
    url: 'https://www.usenix.org/conference/woot19/presentation/pohl'
    type: paper
  - key: urhrepo
    title: 'Universal Radio Hacker (URH) — source repository'
    authors: 'J. Pohl (jopohl)'
    venue: GitHub
    year: 2024
    url: 'https://github.com/jopohl/urh'
    type: tool
  - key: rtl433repo
    title: 'rtl_433 — decoder for ISM-band radio transmissions'
    authors: 'B. Larsson (merbanan) et al.'
    venue: GitHub
    year: 2024
    url: 'https://github.com/merbanan/rtl_433'
    type: tool
tools:
  - universal-radio-hacker
  - rtl-433
  - rfcat
  - rtl-sdr-v4
  - hackrf-one
  - yard-stick-one
bsam: []
resources:
  - RFSAM-RES-15
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Sub-GHz ISM devices are built for cost, not stealth: nearly all of them transmit narrowband **OOK/ASK** (the carrier blinks the bits on and off) or **(G)FSK** (the carrier shifts between two tones), with no spread-spectrum and no scrambling [rtl433primer]. That makes the physical layer a pure signal-processing problem — there is no key, no de-spreading, and no channel hopping to defeat before the bits appear. Demodulation recovers the symbol stream; framing then resolves the **line coding** — typically PWM, PPM, Manchester or raw NRZ at a few hundred to a few thousand baud — into bits [rtl433primer].

Two demodulation paths exist, and they are equivalent at this layer. A **software path** loads an I/Q recording from an SDR and slices it: rtl_433 runs a pulse demodulator and, with `-A`, reports the measured pulse width, gap width and period so you can read the coding by eye, while `-X` lets you write a flex decoder for an unrecognised device [rtl433primer]. A **hardware path** programs a CC1101/CC1111-class transceiver (driven by rfcat) to the recovered carrier, modulation and baud, letting the radio chip itself do the demodulation — the hybrid SDR-plus-dedicated-radio workflow Ossmann set out as "rapid radio reversing" [ossmann2015rrr]. Universal Radio Hacker sits in the middle: it visualises the burst, **auto-detects the modulation and bit length** directly from the I/Q, and extracts the bitstream [pohl2018urh][urhrepo]. That auto-detection — estimating all the demodulation parameters from the recording so an analyst can skip the physical layer — is the subject of Pohl and Noack's follow-on work [pohl2019autopre].

The security relevance at PHY is exactly this absence of a barrier. Because the bits travel in the clear, framing the burst is a tooling exercise rather than a cryptographic one [ossmann2015rrr][rtl433primer]; the recovered bitstream is what every downstream control — capture/replay, rolling-vs-fixed determination, forgery — consumes. This control verifies only that the bits can be recovered cleanly; it does not yet replay or forge them.

The applicability list and the bit-rate range ("a few hundred to a few thousand baud") are the representative envelope for the band — the modulation and line-coding families and the few-hundred-to-few-thousand-baud range are the general behaviour documented for ISM-band devices [rtl433primer], not a guarantee for any one target, which must be measured per device.

## Procedure

All steps below are passive receive-and-demodulate. They involve no transmission and so need no special authorisation, but any later replay/forgery step does — perform those only on equipment you own or are explicitly authorised to test.

1. **Capture the burst as I/Q**, centred on the carrier found at the Spectrum step, at a sample rate that comfortably covers the burst bandwidth. With an RTL-SDR or HackRF:
   ```bash
   rtl_sdr -f 433920000 -s 1024000 -g 40 capture.iq
   ```
   Trigger the device a few times during the capture. A non-empty file with visible energy when you trigger the device confirms a usable recording; silence means re-check the frequency/gain.

2. **Read the modulation and timing with rtl_433's analyzer.** Point it at the band and enable the analyzer/verbose pulse output:
   ```bash
   rtl_433 -f 433.92M -A
   ```
   Expected: for a recognised device, a JSON line naming it; for an unknown one, the analyzer prints measured **pulse width, gap width and pulse period** and a guess at the coding (OOK_PWM / OOK_PPM / OOK_MC / FSK). Read those numbers — they are the bit rate and line coding [rtl433primer].

3. **Demodulate and frame in Universal Radio Hacker** when rtl_433 has no decoder. Load the recording and let URH auto-detect:
   ```bash
   urh                       # GUI: Interpretation tab → "Autodetect parameters"
   ```
   Expected: URH labels the **modulation** (ASK/FSK), estimates the **bit length / samples-per-symbol**, and renders the burst as a bit string. Set the decoding (Manchester / PWM / NRZ) until the preamble and a stable structure appear [pohl2018urh][pohl2019autopre].

4. **Confirm the framing is correct**, not just plausible. The same physical press, captured twice, must demodulate to the same bits (for a fixed-code device) or differ only in the expected counter field (rolling). A demod whose bit count drifts between identical presses means the bit length or coding is still wrong — return to step 3.

5. **(Optional) Validate against a hardware demodulator.** Program a YARD Stick One to the recovered settings and receive the same burst, cross-checking the bitstream:
   ```python
   # rfcat (interactive)
   d.setFreq(433920000)
   d.setMdmModulation(MOD_ASK_OOK)
   d.setMdmDRate(2400)            # baud recovered above
   print(d.RFrecv())
   ```
   Matching bits from an independent CC1111 radio confirm the PHY parameters are right and not an SDR artefact.

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative worked example for a generic 433.92 MHz fixed-code remote (e.g. an EV1527/PT2262-class OOK doorbell or socket remote — the most common class on the band, decoded by rtl_433's named protocols [rtl433repo]), not a measured capture of a specific named unit. The modulation family (OOK/ASK), the fixed-code outcome and the per-press repetition are the general, citable behaviour of this device class [rtl433primer][rtl433repo]; the numeric values are device-specific and must be measured, so they are left as `[FILL: …]` placeholders:

- Sweep confirmed the carrier at **433.92 MHz**; the waterfall showed short OOK bursts (blinking blocks, not two stacked FSK lines) each time the button was pressed.
- `rtl_433 -f 433.92M -A` reported the burst as **OOK_PWM** with a short pulse of `[FILL: short-pulse µs]` and a long pulse of `[FILL: long-pulse µs]`, period `[FILL: period µs]` — i.e. a bit rate of roughly `[FILL: baud]` baud.
- Loaded into URH, autodetect labelled the signal **ASK**, bit length `[FILL: samples-per-symbol]`, and resolved the frame to `[FILL: N]` bits per burst, repeated several times per press.
- The two captures of the same button press demodulated to an **identical** bitstream — establishing this as a *fixed code* (the fixed-vs-rolling determination this PHY framing hands to the link/attack layers), so a plain capture-and-replay is the relevant downstream test rather than a RollJam-class technique.

## Remediation

Demodulation is auditor-side — there is no "fix" for the ability to recover bits from a clear waveform. The defensive value of this control is what the clean bitstream proves: that **the PHY layer authenticates nothing**. Layered guidance for the parties who can act on it:

- **Developer (device firmware/silicon).** Do not treat a stable, recoverable ID broadcast in the clear as a security property — identification is not authentication. If confidentiality or integrity matters, add it above the PHY (an authenticated/encrypted payload, a true rolling code with an adequate window, a freshness/nonce field), because the waveform itself will always demodulate [ossmann2015rrr][rtl433primer]. Avoid trivially short keyspaces (e.g. 8–12 DIP-switch bits) that a recovered frame format makes brute-forceable.
- **Integrator (product builder).** Choose modules whose security does not rest on obscurity of the modulation or line coding; assume an auditor (and an attacker) can frame the burst with rtl_433 or URH within minutes [pohl2018urh]. Where a clear-text fixed code is unavoidable for a function, ensure that function is not safety- or access-critical, or gate it behind a second, authenticated channel.
- **Operator (deployment).** Recognise that a captured remote, sensor or contact-closure signal can be reproduced from a passive recording; for access-control or safety roles, prefer devices documented to use authenticated rolling codes, and monitor for the replay/jamming the demodulated frame enables downstream. Frame any vendor protocol list as representative — check current advisories and rtl_433's supported-device set, which change often [rtl433repo].
