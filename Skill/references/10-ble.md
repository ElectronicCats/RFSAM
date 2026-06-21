# 10 — BLE (Bluetooth Low Energy)

> Wayfinder + controles RFSAM para BLE. Deferencia BSAM en link-and-above. El control de referencia
> de profundidad es `RFSAM-BLE-AT-01`. Fuente: `toolchains.js` (inline), controles `rfsam-ble-*.md`.

## Facts
- **Banda**: 2.402–2.480 GHz (ISM 2.4 GHz). 40 canales × 2 MHz — 3 advertising (37/38/39) + 37 data; una conexión hoppa cada connection event.
- **Modulación**: GFSK · PHYs LE 1M (1 Mbps), LE 2M (BLE 5), LE Coded (largo alcance, BLE 5).
- **Alcance**: ~10 m interior; hasta ~100 m con Coded PHY o TX alta.
- **Versiones**: 4.0 (2010) · 4.2 LE Secure Connections (2014) · 5.0 2M/Coded (2016) · 5.1–5.4.
- **Referencia externa**: **BSAM (Tarlogic)** — RFSAM es dueño de SP+PHY; en LL y arriba defiere a BSAM.

## Descenso por capa

### IG — `RFSAM-BLE-IG-01` Known vulnerabilities of the SoC and host stack
- **Objetivo**: identificar SoC/host stack y cruzar con CVEs (SweynTooth, KNOB, BLEEDINGBIT, BleedingTooth, BLESA) antes de capturar.
- **Kit**: host BLE adapter HCI + bettercap (discovery/GATT); Sniffle/CatSniffer para PDU advertising.
- **Comando**: leer FCC ID en etiqueta → `https://fccid.io/`; `sudo bettercap -eval "ble.recon on; sleep 20; ble.show; q"`.
- **Deferencia**: BSAM-IG-01/02/03/04. `deferred: true`.
- **Ataques citados**: SweynTooth (CVE-2019-19194 Zero-LTK), KNOB (CVE-2019-9506), BLEEDINGBIT (CVE-2018-16986), BleedingTooth (CVE-2020-12351), BLESA.

### SP — `RFSAM-BLE-SP-01` Channel map and capture feasibility
- **Objetivo**: qué canales puedes observar a la vez con tu radio — viabilidad de discovery/full-band/connection-following.
- **Kit**: Gqrx (waterfall, ~20 MHz HackRF / 122.88 MHz bladeRF oversampling); ESP32 Marauder/Minino (scan advertising); ESP32 AirTag scanner.
- **Caveat**: RTL-SDR no llega a 2.4 GHz. HackRF ve un slice (1 de 3 canales advertising); bladeRF oversampling toda la banda.
- **Criticalidad**: `info` (auditor-capability baseline, no device finding).

### PHY — `RFSAM-BLE-PHY-01` Demodulation and bit recovery
- **Objetivo**: demodular GFSK, correlacionar access address, de-whiten, validar CRC — bits limpios por canal.
- **Kit**: Sniffle/ice9 (on-chip o channelised SDR); Wireshark para verificar `CRC correct`.
- **Comando**: `python3 -m sniffle.sniff_receiver -s /dev/ttyACM0 -a -o adv.pcap`.
- **Ataques citados**: passive access-address/CRCInit recovery (Ryan WOOT 2013); SweynTooth fuzzing (CVE-2019-16336, 17519).
- **Criticalidad**: `info`.

### LL — `RFSAM-BLE-LL-01` Advertising & identifier exposure · `RFSAM-BLE-LL-02` Connection-data capture
- **LL-01 Objetivo**: ¿filtrar advertising identidad/producto (nombres, serials, UUIDs, manufacturer data) o identificador trackable que derrota randomización?
- **LL-02 Objetivo**: ¿seguir y grabar PDUs de data-channel de una conexión (CSA#1/CSA#2, o ya establecida vía ice9)?
- **Kit**: Sniffle (CC1352/CatSniffer), nRF Sniffer, Ubertooth, ice9 (SDR all-channel), Wireshark.
- **Ataques citados**: connection-following sniffing (Ryan WOOT 2013); CSA#2 recovery (Cauquil DEF CON 27); established-conn recovery (Ballabriga 2020); address-carryover tracking (Becker PoPETs 2019); PHY-layer fingerprint (Givehchian S&P 2022).
- **Deferencia**: BSAM-DI-03/DI-04/DI-06 (LL-01), BSAM-DI-04/EN-02 (LL-02). `deferred: true`.

### CR — `RFSAM-BLE-CR-01` Pairing and encryption assessment
- **Objetivo**: ¿LE Legacy o LESC? Si Legacy → recuperar TK y descifrar sesión.
- **Kit**: crackle (brute TK), Wireshark (exportar PCAP), Sniffle/CatSniffer (capturar pairing).
- **Comando**: `crackle -i ble_pairing.pcap -o ble_decrypted.pcap`.
- **Ataques citados**: LE Legacy TK brute-force (Ryan WOOT 2013); KNOB BLE key-size downgrade (CVE-2019-9506, Antonioli TOPS 2020); SweynTooth Zero-LTK (CVE-2019-19194).
- **Deferencia**: BSAM-PA-01/PA-04/EN-02/EN-03. `deferred: true`. LESC (ECDH) **no rompible** desde captura.

### AT — `RFSAM-BLE-AT-01` Hijack a live BLE connection
- **Objetivo**: ¿se puede seguir y tomar una conexión establecida (jam-and-hijack, injection, reconnection spoofing)?
- **⚠ AUTORIZACIÓN OBLIGATORIA** — paso activo.
- **Kit**: Btlejack (BBC micro:bit), InjectaBLE firmware (nRF52840), bettercap (recon), ESP32 Marauder/Bruce/Sour Apple (spam).
- **Ataques citados**: InjectaBLE (Cayre DSN 2021), Btlejacking (Cauquil DEF CON 26), BLESA (CVE-2020-9770).
- **Deferencia**: BSAM-AP-06/AU-03/EN-01. `deferred: true`. Criticalidad `critical`.

### AP — Interactuar GATT
- **Objetivo**: ¿qué confía el dispositivo sobre el enlace? GATT reachable sin auth.
- **Kit**: Bleak (script GATT), bettercap (enumerate), Bruce (Bad BLE HID).
- **No hay control dedicado en coverage-map** — AP de BLE se ejerce via interacción GATT tras CR/AT.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de BLE; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Dispositivo BLE confirmado; CVEs del SoC cruzados (KNOB/SweynTooth/BLESA) | — |
| SP → PHY+LL | Actividad en advertising channels (37/38/39) confirmada. RTL-SDR no llega a 2.4 GHz → HackRF/bladeRF | — |
| PHY+LL (LL-01/02) | 🔗BSAM: detén el descenso en LL y defiere a BSAM. Reanuda en CR **solo si** BSAM devuelve un hallazgo que lo requiere | 🔗BSAM |
| CR → AT | Pairing débil confirmado (LE Legacy TK recuperable). LESC (ECDH) **no rompible** desde captura → gap | — |
| AT | ⚠TX re-check `loot/scope.txt`; solo activo/lab | ⚠TX |
| AP (sin control) | GATT/HID sobre lo que el device confía; se ejerce tras CR/AT | — |

**Anomalía defensiva** (modo Defensivo, RX-only): AirTag/Find My **no propio** en tu entorno = stalking. `minino`/`esp32-airtag-scanner` detecta. Registra en `loot/notes/`; **no** desciendas a AT.

## Advertencias legales
- RX pasivo (advertising/sniff) generalmente OK sobre tus dispositivos.
- **Conexión/hijack/inject/spam = activos**: solo sobre equipos propios/autorizados.
- BLE spam (Sour Apple) **congela iPhones ajenos** → ilegal sin permiso, disruptivo.
