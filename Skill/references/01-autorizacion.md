# 01 — Protocolo de Autorización y Marco Legal

> **Lee esto antes de cualquier paso activo (capa AT) o de transmitir.** RFSAM es intrínsecamente
> de doble uso. La RF cruza propiedad física y espectro regulado: lo que recibes puede no ser tuyo,
> y lo que transmites casi nunca es legal sin permiso. Esta no es burocracia — es la diferencia
> entre una auditoría y un delito.

## Índice
1. Tres modos de operación
2. Matriz de legalidad por técnica
3. Protocolo de confirmación (gate 0)
4. Jurisdicciones — referencia rápida
5. Contención RF para lab
6. Documentación de scope

---

## 1. Tres modos de operación

Antes de empezar, el agente **debe preguntar** y registrar el modo:

| Modo | Qué permite | Qué prohíbe |
|------|-------------|-------------|
| **(1) Observacional / pasivo** | RX pasivo (sniff, survey, waterfall) sobre tráfico que puedes recibir legalmente | Cualquier TX, replay, inyección, jamming, spoofing, conexión a dispositivos ajenos |
| **(2) Activo con autorización** | Todo lo anterior + TX/replay/inject **solo sobre equipos propios o con autorización escrita** del dueño, respetando límites de potencia/duty-cycle del espectro no licenciado | Cualquier acción sobre equipos ajenos o espectro licenciado sin licencia de prueba |
| **(3) Lab RF contenido** | Todo lo anterior + jamming/spoofing/rogue-cell **dentro de jaula de Faraday o conducción cableada**, con SIMs/dispositivos de prueba | Radiar al aire jamming, GNSS, ADS-B o células falsas bajo cualquier circunstancia |

**Default seguro**: si el usuario no especifica, o hay duda → **modo (1) observacional**. Los pasos
AT se documentan como hipótesis a verificar en entorno autorizado, **nunca se ejecutan**.

## 2. Matriz de legalidad por técnica

| Técnica | ¿Permitido sin autorización? | Restricciones |
|---------|------------------------------|---------------|
| Recepción pasiva (sniff, survey) | Generalmente sí | Datos personales de terceros sí regulados (GDPR/privacidad) |
| Capturar tráfico de tu dispositivo | Sí (es tuyo) | — |
| Capturar tráfico de terceros | Depende | Suele ser ilegal descifrar/usar; RX de señales públicas (ADS-B) OK |
| Conectarse a dispositivo ajeno (BLE GATT) | **No** sin permiso | Acceso no autorizado |
| Transmitir / replay / forge | **No** sin permiso explícito del dueño del dispositivo | — |
| Deauth Wi-Fi / disconexión forzada | **No** sin permiso | Interrumpe servicio de terceros |
| Jamming (saturar banda) | **Casi nunca** | Ilegal al aire en casi todas las jurisdicciones (FCC, ITU) |
| Spoofing GNSS al aire | **No** (delito) | Solo conducción/cable + jaula |
| Spoofing/forging ADS-B al aire | **No** (espectro de aviación protegido) | Solo conducción + jaula |
| Rogue cell LTE/GSM/5G (IMSI catcher) | **No** (espectro licenciado) | Solo lab + SIMs de prueba + licencia de prueba + jaula |
| Clonar/emular RFID propio | Sí (es tuyo) | Clonar credenciales ajenas = fraude |
| Forzar re-pair/re-join de tu red | Sí (es tuya) | — |

## 3. Protocolo de confirmación (gate 0)

**La primera interacción del agente con el usuario, antes de cualquier captura, debe ser:**

> "Antes de proceder, necesito confirmar el marco de autorización para esta auditoría RF:
>
> 1. ¿El objetivo es **tuyo** o estás **autorizado por escrito** para auditarlo?
> 2. ¿En qué modo trabajo?
>    - (1) **Observacional/pasivo** — solo RX, sin tocar dispositivos activamente
>    - (2) **Activo con autorización** — TX/replay/inject sobre equipos autorizados
>    - (3) **Lab RF contenido** — jaula de Faraday o conducción cableada
>
> Registraré tu respuesta en `loot/scope.txt`. Si hay duda, opero en modo observacional."

- Registrar la respuesta en `loot/scope.txt` (la crea el snippet de Fase 0 del SKILL.md).
- **Re-verificar** el scope antes de cada paso AT. Si el scope dice observacional → bloquear AT.
- Ante ambigüedad ("es de un amigo", "creo que puedo") → asumir observacional y advertir.

## 4. Jurisdicciones — referencia rápida

> No es asesoría legal. Solo orientación. Verifica la ley local antes de operar.

- **EE.UU.**: FCC regula el espectro. Jamming es ilegal (Communications Act §333). Spoofing GNSS
  ilegal. Interceptación de comunicaciones electrónicas (Wiretap Act) restringe captura de contenido.
  Excepciones: equipment owner, con consentimiento, o autoridad legal.
- **UE/UK**: reguladores nacionales + regulatorio harmonizado. Interceptación sin consentimiento
  ilegal (Ley de Comunicaciones). GDPR aplica a datos personales en capturas.
- **Latam**: varía. Generalmente: interceptar comunicaciones ajenas es delito; jamming suele estar
  prohibido; RX pasivo de señales públicas suele ser legal. Verifica país por país.
- **Espectro licenciado (celular)**: transmitir sin licencia es ilegal **en todas partes**. El
  trabajo con rogue cells exige licencia de prueba experimental + contención.

**Principio universal**: transmitir en bandas licenciadas, jamming al aire, o spoofing de señales
de seguridad (GNSS, ADS-B) sin autorización es delito. No lo hagas fuera de un lab contenido.

## 5. Contención RF para lab

Para modo (3), las formas de contener la señal:

- **Jaula de Faraday**: caja/estructura conductiva que bloquea la RF saliente/entrante. Verifica
  atenuación con un teléfono dentro (debe perder señal).
- **Conducción cableada**: conecta el TX SDR al receptor/dispositivo bajo prueba por cable coaxial
  con atenuadores, nunca por antena. Elimina la radiación al aire.
- **Atenuadores**: limitan la potencia para que la señal no escape del setup cableado.
- **GPSDO blindado**: para spoofing GNSS, el TX va por cable al receptor bajo prueba, nunca al aire.

**Validación**: antes de transmitir en lab, confirma con un SDR o teléfono externo que **no** hay
fuga de señal fuera de la contención.

## 6. Documentación de scope

`loot/scope.txt` debe contener mínimo:

```
Objetivo: [descripción del dispositivo/señal]
Propietario / autorización: [PROPIO / CONTRATO <ref> / LAB]
Modo: [observacional / activo / lab-contenido]
Autorizado por: [nombre/rol del autorizante, si aplicable]
Fecha: [ISO timestamp]
Protocolo(s) en scope: [BLE / WIFI / ...]
Limitaciones: [ej. solo RX; no deauth; no clonar credenciales reales]
```

Este archivo es lo que `scaffold_report.py` incluye en la sección "Alcance y autorización" del
informe, y lo que justifica cada paso activo ejecutado.
