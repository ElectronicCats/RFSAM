# 03 — Registro de Hallazgos: Esquema, Severidad y CVSS 4.0 RF

> Define el esquema JSONL canónico, el formato del bloque finding, la rubrica de severidad RFSAM
> y los vectores CVSS 4.0 típicos para RF. Úsalo antes de registrar el primer hallazgo.

## Índice
1. Esquema del JSONL
2. Uso de `register_finding.py`
3. Formato finding en el chat
4. Rubrica de severidad RFSAM (qué evidencia exige cada nivel)
5. CVSS 4.0 para RF — vectores típicos
6. Cómo citar referencias
7. `severidad-rf` — modelo de 4 ejes para clasificar hallazgos RF

---

## 1. Esquema del JSONL

Cada línea de `loot/rfsam_findings.jsonl` es un objeto JSON con este esquema:

```json
{
  "id": "RF-001",                         // obligatorio, formato RF-NNN
  "title": "Conexión BLE secuestrable via btlejack",  // obligatorio
  "protocol": "BLE",                       // obligatorio, uno de los 15
  "layer": "AT",                           // obligatorio, IG|SP|PHY|LL|CR|AT|AP
  "control": "RFSAM-BLE-AT-01",            // opcional pero recomendado
  "severity": "high",                      // obligatorio, info|low|medium|high|critical
  "cvss4": "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N",
  "status": "confirmed",                   // confirmed|hypótesis (auto según --allow-hypothesis)
  "evidence": "Got CONNECT_REQ ... AA 0x0a2f7b1d ...",  // obligatorio salvo hipótesis
  "impact": 4,                             // opcional, eje del modelo §7 (1–4)
  "exploitability": 2,                     // opcional, eje del modelo §7 (1–4)
  "exposure": 2,                           // opcional, eje del modelo §7 (1–4)
  "scope_reach": "A",                      // opcional, A|B|C|D (alcanzado|jaula|hipótesis|defensivo)
  "mitigation": {                          // opcional, 3 capas (solo las aportadas)
    "developer": "forzar LESC",
    "integrator": "rekey tras comisión",
    "operator": "rotar pares autorizados"
  },
  "notes": "handle 0x000E controla color; btlejack sobre micro:bit",  // opcional
  "timestamp": "2026-06-19T13:45:00-05:00"  // auto, ISO 8601 con zona
}
```

**Reglas validadas por `register_finding.py`**:
- `id` debe matchear `^RF-\d{3}$`.
- `protocol` ∈ los 15 IDs; `layer` ∈ los 7; `severity` ∈ los 5.
- `control` si se aporta debe matchear `^RFSAM-<PROTO>-<LAYER>-\d{2}$`.
- `cvss4` si se aporta debe empezar con `CVSS:4.0/`.
- `title` no vacío.
- `impact`/`exploitability`/`exposure` si se aportan deben ser 1–4.
- `scope_reach` si se aporta debe ser A/B/C/D.
- **Evidencia obligatoria** salvo que se pase `--allow-hypothesis` (entonces `status=hypothesis`).

> Los 4 ejes (`impact`/`exploitability`/`exposure`/`scope_reach`) son opcionales pero
> **recomendados**: hacen operativo el modelo de §7 y alimentan el reporte técnico y el
> resumen ejecutivo con la justificación de severidad. Mitigación se almacena solo para las
> capas que se aporten.

## 2. Uso de `register_finding.py`

```bash
python3 scripts/register_finding.py \
  --id RF-001 \
  --protocol BLE \
  --layer AT \
  --control RFSAM-BLE-AT-01 \
  --severity critical \
  --cvss4 "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N" \
  --title "Conexión BLE no cifrada secuestrable" \
  --evidence-file loot/poc/RF-001.txt \
  --impact 4 --exploitability 2 --exposure 2 --scope-reach A \
  --mitigation-developer "forzar LESC; reject Just Works pairing" \
  --mitigation-operator "rotar pares; monitorear conexiones anómalas" \
  --notes "btlejack sobre micro:bit; handle 0x000E"
```

Flags:
- `--evidence "texto"` evidencia inline; `--evidence-file ruta` la lee del archivo.
- `--allow-hypothesis` registra sin PoC (status `hypothesis`) — para hallazgos a verificar.
- `--impact`/`--exploitability`/`--exposure` (1–4) y `--scope-reach` (A/B/C/D): los 4 ejes del modelo de §7. Opcionales pero recomendados.
- `--mitigation-developer`/`--mitigation-integrator`/`--mitigation-operator`: las 3 capas de remediación. Solo se guardan las capas que se aporten.
- `--loot loot` directorio alternativo.

El script valida antes de escribir; si falla, no toca el JSONL e imprime los errores.
Verifica la lógica con `python3 scripts/register_finding.py --self-test`.

## 3. Formato finding en el chat

**Además** del registro JSONL, vuelca un bloque legible al chat para el usuario.
Para `critical`/`high` que merecen un write-up detallado (descripción, impacto, evidencia,
reproducción segura, mitigación 3 capas), usa el documento standalone
`assets/finding-template.md`.

```
FINDING: [título específico]
Severidad: CRITICAL | HIGH | MEDIUM | LOW | INFO
Protocolo/Capa: BLE / AT   Control: RFSAM-BLE-AT-01
Objetivo: [dispositivo/escenario]
Descripción: qué se encontró y por qué importa
Evidencia:
  COMANDO: [tool + flags exactos]
  SALIDA:  [fragmento que confirma — AA, clave recuperada, 200 OK, etc.]
Impacto: qué puede hacer un atacante
PoC: comando exacto para reproducir
Remediación: capas (desarrollador/integrador/operador)
Referencias: [CVE / paper / tool + URL]
CVSS 4.0: CVSS:4.0/AV:A/...  (score, severidad)
```

## 4. Rubrica de severidad RFSAM — qué evidencia exige cada nivel

| Severidad | Debes tener evidencia de | Prohibido |
|-----------|--------------------------|-----------|
| **CRITICAL** | Toma de control / recuperación de clave / suplantación reproducida con PoC capturado | "Es vulnerable" sin PoC |
| **HIGH** | Exposición real de datos en claro, claves débiles recuperadas, hijack demostrado | Hipótesis de cripto sin captura |
| **MEDIUM** | Debilidad que requiere condiciones específicas para explotar | Cualquier cosa ya explotada → subir |
| **LOW** | Brecha de endurecimiento / info disclosure no directamente explotable | Lo que sí se pueda explotar → subir |
| **INFO** | Observacional (viabilidad de captura, identifier exposure, identifier leakage) | — |

**Checklist mental antes de registrar**:
```
□ ¿Tengo la captura/salida de comando exacta como evidencia?
□ ¿La severidad refleja lo que ALCANCÉ, no lo que podría alcanzar?
□ ¿El comando es reproducible (objetivo, flags, parámetros)?
□ ¿Cité la fuente (CVE/paper/tool) o flageé la incertidumbre?
□ ¿Mapeé a un control RFSAM-<PROTO>-<LAYER>-NN?
Si cualquier respuesta es NO → no registrar todavía. Obtener evidencia.
```

## 5. CVSS 4.0 para RF — vectores típicos

**Clave**: RF casi siempre es **`AV:A` (Adjacent)** — el atacante debe estar en alcance de radio,
no en red (`AV:N`). Excepción: rogue infrastructure que luego exfiltra por red puede escalar a
impacto en cascada `AV:N`, pero el vector RF inicial sigue siendo `AV:A`.

Vector base recomendado para la mayoría de hallazgos RF:
`CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N`

| Tipo de hallazgo RF | Vector | Severidad típica |
|---------------------|--------|------------------|
| Hijack BLE / RCE baseband | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | critical |
| Recuperación de clave (crackle/KNOB/Crypto1) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | critical |
| Rogue cell / IMSI catcher (identity harvest) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N` | high |
| Tráfico en claro (BLE/Wi-Fi/Zigbee) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N` | high/medium |
| Replay código fijo sub-GHz | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N` | high (puerta) / medium |
| Clonación RFID / relay | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` | high |
| Advertising tracking / identifier leakage | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N` | medium/low |
| Spoofing GNSS (conducción) | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N` | (contexto-dependiente) |
| WPS Pixie-Dust / PMKID | `CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` | high |

Métricas CVSS 4.0: `AV` Attack Vector (N/A/L/P) · `AC` Attack Complexity (L/H) · `AT` Attack
Requirements (N/P) · `PR` Privileges Required (N/L/H) · `UI` User Interaction (N/P/A) ·
`VC/VI/VA` Vulnerable System Confidentiality/Integrity/Availability · `SC/SI/SA` Subsequent System.

## 6. Cómo citar referencias

Toda afirmación no trivial **se cita o se flagea**:
- **CVE**: `CVE-2019-9506 (KNOB) — https://nvd.nist.gov/vuln/detail/CVE-2019-9506`
- **Paper**: `Ryan, "Bluetooth: With Low Energy Comes Low Security", USENIX WOOT 2013 — https://...`
- **Tool**: `crackle (Mike Ryan) — https://github.com/mikeryan/crackle`
- **Spec/standard**: `Bluetooth Core Spec v5.4, Vol 6 Part B`

Si no puedes verificar una fuente → flagea inline:
```
> [!FLAG] Afirmación X — falta verificar fuente concreta antes de reportar
```

**Nunca afirmes lo que no puedes citar o demostrar con evidencia.** Esa es la regla fundacional de RFSAM.

---

## 7. `severidad-rf` — modelo de 4 ejes para clasificar hallazgos RF

§4 da la rúbrica **reactiva** (qué evidencia exige cada nivel). Esta sección da el modelo **predictivo**: antes de
fijar la severidad, el agente evalúa cuatro ejes propios de RF que no aparecen en CVSS y que deciden el nivel.

> Origen: modelo definido en `§7` de este archivo. SKILL.md §SEVERIDAD Y CLASIFICACIÓN comprime esta sección a la tabla de
> 4 niveles + la referencia aquí; el modelo completo vive en esta sección.

### 7.1 — Los cuatro ejes

Cada eje se puntúa 1 (bajo) a 4 (alto). La severidad final **no** es un promedio lineal — es el eje **Impacto**
(techo) modulado por los otros tres. El agente los recorre en orden: Impacto primero (fija el techo), luego
Explotabilidad/Exposición/Alcance bajan o confirman.

#### Eje 1 — Impacto (techo de severidad)

| Puntaje | Qué consigue el atacante | Ejemplos RF |
|---------|--------------------------|-------------|
| 4 | Takeover / clave recuperada / suplantación persistente | btlejack hijack, crackle pairing crack, MIFARE Crypto1 key dump, Zigbee NWK key del join, WPA PSK crackeada |
| 3 | Datos sensibles / control del dispositivo / relay | tráfico en claro (BLE/Wi-Fi/Zigbee), RFID clone, NFC relay, sub-GHz replay de puerta, GATT/HID sin auth |
| 2 | DoS / degradación / tracking de identidad | deauth masivo, jamming (jaula = demo), BLE advertising tracking, identifier leakage, frame-counter reset |
| 1 | Observacional / info disclosure sin explotación directa | factibilidad de captura, SSID/BD_ADDR visible, firmware antiguo sin CVE confirmado, canal abierto |

Impacto fija el **techo**: 4 nunca baja de `high`; 3 fija techo `high` (puede bajar a `medium`); 2 fija `medium`; 1 fija
`low/info`.

#### Eje 2 — Explotabilidad (fricción para reproducir)

| Puntaje | Fricción | Ejemplos RF |
|---------|----------|-------------|
| 4 | Trivial: hardware común, RX pasivo, sin timing | SDR + Wireshark lee Zigbee en claro; rtl_433 decode remoto; BD_ADDR visible en advertising |
| 3 | Baja: hardware común pero necesita timing o proximidad | capturar 4-way handshake Wi-Fi; BLE pairing (ventana corta); sniff NFC pasivo |
| 2 | Media: hardware especializado o modo activo | Proxmark3 para MIFARE nested; btlejack (micro:bit); HackRF TX para replay sub-GHz; gps-sdr-sim |
| 1 | Alta: contención obligatoria + licencia + hardware raro | srsRAN+Open5GS rogue BTS (jaula+SIM+licencia); UWB DW3000-class; bladeRF+GPSDO LTE demod confiable |

Explotabilidad **sube** la severidad cuando es 4 (impacto 3 + explotabilidad 4 → `high`) y **baja** cuando es 1
(impacto 4 GNSS spoof en jaula = `high`, no `critical` — demostrado en contención, no reproducible en campo).

#### Eje 3 — Exposición (superficie afectada)

| Puntaje | Superficie | Ejemplos RF |
|---------|------------|-------------|
| 4 | Infraestructura pública / masiva | GNSS spoofing, ADS-B forgery, rogue cell (todos los USIM en celda), NWK key Zigbee (toda la red) |
| 3 | Una red / fleet / infraestructura del cliente | Wi-Fi PSK (toda la red), LoRa AppKey compartida (todos los OTAA), Zigbee PAN sin rekey |
| 2 | Un enlace / un dispositivo | BLE pair de un device, RFID tag individual, sub-GHz mando de una puerta, UWB ranging de un activo |
| 1 | Un identificador / metadata | BD_ADDR persistente, SSID broadcast, DevEUI, IMSI pasiva (sin harvest confirmado) |

Exposición **sube** la severidad: impacto 3 (relay RFID) con exposición 4 sube a `high`. Impacto 4 con exposición 1
(un tag con claves únicas no reciclables) confirma `high` pero no necesariamente `critical`.

#### Eje 4 — Alcance (lo alcanzado vs lo posible) — discreto

| Valor | Qué se reporta | Regla |
|-------|----------------|-------|
| **A — Alcanzado** | Demostrado en el modo actual con evidencia suficiente (§4 / SKILL.md §EVIDENCIA). | Severidad = la del modelo (ejes 1–3). |
| **B — Demostrado en contención** | Demostrado en Lab con jaula/conducción, no reproducible en campo. | Severidad del modelo, etiquetada `contained` en el finding; `critical` baja a `high`. |
| **C — Hipotético (no alcanzado en este modo)** | Viable pero no ejecutado (observacional, hardware ausente, Ruta A). | **Máximo `medium`**, `status: hypothesis`, evidencia parcial. Nunca `high`/`critical` sin PoC. |
| **D — Defensivo (detección, no explotación)** | Modo Defensivo: se detectó una amenaza, no se explotó. | Severidad = impacto de la amenaza, pero tipo `detection`; el reporte describe qué se detectó. |

Alcance **baja** la severidad cuando es C o D, y la **etiqueta** cuando es B. Nunca la sube. Formaliza la regla
"la severidad refleja lo que ALCANCÉ" (SKILL.md §SEVERIDAD, checklist ítem 2).

### 7.2 — Tabla de decisión (Impacto × moduladores → severidad)

Parte del Impacto (techo) y aplica Explotabilidad/Exposición como moduladores, luego Alcance como tope final.
Encuentra tu fila por (Impacto, Explotabilidad, Exposición) y lee la columna según el Alcance.

| Impacto | Explotabilidad | Exposición | Base (A) | Contained (B) | Hipótesis (C) | Detection (D) |
|---------|-----------------|------------|----------|----------------|----------------|----------------|
| 4 | 3–4 | 2–4 | **critical** | **high** (contained) | **medium** (hypothesis) | medium (detection) |
| 4 | 1–2 | 2–4 | **high** | **high** (contained) | **medium** (hypothesis) | medium (detection) |
| 4 | 3–4 | 1 | **high** | high (contained) | medium (hypothesis) | low (detection) |
| 3 | 3–4 | 3–4 | **high** | high (contained) | medium (hypothesis) | medium (detection) |
| 3 | 1–2 | 3–4 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 3 | 3–4 | 1–2 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 3 | 1–2 | 1–2 | **medium/low** | low (contained) | low (hypothesis) | low (detection) |
| 2 | 3–4 | 3–4 | **medium** | medium (contained) | low (hypothesis) | low (detection) |
| 2 | 1–2 | 1–4 | **low** | low (contained) | low (hypothesis) | low (detection) |
| 1 | 1–4 | 1–4 | **info** | info (contained) | info (hypothesis) | info (detection) |

Las celdas "medium/low" piden juicio: impacto 3 con data leak de baja sensibilidad → `low`; con credencial → `medium`.

### 7.3 — Reglas de oro que la tabla codifica

1. **Sin PoC (Alcance C) el máximo es `medium`.** Un hallazgo hipotético nunca es `high`/`critical` en el reporte,
   sin importar el impacto teórico.
2. **`critical` exige Impacto 4 + Explotabilidad ≥3 + Exposición ≥2 + Alcance A.** Takeover/key recovery confirmado
   en campo (no jaula) con hardware alcanzable. La jaula lo baja a `high` (contained).
3. **Infraestructura pública (Exposición 4) sube un nivel si el impacto es 2–3.** Jamming GNSS (impacto 2, DoS) con
   exposición 4 sube a `medium` aunque la explotabilidad sea 1 (necesita jaula) — el riesgo sistémico importa aunque
   la demo sea contenida. Solo aplica si Alcance A o B; en hipótesis queda `medium`.
4. **Modo Defensivo (Alcance D) nunca reporta `critical`.** Detección no es explotación. El `critical` de la amenaza
   detectada se documenta en `notes` (contexto para el cliente), no en `severity`.
5. **`info` es solo observacional (Impacto 1).** Cualquier hallazgo con impacto 2+ no puede ser `info`.

### 7.4 — Integración con suficiencia de evidencia (§4 + SKILL.md §EVIDENCIA)

El modelo de §7.2 produce la severidad; §4 / SKILL.md §EVIDENCIA verifican que la evidencia soporta esa severidad.
Si no la soporta, mandan degradar:

```
hallazgo → ejes 1–4 → severidad del modelo → ¿evidencia suficiente?
  ├─ sí → severity confirmada, status=confirmed
  └─ no  → degradar un nivel, evidence_status=partial
```

No hay severidad sin evidencia que la respalde.

### 7.5 — Mapeo a CVSS 4.0

CVSS 4.0 (§5) sigue siendo el **vector externo** del hallazgo (reporte técnico, cliente). El modelo de 4 ejes es la
**decisión interna**. Mapeo:

| Eje del modelo | Métrica CVSS 4.0 | Nota |
|----------------|------------------|------|
| Impacto | `VC`/`VI`/`VA` (Vulnerable) + `SC`/`SI`/`SA` (Subsequent) | Impacto 4 → VC:H/VI:H; impacto 2 (DoS) → VA:H |
| Explotabilidad | `AC` (L/H) + `AT` (N/P) + `PR` | Explotabilidad 1 → AC:H/AT:P; explotabilidad 4 → AC:L/AT:N |
| Exposición | (no hay métrica directa) | CVSS no captura cuántos dispositivos se ven afectados; el agente lo nota en `notes` |
| Alcance | (no hay métrica; refleja el modo) | Alcance C → status=hypothesis, no afecta el vector; Alcance B → nota `contained` en `notes` |

La columna Exposición es la diferencia clave: CVSS no la captura, el modelo RF sí.

### 7.6 — Ejemplos trabajados

| # | Hallazgo | Impacto | Explotab. | Expos. | Alcance | Severidad | CVSS |
|---|---------|---------|-----------|--------|---------|-----------|------|
| E1 | btlejack hijack BLE confirmado en campo sobre device propio | 4 | 2 (micro:bit) | 2 (un device) | A | **critical** | AV:A/AC:L/VC:H/VI:H |
| E2 | MIFARE Classic key dump + clone confirmado | 4 | 2 (PM3) | 2 (un tag) | A | **critical** | AV:A/AC:L/VC:H/VI:H |
| E3 | Wi-Fi WPA2 handshake crackeado, PSK recuperada | 4 | 3 (esperar handshake) | 3 (toda la red) | A | **critical** | AV:A/AC:L/VC:H/VI:H |
| E4 | GNSS spoofing demostrado en jaula con gps-sdr-sim | 4 | 1 (jaula+licencia) | 4 (infra pública) | B | **high** (contained) | AV:A/AC:H/VA:H |
| E5 | Rogue cell srsRAN en jaula con SIM de prueba | 3 (identity harvest teórico) | 1 | 4 | B | **high** (contained) | AV:A/AC:H/VC:L |
| E6 | Tráfico Zigbee en claro leído con SDR+Wireshark | 3 | 4 (RX pasivo) | 3 (red) | A | **high** | AV:A/AC:L/VC:H |
| E7 | Replay sub-GHz de puerta con rfcat (fijo, sin rolling) | 3 | 4 | 2 (una puerta) | A | **high** | AV:A/AC:L/VC:L/VI:L |
| E8 | BLE advertising tracking (BD_ADDR persistente) | 2 | 4 | 1 | A | **medium** | AV:A/AC:L/VC:L |
| E9 | RFID relay demostrado sin keys (Proxmark MITM) | 3 | 2 | 2 | A | **medium** | AV:A/AC:L/VC:H/VI:L |
| E10 | Deauth Wi-Fi masivo sobre red propia en modo activo | 2 | 4 | 3 | A | **medium** | AV:A/AC:L/VA:H |
| E11 | Sub-GHz replay viable pero hardware ausente (Ruta A) | 3 | 4 | 2 | C | **medium** (hypothesis) | n/a (no PoC) |
| E12 | Crocodile Hunter detecta IMSI catcher en entorno del operador | 3 (amenaza detectada) | n/a | 4 | D | **medium** (detection) | n/a (detection) |
| E13 | Firmware antiguo BLE sin CVE confirmado | 1 | 4 | 1 | A | **info** | n/a |

### 7.7 — Priorización para reporte y remediación

La severidad producida por el modelo es la priorización: el reporte técnico y la lista de remediación se ordenan
descendente (critical → high → medium → low → info). Dentro del mismo nivel, desempata Exposición (mayor superficie
primero) y luego Explotabilidad (más friccionable primero).

**Excepción operacional — Modo Defensivo:** una **amenaza activa detectada** (Alcance D) encabeza el reporte aunque
su severidad técnica sea `medium` — la urgencia operacional (amenaza en curso en el entorno defendido) supera la
severidad técnica cuando hay intrusión activa. Los hallazgos ofensivos confirmados (`critical`/`high`) siguen
encabezando si coexisten con detecciones en el mismo reporte.

**Regla de remediación (ver `references/03-registro-hallazgos.md §7.7`):** `critical`/`high` exigen las 3 capas
(Developer/Integrator/Operator); `medium` requiere al menos Integrator + Operator; `low`/`info` pueden cerrar con
Operator solo.
