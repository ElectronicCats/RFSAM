---
id: RFSAM-BLE-PHY-01
title: Demodulate the air and recover link-layer bits
protocol: BLE
layer: PHY
criticality: info
applicability:
  - BLE
deferred: false
objective: >-
  Verify that the toolchain can demodulate the BLE GFSK waveform and recover
  clean link-layer bits — correlating the access address, de-whitening the PDU,
  and validating the CRC — for the target's PHY (LE 1M / 2M / Coded), either on a
  dedicated radio or by channelising a wideband SDR capture.
intro: >-
  Everything above the air starts here: a BLE frame is GFSK, prefixed by a known
  preamble and a 32-bit access address, with its PDU and CRC whitened by a
  channel-seeded LFSR. This control checks that you can turn the RF into correct
  bits — find the access address, de-whiten, and pass CRC — because every
  link-layer, crypto and attack control for BLE depends on clean per-channel bits.
prerequisites:
  hardware:
    - 'A dedicated BLE sniffer that demodulates on-chip: a CC1352-class board for Sniffle (CatSniffer), an nRF52840 dongle (nRF Sniffer), or an Ubertooth One'
    - 'Or a wideband SDR for the channelised path: HackRF One (~20 MHz), bladeRF 2.0 micro (full 80 MHz in oversampling), or USRP B210'
  software:
    - 'Sniffle, nRF Sniffer, or Ubertooth host tools for the on-chip path; ice9-bluetooth-sniffer for the SDR path; Wireshark to read the decoded frames'
  signal:
    freq: '2.402–2.480 GHz (40 × 2 MHz channels: 3 advertising 37/38/39 + 37 data)'
    bandwidth: '2 MHz per channel (80 MHz full band)'
    modulation: 'GFSK (BT = 0.5, ~250 kHz deviation); PHYs LE 1M (1 Mbps), LE 2M, LE Coded'
  skill: intermediate
attacks:
  - name: Passive access-address and CRCInit recovery
    refs:
      - ryan2013woot
    impact: >-
      Lets a passive listener identify and follow an already-established,
      unencrypted connection it never saw set up — the bit-recovery prerequisite
      for downstream sniffing, decryption and injection.
    preconditions: >-
      Reception of data-channel packets from a live connection; no key needed
      because whitening and CRC use publicly known, channel-derived seeds.
    summary: >-
      Treats any candidate 32 bits following a preamble-like pattern as a possible
      access address, then recovers CRCInit by running the over-the-air CRC back
      through the reversible CRC LFSR — recovering the parameters needed to lock
      onto a connection from raw demodulated bits alone.
  - name: Link-layer fuzzing from recovered bits (SweynTooth)
    cve:
      - CVE-2019-16336
      - CVE-2019-17519
    refs:
      - garbelini2020sweyntooth
    impact: >-
      Crashes, deadlocks, buffer overflows or security bypass on vulnerable BLE
      SoCs, triggered by an in-range attacker.
    preconditions: >-
      An in-range central that can put crafted link-layer frames on the air to a
      target peripheral — which presupposes exactly the demodulation /
      bit-recovery capability this control verifies.
    summary: >-
      Set of 11 new vulnerabilities (13 CVE IDs) reported across BLE stacks from
      several SoC vendors, found by a central-device fuzzer that connects to a
      peripheral and sends malformed link-layer / Security Manager packets, or
      well-formed packets at the wrong protocol state, mutating every frame
      field; cited here only as evidence that PHY-layer bit control is the
      precondition for the link-layer findings BSAM then assesses.
references:
  - key: ryan2013woot
    title: 'Bluetooth: With Low Energy Comes Low Security'
    authors: Mike Ryan (iSEC Partners)
    venue: USENIX WOOT 2013
    year: 2013
    url: 'https://www.usenix.org/conference/woot13/workshop-program/presentation/ryan'
    type: paper
  - key: garbelini2020sweyntooth
    title: 'SweynTooth: Unleashing Mayhem over Bluetooth Low Energy'
    authors: 'M. E. Garbelini, C. Wang, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX ATC 2020
    year: 2020
    url: 'https://www.usenix.org/conference/atc20/presentation/garbelini'
    type: paper
  - key: btcorespec54
    title: 'Bluetooth Core Specification v5.4 — Vol 6 (Low Energy Controller), Part B: Link Layer Specification'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2023
    url: 'https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/index-en.html'
    type: spec
  - key: ble-primer
    title: The Bluetooth Low Energy Primer
    authors: Bluetooth SIG (M. Woolley)
    venue: Bluetooth SIG
    year: 2022
    url: 'https://www.bluetooth.com/bluetooth-le-primer/'
    type: spec
  - key: ice9repo
    title: ice9-bluetooth-sniffer — Wireshark-compatible all-channel BLE sniffer (HackRF / bladeRF / USRP)
    authors: Mike Ryan (ICE9 Consulting)
    venue: GitHub
    year: 2023
    url: 'https://github.com/mikeryan/ice9-bluetooth-sniffer'
    type: tool
tools:
  - sniffle
  - ice9-bluetooth-sniffer
  - nrf-sniffer
  - ubertooth-tools
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-02
  - RFSAM-RES-03
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A BLE link-layer packet is sent as a GFSK waveform: the Gaussian-filtered FSK
keys the symbol with roughly ±250 kHz deviation and BT = 0.5 over a 1 µs symbol
on the LE 1M PHY [[ryan2013woot]][[btcorespec54]]. Demodulation is therefore
an FM/frequency-discriminator step — the sign of the instantaneous frequency
offset is the bit — followed by clock recovery to slice symbols. Sniffers do
this on a dedicated radio's modem (the Ubertooth's CC2400 is configured to
demodulate GFSK at the BLE deviation [[ryan2013woot]]); the SDR path instead
channelises a wide capture, then FM-demodulates each 2 MHz channel in software
[[ice9repo]].

Recovering *bits* is not the same as recovering *frames*. Every packet starts
with an 8-bit alternating preamble, then a 32-bit **access address** (AA), then
the PDU and a 24-bit CRC [[ryan2013woot]][[btcorespec54]]. On the three
advertising channels the AA is the fixed constant `0x8e89bed6`, so a demodulator
finds packet boundaries by correlating against that known 32-bit value
[[ryan2013woot]][[ble-primer]]. The PDU and CRC are then **whitened** — XORed
with the output of a 7-bit LFSR (taps at bits 4 and 7) whose seed is derived
from the channel index alone, with no key involved; because the seed and LFSR
are public, de-whitening "does not complicate sniffing" [[ryan2013woot]][[btcorespec54]].
A correct frame is confirmed when the de-whitened CRC, computed with the
connection's CRCInit, matches.

For a connection the auditor never saw set up, the AA is a per-connection random
value and not known in advance. Ryan's method treats any 32 bits following a
preamble-like transition as a *candidate* AA, then recovers the connection's
CRCInit by feeding the over-the-air CRC backwards through the CRC LFSR, which is
reversible — the same reversibility Spill and Bittau noted for classic Bluetooth
holds for the BLE CRC [[ryan2013woot]]. This is what lets a passive listener lock
onto and follow an already-established connection from raw bits, and it is the
PHY-layer prerequisite for the connection-following described in RFSAM-RES-02.

Why this control sits at PHY and matters on its own: bit recovery is the floor
the rest of the stack stands on. Link-layer fuzzers such as SweynTooth drive a
central that connects to the target peripheral and then sends malformed
link-layer (and Security Manager) packets, or well-formed packets at the wrong
protocol state, mutating every field of the over-the-air frame — and putting
crafted bits on the air presupposes exactly the demodulate/de-whiten/CRC
capability verified here [[garbelini2020sweyntooth]].
RFSAM owns the spectrum and signal/PHY floors for BLE; the link-layer and
above (frame semantics, injection, key recovery) are assessed under Tarlogic's
BSAM. This control deliberately stops at "can you recover correct bits", which is
why its criticality is observational (`info`) rather than an exploit.

## Procedure

Run all capture against your own test devices, in an authorised environment.
Passive demodulation is observational, but treat the spectrum as in-scope only
where you have permission.

1. **Pick the path.** On-chip demodulation (Sniffle / nRF Sniffer / Ubertooth)
   is simplest and recovers bits the radio's modem already sliced; the SDR path
   (ice9) channelises a wideband capture and demodulates in software, and is the
   only path that can grab an *already-established* connection (RFSAM-RES-01,
   RFSAM-RES-02, RFSAM-RES-03).

2. **On-chip path — capture and confirm bit recovery with Sniffle.** Scan the
   advertising channels (passive, `-a` = don't follow connections) and write a
   PCAP for Wireshark:
   ```bash
   ./sniff_receiver.py -s /dev/ttyACM0 -a -o adv.pcap
   ```
   Expected: a live table of advertisements; each captured packet that
   Wireshark dissects (AA `0x8e89bed6`, an `ADV_IND`/`ADV_EXT_IND` PDU, and
   `CRC: ... [correct]`) is proof the chain demodulate → AA-correlate →
   de-whiten → CRC succeeded. A flood of frames with `CRC incorrect` means the
   PHY/sync is wrong (wrong PHY selected, or signal too weak); add `-C` to also
   capture CRC-error packets when diagnosing this.

3. **On-chip path — verify on a non-advertising / data channel.** Drop the `-a`
   flag so Sniffle follows the connection (following is its default) and confirm
   it decodes data PDUs on channels other than 37/38/39 — this exercises the
   per-channel whitening seed and the per-connection AA/CRCInit, not just the
   fixed advertising constants. Filter to the target advertiser's MAC to lock on:
   ```bash
   ./sniff_receiver.py -s /dev/ttyACM0 -m 12:34:56:78:9A:BC -o conn.pcap
   ```
   Expected: `LL Data` PDUs with `CRC ... [correct]` on data-channel indices.
   Read the connection's AA and CRCInit from the `CONNECT_IND` in Wireshark.

4. **SDR path — channelise and demodulate the whole band.** Capture / stream the
   band and let ice9 split it into 2 MHz channels, FM-demodulate each, and write
   an all-channel PCAP:
   ```bash
   ice9-bluetooth -l -i bladerf0 -a -w all_channels.pcap
   ```
   Expected: per-channel BLE frames in `all_channels.pcap` openable in Wireshark.
   The channelizer is the bottleneck — start narrow (e.g. 20 channels) and widen
   only while no overflow/dropped-sample is reported [[ice9repo]] (RFSAM-RES-03).
   Garbage / "random bytes" decoded instead of frames indicates the demod or
   sample rate is mismatched, per the tool's own troubleshooting note.

5. **Pass/fail.** The control passes if at least one path yields frames marked
   `CRC correct` for the target's PHY on both an advertising and a data channel,
   with no sustained sample-loss. If only advertising decodes and the SDR path
   overflows at full band, declare connection-following out of scope (RFSAM-RES-02)
   rather than reporting false negatives.

## Field case

Illustrative walkthrough — substitute the values you capture. Capturing a BLE
light controller's advertising on channel 37 with a CatSniffer running Sniffle,
Wireshark dissects the `ADV_IND` with the fixed advertising access address
`0x8e89bed6` and `CRC ... [correct]` — confirming the demodulate → AA-correlate
→ de-whiten → CRC chain on the radio's own modem. The useful detail is the
de-whitening: the PDU bytes are only legible after the channel-37 whitening seed
is removed, and because that seed is derived from the channel index — not a key —
the same capture is readable by any sniffer, which is precisely why passive BLE
sniffing is feasible at all [[ryan2013woot]].

On the SDR path, splitting the 80 MHz band into 40 × 2 MHz channels on a
HackRF/bladeRF and FM-demodulating each is where the cost shows: ice9's
channelizer is the stated bottleneck, so start the run at 20 channels and widen
while watching for dropped samples. A naive full-band attempt on an underpowered
host decodes "a bunch of random bytes" rather than frames — the tool's own symptom
of a demod/rate mismatch [[ice9repo]]. The sensitivity margin — how many dB below
a clean capture the channelised SDR path still recovers frames — is bench-specific:
[FILL: measured dB margin from a controlled bench capture].

## Remediation

Bit recovery at PHY is an inherent, public property of the BLE waveform — the
GFSK parameters, the advertising access address, the whitening seeds and the CRC
are all in the open specification, so there is no PHY-layer "fix" that hides the
bits from a competent receiver [[ryan2013woot]][[btcorespec54]]. Remediation
therefore lives above the recovered bits:

- **Developer:** never treat the link as confidential at the PHY/LL level. Enable
  LE encryption (LE Secure Connections, ECDH pairing) so that even a perfectly
  demodulated, de-whitened, CRC-valid PDU yields ciphertext, not plaintext, above
  the link layer. Validate and bounds-check all link-layer inputs: the SweynTooth
  class shows that malformed-but-CRC-valid frames crash unhardened SoC stacks
  [[garbelini2020sweyntooth]].
- **Integrator:** select SoCs/stacks with current firmware that patch the
  SweynTooth-class link-layer parsing bugs, and verify the device rejects
  unencrypted access to anything sensitive — bit recovery on the air should never
  translate into readable application data.
- **Operator:** assume any in-range party can recover and read unencrypted BLE
  bits; for sensitive deployments, test in an RF-shielded environment and treat
  on-air observability as a given, not a control.
