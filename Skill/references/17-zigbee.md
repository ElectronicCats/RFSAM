# 17 — Zigbee / 802.15.4

> Wayfinder + controles RFSAM para Zigbee. RFSAM dueño end-to-end.

## Facts
- **Banda**: 2.4 GHz (2.405–2.480) principal · sub-GHz 868 MHz (EU) / 902–928 (Américas).
- **Canales**: 2.4 GHz 16 canales 11–26 (espaciados 5 MHz); un PAN en un canal (no hoppa como BLE).
- **PHY**: IEEE 802.15.4 — 2.4 GHz O-QPSK con DSSS, 250 kbps.
- **Stack**: 802.15.4 MAC/PHY → Zigbee NWK (mesh) → APS → ZCL/ZDO. Roles: Coordinator, Router, End Device.
- **Seguridad**: AES-128-CCM* en NWK y APS. Network key compartida por todo el PAN; Trust Center link key gatea el join. Default well-known TC link key `ZigBeeAlliance09` (hex `5A6967426565416C6C69616E63653039`).
- **Alcance**: ~10–100 m por hop; el mesh extiende.

## Descenso por capa

### IG (fingerprinting)
- Chipset (Silicon Labs EFR32/EM35x, TI CC2530/CC2538/CC1352, NXP JN51xx, ESP32-C6), rol (Coordinator=Trust Center/Router/End Device), canal/PAN, modelo de join (centralized vs distributed; default TC link key vs install code vs Zigbee 3.0 install-code-only).

### SP — `RFSAM-ZIGBEE-SP-01` Channel survey and capture feasibility
- **Objetivo**: en qué canal de los 16 está el PAN. Scan energía/active, no perseguir hops.
- **Kit**: KillerBee `zbstumbler` (active beacon), Gqrx (cross-check energía), Minino (scanner), Kismet (pasivo multirradio), catnip (cativity activity table).
- **Caveat**: canales 15/20/25/26 en gaps Wi-Fi → comunes.

### PHY (sin control — demod en radio 802.15.4)
- Las radios 802.15.4 demodulan O-QPSK/DSSS (PHY) y enmarcan MAC (LL) juntas. SDR impráctico para decode live.

### LL — `RFSAM-ZIGBEE-LL-01` PAN, addressing and device discovery
- **Objetivo**: park radio 802.15.4 en canal → PCAP. **Crítico**: capturar un device *uniéndose* (join) — ahí se transporta la network key.
- **Kit**: KillerBee (`zbdump`/`zbwireshark`, ApiMote/nRF52840), catnip (CatSniffer), nRF Sniffer 802.15.4, whsniff (CC2531), Minino, WHAD (nRF52840/APIMote), Kismet (multirradio).
- **Decoder**: Wireshark (802.15.4 + Zigbee NWK/APS; descifra con network key).

### CR — `RFSAM-ZIGBEE-CR-01` Network-key provisioning and rotation
- **Objetivo**: recuperar network key del join. Classic weakness: APS Transport-Key en join bajo default TC link key `ZigBeeAlliance09` (o en claro en devices viejos).
- **Kit**: zbdsniff (extrae network key del join bajo `ZigBeeAlliance09` o en claro), Wireshark (descifra con key).
- **Comando**: capturar join → `zbdsniff join.pcap` → pega key en Wireshark Preferences → ZigBee.
- **Caveat**: per-device install code la derrota; Zigbee 3.0 S2-style ECDH resiste capture-the-join.

### AT (sin control dedicado — técnicas activas)
- **⚠ AUTORIZACIÓN OBLIGATORIA**. Con network key: forge/inject (KillerBee `zbreplay`/scapy-radio, ApiMote TX). Forzar leave/rejoin para recapturar join. catnip OTA firmware-update MITM+jamming PoC.
- **Kit**: KillerBee (ApiMote TX), catnip (OTA MITM PoC).

### AP
- ZCL commands (on/off, lock/unlock, level). Con network key, craft APS/ZCL cifrado e inyectar (KillerBee zbscapy).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de Zigbee; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Rol (Coordinator/Router/End) y PAN identificados. TC link key default `ZigBeeAlliance09` es **well-known** | — |
| SP → PHY+LL | Canal del PAN fijado (16 canales 2.4 GHz, **no hoppa**); radio 802.15.4 aparcada. SDR no decodifica O-QPSK/DSSS live | — |
| PHY+LL → CR | ¿Capturas un **join**? (ahí se transporta la network key). **Crítico** para extraer la key | — |
| CR → AT | Network key en mano o gap. Transport-Key protegido solo por TC link key default (o en claro en devices viejos); install code lo derrota | — |
| AT | ⚠TX re-check; con key → forge/inject, forzar leave/rejoin; sin key → replay cifrado | ⚠TX |
| AP (sin control formal) | ZCL commands (on/off, lock, level) sobre lo que el device confía | — |

**Anomalía defensiva** (modo Defensivo, RX-only): frames de management inesperadas (leave/rejoin **forzado**) o devices desconocidos uniéndose al PAN = posible takeover. Registra.

## Advertencias legales
- RX pasivo OK (802.15.4 abierto).
- **Inject/replay/forge = activo**: solo PAN propio/autorizado. Operar lock/switch ajeno = allanamiento.
