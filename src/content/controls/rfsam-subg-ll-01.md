---
id: RFSAM-SUBG-LL-01
title: Recover frame structure and addressing
protocol: SUBG
layer: LL
criticality: medium
applicability:
  - fixed-code remotes
  - gates
  - garages
  - alarm sensors
  - TPMS
  - ISM telemetry
deferred: false
objective: >-
  Determine whether a Sub-GHz device's frame structure and addressing can be
  recovered from captured bursts — the preamble/sync word, the device address/ID,
  the command/state fields, any counter, and the checksum/CRC — and whether that
  address acts as authentication or merely as identification.
intro: >-
  At the link layer a Sub-GHz burst is just an ID plus a few state bytes and a
  checksum. This control recovers that frame format and, critically, the device
  address — the field a receiver uses to decide whose message it is. On most ISM
  devices that address is a fixed, in-the-clear identifier, so recovering the
  frame is equivalent to recovering everything the receiver trusts.
prerequisites:
  hardware:
    - 'A receive-capable Sub-GHz radio: RTL-SDR V4 or HackRF One for I/Q, or a CC1101-class transceiver (YARD Stick One) / CC1101 Flipper Zero for on-radio capture'
  software:
    - 'rtl_433 (known device classes), Universal Radio Hacker (unknown frames), rfcat / flipperzero-firmware (on-radio capture)'
  signal:
    freq: '315 / 433.92 / 868 / 915 MHz regional ISM'
    bandwidth: 'Narrowband burst, typically well under 100 kHz'
    modulation: 'OOK/ASK or 2-(G)FSK; PWM / Manchester / PPM line coding at a few hundred to a few thousand baud'
  skill: intermediate
attacks:
  - name: Fixed-address identification-as-authentication
    refs:
      - ev1527
      - rtl433dataformat
    impact: >-
      A receiver that acts on any frame carrying a known device ID will act on a
      replayed or forged frame bearing that same ID — the recovered address is
      sufficient to be trusted.
    preconditions: The device address is a fixed, in-the-clear field with no rolling counter, MAC, or signature over the frame.
    summary: >-
      Encoders such as EV1527/PT2262 send a one-time-programmed address plus a few
      data bits in clear OOK; the address identifies the device but does not
      authenticate the message, so recovering the frame yields everything the
      receiver checks.
  - name: Small fixed-address keyspace (OpenSesame)
    refs:
      - opensesame
      - hackaday-opensesame
    impact: >-
      Where the address is set by 8–12 DIP switches the keyspace is 2^8–2^12, so
      the address can be enumerated rather than captured; a De Bruijn sequence
      collapses the brute-force time to seconds.
    preconditions: Fixed-code receiver with a short DIP-switch address space and no rate limiting; active transmission (assessed under RFSAM-SUBG-AT-01).
    summary: >-
      Once the frame shows the address is a handful of DIP-switch bits, the whole
      address space is enumerable; the brute force itself belongs to the Attack
      layer, but recovering the frame is what reveals the keyspace.
references:
  - key: rtl433
    title: 'rtl_433 — decode radio transmissions from devices on the ISM bands'
    authors: B. Larsson (merbanan) and contributors
    venue: GitHub
    year: 2026
    url: 'https://github.com/merbanan/rtl_433'
    type: tool
  - key: rtl433dataformat
    title: 'rtl_433 JSON data fields (model / id / channel)'
    venue: triq.org (rtl_433 project documentation)
    year: 2026
    url: 'https://triq.org/rtl_433/DATA_FORMAT.html'
    type: spec
  - key: urh
    title: 'Universal Radio Hacker: investigate wireless protocols like a boss'
    authors: J. Pohl, A. Noack
    venue: GitHub (USENIX WOOT 2018)
    year: 2018
    url: 'https://github.com/jopohl/urh'
    type: tool
  - key: ossmann2015
    title: 'Rapid Radio Reversing (ToorCon 2015)'
    authors: M. Ossmann
    venue: ToorCon 2015 / Black Hat Asia 2016
    year: 2015
    url: 'https://greatscottgadgets.com/2015/12-29-rapid-radio-reversing-toorcon-2015/'
    type: talk
  - key: ossmann2015archive
    title: 'Rapid Radio Reversing, ToorCon 2015 (video)'
    authors: M. Ossmann
    venue: Internet Archive
    year: 2015
    url: 'https://archive.org/details/ossmann-rapid-radio-reversing-toorcon-2015'
    type: talk
  - key: ev1527
    title: 'EV1527 OTP encoder — datasheet, pinout and frame (preamble + 20-bit address + 4-bit data)'
    venue: components101
    year: 2021
    url: 'https://components101.com/ics/ev1527-encoder-ic-pinout-datasheet-equivalent-circuit-specs'
    type: standard
  - key: opensesame
    title: 'OpenSesame — open most fixed-code garages and gates in seconds using a Mattel toy'
    authors: S. Kamkar
    venue: GitHub
    year: 2015
    url: 'https://github.com/samyk/opensesame'
    type: tool
  - key: hackaday-opensesame
    title: 'Hacking the IM-ME to open garages (De Bruijn sequence, 12 DIP-switch keyspace)'
    authors: Hackaday
    venue: Hackaday
    year: 2015
    url: 'https://hackaday.com/2015/06/08/hacking-the-im-me-to-open-garages/'
    type: blog
tools:
  - rtl-433
  - universal-radio-hacker
  - rfcat
  - flipperzero-firmware
bsam: []
resources:
  - RFSAM-RES-15
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A Sub-GHz frame is small: a preamble/sync, a device address (ID), a few command or sensor bytes, and usually a checksum, sent in short bursts that often repeat several times per event for reliability. The link-layer question this control answers is **whose frame is it, and what does the receiver check** — which means recovering the frame structure and, above all, the address field.

For the hundreds of recognised device classes, `rtl_433` demodulates and decodes the burst to named JSON fields in one pass, exposing the model, the device `id`, and the payload [rtl433]. The project's data-format documentation is explicit that the `id` field is "Device identification. Used to differentiate between devices of same model," and that depending on the device it "may be a non-volatile value programmed into the device, a volatile value that changes at each power on (or battery change), or a value configurable by user e.g. by switch or jumpers" [rtl433dataformat]. That single sentence is the crux of the layer: the address is *identification*, not *authentication* — the receiver uses it to decide a frame is "for me," but nothing in the frame proves the frame was produced by the legitimate transmitter.

For an unrecognised or proprietary frame, Universal Radio Hacker is the reversing workbench: load the demodulated bitstream, then diff several captures of the same and different events to label the fields — the bytes that never change across presses are the address/preamble, the bytes that change with the button are the command, and a multi-byte field that increments every press is a rolling counter [urh]. Capturing two presses and seeing what changes is the fastest route from raw bits to a labelled frame. (URH's repository is archived but remains the de-facto unknown-signal tool [urh].)

The canonical example of a fixed address is the EV1527/PT2262 OOK encoder family: the output frame is a preamble followed by a 20-bit address and 4 data bits, with the address one-time-programmed (or set by DIP switches on older PT2262/EV1527 boards) [ev1527]. Recovering this frame tells you immediately whether you face a fixed address (the same address every burst — replayable, addressed under RFSAM-SUBG-AT-01) or a rolling counter (assessed under RFSAM-SUBG-CR-01). Where the address is a short DIP-switch field — for example the 12 binary DIP switches of many older fixed-code garage remotes, a 2^12 = 4096 keyspace — the recovered frame also reveals that the address space is small enough to enumerate rather than capture; OpenSesame demonstrated reducing that brute force to seconds with a De Bruijn sequence [opensesame] [hackaday-opensesame] (the active transmission belongs to the Attack layer). The discover-demodulate-reverse workflow this control sits in was formalised by Ossmann as "Rapid Radio Reversing": use a wideband SDR to characterise the signal, then a CC1101-class radio to receive and work it [ossmann2015] [ossmann2015archive] (RFSAM-RES-15).

## Procedure

> Receive-only throughout — this control recovers structure from captured bursts and does not transmit. Capture only devices you own or are explicitly authorised to assess.

1. **Try the known-device path first.** Point `rtl_433` at the target band and trigger the device; if it is a recognised class it decodes straight to named fields including the address:
   ```bash
   rtl_433 -f 433.92M -F json
   ```
   Expected: one JSON line per burst, e.g. `{"model":"...","id":12345,"channel":1,...}`. The `id` is the recovered link-layer address; `model` names the protocol/field layout for free [rtl433] [rtl433dataformat]. If nothing decodes, energy is present but the class is unknown — go to step 2.

2. **Record raw bursts for an unknown frame.** Capture I/Q at the carrier and bandwidth found at the Spectrum/PHY steps (RFSAM-RES-15), triggering the device several times:
   ```bash
   rtl_433 -f 433.92M -S unknown
   ```
   This writes the unrecognised bursts to `.cu8` files (or capture I/Q directly with your SDR's recorder) for offline reversing. Capture the *same* button several times and *different* buttons/events at least twice each.

3. **Reverse the frame in Universal Radio Hacker.** Load the demodulated bitstream, confirm the modulation and bit rate, then diff captures to label fields:
   - bytes identical across every capture → preamble + **address/ID**;
   - bytes that change with the button → command/state;
   - a multi-byte field that increments by one each press → rolling counter (hand off to RFSAM-SUBG-CR-01);
   - the trailing byte(s) that change with the payload → checksum/CRC [urh].
   Record the field map: `preamble | address | command | [counter] | checksum`.

4. **On-radio cross-check (optional).** Receive the same burst from a CC1101-class radio to confirm the recovered layer-1 settings and read the raw frame without an SDR. With rfcat on a YARD Stick One:
   ```python
   d.setFreq(433920000); d.setMdmModulation(MOD_ASK_OOK); d.setMdmDRate(2500)
   print(d.RFrecv())
   ```
   Expected: the same address/command bytes you labelled in step 3, confirming the frame map. A CC1101 Flipper Zero's Sub-GHz "Read RAW" captures the same burst standalone for field work [ossmann2015].

5. **Classify the address.** Record whether the recovered address is fixed (same every burst — identification only), DIP-switch-set (small enumerable keyspace), volatile (changes at power-on), or accompanied by a rolling counter / MAC. This classification is the control's finding.

## Field case

Illustrative walkthrough — substitute the values you capture against your own authorised target. Take an EV1527-class 433.92 MHz fixed-code remote as the representative device. Point `rtl_433` at the band and press the button; a recognised class decodes to repeated lines naming the device and a stable identifier:

```bash
rtl_433 -f 433.92M -F json
```

```json
{"model":"[FILL: decoded model name]","id":[FILL: decoded id],"cmd":[FILL: button code]}
```

If the `id` does not change across presses of the same remote and is the same when you press a different button on it, that confirms the `id` is the device address, not the command [rtl433dataformat]. Loading three captures into URH and diffing them, expect the leading [FILL: N]-bit field to be constant (preamble + address), a 4-bit field to change only with the button (the command), and no incrementing field — the signature of a **fixed code: identification only, no counter, no checksum over a secret** [urh] [ev1527]. The security finding then writes itself: the receiver acts on any frame carrying that address, so the recovered frame is everything it trusts. Because this class's address is often a short DIP-switch or OTP field, the same recovery that reads the address also bounds the keyspace — the kind of small fixed-code space OpenSesame enumerated in seconds [opensesame] [hackaday-opensesame] — though the active replay and brute force themselves are assessed under RFSAM-SUBG-AT-01.

## Remediation

- **Developer (device/firmware):** Do not let the device address stand in for authentication. Add a per-message authenticator — a rolling counter at minimum (defeats naive replay; see RFSAM-SUBG-CR-01) and ideally a MAC/signature over the whole frame keyed to a per-device secret — so a recovered address cannot be reused or forged. Avoid encoders whose entire "security" is a fixed OTP/DIP-switch address in clear OOK [ev1527].
- **Integrator (product/installer):** Choose modules with adequately sized, factory-randomised addresses rather than installer-set DIP switches, and prefer rolling-/authenticated-code receivers over fixed-code ones for anything that grants physical access [opensesame]. Treat the printed FCC ID and any default address as known to an attacker.
- **Operator (deployment):** Assume any fixed-code remote, sensor or fob transmitting in the clear is identifiable and replayable once its frame is recovered; reserve such devices for non-safety functions and add an independent supervision/authorisation layer (rate limiting, second factor, alarm supervision) where they gate access. Identification is not authentication.
