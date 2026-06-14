---
id: RFSAM-BTC-IG-01
title: Identify the device, BR/EDR mode and vulnerability corpus
protocol: BTC
layer: IG
criticality: info
applicability:
  - BR/EDR
  - Bluetooth Classic
deferred: true
objective: >-
  Determine whether the target speaks Bluetooth Classic (BR/EDR) versus LE-only
  versus dual-mode, fingerprint the controller SoC and host stack, and check the
  published Bluetooth-Classic vulnerability corpus — using the RF prerequisite
  (confirming BR/EDR and reading BD_ADDR / Class of Device from an inquiry scan)
  to feed the BSAM Information-Gathering controls.
intro: >-
  Triaging the silicon, the host stack and the published Bluetooth-Classic
  vulnerability corpus is BSAM's territory, and BSAM does it thoroughly. RFSAM
  defers to the BSAM Information-Gathering controls (BSAM-IG-02 controller
  vulnerabilities, BSAM-IG-03 host-stack vulnerabilities, BSAM-IG-04 standard
  vulnerabilities) and adds only the RF prerequisite: confirming the device is
  Classic (BR/EDR) rather than LE-only, and reading its BD_ADDR and Class of
  Device from an inquiry scan, so those controls have a component inventory to
  work from.
prerequisites:
  hardware:
    - 'An original ESP32 (DevKit) — its controller has a real BR/EDR radio, so it can run a true Bluetooth Classic inquiry. An ESP32-S3/C-series is LE-only and cannot.'
    - 'Optional: the device label / FCC ID and a teardown for the controller SoC part number.'
  software:
    - 'esp32-classic-bt-scan firmware (BR/EDR inquiry) or esp32-bt-exp (dual-mode discovery dump); an FCC-ID / teardown lookup for the chipset.'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per RF channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: beginner
attacks:
  - name: BlueBorne
    cve:
      - CVE-2017-1000251
    refs:
      - cve-2017-1000251
      - armis2017blueborne
    impact: >-
      Remote code execution in kernel space via a stack overflow in L2CAP
      configuration-response processing in the Linux BlueZ stack — reachable
      over the air with no pairing and no user interaction.
    preconditions: >-
      Target host runs an affected, unpatched native Bluetooth stack (the BlueZ
      instance here spans Linux kernel 2.6.32 up to and including 4.13.1);
      attacker within radio range.
    summary: >-
      Host-stack / standard family across Linux, Android, Windows and iOS;
      catalogued under BSAM-IG-03 (host-stack vulnerabilities). The CVE shown is
      the BlueZ L2CAP kernel-space RCE instance.
  - name: KNOB
    cve:
      - CVE-2019-9506
    refs:
      - antonioli2019knob
      - cve-2019-9506
    impact: >-
      Forces BR/EDR encryption-key entropy down to as little as 1 byte during
      negotiation, enabling a practical brute force that decrypts traffic and
      injects arbitrary ciphertext without the victim noticing.
    preconditions: >-
      BR/EDR encryption key-size negotiation accepted at low entropy by the
      controller/spec (≤ Bluetooth 5.1); attacker on-path during negotiation.
    summary: >-
      Spec-level key-entropy downgrade in BR/EDR encryption negotiation.
      Assessed under BSAM-IG-04 (standard vulnerabilities) and BSAM-EN-03
      (minimum key size).
  - name: BIAS
    cve:
      - CVE-2020-10135
    refs:
      - antonioli2020bias
      - cve-2020-10135
    impact: >-
      Impersonation of a previously-paired BR/EDR device — an adjacent attacker
      completes authentication without the link key, taking either the master
      or slave role.
    preconditions: >-
      Legacy or secure-connections pairing authentication in the Core
      Specification (v5.2 and earlier) accepted without re-derivation of the
      link key; attacker with adjacent access to a device that already trusts
      the impersonated peer.
    summary: >-
      Spec-level impersonation flaw in BR/EDR authentication. A standard-level
      case under BSAM-IG-04; pairs naturally with KNOB in a downgrade-then-
      impersonate chain.
  - name: BrakTooth
    refs:
      - garbelini2022braktooth
      - braktooth-repo
    impact: >-
      Crashes, deadlocks and, on some SoCs, remote code execution against the
      BR/EDR controller via malformed baseband / Link Manager Protocol (LMP)
      frames — ~16 CVEs and 20+ variants across dozens of Bluetooth-Classic
      chips.
    preconditions: >-
      Target uses an affected, unpatched BR/EDR controller SoC; attacker within
      radio range. Patch status varies widely by vendor and many parts are
      end-of-life.
    summary: >-
      Controller-level family discovered by directed LMP/baseband fuzzing
      (SUTD/ASSET). A controller-vulnerability case under BSAM-IG-02; identifying
      the SoC here is what makes the lookup decisive.
references:
  - key: cve-2017-1000251
    title: 'CVE-2017-1000251: BlueZ L2CAP stack overflow → kernel-space RCE (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-1000251'
    type: cve
  - key: armis2017blueborne
    title: 'BlueBorne: a new attack vector exposing critical Bluetooth devices'
    authors: Armis Security
    venue: Armis
    year: 2017
    url: 'https://www.armis.com/research/blueborne/'
    type: blog
  - key: antonioli2019knob
    title: 'The KNOB is Broken: Exploiting Low Entropy in the Encryption Key Negotiation of Bluetooth BR/EDR'
    authors: 'D. Antonioli, N. O. Tippenhauer, K. Rasmussen'
    venue: USENIX Security 2019
    year: 2019
    url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/antonioli'
    type: paper
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
    url: 'https://doi.org/10.1109/SP40000.2020.00093'
    type: paper
  - key: cve-2020-10135
    title: 'CVE-2020-10135: Bluetooth BR/EDR authentication impersonation (BIAS)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-10135'
    type: cve
  - key: garbelini2022braktooth
    title: 'BrakTooth: Causing Havoc on Bluetooth Link Manager via Directed Fuzzing'
    authors: 'M. E. Garbelini, V. Bedi, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX Security 2022 (SUTD/ASSET disclosure)
    year: 2021
    url: 'https://asset-group.github.io/disclosures/braktooth/braktooth.pdf'
    type: paper
  - key: braktooth-repo
    title: 'braktooth_esp32_bluetooth_classic_attacks — Baseband & LMP exploits against BR/EDR controllers'
    authors: M. E. Garbelini
    venue: GitHub
    year: 2021
    url: 'https://github.com/Matheus-Garbelini/braktooth_esp32_bluetooth_classic_attacks'
    type: tool
tools:
  - esp32-classic-bt-scan
  - esp32-bt-exp
bsam:
  - BSAM-IG-02
  - BSAM-IG-03
  - BSAM-IG-04
resources:
  - RFSAM-RES-26
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Before any RF work against a Bluetooth device, two questions decide everything that follows: **is this device even Bluetooth Classic (BR/EDR), and what silicon and stack run it?** Bluetooth Classic (BR/EDR) is a different PHY and MAC from Bluetooth Low Energy — it hops across 79 RF channels of 1 MHz at ~1600 hops/s with GFSK at 1 Mbps (Basic Rate) and π/4-DQPSK / 8DPSK at 2–3 Mbps (EDR), where BLE uses 40 channels and a different access scheme. The two share the 2.4 GHz band but **must never be conflated**: an ESP32-S3, nRF or CC-series target is usually LE-only and belongs on the BLE descent, while audio gear, HID peripherals, OBD-II dongles and car/infotainment modules are typically Classic or dual-mode. Confirming BR/EDR is therefore the first RF prerequisite this control owns.

A large share of real-world Bluetooth-Classic compromise is not a novel cryptographic break but an *unpatched* component carrying a known, named, CVE-tracked flaw. The flaw lives in one of three places, and identifying which is the whole point of this step:

- **The controller (the BR/EDR SoC / radio firmware).** BrakTooth is the canonical Classic example: a family of ~16 CVEs and 20+ variants found by directed fuzzing of the baseband and Link Manager Protocol (LMP), causing crashes, deadlocks and, on some chips, remote code execution across dozens of BR/EDR controllers [garbelini2022braktooth]. The public proof-of-concept runs on the same cheap ESP32 used here [braktooth-repo]. This is a controller-vulnerability case under BSAM-IG-02.
- **The host stack (the OS Bluetooth implementation).** BlueBorne is the canonical Classic example: a stack overflow in L2CAP configuration-response processing in the Linux BlueZ native stack (kernel 2.6.32 up to and including 4.13.1) yields kernel-space remote code execution over the air, with no pairing and no user interaction (CVE-2017-1000251) [cve-2017-1000251][armis2017blueborne]. This is a host-stack-vulnerability case under BSAM-IG-03.
- **The standard itself**, independent of any one chip. KNOB downgrades BR/EDR encryption-key entropy to as little as one byte during negotiation, making the session key brute-forceable (CVE-2019-9506) [antonioli2019knob][cve-2019-9506]. BIAS impersonates a previously-paired BR/EDR device by completing authentication without the link key (CVE-2020-10135, Core Specification v5.2 and earlier) [antonioli2020bias][cve-2020-10135]; the two chain naturally — downgrade with KNOB, then impersonate with BIAS. These are standard-vulnerability cases under BSAM-IG-04.

BSAM already provides mature, dedicated controls for exactly this triage: controller vulnerabilities (BSAM-IG-02), host-stack vulnerabilities (BSAM-IG-03), and standard vulnerabilities (BSAM-IG-04). **RFSAM does not re-derive them.** This control exists to place the step in the RF assessment flow and to supply the one thing the RF assessor is best positioned to produce: confirmation that the device is BR/EDR, and its BD_ADDR (48-bit, with the upper 24 bits an OUI/vendor hint) and Class of Device read straight from an inquiry response — the component-inventory seed the BSAM controls consume. The named corpus above (BlueBorne, KNOB, BIAS, BrakTooth) is **representative, not exhaustive** — it dates fast, so always check current vendor advisories and the Bluetooth SIG erratum feed against the components you actually identify.

## Procedure

> Steps below are passive identification (an inquiry scan and label inspection — no pairing, no connection, no transmission beyond the standard inquiry the controller performs). Run them only against devices you are authorised to assess.

1. **Read the silicon off the label / FCC ID.** Find the FCC ID on the device and look it up; the internal photos and test report usually name the module or controller SoC.
   ```bash
   # Open the FCC ID search and enter the grantee + product code from the label
   xdg-open "https://fccid.io/"
   ```
   Expected: the module/chip part number (for example a CSR/Qualcomm, Cypress, Espressif, Realtek or Texas Instruments BR/EDR part), which maps directly onto the BSAM-IG-02 controller-vulnerability lookup.

2. **Confirm BR/EDR and capture BD_ADDR + Class of Device with an inquiry scan.** Flash the BR/EDR inquiry firmware to an *original* ESP32 (DevKit) and run a Classic inquiry — this uses the ESP32's own Bluetooth controller, the cheapest accessible way to enumerate Classic devices in range (RFSAM-RES-26).
   ```bash
   # esp32-classic-bt-scan: BR/EDR inquiry on the ESP32's own controller
   esptool.py --chip esp32 write_flash 0x0 esp32-classic-bt-scan.bin
   # then open the serial monitor at 115200 baud to read the inquiry results
   ```
   Expected (per discoverable device): a `BD_ADDR`, friendly name, RSSI and a `Class of Device` (CoD). A device answering this BR/EDR inquiry is, by definition, Classic-capable — that is the confirmation this control needs. The 48-bit BD_ADDR's upper 24 bits are an OUI you can resolve to a vendor; the CoD's major/minor fields hint at the device type (audio, peripheral, phone). A device that never answers a Classic inquiry but does answer a BLE scan is LE-only — send it to the BLE descent (RFSAM-BLE-IG-01).

3. **Disambiguate dual-mode when a target could be either.** If the device might expose both radios, bring up the dual-mode discovery dump (`esp32-bt-exp`) to list what it sees on Classic (inquiry) and BLE at once.
   ```bash
   # esp32-bt-exp: Bluedroid dual-mode discovery dump (Classic + BLE survey)
   esptool.py --chip esp32 write_flash 0x0 esp32-bt-exp.bin
   ```
   Expected: a combined survey. A device appearing in *both* the Classic and BLE lists is dual-mode (BR/EDR + LE) — note this, because the two radios are assessed on different descents and a finding on one does not imply the other.

4. **Infer the controller / host-stack / spec-version tuple.** Combine the BD_ADDR OUI and CoD from step 2 with the FCC-ID/teardown part number from step 1, and with the host behind the device where known (a phone or Linux gateway implies its stack — for example Android Fluoride, Linux BlueZ). The Core-Spec version it claims bounds the spec-level corpus (KNOB ≤ 5.1; BIAS ≤ 5.2).
   Expected: a `(controller SoC, host stack, Core-Spec version)` tuple — the input the BSAM-IG controls need.

5. **Run the BSAM Information-Gathering controls against the identified components.** This is where the judgement is made; RFSAM hands off here.
   - **BSAM-IG-02** — controller vulnerabilities (for example BrakTooth against the identified BR/EDR SoC).
   - **BSAM-IG-03** — host-stack vulnerabilities (for example BlueBorne against the identified native stack).
   - **BSAM-IG-04** — standard vulnerabilities (for example KNOB / BIAS against the claimed Core-Spec version).

6. **Carry the result forward as scoping input** to the RFSAM SP/PHY/LL capture controls. An end-of-life, unpatchable controller with a published BrakTooth RCE may make further dynamic RF testing moot — that finding is already decisive.

## Field case

Illustrative walkthrough — substitute the values you capture. The target is a Bluetooth-Classic hands-free car module:

- **Step 1 (label):** the FCC ID's internal photos showed a [FILL: controller SoC part number read from the FCC internal photos / teardown], placing the controller on the BSAM-IG-02 lookup.
- **Step 2 (air):** the `esp32-classic-bt-scan` inquiry returned the unit answering a BR/EDR inquiry — confirming Classic, not LE-only — with `BD_ADDR [FILL: 48-bit address from the inquiry response]`, a friendly name matching the head unit, and a Class of Device with the Audio major class set. The BD_ADDR's upper-24-bit OUI resolved to the module vendor, consistent with the label.
- **Step 3 (dual-mode):** `esp32-bt-exp` showed the same unit on the Classic list only and not on BLE — a Classic-only target, so the assessment stays on the BR/EDR descent.
- **Step 5 (BSAM):** running BSAM-IG-02/IG-04 against the identified controller and its claimed Core-Spec version is the decisive step. If the controller predates the vendor's BrakTooth fix, the unit is exposed to the relevant baseband/LMP crash-or-RCE variant regardless of how strong the pairing *looks*; if it claims Core Spec ≤ 5.1, KNOB applies at the standard level.

The value RFSAM adds here is sequencing, not a new finding: the cheap inquiry-scan component inventory from this step scopes which SP/PHY/LL capture controls are worth running at all. The `[FILL: …]` placeholders (controller part number, BD_ADDR) are intentional — replace them only with values actually read from a device before claiming a specific finding.

## Remediation

**Developer (device firmware / controller integration).** Track your BR/EDR controller vendor's advisory feed and the Bluetooth SIG erratum feed; ship the controller-firmware fixes for the named flaws (BrakTooth baseband/LMP) [garbelini2022braktooth]. Reject low encryption-key entropy to defeat KNOB-style downgrade and set a high minimum key size [antonioli2019knob][cve-2019-9506]. Enforce mutual re-authentication that re-derives the link key, closing the BIAS impersonation class [antonioli2020bias][cve-2020-10135]. Do not select an end-of-life BR/EDR controller with no patch path for a new design.

**Integrator (host / OS stack).** Keep the host Bluetooth stack patched — BlueBorne (CVE-2017-1000251) is a kernel/BlueZ fix, so patch the kernel, not just the application [cve-2017-1000251]. Disable BR/EDR discoverability and Classic profiles that are not in use, shrinking the inquiry-visible surface this control fingerprints.

**Operator (deployment / fleet).** Maintain a per-device component inventory (controller SoC + host stack + Core-Spec version) keyed off the BD_ADDR, so a newly published Classic CVE can be matched to the fleet quickly. Treat any controller that is end-of-life with no patch path as high-risk and plan replacement. Follow the remediation of the cited BSAM Information-Gathering controls (BSAM-IG-02/03/04), which own the formal judgement this control defers to.
