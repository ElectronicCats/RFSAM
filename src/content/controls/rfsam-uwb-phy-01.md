---
id: RFSAM-UWB-PHY-01
title: Capture and characterise UWB ranging exchanges
protocol: UWB
layer: PHY
criticality: info
applicability:
  - UWB
  - IEEE 802.15.4z
  - IEEE 802.15.4a
deferred: false
objective: >-
  Determine whether a target's UWB ranging exchange can be captured and
  characterised off the air with a real DW3000-class transceiver — recovering the
  802.15.4z frames and their PHY parameters (channel, preamble code, PRF, data
  rate, STS mode) — without claiming to break the STS or recover any key.
intro: >-
  Impulse-radio UWB cannot be seen on a normal SDR waterfall or blind-scanned: a
  UWB channel is >500 MHz wide, sits above 6 GHz, and the signal is sub-nanosecond
  pulses near the noise floor. Capture is done by a DW3000-class transceiver that
  despreads the pulses and frames the 802.15.4z packet in silicon — but only once
  you already know the link's PHY parameters. This control verifies that capture
  is feasible and what it does (and does not) reveal; it is the prerequisite for
  the physical-layer distance-manipulation work assessed at the Attack layer.
prerequisites:
  hardware:
    - 'A DW3000-family UWB transceiver eval board: Qorvo DWM3000EVB (DW3110), driven by a host MCU (NUCLEO-F429ZI in the SEEMOO reference build; nRF52840 with code changes), or a Makerfabs ESP32-UWB-DW3000 board'
    - 'Optional: a second DW3000 board to bring up a controllable ranging peer when you can drive one end of the exchange'
  software:
    - 'SEEMOO uwb-sniffer firmware + sensniff host script + Wireshark (open capture path)'
    - 'or the foldedtoad/dwm3000 (dwt_uwb_driver) port to run/log known two-way-ranging exchanges'
  signal:
    freq: 'HRP UWB ~3.1–10.6 GHz; in practice channel 5 (6489.6 MHz) or channel 9 (7987.2 MHz), each >500 MHz wide'
    bandwidth: '>500 MHz per channel (cannot be covered by a HackRF/bladeRF/USRP-B210 class SDR)'
    modulation: 'Impulse radio (sub-nanosecond pulses), HRP 802.15.4z, ~64/124.8 MHz PRF (BPRF/HPRF); 850 kbps / 6.81 Mbps; distance from pulse time-of-flight, not RSSI'
  skill: advanced
attacks:
  - name: Ghost Peak (HRP UWB distance reduction)
    refs:
      - leu2022ghostpeak
      - leu2022arxiv
    impact: >-
      Reduces the measured ranging distance (12 m to 0 m, ~4% per-attempt success)
      without any cryptographic material — enough to defeat a proximity gate such
      as CCC Digital Key car entry if no other check stands behind it.
    preconditions: >-
      HRP 802.15.4z ranging the attacker can observe and engage; a programmable
      DW3000 board (~$65 DWM3000EVB + nRF52DK). Does NOT require the STS key.
    summary: >-
      The landmark public physical-layer distance-reduction attack on HRP UWB
      (Apple U1 inter-operating with NXP/Qorvo). It motivates why characterising
      the captured ranging waveform and round structure matters — though the attack
      itself is engineered against the radio, not packaged as a turnkey tool.
  - name: Mix-Down clock manipulation
    refs:
      - anliker2023timeforchange
    impact: >-
      Distance reduction from 10 m to 0 m on commercial 802.15.4z chips by exploiting
      transceiver clock imperfections, again without the STS key.
    preconditions: >-
      An 802.15.4z HRP ranging exchange and a programmable UWB transceiver; targets
      the standard's reliance on clock behaviour, not a single implementation.
    summary: >-
      Shows that even STS-authenticated ranging is manipulable at the physical layer
      via clock effects — reinforcing that capture/characterisation, not key recovery,
      is the UWB research surface.
references:
  - key: leu2022ghostpeak
    title: 'Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging'
    authors: 'P. Leu, G. Camurati, A. Heinrich, M. Roeschlin, C. Anliker, M. Hollick, S. Capkun, J. Classen'
    venue: USENIX Security 2022
    year: 2022
    url: 'https://www.usenix.org/conference/usenixsecurity22/presentation/leu'
    type: paper
  - key: leu2022arxiv
    title: 'Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging (preprint)'
    authors: 'P. Leu, G. Camurati, A. Heinrich, M. Roeschlin, C. Anliker, M. Hollick, S. Capkun, J. Classen'
    venue: arXiv 2111.05313
    year: 2021
    url: 'https://arxiv.org/abs/2111.05313'
    type: paper
  - key: anliker2023timeforchange
    title: 'Time for Change: How Clocks Break UWB Secure Ranging'
    authors: 'C. Anliker, G. Camurati, S. Capkun'
    venue: arXiv 2305.09433
    year: 2023
    url: 'https://arxiv.org/abs/2305.09433'
    type: paper
  - key: ieee802154z2020
    title: 'IEEE 802.15.4z-2020: Enhanced Ultra Wideband (UWB) Physical Layers (PHYs) and Associated Ranging Techniques'
    venue: IEEE Standards Association
    year: 2020
    url: 'https://standards.ieee.org/ieee/802.15.4z/10230/'
    type: standard
  - key: seemoo-uwb-sniffer
    title: 'SEEMOO uwb-sniffer — a UWB sniffer with accurate timestamps'
    authors: 'SEEMOO Lab, TU Darmstadt'
    venue: GitHub
    year: 2022
    url: 'https://github.com/seemoo-lab/uwb-sniffer'
    type: tool
  - key: foldedtoad-dwm3000
    title: 'foldedtoad/dwm3000 — port of Qorvo/Decawave DWM3000 driver to the DWS3000 Arduino shield'
    authors: 'C. Callender (foldedtoad)'
    venue: GitHub
    year: 2024
    url: 'https://github.com/foldedtoad/dwm3000'
    type: tool
tools:
  - seemoo-uwb-sniffer
  - dwm3000evb
  - dwm3000-dwt-driver
  - makerfabs-esp32-uwb-dw3000
  - wireshark
bsam: []
resources:
  - RFSAM-RES-24
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

HRP UWB is impulse radio: the transmitter emits very short (sub-nanosecond) RF pulses spread across roughly 500 MHz of bandwidth (the 802.15.4z HRP channels occupy ~499.2 MHz), intermittently and at very low power spectral density, on channel 5 (6489.6 MHz) or channel 9 (7987.2 MHz) [ieee802154z2020]. Distance is derived from the pulses' time-of-flight, not from signal strength; the 802.15.4z amendment's stated purpose is to "increase the integrity and accuracy of ranging measurements," which is what makes the ranging hard to spoof [ieee802154z2020]. The wide-bandwidth impulse timing yields centimetre-level precision (commonly cited as ~10 cm in line-of-sight). None of this is observable on a commodity SDR: those radios top out near 6 GHz and offer tens of MHz of instantaneous bandwidth, so a UWB channel sits both above their frequency ceiling and far wider than their capture bandwidth, and there is no turnkey software receiver for the impulse waveform.

Capture is therefore done by a real DW3000-class transceiver. The chip despreads the incoming pulses against the known channel and preamble code (and, for secure ranging, correlates the Scrambled Timestamp Sequence) and frames the 802.15.4z packet in hardware [seemoo-uwb-sniffer]. The consequence is that PHY and framing happen together on the radio: you do not stare at I/Q, you drive a transceiver that already knows the link. That makes the *Identify* homework mandatory — channel, preamble code, PRF, data rate and STS mode/length must be set in advance, because UWB cannot be blind-scanned [seemoo-uwb-sniffer].

The STS is an AES-keyed pseudo-random pulse sequence the two ranging peers share; the receiver only trusts an arrival time it can authenticate against the expected STS [ieee802154z2020]. So capturing the over-the-air frames does **not** break the STS or recover a key — it recovers the frames and their structure that you are already entitled to decode [seemoo-uwb-sniffer]. The genuine UWB research surface is physical: whether the time-of-flight measurement can be reduced at the physical layer without the key. The landmark public result, **Ghost Peak**, is a practical HRP UWB distance-reduction attack (Apple U1 inter-operating with NXP/Qorvo) that cut 12 m to 0 m with ~4% per-attempt success, using a ~$65 off-the-shelf DWM3000EVB driven by an nRF52DK and **no cryptographic material** [leu2022ghostpeak][leu2022arxiv]. The **Mix-Down** clock-manipulation work later showed 10 m reduced to 0 m on commercial 802.15.4z chips by exploiting transceiver clock imperfections [anliker2023timeforchange]. Both are assessed at the RFSAM *Attack* layer; this PHY control verifies the capture-and-characterise prerequisite they rely on, and confirms what that capture reveals.

## Procedure

All steps are observational capture on your own equipment or with explicit authorisation. No transmission is required to capture; the controllable-peer step (5) transmits and must only be run against test devices you own or are authorised to range.

1. **Recover the PHY parameters first (Identify step).** UWB cannot be scanned, so you must know channel, preamble code, PRF, data rate and STS mode/length before the radio can lock on. For iOS UWB sessions the SEEMOO workflow reads them from the `nearbyd` system logs; for other products infer them from the silicon family, FCC filings, the scheme (Apple Nearby Interaction / CCC / FiRa) and the BLE/NFC bootstrap that keys the session [seemoo-uwb-sniffer]. Record the values you will configure.

2. **Build and flash the SEEMOO sniffer firmware** onto a DWM3000EVB driven by a NUCLEO-F429ZI (the reference host; an nRF52840 needs code changes). The build needs STM32CubeIDE and Qorvo's DW3xxx sample code; the sniffer sources are copied into the sample project and `main.c` overwritten, then compiled and run on the NUCLEO [seemoo-uwb-sniffer].
   ```
   # Hardware mod for the NUCLEO-F429ZI per the SEEMOO README:
   # remove solder on SB121, solder SB122 (not needed for nRF boards)
   ```
   Expected: two benign post-build errors (`arm-none-eabi-size: ... file format not recognized`) that the README documents as non-issues; the firmware otherwise builds clean.

3. **Set the link's PHY parameters in firmware.** Edit the `config` struct in `uwb_sniffer.c` to the channel, preamble code, data rate, STS mode and STS length recovered in step 1, then re-flash [seemoo-uwb-sniffer].
   Expected: an incorrect configuration yields long, malformed frames where STS or preamble bits are misread as data — that mismatch is itself the signal that a parameter is wrong.

4. **Stream the frames to Wireshark over the sensniff pipe.** The firmware speaks the sensniff protocol and adds reception timestamps at the DW3000's 15.65 ps accuracy [seemoo-uwb-sniffer].
   ```
   python3 sensniff.py -DINFO
   ```
   To pin a specific device when several are attached:
   ```
   python3 sensniff.py -DINFO -d /dev/cu.usbmodem230d
   ```
   Then in Wireshark add a pipe interface at `/tmp/sensniff` (Capture options -> Manage Interfaces -> Pipes) and start capturing.
   Expected: 802.15.4z frames in Wireshark with picosecond reception timestamps. Note the firmware forwards malformed frames too, so validate each frame's header and length rather than trusting raw counts.

5. **Optionally bring up a controllable ranging peer** to characterise a scheme's ranging-round structure when you control one end. Use the foldedtoad/dwm3000 port of Qorvo's `dwt_uwb_driver` on a DWM3000EVB (or Makerfabs ESP32-UWB-DW3000) to set the 802.15.4z PHY and run/log two-way-ranging exchanges [foldedtoad-dwm3000].
   ```bash
   git clone https://github.com/foldedtoad/dwm3000
   ```
   Expected: a known TWR exchange you can log end-to-end. This captures only the exchanges your peer participates in — it is a development driver, not a passive sniffer for arbitrary third-party links.

6. **Characterise and record.** From the captured frames, document channel/preamble/PRF/data-rate/STS mode, the frame format, and the ranging-round structure (TWR/TDoA/PDoA) for the scheme in use. This is the deliverable: the capture is feasible and characterised; it does not assert any STS break.

## Field case

Illustrative walkthrough — substitute the values you capture on your own bench. A representative, reproducible bring-up against a DW3000 development link you own (no third-party device required):

- Flash the SEEMOO sniffer firmware to a DWM3000EVB on a NUCLEO-F429ZI; in a second board run a foldedtoad/dwm3000 TWR example as the controllable peer. Configure both to the same parameters — the shipped default config (`config_options.c`, `CONFIG_OPTION_01`) is **channel 5 (6489.6 MHz), preamble code 9, 64 MHz PRF, 850 kbps**, with STS mode 1 / STS length 64 as set by the example [foldedtoad-dwm3000].
- Start capture with `python3 sensniff.py -DINFO` and attach Wireshark to the `/tmp/sensniff` pipe.
- Result: the TWR poll / response / final frames appear in Wireshark with 15.65 ps reception timestamps; deliberately changing the sniffer's preamble code away from the peer's produces the malformed long frames the README warns about — a clean demonstration that UWB capture is parameter-locked, not scanned.

This is an illustrative bring-up, not measured author field data: the end-to-end capture was not bench-run for this control, so the asserted result (the TWR frame list and 15.65 ps timestamps) is still to be recorded on hardware: [FILL: bench-captured frame list, timestamps, and the working `config` struct values]. The configuration values are the real shipped default — channel 5, preamble code 9, 64 MHz PRF, 850 kbps, STS mode 1 / length 64 — confirmed against `CONFIG_OPTION_01` in foldedtoad/dwm3000 `config_options.c`, not invented.

## Remediation

UWB ranging capture is observational, so remediation targets the consumers of the ranging result, not the radio that hears it.

- **Developers (chip/stack):** require STS-authenticated, secure-ranging measurements and reject legacy/non-secure 802.15.4a or non-STS ranging where the application is security-sensitive; the STS is what keeps a captured frame from being a forgeable distance claim [ieee802154z2020]. Track the physical-layer distance-reduction literature (Ghost Peak, Mix-Down) as an open class against HRP, not a single patchable bug [leu2022ghostpeak][anliker2023timeforchange].
- **Integrators (product):** never let a single UWB proximity measurement be the only thing standing between an attacker and the asset. Bound the acceptable distance tightly, reject implausible distance jumps, and fail safe if ranging is lost or inconsistent — because the proven attacks shorten distance at the physical layer without any key [leu2022ghostpeak]. Protect the BLE/NFC bootstrap that keys the UWB session (assessed in the BLE and RFID/NFC wayfinders), since the session keys live there, not in the pulses.
- **Operators (deployment):** treat UWB-gated access (car entry/start, locks, payment proximity) as defence-in-depth — pair it with an independent factor and monitor for anomalous unlock/range patterns. Recognise that an adversary capturing and characterising the link is the precursor step, not yet a compromise.
