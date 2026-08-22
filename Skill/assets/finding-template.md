# RF Finding Template - {{RF-NNN}}

> **Standalone document per finding.** Use it for `critical`/`high` that deserve a
> detailed write-up beyond the report section (see `assets/report-template.md Sec 4`).
> The compact chat block lives in `references/03-finding-registration.md Sec 3`; the
> complete 4-axis model (decision table, worked examples) is in `Sec 7` of the same
> file.

**ID**: {{RF-NNN}}
**Title**: {{specific finding title}}
**Protocol/Layer**: {{BLE / AT}} - **RFSAM control**: `{{RFSAM-BLE-AT-01}}`
**Severity**: {{CRITICAL / HIGH / MEDIUM / LOW / INFO}} - **Status**: {{confirmed / hypothesis}}
**Date**: {{ISO}}

---

## RFSAM 4-axis model

> Walk through the axes in order (Impact sets the ceiling; the others modulate it).
> Decision table: `references/03-finding-registration.md Sec 7.2`.

| Axis | Value | Justification (1 line) |
|------|-------|------------------------|
| **Impact** (1-4) | {{4}} | {{takeover / key recovered / plaintext data / DoS / observational}} |
| **Exploitability** (1-4) | {{2}} | {{required hardware + friction to reproduce}} |
| **Exposure** (1-4) | {{2}} | {{single device / single network / public infrastructure}} |
| **Scope** (A/B/C/D) | {{A}} | {{achieved in the field / demonstrated in a cage (B) / hypothetical (C) / defensive (D)}} |

**CVSS 4.0**: `{{CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N}}` ({{score}}, {{sev}})

---

## Description

{{What was found, the technical mechanism and why it matters. Name the device/scenario,
the protocol and the descent layer where it was detected. Cite the underlying vulnerability
(CVE / weakened spec / misconfiguration) with a verifiable source. A non-trivial claim
without a source is flagged (see `references/03-finding-registration.md Sec 6`).}}

---

## Impact

{{What a real attacker gains in the field: takeover, credential theft, replay, DoS,
identity tracking. Connect to the Impact axis above. If Scope is B/C/D, clarify what
was demonstrated vs what remains hypothetical - the severity reflects what you ACHIEVED,
not what could theoretically be achieved.}}

---

## Evidence

```
COMMAND: {{exact tool + flags - verbatim}}
OUTPUT:  {{excerpt that confirms the finding - AA, recovered key, 200 OK, decoded frame, ...}}
```

> Raw capture in `loot/captures/{{PROTO}}-{{phase}}-{{NN}}-{{timestamp}}.{{ext}}`.
> The minimum evidence depends on severity - see `SKILL.md Sec REPRODUCIBLE EVIDENCE`.

---

## Safe reproduction

> Each `poc/{{RF-NNN}}/` includes a `repro.txt`. **Without `repro.txt`, the finding is a
> hypothesis, not a confirmed finding** - it does not enter the report as confirmed.

```
TARGET:     {{exact device/scenario}}
HARDWARE:   {{SDR / sniffer + version}}
SOFTWARE:   {{tool + version - OS}}
COMMAND:    {{verbatim - flags, parameters, frequency, sample rate, gain, channel}}
CONDITIONS: {{proximity - mode (observational/active/lab) - containment if applicable}}
RESULT:     {{expected observable output that confirms}}
```

> [!] **Safety markers**: if the command involves transmission (`[!]TX`), re-confirm
> authorization in `loot/scope.txt` before executing (see the gate in `SKILL.md`). If it
> is passive RX, verify the tool's RX marker (`references/25-troubleshooting.md Sec 1`).
> Critical infrastructure (GNSS / ADS-B / rogue cell) requires containment
> (cage/conductive enclosure) even in active mode.

---

## Mitigation (3 layers)

> RFSAM remediation model - inherited from the 50 controls. `critical`/`high` require all 3
> layers; `low`/`info` may close with Operator alone. `medium` requires at least Integrator + Operator. See `references/03-finding-registration.md Sec 7`.

- **Developer** (manufacturer / firmware): {{product code or configuration changes -
  e.g. enforce ECDH, rotate NWK key, encrypt GATT, implement robust rolling code}}
- **Integrator** (deployment / configuration): {{deployment changes - e.g. rekey after
  commissioning, disable legacy pairing, segment PAN, require LESC}}
- **Operator** (use / monitoring): {{operational changes - e.g. monitor anomalous
  advertising, rotate credentials periodically, periodic audits, register only
  authorized tags}}

---

## References

- {{CVE-XXXX-XXXX - https://...}}
- {{Paper: Author, "Title", venue year - https://...}}
- {{Tool: name - https://github.com/...}}
- {{Spec: Bluetooth Core Spec v5.4, Vol 6 Part B}}

---

_Generated with RFSAM (CC BY-SA 4.0). Reproducible evidence in `loot/`. Re-validate after
applying remediation._
