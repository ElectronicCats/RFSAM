# 23 — GSM / 2G

> Wayfinder + RFSAM controls for GSM. **Licensed spectrum** — DL RX OK, rogue BTS requires authorized lab.
> Relevant in 2026 as a **downgrade target** from 4G/5G.

## Facts
- **Bands**: GSM-850 / E-GSM-900 / DCS-1800 / PCS-1900 MHz — depends on region (900/1800 world, 850/1900 Americas).
- **Channels**: 200 kHz carriers indexed by ARFCN; each carrier TDMA-divided into 8 timeslots. DL/UL paired (FDD), spaced 45 MHz (900) / 95 (1800).
- **Modulation**: GMSK (0.3 BT Gaussian-filtered MSK) 270.833 kbit/s; EDGE adds 8-PSK.
- **Logical channels**: BCCH broadcasts cell info · CCCH (PCH/AGCH/RACH) pages and grants · SDCCH signaling (location updates, SMS) · TCH voice.
- **Crypto**: A5/0 none · A5/1 (64-bit stream cipher, **broken by rainbow tables**) · A5/2 (export-weak, deprecated) · A5/3 & A5/4 (KASUMI block, much stronger). Auth **one-way** (network never proves itself) → enables IMSI catchers.
- **Identity**: IMSI (permanent SIM) and TMSI (temporary, network-assigned). IMSI exposed over the air during attach/location update when no valid TMSI exists.

## Layer-by-layer descent

### IG (fingerprinting — the network you observe)
- Band region (850/900/1800/1900 — set the ARFCN scan and radios). Cell identity from BCCH: MCC (country), MNC (operator), LAC (location area), Cell-ID — cross-check OpenCellID. Cipher in force (A5/0/1/2/3) from the Cipher Mode Command — determines whether CR is feasible. Exposed identities: paging by IMSI or TMSI; forced IMSI in location update = privacy finding + signature IMSI catcher. Frequency hopping (sequence from BCCH) complicates single-channel capture. 2G fallback context: is the device 2G-only or 4G/5G downgradeable?

### SP — `RFSAM-GSM-SP-01` ARFCN survey and capture
- **Objective**: find a live cell. 200 kHz carrier, DL BCCH transmits continuously → steady picket in the waterfall. Reliable method: scan FCCH/SCH sync bursts from each BTS → ARFCN, power, ppm clock offset. RTL-SDR covers GSM-900/850 and DCS-1800; PCS-1900 at the top end (HackRF/bladeRF/USRP better).
- **Kit**: kalibrate-rtl (ARFCN/cell scanner), Gqrx (sanity check 200 kHz pickets).

### PHY (no control — demod+frame together in gr-gsm)
- GMSK burst demod (PHY) and burst-to-frame decode (LL) together in gr-gsm over SDR. GSM packs 8 users into 200 kHz via TDMA → "capturing a channel" = demod the whole carrier + select timeslot/logical channel.

### LL (part of LL — capture/decode DL)
- Tune the ARFCN that kalibrate found → gr-gsm demod GMSK bursts, decode control channels → forward each frame as GSMTAP over UDP to Wireshark (System Information, paging, assignment, SDCCH signaling). Path: ARFCN scan → grgsm_livemon → GSMTAP → Wireshark.
- **Kit**: gr-gsm (grgsm_livemon), imsi-catcher (Oros42, passive IMSI/TMSI extractor from the GSMTAP stream).
- **Decoder**: Wireshark (GSMTAP).

### CR — `RFSAM-GSM-CR-01` Cipher and identity exposure
- **Objective**: evaluate the cipher; where A5/1 is broken, recover the session key from the capture. Precomputed rainbow tables (Berlin A5/1 Security Project) recover the 64-bit Kc from a known keystream slice → the rest of the call/SMS is decrypted. **Heavy**: ~1.6–2 TB tables, known-plaintext keystream segment from the capture, the cell must be running A5/1. A5/3 (KASUMI) is not breakable this way. Recovering keys from unauthorized traffic = illegal.
- **Kit**: Kraken (A5/1 key recovery, rainbow tables).
- **Command**: on an A5/1 capture with known keystream → Kraken recovers Kc → decrypts.

### AT (no dedicated control — rogue BTS, **authorized lab**)
- **⚠ TX on live GSM is illegal except in a licensed lab/cage.** GSM auth is one-way (the cell never proves itself) → a rogue BTS (classic IMSI catcher) impersonates a real cell: stand up your own BCCH with the target's MCC/MNC/LAC at a higher level → handsets reselect+attach → Identity Request harvests IMSI/IMEI, set A5/0 (no cipher) or downgrade A5/1, page/locate/intercept. Osmocom stack (osmo-trx+osmo-bts+osmo-bsc+osmo-msc+osmo-hlr) or OpenBTS all-in-one on a clock-disciplined SDR TX. Lighter/no-TX alternative: passive IMSI catch in LL (Oros42 reading IMSIs from the broadcast).
- **Kit**: osmo-bts (Osmocom stack rogue BTS/active IMSI catcher), OpenBTS (all-in-one rogue).
- **Decoder**: Wireshark (L3/SMS inspection).

### AP
- Above the link, the GSM "app layer" = signaling + bearer services (not IP). With SDCCH/TCH decoded (and decrypted if A5/1 is broken): payloads = L3 mobility/call-control + SMS (incl. silent/Class-0 pings to locate the handset). No dedicated tool — read GSM L3/SMS in Wireshark from the GSMTAP.
- **Kit**: Wireshark (L3/SMS from the GSMTAP capture).

## Subflow (specialization of the master flow)

GSM-specific transitions; verbatim commands live in `Layer-by-layer descent` above. Relevant in 2026 as a downgrade target from 4G/5G.

| Advance | Advance criterion | Markers |
|---------|--------------------|---------|
| IG → SP | Band region (850/900/1800/1900). Cell identity from BCCH (MCC/MNC/LAC/Cell-ID). Cipher in force (A5/0/1/2/3) from the Cipher Mode Command | — |
| SP → PHY | 200 kHz DL BCCH carrier (steady picket). FCCH/SCH sync bursts via kalibrate-rtl. RTL-SDR covers 900/850 and DCS-1800; PCS-1900 better on HackRF/bladeRF | — |
| PHY → LL | GMSK demod (PHY) and burst-to-frame decode (LL) together in gr-gsm → GSMTAP over UDP to Wireshark | — |
| LL → CR | BCCH/control decoded (System Info, paging, SDCCH signaling). A5/1 **broken by rainbow tables** (~2 TB); A5/3 (KASUMI) not | — |
| CR → AT | A5/1 keys recovered (if keystream known + tables) or gap (A5/3 strong). GSM auth one-way → rogue BTS feasible | — |
| AT | ⚠TX re-check; **licensed spectrum** — never TX live GSM except in lab + cage + license. No-TX alternative: passive IMSI catch in LL (Oros42) | ⚠TX |

**Defensive anomaly** (Defensive mode, RX-only): BTS broadcasting MCC/MNC/LAC that **do not** correspond to a known operator, or handsets suddenly falling to A5/0/A5/1 = possible rogue BTS / forced downgrade. Log it; **do not** descend to AT.

## Legal warnings
- Passive DL BCCH/control RX OK (public). Capturing third-party user-plane/SMS/voice = illegal interception.
- **Rogue BTS / IMSI catcher / downgrade to A5/0 = TX on licensed spectrum**: illegal without an experimental license + cage. Roaming on a live operator network = crime. Relevant in 2026 as a downgrade target from 4G/5G — that is where modern IMSI catchers operate.
