# 03 - Finding Registry: Schema, Severity, and CVSS 4.0 RF

> Defines the canonical JSONL schema, the finding block format, the RFSAM severity rubric,
> and the typical CVSS 4.0 vectors for RF. Use it before registering the first finding.

## Index
1. JSONL schema
2. Usage of `register_finding.py`
3. Finding format in chat
4. RFSAM severity rubric (what evidence each level requires)
5. CVSS 4.0 for RF - typical vectors
6. How to cite references
7. `rf-severity` - 4-axis model for classifying RF findings

---

## 1. JSONL schema

Each line of `loot/rfsam_findings.jsonl` is a JSON object with this schema:

```json
{
  "id": "RF-001",                         // mandatory, format RF-NNN
  "title": "BLE connection hijackable via btlejack",  // mandatory
  "protocol": "BLE",                       // mandatory, one of the 15
  "layer": "AT",                           // mandatory, IG|SP|PHY|LL|CR|AT|AP
  "control": "RFSAM-BLE-AT-01",            // optional but recommended
  "severity": "high",                      // mandatory, info|low|medium|high|critical
  "cvss4": "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N",
  "status": "confirmed",                   // confirmed|hypothesis (auto per --allow-hypothesis)
  "evidence": "Got CONNECT_REQ ... AA 0x0a2f7b1d ...",  // mandatory unless hypothesis
  "impact": 4,                             // optional, axis of the Sec 7 model (1-4)
  "exploitability": 2,                     // optional, axis of the Sec 7 model (1-4)
  "exposure": 2,                           // optional, axis of the Sec 7 model (1-4)
  "scope_reach": "A",                      // optional, A|B|C|D (achieved|cage|hypothesis|defensive)
  "mitigation": {                          // optional, 3 layers (only those provided)
    "developer": "force LESC",
    "integrator": "rekey after commissioning",
    "operator": "rotate authorized pairs"
  },
  "notes": "handle 0x000E controls color; btlejack on micro:bit",  // optional
  "timestamp": "2026-06-19T13:45:00-05:00"  // auto, ISO 8601 with timezone
}
```

**Rules validated by `register_finding.py`**:
- `id` must match `^RF-\d{3}$`.
- `protocol` in the 15 IDs; `layer` in the 7; `severity` in the 5.
- `control` if provided must match `^RFSAM-<PROTO>-<LAYER>-\d{2}$`.
- `cvss4` if provided must start with `CVSS:4.0/`.
- `title` not empty.
- `impact`/`exploitability`/`exposure` if provided must be 1-4.
- `scope_reach` if provided must be A/B/C/D.
- **Evidence mandatory** unless `--allow-hypothesis` is passed (then `status=hypothesis`).

> The 4 axes (`impact`/`exploitability`/`exposure`/`scope_reach`) are optional but
> **recommended**: they operationalize the Sec 7 model and feed both the technical report and the
> executive summary with the severity justification. Mitigation is stored only for the
> layers that are provided.

## 2. Usage of `register_finding.py`

```bash
python3 scripts/register_finding.py \
  --id RF-001 \
  --protocol BLE \
  --layer AT \
  --control RFSAM-BLE-AT-01 \
  --severity critical \
  --cvss4 "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N" \
  --title "Uncrypted BLE connection hijackable" \
  --evidence-file loot/poc/RF-001.txt \
  --impact 4 --exploitability 2 --exposure 2 --scope-reach A \
  --mitigation-developer "force LESC; reject Just Works pairing" \
  --mitigation-operator "rotate pairs; monitor anomalous connections" \
  --notes "btlejack on micro:bit; handle 0x000E"
```

Flags:
- `--evidence "text"` inline evidence; `--evidence-file path` reads it from the file.
- `--allow-hypothesis` registers without a PoC (status `hypothesis`) - for findings to be verified.
- `--impact`/`--exploitability`/`--exposure` (1-4) and `--scope-reach` (A/B/C/D): the 4 axes of the Sec 7 model. Optional but recommended.
- `--mitigation-developer`/`--mitigation-integrator`/`--mitigation-operator`: the 3 remediation layers. Only the provided layers are saved.
- `--loot loot` alternative directory.

The script validates before writing; if it fails, it does not touch the JSONL and prints the errors.
Verify the logic with `python3 scripts/register_finding.py --self-test`.

## 3. Finding format in chat

**In addition** to the JSONL record, dump a readable block to chat for the user.
For `critical`/`high` that deserve a detailed write-up (description, impact, evidence,
safe reproduction, 3-layer mitigation), use the standalone document
`assets/finding-template.md`.

```
FINDING: [specific title]
Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO
Protocol/Layer: BLE / AT   Control: RFSAM-BLE-AT-01
Target: [device/scenario]
Description: what was found and why it matters
Evidence:
  COMMAND: [exact tool + flags]
  OUTPUT:  [snippet that confirms - AA, recovered key, 200 OK, etc.]
Impact: what an attacker can do
PoC: exact command to reproduce
Remediation: layers (developer/integrator/operator)
References: [CVE / paper / tool + URL]
CVSS 4.0: CVSS:4.0/AV:A/...  (score, severity)
```

## 4. RFSAM severity rubric - what evidence each level requires

| Severity | You must have evidence of | Forbidden |
|-----------|--------------------------|-----------|
| **CRITICAL** | Takeover / key recovery / spoofing reproduced with captured PoC | "It is vulnerable" without PoC |
| **HIGH** | Real cleartext data exposure, weak keys recovered, demonstrated hijack | Crypto hypothesis without capture |
| **MEDIUM** | Weakness requiring specific conditions to exploit | Anything already exploitable -> raise |
| **LOW** | Hardening gap / info disclosure not directly exploitable | What can be exploited -> raise |
| **INFO** | Observational (capture feasibility, identifier exposure, identifier leakage) | - |

**Mental checklist before registering**:
```
[ ] Do I have the exact capture/command output as evidence?
[ ] Does the severity reflect what I ACHIEVED, not what I could achieve?
[ ] Is the command reproducible (target, flags, parameters)?
[ ] Did I cite the source (CVE/paper/tool) or flag the uncertainty?
[ ] Did I map to an RFSAM-<PROTO>-<LAYER>-NN control?
If any answer is NO -> do not register yet. Get evidence.
```

## 5. CVSS 4.0 for RF - typical vectors

**Key**: RF is almost always **`AV:A` (Adjacent)** - the attacker must be within radio range,
not on the network (`AV:N`). Exception: rogue infrastructure that later exfiltrates over the network can escalate to
cascading impact `AV:N`, but the initial RF vector remains `AV:A`.

Recommended base vector for most RF findings:
`CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N`

| RF finding type | Vector | Typical severity |
|---------------------|--------|------------------|
| BLE hijack / baseband RCE | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | critical |
| Key recovery (crackle/KNOB/Crypto1) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | critical |
| Rogue cell / IMSI catcher (identity harvest) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N` | high |
| Cleartext traffic (BLE/Wi-Fi/Zigbee) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N` | high/medium |
| Fixed-code sub-GHz replay | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N` | high (door) / medium |
| RFID cloning / relay | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` | high |
| Advertising tracking / identifier leakage | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N` | medium/low |
| GNSS spoofing (conducted) | `CVSS:4.0/AV:A/AC:H/AT:P/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N` | (context-dependent) |
| WPS Pixie-Dust / PMKID | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | high |

CVSS 4.0 metrics: `AV` Attack Vector (N/A/L/P) - `AC` Attack Complexity (L/H) - `AT` Attack
Requirements (N/P) - `PR` Privileges Required (N/L/H) - `UI` User Interaction (N/P/A) -
`VC/VI/VA` Vulnerable System Confidentiality/Integrity/Availability - `SC/SI/SA` Subsequent System.

## 6. How to cite references

Every non-trivial claim **is cited or flagged**:
- **CVE**: `CVE-2019-9506 (KNOB) - https://nvd.nist.gov/vuln/detail/CVE-2019-9506`
- **Paper**: `Ryan, "Bluetooth: With Low Energy Comes Low Security", USENIX WOOT 2013 - https://...`
- **Tool**: `crackle (Mike Ryan) - https://github.com/mikeryan/crackle`
- **Spec/standard**: `Bluetooth Core Spec v5.4, Vol 6 Part B`

If you cannot verify a source -> flag inline:
```
> [!FLAG] Claim X - need to verify specific source before reporting
```

**Never claim what you cannot cite or demonstrate with evidence.** That is the foundational rule of RFSAM.

---

## 7. `rf-severity` - 4-axis model for classifying RF findings

Sec 4 gives the **reactive** rubric (what evidence each level requires). This section gives the **predictive** model: before
fixing the severity, the agent evaluates four axes specific to RF that do not appear in CVSS and that decide the level.

> Origin: model defined in `Sec 7` of this file. SKILL.md Sec SEVERITY AND CLASSIFICATION compresses this section to the
> 4-level table + the reference here; the full model lives in this section.

### 7.1 - The four axes

Each axis is scored 1 (low) to 4 (high). The final severity **is not** a linear average - it is the **Impact** axis
(ceiling) modulated by the other three. The agent traverses them in order: Impact first (sets the ceiling), then
Exploitability/Exposure/Scope lower or confirm it.

#### Axis 1 - Impact (severity ceiling)

| Score | What the attacker achieves | RF examples |
|---------|--------------------------|-------------|
| 4 | Takeover / key recovered / persistent spoofing | btlejack hijack, crackle pairing crack, MIFARE Crypto1 key dump, Zigbee NWK key from join, WPA PSK cracked |
| 3 | Sensitive data / device control / relay | cleartext traffic (BLE/Wi-Fi/Zigbee), RFID clone, NFC relay, sub-GHz door replay, unauthenticated GATT/HID |
| 2 | DoS / degradation / identity tracking | mass deauth, jamming (cage = demo), BLE advertising tracking, identifier leakage, frame-counter reset |
| 1 | Observational / info disclosure without direct exploitation | capture feasibility, visible SSID/BD_ADDR, old firmware without confirmed CVE, open channel |

Impact sets the **ceiling**: 4 never drops below `high`; 3 sets ceiling at `high` (can drop to `medium`); 2 sets `medium`; 1 sets
`low/info`.

#### Axis 2 - Exploitability (friction to reproduce)

| Score | Friction | RF examples |
|---------|----------|-------------|
| 4 | Trivial: common hardware, passive RX, no timing | SDR + Wireshark reads Zigbee in cleartext; rtl_433 decodes remote; BD_ADDR visible in advertising |
| 3 | Low: common hardware but needs timing or proximity | capture Wi-Fi 4-way handshake; BLE pairing (short window); passive NFC sniff |
| 2 | Medium: specialized hardware or active mode | Proxmark3 for MIFARE nested; btlejack (micro:bit); HackRF TX for sub-GHz replay; gps-sdr-sim |
| 1 | High: mandatory containment + license + rare hardware | srsRAN+Open5GS rogue BTS (cage+SIM+license); UWB DW3000-class; bladeRF+GPSDO reliable LTE demod |

Exploitability **raises** severity when it is 4 **and exposure is >=3** (impact 3 + exploitability 4 + exposure >=3 -> `high`),
and **lowers** it when it is 1 (impact 4 GNSS spoof in cage = `high`, not `critical` - demonstrated in
containment, not reproducible in the field).

#### Axis 3 - Exposure (affected surface)

| Score | Surface | RF examples |
|---------|------------|-------------|
| 4 | Public / massive infrastructure | GNSS spoofing, ADS-B forgery, rogue cell (all USIMs in cell), Zigbee NWK key (entire network) |
| 3 | One network / fleet / client infrastructure | Wi-Fi PSK (entire network), shared LoRa AppKey (all OTAA), Zigbee PAN without rekey |
| 2 | One link / one device | BLE pair of one device, individual RFID tag, sub-GHz remote for one door, UWB ranging of one asset |
| 1 | One identifier / metadata | persistent BD_ADDR, SSID broadcast, DevEUI, passive IMSI (without confirmed harvest) |

Exposure **raises** severity: impact 3 (RFID relay) with exposure 4 raises to `high`. Impact 4 with exposure 1
(one tag with unique non-recyclable keys) confirms `high` but not necessarily `critical`.

#### Axis 4 - Scope (achieved vs possible) - discrete

| Value | What is reported | Rule |
|-------|----------------|-------|
| **A - Achieved** | Demonstrated in the current mode with sufficient evidence (Sec 4 / SKILL.md Sec EVIDENCE). | Severity = the model's severity (axes 1-3). |
| **B - Demonstrated in containment** | Demonstrated in Lab with cage/conducted, not reproducible in the field. | Model severity, labeled `contained` in the finding; `critical` drops to `high`. |
| **C - Hypothetical (not achieved in this mode)** | Viable but not executed (observational, absent hardware, Route A). | **Maximum `medium`**, `status: hypothesis`, partial evidence. Never `high`/`critical` without PoC. |
| **D - Defensive (detection, not exploitation)** | Defensive mode: a threat was detected, not exploited. | Severity = impact of the threat, but type `detection`; the report describes what was detected. |

Scope **lowers** severity when it is C or D, and **labels** it when it is B. It never raises it. It formalizes the rule
"severity reflects what I ACHIEVED" (SKILL.md Sec SEVERITY, checklist item 2).

### 7.2 - Decision table (Impact x modulators -> severity)

Starts from Impact (ceiling) and applies Exploitability/Exposure as modulators, then Scope as final cap.
Find your row by (Impact, Exploitability, Exposure) and read the column according to Scope.

| Impact | Exploitability | Exposure | Base (A) | Contained (B) | Hypothesis (C) | Detection (D) |
|---------|-----------------|------------|----------|----------------|----------------|----------------|
| 4 | 3-4 | 2-4 | **critical** | **high** (contained) | **medium** (hypothesis) | medium (detection) |
| 4 | 1-2 | 2-4 | **high** | **high** (contained) | **medium** (hypothesis) | medium (detection) |
| 4 | 3-4 | 1 | **high** | high (contained) | medium (hypothesis) | low (detection) |
| 3 | 3-4 | 3-4 | **high** | high (contained) | medium (hypothesis) | medium (detection) |
| 3 | 1-2 | 3-4 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 3 | 3-4 | 1-2 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 3 | 1-2 | 1-2 | **medium/low** | low (contained) | low (hypothesis) | low (detection) |
| 2 | 3-4 | 3-4 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 2 | 1-2 | 1-4 | **low** | low (contained) | low (hypothesis) | low (detection) |
| 1 | 1-4 | 1-4 | **info** | info (contained) | info (hypothesis) | info (detection) |

The "medium/low" cells require judgment: impact 3 with a low-sensitivity data leak -> `low`; with a credential -> `medium`.

### 7.3 - Golden rules encoded by the table

1. **Without a PoC (Scope C) the maximum is `medium`.** A hypothetical finding is never `high`/`critical` in the report,
   regardless of theoretical impact.
2. **`critical` requires Impact 4 + Exploitability >=3 + Exposure >=2 + Scope A.** Confirmed takeover/key recovery
   in the field (not cage) with achievable hardware. The cage drops it to `high` (contained).
3. **Public infrastructure (Exposure 4) raises one level if impact is 2-3.** GNSS jamming (impact 2, DoS) with
   exposure 4 raises to `medium` even if exploitability is 1 (needs cage) - systemic risk matters even if
   the demo is contained. Only applies if Scope A or B; in hypothesis it stays `medium`.
4. **Defensive mode (Scope D) never reports `critical`.** Detection is not exploitation. The `critical` of the detected
   threat is documented in `notes` (context for the client), not in `severity`.
5. **`info` is observational only (Impact 1).** Any finding with impact 2+ cannot be `info`.

### 7.4 - Integration with evidence sufficiency (Sec 4 + SKILL.md Sec EVIDENCE)

The Sec 7.2 model produces the severity; Sec 4 / SKILL.md Sec EVIDENCE verify that the evidence supports that severity.
If it does not, they mandate a downgrade:

```
finding -> axes 1-4 -> model severity -> sufficient evidence?
  |-- yes -> severity confirmed, status=confirmed
  `-- no  -> downgrade one level, evidence_status=partial
```

No severity without evidence to back it.

### 7.5 - Mapping to CVSS 4.0

CVSS 4.0 (Sec 5) remains the **external vector** of the finding (technical report, client). The 4-axis model is the
**internal decision**. Mapping:

| Model axis | CVSS 4.0 metric | Note |
|----------------|------------------|------|
| Impact | `VC`/`VI`/`VA` (Vulnerable) + `SC`/`SI`/`SA` (Subsequent) | Impact 4 -> VC:H/VI:H; impact 2 (DoS) -> VA:H |
| Exploitability | `AC` (L/H) + `AT` (N/P) + `PR` | Exploitability 1 -> AC:H/AT:P; exploitability 4 -> AC:L/AT:N |
| Exposure | (no direct metric) | CVSS does not capture how many devices are affected; the agent notes it in `notes` |
| Scope | (no metric; reflects the mode) | Scope C -> status=hypothesis, does not affect the vector; Scope B -> `contained` note in `notes` |

The Exposure column is the key difference: CVSS does not capture it, the RF model does.

### 7.6 - Worked examples

| # | Finding | Impact | Exploitab. | Expos. | Scope | Severity | CVSS |
|---|---------|---------|-----------|--------|---------|-----------|------|
| E1 | btlejack BLE hijack confirmed in the field on own device | 4 | 2 (micro:bit) | 2 (one device) | A | **high** | AV:A/AC:L/VC:H/VI:H |
| E2 | MIFARE Classic key dump + clone confirmed | 4 | 2 (PM3) | 2 (one tag) | A | **high** | AV:A/AC:L/VC:H/VI:H |
| E3 | Wi-Fi WPA2 handshake cracked, PSK recovered | 4 | 3 (wait for handshake) | 3 (entire network) | A | **critical** | AV:A/AC:L/VC:H/VI:H |
| E4 | GNSS spoofing demonstrated in cage with gps-sdr-sim | 4 | 1 (cage+license) | 4 (public infra) | B | **high** (contained) | AV:A/AC:H/VA:H |
| E5 | srsRAN rogue cell in cage with test SIM | 3 (theoretical identity harvest) | 1 | 4 | B | **high** (contained) | AV:A/AC:H/VC:L |
| E6 | Zigbee cleartext traffic read with SDR+Wireshark | 3 | 4 (passive RX) | 3 (network) | A | **high** | AV:A/AC:L/VC:H |
| E7 | sub-GHz door replay with rfcat (fixed, no rolling code) | 3 | 4 | 2 (one door) | A | **high** | AV:A/AC:L/VC:L/VI:L |
| E8 | BLE advertising tracking (persistent BD_ADDR) | 2 | 4 | 1 | A | **medium** | AV:A/AC:L/VC:L |
| E9 | RFID relay demonstrated without keys (Proxmark MITM) | 3 | 2 | 2 | A | **medium** | AV:A/AC:L/VC:H/VI:L |
| E10 | Mass Wi-Fi deauth on own network in active mode | 2 | 4 | 3 | A | **medium** | AV:A/AC:L/VA:H |
| E11 | Sub-GHz replay viable but hardware absent (Route A) | 3 | 4 | 2 | C | **medium** (hypothesis) | n/a (no PoC) |
| E12 | Crocodile Hunter detects IMSI catcher in operator's environment | 3 (detected threat) | n/a | 4 | D | **medium** (detection) | n/a (detection) |
| E13 | Old BLE firmware without confirmed CVE | 1 | 4 | 1 | A | **info** | n/a |

### 7.7 - Prioritization for report and remediation

The severity produced by the model is the prioritization: the technical report and the remediation list are ordered
descending (critical -> high -> medium -> low -> info). Within the same level, Exposure breaks ties (larger surface
first) and then Exploitability (more reproducible first).

**Operational exception - Defensive mode:** an **active detected threat** (Scope D) tops the report even if
its technical severity is `medium` - the operational urgency (ongoing threat in the defended environment) supersedes
technical severity when there is active intrusion. Confirmed offensive findings (`critical`/`high`) still
top the report if they coexist with detections in the same report.

**Remediation rule (see `references/03-finding-registration.md Sec 7.7`):** `critical`/`high` require all 3 layers
(Developer/Integrator/Operator); `medium` requires at least Integrator + Operator; `low`/`info` can close with
Operator alone.
