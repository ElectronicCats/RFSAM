# 14 - LTE / 4G

> Wayfinder + RFSAM controls for LTE. **Licensed spectrum** - passive RX OK, any TX requires an authorized lab.

## Facts
- **Band**: licensed cellular ~700 MHz-2.6 GHz (E-UTRA ~450 MHz-3.8 GHz); FDD and TDD.
- **Width**: 6 bandwidths - 1.4/3/5/10/15/20 MHz; carrier identified by EARFCN.
- **Modulation**: DL OFDMA, UL SC-FDMA; QPSK/16/64/256-QAM. Frame 10 ms -> 10 subframes (1 ms) -> 2 slots.
- **Cell ID**: PSS->N_ID(2) (0-2), SSS->N_ID(1) (0-167); PCI = 3-N_ID(1)+N_ID(2) -> 504 (0-503).
- **Broadcast**: MIB in PBCH (bandwidth, PHICH, SFN); SIB1 in PDSCH via SI-RNTI (PLMN, cell ID, TAC). SIBs in cleartext.
- **Control**: PDCCH carries DCI, addressed by RNTIs (C-RNTI, SI-RNTI, P-RNTI paging). Blind-decoding common search space exposes scheduling/identity passively.
- **Security**: air crypto SNOW 3G/AES/ZUC keyed from USIM (EPS-AKA) - **not recoverable from passive capture**. User-plane encryption optional per bearer; broadcast/paging without protection.

## Layer-by-layer descent

### IG - `RFSAM-LTE-IG-01` Baseband and modem vulnerabilities
- **Objective**: identify cell/operator before capturing. Band/EARFCN, PCI (PSS/SSS), PLMN/MNC+MCC, TAC from SIB1, bandwidth. Known weaknesses: pre-AKA messages unauthenticated (basis of IMSI catchers + downgrade/redirect), SIB/paging leak config and S-TMSI in cleartext.
- **Kit**: commercial modem (SIM7600 AT+CPSI?), QCSuper (modem signalling -> Wireshark).

### SP - `RFSAM-LTE-SP-01` Cell identification and capture
- **Objective**: where the cell is, what bandwidth. Sweep bands, see the OFDM DL "wall", read EARFCN/center/width.
- **Kit**: Gqrx (HackRF for a single 20 MHz carrier; bladeRF/USRP for more context; RTL-SDR only low bands - tops out at 1.766 GHz), SIM7600 (AT+CPSI? cell scan without SDR).
- **Caveat**: RTL-SDR cannot reach 1.8-2.6 GHz carriers.

### PHY - `RFSAM-LTE-PHY-01` Resource-grid recovery
- **Objective**: coherent capture (GPSDO USRP B210 ideal). Synchronize PSS/SSS -> PCI, decode MIB PBCH, grid. Drift smudges subcarriers.

### LL - `RFSAM-LTE-LL-01` Control-channel / identity exposure
- **Objective**: decode broadcast/control channels - MIB/SIBs (PLMN, cell ID, TAC, scheduling), paging. The network "shouting in cleartext".
- **Kit**: srsRAN 4G (srsUE cell-search + MAC-LTE/RRC PCAP), FALCON (blind-decode PDCCH), LTESniffer (DL/UL eavesdropper), gr-lte (GNU Radio PBCH), QCSuper (modem signalling -> Wireshark).
- **Decoder**: Wireshark (GSMTAP / MAC-LTE).

### CR (no dedicated control - nothing to break passively)
- SNOW 3G/AES/ZUC keyed by EPS-AKA (USIM). No offline shortcut. Identifiers (PCI/PLMN/TAC/SIBs/S-TMSI/PDCCH) are read, not decrypted. Recovering user-plane = being the network (AT) on authorized equipment.

### AT (no dedicated control - rogue cell, **authorized lab mandatory**)
- **[!] LICENSED SPECTRUM - never radiate on a live operator band. Lab only + test SIMs + cage/conducted.** Rogue/fake eNodeB (srsENB/OAI) on test EARFCN, own PCI/PLMN/SIB, UE reselects. Foothold exercises: (1) IMSI/identity exposure (NAS pre-AKA unauthenticated -> Identity Request); (2) downgrade (reject/break LTE attach -> 2G/GSM weak crypto); (3) signalling DoS/RRC floods; (4) tracking (paging S-TMSI + measurement reports).
- **Kit**: srsRAN 4G (rogue eNodeB + srsEPC or Open5GS), imsi-catcher-srsran (turnkey fork), OpenAirInterface (alt rogue + fuzz RRC/NAS), Open5GS (EPC core), MobileInsight (victim-side RRC/NAS decode), Crocodile Hunter (EFF, detect fake-eNB), Rayhunter (EFF, portable detector on Orbic RC400L).

### AP
- NAS/EPC signalling (attach, auth, identity, tracking-area) - you only exercise by being the network. With eNodeB+core (AT) + authorized UE: inspect NAS, force re-auth/identity, test behavior under a hostile core.
- **Kit**: Open5GS (EPC/NAS test harness).

## Subflow (specialization of the master flow)

LTE-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | Cell/operator identified (EARFCN, PCI, PLMN, TAC from SIB1). Baseband/modem CVEs cross-referenced | - |
| SP -> PHY | DL carrier confirmed on waterfall (20 MHz OFDM wall). RTL-SDR only low bands (tops out at 1.766 GHz); bladeRF/USRP for 1.8-2.6 GHz | - |
| PHY -> LL | Coherent grid recovered (GPSDO USRP ideal) -> MIB/SIB decoded | - |
| LL -> CR | Broadcast/control decoded (SIBs, paging, PDCCH). User-plane SNOW 3G/AES/ZUC keyed by USIM - **no offline shortcut** | - |
| CR -> AT | Nothing to break passively; AT = being the network (rogue eNB) in an authorized lab | - |
| AT | [!]TX re-check; **licensed spectrum** - lab only + test SIMs + cage/conducted + experimental license. Live rogue eNB = RA5/RA8 | [!]TX |

**Defensive anomaly** (Defensive mode, RX-only): a cell broadcasting MCC/MNC/TAC that **do not** match a known operator, or S-TMSI paging with anomalous spikes = possible rogue eNB / IMSI catcher. Crocodile Hunter/Rayhunter detect it. Register; do **not** descend to AT.

## Legal warnings
- Passive RX of broadcast/control OK (public DL spectrum). Capturing user-plane/third-party traffic is regulated.
- **Rogue eNB / IMSI catcher / downgrade / jamming = transmission on licensed spectrum**: illegal without an experimental license + contained lab. Never on a live operator.
