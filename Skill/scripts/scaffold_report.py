#!/usr/bin/env python3
"""scaffold_report.py — Genera el esqueleto de un informe de auditoría RFSAM.

Lee `loot/rfsam_findings.jsonl` (y opcionalmente `loot/scope.txt`,
`loot/session_state.json`) y produce un informe Markdown ordenado por
severidad y agrupado por protocolo/capa. El cuerpo se rellena con los
hallazgos; el agente completa el análisis y la remediación.

Uso:
  scaffold_report.py                       # escribe informe-rfsam-<fecha>.md en cwd
  scaffold_report.py --target "cerradura" # nombre del objetivo en el título
  scaffold_report.py --loot loot --out informe.md
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
    title = target or "objetivo RF"
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
    lines.append(f"# Informe Técnico de Auditoría de Seguridad RF — {title}")
    lines.append("")
    lines.append(f"**Fecha**: {date}  ")
    lines.append("**Metodología**: RFSAM (Radio Frequency Security Assessment Methodology)  ")
    lines.append("**Marco complementario**: OSSTMM, BSAM, linaje SDR-pentest  ")
    lines.append("**Licencia del contenido**: CC BY-SA 4.0")
    lines.append("")

    lines.append("## 1. Resumen técnico")
    lines.append("")
    lines.append(f"- **Hallazgos totales**: {len(findings_sorted)}")
    for sev in ("critical", "high", "medium", "low", "info"):
        if sev in by_sev:
            lines.append(f"- **{sev.upper()}**: {by_sev[sev]}")
    n_confirmed = sum(1 for f in findings_sorted if f.get("status") != "hypothesis")
    n_hyp = sum(1 for f in findings_sorted if f.get("status") == "hypothesis")
    lines.append(f"- **Confirmados**: {n_confirmed} · **Hipótesis (sin PoC)**: {n_hyp}")
    lines.append("")
    lines.append("> _El agente completa aquí la síntesis ejecutiva: impacto de negocio, "
                 "riesgo residual y prioridades de remediación._")
    lines.append("")

    lines.append("## 2. Alcance y autorización")
    lines.append("")
    if scope:
        lines.append("```")
        lines.append(scope)
        lines.append("```")
    else:
        lines.append("> _Documentar objetivo, propietario/autorización, modo (observacional/activo/lab) "
                     "y protocolos en scope._")
    lines.append("")

    lines.append("## 3. Metodología")
    lines.append("")
    lines.append("Auditoría conforme al descenso RFSAM de 7 capas (IG → SP → PHY+LL → CR → AT → AP) "
                 "por protocolo. Cada hallazgo se mapea a un control `RFSAM-<PROTO>-<LAYER>-NN` y "
                 "califica con el modelo de 4 ejes consolidado en CVSS 4.0 (en RF normalmente "
                 "`AV:A` — adjacent, alcance de radio).")
    lines.append("")

    lines.append("## 4. Hallazgos")
    lines.append("")
    if not findings_sorted:
        lines.append("_No hay hallazgos registrados en `loot/rfsam_findings.jsonl`._")
        lines.append("")
    for f in findings_sorted:
        sev = f.get("severity", "info").upper()
        proto = f.get("protocol", "?")
        layer = f.get("layer", "?")
        control = f.get("control") or "—"
        cvss = f.get("cvss4") or "—"
        status_tag = " (HIPÓTESIS)" if f.get("status") == "hypothesis" else ""
        lines.append(f"### {f.get('id','?')} · {sev}{status_tag} — {f.get('title','(sin título)')}")
        lines.append("")
        lines.append(f"- **Protocolo/Capa**: {proto} / {layer}")
        lines.append(f"- **Control RFSAM**: `{control}`")
        # Modelo de 4 ejes (si se aportaron — references/03-registro-hallazgos.md §7)
        axes = []
        for key, label in (("impact", "Impacto"), ("exploitability", "Explotabilidad"),
                           ("exposure", "Exposición")):
            if f.get(key) is not None:
                axes.append(f"{label} {f[key]}/4")
        if f.get("scope_reach"):
            axes.append(f"Alcance {f['scope_reach']}")
        if axes:
            lines.append(f"- **Modelo RFSAM**: {' · '.join(axes)}")
        lines.append(f"- **CVSS 4.0**: `{cvss}`")
        ev = (f.get("evidence") or "").strip()
        if ev:
            lines.append("- **Evidencia**:")
            lines.append("")
            lines.append("```")
            lines.append(ev)
            lines.append("```")
        else:
            lines.append("- **Evidencia**: _por adjuntar_")
        # Mitigación 3 capas (si se aportaron)
        mit = f.get("mitigation") or {}
        has_mit = isinstance(mit, dict) and bool(mit)
        if has_mit:
            lines.append("- **Mitigación**:")
            for layer_key, label in (("developer", "Desarrollador"),
                                     ("integrator", "Integrador"),
                                     ("operator", "Operador")):
                if mit.get(layer_key):
                    lines.append(f"  - _{label}_: {mit[layer_key]}")
        if f.get("notes"):
            lines.append(f"- **Notas**: {f['notes']}")
        lines.append("")
        lines.append("> _El agente completa: descripción, impacto, PoC reproducible y remediación "
                     "(desarrollador / integrador / operador)._")
        lines.append("")

    lines.append("## 5. Cobertura de controles")
    lines.append("")
    lines.append("> Ejecutar `python3 scripts/coverage_check.py` y volcar aquí el resumen de "
                 "controles cubiertos vs pendientes por protocolo.")
    lines.append("")

    lines.append("## 6. Limitaciones")
    lines.append("")
    lines.append("> _Documentar gaps de visibilidad (radio/IBW), controles fuera de scope, "
                 "y supuestos (ej. no se pudo capturar el join porque el dispositivo no re-pareó)._")
    lines.append("")

    lines.append("## 7. Remediación prioritizada")
    lines.append("")
    lines.append("| Prioridad | Hallazgo | Acción | Capa responsable | Esfuerzo | Plazo |")
    lines.append("|-----------|----------|--------|------------------|----------|-------|")
    # Una fila por hallazgo confirmado, ordenado por severidad (igual que §4).
    # Acción = primera capa de mitigación disponible (developer > integrator > operator);
    # Capa responsable = lista de capas con contenido; Esfuerzo/Plazo los completa el agente.
    prio = 0
    for f in findings_sorted:
        if f.get("status") == "hypothesis":
            continue  # las hipótesis no entran al plan de remediación
        prio += 1
        mit = f.get("mitigation") or {}
        action = (mit.get("developer") or mit.get("integrator")
                  or mit.get("operator") or "_por definir_")
        layers = [lbl for k, lbl in (("developer", "Developer"),
                                     ("integrator", "Integrator"),
                                     ("operator", "Operator")) if mit.get(k)]
        resp = ", ".join(layers) if layers else "_por asignar_"
        effort = "_{bajo/med/alto}_"
        deadline = "_{inmediato/30d/90d}_"
        lines.append(f"| {prio} | {f.get('id','?')} | {action} | {resp} | {effort} | {deadline} |")
    if prio == 0:
        lines.append("| _—_ | _sin hallazgos confirmados_ | _—_ | _—_ | _—_ | _—_ |")
    lines.append("")
    lines.append("> `critical`/`high` exigen las 3 capas (Developer/Integrator/Operator); "
                 "`low`/observacional pueden cerrar con Operator solo.")
    lines.append("")

    lines.append("## 8. Anexos")
    lines.append("")
    lines.append("- Capturas PCAP, waterfalls, dumps de Proxmark, logs de sesión (`loot/`).")
    lines.append("- Referencias: CVE, papers, herramientas con URL.")
    lines.append("")
    return "\n".join(lines)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Genera un informe de auditoría RFSAM desde el JSONL")
    p.add_argument("--target", help="Nombre del objetivo para el título")
    p.add_argument("--loot", default="loot", help="Directorio loot/")
    p.add_argument("--out", help="Archivo de salida (por defecto informe-rfsam-<fecha>.md)")
    args = p.parse_args(argv)

    findings = load_jsonl(os.path.join(args.loot, "rfsam_findings.jsonl"))
    scope = read_scope(args.loot)
    report = render(scope, findings, args.target)

    out = args.out or f"informe-rfsam-{datetime.date.today().isoformat()}.md"
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(report)
    print(f"✅ Informe generado: {out} ({len(findings)} hallazgos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
