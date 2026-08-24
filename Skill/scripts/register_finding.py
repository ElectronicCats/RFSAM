#!/usr/bin/env python3
"""register_finding.py — Registers a validated RFSAM audit finding.

Adds an entry to the JSONL file `loot/rfsam_findings.jsonl` using the RFSAM
skill's canonical schema. It is deterministic: validates required fields and
enums before writing, so the agent does not produce malformed findings.

Usage:
  register_finding.py --id RF-001 --protocol BLE --layer AT \
      --control RFSAM-BLE-AT-01 --severity high \
      --cvss4 "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N" \
      --title "Hijackable unencrypted BLE connection" \
      --evidence-file loot/poc/RF-001.txt \
      --notes "btlejack on micro:bit; handle 0x000E"

Output: prints a summary and the JSONL path. Exit 0 on success, 1 if validation fails.
"""
import argparse
import datetime
import json
import os
import re
import sys

# ── Canonical RFSAM enums (must match src/lib/taxonomy.js) ──
PROTOCOLS = {
    "BLE", "BTC", "WIFI", "LORA", "LTE", "RFID", "SUBG",
    "ZIGBEE", "ZWAVE", "THREAD", "GNSS", "ADSB", "NR5G", "GSM", "UWB",
}
LAYERS = {"IG", "SP", "PHY", "LL", "CR", "AT", "AP"}
SEVERITIES = {"info", "low", "medium", "high", "critical"}

ID_RE = re.compile(r"^RFSAM-[A-Z0-9]+-[A-Z]+-\d{2}$")
CVSS4_RE = re.compile(r"^CVSS:4\.0/.+$")
# Strict control regex derived from the canonical enums (DRY: single source of truth).
# Must match `references/00-taxonomy.md §3` and `src/data/coverage-map.js`.
_CONTROL_INNER = f"(?:{'|'.join(sorted(PROTOCOLS))})-(?:{'|'.join(LAYERS)})"
ID_RE_STRICT = re.compile(rf"^RFSAM-{_CONTROL_INNER}-\d{{2}}$")
# RFSAM 4-axis model (references/03-finding-registration.md §7)
AXIS_RANGE = range(1, 5)          # impact/exploitability/exposure: 1–4
SCOPE_REACH = {"A", "B", "C", "D"}  # achieved / cage / hypothesis / defensive


def _resolve_loot(loot_dir: str) -> str:
    """Locates or creates the loot/ directory relative to cwd (or the given --loot)."""
    os.makedirs(loot_dir, exist_ok=True)
    return os.path.join(loot_dir, "rfsam_findings.jsonl")


def validate(args) -> list[str]:
    errs = []
    if not re.match(r"^RF-\d{3}$", args.id):
        errs.append(f"--id must be in format RF-NNN (e.g. RF-001), received: {args.id!r}")
    if args.protocol.upper() not in PROTOCOLS:
        errs.append(f"Invalid protocol: {args.protocol!r}. Valid: {sorted(PROTOCOLS)}")
    if args.layer.upper() not in LAYERS:
        errs.append(f"Invalid layer: {args.layer!r}. Valid: {sorted(LAYERS)}")
    if args.severity.lower() not in SEVERITIES:
        errs.append(f"Invalid severity: {args.severity!r}. Valid: {sorted(SEVERITIES)}")
    if args.control:
        if not ID_RE_STRICT.match(args.control):
            errs.append(f"--control must be RFSAM-<PROTO>-<LAYER>-NN (canonical PROTO and LAYER), received: {args.control!r}")
        else:
            # Cross-field validation: the control's PROTOCOL and LAYER must match
            # the finding's --protocol and --layer (taxonomy invariant §3).
            parts = args.control.split("-")  # ["RFSAM", proto, layer, nn]
            ctl_proto, ctl_layer = parts[1], parts[2]
            if ctl_proto != args.protocol.upper():
                errs.append(f"--control protocol mismatch: control has {ctl_proto!r} but --protocol is {args.protocol.upper()!r}")
            if ctl_layer != args.layer.upper():
                errs.append(f"--control layer mismatch: control has {ctl_layer!r} but --layer is {args.layer.upper()!r}")
    if args.cvss4 and not CVSS4_RE.match(args.cvss4):
        errs.append(f"--cvss4 must start with 'CVSS:4.0/...', received: {args.cvss4!r}")
    if not (args.title and args.title.strip()):
        errs.append("--title is required and cannot be empty")
    # 4-axis model (optional but validated if provided)
    for flag, axis in (("--impact", "impact"), ("--exploitability", "exploitability"),
                       ("--exposure", "exposure")):
        val = getattr(args, flag.lstrip("-"))
        if val is not None and val not in AXIS_RANGE:
            errs.append(f"{flag} must be 1–4, received: {val!r} ({axis})")
    if args.scope_reach is not None and args.scope_reach.upper() not in SCOPE_REACH:
        errs.append(f"--scope-reach must be A/B/C/D, received: {args.scope_reach!r}")
    # Evidence: either a file, inline --evidence text, or --allow-hypothesis
    if not args.allow_hypothesis:
        has_ev = bool(args.evidence and args.evidence.strip()) or (
            args.evidence_file and os.path.isfile(args.evidence_file)
        )
        if not has_ev:
            errs.append(
                "Missing evidence: provide --evidence 'text' or --evidence-file path "
                "(or --allow-hypothesis to register as a hypothesis without a PoC)."
            )
    return errs


def build_record(args) -> dict:
    evidence = args.evidence or ""
    if args.evidence_file and os.path.isfile(args.evidence_file):
        try:
            with open(args.evidence_file, "r", errors="replace") as fh:
                evidence = (evidence + "\n" + fh.read()).strip()
        except OSError as exc:
            evidence = f"{evidence}\n[failed to read {args.evidence_file}: {exc}]".strip()
    record = {
        "id": args.id,
        "title": args.title.strip(),
        "protocol": args.protocol.upper(),
        "layer": args.layer.upper(),
        "control": args.control or None,
        "severity": args.severity.lower(),
        "cvss4": args.cvss4 or None,
        "status": "hypothesis" if args.allow_hypothesis else "confirmed",
        "evidence": evidence or None,
        "notes": args.notes or None,
        "timestamp": datetime.datetime.now().astimezone().isoformat(),
    }
    # 4-axis model (only if provided — references/03-finding-registration.md §7)
    if args.impact is not None:
        record["impact"] = args.impact
    if args.exploitability is not None:
        record["exploitability"] = args.exploitability
    if args.exposure is not None:
        record["exposure"] = args.exposure
    if args.scope_reach is not None:
        record["scope_reach"] = args.scope_reach.upper()
    # 3-layer mitigation (only if at least one was provided)
    mit = {}
    for key, src in (("developer", args.mitigation_developer),
                     ("integrator", args.mitigation_integrator),
                     ("operator", args.mitigation_operator)):
        if src:
            mit[key] = src.strip()
    if mit:
        record["mitigation"] = mit
    return record


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Registers an RFSAM finding to loot/rfsam_findings.jsonl")
    p.add_argument("--id", required=True, help="Finding ID, format RF-NNN (e.g. RF-001)")
    p.add_argument("--protocol", required=True, help=f"Protocol: {sorted(PROTOCOLS)}")
    p.add_argument("--layer", required=True, help=f"Layer: {sorted(LAYERS)}")
    p.add_argument("--control", help="Associated RFSAM control, e.g. RFSAM-BLE-AT-01")
    p.add_argument("--severity", required=True, help=f"Severity: {sorted(SEVERITIES)}")
    p.add_argument("--cvss4", help="CVSS 4.0 vector, e.g. CVSS:4.0/AV:A/AC:L/...")
    p.add_argument("--title", required=True, help="Short title of the finding")
    p.add_argument("--evidence", help="Inline evidence (command output)")
    p.add_argument("--evidence-file", help="Path to a file with the evidence/PoC")
    p.add_argument("--notes", help="Additional notes")
    p.add_argument("--impact", type=int, help="Impact axis of the RFSAM model (1–4)")
    p.add_argument("--exploitability", type=int, help="Exploitability axis of the RFSAM model (1–4)")
    p.add_argument("--exposure", type=int, help="Exposure axis of the RFSAM model (1–4)")
    p.add_argument("--scope-reach", dest="scope_reach",
                   help="Scope axis of the RFSAM model: A (achieved) / B (cage) / C (hypothesis) / D (defensive)")
    p.add_argument("--mitigation-developer", dest="mitigation_developer",
                   help="Developer-layer mitigation (manufacturer/firmware)")
    p.add_argument("--mitigation-integrator", dest="mitigation_integrator",
                   help="Integrator-layer mitigation (deployment/configuration)")
    p.add_argument("--mitigation-operator", dest="mitigation_operator",
                   help="Operator-layer mitigation (use/monitoring)")
    p.add_argument("--allow-hypothesis", action="store_true",
                   help="Register as a hypothesis (no PoC) — status='hypothesis'")
    p.add_argument("--loot", default="loot", help="loot/ directory (default 'loot')")
    args = p.parse_args(argv)

    errs = validate(args)
    if errs:
        sys.stderr.write("✖ Validation failed:\n")
        for e in errs:
            sys.stderr.write(f"  - {e}\n")
        return 1

    record = build_record(args)
    path = _resolve_loot(args.loot)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")

    sev = record["severity"].upper()
    flag = " (HYPOTHESIS — no PoC)" if record["status"] == "hypothesis" else ""
    print(f"✅ Registered {record['id']} [{sev}{flag}] → {path}")
    print(f"   {record['protocol']}/{record['layer']} · control={record['control']} · {record['title']}")
    return 0


def _self_test() -> bool:
    """Validates the 4-axis validation logic without writing to the JSONL."""
    import types

    def _ns(**kw):
        defaults = dict(
            control=None, impact=None, exploitability=None, exposure=None,
            scope_reach=None, mitigation_developer=None,
            mitigation_integrator=None, mitigation_operator=None,
        )
        defaults.update(kw)
        return types.SimpleNamespace(
            id="RF-001", title="ok", protocol="BLE", layer="AT",
            severity="high", cvss4=None, evidence="ev", evidence_file=None,
            notes=None, allow_hypothesis=False, loot="loot", **defaults,
        )

    # Valid axes → no axis errors
    errs = validate(_ns(impact=4, exploitability=2, exposure=2, scope_reach="A",
                        mitigation_developer=None, mitigation_integrator=None,
                        mitigation_operator=None))
    axis_errs = [e for e in errs if any(k in e for k in
                 ("impact", "exploitability", "exposure", "scope-reach"))]
    assert not axis_errs, f"valid axes rejected: {axis_errs}"

    # Out-of-range axes → errors
    errs = validate(_ns(impact=5, exploitability=0, exposure=9, scope_reach="Z",
                        mitigation_developer=None, mitigation_integrator=None,
                        mitigation_operator=None))
    axis_errs = [e for e in errs if any(k in e for k in
                 ("impact", "exploitability", "exposure", "scope-reach"))]
    assert len(axis_errs) == 4, f"expected 4 axis errors, got {len(axis_errs)}: {axis_errs}"

    # Cross-field validation: control protocol+layer must match finding's protocol+layer
    # Mismatch → rejected
    errs = validate(_ns(control="RFSAM-WIFI-CR-01"))
    mismatch_errs = [e for e in errs if "mismatch" in e]
    assert len(mismatch_errs) == 2, f"expected 2 mismatch errors (proto+layer), got {len(mismatch_errs)}: {mismatch_errs}"

    # Match → accepted
    errs = validate(_ns(control="RFSAM-BLE-AT-01"))
    mismatch_errs = [e for e in errs if "mismatch" in e]
    assert not mismatch_errs, f"matching control rejected: {mismatch_errs}"

    print("✅ self-test OK — 4-axis validation + control cross-field validation")
    return True


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        raise SystemExit(0 if _self_test() else 1)
    raise SystemExit(main())
