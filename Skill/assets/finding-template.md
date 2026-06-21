# Plantilla de Hallazgo RF — {{RF-NNN}}

> Documento **standalone por hallazgo**. Úsalo para `critical`/`high` que merecen un
> write-up detallado más allá de la sección del informe (ver `assets/report-template.md §4`).
> El bloque compacto del chat vive en `references/03-registro-hallazgos.md §3`; el modelo
> completo de 4 ejes (tabla de decisión, ejemplos trabajados) en `§7` del mismo archivo.

**ID**: {{RF-NNN}}
**Título**: {{título específico del hallazgo}}
**Protocolo/Capa**: {{BLE / AT}} · **Control RFSAM**: `{{RFSAM-BLE-AT-01}}`
**Severidad**: {{CRITICAL / HIGH / MEDIUM / LOW / INFO}} · **Estado**: {{confirmed / hypothesis}}
**Fecha**: {{ISO}}

---

## Modelo RFSAM de 4 ejes

> Recorre los ejes en orden (Impacto fija el techo; los demás modulan). Tabla de decisión:
> `references/03-registro-hallazgos.md §7.2`.

| Eje | Valor | Justificación (1 línea) |
|-----|-------|--------------------------|
| **Impacto** (1–4) | {{4}} | {{takeover / clave recuperada / datos en claro / DoS / observacional}} |
| **Explotabilidad** (1–4) | {{2}} | {{hardware necesario + fricción para reproducir}} |
| **Exposición** (1–4) | {{2}} | {{un dispositivo / una red / infraestructura pública}} |
| **Alcance** (A/B/C/D) | {{A}} | {{alcanzado en campo / demostrado en jaula (B) / hipotético (C) / defensivo (D)}} |

**CVSS 4.0**: `{{CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N}}` ({{score}}, {{sev}})

---

## Descripción

{{Qué se encontró, mecanismo técnico y por qué importa. Nombra el dispositivo/escenario, el
protocolo y la capa del descenso donde se detectó. Cita la vulnerabilidad subyacente (CVE /
spec debilitada / mala configuración) con fuente verificable. Una afirmación no trivial sin
fuente se flagea (ver `references/03-registro-hallazgos.md §6`).}}

---

## Impacto

{{Qué consigue un atacante real en campo: takeover, robo de credenciales, replay, DoS,
tracking de identidad. Conecta con el eje Impacto de arriba. Si el Alcance es B/C/D, aclara
qué se demostró vs qué queda hipotético — la severidad refleja lo que ALCANZASTE, no lo que
podría alcanzarse en teoría.}}

---

## Evidencia

```
COMANDO: {{tool + flags exactos — verbatim}}
SALIDA:  {{fragmento que confirma el hallazgo — AA, clave recuperada, 200 OK, frame decodificada, ...}}
```

> Captura cruda en `loot/captures/{{PROTO}}-{{fase}}-{{NN}}-{{timestamp}}.{{ext}}`.
> La evidencia mínima depende de la severidad — ver `SKILL.md §EVIDENCIA REPRODUCIBLE`.

---

## Reproducción segura

> Cada `poc/{{RF-NNN}}/` lleva un `repro.txt`. **Sin `repro.txt`, el finding es hipótesis,
> no hallazgo confirmado** — no entra al reporte como confirmado.

```
OBJETIVO:    {{dispositivo/escenario exacto}}
HARDWARE:    {{SDR / sniffer + versión}}
SOFTWARE:    {{tool + versión · OS}}
COMANDO:     {{verbatim — flags, parámetros, frecuencia, sample rate, gain, canal}}
CONDICIONES: {{proximidad · modo (observacional/activo/lab) · contención si aplica}}
RESULTADO:   {{salida observable esperada que confirma}}
```

> ⚠ **Marcadores de seguridad**: si el comando implica transmisión (`⚠TX`), re-confirma
> autorización en `loot/scope.txt` antes de ejecutar (ver gate de `SKILL.md`). Si es RX
> pasivo, verifica el marcador RX de la herramienta (`references/25-troubleshooting.md §1`).
> Infraestructura crítica (GNSS / ADS-B / rogue cell) exige contención (jaula/conducción)
> incluso en modo activo.

---

## Mitigación (3 capas)

> Modelo de remediación RFSAM — heredado de los 49 controles. `critical`/`high` exigen las 3
> capas; `low`/`info` pueden cerrar con Operator solo. Ver `references/03-registro-hallazgos.md §7`.

- **Desarrollador** (fabricante / firmware): {{cambios en código o configuración del producto —
  ej. forzar ECDH, rotar NWK key, cifrar GATT, implementar rolling code robusto}}
- **Integrador** (despliegue / configuración): {{cambios en el despliegue — ej. rekey tras
  comisión, deshabilitar pairing legacy, segmentar PAN, exigir LESC}}
- **Operador** (uso / monitoreo): {{cambios operacionales — ej. monitorear advertising
  anómalo, rotar credenciales con periodicidad, auditoría periódica, registrar solo tags
  autorizados}}

---

## Referencias

- {{CVE-XXXX-XXXX — https://...}}
- {{Paper: Autor, "Título", venue año — https://...}}
- {{Tool: name — https://github.com/...}}
- {{Spec: Bluetooth Core Spec v5.4, Vol 6 Part B}}

---

_Generado con RFSAM (CC BY-SA 4.0). Evidencia reproducible en `loot/`. Re-validar tras
aplicar remediación._
