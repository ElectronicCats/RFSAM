#!/usr/bin/env python3
"""scaffold_report.py — Generates the skeleton of an RFSAM audit report.

Reads `loot/rfsam_findings.jsonl` (and optionally `loot/scope.txt`,
`loot/session_state.json`) and produces a Markdown report sorted by severity
and grouped by protocol/layer. The body is populated with the findings; the
agent completes the analysis and remediation.

Usage:
  scaffold_report.py                       # writes rfsam-report-<date>.md in cwd
  scaffold_report.py --target "lock"       # target name in the title
  scaffold_report.py --loot loot --out report.md
"""
import argparse
import datetime
import json
import os
import sys

SEV_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
LAYER_ORDER = ["IG", "SP", "PHY", "LL", "CR", "AT", "AP"]


def load_jsonl(path: str) -> list[dict]:
    if not os.path.isfile(path):
        return []
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return out


def read_scope(loot_dir: str) -> str:
    for name in ("scope.txt", "SCOPE.txt"):
        p = os.path.join(loot_dir, name)
        if os.path.isfile(p):
            with open(p, encoding="utf-8", errors="replace") as fh:
                return fh.read().strip()
    return ""


def render(scope: str, findings: list[dict], target: str) -> str:
    date = datetime.date.today().isoformat()
    title = target or "RF target"
    findings_sorted = sorted(
        findings,
        key=lambda f: (SEV_ORDER.get(f.get("severity", "info"), 9),
                       f.get("protocol", ""), LAYER_ORDER.index(f.get("layer", "IG"))
                       if f.get("layer") in LAYER_ORDER else 99, f.get("id", "")),
    )
    by_sev: dict[str, int] = {}
    for f in findings_sorted:
        by_sev[f.get("severity", "info")] = by_sev.get(f.get("severity", "info"), 0) + 1

    lines = []
    lines.append(f"# RF Security Audit Technical Report — {title}")
    lines.append("")
    lines.append(f"**Date**: {date}  ")
    lines.append("**Methodology**: RFSAM (Radio Frequency Security Assessment Methodology)  ")
    lines.append("**Complementary framework**: OSSTMM, BSAM, SDR-pentest lineage  ")
    lines.append("**Content license**: CC BY-SA 4.0")
    lines.append("")

    lines.append("## 1. Technical summary")
    lines.append("")
    lines.append(f"- **Total findings**: {len(findings_sorted)}")
    for sev in ("critical", "high", "medium", "low", "info"):
        if sev in by_sev:
            lines.append(f"- **{sev.upper()}**: {by_sev[sev]}")
    n_confirmed = sum(1 for f in findings_sorted if f.get("status") != "hypothesis")
    n_hyp = sum(1 for f in findings_sorted if f.get("status") == "hypothesis")
    lines.append(f"- **Confirmed**: {n_confirmed} · **Hypotheses (no PoC)**: {n_hyp}")
    lines.append("")
    lines.append("> _The agent completes the executive synthesis here: business impact, "
                 "residual risk and remediation priorities._")
    lines.append("")

    lines.append("## 2. Scope and authorization")
    lines.append("")
    if scope:
        lines.append("```")
        lines.append(scope)
        lines.append("```")
    else:
        lines.append("> _Document the target, owner/authorization, mode (observational/active/lab/defensive) "
                     "and protocols in scope._")
    lines.append("")

    lines.append("## 3. Methodology")
    lines.append("")
    lines.append("Audit following the RFSAM 7-layer descent (IG → SP → PHY+LL → CR → AT → AP) "
                 "per protocol. Each finding is mapped to a control `RFSAM-<PROTO>-<LAYER>-NN` "
                 "and scored with the 4-axis model consolidated into CVSS 4.0 (in RF typically "
                 "`AV:A` — adjacent, radio range).")
    lines.append("")

    lines.append("## 4. Findings")
    lines.append("")
    if not findings_sorted:
        lines.append("_No findings registered in `loot/rfsam_findings.jsonl`._")
        lines.append("")
    for f in findings_sorted:
        sev = f.get("severity", "info").upper()
        proto = f.get("protocol", "?")
        layer = f.get("layer", "?")
        control = f.get("control") or "—"
        cvss = f.get("cvss4") or "—"
        status_tag = " (HYPOTHESIS)" if f.get("status") == "hypothesis" else ""
        lines.append(f"### {f.get('id','?')} · {sev}{status_tag} — {f.get('title','(untitled)')}")
        lines.append("")
        lines.append(f"- **Protocol/Layer**: {proto} / {layer}")
        lines.append(f"- **RFSAM control**: `{control}`")
        # 4-axis model (if provided — references/03-finding-registration.md §7)
        axes = []
        for key, label in (("impact", "Impact"), ("exploitability", "Exploitability"),
                           ("exposure", "Exposure")):
            if f.get(key) is not None:
                axes.append(f"{label} {f[key]}/4")
        if f.get("scope_reach"):
            axes.append(f"Scope {f['scope_reach']}")
        if axes:
            lines.append(f"- **RFSAM model**: {' · '.join(axes)}")
        lines.append(f"- **CVSS 4.0**: `{cvss}`")
        ev = (f.get("evidence") or "").strip()
        if ev:
            lines.append("- **Evidence**:")
            lines.append("")
            lines.append("```")
            lines.append(ev)
            lines.append("```")
        else:
            lines.append("- **Evidence**: _to be attached_")
        # 3-layer mitigation (if provided)
        mit = f.get("mitigation") or {}
        has_mit = isinstance(mit, dict) and bool(mit)
        if has_mit:
            lines.append("- **Mitigation**:")
            for layer_key, label in (("developer", "Developer"),
                                     ("integrator", "Integrator"),
                                     ("operator", "Operator")):
                if mit.get(layer_key):
                    lines.append(f"  - _{label}_: {mit[layer_key]}")
        if f.get("notes"):
            lines.append(f"- **Notes**: {f['notes']}")
        lines.append("")
        lines.append("> _The agent completes: description, impact, reproducible PoC and "
                     "remediation (developer / integrator / operator)._")
        lines.append("")

    lines.append("## 5. Control coverage")
    lines.append("")
    lines.append("> Run `python3 scripts/coverage_check.py` and paste here the summary of "
                 "covered vs pending controls per protocol.")
    lines.append("")

    lines.append("## 6. Limitations")
    lines.append("")
    lines.append("> _Document visibility gaps (radio/IBW), out-of-scope controls, "
                 "and assumptions (e.g. could not capture the join because the device did not re-pair)._")
    lines.append("")

    lines.append("## 7. Prioritized remediation")
    lines.append("")
    lines.append("| Priority | Finding | Action | Responsible layer | Effort | Deadline |")
    lines.append("|----------|---------|--------|-------------------|--------|----------|")
    # One row per confirmed finding, sorted by severity (same as §4).
    # Action = first available mitigation layer (developer > integrator > operator);
    # Responsible layer = list of layers with content; Effort/Deadline are filled in by the agent.
    prio = 0
    for f in findings_sorted:
        if f.get("status") == "hypothesis":
            continue  # hypotheses do not enter the remediation plan
        prio += 1
        mit = f.get("mitigation") or {}
        action = (mit.get("developer") or mit.get("integrator")
                  or mit.get("operator") or "_TBD_")
        layers = [lbl for k, lbl in (("developer", "Developer"),
                                     ("integrator", "Integrator"),
                                     ("operator", "Operator")) if mit.get(k)]
        resp = ", ".join(layers) if layers else "_unassigned_"
        effort = "_{low/med/high}_"
        deadline = "_{immediate/30d/90d}_"
        lines.append(f"| {prio} | {f.get('id','?')} | {action} | {resp} | {effort} | {deadline} |")
    if prio == 0:
        lines.append("| _—_ | _no confirmed findings_ | _—_ | _—_ | _—_ | _—_ |")
    lines.append("")
    lines.append("> `critical`/`high` require all 3 layers (Developer/Integrator/Operator); "
                 "`medium` requires Integrator + Operator; `low`/`info` may close with Operator alone.")
    lines.append("")

    lines.append("## 8. Appendices")
    lines.append("")
    lines.append("- PCAP captures, waterfalls, Proxmark dumps, session logs (`loot/`).")
    lines.append("- References: CVEs, papers, tools with URLs.")
    lines.append("")
    return "\n".join(lines)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Generates an RFSAM audit report from the JSONL")
    p.add_argument("--target", help="Target name for the title")
    p.add_argument("--loot", default="loot", help="loot/ directory")
    p.add_argument("--out", help="Output file (default rfsam-report-<date>.md)")
    args = p.parse_args(argv)

    findings = load_jsonl(os.path.join(args.loot, "rfsam_findings.jsonl"))
    scope = read_scope(args.loot)
    report = render(scope, findings, args.target)

    out = args.out or f"rfsam-report-{datetime.date.today().isoformat()}.md"
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(report)
    print(f"✅ Report generated: {out} ({len(findings)} findings)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
