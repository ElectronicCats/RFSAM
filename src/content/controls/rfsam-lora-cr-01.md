---
id: RFSAM-LORA-CR-01
title: Assess LoRaWAN join and session-key management
protocol: LORA
layer: CR
criticality: high
applicability:
  - LoRaWAN
deferred: false
objective: >-
  Determine whether a LoRaWAN deployment's join procedure and key management are
  sound — that the root AppKey is a per-device random value (not default, shared
  or guessable), that DevNonce is fresh per join, and that session keys are not
  static and reused — by analysing captured join and data frames against the
  network's stated LoRaWAN version and activation mode.
intro: >-
  LoRaWAN's entire confidentiality and integrity model hangs off the root key:
  the AppKey (1.0.x) or NwkKey+AppKey (1.1) from which every session key is
  derived. There is no feasible brute force of a strong random AES-128 key — the
  exposure is in how keys and nonces are managed. This control checks the join
  and session-key chain for default/shared keys, DevNonce reuse, and static ABP
  session keys, the recurring real-world failures that collapse the crypto.
prerequisites:
  hardware:
    - 'An SDR covering the regional sub-GHz band (RTL-SDR V4 for one channel, or HackRF One / USRP B210 / bladeRF 2.0 micro for wider capture), or a multi-channel LoRaWAN gateway (RAK WisGate Connect) if you have gateway access'
    - 'A host to run the offline key/MIC analysis (no transmit hardware needed — this control is analysis over an existing capture)'
  software:
    - 'A CSS demodulator that frames LoRaWAN and exports LoRaTap PCAP (gr-lora_sdr, LoRAttack) plus Wireshark, then an offline LoRaWAN crypto toolkit: Loracrack (weak/shared AppKey → session-key derivation) and/or LAF (MIC recompute/validate, key-candidate testing)'
  signal:
    freq: '863–870 MHz (EU868) / 902–928 MHz (US915) / regional: AS923, EU433, AU915, CN470, IN865, KR920'
    bandwidth: '125 / 250 / 500 kHz per LoRaWAN channel'
    modulation: 'CSS (Chirp Spread Spectrum), SF7–SF12'
  skill: advanced
attacks:
  - name: Default / shared / hardcoded AppKey recovery
    refs:
      - ioactive2020lorawan
      - laf
    impact: >-
      Recovering or guessing the root AppKey lets an attacker derive both session
      keys (NwkSKey, AppSKey) for every session, decrypt all application traffic,
      and forge frames with valid MICs — a full break of the device's crypto.
    preconditions: >-
      The device uses a default, shared, vendor-wide or otherwise guessable
      AppKey, or one extractable from firmware / public source; plus a captured
      OTAA join (and following data frames). The strong-random-key case is not
      brute-forceable.
    summary: >-
      LoRaWAN's confidentiality and integrity derive entirely from the root key;
      IOActive documented hardcoded, default and weak AppKeys in real deployments
      and firmware, and the LAF toolkit tests AppKey candidates against captured
      frames via the MIC.
  - name: DevNonce reuse / random-nonce join replay (1.0.x)
    refs:
      - hessel2022survey
      - loraalliance2020joinsync
      - na2017replay
    impact: >-
      A repeated DevNonce on a 1.0.x device enables replay of captured
      JoinRequests, forcing rejoin/desynchronisation or denial of service, and
      indicates a join-security model that does not reject stale nonces.
    preconditions: >-
      A LoRaWAN 1.0.0–1.0.3 device whose DevNonce is a random value (birthday
      collision over device lifetime) or reused after reboot/poor RNG; the join
      is cleartext, so the DevNonce sequence is observable passively.
    summary: >-
      In 1.0.x DevNonce is a random value the network must remember-and-reject;
      reuse (collision, reboot, weak RNG) allows JoinRequest replay. 1.0.4/1.1
      close this by making DevNonce a monotonic counter that is never reused.
  - name: Static ABP session keys / frame-counter reset
    refs:
      - hessel2022survey
      - tarlogic2020lorawan
    impact: >-
      ABP devices carry static NwkSKey/AppSKey that never rotate; a frame-counter
      reset on reboot repeats the keystream (two-time pad on the AES-CTR-style
      payload) and re-opens replay, both reachable without ever recovering the key.
    preconditions: >-
      An ABP-activated device (static session keys + DevAddr burned in) whose
      frame counter resets on power-cycle, captured passively.
    summary: >-
      ABP trades key rotation for simplicity: static session keys plus a
      resettable frame counter give keystream reuse and replay — the
      session-key-management failure OTAA is designed to avoid.
references:
  - key: hessel2022survey
    title: 'LoRaWAN Security: An Evolvable Survey on Vulnerabilities, Attacks and their Systematic Mitigation'
    authors: 'F. Hessel, L. Almon, M. Hollick'
    venue: 'ACM Transactions on Sensor Networks, Vol. 18, Issue 4'
    year: 2022
    url: 'https://doi.org/10.1145/3561973'
    type: paper
  - key: ioactive2020lorawan
    title: 'LoRaWAN Networks Susceptible to Hacking: Common Cyber Security Problems, How to Detect and Prevent Them'
    authors: 'C. Cerrudo, E. Martinez Fayo, M. Sequeira (IOActive)'
    venue: IOActive
    year: 2020
    url: 'https://www.ioactive.com/lorawan-networks-susceptible-to-hacking/'
    type: blog
  - key: na2017replay
    title: Scenario and countermeasure for replay attack using join request messages in LoRaWAN
    authors: 'S. H. Na, D. Hwang, W. Shin, K.-H. Kim'
    venue: 'IEEE ICOIN 2017, pp. 718–720'
    year: 2017
    url: 'https://ieeexplore.ieee.org/document/7899580/'
    type: paper
  - key: tarlogic2020lorawan
    title: 'LoRaWAN 1.0, vulnerabilities and backward compatibility in version 1.1'
    authors: G. J. Carracedo Carballal
    venue: Tarlogic Security
    year: 2020
    url: 'https://www.tarlogic.com/blog/lorawan-vulnerabilities-versions/'
    type: blog
  - key: loraalliance2020joinsync
    title: 'LoRaWAN 1.0.x Join-Synch Issues — Remedies (v1.0.0)'
    authors: LoRa Alliance Technical Committee
    venue: LoRa Alliance
    year: 2020
    url: 'https://lora-alliance.org/wp-content/uploads/2020/11/lorawan-1.0.x-join-synch-issues-remedies-v1.0.0.pdf'
    type: standard
  - key: loraalliance2020l2
    title: 'LoRaWAN L2 1.0.4 Specification (TS001-1.0.4)'
    authors: LoRa Alliance
    venue: LoRa Alliance
    year: 2020
    url: 'https://lora-alliance.org/wp-content/uploads/2021/11/LoRaWAN-Link-Layer-Specification-v1.0.4.pdf'
    type: standard
  - key: loracrack
    title: 'Loracrack — LoRaWAN session cracker (PoC for weak/shared Application Keys)'
    authors: 'S. Mellema (Applied Risk)'
    venue: GitHub
    year: 2022
    url: 'https://github.com/applied-risk/Loracrack'
    type: tool
  - key: laf
    title: 'LAF — LoRaWAN Auditing Framework'
    authors: IOActive
    venue: GitHub
    url: 'https://github.com/IOActive/laf'
    type: tool
tools:
  - loracrack
  - laf
  - wireshark
bsam: []
resources:
  - RFSAM-RES-07
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

LoRaWAN's confidentiality and integrity derive entirely from a root key, so this layer is about key and nonce *management*, not cipher strength. In 1.0.x the device and back end share an AppKey; in 1.1 the root is split into NwkKey and AppKey. From the root, the two session keys are derived: the `AppSKey` encrypts the `FRMPayload` (AES-128), and the `NwkSKey` keys the 4-byte MIC (AES-128-CMAC) [loraalliance2020l2][hessel2022survey]. There is no feasible brute force of a strong random AES-128 root key; the real-world exposure is that the key is often not strong, not unique, or not secret, and that the join nonce and session keys are mismanaged [hessel2022survey].

**Default / shared / hardcoded AppKey.** IOActive's audit of real LoRaWAN deployments found root keys that were hardcoded in firmware, shared fleet-wide, set to vendor defaults, or otherwise easy to source from public repositories or weak enough to guess [ioactive2020lorawan]. Because every session key descends from that root, recovering it once decrypts all traffic for the device's lifetime and lets an attacker forge frames with valid MICs — a complete crypto break [ioactive2020lorawan][hessel2022survey]. This is exactly what a candidate-key test demonstrates: given a guessed/leaked AppKey and a captured join, derive the session keys and confirm by recomputing the captured MIC [loracrack][laf]. It is *not* a brute force of a strong key [loracrack].

**DevNonce reuse / join replay (1.0.x).** The OTAA `JoinRequest` carries `JoinEUI`/`AppEUI`, `DevEUI` and a `DevNonce` in the clear, protected only by a MIC — the key is never transmitted, but the DevNonce sequence is fully observable passively [loraalliance2020l2]. In LoRaWAN 1.0.0–1.0.3 the DevNonce is a *random* value, and the network must remember and reject previously-seen values; a repeat lets a captured JoinRequest be replayed [na2017replay][loraalliance2020joinsync]. Reuse is not hypothetical: the random nonce is subject to the birthday paradox over a multi-year lifetime, and constrained devices reuse nonces after reboots, counter resets, or poor RNG seeding [hessel2022survey]. LoRaWAN 1.0.4 and 1.1 redefine DevNonce as a monotonic counter that SHALL never be reused for a given JoinEUI, closing this window — at the cost of the join-synchronisation problems the LoRa Alliance documents for mixed fleets [loraalliance2020joinsync][loraalliance2020l2].

**Static ABP session keys / frame-counter reset.** ABP (Activation By Personalisation) burns static `NwkSKey`/`AppSKey`/`DevAddr` into the device with no per-join rotation. If the frame counter resets on power-cycle, the AES-CTR-style payload encryption repeats keystream (a two-time pad recoverable by XOR) and stale frames become replayable — both reachable without ever recovering the key [hessel2022survey][tarlogic2020lorawan]. OTAA exists precisely to avoid this by deriving fresh session keys at each join.

The IOActive findings (default/hardcoded/weak AppKeys) are reported across audited deployments and firmware, not a single named CVE; treat them as a representative pattern and check the specific device/stack before asserting a given deployment is affected. Loracrack and LAF are PoC/audit tooling (Loracrack last pushed 2022-06, LAF 2023-05); re-confirm they build against your capture format and LoRaWAN version before relying on them.

## Procedure

> Authorised testing only. Capturing and analysing another network's traffic, and
> testing any candidate key against it, requires explicit written permission and
> must be lawful in your jurisdiction. Do not transmit at this layer; this control
> is offline analysis over a capture you are authorised to hold. Test AppKey
> candidates only against your own / in-scope devices.

1. **Capture the join and following data frames** for the target device, per RFSAM-RES-07 and RFSAM-LORA-LL-01 — de-chirp the CSS waveform and export a LoRaTap PCAP that contains at least one OTAA `JoinRequest`/`JoinAccept` pair and subsequent uplinks for the same `DevAddr`. Confirm in Wireshark:
   ```text
   lorawan.mtype == 0     # Join Request: JoinEUI/AppEUI, DevEUI, DevNonce (cleartext)
   lorawan.mtype == 1     # Join Accept (encrypted)
   ```
   Expected: the join identifiers readable in the clear; the `FRMPayload` of data frames shown as AES-128 ciphertext.

2. **Establish the LoRaWAN version and activation mode** (from the IG step / device profile). The checks below differ for 1.0.x vs 1.0.4/1.1, and for OTAA vs ABP. Record which applies.

3. **Audit DevNonce freshness (OTAA, 1.0.x).** Group `JoinRequest`s by `DevEUI` and extract the `DevNonce` sequence. Export the join frames and tabulate:
   ```bash
   # tshark over the LoRaTap PCAP: one row per JoinRequest
   tshark -r joins.pcap -Y "lorawan.mtype == 0" \
     -T fields -e lorawan.dev_eui -e lorawan.dev_nonce | sort | uniq -c | sort -rn
   ```
   Expected: a count per `(DevEUI, DevNonce)`. Any count > 1 is a reused DevNonce → 1.0.x join-replay exposure [loraalliance2020joinsync]. A small or clustered nonce space (few distinct values, or values biased low) indicates weak RNG even without an exact repeat [hessel2022survey].

4. **Test for a weak / shared / default AppKey (OTAA).** Assemble candidate keys: vendor defaults, all-zero / sample keys from datasheets or SDKs, keys extracted from firmware, and any fleet-wide value you suspect is reused. Feed the captured join + a data frame and each candidate to the derivation-and-MIC check:
   ```bash
   # Loracrack: derive session keys from a candidate AppKey and validate via the MIC
   python loracrack.py --pcap capture.pcap --appkey <CANDIDATE_APPKEY>
   ```
   Expected: for the *correct* key, the tool derives `NwkSKey`/`AppSKey` and the recomputed MIC matches the captured frame's MIC — confirming the key and that the session is now decryptable [loracrack]. For a wrong key the MIC mismatches. Equivalently, use LAF to recompute and validate the MIC against a key candidate [laf]. A match is a finding: the root key is not secret.

   > A MIC match means you have recovered the session keys for that capture. Decrypt only traffic you are authorised to analyse; do not act on recovered keys beyond the agreed scope.

5. **Audit ABP session-key hygiene (ABP).** For ABP devices, confirm whether the frame counter (`FCnt`) ever resets — capture across a device reboot/power-cycle in your test rig and check for a counter that returns to a low value while the `DevAddr` and (static) keys are unchanged:
   ```text
   lorawan.dev_addr == <TARGET_DEVADDR>     # then read the FCnt column over time
   ```
   Expected: a healthy device's `FCnt` increases monotonically. A reset (a high value followed by a low one) under static keys is the keystream-reuse / replay finding [hessel2022survey][tarlogic2020lorawan].

6. **Record the result per device:** version + activation mode; DevNonce behaviour (fresh / reused / weak-RNG); AppKey result (strong-random vs a candidate that produced a MIC match); ABP `FCnt` reset (y/n). Each positive is a key-management failure that collapses some or all of the crypto chain.

## Field case

Reported measurement (carried over from the paired link-layer control). The same authorised US915 capture used to profile this network at the link layer (RFSAM-LORA-LL-01) — 51,304 LoRaWAN frames, of which 45,815 (89.3%) were JoinRequests — is the input for the CR-layer key analysis: because the capture was so heavily dominated by JoinRequests, each device's DevNonce sequence was directly observable in the clear, which is the prerequisite for spotting reuse [loraalliance2020joinsync]. The application payloads stayed AES-128 protected throughout — confidentiality held against the *capture*; the question this control asks is whether it holds against the *key management*. This frame/JoinRequest count is the author's reported field figure, reproduced verbatim from the paired RFSAM-LORA-LL-01 control; it has not been independently re-measured here.

Illustrative walkthrough — substitute the values you capture. To reproduce against your own authorised test network: stand up a couple of OTAA devices and one ABP device on a ChirpStack/RAK gateway, deliberately provision one OTAA device with a default/sample AppKey (so the key-candidate test in step 4 succeeds), and one 1.0.x device that re-joins on reboot (so step 3 shows a DevNonce repeat). Then run steps 3–5 and tabulate:

```text
# per-device key-management findings from an authorised test capture
DevEUI / DevAddr        version  activation  DevNonce        AppKey test       ABP FCnt reset
[FILL: id]              1.0.3    OTAA        [FILL: repeated?] [FILL: MIC match?] n/a
[FILL: id]              1.1      OTAA        monotonic        [FILL: no match]  n/a
[FILL: id]              1.0.3    ABP         n/a              n/a               [FILL: y/n]
```

The expected shape: the deliberately weak OTAA device yields a MIC match under the default key (its session keys are recoverable and traffic decryptable), the 1.0.x re-joining device shows a repeated DevNonce (join-replay exposure), and the ABP device's counter resets across reboot (keystream-reuse/replay exposure) — while a correctly provisioned 1.1 OTAA device passes all three. The `[FILL: …]` rows above are placeholders for the values you capture in your own authorised analysis — they are not measured findings.

## Remediation

**Developer (device / stack).** Provision a unique, cryptographically random AppKey (1.0.x) or NwkKey+AppKey (1.1) per device; never ship a default, sample, all-zero, fleet-wide or firmware-hardcoded root key, since recovering it once breaks every session for the device's life [ioactive2020lorawan][hessel2022survey]. Generate DevNonce correctly: on 1.0.4/1.1 use the mandated monotonic counter that is never reused for a JoinEUI and persists across reboots; on legacy 1.0.x with a random DevNonce, ensure adequate RNG entropy and persistence so nonces do not repeat after a reset [loraalliance2020l2][loraalliance2020joinsync]. Prefer OTAA over ABP so session keys are derived fresh at each join rather than burned in static.

**Integrator (network / join server).** Enforce strict server-side DevNonce tracking: remember and reject previously-seen DevNonce values (1.0.x) or enforce monotonicity (1.0.4/1.1), so a replayed JoinRequest is denied [na2017replay][loraalliance2020joinsync]. For ABP deployments, enforce frame-counter validation that survives device reboots — reject a counter that resets rather than accepting it — to neutralise the keystream-reuse and replay paths [hessel2022survey][tarlogic2020lorawan]. Where feasible, migrate to 1.1's split keys and Join Server, and ensure no 1.0.x elements remain in a network claimed to be 1.1, since backward compatibility reopens the older weaknesses [tarlogic2020lorawan].

**Operator (deployment).** Treat the root key as the crown jewel: rotate keys where the lifecycle allows, audit that every deployed device carries a unique key (not a shared batch value), and protect the network/join server credentials so the keys cannot be read from an exposed back end [ioactive2020lorawan]. Periodically run this passive join/session-key audit against your own network as a monitoring control — a recurring DevNonce, a successful default-key derivation, or a resetting ABP counter is a provisioning failure to fix, not merely an attacker's opportunity.
