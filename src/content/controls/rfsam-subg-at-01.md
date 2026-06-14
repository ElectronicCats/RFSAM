---
id: RFSAM-SUBG-AT-01
title: Replay and forge a sub-GHz burst
protocol: SUBG
layer: AT
criticality: high
applicability:
  - garage/gate remotes
  - car key fobs (RKE)
  - alarm sensors
  - TPMS / telemetry
  - 433 MHz smart-home
deferred: false
objective: >-
  Determine whether a captured sub-GHz burst can be re-transmitted (fixed code)
  or coerced into acceptance (rolling code, via jam-and-capture or
  resynchronisation) to operate the device or spoof a reading it trusts.
intro: >-
  The code type decides the attack. A fixed-code device acts on a verbatim
  replay of any captured burst; a rolling-code device rejects an old code, but
  is still defeated by jam-and-capture (RollJam) — withholding a valid code the
  receiver never saw — or by resynchronisation replay (RollBack). This control
  verifies which of those holds, building on the demodulated frame from the
  capture step.
prerequisites:
  hardware:
    - 'A transmit-capable sub-GHz radio: HackRF One, YARD Stick One (CC1111), CatSniffer (SX1262), or Flipper Zero (CC1101)'
    - 'For jam-and-capture: a second transceiver (or a wideband SDR) to jam the receiver while a first records the fob'
  software:
    - 'rfcat (YARD Stick One), Universal Radio Hacker (SDR replay / crafted-frame TX), Flipper Zero Sub-GHz app, or catnip (SX1262 (G)FSK)'
  signal:
    freq: '315 MHz (NA/Asia remotes & TPMS) · 433.92 MHz (global workhorse) · 868 MHz (EU) · 915 MHz (US ISM, 902–928)'
    bandwidth: 'narrowband ISM channel; OOK/ASK bursts are a few kHz to tens of kHz wide'
    modulation: 'OOK/ASK (most common) or (G)FSK; PWM/Manchester/PPM bit encoding at a few hundred to a few thousand baud'
  skill: intermediate
attacks:
  - name: Fixed-code replay
    refs:
      - urh
      - rollingcode
    impact: Re-transmitting a captured fixed-code burst operates the device (opens a gate, spoofs a sensor reading) with no further work.
    preconditions: The device sends the same payload every press (PT2262/EV1527/HT12-class encoder) and there is no rolling counter.
    summary: >-
      Fixed-code remotes and sensors send their payload in the clear and verbatim;
      capture once and re-send it from any transmit-capable radio to drive the
      receiver.
  - name: OpenSesame (De Bruijn brute force)
    refs:
      - opensesame
      - opensesame-repo
    impact: Opens most fixed-code garages/gates in seconds by transmitting every possible code without prior capture.
    preconditions: A fixed-code receiver with a small keyspace (e.g. 8–12 DIP-switch bits) and a shift-register comparator that accepts overlapping codes.
    summary: >-
      A De Bruijn sequence packs every n-bit code into a minimal overlapping
      bitstream, cutting a 12-bit brute force from minutes to seconds against
      shift-register fixed-code receivers.
  - name: RollJam (jam-and-capture)
    refs:
      - rolljam-sdr
      - rolljam-rtlsdr
    impact: Yields a valid, unused rolling code the attacker can replay later to operate a car, garage or alarm.
    preconditions: A rolling-code device whose receiver can be jammed while a sniffer records the victim's press; the user presses again, perceiving only a one-press failure.
    summary: >-
      Jam the receiver while recording the first press (so the code stays unused),
      replay it to operate the device now, and keep the freshly captured next code
      to operate it later.
  - name: RollBack (resynchronisation replay)
    cve:
      - CVE-2022-37305
      - CVE-2022-37418
    refs:
      - rollback
      - cve-2022-37305
      - cve-2022-37418
    impact: Replaying a small set of previously captured consecutive codes resynchronises the counter so old codes become valid again — reusable indefinitely, no jamming.
    preconditions: An RKE receiver that resynchronises its rolling-code counter on a short run of consecutive valid codes (RollBack research found ~70% of tested Asian-market RKE systems vulnerable; NVD records it on certain Honda through 2018 — five consecutive signals, CVE-2022-37305 — and certain Nissan, Kia and Hyundai through 2017 — two consecutive signals, CVE-2022-37418).
    summary: >-
      Capture two-or-more consecutive codes once; replaying them in sequence rolls
      the receiver's counter back to a prior state, re-enabling already-used codes
      at any future time.
references:
  - key: urh
    title: 'Universal Radio Hacker: investigate wireless protocols like a boss'
    authors: J. Pohl, A. Noack
    venue: GitHub (jopohl/urh)
    year: 2024
    url: 'https://github.com/jopohl/urh'
    type: tool
  - key: rollingcode
    title: 'Rolling code'
    venue: Wikipedia
    year: 2025
    url: 'https://en.wikipedia.org/wiki/Rolling_code'
    type: spec
  - key: opensesame
    title: 'OpenSesame — opening fixed-code garage doors with a De Bruijn sequence'
    authors: S. Kamkar
    venue: samy.pl
    year: 2015
    url: 'https://sa.my/opensesame/'
    type: blog
  - key: opensesame-repo
    title: 'opensesame — attacks wireless garages using a Mattel toy'
    authors: S. Kamkar
    venue: GitHub (samyk/opensesame)
    year: 2015
    url: 'https://github.com/samyk/opensesame'
    type: tool
  - key: rolljam-sdr
    title: 'Implementing and testing RollJam on software-defined radios'
    authors: 'D. Stabili, F. Valgimigli, T. Bocchi, F. Veronesi, M. Marchetti'
    venue: ITASEC 2024 (CEUR-WS Vol-3731)
    year: 2024
    url: 'https://ceur-ws.org/Vol-3731/paper40.pdf'
    type: paper
  - key: rolljam-rtlsdr
    title: 'Breaking into cars wirelessly with a $32 homemade device called RollJam'
    venue: rtl-sdr.com
    year: 2015
    url: 'https://www.rtl-sdr.com/breaking-into-cars-wirelessly-with-a-32-homemade-device-called-rolljam/'
    type: blog
  - key: rollback
    title: 'RollBack: a new time-agnostic replay attack against the automotive remote keyless entry systems'
    authors: 'L. Csikor, H. W. Lim, J. W. Wong, S. Ramesh, R. P. Parameswarath, M. C. Chan'
    venue: 'arXiv 2210.11923 (also ACM Trans. Cyber-Physical Systems, 2024)'
    year: 2022
    url: 'https://arxiv.org/abs/2210.11923'
    type: paper
  - key: cve-2022-37305
    title: 'CVE-2022-37305 — RollBack on certain Honda RKE receivers (five consecutive signals force resynchronisation)'
    venue: NVD
    year: 2022
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-37305'
    type: cve
  - key: cve-2022-37418
    title: 'CVE-2022-37418 — RollBack on certain Nissan, Kia and Hyundai RKE receivers (two consecutive signals force resynchronisation)'
    venue: NVD
    year: 2022
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-37418'
    type: cve
  - key: keeloq-dpa
    title: 'On the power of power analysis in the real world: a complete break of the KeeLoq code hopping scheme'
    authors: 'T. Eisenbarth, T. Kasper, A. Moradi, C. Paar, M. Salmasizadeh, M. T. Manzuri Shalmani'
    venue: CRYPTO 2008
    year: 2008
    url: 'https://informatik.rub.de/wp-content/uploads/2022/01/crypto2008_keeloq.pdf'
    type: paper
tools:
  - rfcat
  - universal-radio-hacker
  - flipperzero-firmware
  - catnip
  - yard-stick-one
  - hackrf-one
bsam: []
resources:
  - RFSAM-RES-15
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

Going active on a sub-GHz device means transmitting on its frequency to take over its function, and the single fact that decides the attack — established at the IG step — is the **code type**: fixed vs. rolling [rollingcode].

A **fixed-code** device (a PT2262/EV1527/HT12-class OOK encoder, or a sensor) sends the same payload in the clear on every press, so there is no confidentiality to break and no counter to advance — a verbatim replay of any captured burst makes the receiver act on it [rollingcode]. Universal Radio Hacker re-transmits exactly what it captured (and can edit the bits, fix a checksum, or fuzz a field before sending) [urh]. Where the keyspace is small (8–12 DIP-switch bits) you need not even capture first: **OpenSesame** transmits a De Bruijn sequence that packs every possible code into a minimal overlapping bitstream — because a shift-register receiver also tests every shorter substring as the bits stream past — cutting a 12-bit brute force from minutes to about 8 seconds against fixed-code garages and gates [opensesame][opensesame-repo].

A **rolling-code** device (KeeLoq / HCS301 and similar) sends a fresh value each press from a counter, so a naive replay of an old code is rejected [rollingcode]. This is replay *resistance*, not an encrypted channel you decrypt from a capture — and it is defeated without breaking the cipher. **RollJam** jams the receiver while recording the victim's first press (so the device never acts on it and the code stays unused), lets the user press again and captures that too, forwards the first code to operate the device now, and keeps the second, still-valid code to operate it later [rolljam-sdr][rolljam-rtlsdr]. **RollBack** removes the jamming entirely: replaying a short run of previously captured consecutive codes triggers a resynchronisation in many receivers, rolling the counter back to a prior state so already-used codes become valid again — captured once, reusable indefinitely [rollback]. The RollBack research reports roughly 70% of tested Asian-market RKE systems vulnerable, and NVD records it against certain Honda (through 2018, five consecutive signals) [cve-2022-37305] and certain Nissan, Kia and Hyundai (through 2017, two consecutive signals) [cve-2022-37418]; the authors additionally tested Mazda among the vulnerable makes and found Toyota not susceptible.

To truly *forge* the next valid rolling code offline you would need the manufacturer key programmed into the chip, which a passive RF capture never yields; recovering it requires physical side-channel access (differential power analysis), which is out of scope for this RF toolchain [keeloq-dpa].

RollJam is Samy Kamkar's DEF CON 23 (2015) work; it is cited here via a peer-reviewed SDR re-implementation [rolljam-sdr] and a contemporaneous technical report [rolljam-rtlsdr], both of which independently describe the jam-record-replay primitive. The RollBack CVE ids above are the NVD-confirmed entries (an earlier web result that mapped RollBack to CVE-2022-37428 was wrong — that entry is an unrelated PowerDNS Recursor denial-of-service). Per-vehicle/per-device susceptibility figures are representative — check current advisories.

## Procedure

> Authorised testing only. Transmit solely on equipment you own or are explicitly authorised to test, in an RF-shielded or controlled environment. Even unlicensed ISM bands carry power and duty-cycle limits — do not jam or transmit on live third-party devices.

1. **Confirm the layer-1 settings and code type** carried over from capture (RFSAM-RES-15): exact carrier (315 / 433.92 / 868 / 915 MHz), OOK/ASK vs (G)FSK, baud, and fixed vs rolling. With a YARD Stick One:
   ```python
   rfcat
   >>> d.setFreq(433920000)
   >>> d.setMdmModulation(MOD_ASK_OOK)
   >>> d.setMdmDRate(2400)          # baud recovered at the capture step
   >>> d.lowball()
   >>> print(d.RFrecv()[0].encode('hex'))
   ```
   You should see the same burst bytes each press for a fixed code, and a value that changes each press for a rolling code. The changing value is the go/no-go for steps 3–4.

2. **Fixed code — verbatim replay.** Re-send the captured burst and watch the device act. From URH's GUI use the *Generator → Send* tab on the recorded signal; from rfcat:
   ```python
   >>> d.setModeTX()
   >>> d.RFxmit("7eXXXX...".decode('hex'))   # the exact captured payload
   ```
   Expected: the gate opens / the receiver registers the command. A Flipper Zero replays a saved fixed-code signal standalone (it refuses to save or replay rolling codes by design).

3. **Fixed code, small keyspace — De Bruijn brute force.** Where capture is impractical and the code is short, run OpenSesame's De Bruijn approach on a CC1111/CC1101 radio:
   ```bash
   # build/flash per samyk/opensesame; transmits every 8–12-bit code as one
   # overlapping sequence on the target ISM frequency
   ```
   Expected: the receiver opens within seconds rather than exhausting every code one by one [opensesame]. Authorised targets only.

4. **Rolling code — jam-and-capture (RollJam).** With one radio jamming the receiver's channel and a second recording the fob:
   - Jam the receiver and capture the victim's **first** press (the device does not act).
   - Keep jamming, let the user press again, capture the **second** code.
   - Stop jamming and transmit the **first** captured code — the receiver, never having advanced its counter, accepts it and operates.
   - The **second** code remains unused and valid for a later replay [rolljam-sdr][rolljam-rtlsdr].
   Expected: the device operates on your replay of the first code, and the held second code still operates it afterwards.

5. **Rolling code — resynchronisation (RollBack).** Capture a run of consecutive presses, then replay them in order and observe whether the receiver rolls its counter back so already-used codes work again [rollback]. Record how many consecutive codes the target needs (the paper reports model-dependent counts).

6. **Record the finding and impact.** State the code type, which technique succeeded, what the receiver did (operated / rejected / resynchronised), and the security consequence (door/gate access, alarm sensor spoof, telemetry forgery).

## Field case

Illustrative walkthrough — substitute the values you capture. Against a fixed-code 433.92 MHz gate remote using an EV1527-class OOK encoder, a single press captured in URH would demodulate to a short, stable payload (an EV1527 frame is on the order of ~24 bits) that is byte-for-byte identical on every subsequent press — the fixed-code signature. Re-transmitting the recorded burst through a YARD Stick One at the recovered baud should operate the gate, confirming verbatim replay.

Switching to a KeeLoq rolling-code fob on the same bench, two consecutive presses demodulate to two *different* payloads, and a naive replay of the older one is rejected — exactly the replay resistance a rolling code provides. The jam-and-capture path is then exercised in a shielded enclosure to validate the RollJam primitive on owned equipment.

Record the concrete per-device numbers from an authorised test in place of the illustration above:
> [FILL: target make/model, exact frequency and baud, captured payload, technique that succeeded, and receiver behaviour].

## Remediation

**Developer (device / chip).** Do not ship fixed-code or short-keyspace OOK remotes for anything security-relevant — they are replayable and brute-forceable [rollingcode][opensesame]. Use authenticated, rolling-code or challenge-response schemes, and harden the counter resynchronisation logic so a short run of consecutive replayed codes cannot roll the window back to a used state — the RollBack class lives precisely in over-permissive resync windows [rollback]. Treat the manufacturer key as a side-channel target and apply DPA countermeasures to the key-handling silicon [keeloq-dpa].

**Integrator (system / installer).** Prefer frequency-agile or spread-spectrum links over single-frequency OOK so a jammer cannot trivially hold the receiver's channel for the jam-and-capture window [rolljam-sdr]. For safety-critical sensors, use supervised links that alarm on loss of periodic check-in and on detected jamming, so a withheld or suppressed code is itself an alert. Bind the actuation to a second factor where the consequence warrants it (a gate that also requires a presence beacon, an alarm that cross-checks a wired zone).

**Operator (deployment / user).** Treat any one-way fixed-code remote or unauthenticated ISM sensor as forgeable, and any rolling-code fob as defeatable by jam-and-capture or resynchronisation; scope it out of trust for high-value access [rolljam-rtlsdr][rollback]. If a key press appears to fail once and works on the second try, consider jam-and-capture and rotate/re-pair where the device supports it. Conduct all replay/jam testing only on owned or explicitly authorised equipment in a controlled RF environment.
