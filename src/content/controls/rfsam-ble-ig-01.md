---
id: RFSAM-BLE-IG-01
title: Identify the SoC and host stack, then check the published vulnerability corpus
protocol: BLE
layer: IG
criticality: high
applicability:
  - BLE
  - BR/EDR
deferred: true
objective: >-
  Establish which Bluetooth controller (SoC) and host stack a target runs, and
  whether either carries a known, named, CVE-tracked vulnerability, using the RF
  prerequisite (label/FCC-ID teardown and a passive advertising fingerprint) to
  feed the BSAM Information-Gathering controls.
intro: >-
  Identifying the silicon and stack and checking them against the published
  Bluetooth vulnerability corpus is BSAM's territory and BSAM does it
  thoroughly. RFSAM defers to the BSAM Information-Gathering controls
  (BSAM-IG-01…04) and adds only the RF prerequisite: passively fingerprinting
  the device from the air so those controls have a component inventory to work
  from.
prerequisites:
  hardware:
    - 'A host BLE adapter over HCI (a standard USB Bluetooth dongle, or a CatSniffer presented as a virtual HCI on Linux via catnip) for passive discovery / GATT enumeration'
    - 'Optional: a Sniffle-class advertising sniffer (CatSniffer / CC1352) to capture raw advertising PDUs and manufacturer-specific data'
  software:
    - 'bettercap (BLE recon module) for device discovery and GATT enumeration'
    - 'catnip / Sniffle for advertising-channel capture; an FCC-ID / teardown lookup for the chipset'
  signal:
    freq: '2.402 to 2.480 GHz (2.4 GHz ISM)'
    bandwidth: '2 MHz per channel; 3 advertising channels (37/38/39) of 40 total'
    modulation: 'GFSK · PHYs: LE 1M (1 Mbps), LE 2M (BLE 5), LE Coded (BLE 5)'
  skill: beginner
attacks:
  - name: SweynTooth (Zero LTK Installation, et al.)
    cve:
      - CVE-2019-19194
    refs:
      - garbelini2020sweyntooth
      - cisa2020sweyntooth
      - cve-2019-19194
    impact: >-
      Deadlocks, crashes, buffer overflows and a full LE Secure Connections
      bypass (Zero-LTK) across BLE SoCs from multiple silicon vendors,
      decisive once the affected SoC is identified, before any RF capture.
    preconditions: >-
      Target runs an affected, unpatched BLE SoC (the disclosure names NXP,
      Cypress, Telink, Dialog, Microchip, STMicroelectronics and Texas
      Instruments parts); attacker within radio range.
    summary: >-
      Family of link-layer flaws across multiple BLE SoC vendors; catalogued by
      BSAM-IG-02 (controller vulnerabilities). The CVE shown is the Telink
      Zero-LTK Secure-Connections bypass.
  - name: KNOB
    cve:
      - CVE-2019-9506
    refs:
      - antonioli2019knob
      - cve-2019-9506
    impact: >-
      Forces BR/EDR encryption key entropy down to as little as 1 byte, enabling
      brute-force decryption and injection of arbitrary ciphertext.
    preconditions: >-
      BR/EDR encryption key-size negotiation accepted at low entropy by the
      controller/spec (≤ Bluetooth 5.1); attacker on-path during negotiation.
    summary: >-
      Key-entropy downgrade in BR/EDR encryption negotiation. Assessed under
      BSAM-EN-03 (minimum key size) and the BSAM-IG standard-vulnerability
      controls.
  - name: BLEEDINGBIT
    cve:
      - CVE-2018-16986
    refs:
      - cve-2018-16986
    impact: >-
      Remote arbitrary code execution via a malformed advertising packet that
      triggers a buffer overflow in the controller firmware.
    preconditions: >-
      Target uses an affected TI CC2640/CC2650 (BLE-STACK v2.2.1 and related)
      controller, unpatched; attacker within advertising range.
    summary: >-
      RCE in TI CC2640/CC2650 BLE chips, a controller-vulnerability case under
      BSAM-IG-02.
  - name: BleedingTooth
    cve:
      - CVE-2020-12351
    refs:
      - cve-2020-12351
    impact: >-
      Adjacent, unauthenticated privilege escalation / potential code execution
      via improper L2CAP input validation in the Linux BlueZ host stack.
    preconditions: >-
      Target host runs an affected Linux kernel/BlueZ (≈ 4.7.7 to 5.9.13); attacker
      within Bluetooth range, no pairing required.
    summary: >-
      Host-stack flaw in Linux BlueZ (L2CAP), a host-stack-vulnerability case
      under BSAM-IG-03.
  - name: BLESA
    refs:
      - wu2020blesa
    impact: >-
      Impersonation of a previously-paired peer, feeding spoofed data after a
      forced reconnect, where the stack does not enforce reconnection
      authentication.
    preconditions: >-
      Target host stack omits mandatory reconnection authentication (reported
      against BlueZ, Android and iOS implementations).
    summary: >-
      Reconnection-spoofing weakness in the BLE spec and several host stacks; a
      host-stack/standard case relevant to the BSAM-IG controls.
references:
  - key: garbelini2020sweyntooth
    title: 'SweynTooth: Unleashing Mayhem over Bluetooth Low Energy'
    authors: 'M. E. Garbelini, C. Wang, S. Chattopadhyay, S. Sun, E. Kurniawan'
    venue: USENIX ATC 2020
    year: 2020
    url: 'https://www.usenix.org/conference/atc20/presentation/garbelini'
    type: paper
  - key: cisa2020sweyntooth
    title: 'ICS-ALERT-20-063-01: SweynTooth Vulnerabilities'
    venue: CISA
    year: 2020
    url: 'https://www.cisa.gov/news-events/ics-alerts/ics-alert-20-063-01'
    type: standard
  - key: cve-2019-19194
    title: 'CVE-2019-19194: Telink BLE SDK installs a zero LTK (SweynTooth Zero-LTK)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-19194'
    type: cve
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
  - key: cve-2018-16986
    title: 'CVE-2018-16986: TI BLE-STACK CC2640/CC2650 buffer overflow (BLEEDINGBIT)'
    venue: NVD
    year: 2018
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2018-16986'
    type: cve
  - key: cve-2020-12351
    title: 'CVE-2020-12351: BlueZ L2CAP improper input validation (BleedingTooth)'
    venue: NVD
    year: 2020
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-12351'
    type: cve
  - key: wu2020blesa
    title: 'BLESA: Spoofing Attacks against Reconnections in Bluetooth Low Energy'
    authors: 'J. Wu, Y. Nan, V. Kumar, D. J. Tian, A. Bianchi, M. Payer, D. Xu'
    venue: USENIX WOOT 2020
    year: 2020
    url: 'https://www.usenix.org/conference/woot20/presentation/wu'
    type: paper
tools:
  - bettercap
  - catnip
  - catsniffer
bsam:
  - BSAM-IG-01
  - BSAM-IG-02
  - BSAM-IG-03
  - BSAM-IG-04
resources:
  - RFSAM-RES-04
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

A large share of real-world BLE compromise is not a novel cryptographic break but an *unpatched* component with a known, named, CVE-tracked flaw. The flaw can live in either of two places, and identifying which is the whole point of this step:

- **The controller (the BLE SoC / radio firmware).** SweynTooth is the canonical example: a family of link-layer flaws across BLE SoCs from multiple silicon vendors, deadlocks, crashes, buffer overflows, and the Zero-LTK Installation, which forces an encryption setup with a zero-filled Long Term Key and thereby bypasses LE Secure Connections [garbelini2020sweyntooth]. The CISA ICS alert names the affected vendors (NXP, Cypress, Telink, Dialog, Microchip, STMicroelectronics, Texas Instruments) [cisa2020sweyntooth], and the Telink Zero-LTK instance is tracked as CVE-2019-19194 (CVSS 8.8) [cve-2019-19194]. BLEEDINGBIT is a second controller case: a remote code-execution buffer overflow reachable from a malformed advertising packet in TI CC2640/CC2650 BLE-STACK firmware (CVE-2018-16986, CVSS 8.8) [cve-2018-16986].
- **The host stack (the OS Bluetooth implementation).** BleedingTooth is the canonical example: improper L2CAP input validation in the Linux BlueZ stack lets an adjacent, unauthenticated attacker escalate privilege without pairing (CVE-2020-12351, CVSS 8.8) [cve-2020-12351]. BLESA sits at the host-stack/standard boundary: the BLE reconnection procedure does not mandate authentication, so several stacks (BlueZ, Android, iOS) let an attacker impersonate a previously-paired peer after forcing a reconnect [wu2020blesa].

A third category is **the standard itself**, independent of any one chip: KNOB downgrades BR/EDR encryption key entropy to as little as one byte during negotiation, making the session key brute-forceable (CVE-2019-9506, CVSS 8.1) [antonioli2019knob][cve-2019-9506].

BSAM already provides mature, dedicated controls for exactly this triage: controller lifecycle status (BSAM-IG-01), controller vulnerabilities (BSAM-IG-02), host-stack vulnerabilities (BSAM-IG-03), and standard vulnerabilities (BSAM-IG-04). **RFSAM does not re-derive them.** This control exists to place the step in the RF assessment flow and to supply the one thing the RF assessor is best positioned to produce: the component inventory. That inventory comes from the label/FCC-ID and teardown for the silicon, and from a passive advertising fingerprint for the version and stack hints, the RF-capture prerequisite this control owns. The named-attack corpus above is **representative, not exhaustive**, it dates fast, so always check current vendor advisories and the Bluetooth SIG erratum feed against the components you actually identify. (For reference, the SweynTooth disclosure reports 11 new vulnerabilities under 13 CVE IDs; this control names only the canonical few rather than enumerating the family. BLESA is cited from its USENIX WOOT 2020 paper [wu2020blesa]; only the Apple instance carries a distinct CVE, CVE-2020-9770, whose NVD entry does not name BLESA, so no CVE is asserted in this control's `attacks[].cve` for it.)

## Procedure

> All steps below are passive (discovery, advertising capture, label inspection). Run them only against devices you are authorised to assess.

1. **Read the silicon off the label / FCC ID.** Find the FCC ID on the device and look it up; the internal photos and test report usually name the module or SoC.
   ```bash
   # Open the FCC ID search and enter the grantee code + product code from the label
   xdg-open "https://fccid.io/"
   ```
   Expected: the module/chip part number (e.g. a Nordic nRF52, TI CC26xx, Telink TLSR8x5x), which maps directly onto the BSAM-IG-02 controller-vulnerability lookup.

2. **Passively discover and fingerprint from the air.** Bring up a host BLE adapter and run a passive scan to capture the advertised name, service UUIDs and manufacturer-specific data (the company-ID prefix in manufacturer data identifies the vendor).
   ```bash
   sudo bettercap -eval "ble.recon on; sleep 20; ble.show; q"
   ```
   Expected: a table of nearby devices with MAC, address type (public vs random/RPA), advertised name and vendor, the advertising fingerprint (RFSAM-RES-04). Note the address type: a fixed public address is trackable; a rotating Resolvable Private Address is not.

3. **Capture raw advertising PDUs (optional, for manufacturer data).** Use a Sniffle-class sniffer via catnip to record the advertising channels into a PCAP for offline inspection in Wireshark.
   ```bash
   catnip sniff --board catsniffer --protocol ble --output adv.pcap
   ```
   Expected: an `adv.pcap` whose `BTLE` advertising frames carry the AdvData fields; the manufacturer-specific data's leading 2-byte Company Identifier resolves to the SoC/module vendor.

4. **Infer the BLE version and stack hints.** From the captured advertising, extended advertising and the 2M/Coded PHYs imply BLE 5.x; LE Legacy-only advertising implies an older controller. Combine with the host OS where known (a phone/gateway behind the device implies its stack, e.g. Android Fluoride, Linux BlueZ, Apple).
   Expected: a (controller, host-stack, BLE version) tuple, the input the BSAM-IG controls need.

5. **Run the BSAM Information-Gathering controls against the identified components.** This is where the judgement is made; RFSAM hands off here.
   - BSAM-IG-01, controller lifecycle status (is the SoC end-of-life / unpatchable?).
   - BSAM-IG-02, controller vulnerabilities (e.g. SweynTooth, BLEEDINGBIT against the identified SoC).
   - BSAM-IG-03, host-stack vulnerabilities (e.g. BleedingTooth against the identified stack).
   - BSAM-IG-04, standard vulnerabilities (e.g. KNOB / spec-level reconnection issues).

6. **Carry the result forward as scoping input** to the RFSAM SP/PHY/LL capture controls. An end-of-life, unpatchable SoC with a published Zero-LTK bypass may make further dynamic RF testing moot, that finding is already decisive.

## Field case

A representative engagement against a connected door-lock module:

- **Step 1 (label):** the FCC ID's internal photos showed a Telink TLSR8253 module. That part appears in the SweynTooth disclosure's affected list, immediately raising the Zero-LTK question (CVE-2019-19194) under BSAM-IG-02.
- **Step 2 (air):** `bettercap` saw the lock advertising under a `static random` address with manufacturer-specific data whose Company Identifier matched the module vendor, consistent with the label, and the device advertised LE-Legacy-only (no extended advertising), implying a pre-BLE-5 controller.
- **Step 5 (BSAM):** running BSAM-IG-01/IG-02 against "Telink TLSR8253, firmware [FILL: SDK version read from the device / vendor]" is the decisive step. If the firmware predates the Telink fix, the device is exposed to the Zero-LTK Secure-Connections bypass regardless of how strong the pairing *looks*.

The value RFSAM adds here is sequencing, not a new finding: the cheap, passive component inventory from this step scopes which SP/PHY/LL capture controls are worth running at all.

> This field case is a *representative* example illustrating the workflow, not a measured engagement. The `[FILL: …]` firmware-version placeholder is intentional: replace it only with a value actually read from a device before claiming a specific finding.

## Remediation

**Developer (device firmware / SoC integration).** Track your BLE SoC vendor's advisory feed and the Bluetooth SIG erratum feed; ship the controller-firmware fixes for the named controller flaws (SweynTooth Zero-LTK / CVE-2019-19194 [cve-2019-19194], BLEEDINGBIT / CVE-2018-16986 [cve-2018-16986]). Enforce LE Secure Connections and reject a zero or out-of-order LTK install. Do not select an end-of-life SoC with no patch path for a new design.

**Integrator (host / OS stack).** Keep the host Bluetooth stack patched, BleedingTooth (CVE-2020-12351) is a BlueZ/kernel fix, so patch the kernel, not just the application [cve-2020-12351]. Enforce reconnection authentication so a forced reconnect cannot be impersonated (the BLESA class) [wu2020blesa]. Set and enforce a minimum encryption key size to defeat KNOB-style downgrade [antonioli2019knob][cve-2019-9506].

**Operator (deployment / fleet).** Maintain a component inventory (SoC + host stack + firmware version) per deployed device so a newly published CVE can be matched to the fleet quickly. Treat any controller that is end-of-life with no patch path as high-risk and plan replacement. Follow the remediation of the cited BSAM Information-Gathering controls (BSAM-IG-01…04), which own the formal judgement this control defers to.
