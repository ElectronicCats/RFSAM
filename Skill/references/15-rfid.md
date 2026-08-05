# 15 — RFID / NFC

> Wayfinder + RFSAM controls for RFID/NFC. Near-field (magnetic coupling), not far-field.

## Facts
- **Bands**: LF 125/134 kHz · HF 13.56 MHz. Centimeters by design.
- **LF**: EM4100/EM4102, HID Prox (125 kHz), Indala, T5577 (clonable), HITAG — read-only IDs, little crypto.
- **HF**: ISO 14443-A/B (MIFARE Classic, Ultralight, NTAG, DESFire, EMV contactless), ISO 15693 (iCODE), FeliCa.
- **Crypto**: MIFARE Classic = Crypto1 (48-bit, **broken**: darkside/nested/hardnested/mfkey32). DESFire EV1/2/3 (AES/3DES) and modern NTAG are **not breakable** with Crypto1.

## Layer-by-layer descent

### IG (fingerprinting)
- Band (LF vs HF), standard/chip family, UID (fixed vs changeable), MIFARE sectors with default keys, security mode. Proxmark `lf search`/`hf search` autodetects.

### SP — `RFSAM-RFID-SP-01` Carrier and standard identification
- **Objective**: energize tag and read carrier/standard/chip; or passive sniff reader↔card.
- **Kit**: pm3-client (`lf search`, `hf search`, `hf 14a sniff`/`hf 15 sniff`/`lf sniff` passive), Chameleon Ultra GUI.
- **Command**: `pm3` → `hf search`.

### PHY (no control — demodulation in the reader)
- The reader's analog front-end demodulates the load modulation; the client extracts the bytes. There is no separate I/Q stage.

### LL (integrated into SP — read/dump)
- Proxmark reads/dumps LF+HF; libnfc with ACR122U (HF); Chameleon/BomberCat standalone.

### CR — `RFSAM-RFID-CR-01` Crypto1 / key-strength assessment
- **Objective**: break MIFARE Classic. With 1 known key → nested; with none → darkside; hardnested for hardened EV1; mfkey32/64 from a sniffed transaction.
- **Kit**: pm3-client (full Crypto1 suite), mfoc (nested, libnfc), mfcuk (darkside).
- **Command**: `pm3` → `hf mf nested 1 <A> <key>` or `hf mf hardnested`.
- **Honesty note**: modern DESFire/NTAG (AES) out of scope — acknowledge it and stop.
- **Near-field note**: in RFID, CR is **live interrogation of the tag** at cm (the Proxmark energizes and challenges the card), not offline PCAP analysis as in far-field (BLE/Wi-Fi/LoRa). It is not a spectrum attack TX and does not trigger a TX re-check, but it differs from the "offline CR" pattern of the master flow.

### AT — `RFSAM-RFID-AT-01` Clone, emulate and relay
- **⚠ MANDATORY AUTHORIZATION** to clone/relay real credentials.
- **Objective**: clone to a blank/magic card, emulate, or relay (defeats proximity assumption, without keys).
- **Kit**: pm3-client (write T5577/magic, `hf mf sim`, relay `hf_reblay`), Chameleon Ultra GUI (emulate slots), BomberCat (RelayNFC + MagSpoof).
- **LF EM/HID**: clone directly to T5577.

### AP
- Read the meaning of the dump: facility/card number (Wiegand 26-bit), value blocks (transit), NDEF. mfdread renders a MIFARE Classic dump readable.

## Subflow (specialization of the master flow)

RFID/NFC-specific transitions; verbatim commands live in `Layer-by-layer descent` above. Near-field (cm), **not** far-field — SP is carrier ID, not waterfall.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG → SP | Tag type identified. **Fork first**: LF 125 kHz vs HF 13.56 MHz | — |
| SP → LL | Carrier/standard/chip confirmed (power the tag and read, or `hf 14a sniff`/`lf sniff` passive) | — |
| (PHY merged) | The reader's analog front-end demodulates load modulation → bytes | — |
| LL → CR | MIFARE Classic? (Crypto1 breakable) Modern DESFire/NTAG? (**out of scope** for Crypto1) | — |
| CR → AT | Keys recovered or gap declared (modern DESFire/AES = stop and declare) | — |
| AT | ⚠TX re-check; ⚠ cloning third-party credentials = **RA6** (fraud). Relay/MITM defeats the proximity assumption **without keys** | ⚠TX |

**Defensive anomaly** (Defensive mode, RX-only): RFID near-field does **not** have a typical emission surface. If you are defending your own reader, Defensive mode at SP = passive sniff of reader transactions looking for skimmers/relays.

## Legal warnings
- Reading your own cards OK.
- **Cloning/emulating/relaying third-party credentials = fraud/unauthorized access** (crime). Own/authorized cards only + with the purpose of anti-relay testing of the reader.
