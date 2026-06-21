# 18 — Z-Wave

> Wayfinder + controles RFSAM para Z-Wave. Sub-GHz regional, mesh source-routed.

## Facts
- **Banda**: sub-GHz ISM regional — 908.42 MHz (US) · 868.42 MHz (EU) · + canales regionales (921.42 ANZ, 919.82 HK, 922–926 JP). **Una región por device**.
- **Modulación/rate**: (G)FSK a 3 rates: 9.6 kbps (R1 legacy), 40 (R2), 100 (R3). Z-Wave Long Range (US 912/920) añade potencia y topología estrella.
- **PHY/MAC**: ITU-T G.9959 (abierto). Stack upper abierto tras release de Silicon Labs (~2016).
- **Identificadores**: 32-bit Home ID (la red) + 8-bit Node ID (device). Ambos **en claro** en cada frame header.
- **Seguridad**: legacy **S0** AES-128, pero durante inclusion la network key va cifrada bajo clave temporal **FIJA all-zero** → captura inclusion = recuperas key. Moderno **S2** (Gen5/700+): Curve25519 ECDH en inclusion — secreto nunca enviado.
- **Topología**: mesh source-routed: primary controller/hub + routing slaves + end devices. Targets: locks, sensors, thermostats, controller.

## Descenso por capa

### IG (fingerprinting)
- Región/frecuencia (FCC ID/CE marking), chipset/generación (Sigma ZW0301/ZW0501 500-series vs SiLabs 700/800 EFR32ZG), clase seguridad (S0 vs S2 vs sin cifrar), Home ID/Node ID, data rate (R1/R2/R3 vs Long Range).

### SP — `RFSAM-ZWAVE-SP-01` Region/frequency identification
- **Objetivo**: confirmar transmite en canal regional. RTL-SDR llega (sub-GHz). Burst FSK al report/poll.
- **Kit**: Gqrx (RTL-SDR/HackRF tuned a 908.42/868.42). Disparar device (abrir puerta) para hacerlo hablar.

### PHY (sin control — demod+frame juntos)
- G.9959 (G)FSK demodulado y parseado en cada tool. Matchear freq regional + rate (9.6/40/100 kbps usan desviación/banda distinta).

### LL (integrado en SP — capturar/decodificar frames)
- Park radio en canal regional → headers (Home ID, Node ID, frame control, command class). SDR: Waving-Z/rtl-zwave (RTL-SDR), EZ-Wave/Scapy-radio (HackRF). Vendor: Zniffer (Silicon Labs, UZB stick).
- **CRÍTICO para S0**: capturar una **inclusion** (pairing) — ahí viaja la key.

### CR — `RFSAM-ZWAVE-CR-01` Key establishment assessment
- **Objetivo**: S0 → captura inclusion, recupera network key (cifrada bajo all-zero temp key). S2 (ECDH) → **no hay atajo** desde captura.
- **Kit**: Zniffer (captura limpia inclusion S0, recupera key conociendo temp key all-zero), EZ-Wave (descifra S0 con key).
- **Ataque histórico Z-Shave**: downgrade S2→S0 durante inclusion (downgrade, no break S2).

### AT (sin control dedicado — técnicas activas)
- **⚠ AUTORIZACIÓN OBLIGATORIA**. Con key S0 o command classes no cifrados: forge/inject (EZ-Wave/Scapy-radio HackRF, gr-zwave_poore USRP B210). Replay/forge command classes (lock/unlock, switch). S2 + anti-replay nonces bloquea forge cifrado.
- **Kit**: EZ-Wave, Scapy-radio, gr-zwave_poore.

### AP
- Command classes: Door Lock CC, Binary Switch, thermostat, sensor report, Version/Manufacturer-Specific. EZ-Wave `ezrecon` interroga device; Z-Wave PC Controller (SiLabs, UZB stick) driver legitimo.

## Subflujo (especialización del flujo maestro)

Transiciones específicas de Z-Wave; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Región/frecuencia confirmadas (FCC ID/CE marking). RTL-SDR llega (sub-GHz) | — |
| SP → LL | Carrier regional (908.42/868.42 MHz) confirmado. Burst FSK al report/poll | — |
| (PHY fusionada) | G.9959 (G)FSK demodulado y parseado en cada tool | — |
| LL → CR | ¿Clase de seguridad? **S0** (captura inclusion → recupera key) ¿**S2**? (ECDH → no atajo) | — |
| CR → AT | Keys S0 recuperadas o gap declarado (S2 ECDH → para). Downgrade S2→S0 históricamente (Z-Shave), no break S2 | — |
| AT | ⚠TX re-check (HackRF/USRP para forge); ⚠ operar lock/switch ajeno = allanamiento. S2 + anti-replay nonces bloquea forge cifrado | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): frames Z-Wave con Home ID **desconocido** intentando inclusion/leave en tu red, o command classes no cifradas operando sobre tus actuadores = posible takeover/rogue controller. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo sub-GHz OK.
- **Inject/replay/forge = activo**: solo red propia/autorizada. Operar lock/switch ajeno = allanamiento.
