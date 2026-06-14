---
id: RFSAM-BTC-AT-01
title: Test baseband/LMP resilience and availability
protocol: BTC
layer: AT
criticality: high
applicability:
  - Bluetooth Classic
deferred: false
objective: >-
  Determine how a Bluetooth Classic (BR/EDR) controller withstands malformed
  baseband/LMP traffic and wholesale 2.4 GHz RF denial — does it crash, deadlock,
  reboot, run attacker code, or merely degrade — and whether the link survives or
  silently downgrades under stress.
intro: >-
  Going active against Bluetooth Classic means transmitting in the 2.4 GHz ISM
  band and poking a live BR/EDR controller — authorised testing only, on devices
  you own or are contracted to assess. The accessible reference capability is
  BrakTooth: a baseband/LMP exploit suite that crashes, deadlocks, or on some
  chips runs code, firing from a $5 ESP32. A broadband jammer adds the
  availability test, and KNOB/BIAS are noted as the downgrade/impersonation
  follow-ons.
prerequisites:
  hardware:
    - 'An original ESP32 (BR/EDR-capable) dev board flashed with the BrakTooth firmware — the patched ESP-BT controller is the attack radio'
    - 'For the availability test: an ESP32 broadband 2.4 GHz jammer (two nRF24L01+PA+LNA modules), operated only inside an RF-shielded / Faraday environment'
  software:
    - 'BrakTooth host tooling (Wireshark dissectors + the Python/ESP32 PoC firmware) to select and fire the LMP/baseband variants and read the target''s response'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: advanced
attacks:
  - name: BrakTooth
    cve:
      - CVE-2021-28139
    refs:
      - garbelini2022braktooth
      - braktooth-site
      - braktooth-repo
      - cve-2021-28139
    impact: >-
      Crash, deadlock or reboot of the BR/EDR controller across dozens of SoCs;
      on at least one chip (ESP32, CVE-2021-28139) arbitrary code execution — all
      reachable before pairing or authentication.
    preconditions: >-
      RF range to a target in connectable/page-scan mode and its BD_ADDR (or an
      inquiry scan to find it); no pairing, link key, or prior authentication
      required.
    summary: >-
      A directed-fuzzing-derived suite of ~20 baseband/Link Manager Protocol
      attack variants (16 vulnerabilities, 20+ CVEs assigned at disclosure)
      against Bluetooth Classic controllers — the reference accessible BR/EDR
      attack framework, running on a commodity ESP32.
  - name: Broadband 2.4 GHz jamming (availability)
    refs:
      - btcore-spec
    impact: >-
      Wholesale denial of the 2.4 GHz ISM band — BR/EDR (all 79 channels), BLE
      and Wi-Fi at once — measuring how the piconet behaves under RF denial
      (drop, reconnect storm, silent fallback).
    preconditions: >-
      An RF-shielded test environment; jamming is illegal in most jurisdictions
      outside a licensed/controlled lab.
    summary: >-
      Floods the band with noise to test availability of the link rather than
      its protocol logic — the crude but informative DoS baseline against a
      frequency-hopping protocol that nominally tolerates interference.
  - name: KNOB (Key Negotiation of Bluetooth)
    cve:
      - CVE-2019-9506
    refs:
      - antonioli2019knob
      - cve-2019-9506
    impact: >-
      Forces the negotiated link encryption key down to as little as 1 byte of
      entropy, after which it is brute-forceable offline — enabling decryption
      and injection of valid ciphertext. A downgrade follow-on, not a baseband
      crash.
    preconditions: >-
      An active MITM position during encryption-key-size negotiation between two
      victims; the target must accept the low entropy the attacker requests.
    summary: >-
      A specification-level downgrade attack on the encryption key entropy
      negotiation of Bluetooth BR/EDR — noted here as the natural follow-on once
      the controller's resilience and key-size floor have been probed.
  - name: BIAS (Bluetooth Impersonation AttackS)
    cve:
      - CVE-2020-10135
    refs:
      - antonioli2020bias
      - cve-2020-10135
    impact: >-
      Impersonation of a previously-paired BR/EDR master or slave, completing
      authentication without the link key — combinable with KNOB to fully take
      over an encrypted session.
    preconditions: >-
      A prior pairing between the two victims and an adjacent attacker that can
      reach the target during connection establishment; exploits missing
      mutual authentication and permissive role switching.
    summary: >-
      A standard-compliant impersonation attack abusing BR/EDR's authentication
      procedure — the impersonation follow-on that pairs with KNOB; the
      link-and-above assessment of it is owned by BSAM.
references:
  - key: garbelini2022braktooth
    title: 'BrakTooth: Causing Havoc on Bluetooth Link Manager via Directed Fuzzing'
    authors: 'M. E. Garbelini, V. Bedi, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX Security 2022
    year: 2022
    url: 'https://www.usenix.org/conference/usenixsecurity22/presentation/garbelini'
    type: paper
  - key: braktooth-site
    title: 'BrakTooth — disclosure, affected-device list and CVE table'
    authors: ASSET Research Group, SUTD
    venue: braktooth.com
    year: 2021
    url: 'https://braktooth.com/'
    type: blog
  - key: braktooth-repo
    title: 'braktooth_esp32_bluetooth_classic_attacks — PoC firmware and host tooling'
    authors: M. E. Garbelini (Matheus-Garbelini)
    venue: GitHub
    year: 2021
    url: 'https://github.com/Matheus-Garbelini/braktooth_esp32_bluetooth_classic_attacks'
    type: tool
  - key: antonioli2019knob
    title: 'The KNOB is Broken: Exploiting Low Entropy in the Encryption Key Negotiation of Bluetooth BR/EDR'
    authors: 'D. Antonioli, N. O. Tippenhauer, K. B. Rasmussen'
    venue: USENIX Security 2019
    year: 2019
    url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/antonioli'
    type: paper
  - key: cve-2021-28139
    title: 'CVE-2021-28139: ESP32 BR/EDR arbitrary code execution via LMP Feature Response Extended (BrakTooth)'
    venue: NVD
    year: 2021
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-28139'
    type: cve
  - key: cve-2019-9506
    title: 'CVE-2019-9506: Bluetooth BR/EDR encryption key negotiation (KNOB)'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-9506'
    type: cve
  - key: antonioli2020bias
    title: 'BIAS: Bluetooth Impersonation AttackS'
    authors: 'D. Antonioli, N. O. Tippenhauer, K. Rasmussen'
    venue: IEEE Symposium on Security and Privacy (S&P) 2020
    year: 2020
    url: 'https://conferences.computer.org/sp/pdfs/sp/2020/349700a549.pdf'
    type: paper
  - key: cve-2020-10135
    title: 'CVE-2020-10135: Bluetooth BR/EDR authentication impersonation (BIAS)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-10135'
    type: cve
  - key: btcore-spec
    title: 'Bluetooth Core Specification'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2023
    url: 'https://www.bluetooth.com/specifications/specs/core-specification/'
    type: spec
tools:
  - braktooth
  - esp32-bluejammer
  - esp32-devkit
bsam:
  - BSAM-IG-02
  - BSAM-EN-03
resources:
  - RFSAM-RES-27
  - RFSAM-RES-28
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Bluetooth Classic (BR/EDR) is a different PHY/MAC from BLE: it hops across all 79 RF channels at ~1600 hops/s using GFSK (Basic Rate, 1 Mbps) and π/4-DQPSK / 8DPSK (EDR, 2–3 Mbps), and its low-level state machine is driven by the Link Manager Protocol (LMP) over the baseband. The attack surface this control exercises sits *below* pairing and authentication: a controller must parse paging, FHS, and LMP control PDUs from any device in range before it has decided whether to trust it. Malformed or out-of-sequence baseband/LMP traffic therefore reaches the controller firmware unauthenticated.

**BrakTooth** is the reference demonstration of this. Garbelini et al. applied directed fuzzing to the LMP/baseband state machine and found 16 vulnerabilities — 20+ attack variants, 20+ CVEs assigned at disclosure — that crash, deadlock, or reboot the BR/EDR controllers of dozens of SoCs from major vendors, and on at least one chip (the ESP32 itself, CVE-2021-28139) achieve arbitrary code execution (garbelini2022braktooth, braktooth-site). Crucially, every variant is reachable *before* pairing or authentication, and the whole suite runs from a $5 ESP32 acting as the attack radio (braktooth-repo). Treat the published CVE/affected-device table as representative of the LMP-parsing class, not a current patch matrix — vendor fix status varies and dates fast.

A **broadband 2.4 GHz jammer** tests a different property: availability rather than protocol logic. BR/EDR's adaptive frequency hopping is designed to tolerate narrowband interference, so wholesale noise across the band is the crude baseline for "does the link survive RF denial, and how does it fail" — drop, reconnect storm, or silent fallback to a weaker mode (btcore-spec).

Two specification-level follow-ons round out the active picture and are noted, not re-derived here: **KNOB** (CVE-2019-9506) downgrades the negotiated encryption key to as little as 1 byte of entropy so it can be brute-forced offline (antonioli2019knob, cve-2019-9506), and **BIAS** (CVE-2020-10135) impersonates a previously-paired peer by abusing BR/EDR's authentication procedure (antonioli2020bias, cve-2020-10135). The link-and-above assessment of those — pairing policy, encryption enforcement, key-size floor — is owned by BSAM (BSAM-IG-02 controller vulnerabilities, BSAM-EN-03 minimum encryption key size); RFSAM owns getting the active RF probe onto the controller in the first place.

CVE-2021-28139 is the ESP32 arbitrary-code-execution variant specifically: the Espressif ESP-IDF Bluetooth Classic stack mishandles an LMP Feature Response Extended packet, letting an attacker in radio range run code via a crafted Extended Features bitfield (cve-2021-28139). The other BrakTooth variants are predominantly DoS (crash/deadlock/reboot).

## Procedure

> Authorised testing only. Every step below transmits in the 2.4 GHz ISM band and can crash, hang, reboot, or (on vulnerable chips) execute code on a live controller. Run only against devices you own or are explicitly contracted to assess. The jamming step is illegal in most jurisdictions outside a licensed/RF-shielded environment — perform it inside a Faraday cage or shielded room only, never over the air.

1. Identify the target and confirm it speaks BR/EDR, and record its `BD_ADDR` (from an inquiry scan or prior IG/SP work — see `RFSAM-RES-26` for ESP32 inquiry scanning). You need the 48-bit address to direct the attack:
   ```bash
   # target address recorded during inquiry, e.g.
   TARGET=AA:BB:CC:DD:EE:FF
   ```

2. Flash the BrakTooth firmware to the original ESP32 and bring up the host tooling (full build/flash recipe and exploit list in `RFSAM-RES-27`):
   ```bash
   git clone https://github.com/Matheus-Garbelini/braktooth_esp32_bluetooth_classic_attacks
   cd braktooth_esp32_bluetooth_classic_attacks
   ./build.sh   # build host + flash ESP32 BR/EDR attack firmware
   ```

3. Enumerate the available attack variants so you can pick a non-destructive probe first, escalating deliberately:
   ```bash
   sudo ./bin/bt_exploiter --help
   # lists the LMP/baseband variants: feature-response flooding, duplicate
   # encryption requests, truncated LMP, invalid timing accuracy, etc.
   ```

4. Fire a single chosen variant at the target and watch the controller's response. Start with a benign-looking malformed-feature variant before any crash/RCE variant:
   ```bash
   sudo ./bin/bt_exploiter --bdaddr "$TARGET" --exploit "Feature_Response_Flooding"
   ```
   Read the result on the target, not the attacker: a vulnerable controller will hang, drop its audio/HID link, reboot, or stop answering `l2ping`/inquiry. Confirm the failure mode out-of-band:
   ```bash
   l2ping -c 5 "$TARGET"   # from a separate host: timeouts => link/controller down
   ```
   Record exactly which variant produced which behaviour (crash vs deadlock vs reboot vs RCE indicator) — that mapping is the finding.

5. Availability test (shielded environment only). With the target in a normal connected session inside the Faraday cage, enable the broadband jammer and observe how the link degrades and whether it recovers:
   ```bash
   # ESP32 broadband jammer: floods 2.4 GHz across BR/EDR, BLE and Wi-Fi
   # (two nRF24L01+PA+LNA modules) — shielded lab only.
   ```
   Note whether the piconet drops cleanly, enters a reconnect storm, or silently falls back to a weaker mode. Disable the jammer and confirm the link re-establishes.

6. Note the downgrade/impersonation follow-ons (KNOB / BIAS) and the encryption-key-entropy test path (`RFSAM-RES-28`) as the next steps where the controller survived the baseband probes but its pairing/encryption policy is in scope — assess those under BSAM-EN-03 / BSAM-IG-02 rather than re-deriving them here.

## Field case

[FILL: insert a real authorised engagement once available.] As an illustrative-only worked example (not a measured finding): a wireless point-of-sale handheld using an EDR controller was assessed in a shielded lab. From a single original ESP32 running BrakTooth, the `Feature_Response_Flooding` variant against the unit's `BD_ADDR` left it answering inquiry but unable to complete a new ACL connection — a soft deadlock requiring a power cycle to clear — while a separate `l2ping -c 5` from a laptop showed 5/5 timeouts, confirming the controller, not just the app, had stalled. No code-execution indicator was observed on this controller. Under the broadband jammer the active card-reader session dropped within ~[FILL: measured seconds] and re-paired automatically once jamming stopped, i.e. it failed available-but-recoverable rather than failing closed. Mark every concrete number here `[FILL: …]` until taken from a real capture — do not present the illustrative values as measured.

## Remediation

**Developer / silicon & stack vendor.** Harden the LMP/baseband parser against malformed and out-of-sequence PDUs reachable before authentication — this is the BrakTooth root cause (garbelini2022braktooth). Track the BrakTooth CVE table and ship controller firmware updates; treat the published list as representative and re-check current advisories rather than assuming a chip is clear (braktooth-site). Reject the encryption-key-entropy downgrade by enforcing a minimum key size (closes KNOB, antonioli2019knob) and require mutual authentication / restrict role switching during connection establishment (closes BIAS, antonioli2020bias).

**Integrator.** Select controllers with a current patch level against the BrakTooth class and confirm the vendor's fix status before shipping (BSAM-IG-02). Enforce a minimum negotiated encryption key size in the host configuration (BSAM-EN-03) so a downgraded link is refused rather than accepted.

**Operator.** Where the device permits, disable discoverability/connectability when not actively pairing to shrink the unauthenticated attack surface, and monitor for unexplained controller reboots or repeated reconnects — the observable signature of baseband/LMP fuzzing or jamming in the field. For availability-critical Bluetooth Classic links, plan for graceful degradation: assume the 2.4 GHz band can be denied and ensure loss of the link fails safe.
