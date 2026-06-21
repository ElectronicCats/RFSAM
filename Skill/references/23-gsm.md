# 23 — GSM / 2G

> Wayfinder + controles RFSAM para GSM. **Espectro licenciado** — RX DL OK, rogue BTS exige lab autorizado.
> Relevante en 2026 como **destino de downgrade** desde 4G/5G.

## Facts
- **Bandas**: GSM-850 / E-GSM-900 / DCS-1800 / PCS-1900 MHz — depende región (900/1800 mundo, 850/1900 Américas).
- **Canales**: 200 kHz carriers indexados por ARFCN; cada carrier TDMA-dividido en 8 timeslots. DL/UL paired (FDD), espaciados 45 MHz (900) / 95 (1800).
- **Modulación**: GMSK (0.3 BT Gaussian-filtered MSK) 270.833 kbit/s; EDGE adds 8-PSK.
- **Logical channels**: BCCH broadcast cell info · CCCH (PCH/AGCH/RACH) pages y grants · SDCCH signalling (location updates, SMS) · TCH voz.
- **Crypto**: A5/0 none · A5/1 (64-bit stream cipher, **roto por rainbow tables**) · A5/2 (export-weak, deprecado) · A5/3 & A5/4 (KASUMI block, mucho más fuerte). Auth **one-way** (network nunca se prueba) → habilita IMSI catchers.
- **Identidad**: IMSI (permanente SIM) y TMSI (temporal, network-assigned). IMSI expuesto en aire durante attach/location update cuando no hay TMSI válido.

## Descenso por capa

### IG (fingerprinting — la red que observas)
- Band región (850/900/1800/1900 — setea scan ARFCN y radios). Cell identity del BCCH: MCC (país), MNC (operator), LAC (location area), Cell-ID — cruzar OpenCellID. Cipher en vigor (A5/0/1/2/3) del Cipher Mode Command — decide si CR factible. Identities expuestos: paging por IMSI o TMSI; IMSI forzado en location update = privacy finding + signature IMSI catcher. Frequency hopping (secuencia del BCCH) complica single-channel capture. 2G fallback context: ¿device 2G-only o 4G/5G downgradable?

### SP — `RFSAM-GSM-SP-01` ARFCN survey and capture
- **Objetivo**: encontrar cell viva. Carrier 200 kHz, DL BCCH transmite continuo → picket steady en waterfall. Forma fiable: scan FCCH/SCH sync bursts de cada BTS → ARFCN, potencia, ppm clock offset. RTL-SDR vale GSM-900/850 y DCS-1800; PCS-1900 al tope (mejor HackRF/bladeRF/USRP).
- **Kit**: kalibrate-rtl (ARFCN/cell scanner), Gqrx (sanity check pickets 200 kHz).

### PHY (sin control — demod+frame juntos en gr-gsm)
- GMSK burst demod (PHY) y burst-to-frame decode (LL) juntos en gr-gsm sobre SDR. GSM empaqueta 8 users en 200 kHz por TDMA → "capturar canal" = demod todo carrier + elegir timeslot/canal lógico.

### LL (parte de LL — capture/decode DL)
- Tune ARFCN que kalibrate halló → gr-gsm demod GMSK bursts, decode control channels → forwarda cada frame como GSMTAP over UDP a Wireshark (System Information, paging, assignment, SDCCH signalling). Path: ARFCN scan → grgsm_livemon → GSMTAP → Wireshark.
- **Kit**: gr-gsm (grgsm_livemon), imsi-catcher (Oros42, passive IMSI/TMSI extractor de stream GSMTAP).
- **Decoder**: Wireshark (GSMTAP).

### CR — `RFSAM-GSM-CR-01` Cipher and identity exposure
- **Objetivo**: evaluar cipher; donde A5/1 roto, recuperar session key de captura. Rainbow tables precomputadas (Berlin A5/1 Security Project) recuperan Kc 64-bit de slice keystream conocido → resto de call/SMS descifra. **Pesado**: ~1.6–2 TB tablas, known-plaintext keystream segment del capture, cell debe correr A5/1. A5/3 (KASUMI) no rompible así. Recuperar keys de tráfico no autorizado = ilegal.
- **Kit**: Kraken (A5/1 key recovery, rainbow tables).
- **Comando**: sobre A5/1 capture con keystream known → Kraken recupera Kc → descifra.

### AT (sin control dedicado — rogue BTS, **lab autorizado**)
- **⚠ TX GSM en vivo ilegal salvo lab licenciado/jaula.** Auth GSM one-way (cell nunca se prueba) → rogue BTS (IMSI catcher clásico) impersona cell real: stand up BCCH propio con MCC/MNC/LAC del target a mayor nivel → handsets reselect+attach → Identity Request harvest IMSI/IMEI, set A5/0 (no cipher) o downgrade A5/1, page/locate/intercept. Stack Osmocom (osmo-trx+osmo-bts+osmo-bsc+osmo-msc+osmo-hlr) o OpenBTS all-in-one en SDR TX clock-disciplined. Alternativa más ligera/sin TX: passive IMSI catch en LL (Oros42 leyendo IMSIs del broadcast).
- **Kit**: osmo-bts (Osmocom stack rogue BTS/active IMSI catcher), OpenBTS (all-in-one rogue).
- **Decoder**: Wireshark (L3/SMS inspection).

### AP
- Por encima del link, "app layer" GSM = signalling + bearer services (no IP). Con SDCCH/TCH decodificados (y descifrados si A5/1 roto): payloads = L3 mobility/call-control + SMS (incl. silent/Class-0 pings para localizar handset). Sin tool dedicado — leer GSM L3/SMS en Wireshark del GSMTAP.
- **Kit**: Wireshark (L3/SMS del GSMTAP capture).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de GSM; los comandos verbatim viven en `Descenso por capa` arriba. Relevante en 2026 como destino de downgrade desde 4G/5G.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | Band región (850/900/1800/1900). Cell identity del BCCH (MCC/MNC/LAC/Cell-ID). Cipher en vigor (A5/0/1/2/3) del Cipher Mode Command | — |
| SP → PHY | Carrier 200 kHz DL BCCH (picket steady). FCCH/SCH sync bursts vía kalibrate-rtl. RTL-SDR vale 900/850 y DCS-1800; PCS-1900 mejor HackRF/bladeRF | — |
| PHY → LL | GMSK demod (PHY) y burst-to-frame decode (LL) juntos en gr-gsm → GSMTAP over UDP a Wireshark | — |
| LL → CR | BCCH/control decoded (System Info, paging, SDCCH signalling). A5/1 **roto por rainbow tables** (~2 TB); A5/3 (KASUMI) no | — |
| CR → AT | Keys A5/1 recuperadas (si keystream known + tablas) o gap (A5/3 fuerte). Auth GSM one-way → rogue BTS factible | — |
| AT | ⚠TX re-check; **espectro licenciado** — jamás TX GSM vivo salvo lab + jaula + licencia. Alternativa sin TX: passive IMSI catch en LL (Oros42) | ⚠TX |

**Anomalía defensiva** (modo Defensivo, RX-only): BTS emitiendo MCC/MNC/LAC que **no** corresponden a operador conocido, o handsets cayendo a A5/0/A5/1 de repente = posible rogue BTS / downgrade forzado. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo DL BCCH/control OK (público). Capturar user-plane/SMS/voz de terceros = interceptación ilegal.
- **Rogue BTS / IMSI catcher / downgrade A5/0 = TX en espectro licenciado**: ilegal sin licencia experimental + jaula. Roaming en operator vivo = delito. Relevante en 2026 como destino de downgrade desde 4G/5G — ahí es donde los IMSI catchers modernos operan.
