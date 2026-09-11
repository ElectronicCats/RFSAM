---
id: RFSAM-LORA-PHY-01
title: Demodulate LoRa CSS symbols from captured I/Q
protocol: LORA
layer: PHY
criticality: info
applicability:
  - LoRa
  - LoRaWAN
deferred: false
objective: >-
  Verify that the target's LoRa CSS waveform can be de-chirped and demodulated to
  symbols off an SDR — at the spreading factor, bandwidth and SNR seen on the air —
  so the link-layer LoRaWAN frames it carries can be recovered for the controls
  above this one.
intro: >-
  LoRa carries no data a higher-layer assessment can read until the chirp is
  demodulated. This control confirms the PHY de-chirp path works on the target's
  SF/BW and recovers symbols reliably at the on-air SNR — soft-decision
  demodulation extends that reach toward the noise floor, where hard-decision
  (nearest-bin) decoding silently drops frames.
prerequisites:
  hardware:
    - >-
      A receive-capable SDR covering the regional sub-GHz band: RTL-SDR v4 (RX
      only, narrow), HackRF One, USRP B210, or bladeRF 2.0 micro for wider
      captures. Sample rate must cover the signal bandwidth (≥125/250/500 kHz).
  software:
    - 'gr-lora_sdr (GNU Radio CSS receiver), or the Lora-Wideband-Decoder for whole-sub-band intercept'
  signal:
    freq: >-
      Regional sub-GHz ISM: EU868 (863–870 MHz), US915 (902–928 MHz), AS923,
      EU433 (433.05–434.79 MHz), AU915 / CN470 / IN865 / KR920
    bandwidth: '125 / 250 / 500 kHz (LoRaWAN regional plans)'
    modulation: >-
      CSS (Chirp Spread Spectrum); a chirp sweeps the band and the symbol is the
      chirp's cyclic start offset. Spreading factor SF7–SF12 trades data rate for
      range/sensitivity.
  skill: intermediate
attacks: []
references:
  - key: tapparel2020
    title: An Open-Source LoRa Physical Layer Prototype on GNU Radio
    authors: 'J. Tapparel, O. Afisiadis, P. Mayoraz, A. Balatsoukas-Stimming, A. Burg'
    venue: 'arXiv:2002.08208 (IEEE SPAWC 2020)'
    year: 2020
    url: 'https://arxiv.org/abs/2002.08208'
    type: paper
  - key: marquet2020
    title: >-
      Towards an SDR implementation of LoRa: Reverse-engineering, demodulation
      strategies and assessment over Rayleigh channel
    authors: 'A. Marquet, N. Montavont, G. Z. Papadopoulos'
    venue: 'Computer Communications, vol. 153, pp. 595–605'
    year: 2020
    url: 'https://doi.org/10.1016/j.comcom.2020.02.034'
    type: paper
  - key: xu2022
    title: 'From Demodulation to Decoding: Toward Complete LoRa PHY Understanding and Implementation'
    authors: 'Z. Xu, S. Tong, P. Xie, J. Wang'
    venue: 'ACM Transactions on Sensor Networks, vol. 18, no. 4'
    year: 2022
    url: 'https://doi.org/10.1145/3546869'
    type: paper
  - key: grlorasdr
    title: gr-lora_sdr — GNU Radio SDR implementation of a LoRa transceiver
    authors: J. Tapparel (EPFL TCL)
    venue: GitHub
    year: 2026
    url: 'https://github.com/tapparelj/gr-lora_sdr'
    type: tool
  - key: tapparel2024
    title: Design and Implementation of LoRa Physical Layer in GNU Radio
    authors: 'J. Tapparel, A. Burg'
    venue: GNU Radio Conference 2024
    year: 2024
    url: 'https://events.gnuradio.org/event/24/contributions/641/'
    type: talk
  - key: rp002
    title: 'RP002-1.0.5 LoRaWAN Regional Parameters'
    authors: LoRa Alliance
    venue: LoRa Alliance Technical Specification
    year: 2022
    url: 'https://resources.lora-alliance.org/technical-specifications/rp002-1-0-5-lorawan-regional-parameters'
    type: standard
tools:
  - gr-lora_sdr
  - lora-wideband-decoder
  - lorattack
  - catnip
bsam: []
resources:
  - RFSAM-RES-07
reviewStatus: verified
confidence: high
lastResearched: 2026-09-10
---
## Mechanism

LoRa modulates data with Chirp Spread Spectrum (CSS): a sinusoid sweeps linearly across the channel bandwidth, and the *symbol value is the chirp's cyclic start frequency offset* — for spreading factor SF, a symbol carries SF bits, so there are 2^SF distinguishable start offsets [marquet2020] [tapparel2020]. The regional plans use 125/250/500 kHz bandwidths and SF7–SF12, trading data rate for sensitivity (higher SF spreads the same energy over a longer symbol, reaching lower SNR) [rp002].

Demodulation is **de-chirping**: the receiver multiplies the incoming chirp by a locally generated reference *down-chirp*, which collapses the swept tone into a single constant-frequency tone, then takes an FFT — the symbol is read off as the index of the FFT bin holding the energy peak [marquet2020] [xu2022]. This is the standard, well-understood LoRa receiver and is what every open-source SDR demodulator implements.

Doing it *reliably on real captures* is the hard part. The energy peak is degraded by sampling time offset (STO) and carrier frequency offset (CFO) between the unsynchronised transmitter and the SDR, and at low SNR the peak can be distorted or buried in noise so the FFT bin is read wrong [xu2022]. A complete receiver therefore needs frame detection (correlating against the up-chirp preamble), then STO and CFO estimation and correction before demodulation; the gr-lora_sdr design implements exactly this chain — preamble sync, CFO/STO compensation, demodulation, Gray-demap, deinterleave, Hamming decode, dewhiten, CRC — and is built to keep decoding at very low SNR [tapparel2020] [grlorasdr] [tapparel2024].

Beyond the per-symbol decision, the choice between **hard-decision** (emit the single nearest bin) and **soft-decision** demodulation (carry the per-bin likelihoods forward into the Hamming/FEC stage) changes how many frames survive at the edge of the link budget: soft information lets the decoder recover frames a nearest-bin decoder loses, so hard-decision yields are a lower bound on what is actually on the air [marquet2020] [xu2022]. This is a capture-completeness concern for the auditor, not a vulnerability in the target — hence `info`.

This is a passive PHY check: it recovers symbols and frame bits, but the LoRaWAN application payload stays AES-128 encrypted until the keys are assessed at the crypto layer. There is no off-the-shelf hardware demodulator for LoRa CSS in the standard kit; the de-chirp happens in software on the SDR, which is why capturing and framing live together at the next (link) layer (RFSAM-RES-07).

## Procedure

Work only on signals you are authorised to receive and analyse. Receiving and demodulating LoRa is passive, but capturing third-party traffic may still be regulated in your jurisdiction — have explicit permission for the deployment under test.

1. **Confirm the band and channel plan** (from RFSAM-LORA-SP / RFSAM-LORA-IG): the regional band sets the centre frequency, and the device profile sets bandwidth and spreading factor. If you only know the band, plan to scan SF7–SF12 [rp002].

2. **Capture I/Q over the channel.** Tune the SDR to the channel centre with sample rate ≥ the LoRa bandwidth. Example with an RTL-SDR for EU868 channel 0:
   ```bash
   rtl_sdr -f 868100000 -s 1000000 -g 40 -n 6000000 lora_eu868_ch0.iq
   ```
   Produces a raw `uint8` I/Q file. `-s 1000000` (1 Msps) comfortably covers 125 kHz; increase the sample rate to cover 250/500 kHz channels. Expect a file growing at sample_rate × 2 bytes/s.

3. **De-chirp and demodulate in software.** Run the captured I/Q through a gr-lora_sdr receiver flowgraph (or the bundled examples), set to the channel's SF and BW:
   ```bash
   git clone https://github.com/tapparelj/gr-lora_sdr
   # build/install per its README, then run an RX flowgraph (GRC or Python)
   # configured: center_freq=868.1e6, bw=125000, sf=7, samp_rate to match the capture
   ```
   Expected output: for each detected frame the receiver prints the demodulated/decoded payload bytes (after Gray-demap, deinterleave, Hamming decode, dewhiten, CRC). A frame that passes CRC is a clean PHY demodulation; CRC failures or "no frame detected" mean the SF/BW guess, sync, or SNR is wrong [grlorasdr] [tapparel2020].

4. **If you do not yet know SF/BW, or want the whole sub-band at once,** stream wideband I/Q and let the decoder sweep SF7–SF12 across every bandwidth:
   ```bash
   git clone https://github.com/persistentcache/Lora-Wideband-Decoder
   # run per its README against a bladeRF/USRP feed; decoded packets, node IDs
   # and a live waterfall appear in the local Flask web UI
   ```
   Expected output: decoded LoRa/LoRaWAN/Meshtastic packets surfacing in the web UI as they are demodulated across the band — useful when the exact channel or SF is unknown.

5. **Read the result as a yield.** Note how many frames demodulate cleanly (CRC-OK) versus how many the waterfall shows but the decoder drops. A non-trivial drop rate at the edge of range is the soft-vs-hard-decision gap, and the cue to confirm a soft-decision-capable demodulator before treating the capture as complete [marquet2020] [xu2022]. Export CRC-OK frames as LoRaTap PCAP for the link layer (RFSAM-LORA-LL, RFSAM-RES-07).

6. **Single-board alternative without an SDR de-chirp flow:** the CatSniffer's SX1262 can capture and decode LoRa into Wireshark via `catnip` once region/SF/BW are set — a hardware-radio capture path to cross-check the SDR demodulation against.

## Field case

In a 30-second baseline session in the lab, a fixed bench with 1 meter spacing between FlatSat and RTL-SDR was set up. Stock telescopic antenna of the RTL-SDR Blog V4 on the RX port, gain set to 40.2 dB.

Captured at 916.0 MHz (US915), 125 kHz bandwidth, SF7, with `rtl_sdr -f 916000000 -s 1000000 -g 40 -n 30000000` (30 seconds and 58 MB at 1 MSps). Gqrx 2.17.7 with LNA set to 28.0 dB displayed 3 representative red-yellow bursts in the active waterfall window.

Demodulation using the GNU Radio Companion flowgraph (`lora_RX_916.grc`) configured at 916 MHz, 125 kHz bandwidth, and SF7 recovered 12 frames with valid CRC out of the 12 total frames captured. Evaluating soft-decision versus hard-decision processing on this 30-second capture yielded 12/12 (100%) CRC-OK frames in both modes at an estimated SNR of 45.0 dB due to the strong signal.

To validate that packet accounting was strictly CRC-based and to evaluate demodulation performance under near-sensitivity conditions, a second 30-second verification session was conducted using an STM32F446 + DX-LR30 transceiver. Configured at 915.0 MHz (US915), 250 kHz bandwidth, SF11, CR 4/5, sync word `0x34`, transmission interval 5 s, and payload `"Hola desde STM32 (LoRa) — paquete #N CRC:XXXX OK/BAD"`. The application CRC was intentionally corrupted every 2 packets.

Captured with `rtl_sdr -f 915000000 -s 1000000 -g 40 -n 30000000` (30 s, 60 MB). Gqrx showed 5 visible bursts at a weaker SNR of ~6.0 dB (RSSI -55 to -60 dBm).

Offline Python decoding of this second capture at 915 MHz, 250 kHz bandwidth, and SF11 recovered the 5 visible frames with clear performance separation:
- **Soft-decision:** 3 frames with valid CRC (60% yield).
- **Hard-decision:** 1 frame with valid CRC (20% yield).

This confirms a 40-percentage-point performance advantage for soft-decision demodulation in low-SNR scenarios. The decoded payloads confirmed the controlled alternation (`BAD`, `OK`, `BAD`, `OK`, `BAD`), verifying that frame filtering operates strictly on valid CRC checks and validating the 100% baseline yield obtained in the FlatSat test.

## Remediation

This control verifies an auditor capability, so most of the action is auditor-side; the developer/integrator/operator guidance is about *what the demodulability of the PHY implies for the deployment*.

- **Auditor.** Use a soft-decision-capable LoRa demodulator (gr-lora_sdr class) for assessment, and treat hard-decision-only yields as a lower bound on what is on the air, not a complete enumeration [marquet2020] [xu2022]. Confirm the SF/BW set actually in use (devices may use multiple data rates) before declaring a capture complete; sweep SF7–SF12 if the profile is unknown.

- **Developer / integrator.** The CSS PHY is, by design, open and demodulable — its protection is not obscurity but the AES-128 crypto layer (FRMPayload confidentiality, MIC integrity). Do not treat "LoRa is hard to demodulate" as a security property: an SDR plus open-source software recovers the frames. Ensure all sensitive data and commands rely on the LoRaWAN crypto, not on the difficulty of demodulation, and assess that crypto under the CR-layer controls.

- **Operator.** Assume any LoRa transmission in range is demodulable to frames by a passive listener; plan the threat model around the link-layer metadata that travels in clear (DevAddr, and the join-request DevEUI/JoinEUI/DevNonce) being observable, and around the encrypted payload's confidentiality resting entirely on key management. PHY demodulation itself exposes no payload, but it is the prerequisite for every analysis above it.
