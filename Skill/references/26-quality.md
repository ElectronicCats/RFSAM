# 26 - Quality: verify before reporting

> Cross-cutting quality gate. Applies at any layer of the descent, **before registering** a finding AND
> **before closing** the report. A claim that does not pass these rules is a **hypothesis**, not a confirmed
> finding. Source: Sec 1 (rules Q1-Q8), Sec 2 (criticality), Sec 5 (internal consistency / `scripts/register_finding.py`).

## Index

1. Sec rules - 8 mandatory verification rules (Q1-Q8)
2. Sec criticality - honest severity rubric
3. Sec lifecycle - draft vs verified (verification is a separate pass)
4. Sec pre-registration - checklist before writing to the JSONL
5. Sec cross-refs - internal consistency (coverage_check.py model)

---

## 1. Sec rules - 8 mandatory verification rules

Before registering a finding or including it in the report, each rule must pass. If one fails -> do not register
yet (obtain evidence, cite a source, degrade severity, or declare a gap). SKILL.md Sec QUALITY contains the quick
version; this table is the authoritative source.

| # | Rule | What to verify | If it fails |
|---|------|----------------|-------------|
| **Q1** | **Cite or flag** | Each non-trivial claim maps to a resolvable source (CVE on NVD, real paper/URL, tool catalog slug) or carries an inline `> [!FLAG] ...` | Do not register until cited or explicitly flagged |
| **Q2** | **Verbatim commands** | Wayfinder command strings are copied exactly (flags, parameters, war-story values). Do not paraphrase, "complete," or invent | Replace with the wayfinder verbatim; if none exists, flag |
| **Q3** | **Honest criticality** | Observational/feasibility = `info`/`low`; takeover / key recovery / impersonation = `high`/`critical`. Severity reflects what is **achieved** in this mode, not the theoretical | Degrade severity to the level the evidence supports |
| **Q4** | **BSAM deference** | BLE/BTC at LL+ -> cite BSAM (cross-ref `BSAM-xx`), describe **only** the RF capture prerequisite. Do not re-derive BSAM content | Rewrite as deference; remove duplicated BSAM content |
| **Q5** | **Authorized framing** | Every TX / replay / decrypt / rogue step carries a note of own equipment, test SIM/device, containment, explicit permission | Add the framing or degrade to hypothesis (do not execute TX without it) |
| **Q6** | **Sufficient evidence** | Command + parameters + tool+version + reproducible capture conditions (`repro.txt`). See sufficiency table by severity in SKILL.md Sec REPRODUCIBLE EVIDENCE | Degrade severity and mark `evidence_status: partial`; without `repro.txt` = hypothesis |
| **Q7** | **No dedicated control -> layer note** | If there is no mappable `RFSAM-<PROTO>-<LAYER>-NN` control, **do not omit** the finding: register with `control: null` and `notes` indicating the approximate layer | Add a layer note; do not omit |
| **Q8** | **Cross-refs resolve** | Every `control` ID, `RFSAM-RES-NN`, tool slug, and reference path cited in the report exists in the skill. Model: `coverage_check.py` (id<->protocol<->layer, every ref resolves, valid enums) - see Sec cross-refs | Fix the ref or mark as unverified |

> **Q1-Q8 are mandatory** for `critical`/`high`. `medium` may register with partial Q6
> (`evidence_status: partial`). `low`/`info` may close with minimal Q1+Q2+Q6. **Exception - Defensive mode**
> (Scope D): never reports `critical`; its ceiling is `medium` (type `detection`).

---

## 2. Sec criticality - honest severity rubric

Source: `Sec 2` of this file. Severity is set by the 4-axis model of SKILL.md Sec FINDING SEVERITY AND
CLASSIFICATION; this rubric is the sanity check that the assigned severity is honest with the evidence:

| Level | Honest definition | Common abuse to avoid |
|-------|-------------------|-----------------------|
| **info** | Observational; no direct impact (capture feasibility, identifier exposure) | Reporting a successful capture as if it were a vulnerability |
| **low** | Minor exposure or hardening gap without practical exploit | "Old firmware" without a confirmed CVE as `high` |
| **medium** | Weakness requiring specific conditions; hypothesis with a ceiling (Scope C); defensive detection (D) | Hypothesis without PoC as `high`; detections as `critical` |
| **high** | Exploitable weakness with significant impact; cleartext data; critical infrastructure **in a cage** (B) | Contained (cage) assets as `critical` without the `contained` label |
| **critical** | Full compromise (takeover, key recovery, impersonation) with practical preconditions **AND** a field PoC (A) | Without PoC (C) as `critical`; contained (B) as `critical` without `contained` |

**Golden rules:**

- Without PoC (Scope C) -> maximum `medium`.
- Contained / cage (B) -> `critical` drops to `high` with the `contained` label.
- Defensive (D) -> ceiling `medium`, type `detection`, no `critical`.
- The **Impact** axis sets the ceiling; Exploitability / Exposure / Scope **only modulate downward**, never upward.
- "Not observed" under a finite window is a **visibility gap**, not evidence of absence - but "observed" can also
  be a **false positive** if the base capture is corrupt (overflows != 0) or the decoder does not match
  (see `references/25-troubleshooting.md` Sec false-positives). Verify both extremes before setting severity.

---

## 3. Sec lifecycle - draft vs verified

Principle from `Sec 3` of this file, adapted to the auditing agent:

- **During the descent**, the agent produces findings in **draft** state: researched, with evidence, may carry
  `[!FLAG]`s where uncertainty remains. This is legitimate and is registered in the JSONL.
- **Before the report**, a verification pass (the same agent in Phase 7 / Close, or a separate reviewer)
  must **resolve every flag** and **confirm every citation**. A finding with unresolved flags enters the report as
  a **hypothesis / observation**, not as confirmed.
- **`confidence`** (`low` / `medium` / `high`) is the honest self-assessment of the finding. Do not inflate it: if
  the evidence is indirect or the tool is inconclusive, `low` / `medium` is correct.

> A sub-agent (or a quick pass of the descent) produces `draft`. Verification is a **separate** pass that
> elevates to `verified`. Do not report as `verified` what you only glanced over.

---

## 4. Sec pre-registration - checklist before writing to the JSONL

Before running `scripts/register_finding.py` (or writing by hand to `rfsam_findings.jsonl`):

```
[ ] Exact capture/command output as evidence                              (Q2, Q6)
[ ] Severity reflects what was ACHIEVED in this mode, not the theoretical (Q3)
[ ] Reproducible command (target, flags, parameters) -> poc/RF-NNN/repro.txt   (Q6)
[ ] Source cited (CVE/paper/tool) or uncertainty flagged ([!FLAG])        (Q1)
[ ] Control RFSAM-<PROTO>-<LAYER>-NN mapped, or layer note if no dedicated control   (Q7)
[ ] If TX: authorized framing present (own equipment, containment, permission)   (Q5)
[ ] If BLE/BTC LL+: BSAM deference applied, not re-derived               (Q4)
```

If any item is NO -> **do not register yet**; obtain evidence, cite, degrade severity, or declare a gap. The
**pre-close** checklist (per session) lives in SKILL.md Sec AUDIT CLOSURE - it is not duplicated here.

---

## 5. Sec cross-refs - internal consistency (coverage_check.py model)

Model applied to the report the skill generates (see `scripts/register_finding.py` for the validated enums
and the control regex). Before delivering, verify:

- **ID <-> protocol <-> layer**: every cited `RFSAM-<PROTO>-<LAYER>-NN` has consistent segments
  (PROTOCOL in the 15 canonical: BLE/WIFI/LORA/LTE/RFID/SUBG/ZIGBEE/ZWAVE/THREAD/GNSS/ADSB/NR5G/GSM/UWB/BTC;
  LAYER in IG/SP/PHY/LL/CR/AT/AP).
- **Every reference resolves**: every `control`, `RFSAM-RES-NN`, tool slug, and reference path cited in the
  report exists in the skill (in `references/`, `assets/`, or the wayfinder tool catalog).
- **Valid enums**: severity in critical/high/medium/low/info; `scope_reach` in A/B/C/D; `mode` in
  observational/active/lab/defensive.
- **No empty fields on critical findings**: a `critical`/`high` without `repro.txt`, without a mapped control (or
  layer note), or without mitigation across the 3 layers (Developer/Integrator/Operator) is an **incomplete**
  finding, not confirmed.

> If a cross-ref does not resolve, **do not invent it**: mark the finding as `confidence: low` with
> `[!FLAG] unresolved ref`, or remove it. An invented URL violates Q1 (cite or flag).

---

## 6. Mapping to downstream phases

- **SKILL.md Sec QUALITY** cites Sec rules as the quick gate (the 10 inline rules are the compact version; Q1-Q8 is the
  authoritative source).
- **SKILL.md Sec FINDING SEVERITY "Before registering"** delegates to Sec pre-registration (does not duplicate the checklist).
- **SKILL.md Sec AUDIT CLOSURE** maintains its own per-session checklist (pre-close); Sec cross-refs expands what
  "verify cross-refs" means in practice.
- **Phase 7.1 (validation):** the validation checklist confirms that every finding in the JSONL passed Q1-Q8 and
  that the report's cross-refs resolve.
