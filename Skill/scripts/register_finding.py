#!/usr/bin/env python3
"""register_finding.py — Registra un hallazgo validado de auditoría RFSAM.

Añade una entrada al JSONL `loot/rfsam_findings.jsonl` con el esquema canónico
de la skill RFSAM. Es determinista: valida campos obligatorios y enums antes
de escribir, para que el agente no produzca hallazgos malformados.

Uso:
  register_finding.py --id RF-001 --protocol BLE --layer AT \
      --control RFSAM-BLE-AT-01 --severity high \
      --cvss4 "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N" \
      --title "Conexión BLE no cifrada secuestrable" \
      --evidence-file loot/poc/RF-001.txt \
      --notes "btlejack sobre micro:bit; handle 0x000E"

Salida: imprime un resumen y la ruta del JSONL. Exit 0 si OK, 1 si validación falla.
"""
import argparse
import datetime
import json
import os
import re
import sys

# ── Enums canónicos de RFSAM (deben coincidir con src/lib/taxonomy.js) ──
PROTOCOLS = {
    "BLE", "BTC", "WIFI", "LORA", "LTE", "RFID", "SUBG",
    "ZIGBEE", "ZWAVE", "THREAD", "GNSS", "ADSB", "NR5G", "GSM", "UWB",
}
LAYERS = {"IG", "SP", "PHY", "LL", "CR", "AT", "AP"}
SEVERITIES = {"info", "low", "medium", "high", "critical"}

ID_RE = re.compile(r"^RFSAM-[A-Z0-9]+-[A-Z]+-\d{2}$")
CVSS4_RE = re.compile(r"^CVSS:4\.0/.+$")
# Regex estricto de control derivado de los enums canónicos (DRY: una sola fuente de verdad).
# Debe coincidir con `references/00-taxonomia.md §3` y `src/data/coverage-map.js`.
_CONTROL_INNER = f"(?:{'|'.join(sorted(PROTOCOLS))})-(?:{'|'.join(LAYERS)})"
ID_RE_STRICT = re.compile(rf"^RFSAM-{_CONTROL_INNER}-\d{{2}}$")
# Modelo RFSAM de 4 ejes (references/03-registro-hallazgos.md §7)
AXIS_RANGE = range(1, 5)          # impacto/explotabilidad/exposición: 1–4
SCOPE_REACH = {"A", "B", "C", "D"}  # alcanzado / jaula / hipótesis / defensivo


def _resolve_loot(loot_dir: str) -> str:
    """Localiza o crea el directorio loot/ relativo al cwd (o al --loot dado)."""
    os.makedirs(loot_dir, exist_ok=True)
    return os.path.join(loot_dir, "rfsam_findings.jsonl")


def validate(args) -> list[str]:
    errs = []
    if not re.match(r"^RF-\d{3}$", args.id):
        errs.append(f"--id debe tener formato RF-NNN (ej. RF-001), recibido: {args.id!r}")
    if args.protocol.upper() not in PROTOCOLS:
        errs.append(f"--protocol inválido: {args.protocol!r}. Válidos: {sorted(PROTOCOLS)}")
    if args.layer.upper() not in LAYERS:
        errs.append(f"--layer inválido: {args.layer!r}. Válidos: {sorted(LAYERS)}")
    if args.severity.lower() not in SEVERITIES:
        errs.append(f"--severity inválido: {args.severity!r}. Válidos: {sorted(SEVERITIES)}")
    if args.control and not ID_RE_STRICT.match(args.control):
        errs.append(f"--control debe ser RFSAM-<PROTO>-<LAYER>-NN (PROTO y LAYER canónicos), recibido: {args.control!r}")
    if args.cvss4 and not CVSS4_RE.match(args.cvss4):
        errs.append(f"--cvss4 debe empezar con 'CVSS:4.0/...', recibido: {args.cvss4!r}")
    if not (args.title and args.title.strip()):
        errs.append("--title es obligatorio y no puede estar vacío")
    # Modelo de 4 ejes (opcionales pero validados si se aportan)
    for flag, axis in (("--impact", "impacto"), ("--exploitability", "explotabilidad"),
                       ("--exposure", "exposición")):
        val = getattr(args, flag.lstrip("-"))
        if val is not None and val not in AXIS_RANGE:
            errs.append(f"{flag} debe ser 1–4, recibido: {val!r} ({axis})")
    if args.scope_reach is not None and args.scope_reach.upper() not in SCOPE_REACH:
        errs.append(f"--scope-reach debe ser A/B/C/D, recibido: {args.scope_reach!r}")
    # Evidencia: o bien un archivo, o bien texto --evidence, o bien --allow-hypothesis
    if not args.allow_hypothesis:
        has_ev = bool(args.evidence and args.evidence.strip()) or (
            args.evidence_file and os.path.isfile(args.evidence_file)
        )
        if not has_ev:
            errs.append(
                "Falta evidencia: aporta --evidence 'texto' o --evidence-file ruta "
                "(o --allow-hypothesis para registrar como hipótesis sin PoC)."
            )
    return errs


def build_record(args) -> dict:
    evidence = args.evidence or ""
    if args.evidence_file and os.path.isfile(args.evidence_file):
        try:
            with open(args.evidence_file, "r", errors="replace") as fh:
                evidence = (evidence + "\n" + fh.read()).strip()
        except OSError as exc:
            evidence = f"{evidence}\n[no se pudo leer {args.evidence_file}: {exc}]".strip()
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
    # Modelo de 4 ejes (solo si se aportaron — references/03-registro-hallazgos.md §7)
    if args.impact is not None:
        record["impact"] = args.impact
    if args.exploitability is not None:
        record["exploitability"] = args.exploitability
    if args.exposure is not None:
        record["exposure"] = args.exposure
    if args.scope_reach is not None:
        record["scope_reach"] = args.scope_reach.upper()
    # Mitigación 3 capas (solo si se aportó al menos una)
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
    p = argparse.ArgumentParser(description="Registra un hallazgo RFSAM en loot/rfsam_findings.jsonl")
    p.add_argument("--id", required=True, help="ID del hallazgo, formato RF-NNN (ej. RF-001)")
    p.add_argument("--protocol", required=True, help=f"Protocolo: {sorted(PROTOCOLS)}")
    p.add_argument("--layer", required=True, help=f"Capa: {sorted(LAYERS)}")
    p.add_argument("--control", help="Control RFSAM asociado, ej. RFSAM-BLE-AT-01")
    p.add_argument("--severity", required=True, help=f"Severidad: {sorted(SEVERITIES)}")
    p.add_argument("--cvss4", help="Vector CVSS 4.0, ej. CVSS:4.0/AV:A/AC:L/...")
    p.add_argument("--title", required=True, help="Título corto del hallazgo")
    p.add_argument("--evidence", help="Evidencia inline (salida de comando)")
    p.add_argument("--evidence-file", help="Ruta a archivo con la evidencia/PoC")
    p.add_argument("--notes", help="Notas adicionales")
    p.add_argument("--impact", type=int, help="Eje Impacto del modelo RFSAM (1–4)")
    p.add_argument("--exploitability", type=int, help="Eje Explotabilidad del modelo RFSAM (1–4)")
    p.add_argument("--exposure", type=int, help="Eje Exposición del modelo RFSAM (1–4)")
    p.add_argument("--scope-reach", dest="scope_reach",
                   help="Eje Alcance del modelo RFSAM: A (alcanzado) / B (jaula) / C (hipótesis) / D (defensivo)")
    p.add_argument("--mitigation-developer", dest="mitigation_developer",
                   help="Mitigación capa Desarrollador (fabricante/firmware)")
    p.add_argument("--mitigation-integrator", dest="mitigation_integrator",
                   help="Mitigación capa Integrador (despliegue/configuración)")
    p.add_argument("--mitigation-operator", dest="mitigation_operator",
                   help="Mitigación capa Operador (uso/monitoreo)")
    p.add_argument("--allow-hypothesis", action="store_true",
                   help="Registrar como hipótesis (sin PoC) — status='hypothesis'")
    p.add_argument("--loot", default="loot", help="Directorio loot/ (por defecto 'loot')")
    args = p.parse_args(argv)

    errs = validate(args)
    if errs:
        sys.stderr.write("✖ Validación falló:\n")
        for e in errs:
            sys.stderr.write(f"  - {e}\n")
        return 1

    record = build_record(args)
    path = _resolve_loot(args.loot)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")

    sev = record["severity"].upper()
    flag = " (HIPÓTESIS — sin PoC)" if record["status"] == "hypothesis" else ""
    print(f"✅ Registrado {record['id']} [{sev}{flag}] → {path}")
    print(f"   {record['protocol']}/{record['layer']} · control={record['control']} · {record['title']}")
    return 0


def _self_test() -> bool:
    """Verifica la lógica de validación de los 4 ejes sin escribir el JSONL."""
    import types

    def _ns(**kw):
        return types.SimpleNamespace(
            id="RF-001", title="ok", protocol="BLE", layer="AT", control=None,
            severity="high", cvss4=None, evidence="ev", evidence_file=None,
            notes=None, allow_hypothesis=False, loot="loot", **kw,
        )

    # Ejes válidos → sin errores de eje
    errs = validate(_ns(impact=4, exploitability=2, exposure=2, scope_reach="A",
                        mitigation_developer=None, mitigation_integrator=None,
                        mitigation_operator=None))
    axis_errs = [e for e in errs if any(k in e for k in
                 ("impact", "exploitability", "exposure", "scope-reach"))]
    assert not axis_errs, f"ejes válidos rechazados: {axis_errs}"

    # Ejes fuera de rango → errores
    errs = validate(_ns(impact=5, exploitability=0, exposure=9, scope_reach="Z",
                        mitigation_developer=None, mitigation_integrator=None,
                        mitigation_operator=None))
    axis_errs = [e for e in errs if any(k in e for k in
                 ("impact", "exploitability", "exposure", "scope-reach"))]
    assert len(axis_errs) == 4, f"esperaba 4 errores de eje, hubo {len(axis_errs)}: {axis_errs}"

    print("✅ self-test OK — validación de 4 ejes (impacto/explotabilidad/exposición/alcance)")
    return True


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        raise SystemExit(0 if _self_test() else 1)
    raise SystemExit(main())
