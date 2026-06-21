# Resumen Ejecutivo — Auditoría de Seguridad de Radiofrecuencia · {{OBJETIVO}}

> Plantilla del **resumen ejecutivo** de una auditoría RFSAM, dirigida a
> patrocinadores y comités no técnicos. **Sin comandos, sin vectores CVSS, sin
> IDs de control.** El agente traduce los hallazgos del informe técnico
> (`assets/report-template.md`) a riesgo de negocio, impacto y prioridades de
> remediación. Reemplaza los marcadores `{{...}}` con lenguaje claro y
> concreto. Longitud objetivo: **1–2 páginas**. Si excede, recortar detalle y
> moverlo a un anexo del informe técnico.

**Fecha de entrega**: {{ISO}}
**Preparado para**: {{nombre/cargo del patrocinador o comité}}
**Preparado por**: {{nombre/rol del auditor}}
**Clasificación**: {{Confidencial / Interno / Público}}
**Informe técnico asociado**: `{{ruta a informe-rfsam-<objetivo>.md}}`

---

## 1. Contexto en una frase

{{Una o dos oraciones: qué sistema o entorno de radiofrecuencia se evaluó, por
qué importa al negocio y bajo qué encargo se realizó. Ej.: «Se revisó la
exposición inalámbrica de la planta de manufactura X para confirmar que las
comunicaciones de control y los dispositivos móviles no permiten accesos no
autorizados.»}}

## 2. Conclusión principal

{{Veredicto ejecutivo en 2–3 líneas: nivel de riesgo global y cuál es el
mensaje único que debe llevarse el lector. Ej.: «El entorno presenta riesgos
inhalámbricos **altos** concentrados en 3 hallazgos críticos. Son cerrables en
menos de 90 días con acciones coordinadas de los proveedores de los
dispositivos y el equipo de operaciones.»}}

**Riesgo global**: {{Crítico / Alto / Medio / Bajo}}

---

## 3. Hallazgos en cifras

| Nivel de riesgo | Cantidad | Qué significa en la práctica |
|-----------------|----------|------------------------------|
| **Crítico** | {{c}} | Explotable hoy; puede comprometer operaciones, datos o seguridad física |
| **Alto** | {{h}} | Explotable con esfuerzo o bajo condiciones específicas; impacto serio si ocurre |
| **Medio** | {{m}} | Requiere acceso favorable o combinaciones; impacto limitado o localizado |
| **Bajo / Informativo** | {{l}} | Endurecimiento recomendado; sin exposición inmediata |

> Total de hallazgos confirmados: **{{N}}**. Adicionalmente **{{nh}}** se
> documentan como hipótesis verificables que requieren pruebas adicionales en
> entorno controlado antes de confirmarse.

---

## 4. Riesgos que requieren atención inmediata

> Un bloque por hallazgo **crítico o alto**. Máximo 5–7 ítems; si hay más,
> agrupar por tema. Para cada uno: **qué pasa** (sin jerga), **a qué afecta**
> (negocio/operación/cumplimiento/seguridad) y **qué tan fácil es explotarlo**.
> No incluir cómo se explota ni pasos técnicos.

### Riesgo 1 — {{título corto, orientado a negocio}}
- **Qué observamos**: {{descripción en lenguaje llano. Ej.: «Cualquier persona
  con equipo accesible en el mercado puede suplantar la señal de los sensores y
  enviar lecturas falsas al sistema central.»}}
- **Impacto si se materializa**: {{operacional / financiero / de seguridad /
  regulatorio / reputacional. Ej.: «Decisiones automatizadas tomadas sobre datos
  falseados; posible paro de línea y rechazos de calidad.»}}
- **Probabilidad de ocurrencia**: {{Alta / Media / Baja}} — {{razón breve:
  herramientas disponibles públicamente / requiere cercanía física / exige
  conocimiento especializado}}.
- **Prioridad de cierre**: {{Inmediata / 30 días / 90 días}}.

{{... más riesgos en orden de prioridad ...}}

---

## 5. Qué está bien

{{2–4 viñetas cortas sobre controles, capas o prácticas que sí funcionan y que
la auditoría confirmó como robustas. Equilibra el mensaje y orienta dónde NO
intervenir. Ej.: «La encriptación de la red Wi-Fi corporativa usa estándares
actuales y no presentó debilidades; los dispositivos LoRa usan claves únicas
por nodo y no son clonables.»}}

---

## 6. Plan de acción recomendado

| Prioridad | Riesgo a cerrar | Acción principal (sin detalle técnico) | Responsable sugerido | Esfuerzo estimado | Plazo |
|-----------|-----------------|----------------------------------------|----------------------|-------------------|-------|
| 1 | {{Riesgo 1}} | {{acción de negocio, ej.: «Coordinar con el proveedor del sensor el cambio de mecanismo de autenticación.»}} | {{Operaciones / TI / Proveedor}} | {{Bajo/Medio/Alto}} | {{inmediato / 30d / 90d}} |
| 2 | {{Riesgo 2}} | {{...}} | {{...}} | {{...}} | {{...}} |
| 3 | {{...}} | {{...}} | {{...}} | {{...}} | {{...}} |

> Los hallazgos **críticos y altos** requieren acción coordinada en tres
> niveles: el **fabricante** del dispositivo/firmware, el **integrador** que
> despliega y configura, y el **operador** que monitorea y responde. Los
> hallazgos **bajos o informativos** pueden cerrarse con acciones del operador
> únicamente.

---

## 7. Alcance y confianza

- **Qué cubrimos**: {{protocolos y dispositivos evaluados, modo de operación:
  solo escucha pasiva / pruebas activas autorizadas / entorno de laboratorio}}.
- **Qué NO cubrimos**: {{protocolos o dispositivos fuera de alcance; ventanas
  de tiempo o bandas no observadas; dispositivos que no estuvieron operativos
  durante la auditoría}}.
- **Confianza**: los hallazgos **confirmados** están respaldados por evidencia
  reproducible. Los marcados como **hipótesis** requieren verificación
  adicional antes de tomarse como ciertos.
- **Cumplimiento aplicable**: {{si aplica, mencionar marcos relevantes — ISO
  27001, IEC 62443, PCI-DSS, regulación local de espectro— y si la auditoría
  aporta evidencia a favor o en contra}}.

---

## 8. Próximos pasos sugeridos

1. **Validar prioridades** con el equipo técnico y de negocio (reunión de 1 hora).
2. **Iniciar cierre** de hallazgos críticos en la ventana acordada.
3. **Re-auditar** tras aplicar remediación para confirmar el cierre efectivo.
4. **Establecer cadencia** de revisión de superficie inalámbrica (semestral o
   ante cambios relevantes en el parque de dispositivos).

---

_Resumen ejecutivo generado siguiendo RFSAM (CC BY-SA 4.0). El detalle técnico
completo, comandos, evidencia y mapeo a controles están en el informe técnico
asociado. Para preguntas técnicas, contactar al auditor; para decisiones de
negocio, al patrocinador._
