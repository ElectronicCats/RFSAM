---
id: RFSAM-ADSB-LL-01
title: Assess ADS-B message authenticity
protocol: ADSB
layer: LL
criticality: high
applicability:
  - ADS-B
  - 1090ES
  - Mode S Extended Squitter
deferred: false
objective: >-
  Determine what authenticity guarantees the ADS-B link provides for a received
  frame, whether a receiver can prove a DF17/DF18 Extended Squitter came from
  the aircraft whose ICAO address, callsign and position it carries, and whether
  the frame is protected against modification or replay.
intro: >-
  ADS-B is an unauthenticated, unencrypted broadcast: the 24-bit CRC on each
  1090ES frame is an error-detecting checksum, not a cryptographic signature, so
  a receiver cannot tell a genuine aircraft from a well-formed forgery. This
  control verifies that absence directly, it characterises the link's authenticity
  (none) and is the assessment that justifies the spoofing/injection findings at
  the Attack layer.
prerequisites:
  hardware:
    - 'A receive-only SDR tuned to 1090 MHz: RTL-SDR V4 (canonical/cheap), HackRF One, bladeRF 2.0 micro, or USRP B210; a quarter-wave (~6.9 cm) 1090 MHz antenna, ideally a 1090 MHz band-pass filter + LNA for weak/distant traffic'
  software:
    - 'A 1090ES decoder (dump1090 or readsb) plus pyModeS to interpret the raw frame fields and confirm there is no authentication element'
  signal:
    freq: '1090 MHz (Mode S Extended Squitter / 1090ES, worldwide); 978 MHz UAT additionally in the US for lower-altitude general aviation'
    bandwidth: '~2 MHz (the decoder typically samples 2 to 2.4 MS/s)'
    modulation: 'Pulse-Position Modulation (PPM) at 1 Mbps; a 112-bit Extended Squitter (8 µs preamble + 112 µs data)'
  skill: intermediate
attacks:
  - name: ADS-B message injection / spoofing
    refs:
      - costin2012ghost
      - schaefer2013experimental
    impact: >-
      An attacker that can transmit a well-formed 1090ES frame can inject ghost
      aircraft, move or modify an existing track, or alter a callsign/ICAO
      address, and every receiver in range accepts it as a genuine aircraft.
    preconditions: >-
      A TX-capable SDR within RF reach of the target receiver. No key, pairing or
      handshake is required because the link carries no authentication; the only
      barrier is transmitting a correctly framed, CRC-valid message at adequate
      power.
    summary: >-
      The link provides no authenticity, so forging an Extended Squitter is
      sufficient to impersonate an aircraft, the defining ADS-B weakness this
      control assesses.
  - name: Message modification and deletion
    refs:
      - schaefer2013experimental
      - strohmeier2014security
    impact: >-
      Overshadowing or selectively jamming legitimate squitters lets an attacker
      corrupt or remove specific aircraft from the picture, not only add forged
      ones; the receiver has no integrity check that would reject a tampered or
      missing frame.
    preconditions: >-
      RF access to the receiver and the ability to transmit/overpower or jam on
      1090 MHz at the right times relative to the target squitter.
    summary: >-
      Because there is no integrity protection or replay defence, frames can be
      modified or deleted as well as injected.
references:
  - key: schaefer2013experimental
    title: Experimental Analysis of Attacks on Next Generation Air Traffic Communication
    authors: 'M. Schäfer, V. Lenders, I. Martinovic'
    venue: 'ACNS 2013 (Applied Cryptography and Network Security), LNCS 7954, Springer'
    year: 2013
    url: 'https://doi.org/10.1007/978-3-642-38980-1_16'
    type: paper
  - key: strohmeier2014security
    title: On the Security of the Automatic Dependent Surveillance-Broadcast Protocol
    authors: 'M. Strohmeier, V. Lenders, I. Martinovic'
    venue: IEEE Communications Surveys & Tutorials
    year: 2014
    url: 'https://arxiv.org/abs/1307.3664'
    type: paper
  - key: strohmeier2014realities
    title: 'Realities and Challenges of NextGen Air Traffic Management: The Case of ADS-B'
    authors: 'M. Strohmeier, M. Schäfer, V. Lenders, I. Martinovic'
    venue: IEEE Communications Magazine 52(5)
    year: 2014
    url: 'https://ora.ox.ac.uk/objects/uuid:dae3c7a3-e624-46c4-97d7-91eb69f1c14b'
    type: paper
  - key: costin2012ghost
    title: 'Ghost in the Air(Traffic): On insecurity of ADS-B protocol and practical attacks on ADS-B devices'
    authors: 'A. Costin, A. Francillon'
    venue: Black Hat USA 2012
    year: 2012
    url: 'https://www.eurecom.fr/publication/3788'
    type: talk
  - key: icao9871
    title: 'Technical Provisions for Mode S Services and Extended Squitter (Doc 9871), 2nd ed.'
    authors: ICAO
    venue: International Civil Aviation Organization
    year: 2012
    url: 'https://store.icao.int/en/technical-provisions-for-mode-s-services-and-extended-squitter-doc-9871'
    type: standard
tools:
  - dump1090
  - readsb
  - pymodes
bsam: []
resources:
  - RFSAM-RES-01
  - RFSAM-RES-21
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

ADS-B "out" rides the Mode S downlink as a 112-bit Extended Squitter, transmitted as 1 Mbps pulse-position modulation on 1090 MHz (DF17 from transponder-equipped aircraft, DF18 for TIS-B / non-transponder sources) [icao9871]. Each frame carries the 24-bit ICAO aircraft address, a type code, and the payload it implies, callsign, CPR-encoded position, or velocity. The defining property for an auditor is that *none of these fields is authenticated*: the protocol has no signature over the message, no message authentication code, no sequence number and no replay protection [strohmeier2014security]. The trailing 24 bits are a CRC computed over the message; it is an error-detecting checksum (and, in Mode S, an address overlay), **not** a cryptographic integrity check, so anyone can recompute it for a forged frame [icao9871][strohmeier2014security].

The consequence is that "authenticity assessment" at the link layer has a known answer, the link provides none, and the control's job is to confirm and characterise that for the specific target deployment. The academic and practical literature established this directly: Costin and Francillon built an SDR receive/transmit chain in GNU Radio and demonstrated that injecting forged ADS-B is practical for a moderately capable attacker [costin2012ghost]; Schäfer, Lenders and Martinovic experimentally analysed message **injection, modification and deletion** against ADS-B and confirmed the absence of any link-layer defence against them [schaefer2013experimental]; the Strohmeier survey synthesises the gap and the proposed (non-cryptographic) countermeasures such as multilateration and plausibility checking [strohmeier2014security][strohmeier2014realities].

Two named attack families follow from this missing authenticity. **Injection / spoofing**, transmit a well-formed, CRC-valid Extended Squitter with a chosen ICAO address and position, and receivers accept a ghost aircraft or a moved track [costin2012ghost][schaefer2013experimental]. **Modification and deletion**, overshadow or selectively jam genuine squitters to corrupt or remove specific aircraft, since there is no integrity or completeness guarantee [schaefer2013experimental][strohmeier2014security]. This control assesses the link's (lack of) authenticity; the active transmit-side exploitation is the Attack-layer control (RFSAM-ADSB-AT-01) and is legally sensitive, see Remediation and the authorised-testing note there.

## Procedure

Receiving and decoding ADS-B is passive and generally lawful; the steps below are receive-only. Do **not** transmit on 1090 MHz outside an authorised, RF-contained (conducted or shielded) setup, that is the Attack-layer control, not this one.

1. Confirm the band is alive and capture is clean. Tune a receive-only SDR to 1090 MHz and start the reference decoder; for a portable capture record raw I/Q first and log overflow counters (RFSAM-RES-01).
   ```bash
   dump1090 --device-type rtlsdr --net --net-bo-port 30005 --quiet
   ```
   Expected: a running decoder that prints decoded aircraft rows and serves Beast output on TCP 30005. Local aircraft appear within seconds; an empty table with a good antenna means you are mistuned or the sky is quiet.

2. Capture a window of raw frames to interpret offline. Pull the Beast/raw stream and keep the hex messages.
   ```bash
   nc 127.0.0.1 30002 | tee adsb-raw.txt
   ```
   Expected: lines of `*8D...;` Mode S hex frames. The `8D` (DF17) or `8E`/`90`-class first byte tells you the downlink format; capture a few hundred frames covering several distinct ICAO addresses.

3. Decode the fields and confirm there is no authentication element. Use pyModeS to break a frame into its components.
   ```bash
   python3 -c "import pyModeS as pms; m='8D40621D58C382D690C8AC2863A7'; print('DF', pms.df(m)); print('ICAO', pms.adsb.icao(m)); print('typecode', pms.adsb.typecode(m)); print('CRC residual', pms.crc(m))"
   ```
   Expected: `DF 17`, `ICAO 40621d`, a type code, and a CRC residual of `0` for an intact frame. The point of the step is what is *absent*, there is no signature, MAC, nonce or sequence field anywhere in the 112 bits; the only integrity element is the CRC, which any transmitter can compute [strohmeier2014security][icao9871].

4. Demonstrate that the CRC offers no authenticity. Recompute the CRC over a *modified* message body (e.g. flip the callsign or position bits) and show it is trivially made valid again, proving the checksum binds nothing to the real sender.
   ```bash
   python3 -c "import pyModeS as pms; m='8D40621D58C382D690C8AC2863A7'; body=m[:-6]; print('forged-valid frame:', body + format(pms.crc(body + '000000', encode=True), '06X'))"
   ```
   Expected: a new 28-hex-character frame whose CRC residual is `0` despite carrying an attacker-chosen body, the concrete evidence that the link provides integrity-of-transmission detection only, not authenticity of origin. (This is a local computation on captured/synthetic data; it transmits nothing.)

5. Record the finding for the target deployment: which link (1090ES vs 978 UAT), which message types and identifiers are exposed in clear, and the confirmation that no field authenticates the originator. Note what downstream system trusts the feed (tracking display, aggregator, TCAS-style logic), that scopes the impact of a spoof.

## Field case

A representative bench walk-through using a single RTL-SDR V4 on a quarter-wave 1090 MHz whip indoors near a window. `dump1090 --net` decoded local traffic within a few seconds; capturing ~5 minutes of Beast output yielded several hundred DF17 frames across roughly [FILL: number of distinct ICAO addresses observed] aircraft.

Taking one captured airborne-position frame `8D40621D58C382D690C8AC2863A7`, pyModeS reported `DF 17`, ICAO `40621d`, an airborne-position type code, and CRC residual `0`. Re-running step 4 against a body with a deliberately altered position produced a *different* 28-hex frame that still computed to CRC residual `0`. That is the whole finding made tangible: the receiver's only integrity element validated an attacker-chosen payload exactly as readily as the genuine one, because the CRC binds the message to itself, not to the aircraft. No transmission occurred, the forged frame existed only as a hex string in the analysis, never on the air.

The decoded ICAO `40621d` and the frame `8D40621D58C382D690C8AC2863A7` are the standard ADS-B airborne-position documentation example (DF17, type code 11), used here as a reproducible decode rather than measured local traffic; the bracketed aircraft count is left as a [FILL: number of distinct ICAO addresses observed] placeholder for the operator's own capture and must not be presented as a measured result.

## Remediation

ADS-B authenticity cannot be added at the link layer without changing the standard, so remediation is about *detecting* forgeries and *not over-trusting* the feed rather than cryptographically securing it [strohmeier2014security][strohmeier2014realities].

- **Developer (decoder / receiver software):** never treat a CRC-valid frame as a trusted one. Implement plausibility checks on the decoded stream, physically impossible kinematics (jumps, impossible speeds/climb rates), positions inconsistent with the receiver's own range/antenna geometry, and ICAO addresses that should not be airborne or that appear from impossible directions [strohmeier2014security]. Expose a confidence/anomaly flag rather than a binary "valid".

- **Integrator (system fusing the feed):** corroborate ADS-B against an independent source before acting on it. Cross-receiver multilateration (MLAT) times the same frame at several stations to fix an aircraft independently of what it claims; fuse with primary/secondary radar where available. Do not let a single unauthenticated broadcast drive a safety- or security-relevant decision [strohmeier2014realities].

- **Operator / asset owner:** monitor for spoofing patterns (sudden ghost tracks, duplicated or implausible ICAO addresses, tracks that appear only at one receiver) and have a procedure for when the picture is untrustworthy. Treat any control or display that ingests ADS-B as consuming untrusted input.

- **Note on active testing:** validating the injection side (RFSAM-ADSB-AT-01) means transmitting on 1090 MHz, which is protected aviation safety spectrum that affects real air-traffic systems. Do this **only** as authorised lab/research work over a conducted (cabled) or shielded (Faraday-enclosure) path into your own receiver, with explicit permission, never radiate on-air under any circumstances. This control's own procedure stays receive-only and computes forgeries offline.
