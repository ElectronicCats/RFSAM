---
id: RFSAM-ZWAVE-SP-01
title: Confirm the regional channel and prove Z-Wave capture
protocol: ZWAVE
layer: SP
criticality: info
applicability:
  - Z-Wave
  - Z-Wave Long Range
deferred: false
objective: >-
  Determine which regional sub-GHz channel a Z-Wave device transmits on, confirm
  it is actually emitting FSK bursts there, and prove the toolchain can hear them
  — so a later capture/decode control tunes the right frequency and data rate from
  the start instead of staring at a silent waterfall on the wrong region.
intro: >-
  Z-Wave is region-locked: a US device lives at 908.42 MHz and an EU device at
  868.42 MHz, with several other regional channels — and a radio tuned to the
  wrong one hears nothing. The first RF step is to pin the region, watch the
  waterfall for the device's short FSK bursts, and confirm reception before any
  decoder is committed. A cheap RTL-SDR reaches these sub-GHz bands, so this is
  the band where the budget dongle is a first-class survey radio.
prerequisites:
  hardware:
    - 'A receive SDR covering sub-GHz ISM: RTL-SDR Blog V4 (cheap, narrow — one Z-Wave channel is well within range) or a HackRF One (~20 MHz instantaneous bandwidth, to watch several regional channels/rates at once)'
  software:
    - 'gqrx for a live waterfall; waving-z or rtl-zwave (G.9959 FSK demodulators fed from rtl_sdr/HackRF I/Q) to confirm frames decode'
  signal:
    freq: >-
      Sub-GHz ISM, region-locked: 908.42 MHz (US) · 868.42 MHz (EU) · 921.42 MHz
      (ANZ) · 919.82 MHz (HK) · 922–926 MHz (JP) — one region per device. Z-Wave
      Long Range adds US 912/920 MHz.
    bandwidth: 'Narrow FSK channel (tens of kHz of occupied bandwidth); a few hundred kHz of SDR capture span is ample per channel'
    modulation: 'Classic Z-Wave: (G)FSK per ITU-T G.9959, at three data rates: 9.6 kbps (R1), 40 kbps (R2), 100 kbps (R3). Z-Wave Long Range is different: 100 kbps DSSS-OQPSK (spread spectrum) on US 912/920 MHz.'
  skill: beginner
attacks: []
references:
  - key: itu_g9959
    title: 'ITU-T G.9959: Short range narrow-band digital radiocommunication transceivers — PHY, MAC, SAR and LLC layer specifications'
    authors: ITU-T Study Group 15
    venue: International Telecommunication Union (ITU-T Recommendation)
    year: 2015
    url: 'https://www.itu.int/rec/T-REC-G.9959'
    type: standard
  - key: silabs_regions
    title: 'Z-Wave Global Regions — regional RF frequencies and regulatory references'
    authors: Silicon Labs
    venue: Silicon Labs (vendor documentation)
    year: 2026
    url: 'https://www.silabs.com/wireless/z-wave/global-regions'
    type: standard
  - key: silabs_lr
    title: 'Z-Wave Long Range Overview — DSSS-OQPSK 100 kbps profile (US 912/920 MHz)'
    authors: Silicon Labs
    venue: Silicon Labs (vendor documentation)
    year: 2026
    url: 'https://www.silabs.com/wireless/z-wave/z-wave-long-range-overview'
    type: standard
  - key: fouladi2013honey
    title: "Honey, I'm Home!! — Hacking Z-Wave Home Automation Systems (Black Hat USA 2013, recorded talk)"
    authors: Behrang Fouladi, Sahand Ghanoun (SensePost)
    venue: Black Hat USA 2013
    year: 2013
    url: 'https://www.youtube.com/watch?v=tpth0KHYbD0'
    type: talk
  - key: sensepost2013zwave
    title: "Honey, I'm home!! — hacking Z-Wave & other Black Hat news"
    authors: SensePost (Behrang Fouladi, Sahand Ghanoun)
    venue: SensePost blog
    year: 2013
    url: 'https://sensepost.com/blog/2013/honey-im-home-hacking-z-wave-other-black-hat-news/'
    type: blog
  - key: pentestpartners2018zshave
    title: 'Z-Shave. Exploiting Z-Wave downgrade attacks'
    authors: Andrew Tierney (Pen Test Partners)
    venue: Pen Test Partners
    year: 2018
    url: 'https://www.pentestpartners.com/security-blog/z-shave-exploiting-z-wave-downgrade-attacks/'
    type: blog
  - key: wavingz
    title: 'waving-z — an ITU-T G.9959 (Z-Wave) (de)modulator fed from rtl_sdr/HackRF I/Q'
    authors: baol (G. Bertelli) et al.
    venue: GitHub
    year: 2026
    url: 'https://github.com/baol/waving-z'
    type: tool
  - key: rtlzwave
    title: 'rtl-zwave — G.9959 (Z-Wave) demodulator for RTL-SDR'
    authors: A. Esbensen (andersesbensen)
    venue: GitHub
    year: 2026
    url: 'https://github.com/andersesbensen/rtl-zwave'
    type: tool
  - key: gqrx
    title: 'Gqrx — software defined radio receiver (GNU Radio + Qt)'
    authors: A. Csete (csete) et al.
    venue: GitHub
    year: 2026
    url: 'https://github.com/gqrx-sdr/gqrx'
    type: tool
  - key: ezwave
    title: 'EZ-Wave — tools for evaluating and exploiting Z-Wave networks using SDRs'
    authors: J. Hall, B. Ramsey, C. Badenhop (cureHsu fork)
    venue: GitHub
    year: 2026
    url: 'https://github.com/cureHsu/EZ-Wave'
    type: tool
tools:
  - gqrx
  - rtl-sdr-v4
  - hackrf-one
  - waving-z
  - rtl-zwave
  - ez-wave
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-18
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Z-Wave's PHY and MAC are the open ITU-T Recommendation G.9959 — a short-range narrow-band sub-GHz radio with a preamble, frame, CRC and addressing, donated by the protocol's originators and published by the ITU in 2015 [itu_g9959]. For classic Z-Wave the waveform is (G)FSK: the carrier shifts between two tones, at one of three data rates — 9.6 kbps (R1, legacy), 40 kbps (R2) and 100 kbps (R3) [itu_g9959]. Because classic Z-Wave uses no spread spectrum, a device on the right channel is a plain narrowband FSK burst that a cheap receiver can see directly — but only if it is tuned to the right channel. (Z-Wave Long Range is the exception — a spread-spectrum OQPSK PHY covered below.)

The defining property at the spectrum layer is that Z-Wave is **region-locked**. Silicon Labs' regional documentation assigns each country/region its approved frequency: roughly 908.42 MHz in the US/North America, 868.42 MHz in Europe, 921.42 MHz in Australia/New Zealand, 919.82 MHz in Hong Kong, and a 922–926 MHz cluster in Japan, each tied to that region's regulatory limit (FCC Part 15.249, EN 300 220, AS/NZS 4268, ARIB STD-T108) [silabs_regions]. A device ships for one region and transmits only on that region's channel, so a radio parked on the wrong one — an EU dongle aimed at a US lock — sees a flat, empty waterfall and produces a false "nothing here". Confirming the region is therefore the first and load-bearing RF decision; the wider Z-Wave descent does not even start until the band is right. Z-Wave Long Range (US-only at present) is a separate profile to account for, and it is **not** the same PHY: it is a fourth channel that uses 100 kbps DSSS-OQPSK — a spread-spectrum waveform on 912 MHz (primary) and 920 MHz (backup) — rather than classic Z-Wave's narrowband FSK, with much higher output power [silabs_lr]. So the "narrowband FSK burst, no spread spectrum" property above describes classic Z-Wave; an LR device is a different, broadband signal and demands matching the demodulator accordingly.

This is an observational, capability control, not an attack — hence `info` criticality. It establishes only that the device is transmitting, on which regional channel, and that the toolchain can hear it. The reason the region/feasibility step matters downstream is the rest of the descent: the public Z-Wave security research that the capture, crypto and attack controls build on all presupposes you can first hear the network. The original Black Hat USA 2013 work by Fouladi and Ghanoun built a dedicated radio capture device ("Z-Force") to intercept Z-Wave and then attack an AES-protected door lock [fouladi2013honey][sensepost2013zwave]; the later Z-Shave downgrade work likewise depends on capturing the inclusion exchange, where legacy S0 transports the network key under a fixed all-zero temporary key [pentestpartners2018zshave]. None of that is reachable until this control succeeds, and none of it works against the wrong region.

The on-air confirmation has two complementary halves. A **gqrx** waterfall on the regional centre frequency shows the short FSK bursts a Z-Wave device emits when it reports or is polled — proving the device is alive and on the channel you expect before you commit a decoder [gqrx]. Then a software demodulator — **waving-z** or its ancestor **rtl-zwave**, both G.9959 FSK (de)modulators fed raw I/Q from `rtl_sdr` or a HackRF — turns those bursts into decoded frames, confirming not just energy but real Z-Wave traffic and the clear-text Home ID / Node ID headers [wavingz][rtlzwave]. For a scriptable assessment stack carried into the later steps, the EZ-Wave SDR suite does discovery and enumeration over a HackRF [ezwave].

The per-region centre frequencies above (908.42 / 868.42 / 921.42 / 919.82 MHz, JP 922–926 MHz) are read from the Silicon Labs Global Regions page [silabs_regions]. Treat the list as representative, not exhaustive — Silicon Labs adds/adjusts regional profiles over time, and several regions carry more than one channel (e.g. US also lists 916 MHz; ANZ 919.8 and 921.4 MHz) — so confirm the exact channel/data-rate set for a *specific* device against that device's regional model and FCC/CE grant (an IG-step task) before relying on a single number.

## Procedure

> Receive-only at this layer: you are listening, not transmitting. Even so, monitor only equipment you own or are explicitly authorised to assess, and stay within the regional spectrum rules for the band you tune.

1. **Pin the region before touching a radio (IG carry-over).** Establish which regional channel the device should be on from its market/label — a US-market unit at ~908.42 MHz, an EU unit at ~868.42 MHz, etc. — using Silicon Labs' regional table [silabs_regions]. This single decision determines every frequency below; a wrong region produces a silent, misleading survey.

2. **Watch the regional channel on a waterfall while triggering the device.** Open gqrx on the receive SDR, tune to the regional centre, and provoke the device (open the door, trip the sensor, poll it from its hub) so it talks [gqrx]:
   ```bash
   gqrx
   ```
   Set the device to RTL-SDR (or HackRF), centre frequency to `908.420 MHz` (US) or `868.420 MHz` (EU), and a sample rate of `2.4 MS/s`. Expected: a short, narrow FSK burst flares on the waterfall each time the device reports or is polled — two closely spaced tones, not a single blinking line. No burst after repeated triggering, on a channel you are sure is right, is itself a finding (device idle, asleep, or — recheck — wrong region).

3. **Confirm it is really Z-Wave by decoding a frame.** Pipe live I/Q from the SDR into a G.9959 demodulator and read decoded frames. With waving-z fed from `rtl_sdr` [wavingz]:
   ```bash
   rtl_sdr -f 908420000 -s 2048000 -g 25 - | ./wave-in -
   ```
   Or with the minimal rtl-zwave decoder on an RTL-SDR [rtlzwave]:
   ```bash
   rtl_zwave
   ```
   Expected: decoded Z-Wave frames printed to stdout, each carrying a 32-bit Home ID and an 8-bit Node ID in the clear in the header — the network fingerprint. Seeing those fields resolve confirms genuine Z-Wave traffic on this channel, not just generic ISM energy. If energy is visible on the waterfall but nothing decodes, the data rate is likely mismatched — Z-Wave's three rates (9.6 / 40 / 100 kbps) use different deviation/bandwidth, so a decoder set for one rate misses the others; retry across the rates the device may speak.

4. **(Optional) Carry the capture into the assessment suite.** For a scriptable path you reuse in the later recon/attack steps, run EZ-Wave's passive discovery over a HackRF rather than the standalone demodulators [ezwave]:
   ```bash
   # EZ-Wave (GNU Radio + Scapy-radio); see the repo README for the exact verb/flags
   python ezstumbler ...
   ```
   Expected: passive enumeration of Z-Wave devices seen on the channel. This is the same SDR/Scapy plumbing the Z-Wave LL/CR/AT controls build on.

5. **Record the spectrum profile.** Write down the confirmed region and centre frequency, that bursts were observed, the data rate at which frames decoded, the observed Home ID / Node ID(s), and whether this is classic Z-Wave or Z-Wave Long Range. This profile scopes the capture target for the Z-Wave LL (capture/decode) and CR (inclusion/key) controls — including the fact that, to break a legacy S0 network later, you must capture an inclusion, so note whether you can force a re-pair while capturing [pentestpartners2018zshave].

## Field case

Illustrative walkthrough — substitute the values you capture; the narration below describes the *expected* behaviour of this method, not a single measured engagement, and the bracketed `[FILL: …]` fields must come from your own survey before any of it is cited as a finding.

A Z-Wave door/window sensor believed to be a US-market unit is surveyed with an RTL-SDR Blog V4 in gqrx tuned to 908.420 MHz at 2.4 MS/s. Tripping the sensor should produce a short twin-tone FSK flare on the waterfall — the unmistakable narrowband Z-Wave burst — each time the reed contact opens. Piping `rtl_sdr -f 908420000 -s 2048000 -g 25 -` into waving-z's `wave-in` then decodes the bursts into frames whose clear-text Home ID and Node ID resolve, confirming genuine Z-Wave (not stray 915 MHz ISM traffic) on the channel.

The reproducible lesson is the region gate itself: pointed at 868.420 MHz (the EU channel) instead, the identical setup shows an empty waterfall and decodes nothing — the classic false negative this control exists to prevent. Region first, then everything else.

Concrete numbers for a worked write-up (fill from a real survey; do not present placeholders as measured results):

- Device and believed region/model: [FILL: device + FCC ID / regional model].
- Confirmed centre frequency the bursts appeared on: [FILL: e.g. 908.42 MHz].
- Data rate at which frames decoded: [FILL: 9.6 / 40 / 100 kbps].
- Observed Home ID / Node ID(s): [FILL: hex Home ID, decimal Node ID].
- Classic Z-Wave vs Z-Wave Long Range: [FILL].

## Remediation

Capture feasibility is a baseline property of an open sub-GHz FSK radio, not a fixable defect — anyone with a ~$30 RTL-SDR on the right regional channel can see and decode the clear-text frame headers (Home ID, Node ID). The mitigations live one layer up, in what the frames *carry* and how the network is paired, and are layered by who owns the design:

- **Developer (device/firmware):** Treat every transmitted frame as fully observable. Do not rely on the header identifiers (Home ID / Node ID, sent in clear by design) for any security decision, and do not send security-relevant command classes unencrypted. Prefer modern S2 (Curve25519 ECDH at inclusion) over legacy S0, whose network key is transported under a fixed all-zero temporary key and is recoverable by anyone who captured the inclusion [pentestpartners2018zshave][fouladi2013honey].
- **Integrator (product/system):** Choose modules and controllers that support and enforce S2, and verify empirically — run the gqrx + waving-z survey above against your own unit on its regional channel, confirm which command classes appear in clear, and confirm the controller does not silently fall back to S0 (the Z-Shave downgrade premise) when an S2 device is included [pentestpartners2018zshave]. Confirm the device's regional frequency and profile match its market grant.
- **Operator (deployment):** Assume the network is observable from outside the premises by anyone tuned to your region's Z-Wave channel; "it's wireless and proprietary" is not confidentiality. For high-value functions (locks, sensors), prefer devices that pair with S2, perform inclusions deliberately and out of band where possible (an attacker needs to capture the join to break S0), and rely on the upper-layer Z-Wave crypto controls — not on transmission obscurity — for confidentiality and replay protection.
