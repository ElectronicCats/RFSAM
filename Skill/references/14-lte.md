# 14 — LTE / 4G

> Wayfinder + controles RFSAM para LTE. **Espectro licenciado** — RX pasivo OK, cualquier TX exige lab autorizado.

## Facts
- **Banda**: celular licenciado ~700 MHz–2.6 GHz (E-UTRA ~450 MHz–3.8 GHz); FDD y TDD.
- **Ancho**: 6 anchos — 1.4/3/5/10/15/20 MHz; carrier identificado por EARFCN.
- **Modulación**: DL OFDMA, UL SC-FDMA; QPSK/16/64/256-QAM. Frame 10 ms → 10 subframes (1 ms) → 2 slots.
- **Cell ID**: PSS→N_ID(2) (0–2), SSS→N_ID(1) (0–167); PCI = 3·N_ID(1)+N_ID(2) → 504 (0–503).
- **Broadcast**: MIB en PBH (bandwidth, PHICH, SFN); SIB1 en PDSCH via SI-RNTI (PLMN, cell ID, TAC). SIBs en claro.
- **Control**: PDCCH lleva DCI, addressed por RNTIs (C-RNTI, SI-RNTI, P-RNTI paging). Blind-decode common search space expone scheduling/identity pasivamente.
- **Seguridad**: air crypto SNOW 3G/AES/ZUC keyed from USIM (EPS-AKA) — **no recuperable de captura pasiva**. User-plane cifrado opcional por bearer; broadcast/paging sin protección.

## Descenso por capa

### IG — `RFSAM-LTE-IG-01` Baseband and modem vulnerabilities
- **Objetivo**: identificar cell/operator antes de capturar. Band/EARFCN, PCI (PSS/SSS), PLMN/MNC+MCC, TAC de SIB1, bandwidth. Debilidades conocidas: pre-AKA messages unauthenticated (base de IMSI catchers + downgrade/redirect), SIB/paging leak config y S-TMSI en claro.
- **Kit**: modem comercial (SIM7600 AT+CPSI?), QCSuper (señalización modem → Wireshark).

### SP — `RFSAM-LTE-SP-01` Cell identification and capture
- **Objetivo**: dónde está la cell, qué ancho. Sweep bandas, ver "muro" OFDM DL, leer EARFCN/center/width.
- **Kit**: Gqrx (HackRF un carrier 20 MHz; bladeRF/USRP más contexto; RTL-SDR solo bands bajas — tope 1.766 GHz), SIM7600 (AT+CPSI? cell scan sin SDR).
- **Caveat**: RTL-SDR no llega a carriers 1.8–2.6 GHz.

### PHY — `RFSAM-LTE-PHY-01` Resource-grid recovery
- **Objetivo**: captura coherente (GPSDO USRP B210 ideal). Sincronizar PSS/SSS → PCI, decode MIB PBCH, grid. Drift smush subcarriers.

### LL — `RFSAM-LTE-LL-01` Control-channel / identity exposure
- **Objetivo**: decode broadcast/control channels — MIB/SIBs (PLMN, cell ID, TAC, scheduling), paging. La red "gritando en claro".
- **Kit**: srsRAN 4G (srsUE cell-search + MAC-LTE/RRC PCAP), FALCON (blind-decode PDCCH), LTESniffer (DL/UL eavesdropper), gr-lte (GNU Radio PBCH), QCSuper (señalización modem → Wireshark).
- **Decoder**: Wireshark (GSMTAP / MAC-LTE).

### CR (sin control dedicado — nada que romper pasivamente)
- SNOW 3G/AES/ZUC keyed by EPS-AKA (USIM). Sin shortcut offline. Identifiers (PCI/PLMN/TAC/SIBs/S-TMSI/PDCCH) leídos, no descifrados. Recuperar user-plane = ser la red (AT) en equipo autorizado.

### AT (sin control dedicado — rogue cell, **lab autorizado obligatorio**)
- **⚠ ESPECTRO LICENCIADO — jamás radiar en banda de operator vivo. Solo lab + SIMs prueba + jaula/conducción.** Rogue/fake eNodeB (srsENB/OAI) en EARFCN de test, PCI/PLMN/SIB propios, UE reselecta. Foothold ejerce: (1) IMSI/identity exposure (NAS pre-AKA unauthenticated → Identity Request); (2) downgrade (rechazar/break LTE attach → 2G/GSM crypto débil); (3) signalling DoS/RRC floods; (4) tracking (paging S-TMSI + measurement reports).
- **Kit**: srsRAN 4G (rogue eNodeB + srsEPC o Open5GS), imsi-catcher-srsran (fork turnkey), OpenAirInterface (alt rogue + fuzz RRC/NAS), Open5GS (EPC core), MobileInsight (victim-side RRC/NAS decode), Crocodile Hunter (EFF, detect fake-eNB), Rayhunter (EFF, detector portable en Orbic RC400L).

### AP
- NAS/EPC signalling (attach, auth, identity, tracking-area) — solo ejerces siendo la red. Con eNodeB+core (AT) + UE autorizado: inspeccionar NAS, forzar re-auth/identity, test comportamiento bajo core hostil.
- **Kit**: Open5GS (EPC/NAS test harness).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de LTE; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Cell/operador identificados (EARFCN, PCI, PLMN, TAC de SIB1). CVEs baseband/modem cruzados | — |
| SP → PHY | Carrier DL confirmado en waterfall (muro OFDM 20 MHz). RTL-SDR solo bands bajas (tope 1.766 GHz); bladeRF/USRP para 1.8–2.6 GHz | — |
| PHY → LL | Grid coherente recuperado (GPSDO USRP ideal) → MIB/SIB decoded | — |
| LL → CR | Broadcast/control decoded (SIBs, paging, PDCCH). User-plane SNOW 3G/AES/ZUC keyed por USIM — **sin shortcut offline** | — |
| CR → AT | Nada que romper pasivamente; AT = ser la red (rogue eNB) en lab autorizado | — |
| AT | ⚠TX re-check; **espectro licenciado** — solo lab + SIMs prueba + jaula/conducción + licencia experimental. Rogue eNB vivo = RA5/RA8 | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): cell emitiendo MCC/MNC/TAC que **no** corresponden a operador conocido, o paging por S-TMSI con picos anómalos = posible rogue eNB / IMSI catcher. Crocodile Hunter/Rayhunter detectan. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo de broadcast/control OK (espectro público DL). Capturar user-plane/tráfico de terceros regulado.
- **Rogue eNB / IMSI catcher / downgrade / jamming = transmisión en espectro licenciado**: ilegal sin licencia experimental + lab contenido. Jamás en operator vivo.
