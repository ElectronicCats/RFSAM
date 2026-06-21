# 15 — RFID / NFC

> Wayfinder + controles RFSAM para RFID/NFC. Near-field (acoplamiento magnético), no far-field.

## Facts
- **Bandas**: LF 125/134 kHz · HF 13.56 MHz. Centímetros por diseño.
- **LF**: EM4100/EM4102, HID Prox (125 kHz), Indala, T5577 (clonable), HITAG — IDs read-only, poca crypto.
- **HF**: ISO 14443-A/B (MIFARE Classic, Ultralight, NTAG, DESFire, EMV contactless), ISO 15693 (iCODE), FeliCa.
- **Crypto**: MIFARE Classic = Crypto1 (48-bit, **roto**: darkside/nested/hardnested/mfkey32). DESFire EV1/2/3 (AES/3DES) y NTAG modernos **no rompibles** con Crypto1.

## Descenso por capa

### IG (fingerprinting)
- Banda (LF vs HF), estándar/chip family, UID (fijo vs cambiable), sectores MIFARE con claves default, modo seguridad. Proxmark `lf search`/`hf search` autodetecta.

### SP — `RFSAM-RFID-SP-01` Carrier and standard identification
- **Objetivo**: energizar tag y leer carrier/estándar/chip; o sniff pasivo reader↔card.
- **Kit**: pm3-client (`lf search`, `hf search`, `hf 14a sniff`/`hf 15 sniff`/`lf sniff` pasivo), Chameleon Ultra GUI.
- **Comando**: `pm3` → `hf search`.

### PHY (sin control — demod en el reader)
- El analog front-end del reader demodula la load-modulation; el cliente saca los bytes. No hay etapa I/Q separada.

### LL (integrado en SP — read/dump)
- Proxmark lee/dumpea LF+HF; libnfc con ACR122U (HF); Chameleon/BomberCat standalone.

### CR — `RFSAM-RFID-CR-01` Crypto1 / key-strength assessment
- **Objetivo**: romper MIFARE Classic. Con 1 clave conocida → nested; sin ninguna → darkside; hardnested para EV1 endurecido; mfkey32/64 de transacción sniffed.
- **Kit**: pm3-client (suite Crypto1 completa), mfoc (nested, libnfc), mfcuk (darkside).
- **Comando**: `pm3` → `hf mf nested 1 <A> <key>` o `hf mf hardnested`.
- **Honestidad**: DESFire/NTAG moderno (AES) fuera de scope — reconócelo y para.
- **Nota near-field**: en RFID la CR es interrogación **live del tag** a cm (el Proxmark energiza y desafía la tarjeta), no análisis de PCAP offline como en far-field (BLE/Wi-Fi/LoRa). No es TX de ataque al espectro y no dispara re-check TX, pero difiere del patrón "CR offline" del flujo maestro.

### AT — `RFSAM-RFID-AT-01` Clone, emulate and relay
- **⚠ AUTORIZACIÓN OBLIGATORIA** para clonar/relay credenciales reales.
- **Objetivo**: clonar a blank/mágica, emular, o relay (vence asunción de proximidad, sin claves).
- **Kit**: pm3-client (write T5577/mágica, `hf mf sim`, relay `hf_reblay`), Chameleon Ultra GUI (emular slots), BomberCat (RelayNFC + MagSpoof).
- **LF EM/HID**: clona directo a T5577.

### AP
- Leer significado del dump: facility/card number (Wiegand 26-bit), value blocks (tránsito), NDEF. mfdread renderiza dump MIFARE Classic legible.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de RFID/NFC; los comandos verbatim viven en `Descenso por capa` arriba. Near-field (cm), **no** far-field — SP es carrier ID, no waterfall.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Tipo de tag identificado. **Fork primero**: LF 125 kHz vs HF 13.56 MHz | — |
| SP → LL | Carrier/standard/chip confirmados (power el tag y leer, o `hf 14a sniff`/`lf sniff` pasivo) | — |
| (PHY fusionada) | El analog front-end del reader demodula load-modulation → bytes | — |
| LL → CR | ¿MIFARE Classic? (Crypto1 rompible) ¿DESFire/NTAG moderno? (**fuera de scope** Crypto1) | — |
| CR → AT | Keys recuperadas o gap declarado (DESFire/AES moderno = para y declara) | — |
| AT | ⚠TX re-check; ⚠ clonar credenciales ajenas = **RA6** (fraude). Relay/MITM derrota la asunción de proximidad **sin keys** | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): RFID near-field **no** tiene superficie de emisión típica. Si defiendes un lector propio, modo Defensivo en SP = sniff pasivo de transacciones del reader buscando skimmers/relays.

## Advertencias legales
- Leer tus tarjetas OK.
- **Clonar/emular/relay credenciales ajenas = fraude/acceso no autorizado** (delito). Solo propias/autorizadas + con propósito de test anti-relay del lector.
