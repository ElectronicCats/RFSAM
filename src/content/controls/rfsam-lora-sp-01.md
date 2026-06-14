---
id: RFSAM-LORA-SP-01
title: Survey the LoRa sub-band and prove sub-noise reception
protocol: LORA
layer: SP
criticality: info
applicability:
  - LoRa
  - LoRaWAN
deferred: false
objective: >-
  Confirm the toolchain can recover LoRa CSS transmissions at strongly negative
  SNR (below the thermal noise floor) and use that capability to survey the
  regional ISM sub-band for the channels, bandwidths and spreading factors a
  target network actually uses — before concluding a band is quiet.
intro: >-
  LoRa's chirp spread spectrum is engineered to be received well below the
  thermal noise floor, so an energy-only spectrum survey will declare a busy
  LoRaWAN band empty. This control verifies that capture and de-chirping recover
  sub-noise transmissions, then maps the live channel plan.
prerequisites:
  hardware:
    - >-
      An RX SDR covering the sub-GHz ISM band: RTL-SDR Blog V4 (cheap, narrow —
      enough to watch one channel of a sub-GHz band) or a HackRF One (~20 MHz
      instantaneous bandwidth, to watch a whole sub-band at once).
    - >-
      Optionally a CatSniffer (SX1262) for a no-SDR spectrum view, or a
      multi-channel LoRaWAN gateway (e.g. RAK WisGate Connect) to log every
      channel simultaneously.
  software:
    - >-
      gqrx for a live waterfall, and gr-lora_sdr (the reference open-source CSS
      demodulator) to prove de-chirping recovers symbols at negative SNR. catnip
      / ChirpCat for the CatSniffer / gateway paths.
  signal:
    freq: >-
      Regional sub-GHz ISM: EU868 (863–870 MHz) · US915 (902–928 MHz) · AS923 ·
      EU433 (433.05–434.79 MHz) — the region sets the channel plan you survey.
    bandwidth: '125 / 250 / 500 kHz LoRaWAN channels (SX127x/SX126x also do 7.8–62.5 kHz, unused by LoRaWAN)'
    modulation: 'CSS (Chirp Spread Spectrum); data in the chirp cyclic start offset, SF7–SF12'
  skill: intermediate
attacks: []
references:
  - key: semtech2019longrange
    title: Long Range with LoRa
    authors: Tim Cooper
    venue: Semtech blog
    year: 2019
    url: 'https://blog.semtech.com/long-range-with-lora'
    type: blog
  - key: tapparel2020grlora
    title: An Open-Source LoRa Physical Layer Prototype on GNU Radio
    authors: 'J. Tapparel, O. Afisiadis, P. Mayoraz, A. Balatsoukas-Stimming, A. Burg'
    venue: IEEE SPAWC 2020
    year: 2020
    url: 'https://arxiv.org/abs/2002.08208'
    type: paper
  - key: grlora_sdr
    title: 'gr-lora_sdr — GNU Radio SDR implementation of a LoRa transceiver (operates at very low SNR)'
    authors: J. Tapparel (TCL, EPFL)
    venue: GitHub
    year: 2024
    url: 'https://github.com/tapparelj/gr-lora_sdr'
    type: tool
  - key: li2021nelora
    title: 'NELoRa: Towards Ultra-low SNR LoRa Communication with Neural-enhanced Demodulation'
    authors: 'C. Li, H. Guo, S. Tong, X. Zeng, Z. Cao, M. Zhang, Q. Yan, L. Xiao, J. Wang, Y. Liu'
    venue: ACM SenSys 2021
    year: 2021
    url: 'https://par.nsf.gov/biblio/10311781-nelora-towards-ultra-low-snr-lora-communication-neural-enhanced-demodulation'
    type: paper
  - key: loraalliance_rp002
    title: 'RP002-1.0.4 LoRaWAN Regional Parameters'
    authors: LoRa Alliance
    venue: LoRa Alliance Technical Specification
    year: 2023
    url: 'https://resources.lora-alliance.org/technical-specifications/rp002-1-0-4-regional-parameters'
    type: standard
tools:
  - gqrx
  - rtl-sdr-v4
  - hackrf-one
  - gr-lora_sdr
  - catnip
  - catsniffer
  - chirpcat
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-07
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

LoRa is a chirp spread spectrum (CSS) modulation derived from work later acquired by Semtech: a linear frequency chirp sweeps the channel bandwidth, and data is encoded in the chirp's cyclic start offset. The spreading factor (SF7–SF12) trades data rate for range and sensitivity, higher SF meaning a longer, slower symbol [semtech2019longrange]. The receiver de-chirps by multiplying the incoming chirp by a reference down-chirp and taking an FFT, which collapses each symbol into a single frequency bin. Spreading the symbol energy over a long chirp and integrating it back at the receiver yields processing gain — the reason a LoRa link can close on signals buried in noise.

The operationally important consequence for a spectrum survey: Semtech states the benefit of LoRa spread spectrum is "the ability to receive up to 20 dB below the thermal noise floor" [semtech2019longrange]. A plain FFT / energy-detector waterfall only shows energy above the noise floor, so a busy LoRaWAN deployment can be completely invisible to a naive survey — the transmissions are real, just sub-noise. Recovering them requires de-chirping, not just looking. The reference open-source implementation that does this is gr-lora_sdr, a full GNU Radio LoRa transceiver "with all the necessary receiver components to operate correctly even at very low SNRs", built at EPFL's Telecommunication Circuits Laboratory [grlora_sdr][tapparel2020grlora]. Research on neural-enhanced demodulation (NELoRa) further confirms that the interesting LoRa demodulation regime is at very low / negative SNR, and works to push the threshold even lower [li2021nelora].

The frequencies to survey are fixed by region, not chosen by the auditor: the LoRaWAN Regional Parameters specification defines the channel plans — EU868 (863–870 MHz), US915 (902–928 MHz), AS923, EU433 and others — including the 125/250/500 kHz channel bandwidths in play [loraalliance_rp002]. LoRa devices are duty-cycle limited and often transmit infrequently, so "I saw nothing" after a short look is not evidence of an empty band. This control is observational only — it establishes capture feasibility and maps the channel plan; it does not decode payloads or attack the network (those are the LL/CR/AT controls). There is no device-side vulnerability here, hence `info` criticality: the risk being managed is a false negative in the assessment itself.

## Procedure

All steps below are passive receive-only. No transmission is involved; even so, run any survey only within a band you are authorised to monitor and in line with local spectrum regulations.

1. Establish the region and channel plan from the LoRaWAN Regional Parameters spec [loraalliance_rp002] (typically already recorded by the LoRa IG control). Example: EU868 default channels cluster around 868.1 / 868.3 / 868.5 MHz at 125 kHz; US915 uplinks span 902.3–914.9 MHz at 125 kHz (plus 500 kHz channels).

2. Watch the sub-band live on a waterfall to spot the unmistakable diagonal CSS chirp sweeps. With an RTL-SDR or HackRF in gqrx:
   ```bash
   gqrx
   # tune to the regional sub-band centre (e.g. 868.3 MHz, EU868),
   # set the FFT/waterfall, and watch for diagonal up-chirp streaks.
   ```
   Expected: short diagonal sweeps crossing a channel are LoRa symbols; the steeper/longer the sweep, the higher the SF. Strong nearby transmitters appear clearly. The point of the next steps is the ones you *cannot* see here.

3. Capture the sub-band (or one channel) to raw I/Q with sample rate ≥ the channel bandwidth, logging overflow counters (RFSAM-RES-01). For a single EU868 channel with a HackRF:
   ```bash
   hackrf_transfer -r lora_868_3.iq -f 868300000 -s 2000000 -a 1 -l 32 -g 40
   ```
   Expected: a growing `.iq` file and `0` reported dropped/overflow samples. A capture with overflows is silently incomplete — re-run at a lower sample rate or with a faster disk if you see them.

4. Prove sub-noise reception: de-chirp the capture and confirm symbols resolve that were invisible on the plain waterfall. Run the gr-lora_sdr receiver flowgraph/example against a known transmitter at known SF/BW first (RFSAM-RES-07) [grlora_sdr]:
   ```bash
   # in the gr-lora_sdr examples, run the RX flowgraph with the
   # capture's centre freq, bandwidth (125000) and the candidate SF.
   gnuradio-companion gr-lora_sdr/examples/lora_RX.grc
   ```
   Expected: decoded LoRa frames (a recovered PHYPayload, even if the application bytes stay AES-128 encrypted) printed by the flowgraph. Recovering frames whose energy never rose above the FFT noise floor is the positive result this control is after. Sweep SF7–SF12 if the SF is unknown — the de-chirp only locks when the reference down-chirp matches the transmitter's SF/BW.

5. No-SDR / multi-channel alternatives, depending on kit:
   ```bash
   # CatSniffer SX1262 as a real-time sub-GHz/LoRa spectrum view:
   catnip lora spectrum     # live SX1262 spectrum scanner
   ```
   A multi-channel LoRaWAN gateway (RAK WisGate Connect) feeding ChirpCat logs every channel at once and clusters packets by RF characteristics — the fastest way to map a whole channel plan if you have the gateway.

6. Record the survey result: which regional band, which centre frequencies/channels carry traffic, the bandwidths, and (where de-chirp locked) the spreading factors observed. This map scopes the capture target for the LoRa LL/CR controls.

## Field case

Illustrative walkthrough — substitute the values you capture: run an EU868 survey with an RTL-SDR Blog V4 on 868.3 MHz in gqrx. The waterfall typically looks almost flat — a handful of faint diagonal streaks during the watch window, easy to dismiss as "a couple of devices, mostly quiet". Capturing the channel to I/Q and de-chirping it with gr-lora_sdr swept across SF7–SF12 is where the gap shows: frames can resolve at several spreading factors, including transmissions that left no visible mark on the plain FFT at all. The point this control makes is exactly that contrast — an energy-detector read ("band mostly empty") and a de-chirped read of the same capture can disagree completely, and only the de-chirped read reflects the real occupancy.

Concrete numbers to record in a worked write-up (mark unmeasured values rather than inventing them):

- Region / sub-band surveyed: EU868, centre 868.3 MHz, 125 kHz channel.
- Watch window before declaring "quiet": [FILL: minutes/hours observed].
- Frames the plain FFT showed vs frames gr-lora_sdr recovered after de-chirp: [FILL: counts].
- Lowest SNR at which a frame still decoded: [FILL: measured dB] — Semtech's stated envelope is up to 20 dB below the thermal noise floor [semtech2019longrange].
- Spreading factors observed once de-chirp locked: [FILL: e.g. SF7, SF9, SF12].

The reproducible lesson is the gap itself: establishing the de-chirp / processing-gain baseline is what lets a passive observer see an entire LoRaWAN deployment that an energy-only survey misses. The bracketed `[FILL: …]` values above are placeholders — fill them from a real survey before citing this section as a measured finding; do not present the placeholders as measured results.

## Remediation

This control verifies an auditor capability and guards against a false-negative survey — sub-noise reception is an inherent property of CSS, so there is no patch that "fixes" it. Guidance is therefore about not being misled and about the limited operator hardening that exists at this layer.

- **Auditor / assessor:** never conclude a regional sub-band is unused from an energy-only waterfall. Always confirm with a de-chirping capture (gr-lora_sdr or a gateway feed) and account for duty-cycle-limited, infrequent transmitters by extending the watch window. Treat band occupancy as established only after de-chirp recovers (or fails to recover) frames.
- **Developer / integrator:** recognise that transmissions are observable to any passive receiver even when they sit below the noise floor — physical-layer "stealth" is not a security property. Confidentiality must come from the LoRaWAN crypto layer (AES-128 AppSKey on FRMPayload), not from signals being hard to see. Identifiers carried in clear (DevAddr in data frames; DevEUI/JoinEUI/DevNonce in joins) are exposed to anyone who can de-chirp, which is the premise the LoRa LL/CR controls build on.
- **Operator:** assume a motivated observer can map your channel plan and device activity passively. Where this matters (e.g. activity-pattern leakage), favour channel/SF diversity and frame-counter hygiene, and rely on the upper-layer controls for confidentiality and replay protection rather than on transmission obscurity. Tool and capability corpora here are representative — verify current SDR/demodulator maturity for your region and spreading factors before relying on a survey result.
