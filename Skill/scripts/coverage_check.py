#!/usr/bin/env python3
"""coverage_check.py — Compara hallazgos registrados vs el coverage-map de RFSAM.

Lee `loot/rfsam_findings.jsonl`, agrupa los controles `RFSAM-<PROTO>-<LAYER>-NN`
cubiertos y los compara con el coverage-map canónico (todos los controles que
RFSAM define por protocolo). Reporta cubiertos, pendientes y huérfanos
(controles citados en hallazgos que no existen en el coverage-map — posible typo).

Uso:
  coverage_check.py                 # todos los protocolos
  coverage_check.py --protocol BLE  # solo BLE
  coverage_check.py --loot loot     # directorio loot alternativo
"""
import argparse
import json
import os
import sys

# ── Coverage-map canónico de RFSAM ──
# ⚠ FUENTE ÚNICA: `src/data/coverage-map.js`. Esta tabla y `references/00-taxonomia.md §6`
# deben mantenerse sincronizadas con ese archivo. Si añades/cambias un control, actualiza
# los tres sitios (o mejor, deriva esta tabla del JS en el futuro).
# Cada control: id, title, layer, status (existing/planned).
COVERAGE = {
    "BLE": [
        ("RFSAM-BLE-IG-01", "Known vulnerabilities of the SoC and host stack", "IG"),
        ("RFSAM-BLE-SP-01", "Channel map and capture feasibility", "SP"),
        ("RFSAM-BLE-PHY-01", "Demodulation and bit recovery", "PHY"),
        ("RFSAM-BLE-LL-01", "Advertising and identifier exposure", "LL"),
        ("RFSAM-BLE-LL-02", "Connection-data capture", "LL"),
        ("RFSAM-BLE-CR-01", "Pairing and encryption assessment", "CR"),
        ("RFSAM-BLE-AT-01", "Hijack a live BLE connection", "AT"),
    ],
    "BTC": [
        ("RFSAM-BTC-IG-01", "Identify the device, BR/EDR mode and vulnerability corpus", "IG"),
        ("RFSAM-BTC-SP-01", "Inquiry-scan and confirm a reachable BR/EDR device", "SP"),
        ("RFSAM-BTC-LL-01", "Capture Bluetooth Classic baseband traffic", "LL"),
        ("RFSAM-BTC-CR-01", "Assess pairing and encryption key strength", "CR"),
        ("RFSAM-BTC-AT-01", "Test baseband/LMP resilience and availability", "AT"),
        ("RFSAM-BTC-AP-01", "Enumerate and exercise exposed BR/EDR profiles", "AP"),
    ],
    "WIFI": [
        ("RFSAM-WIFI-SP-01", "Band and channel survey", "SP"),
        ("RFSAM-WIFI-LL-01", "Management-frame exposure", "LL"),
        ("RFSAM-WIFI-CR-01", "WPA handshake / PMKID assessment", "CR"),
    ],
    "LORA": [
        ("RFSAM-LORA-SP-01", "Sub-band occupancy and capture", "SP"),
        ("RFSAM-LORA-PHY-01", "Chirp demodulation", "PHY"),
        ("RFSAM-LORA-LL-01", "LoRaWAN frame profiling", "LL"),
        ("RFSAM-LORA-CR-01", "Join and session-key assessment", "CR"),
    ],
    "LTE": [
        ("RFSAM-LTE-IG-01", "Baseband and modem vulnerabilities", "IG"),
        ("RFSAM-LTE-SP-01", "Cell identification and capture", "SP"),
        ("RFSAM-LTE-PHY-01", "Resource-grid recovery", "PHY"),
        ("RFSAM-LTE-LL-01", "Control-channel / identity exposure", "LL"),
    ],
    "RFID": [
        ("RFSAM-RFID-SP-01", "Carrier and standard identification", "SP"),
        ("RFSAM-RFID-CR-01", "Crypto1 / key-strength assessment", "CR"),
        ("RFSAM-RFID-AT-01", "Clone, emulate and relay", "AT"),
    ],
    "SUBG": [
        ("RFSAM-SUBG-SP-01", "Burst discovery and characterisation", "SP"),
        ("RFSAM-SUBG-PHY-01", "Demodulation and framing", "PHY"),
        ("RFSAM-SUBG-LL-01", "Frame and addressing recovery", "LL"),
        ("RFSAM-SUBG-CR-01", "Rolling-code assessment", "CR"),
        ("RFSAM-SUBG-AT-01", "Replay and forge", "AT"),
    ],
    "ZIGBEE": [
        ("RFSAM-ZIGBEE-SP-01", "Channel survey and capture feasibility", "SP"),
        ("RFSAM-ZIGBEE-LL-01", "PAN, addressing and device discovery", "LL"),
        ("RFSAM-ZIGBEE-CR-01", "Network-key provisioning and rotation", "CR"),
    ],
    "ZWAVE": [
        ("RFSAM-ZWAVE-SP-01", "Region/frequency identification", "SP"),
        ("RFSAM-ZWAVE-CR-01", "Key establishment assessment", "CR"),
    ],
    "THREAD": [
        ("RFSAM-THREAD-LL-01", "Mesh discovery and commissioning exposure", "LL"),
        ("RFSAM-THREAD-CR-01", "Network credential assessment", "CR"),
    ],
    "GNSS": [
        ("RFSAM-GNSS-SP-01", "Signal presence and interference survey", "SP"),
        ("RFSAM-GNSS-AT-01", "Spoofing and jamming resilience", "AT"),
    ],
    "ADSB": [
        ("RFSAM-ADSB-PHY-01", "Message capture and decode", "PHY"),
        ("RFSAM-ADSB-LL-01", "Message authenticity assessment", "LL"),
        ("RFSAM-ADSB-AT-01", "Forge and inject (contained lab)", "AT"),
    ],
    "NR5G": [
        ("RFSAM-NR5G-SP-01", "Cell identification and capture", "SP"),
        ("RFSAM-NR5G-LL-01", "Broadcast / identity exposure", "LL"),
    ],
    "GSM": [
        ("RFSAM-GSM-SP-01", "ARFCN survey and capture", "SP"),
        ("RFSAM-GSM-CR-01", "Cipher and identity exposure", "CR"),
    ],
    "UWB": [
        ("RFSAM-UWB-PHY-01", "Ranging signal capture", "PHY"),
        ("RFSAM-UWB-AT-01", "Distance-manipulation resilience", "AT"),
    ],
}


def load_findings(loot_dir: str) -> list[dict]:
    path = os.path.join(loot_dir, "rfsam_findings.jsonl")
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


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Cobertura de controles RFSAM vs hallazgos registrados")
    p.add_argument("--protocol", help="Filtrar a un protocolo (ej. BLE)")
    p.add_argument("--loot", default="loot", help="Directorio loot/")
    args = p.parse_args(argv)

    findings = load_findings(args.loot)
    proto_filter = args.protocol.upper() if args.protocol else None

    # controles cubiertos (con ≥1 hallazgo) por protocolo
    covered: dict[str, set[str]] = {}
    cited: set[str] = set()
    for f in findings:
        c = f.get("control")
        if not c:
            continue
        cited.add(c)
        proto = f.get("protocol", "")
        covered.setdefault(proto, set()).add(c)

    protocols = [proto_filter] if proto_filter else list(COVERAGE.keys())
    if proto_filter and proto_filter not in COVERAGE:
        sys.stderr.write(f"✖ Protocolo desconocido: {proto_filter}. Válidos: {sorted(COVERAGE)}\n")
        return 1

    total_defined = total_covered = total_pending = 0
    orphans: list[str] = []
    print(f"COBERTURA RFSAM — {len(findings)} hallazgo(s) registrado(s)\n")
    for proto in protocols:
        controls = COVERAGE.get(proto, [])
        cov = covered.get(proto, set())
        pending = [(cid, title, layer) for (cid, title, layer) in controls if cid not in cov]
        total_defined += len(controls)
        total_covered += len(controls) - len(pending)
        total_pending += len(pending)
        pct = (len(controls) - len(pending)) / len(controls) * 100 if controls else 0
        print(f"== {proto} ({len(controls) - len(pending)}/{len(controls)} · {pct:.0f}%) ==")
        for cid, title, layer in controls:
            mark = "✓" if cid in cov else "·"
            print(f"  {mark} {cid:<22} [{layer}] {title}")
        print()

    # huérfanos: controles citados que no existen en el coverage-map (typos)
    all_defined = {cid for controls in COVERAGE.values() for (cid, _, _) in controls}
    for c in sorted(cited):
        if c not in all_defined:
            orphans.append(c)

    print(f"TOTAL: {total_covered}/{total_defined} controles cubiertos · {total_pending} pendientes")
    if orphans:
        print(f"\n⚠ Controles citados NO reconocidos (¿typo?): {', '.join(orphans)}")
    if not findings:
        print("\n(sin hallazgos en loot/rfsam_findings.jsonl todavía)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
