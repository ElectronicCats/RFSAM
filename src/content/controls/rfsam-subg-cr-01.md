---
id: RFSAM-SUBG-CR-01
title: Assess rolling-code interception, replay and key recovery
protocol: SUBG
layer: CR
criticality: high
applicability:
  - rolling-code RKE
  - KeeLoq / HCS200/300/301
  - HITAG2 RKE
  - garage / gate / vehicle remotes
deferred: false
objective: >-
  Determine whether a rolling-code sub-GHz remote can be defeated by an attacker
  who captures its transmissions, through jam-and-bank replay (RollJam),
  time-agnostic resynchronisation replay (RollBack), or recovery of the device or
  manufacturer key from a small number of captured codes (KeeLoq / HITAG2).
intro: >-
  A rolling code rejects a naive replay of an old code, but that is replay
  resistance, not an encrypted channel you decrypt from a capture. This control
  assesses the three ways the protection is actually broken: banking a still-valid
  code while jamming the receiver, resynchronising the counter with an ordered
  replay, and cryptanalysis that recovers the key from a handful of captured codes.
prerequisites:
  hardware:
    - 'A transmit-capable sub-GHz transceiver at the target band: YARD Stick One (CC1111), HackRF One, or a CC1101-class board (Flipper Zero / CatSniffer)'
    - 'For jam-and-capture (RollJam): a second radio to jam while a first captures, e.g. two CC1101 modules, or an SDR plus a YARD Stick One'
  software:
    - 'rfcat (YARD Stick One), Universal Radio Hacker (capture/replay), rtl_433 (identify known classes); a KeeLoq/HITAG2 decoder for cipher identification'
  signal:
    freq: '315 MHz (NA/Asia remotes) · 433.92 MHz (global workhorse) · 868 MHz (EU) · 915 MHz (US ISM, 902 to 928)'
    bandwidth: 'Narrowband burst, a few hundred to a few thousand baud'
    modulation: 'OOK/ASK or (G)FSK; bits as PWM / Manchester / PPM in short repeated bursts'
  skill: advanced
attacks:
  - name: RollJam
    refs:
      - kamkar2015rolljam
    impact: >-
      An attacker banks a still-valid, never-used code that operates the lock at
      any later time, despite the rolling-code counter.
    preconditions: >-
      Ability to jam the receiver's band while simultaneously capturing the fob,
      and physical proximity during two of the owner's presses.
    summary: >-
      Jams the receiver while capturing the fob's first code (the receiver never
      acts on it, so the code stays unused), replays an earlier captured code to
      satisfy the user, and banks the fresh code for later, a captured-but-unused
      valid code, not a broken cipher.
  - name: RollBack
    refs:
      - csikor2022rollback
    impact: >-
      Previously-captured codes become usable again with no jamming, repeatable at
      any future time from a single capture session.
    preconditions: >-
      The receiver accepts a short ordered sequence of previously-valid codes as a
      counter resynchronisation; the attacker captured that many consecutive codes
      once.
    summary: >-
      Time-agnostic replay: re-transmitting a few previously-captured codes in a
      specific order pushes the receiver's counter back into an accepting state,
      so old captures work again without jamming.
  - name: KeeLoq manufacturer-key / device-key recovery
    refs:
      - eisenbarth2008keeloq
      - indesteege2008keeloq
    impact: >-
      Recovery of the device key (and, via side-channel, the shared manufacturer
      key) allows forging the next valid code and fully cloning the remote.
    preconditions: >-
      For the cryptanalytic attack, a number of known plaintext codes and offline
      compute; for the practical clone, the manufacturer key (recovered by side
      channel from a receiver) plus eavesdropping at most two over-the-air codes.
    summary: >-
      KeeLoq code-hopping is cryptographically broken: slide/meet-in-the-middle
      cryptanalysis and differential power analysis recover the keys, after which
      the next code can be forged and the fob cloned from a distance.
  - name: HITAG2 RKE key recovery
    refs:
      - benadjila2017hitag2
    impact: >-
      Recovery of the HITAG2 RKE key permits unlocking the vehicle and forging
      valid codes.
    preconditions: >-
      Capture of a small number (reported four to eight) of RKE radio packets from
      the fob; implementations with specific countermeasures resist this.
    summary: >-
      The HITAG2 stream cipher used in some vehicle RKE systems is broken: a few
      captured radio packets recover the key, though not all implementations are
      vulnerable.
references:
  - key: kamkar2015rolljam
    title: 'Drive It Like You Hacked It: New Attacks and Tools to Wirelessly Steal Cars (RollJam)'
    authors: S. Kamkar
    venue: DEF CON 23
    year: 2015
    url: 'https://samy.pl/defcon2015/'
    type: talk
  - key: csikor2022rollback
    title: 'RollBack: A New Time-Agnostic Replay Attack Against the Automotive Remote Keyless Entry Systems'
    authors: 'L. Csikor, H. W. Lim, J. W. Wong, S. Ramesh, R. P. Parameswarath, M. C. Chan'
    venue: 'Black Hat USA 2022 / ACM Transactions on Cyber-Physical Systems'
    year: 2022
    url: 'https://arxiv.org/abs/2210.11923'
    type: paper
  - key: eisenbarth2008keeloq
    title: 'On the Power of Power Analysis in the Real World: A Complete Break of the KeeLoq Code Hopping Scheme'
    authors: 'T. Eisenbarth, T. Kasper, A. Moradi, C. Paar, M. Salmasizadeh, M. T. M. Shalmani'
    venue: CRYPTO 2008 (LNCS 5157)
    year: 2008
    url: 'https://informatik.rub.de/wp-content/uploads/2022/01/crypto2008_keeloq.pdf'
    type: paper
  - key: indesteege2008keeloq
    title: 'A Practical Attack on KeeLoq'
    authors: 'S. Indesteege, N. Keller, O. Dunkelman, E. Biham, B. Preneel'
    venue: EUROCRYPT 2008 (KU Leuven COSIC project page)
    year: 2008
    url: 'https://www.cosic.esat.kuleuven.be/keeloq/'
    type: paper
  - key: benadjila2017hitag2
    title: 'One Car, Two Frames: Attacks on Hitag-2 Remote Keyless Entry Systems Revisited'
    authors: 'R. Benadjila, M. Renard, J. Lopes-Esteves, C. Kasmi'
    venue: USENIX WOOT 2017
    year: 2017
    url: 'https://www.usenix.org/conference/woot17/workshop-program/presentation/benadjila'
    type: paper
  - key: rtl433tests_hcs200
    title: 'rtl_433 test signals: Microchip HCS200 KeeLoq remote captures (tests/Microchip/HCS200/01)'
    authors: merbanan and contributors
    venue: merbanan/rtl_433_tests
    year: 2020
    url: 'https://github.com/merbanan/rtl_433_tests/tree/master/tests/Microchip/HCS200/01'
    type: tool
tools:
  - rfcat
  - yard-stick-one
  - universal-radio-hacker
  - hackrf-one
  - rtl-433
bsam: []
resources:
  - RFSAM-RES-15
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

A rolling-code remote sends a fresh value on every press: a synchronisation counter is incremented and the message is transformed (encrypted, in the KeeLoq case) so that the receiver, which tracks the expected counter within a window, rejects any code it has already seen. This defeats a naive capture-and-replay, the captured code is stale by the time it is re-sent. It does **not** provide confidentiality you can decrypt from a passive capture, and the fixed serial number in the frame is still sent in the clear (RFSAM-RES-15). Three documented attack families break the protection without any general offline "cracker".

**Jam-and-bank (RollJam).** The receiver only consumes a code it actually hears. RollJam jams the receiver's band while capturing the owner's press, so that code is never consumed and stays valid; when the owner presses again, the attacker captures the second code, replays the *first* (now-valid) one to operate the device so the owner notices nothing, and banks the second for later use [kamkar2015rolljam]. The bypass is a captured-but-unused valid code, not a cipher break. Samy Kamkar demonstrated this at DEF CON 23 against remotes from multiple car and garage-door makers using roughly $32 of hardware (a microcontroller and two CC1101 433 MHz transceivers) [kamkar2015rolljam].

**Time-agnostic resync replay (RollBack).** Many RKE receivers accept a short *ordered sequence* of previously-valid codes as a counter-resynchronisation gesture. RollBack shows that re-transmitting a few previously-captured codes consecutively pushes the receiver's counter back into a state where old captures are accepted again, with no jamming, from a single capture session, repeatable at any future time [csikor2022rollback]. The authors report that the number of codes that triggers the resync varies (a sequence on the order of a few) and that a substantial fraction of tested vehicles were affected [csikor2022rollback].

**Key recovery / cloning (KeeLoq, HITAG2).** Where the rolling code is built on a broken cipher, the keys can be recovered. KeeLoq code-hopping (HCS200/300/301) has been cryptanalysed: a slide / meet-in-the-middle attack recovers the device key from a set of known plaintext codes [indesteege2008keeloq], and a differential-power-analysis attack against a receiver recovers the shared *manufacturer* key, after which a remote can be cloned by eavesdropping at most two over-the-air codes [eisenbarth2008keeloq]. HITAG2, used in some vehicle RKE systems, is likewise broken: a few captured RKE radio packets (reported four to eight) recover the key, though implementations with specific countermeasures resisted the attack [benadjila2017hitag2]. This control assesses which of these apply to the target.

> [!NOTE] The RollBack paper reports its affected fraction as "~70% of [tested Asian vehicle manufacturers]" and is explicit that its survey is ongoing and Asian-market only [csikor2022rollback]; no specific vendor or make/model is asserted as vulnerable here. HITAG2's other well-known break ("Gone in 360 Seconds", USENIX Security 2012) targets the *immobilizer* transponder on the LF ~125 kHz side, which is **out of scope** for this sub-GHz control. The citation used here [benadjila2017hitag2] is the RKE variant on the UHF/sub-GHz radio path (the paper itself locates RKE at "UHF, 433 MHz or 868 MHz"); apply it only once the target fob's HITAG2 use is confirmed on the RKE radio path, not the immobilizer.

## Procedure

All transmit, jam and replay steps are active radio attacks. Perform them **only against equipment you own or are explicitly authorised to test**, inside RF shielding where possible, and observe the power and duty-cycle limits of the ISM band.

1. **Identify the band, modulation and code type first (IG/SP).** Confirm the carrier and whether the frame is rolling rather than fixed before any crypto work. A quick `rtl_433` scan names known classes and confirms the frequency:
   ```bash
   rtl_433 -f 433.92M -F json
   ```
   Press the fob several times. If consecutive presses decode to a *changing* payload (after a fixed serial/ID prefix), it is a rolling code; an identical payload every press is fixed-code and out of scope for this control.

2. **Capture two consecutive presses and confirm the counter advances.** Record raw bursts in Universal Radio Hacker (or via rfcat), align them, and diff:
   ```bash
   # YARD Stick One, rfcat shell, receive bursts at the recovered settings
   rfcat -r
   # in the shell:
   d.setFreq(433920000); d.setMdmModulation(MOD_ASK_OOK); d.setMdmDRate(2400)
   print(d.RFrecv())
   ```
   Two presses should differ in the rolling field while the serial prefix stays constant, this confirms a genuine rolling code and locates the counter bytes.

3. **Identify the cipher.** From the teardown / FCC ID (IG step) determine the encoder: a KeeLoq HCS200/300/301 (code-hopping), a HITAG2 RKE controller, or a vendor scheme. The chip decides whether key recovery [eisenbarth2008keeloq, indesteege2008keeloq, benadjila2017hitag2] is even applicable, versus replay-only.

4. **Test jam-and-bank (RollJam) feasibility.** With one radio jamming the receiver band and a second capturing the fob, verify the receiver does not act on the jammed first press, that the second press is captured, and that the banked code later operates the device:
   ```bash
   # transmit a continuous carrier as a jammer on a second radio (authorised target only)
   # YARD Stick One #2:
   d.setFreq(433920000); d.setModeTX(); d.RFxmit("\x00" * 4096)
   ```
   Success = the owner's press is denied while jamming, and a banked code opens the device later. Record whether the receiver implements jamming detection.

5. **Test sequential resync replay (RollBack).** From a clean capture of several consecutive presses, replay them in order and check whether the receiver resynchronises to accept an old code:
   ```bash
   # replay captured bursts in sequence with rfcat (authorised target only)
   d.setFreq(433920000); d.setModeTX()
   for burst in captured_sequence:
       d.RFxmit(burst)
   ```
   Success = an earlier captured code, replayed after the sequence, is accepted [csikor2022rollback]. Note how many codes were needed to trigger the resync.

6. **Assess key-recovery feasibility.** For KeeLoq, capture the known-plaintext codes the cryptanalysis needs and document whether offline key recovery is in scope [indesteege2008keeloq]; the practical clone additionally needs the manufacturer key, recovered by side channel from a receiver, then at most two eavesdropped codes [eisenbarth2008keeloq]. For HITAG2 RKE, capture the reported four-to-eight packets and check the implementation against the known countermeasures [benadjila2017hitag2].

7. **Record defences.** Note any jamming detection, tight/non-resettable counter windows, time-bounded acceptance, bidirectional challenge-response, or migration off KeeLoq/HITAG2, each closes one or more of the families above.

## Field case

> [!NOTE] The identify-and-confirm steps below (procedure steps 1 to 3) are grounded in a documented public capture corpus, not a first-party measured attack. The RollJam / RollBack / key-recovery sub-steps remain a representative checklist, they must be run against your own authorised target.

As a public reference for the identify-and-confirm steps, the rtl_433 test corpus ships Microchip KeeLoq **HCS200** captures at **433.92 MHz, OOK/PWM**, sampled at 250 ksps, with a documented rtl_433 decode (merbanan/rtl_433_tests, `tests/Microchip/HCS200/01`) [rtl433tests_hcs200]. The README decoder records the symbol timing as short pulse ~370 µs, long pulse ~772 µs, gap ~4000 µs and inter-frame repeat ~14000 µs, behind a 12-pulse preamble (`0xfff`) [rtl433tests_hcs200], the OOK/PWM equivalent of the **measured baud** the procedure asks for.

Across three consecutive button-1 presses (`g001`/`g002`/`g003`), the decoded frame carries a constant **serial id `00D0921`** (`button: 1`) while the 32-bit `encrypted` (rolling) field changes every press, `528F2DB8` → `3CA7B9F4` → `D087C973` [rtl433tests_hcs200]. The fixed serial alongside a changing hopping field is exactly the rolling-code signature procedure steps 1 to 2 look for. rtl_433's own model string identifies the **encoder as a Microchip KeeLoq HCS200** and therefore the **cipher as KeeLoq** (step 3); the companion `tests/keeloq/01` capture corroborates the pattern, with a constant static tail (`…b3 52 e8`), a changing leading 32-bit rolling field, and the button byte varying (`02` vs `04`) between presses [rtl433tests_hcs200].

The active-attack sub-steps below are a representative checklist against your own authorised remote, they are **not** demonstrated by the public corpus, which is a passive decode only:

- **RollJam:** with a second YARD Stick One jamming the receiver while the first captures, the owner's press is denied and a banked code later opens the gate: `[FILL: observed yes/no, banked-code latency]`. Jamming detection present: `[FILL: yes/no]`.
- **RollBack:** replaying `[FILL: N]` consecutive captured codes in order, then an earlier code: accepted = `[FILL: yes/no]`, resync depth = `[FILL: N]`.
- **Key recovery:** cipher confirmed **KeeLoq** (HCS200) from the rtl_433 decode [rtl433tests_hcs200]; in-scope for this RF capture = `[FILL: yes/no]` (KeeLoq manufacturer-key recovery needs side-channel access to a receiver, beyond a passive RF capture [eisenbarth2008keeloq]).

The auditor's verdict is the trio: jam-and-bank feasible, resync depth, and whether the cipher is a broken one with practical key recovery in reach.

## Remediation

**Developer (silicon / firmware).** Do not build new designs on KeeLoq code-hopping or HITAG2 for RKE, both are cryptographically broken [eisenbarth2008keeloq, indesteege2008keeloq, benadjila2017hitag2]. Use an authenticated, ideally **bidirectional challenge-response** scheme with a modern cipher and per-device keys, so a one-way captured code cannot be banked or resynced. Constrain the counter resynchronisation logic: require a tight, monotonic, non-resettable window and reject the ordered-replay resync gesture that RollBack abuses [csikor2022rollback].

**Integrator (product).** Implement jamming detection on the receiver so a RollJam-style denied press is observable rather than silent [kamkar2015rolljam]. Add time-bounding to code acceptance so a code captured long ago cannot be presented later, defeating the time-agnostic RollBack replay [csikor2022rollback]. Protect receivers against side-channel manufacturer-key extraction (the step that turns KeeLoq from a per-device problem into a fleet-wide one) [eisenbarth2008keeloq].

**Operator (deployment).** Treat any rolling-code remote on a broken cipher as replay- and clone-exposed: for high-value access (vehicles, gates, alarms) layer a second factor or a separate authenticated channel rather than relying on the fob alone, and prefer products that document a modern authenticated RKE scheme over legacy KeeLoq/HITAG2 fobs. Frame any specific product/CVE corpus as representative and check current advisories, these schemes and their countermeasures date quickly.
