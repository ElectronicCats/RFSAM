---
id: RFSAM-SUBG-SP-01
title: Sweep the ISM bands and discover sub-GHz bursts
protocol: SUBG
layer: SP
criticality: info
applicability:
  - 315 MHz
  - 433.92 MHz
  - 868 MHz
  - 915 MHz ISM
deferred: false
objective: >-
  Determine whether a sub-GHz device's transmissions can be found and
  characterised at the spectrum layer, locating the carrier, classifying the
  modulation as OOK/ASK or (G)FSK, and recording the burst timing, so that
  later capture and replay controls can act on a known layer-1 target.
intro: >-
  Sub-GHz ISM is where most remotes, sensors, alarms and key fobs live. The
  first RF step is finding the carrier: which ISM band, what modulation, what
  burst structure. A cheap RTL-SDR sees the whole band; the discover-then-work-it
  workflow Ossmann formalised as "Rapid Radio Reversing" then drops to a
  CC1101-class transceiver to receive and transmit at the recovered settings.
prerequisites:
  hardware:
    - 'A wideband receive SDR: RTL-SDR V4 (sub-1 GHz is well within its tuning range) or HackRF One (reaches 868/915 with margin)'
    - 'Optionally a CatSniffer (Semtech SX1262) to scan 433/868/915 MHz as a board-native spectrum view, no SDR'
  software:
    - 'gqrx (waterfall/spectrum view), rtl_433 (live device scan and pulse analyzer), optionally catnip for the CatSniffer SX1262'
  signal:
    freq: '315 MHz (NA/Asia remotes, TPMS) · 433.92 MHz (global workhorse) · 868 MHz (EU SRD, wM-Bus) · 915 MHz (US ISM, 902 to 928)'
    bandwidth: 'Narrow ISM channels; a few hundred kHz per device burst'
    modulation: 'OOK/ASK (carrier blinks the bits) or (G)FSK (carrier shifts between two tones); no spread spectrum'
  skill: beginner
attacks: []
references:
  - key: ossmann2015rapid
    title: 'Rapid Radio Reversing (ToorCon San Diego 17, 2015)'
    authors: Michael Ossmann
    venue: ToorCon / Great Scott Gadgets
    year: 2015
    url: 'https://greatscottgadgets.com/2015/12-29-rapid-radio-reversing-toorcon-2015/'
    type: talk
  - key: ossmann2016simplisafe
    title: Low Cost SimpliSafe Attacks
    authors: Michael Ossmann
    venue: Great Scott Gadgets
    year: 2016
    url: 'https://greatscottgadgets.com/2016/02-20-low-cost-simplisafe-attacks/'
    type: blog
  - key: zonenberg2016simplisafe
    title: 'Hack Disarms SimpliSafe’s Home Wireless Security Systems'
    authors: Andrew Zonenberg (IOActive); reported by Threatpost
    venue: Threatpost
    year: 2016
    url: 'https://threatpost.com/hack-disarms-simplisafes-home-wireless-security-systems/116334/'
    type: blog
  - key: rtl433
    title: 'rtl_433: generic data receiver for the 433.92/315/868/915 MHz ISM bands'
    authors: 'Benjamin Larsson (merbanan) et al.'
    venue: GitHub
    year: 2026
    url: 'https://github.com/merbanan/rtl_433'
    type: tool
  - key: rtl433ops
    title: 'rtl_433 operation / command-line reference (-A pulse analyzer, -f hopping, -F json)'
    venue: triq.org
    year: 2026
    url: 'https://triq.org/rtl_433/OPERATION.html'
    type: tool
  - key: gqrx
    title: 'Gqrx: software defined radio receiver (GNU Radio + Qt)'
    authors: A. Csete (csete) et al.
    venue: GitHub
    year: 2026
    url: 'https://github.com/gqrx-sdr/gqrx'
    type: tool
  - key: fccid
    title: 'FCC ID Search: operating frequency, modulation and test exhibits by FCC ID'
    venue: Federal Communications Commission (OET)
    year: 2026
    url: 'https://www.fcc.gov/oet/ea/fccid'
    type: standard
tools:
  - rtl-sdr-v4
  - hackrf-one
  - gqrx
  - rtl-433
  - catnip
  - yard-stick-one
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-15
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Unlicensed short-range devices cluster in a handful of regional ISM slices well below 1.7 GHz: 315 MHz (North America/Asia remotes and TPMS), 433.92 MHz (the global workhorse, remotes, sensors, alarms), 868 MHz (EU SRD, wM-Bus meters, smart-home) and 915 MHz (US ISM, 902 to 928). Because the whole band sits below 1 GHz, a cheap RTL-SDR can see it end to end; there is no spread spectrum here, so once you know the centre frequency and rough baud the signals are simple to demodulate [[ossmann2015rapid]].

Almost every device in this space keys its bits with **OOK/ASK** (on-off keying, the carrier blinks the bits, the cheapest thing to build) or **(G)FSK** (the carrier shifts between two frequencies). On a waterfall the two are visually distinct: OOK looks like blinking blocks at a single frequency, FSK like two stacked lines. Bits are usually PWM/Manchester/PPM at a few hundred to a few thousand baud, sent as short bursts that often repeat several times per press for reliability [[ossmann2015rapid]].

The discovery method this control follows is Ossmann's "Rapid Radio Reversing": use a wideband SDR (HackRF) to **find and characterise** the signal, frequency, modulation, timing, then drop to a narrowband CC1101-class transceiver (YARD Stick One + rfcat) to **work it** at the recovered layer-1 settings. Ossmann's point is that SDR is the most valuable single tool for finding the signal, but a non-SDR transceiver is often faster for the receive/transmit work once the parameters are known; the two are complementary [[ossmann2015rapid]].

Much of the layer-1 answer can also be read off the device before any RF. The FCC ID printed on a US-market label resolves the exact operating frequency, modulation and a full test report through the FCC's equipment-authorization search (or mirrors such as fccid.io), frequently confirming the band and modulation without touching a radio [[fccid]]. That label lookup belongs to the IG step; this control confirms it on the air.

Two complementary on-air views make the discovery fast. A **gqrx** waterfall shows the live carrier, the modulation shape and the rough burst timing as you trigger the device [[gqrx]]. Pointing **rtl_433** at the band turns every burst it already has a decoder for into a live JSON line naming the device and frequency, rtl_433 ships ~320 device protocols (representative, the count grows as decoders are added) and defaults to 433.92 MHz, which is often the fastest way to confirm what is on the air before committing a capture tool [[rtl433]]. For an unrecognised gadget rtl_433 still shows energy but no decode; its pulse analyzer (`-A`) then reports the pulse/gap timing so you can estimate the encoding by hand [[rtl433ops]].

This is a capability/observation control, not an attack: it establishes that a target's transmissions are findable and classifiable. The finding it sets up, and which later SUBG controls act on, is that any device transmitting unauthenticated OOK/FSK bursts in the clear (most cheap ISM remotes and sensors) is replayable or forgeable once characterised [[ossmann2016simplisafe]].

## Procedure

> Receive-only at this layer; you are listening, not transmitting. Even so, monitor only equipment you own or are explicitly authorised to assess.

1. **Pin the candidate band from the label first (IG carry-over).** If the device carries an FCC ID, look it up to get the operating frequency and modulation before any RF:
   - Search the ID at the FCC OET equipment-authorization page [[fccid]]:
     ```
     https://www.fcc.gov/oet/ea/fccid
     ```
   - Read the granted frequency range and emission designator from the grant/test report. Expected: one of the ISM slices (315 / 433.92 / 868 / 915 MHz) and an ASK/FSK emission. This narrows the sweep below to one band.

2. **Sweep the band visually while triggering the device.** Open gqrx on the receive SDR, tune to the candidate centre, and watch the waterfall as you press the remote / wait for the sensor to report [[gqrx]]:
   ```bash
   gqrx
   ```
   Set device to RTL-SDR (or HackRF), centre frequency to `433.920 MHz`, sample rate `2.4 MS/s`. Expected: a short burst flares on the waterfall each time you trigger the device. Read off whether it is **OOK/ASK** (blinking blocks at one frequency) or **(G)FSK** (two parallel lines), the exact centre frequency, and the rough on/off timing.

3. **Confirm and name the device with a live rtl_433 scan.** Point rtl_433 at the band; if it is a known class you get the identity for free [[rtl433]]:
   ```bash
   rtl_433 -f 433.92M -F json
   ```
   Expected (a recognised device, e.g. a weather sensor or TPMS), one JSON line per burst with named fields:
   ```json
   {"time":"2026-06-14 12:00:00","model":"Acurite-Tower","id":1234,"channel":"A","temperature_C":21.3,"humidity":48,"battery_ok":1}
   ```
   The `model`, `id` and frequency confirm the band and the protocol family. To watch several bands at once, hop with repeated `-f` plus a dwell time [[rtl433ops]]:
   ```bash
   rtl_433 -f 315M -f 433.92M -f 868M -H 10
   ```

4. **For an unrecognised burst, read the timing with the pulse analyzer.** If rtl_433 shows energy but no decode, disable the decoders and run the analyzer to recover pulse/gap timing and a probable coding [[rtl433ops]]:
   ```bash
   rtl_433 -f 433.92M -R 0 -A
   ```
   Expected: a statistical overview of pulse width, gap width and period, with a guessed coding (OOK_PWM / OOK_PCM etc.) and an estimated bit rate, the layer-1 numbers you need to configure the next tool.

5. **(Optional) Board-native spectrum without an SDR.** Drive the CatSniffer's SX1262 as a sub-GHz spectrum scanner with catnip to find activity on 433/868/915 MHz from the board alone, a CatSniffer alternative to the gqrx waterfall for locating where a device transmits.

6. **Record the layer-1 profile and (optionally) verify it on a CC1101 radio.** Write down centre frequency, modulation, shortest pulse (→ baud) and burst-repeat count. To confirm the parameters are right, configure a YARD Stick One with rfcat at those settings and receive the burst, Ossmann's "work it" half of the flow (this hands off to the SUBG capture/LL control). Expected: the same burst received cleanly at the chosen frequency/modulation/baud confirms the profile.

## Field case

The clearest worked example of this discover-then-work-it flow is Ossmann's "Low Cost SimpliSafe Attacks" follow-up to Andrew Zonenberg's (IOActive) SimpliSafe research [[ossmann2016simplisafe]] [[zonenberg2016simplisafe]].

Zonenberg's original work used a logic analyser to reverse the protocol and a custom microcontroller (~$250 of SimpliSafe parts plus boards) to passively capture the "PIN entered" packet and replay it on demand to disarm the alarm [[zonenberg2016simplisafe]]. Ossmann then reproduced and undercut it with off-the-shelf RF tools at less than half the cost: he used a **HackRF One** to monitor the keypad transmissions and characterise the signal, then a **YARD Stick One (~$100) with rfcat**, plus **inspectrum** to visualise the waveform and Python to decode, to receive and replay [[ossmann2016simplisafe]].

The layer-1 profile he recovered at the spectrum step: the keypad transmitted on **433 MHz** using **amplitude-shift keying** (Ossmann notes Zonenberg labelled it OOK and that "the difference between ASK and OOK is subtle"), with an uncommon **Pulse Interval and Width Modulation (PIWM)** encoding. Visualising the waveform, he identified the frequency and modulation and "within seconds" was decoding raw symbols; working out the PIWM encoding from the packet data was the hard part, taking roughly two hours [[ossmann2016simplisafe]]. That spectrum/PHY characterisation, frequency, ASK, burst timing, is exactly the output this control produces; the replay/disarm that followed is the downstream SUBG attack control, performed only against equipment under the tester's authority.

The same discover-then-work-it flow applies unchanged to a garage/gate remote, a TPMS sensor, or a 433 MHz weather station: a representative weather sensor surfaces immediately as a named `rtl_433 -f 433.92M -F json` line (`model`, `id`, `temperature_C`), confirming band and protocol with no SDR waterfall reading at all.

## Remediation

Discovery feasibility is a baseline finding rather than a fixable defect, the air is observable to anyone with a $30 receiver. The mitigations live one layer up, at what the burst *contains*, and are layered by who owns the design:

- **Developer (device/firmware):** Do not rely on the burst being unseen. Treat every transmitted frame as fully observable: do not put secrets, fixed unlock codes, or static identifiers in the clear. Where a control action matters (locks, alarms, garage doors), use a rolling/hopping code or an authenticated, freshness-protected message so that a captured burst cannot be replayed, the SimpliSafe class of replay attack exists precisely because the disarm packet was static and reusable [[zonenberg2016simplisafe]].
- **Integrator (product/system):** Choose modules whose protocol is encrypted and anti-replay rather than fixed-code OOK, and verify the choice empirically, run the gqrx + rtl_433 sweep above against your own unit and confirm the security-relevant frames are not trivially decoded or replayable. Cross-check the FCC grant to confirm the radio behaves as the datasheet claims [[fccid]].
- **Operator (deployment):** Assume the link is in the clear and observable from outside the premises; do not treat "it's wireless and proprietary" as confidentiality. For high-value functions, prefer devices with documented rolling-code/authenticated links, and monitor for the abnormal repeated bursts that capture-and-replay or jam-and-capture tooling produces.
