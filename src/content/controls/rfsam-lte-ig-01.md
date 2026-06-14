---
id: RFSAM-LTE-IG-01
title: Inventory the baseband and RAN/core stack, then check the published vulnerability corpus
protocol: LTE
layer: IG
criticality: high
applicability:
  - LTE
  - 5G NSA
deferred: false
objective: >-
  Establish which baseband (modem SoC + firmware) the target device runs and,
  where the network is in scope, which RAN/core implementation and version the
  eNodeB/EPC runs, then determine whether either carries a known, named,
  CVE-tracked vulnerability — before any behavioural or over-the-air testing.
intro: >-
  LTE has two distinct software surfaces worth inventorying before any RF work:
  the device-side baseband (the modem SoC running its own RTOS, reachable over
  the air) and, where the network is in scope, the RAN/core stack (eNodeB + EPC,
  increasingly open-source). Identify both and cross-reference the published
  corpora. Unlike BLE, the BSAM registry covers only Bluetooth, so there is no
  BSAM information-gathering control to defer to — RFSAM owns this control end to
  end.
prerequisites:
  hardware:
    - 'For device-side identification: the target handset/modem, or a commercial Qualcomm-based modem such as a SIMCom SIM7600 on a USB/serial port to model the inventory step'
    - 'No RF capture is required for inventory itself; this is an information-gathering control. (Identifying the cell on-air is RFSAM-RES-08.)'
  software:
    - 'An AT terminal for reading modem identity (AT+CGMI / AT+CGMM / AT+CGMR); QCSuper or MobileInsight to confirm the Qualcomm baseband and read its firmware from the DIAG feed'
    - 'For network-side scope: the source tree / package metadata of the RAN-core stack under test (srsRAN, Open5GS, OpenAirInterface, Magma, NextEPC) to read its version'
  signal:
    freq: 'Licensed cellular — common bands ~700 MHz to 2.6 GHz (full E-UTRA ~450 MHz–3.8 GHz); FDD and TDD'
    bandwidth: '1.4 / 3 / 5 / 10 / 15 / 20 MHz channels; carrier identified by EARFCN'
    modulation: 'Downlink OFDMA, uplink SC-FDMA; QPSK/16/64/256-QAM'
  skill: intermediate
attacks:
  - name: RANsacked (RAN-core fuzzing corpus)
    refs:
      - bennett2024ransacked
    impact: >-
      A single unauthenticated packet can persistently crash the MME/AMF on an
      affected stack, denying service across a cell or wider area; several
      findings are memory-corruption bugs reachable from the RAN interface.
    preconditions: >-
      An in-scope eNodeB/EPC running an affected, unpatched open-source RAN-core
      build (the disclosure spans srsRAN, Open5GS, Magma, OpenAirInterface,
      NextEPC, Athonet and SD-Core); some findings need no valid SIM.
    summary: >-
      Domain-informed (ASN.1-structure-aware) fuzzing of LTE/5G RAN-core
      interfaces that reported 119 vulnerabilities (the paper states 93 assigned
      CVEs in its abstract and 96 in its introduction) across seven cellular core
      implementations, three of which are also 5G. Representative — check the
      per-stack advisories for the build in scope.
  - name: UNISOC NAS-parsing buffer overflow
    cve:
      - CVE-2022-20210
    refs:
      - cpr2022unisoc
      - cve-2022-20210
    impact: >-
      A malformed NAS message (Check Point's disclosure pinpoints the Mobile
      Identity / IMSI unpacking in the Attach Accept handler, where a length
      field of zero makes the parser copy 0xFFFFFFFE bytes) overflows a
      heap buffer in the modem's NAS parser, crashing the modem (DoS) with
      potential for code execution.
    preconditions: >-
      Target device uses an affected, unpatched UNISOC baseband; attacker can
      deliver the malformed NAS message — in practice from a rogue cell the device
      camps on.
    summary: >-
      Missing bounds checks in UNISOC NAS message parsing, found by Check Point
      Research (rated 9.4 by UNISOC). Illustrates that baseband NAS parsers are a
      reachable, CVE-tracked attack surface that inventory should flag.
  - name: Qualcomm DSP/FastRPC use-after-free
    cve:
      - CVE-2024-43047
    refs:
      - cve-2024-43047
      - securityweek2024qualcomm
    impact: >-
      Memory corruption (use-after-free) in the Qualcomm DSP service / FASTRPC
      driver; reported under limited, targeted exploitation, illustrating that
      baseband-adjacent SoC bugs reach real-world spyware use.
    preconditions: >-
      Affected Qualcomm chipset, unpatched. The flaw is triggered by a local
      low-privileged actor (not purely over-the-air); it is included here as a
      baseband-SoC inventory cross-reference, not an air-interface attack.
    summary: >-
      Use-after-free in the Qualcomm DSP/FASTRPC path, credited to Google Project
      Zero and Amnesty Security Lab and flagged by Google TAG as possibly
      exploited — a baseband-adjacent SoC bug the inventory should surface.
  - name: LLFuzz baseband lower-layer (L2) memory corruption
    refs:
      - hoang2025llfuzz
    impact: >-
      Memory-corruption bugs in the baseband PDCP/RLC/MAC layers reachable over
      the air; demonstrated DoS that crashes the modem from a single malformed
      radio packet across multiple commercial vendors.
    preconditions: >-
      Target uses an affected baseband (the study covers 15 commercial basebands
      from five vendors); the bug is reached from the lower-layer radio protocol,
      typically from a rogue cell.
    summary: >-
      Over-the-air fuzzing of cellular baseband lower layers (L1/L2) that found 11
      previously-unknown memory corruptions (3 PDCP, 2 RLC, 5 MAC, 1 RRC; 7
      assigned CVEs). Extends the attack surface below NAS into L2.
  - name: Baseband remote code execution (foundational)
    refs:
      - weinmann2012baseband
    impact: >-
      Arbitrary code execution on the baseband processor — below the application
      processor and its hardening — from over-the-air message handling.
    preconditions: >-
      A memory-corruption bug in the baseband's over-the-air protocol stack and
      an attacker able to deliver the triggering messages (e.g. a rogue cell).
    summary: >-
      The foundational demonstration that memory corruptions in cellular baseband
      stacks are remotely exploitable, establishing why baseband vendor/firmware
      identification belongs in information-gathering.
references:
  - key: bennett2024ransacked
    title: 'RANsacked: A Domain-Informed Approach for Fuzzing LTE and 5G RAN-Core Interfaces'
    authors: 'N. Bennett, W. Aldoseri, et al. (University of Florida, NC State University)'
    venue: ACM CCS 2024
    year: 2024
    url: 'https://dl.acm.org/doi/10.1145/3658644.3670320'
    type: paper
  - key: cpr2022unisoc
    title: Vulnerability within the UNISOC baseband opens mobile phones communications to remote hacker attacks
    authors: Check Point Research
    venue: Check Point Research
    year: 2022
    url: 'https://research.checkpoint.com/2022/vulnerability-within-the-unisoc-baseband/'
    type: blog
  - key: cve-2022-20210
    title: 'CVE-2022-20210: UNISOC modem NAS-parsing buffer overflow (remote DoS/RCE)'
    venue: NVD
    year: 2022
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-20210'
    type: cve
  - key: cve-2024-43047
    title: 'CVE-2024-43047: Qualcomm DSP service use-after-free (FASTRPC)'
    venue: NVD
    year: 2024
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-43047'
    type: cve
  - key: securityweek2024qualcomm
    title: 'Qualcomm Alerted to Possible Zero-Day Exploited in Targeted Attacks'
    authors: E. Kovacs
    venue: SecurityWeek
    year: 2024
    url: 'https://www.securityweek.com/qualcomm-alerted-to-possible-zero-day-exploited-in-targeted-attacks/'
    type: blog
  - key: hoang2025llfuzz
    title: 'LLFuzz: An Over-the-Air Dynamic Testing Framework for Cellular Baseband Lower Layers'
    authors: 'T. D. Hoang, T. Oh, C. Park, I. Yun, Y. Kim'
    venue: USENIX Security 2025
    year: 2025
    url: 'https://www.usenix.org/conference/usenixsecurity25/presentation/hoang'
    type: paper
  - key: weinmann2012baseband
    title: 'Baseband Attacks: Remote Exploitation of Memory Corruptions in Cellular Protocol Stacks'
    authors: R.-P. Weinmann
    venue: USENIX WOOT 2012
    year: 2012
    url: 'https://www.usenix.org/conference/woot12/workshop-program/presentation/weinmann'
    type: paper
tools:
  - sim7600
  - qcsuper
  - mobileinsight-core
bsam: []
resources:
  - RFSAM-RES-08
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

The baseband is a second computer inside every cellular device: a modem SoC running its own real-time OS on a dedicated core, with firmware that parses attacker-influenceable radio messages over the air. Memory-corruption bugs there yield code execution *below* the application processor and its hardening (ASLR/DEP/code-signing), which is exactly the gap Weinmann's foundational WOOT 2012 work demonstrated by exploiting memory corruptions in deployed cellular protocol stacks [weinmann2012baseband]. That surface has stayed live and moved down the stack: the UNISOC NAS-parser overflow is a CVE-tracked remote DoS/RCE in the modem's Non-Access-Stratum message parsing [cpr2022unisoc] [cve-2022-20210], and LLFuzz's over-the-air fuzzing of the *lower* layers (PDCP/RLC/MAC) found eleven previously-unknown memory corruptions across fifteen commercial basebands from five vendors, seven of them assigned CVEs [hoang2025llfuzz]. Baseband-adjacent SoC bugs reach real targeted-surveillance use, too: CVE-2024-43047, a use-after-free in the Qualcomm DSP/FASTRPC path, was credited to Google Project Zero and Amnesty Security Lab and flagged by Google TAG as possibly under limited, targeted exploitation [cve-2024-43047] [securityweek2024qualcomm].

Symmetrically, where the network side is in scope, the eNodeB/EPC parses attacker-influenced RRC/NAS messages and is increasingly open-source. The RANsacked study applied ASN.1-structure-aware fuzzing to the RAN-core interface and reported 119 vulnerabilities (the paper gives the assigned-CVE total as 93 in its abstract and 96 in its introduction) across seven cellular core implementations — srsRAN/srsEPC, Open5GS, Magma, OpenAirInterface, NextEPC, SD-Core and HPE Athonet, three of which (Magma, Open5GS, OAI) are also exercised as 5G cores — several of which let a single unauthenticated, pre-authentication packet persistently crash the MME/AMF, with the NAS-reachable findings triggerable before the UE is verified (i.e. without a valid SIM) [bennett2024ransacked]. That makes the implementation-and-version of an in-scope core a finding in its own right: an unpatched build can be matched to a known single-packet crash on inventory alone.

This control therefore inventories two things — (1) the device baseband vendor and firmware version, and (2), where the eNodeB/EPC is in scope, the RAN/core implementation and version — and cross-references both against the corpora above. It is the LTE analogue of RFSAM-BLE-IG-01; the difference is that BLE defers the corpus check to BSAM, whereas the BSAM registry has no cellular control, so RFSAM owns the cross-reference here. The corpora below are representative; CVE inventories date fast, so confirm against current vendor security bulletins for the exact chipset/build in scope rather than treating any list as exhaustive [bennett2024ransacked]. No single RANsacked CVE ID is asserted here: the paper's per-stack, per-version CVE mapping lives in its appendix (Table 6), so pull the specific CVE IDs for the exact build in scope from the paper or NVD before relying on any one of them.

## Procedure

All steps below are passive inventory on equipment you own or are authorised to test. No transmitting is required to identify a baseband; the only on-air step (identifying the live cell, RFSAM-RES-08) is read-only reception of what the network already broadcasts.

1. **Read the device baseband identity over AT.** On the target modem (or a representative SIM7600 on `/dev/ttyUSB*`):
   ```bash
   # 115200 8N1 to the modem's AT port
   picocom -b 115200 /dev/ttyUSB2
   ```
   Then issue:
   ```
   AT+CGMI
   AT+CGMM
   AT+CGMR
   ```
   Expected: `AT+CGMI` returns the manufacturer (e.g. `SIMCOM INCORPORATED` / `QUALCOMM`), `AT+CGMM` the model, and `AT+CGMR` the firmware/revision string (e.g. `LE11B...`). Record the vendor and exact revision — this is the key you will look up. `AT+CPSI?` additionally returns the serving system mode, operator (MCC-MNC), band, EARFCN and Cell ID if you also want the cell identity.

2. **Confirm the baseband family from the DIAG feed.** Qualcomm-based modems (the SIM7600 included) expose a `/dev/diag` port; QCSuper reads the chipset and signalling from it:
   ```bash
   ./qcsuper.py --usb-modem /dev/ttyUSB0 --info
   ```
   Expected: chipset/build identification confirming a Qualcomm baseband, distinguishing it from Shannon/Exynos, MediaTek or UNISOC. (MobileInsight reads the same diagnostic feed on a supported phone and reports the modem firmware similarly.) This pins which vendor's bulletins and corpora apply.

3. **Where the network is in scope, read the RAN/core implementation and version.** For an open-source core under test:
   ```bash
   # srsRAN 4G
   srsenb --version
   # Open5GS (Debian/Ubuntu package)
   dpkg -l | grep open5gs
   ```
   Expected: a concrete version string (e.g. `srsRAN 23.x`, `open5gs 2.7.x`). Record it; this is what you match against RANsacked and the per-stack advisories.

4. **Cross-reference the device baseband** against the vendor's security bulletins and the baseband corpus: the UNISOC NAS overflow [cve-2022-20210] [cpr2022unisoc], the LLFuzz L2 findings [hoang2025llfuzz], the Qualcomm DSP/FASTRPC class [cve-2024-43047], and the foundational baseband-RCE work [weinmann2012baseband]. Note the device's patch level (e.g. Android security patch date) against each.

5. **Cross-reference the RAN/core stack** version against RANsacked [bennett2024ransacked] and the upstream issue trackers / release notes for that build. Flag any version at or below a build named in a single-packet-MME-crash finding.

6. **Record patch status and risk.** Flag end-of-life basebands with no OEM patch path, and unpatched open-source cores reachable by attacker-influenced packets, as high-risk on inventory alone — before any custom fuzzing or over-the-air testing.

## Field case

Illustrative walkthrough — substitute the values you capture. Working a fixed-LTE CPE (a UNISOC-based router) in an authorised lab, the inventory step runs before any RF capture. `AT+CGMI` / `AT+CGMM` / `AT+CGMR` over the device's AT port return the UNISOC modem family and a firmware revision string; if the device's reported security-patch level predates the UNISOC NAS fix, then on inventory alone that places the device within the published exposure window of the UNISOC NAS-parsing overflow [cve-2022-20210] [cpr2022unisoc] — a CVE-tracked remote modem-crash reachable from a NAS message — so the engagement is reframed around that known finding rather than starting from blind fuzzing. The exact firmware revision and patch date are device-specific and are recorded per engagement:

- Baseband vendor/family: UNISOC (confirmed via `AT+CGMI`/`AT+CGMM`)
- Firmware revision read: [FILL: AT+CGMR revision string for the unit under test]
- Reported security-patch level: [FILL: patch date]
- Verdict: within the published UNISOC NAS-overflow exposure window pending the exact patch-date check against the vendor bulletin

The bracketed `[FILL: …]` values must be supplied from the actual unit under test; do not cite a specific revision string or patch date until measured.

The symmetric network-side version applies unchanged: if the in-scope eNodeB/EPC is an unpatched srsRAN or Open5GS build, the RANsacked corpus already lists single-packet MME-crash CVEs for affected versions before any custom fuzzing [bennett2024ransacked], so the inventory step can be decisive on its own.

## Remediation

**Developer (baseband / stack vendors).** Apply memory-safety discipline to NAS and lower-layer (PDCP/RLC/MAC/RRC) parsers — bounds-check every length-prefixed field — since these are the surfaces the UNISOC overflow [cve-2022-20210] and the LLFuzz L2 corpus [hoang2025llfuzz] hit; harden the baseband core toward parity with the application processor, the gap Weinmann identified [weinmann2012baseband]. For RAN/core implementations, treat RAN-facing inputs as untrusted and fuzz the ASN.1 decode paths the way RANsacked did [bennett2024ransacked].

**Integrator (device OEMs / network operators).** Maintain a current baseband-firmware update path and surface the modem patch level, not just the application-processor patch date; track each shipped chipset against its vendor's security bulletins. For deployed cores, pin the RAN/core build to a patched release and subscribe to the upstream advisories for that stack.

**Operator (defenders / assessors).** Inventory first: record baseband vendor + firmware revision and (where in scope) the RAN/core implementation + version, and match both against current advisories and the corpora here — flag end-of-life basebands and unpatched cores as high-risk. Never expose an unauthenticated MME/AMF to attacker-reachable packets [bennett2024ransacked]. Any step that goes beyond inventory into transmitting (standing up a test cell to deliver the triggering message) is authorised-testing-only: your own equipment and test SIMs, inside RF shielding, under explicit permission. There is no BSAM cellular control to defer to — this cross-reference is RFSAM's domain.
