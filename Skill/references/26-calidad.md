# 26 — Calidad: verificar antes de reportar

> Gate de calidad transversal. Aplica en cualquier capa del descenso, **antes de registrar** un hallazgo Y
> **antes de cerrar** el reporte. Una afirmación que no pasa estas reglas es **hipótesis**, no hallazgo
> confirmado. Fuente: §1 (reglas Q1–Q8), §2 (criticality), §5 (consistencia interna / `scripts/register_finding.py`).

## Índice

1. §reglas — 8 reglas de verificación obligatoria (Q1–Q8)
2. §criticality — rúbrica de severidad honesta
3. §lifecycle — draft vs verified (la verificación es una pasada separada)
4. §pre-registro — checklist antes de escribir en el JSONL
5. §cross-refs — consistencia interna (modelo validate.mjs)

---

## 1. §reglas — 8 reglas de verificación obligatoria

Antes de registrar un hallazgo o incluirlo en el reporte, cada regla debe pasar. Si una falla → no registrar
todavía (conseguir evidencia, citar fuente, degradar severidad o declarar gap). SKILL.md §CALIDAD contiene la
versión rápida; esta tabla es la fuente autoritativa.

| # | Regla | Qué verificar | Si falla |
|---|-------|---------------|----------|
| **Q1** | **Citar o flaggear** | Cada claim no trivial mapea a una fuente resoluble (CVE en NVD, paper/URL real, slug del catálogo de tools) o lleva `> [!FLAG] …` inline | No registrar hasta citar o flaggear explícitamente |
| **Q2** | **Comandos verbatim** | Los strings de comando del wayfinder se copian exactos (flags, parámetros, valores war-story). No parafrasear, "completar" ni inventar | Reemplazar por el verbatim del wayfinder; si no existe, flaggear |
| **Q3** | **Criticality honesta** | Observacional/factibilidad = `info`/`low`; takeover / clave recuperada / impersonation = `high`/`critical`. La severidad refleja lo **alcanzado** en este modo, no lo teórico | Degradar severidad al nivel que la evidencia soporta |
| **Q4** | **BSAM deference** | BLE/BTC en LL+ → citar BSAM (cross-ref `BSAM-xx`), describir **solo** el prerequisito de captura RF. No rederivar contenido BSAM | Reescribir como deference; quitar el contenido BSAM duplicado |
| **Q5** | **Framing autorizado** | Cada paso TX / replay / decrypt / rogue lleva nota de equipo propio, SIM/dispositivo de prueba, contención, permiso explícito | Añadir el framing o degradar a hipótesis (no ejecutar TX sin él) |
| **Q6** | **Evidencia suficiente** | Comando + parámetros + tool+versión + condiciones de captura reproducibles (`repro.txt`). Ver tabla de suficiencia por severidad en SKILL.md §EVIDENCIA REPRODUCIBLE | Degradar severidad y marcar `evidence_status: partial`; sin `repro.txt` = hipótesis |
| **Q7** | **Sin control dedicado → nota de capa** | Si no hay control `RFSAM-<PROTO>-<LAYER>-NN` mapeable, **no omitas** el hallazgo: registra con `control: null` y `notes` indicando la capa aproximada | Añadir nota de capa; no omitir |
| **Q8** | **Cross-refs resuelven** | Todo `control` ID, `RFSAM-RES-NN`, slug de tool y path de reference citado en el reporte existe en la skill. Modelo: `validate.mjs` (id↔protocol↔layer, cada ref resuelve, enums válidos) — ver §cross-refs | Corregir la ref o marcar como no verificada |

> **Q1–Q8 son obligatorias** para `critical`/`high`. `medium` puede registrar con Q6 parcial
> (`evidence_status: partial`). `low`/`info` pueden cerrar con Q1+Q2+Q6 mínimas. **Excepción — modo Defensivo**
> (Alcance D): nunca reporta `critical`; su techo es `medium` (tipo `detection`).

---

## 2. §criticality — rúbrica de severidad honesta

Fuente: `§2` de este archivo. La severidad la fija el modelo de 4 ejes de SKILL.md §SEVERIDAD Y
CLASIFICACIÓN; esta rúbrica es el sanity check de que la severidad asignada es honesta con la evidencia:

| Nivel | Definición honesta | Abuso común a evitar |
|-------|---------------------|----------------------|
| **info** | Observacional; sin impacto directo (factibilidad de captura, identifier exposure) | Reportar una captura exitosa como si fuera vulnerabilidad |
| **low** | Exposición menor o gap de hardening sin exploit práctico | "Firmware antiguo" sin CVE confirmado como `high` |
| **medium** | Debilidad que requiere condiciones específicas; hipótesis con techo (Alcance C); detección defensiva (D) | Hipótesis sin PoC como `high`; detections como `critical` |
| **high** | Debilidad explotable con impacto significativo; datos en claro; infraestructura crítica **en jaula** (B) | Activos contained (jaula) como `critical` sin etiqueta `contained` |
| **critical** | Compromiso completo (takeover, key recovery, impersonation) con precondiciones prácticas **Y** PoC en campo (A) | Sin PoC (C) como `critical`; contained (B) como `critical` sin `contained` |

**Reglas de oro:**

- Sin PoC (Alcance C) → máximo `medium`.
- Contained / jaula (B) → `critical` baja a `high` con etiqueta `contained`.
- Defensivo (D) → techo `medium`, tipo `detection`, sin `critical`.
- El eje **Impacto** fija el techo; Explotabilidad / Exposición / Alcance **solo modulan a la baja**, nunca al alza.
- "No observado" bajo ventana finita es **gap de visibilidad**, no evidencia de ausencia — pero "observado" puede
  ser **falso positivo** si la captura base está corrupta (overflows ≠ 0) o el decoder no corresponde
  (ver `references/25-troubleshooting.md` §falsos-positivos). Verifica ambos extremos antes de fijar severidad.

---

## 3. §lifecycle — draft vs verified

Principio de `§3` de este archivo, adaptado al agente que audita:

- **Durante el descenso**, el agente produce hallazgos en estado **draft**: investigados, con evidencia, pueden
  llevar `[!FLAG]`s donde queda incertidumbre. Eso es legítimo y se registra en el JSONL.
- **Antes del reporte**, una pasada de verificación (el mismo agente en Fase 7 / Cierre, o un reviewer separado)
  debe **resolver cada flag** y **confirmar cada cita**. Un hallazgo con flags sin resolver entra al reporte como
  **hipótesis / observación**, no como confirmado.
- **`confidence`** (`low` / `medium` / `high`) es la autoevaluación honesta del hallazgo. No la inflas: si la
  evidencia es indirecta o la tool no es concluyente, `low` / `medium` es correcto.

> Un sub-agente (o una pasada rápida del descenso) produce `draft`. La verificación es una pasada **separada** que
> eleva a `verified`. No reportes como `verified` lo que solo pasaste volando.

---

## 4. §pre-registro — checklist antes de escribir en el JSONL

Antes de ejecutar `scripts/register_finding.py` (o escribir a mano en `rfsam_findings.jsonl`):

```
□ Captura/salida de comando exacta como evidencia              (Q2, Q6)
□ Severidad refleja lo ALCANZADO en este modo, no lo teórico   (Q3)
□ Comando reproducible (objetivo, flags, parámetros) → poc/RF-NNN/repro.txt   (Q6)
□ Fuente citada (CVE/paper/tool) o incertidumbre flageada ([!FLAG])   (Q1)
□ Control RFSAM-<PROTO>-<LAYER>-NN mapeado, o nota de capa si no hay control dedicado   (Q7)
□ Si TX: framing autorizado presente (equipo propio, contención, permiso)   (Q5)
□ Si BLE/BTC LL+: BSAM deference aplicada, no rederivada      (Q4)
```

Si cualquier ítem es NO → **no registrar todavía**; conseguir evidencia, citar, degradar severidad o declarar
gap. El checklist de **pre-cierre** (por sesión) vive en SKILL.md §CIERRE DE AUDITORÍA — no se duplica aquí.

---

## 5. §cross-refs — consistencia interna (modelo validate.mjs)

Modelo aplicado al reporte que la skill genera (ver `scripts/register_finding.py` para los enums
validados y la regex de control). Antes de entregar, verifica:

- **ID ↔ protocolo ↔ capa**: cada `RFSAM-<PROTO>-<LAYER>-NN` citado tiene segmentos consistentes
  (PROTOCOL ∈ los 15 canónicos: BLE/WIFI/LORA/LTE/RFID/SUBG/ZIGBEE/ZWAVE/THREAD/GNSS/ADSB/NR5G/GSM/UWB/BTC;
  LAYER ∈ IG/SP/PHY/LL/CR/AT/AP).
- **Cada referencia resuelve**: cada `control`, `RFSAM-RES-NN`, slug de tool y path de reference citado en el
  reporte existe en la skill (en `references/`, `assets/` o el catálogo de tools del wayfinder).
- **Enums válidos**: severidad ∈ critical/high/medium/low/info; `scope_reach` ∈ A/B/C/D; `mode` ∈
  observacional/activo/lab/defensivo.
- **Sin campos vacíos en hallazgos críticos**: un `critical`/`high` sin `repro.txt`, sin control mapeado (o nota
  de capa) o sin mitigación en las 3 capas (Developer/Integrator/Operator) es un hallazgo **incompleto**, no
  confirmado.

> Si una cross-ref no resuelve, **no la inventes**: marca el hallazgo como `confidence: low` con
> `[!FLAG] ref sin resolver`, o quítala. Una URL inventada viola Q1 (citar o flaggear).

---

## 6. Mapeo a fases downstream

- **SKILL.md §CALIDAD** cita §reglas como gate rápido (las 10 reglas inline son la versión compacta; Q1–Q8 es la
  fuente autoritativa).
- **SKILL.md §SEVERIDAD "Antes de registrar"** delega a §pre-registro (no duplica el checklist).
- **SKILL.md §CIERRE DE AUDITORÍA** mantiene su propio checklist por sesión (pre-cierre); §cross-refs amplía lo
  que "verificar cross-refs" significa en la práctica.
- **Fase 7.1 (validación):** la checklist de validación confirma que cada hallazgo del JSONL pasó Q1–Q8 y que las
  cross-refs del reporte resuelven.
