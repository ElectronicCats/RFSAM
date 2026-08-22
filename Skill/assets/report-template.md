# RF Security Audit Technical Report - {{TARGET}}

> Template for the **technical report** of an RFSAM audit. `scripts/scaffold_report.py`
> generates the skeleton from `loot/rfsam_findings.jsonl`; the agent completes the
> analysis, impact and remediation. Replace the `{{...}}` placeholders. The **executive
> summary** (non-technical audience) is a separate document - see
> `assets/executive-summary-template.md`.

**Date**: {{ISO}}
**Auditor**: {{name/role}}
**Client/Owner**: {{client}}
**Methodology**: RFSAM (Radio Frequency Security Assessment Methodology) - Electronic Cats
**Complementary framework**: OSSTMM, BSAM (Tarlogic), SDR-pentest lineage
**Content license**: CC BY-SA 4.0
**Report classification**: {{Confidential / Public / Internal}}

---

## 1. Technical summary

- **Total findings**: {{N}} (Critical: {{c}} - High: {{h}} - Medium: {{m}} - Low: {{l}} - Info: {{o}})
- **Confirmed**: {{nc}} - **Hypotheses (no `repro.txt`)**: {{nh}} - _hypotheses do not count as confirmed findings._
- **Audited protocols**: {{BLE, Wi-Fi, ...}}
- **RFSAM control coverage**: {{X/Y}} (see Sec 5)
- **Mode of operation**: {{observational / active / lab-contained / defensive}}

> Technical synthesis (2-4 lines): what was audited, surface covered, technical residual
> risk. The **business** synthesis goes in the executive summary, not here.

---

## 2. Scope and authorization

```
Target: {{description of the device/system/signal}}
Owner / authorization: {{OWN / CONTRACT <ref> / LAB}}
Mode of operation: {{observational / active / lab-contained / defensive}}
Authorized by: {{name/role of authorizing party}}
Authorization date: {{ISO}}
Protocol(s) in scope: {{BLE / WIFI / ...}}
Limitations: {{e.g. RX only; no deauth; do not clone real credentials; capture window X MHz}}
Capture retention: {{default 30 days post-delivery; purge requested: yes/no}}
```

> The mode of operation constrained the techniques executed. Attack-layer steps were
> performed only where the scope permitted; the rest are documented as verifiable
> hypotheses in an authorized environment. Any third-party PII (IMSI/IMEI, persistent BLE
> address, probe SSIDs, foreign RFID UID) is masked/hashed in this report; only audited
> asset identifiers appear in cleartext.

---

## 3. Methodology

Audit following the **RFSAM 7-layer descent** (IG -> SP -> PHY+LL -> CR -> AT -> AP) per
protocol. PHY and LL are assessed together (the same tool produces both). Each finding is
mapped to a control `RFSAM-<PROTO>-<LAYER>-NN` and scored with the **RFSAM 4-axis model**
(Impact, Exploitability, Exposure, Scope A/B/C/D) consolidated into CVSS 4.0 - see
`references/03-finding-registration.md Sec 7`. In RF almost always `AV:A` (adjacent, radio range).

| Layer | What was verified |
|-------|-------------------|
| IG | SoC/host stack identification + cross-reference with published CVEs |
| SP | Capture feasibility (band vs radio IBW) |
| PHY+LL | Demodulation -> bits; frame capture -> Wireshark |
| CR | Cryptography assessment / weak key recovery |
| AT | Takeover (only where scope authorized it) |
| AP | What the device trusts over the link |

For Bluetooth (BLE/Classic) at the link layer and above, RFSAM defers to **BSAM** and
contributes only the RF capture prerequisite. For LoRa/LTE/RFID/Sub-GHz/etc., RFSAM owns
the assessment end-to-end.

---

## 4. Findings

> Sorted by severity (Critical -> Info). Each **confirmed** finding includes a
> `repro.txt` in `loot/poc/RF-NNN/`; without `repro.txt` it is registered as a hypothesis,
> not as confirmed.

### 4.1 CRITICAL

#### {{RF-001}} - {{title}}
- **Protocol/Layer**: {{BLE / AT}} - **Control**: `RFSAM-BLE-AT-01`
- **Severity**: CRITICAL
- **RFSAM model**: Impact {{1-4}}/4 - Exploitability {{1-4}}/4 - Exposure {{1-4}}/4 - Scope {{A/B/C/D}}
- **CVSS 4.0**: `{{vector}}` ({{score}}, {{sev}})
- **Description**: {{what was found, mechanism, why it matters}}
- **Evidence**:
  ```
  COMMAND: {{exact tool + flags}}
  OUTPUT:  {{excerpt that confirms}}
  ```
- **Reproduction**: `loot/poc/RF-001/repro.txt` (verbatim command + environment + capture conditions)
- **Impact**: {{what an attacker can do}}
- **Mitigation** (3 layers):
  - _Developer_: {{...}}
  - _Integrator_: {{...}}
  - _Operator_: {{...}}
- **References**: {{CVE / paper / tool + URL}}

### 4.2 HIGH
{{...}}

### 4.3 MEDIUM
{{...}}

### 4.4 LOW
{{...}}

### 4.5 INFO (includes defensive findings / detection)
{{...}}

---

## 5. RFSAM control coverage

> Paste the output of `python3 scripts/coverage_check.py` here.

{{table per protocol: covered / pending / not applicable controls}}

---

## 6. Limitations

- **Visibility gaps**: {{radio/IBW used; what could not be observed and why}}
- **Out-of-scope controls**: {{e.g. AT not executed due to observational mode}}
- **Assumptions**: {{e.g. join not captured because the device did not re-pair during the window}}
- **Declared strong crypto not breakable**: {{e.g. LESC ECDH on this device -> CR assesses, does not decrypt}}

---

## 7. Prioritized remediation

| Priority | Finding | Action | Responsible layer | Effort | Deadline |
|----------|---------|--------|-------------------|--------|----------|
| 1 | {{RF-001}} | {{concrete action}} | {{Developer/Integrator/Operator}} | {{low/med/high}} | {{immediate/30d/90d}} |
| 2 | {{...}} | {{...}} | {{...}} | {{...}} | {{...}} |

> `critical`/`high` require all 3 layers (Developer/Integrator/Operator); `medium` requires Integrator
> + Operator; `low`/`info` may close with Operator alone.

---

## 8. Appendices

- **A. Captures**: PCAPs, IQ waterfalls, Proxmark dumps (in `loot/captures/`)
- **B. PoC**: `loot/poc/RF-NNN/` with `repro.txt` per confirmed finding
- **C. Session logs**: `loot/session_state.json`, `loot/rfsam_findings.jsonl`, `loot/hardware.txt`
- **D. References**: full list of CVEs, papers, tools with URLs
- **E. Kit used**: radios/sniffers/software + version (paste `loot/hardware.txt`)

---

_End of technical report. Generated following RFSAM (CC BY-SA 4.0). Reproducible evidence
available in `loot/`. Re-validation recommended after applying remediation. For the
non-technical executive version, see `assets/executive-summary-template.md`._
