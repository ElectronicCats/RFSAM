# Informe Técnico de Auditoría de Seguridad RF — {{OBJETIVO}}

> Plantilla del **informe técnico** de una auditoría RFSAM. `scripts/scaffold_report.py`
> genera el esqueleto desde `loot/rfsam_findings.jsonl`; el agente completa análisis,
> impacto y remediación. Reemplaza los marcadores `{{...}}`. El **resumen ejecutivo**
> (audiencia no técnica) es documento aparte — ver `assets/executive-summary-template.md`.

**Fecha**: {{ISO}}
**Auditor**: {{nombre/rol}}
**Cliente/Propietario**: {{cliente}}
**Metodología**: RFSAM (Radio Frequency Security Assessment Methodology) — Electronic Cats
**Marco complementario**: OSSTMM, BSAM (Tarlogic), linaje SDR-pentest
**Licencia del contenido**: CC BY-SA 4.0
**Clasificación del informe**: {{Confidencial / Público / Interno}}

---

## 1. Resumen técnico

- **Hallazgos totales**: {{N}} (Critical: {{c}} · High: {{h}} · Medium: {{m}} · Low: {{l}} · Observacional: {{o}})
- **Confirmados**: {{nc}} · **Hipótesis (sin `repro.txt`)**: {{nh}} — _las hipótesis no cuentan como hallazgos confirmados._
- **Protocolos auditados**: {{BLE, Wi-Fi, ...}}
- **Cobertura de controles RFSAM**: {{X/Y}} (ver §5)
- **Modo de operación**: {{observacional / activo / lab-contenido / defensivo}}

> Síntesis técnica (2–4 líneas): qué se auditó, superficie cubierta, riesgo residual
> técnico. La síntesis de **negocio** va en el resumen ejecutivo, no aquí.

---

## 2. Alcance y autorización

```
Objetivo: {{descripción del dispositivo/sistema/señal}}
Propietario / autorización: {{PROPIO / CONTRATO <ref> / LAB}}
Modo de operación: {{observacional / activo / lab-contenido / defensivo}}
Autorizado por: {{nombre/rol del autorizante}}
Fecha de autorización: {{ISO}}
Protocolo(s) en scope: {{BLE / WIFI / ...}}
Limitaciones: {{ej. solo RX; no deauth; no clonar credenciales reales; ventana de captura X MHz}}
Retención de capturas: {{default 30 días post-entrega; purge solicitado: sí/no}}
```

> El modo de operación acotó las técnicas ejecutadas. Los pasos de capa Attack se realizaron
> únicamente donde el scope lo permitió; el resto se documenta como hipótesis verificable en
> entorno autorizado. Toda PII de terceros (IMSI/IMEI, BLE addr persistente, SSIDs probe,
> RFID UID ajeno) se mask/hash en este reporte; en claro solo identificadores del activo auditado.

---

## 3. Metodología

Auditoría conforme al **descenso RFSAM de 7 capas** (IG → SP → PHY+LL → CR → AT → AP) por
protocolo. PHY y LL se evalúan en conjunto (el mismo tool produce ambas). Cada hallazgo se
mapea a un control `RFSAM-<PROTO>-<LAYER>-NN` y se califica con el **modelo RFSAM de 4 ejes**
(Impacto, Explotabilidad, Exposición, Alcance A/B/C/D) consolidado en CVSS 4.0 — ver
`references/03-registro-hallazgos.md §7`. En RF casi siempre `AV:A` (adjacent, alcance de radio).

| Capa | Qué se verificó |
|------|-----------------|
| IG | Identificación de SoC/host stack + cruce con CVEs publicadas |
| SP | Viabilidad de captura (banda vs IBW del radio) |
| PHY+LL | Demodulación → bits; captura de tramas → Wireshark |
| CR | Evaluación de criptografía / recuperación de claves débiles |
| AT | Toma de control (solo donde el scope lo autorizó) |
| AP | Lo que el dispositivo confía sobre el enlace |

Para Bluetooth (BLE/Classic) en capa de enlace y arriba, RFSAM defiere a **BSAM** y aporta solo
el prerrequisito de captura RF. Para LoRa/LTE/RFID/Sub-GHz/etc., RFSAM es dueño end-to-end.

---

## 4. Hallazgos

> Ordenados por severidad (Critical → Observacional). Cada hallazgo **confirmado** incluye
> `repro.txt` en `loot/poc/RF-NNN/`; sin `repro.txt` se registra como hipótesis, no como
> confirmado.

### 4.1 CRITICAL

#### {{RF-001}} — {{título}}
- **Protocolo/Capa**: {{BLE / AT}} · **Control**: `RFSAM-BLE-AT-01`
- **Severidad**: CRITICAL
- **Modelo RFSAM**: Impacto {{1-4}}/4 · Explotabilidad {{1-4}}/4 · Exposición {{1-4}}/4 · Alcance {{A/B/C/D}}
- **CVSS 4.0**: `{{vector}}` ({{score}}, {{sev}})
- **Descripción**: {{qué se encontró, mecanismo, por qué importa}}
- **Evidencia**:
  ```
  COMANDO: {{tool + flags exactos}}
  SALIDA:  {{fragmento que confirma}}
  ```
- **Reproducción**: `loot/poc/RF-001/repro.txt` (comando verbatim + entorno + condiciones de captura)
- **Impacto**: {{qué puede hacer un atacante}}
- **Mitigación** (3 capas):
  - _Desarrollador_: {{...}}
  - _Integrador_: {{...}}
  - _Operador_: {{...}}
- **Referencias**: {{CVE / paper / tool + URL}}

### 4.2 HIGH
{{...}}

### 4.3 MEDIUM
{{...}}

### 4.4 LOW
{{...}}

### 4.5 OBSERVACIONAL (incluye hallazgos defensivos / detección)
{{...}}

---

## 5. Cobertura de controles RFSAM

> Volcar la salida de `python3 scripts/coverage_check.py` aquí.

{{tabla por protocolo: controles cubiertos / pendientes / no aplica}}

---

## 6. Limitaciones

- **Gaps de visibilidad**: {{radio/IBW usado; qué no se pudo observar y por qué}}
- **Controles fuera de scope**: {{ej. AT no ejecutado por modo observacional}}
- **Supuestos**: {{ej. no se capturó el join porque el dispositivo no re-pareó durante la ventana}}
- **Crypto fuerte declarada no rompible**: {{ej. LESC ECDH en este device → CR evalúa, no descifra}}

---

## 7. Remediación prioritizada

| Prioridad | Hallazgo | Acción | Capa responsable | Esfuerzo | Plazo |
|-----------|----------|--------|------------------|----------|-------|
| 1 | {{RF-001}} | {{acción concreta}} | {{Developer/Integrator/Operator}} | {{bajo/med/alto}} | {{inmediato/30d/90d}} |
| 2 | {{...}} | {{...}} | {{...}} | {{...}} | {{...}} |

> `critical`/`high` exigen las 3 capas (Developer/Integrator/Operator); `low`/observacional
> pueden cerrar con Operator solo.

---

## 8. Anexos

- **A. Capturas**: PCAPs, IQ waterfalls, dumps de Proxmark (en `loot/captures/`)
- **B. PoC**: `loot/poc/RF-NNN/` con `repro.txt` por hallazgo confirmado
- **C. Logs de sesión**: `loot/session_state.json`, `loot/rfsam_findings.jsonl`, `loot/hardware.txt`
- **D. Referencias**: lista completa de CVE, papers, herramientas con URL
- **E. Kit utilizado**: radios/sniffers/software + versión (volcar `loot/hardware.txt`)

---

_Fin del informe técnico. Generado siguiendo RFSAM (CC BY-SA 4.0). Evidencia reproducible
disponible en `loot/`. Re-validación recomendada tras aplicar remediación. Para la versión
ejecutiva no técnica, ver `assets/executive-summary-template.md`._
