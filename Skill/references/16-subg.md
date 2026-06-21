# 16 — Sub-GHz ISM / Remotes

> Wayfinder + controles RFSAM para Sub-GHz (controles de garage, sensores, TPMS, medidores).

## Facts
- **Bandas**: 315 MHz (NA/Asia remotes & TPMS) · 433.92 MHz (global, workhorse) · 868 MHz (EU, wM-Bus) · 915 MHz (US ISM 902–928).
- **Modulación**: casi todo OOK/ASK (carrier parpadea) o (G)FSK (dos tonos). Sin spread spectrum → fácil demodular.
- **Encoding/baud**: PWM/Manchester/PPM a cientos-miles baud, bursts cortos repetidos.
- **Tipo de código**: fijo (mismo payload siempre — trivial replay) vs rotatorio/hopping (KeeLoq/HCS301 — nuevo valor cada press).
- **Crypto**: la mayoría **sin confidencialidad** (payload en claro). Código rotatorio = resistencia a replay, no encriptación. KeeLoq necesita manufacturer key para forjar siguiente código (no se obtiene de captura pasiva).
- **Targets**: garage/gate remotes, car key fobs, TPMS, weather/soil sensors, smart-home plugs/doorbells, wM-Bus meters, alarm contacts.

## Descenso por capa

### IG (fingerprinting)
- Frecuencia (FCC ID → fccid.io), modulación (OOK/ASK vs FSK), encoding/baud, **fijo vs rotatorio** (lo que decide todo), chip (CC1101, PT2262/EV1522, HCS301/KeeLoq), device class (rtl_433 tiene 320+ decoders).

### SP — `RFSAM-SUBG-SP-01` Burst discovery and characterisation
- **Objetivo**: dónde transmite; ver bursts al trigger. RTL-SDR basta (sub-GHz).
- **Kit**: Gqrx (waterfall), rtl_433 (live device scan → JSON), catnip (SX1262 spectrum analyzer).
- **Comando**: `rtl_433 -f 433.92M` → decodifica dispositivo conocido a JSON.

### PHY — `RFSAM-SUBG-PHY-01` Demodulation and framing
- **Objetivo**: clean recording del burst, demod+frame en un pase (señal simple). Grabar I/Q centrado en carrier, rate que cubra ancho de banda.

### LL — `RFSAM-SUBG-LL-01` Frame and addressing recovery
- **Objetivo**: burst → bits → fields. Dispositivo conocido: rtl_433 decodifica directo a JSON. Desconocido: Universal Radio Hacker (auto-detect mod/baud, diff bitstream). Pocket: rfcat (YARD Stick One), Flipper Zero (Read/Read RAW).
- **Kit**: rtl_433, Universal Radio Hacker, rfcat+yard-stick-one, Flipper Zero, catnip (SX1262 GFSK packets).

### CR — `RFSAM-SUBG-CR-01` Rolling-code assessment
- **Objetivo**: honestidad — nada que "romper" en la mayoría (no hay crypto). Código fijo = se lee en LL. Código rotatorio = resistencia a replay, **no** canal cifrado. Para forjar siguiente código necesitas manufacturer key (no en captura pasiva). KeeLoq cryptanalysis académica fuera de scope.
- **Sin tool de crack offline** — lee fijos, captura-y-replaya rotatorios (AT).

### AT — `RFSAM-SUBG-AT-01` Replay and forge
- **⚠ AUTORIZACIÓN OBLIGATORIA** (transmite sub-GHz; respeta potencia/duty-cycle ISM).
- **Objetivo**: código fijo → replay trivial. Código rotatorio → RollJam (jam+capture código sin usar, úsalo luego), RollBack (desync counter por replay masivo = DoS), brute force keyspace pequeño (DIP-switch EV1527/PT2262).
- **Kit**: rfcat (replay fixed), Universal Radio Hacker (replay/edit TX), Flipper Zero (field replay fixed), catnip (GFSK TX scriptable).
- **Comando**: rfcat → `d.RFxmit(captured_bytes)`.

### AP
- Sin pila separada: rtl_433 JSON = capa app (sensor values, IDs, flags). Forjas esos valores para engañar gateway/display.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de sub-GHz; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Frecuencia y modulación confirmadas. **FCC ID** (fccid.io) resuelve freq/mod exactos | — |
| SP → PHY | Bursts cortos en press/sensor report confirmados. RTL-SDR basta | — |
| (PHY+LL en una pasada) | Clean recording del burst → demod+frame (señal simple, low baud) | — |
| LL → CR | ¿Código **fijo** (en claro, replayable) o **rotatorio** (KeeLoq/HCS301)? | — |
| CR → AT | Fijo confirmado (replayable) o rolling (→ RollJam en AT). La mayoría **sin crypto** → CR suele ser "lectura" | — |
| AT | ⚠TX re-check (radio TX requerido: rfcat/YARD Stick/Flipper/catnip); ⚠ replay sobre terceros = **RA7** | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): bursts en tu banda **sin dispositivo propio conocido** = posible scanner/replay de vecino. Correlaciona con tu actividad.

## Advertencias legales
- RX pasivo sub-GHz OK.
- **TX/replay/forge = activo**: solo dispositivos propios/autorizados. Abrir garage/alarma ajena = allanamiento/robo. Jamming ISM ilegal al aire en muchas jurisdicciones.
- Flipper stock firmware **rehúsa** guardar/replayar rolling codes por diseño (solo fijos).
