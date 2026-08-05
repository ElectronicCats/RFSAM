# 02 — SDR Kit and Sniffer Catalog

> Catalog of the radios and tools in the RFSAM skill, with their critical limits (band, instantaneous
> bandwidth IBW, half/full duplex, RX-only). Radio choice at the SP layer **constrains the entire
> audit**: a "not observed" under a narrow window is a gap, not absence.
> Source: `RFSAM/scripts/seed-tools.mjs` + `RFSAM/src/data/protocol-tools/*.json`.

## Index
1. SDRs wide-band
2. Budget SDRs/dongles
3. Dedicated sniffers by protocol
4. Universal host tools
5. Golden rule: band + IBW + duplex

---

## 1. SDRs wide-band

| Slug | Radio | IBW | Range | Duplex | Notes |
|------|-------|-----|-------|--------|-------|
| `hackrf-one` | HackRF One (Great Scott Gadgets) | ~20 MHz | 1 MHz–6 GHz | half | Discovery radio. Cannot see the entire BLE/Wi-Fi band at once. |
| `bladerf-2-micro` | bladeRF 2.0 micro xA9 (Nuand) | ~56 MHz (122.88 MHz oversampling @ 8-bit) | 47 MHz–6 GHz | full | Since release 2023.02, oversampling covers the 80 MHz of BLE in one pass. AD9361. |
| `usrp-b210` | USRP B210 (Ettus/NI) | ~56 MHz (30.72 in 2×2) | 70 MHz–6 GHz | full | Lab-grade, GPSDO option for coherent cellular. Common in ice9/srsRAN. |
| `signalsdr-pro` | SignalSDR Pro (Signalens) | 61.44 MHz | 70 MHz–6 GHz | 2TX/2RX | AD9361, Pi form factor. Wider IBW. Emerging product — verify support. |
| `rtl-sdr-v4` | RTL-SDR Blog V4 | ~2.4 MHz | 0.5 kHz–1.766 GHz | RX only | **Does not reach 2.4 GHz** → no BLE/Wi-Fi/Zigbee. Good for sub-GHz, LoRa, ADS-B (1090). Cheap. |

## 2. Budget SDRs/dongles

| Slug | What it is | What for |
|------|--------|----------|
| `ubertooth-one` | Open BLE/BT sniffer (CC2400) | BLE/Classic at ~$120; pre-BT5, weak on long links. Software: `ubertooth-tools`. |
| `yard-stick-one` | CC1111 sub-GHz transceiver (300–928 MHz) | RX/TX OOK/ASK/FSK via `rfcat`. The cheap reference sub-GHz tool. |
| `flipper-zero` | Handheld multitool (CC1101) | RX/TX 300–348/387–464/779–928 MHz. Sub-GHz field capture/replay (fixed code only on stock firmware). |

## 3. Dedicated sniffers by protocol

| Slug | Hardware | Protocols | Notes |
|------|----------|------------|-------|
| `catsniffer` | CatSniffer (Electronic Cats) CC1352+RP2040 | BLE, Sub-GHz, Zigbee, LoRa | Multiprotocol. Runs Sniffle (BT5), 802.15.4, LoRa. Host: `catnip`. EC. |
| `nrf52840-dongle` | Nordic nRF52840 USB | BLE, 802.15.4 | Cheap. Host of the nRF Sniffer firmware (BLE) and nRF Sniffer 802.15.4, and InjectaBLE. |
| `bbc-microbit` | nRF51822 ~$15 | BLE | Cheap radio for Btlejack (sniff/jam/hijack). |
| `stm32wlxx` | STM32WLxx (Nucleo-WL55JC / LoRa-E5) | LoRa, Sub-GHz | Arm M4 + integrated sub-GHz radio. With WHAD firmware = LoRa sniffer/inject. |
| `proxmark3` | Proxmark3 (Iceman fork) | RFID/NFC LF+HF | RFID reference: full Crypto1 suite, read/write/emulate, relay. |
| `chameleon-ultra` | ChameleonUltra (RRG) nRF52840 | RFID/NFC HF/LF | Card emulator; MIFARE Classic Crypto1. |
| `bombercat` | BomberCat (Electronic Cats) PN7150 | NFC, MagStripe | Read/emulate + relay NFC + MagSpoof. EC. |
| `acr122u` | PN532/ACR122U USB | NFC HF 13.56 MHz | Cheap libnfc reader; mfoc/mfcuk engine. |
| `apimote` | ApiMote (River Loop) CC2420 | Zigbee/802.15.4 | RX+TX radio for KillerBee (can inject). |
| `cc2531` | TI CC2531 USB | Zigbee/802.15.4 2.4 GHz | Capture-only dongle (no inject). Bridge: `whsniff`. |
| `silabs-uzb7` | Silicon Labs UZB-7 (EFR32ZG14) | Z-Wave 700 | Stick for Z-Wave PC Controller / Zniffer (vendor). |
| `dwm3000evb` | Qorvo DWM3000EVB | UWB 802.15.4z | Ch5/Ch9. Platform of the SEEMOO uwb-sniffer and Ghost Peak. |
| `sim7600` | SIMCom SIM7600 LTE Cat-4 | LTE | Qualcomm modem; AT+CPSI? gives serving cell; /dev/diag for QCSuper. |
| `quectel-rm500q` | Quectel RM500Q-GL 5G NR FR1 | 5G NR | Snapdragon X55; DIAG for QCSuper 5G. |
| `orbic-rc400l` | Orbic RC400L hotspot | LTE | Qualcomm /dev/diag — Rayhunter hardware (EFF detector). |
| `rak-wisgate-connect` | RAK WisGate Connect (CM4 + SX1302) | LoRaWAN | Multichannel gateway; ChirpCat backend. |
| `minino` | Minino (Electronic Cats) ESP32-C6 | Wi-Fi, BLE, Zigbee, Thread | Pocket multitool (GPS, microSD, OLED). 2.4 GHz only. EC. |
| `m5-cardputer`, `cyd`, `lilygo-t-embed-cc1101`, `esp32-devkit`, `esp32-s3-devkit`, `flipper-wifi-devboard` | Handheld ESP32 platforms | Wi-Fi, BLE, (+sub-GHz for CC1101 ones) | Chassis for Marauder/Bruce/Ghost ESP. Only original ESP32 has Classic. |

## 4. Universal host tools

| Slug | What it does |
|------|----------|
| `wireshark` / `tshark` | The universal dissector. Almost every sniffer exports PCAP → Wireshark. Supplies keys to decrypt in-place. |
| `gqrx` | Live SDR waterfall (HackRF/bladeRF/USRP/RTL). "See what transmits and where". |
| `universal-radio-hacker` | Reverse unknown I/Q: auto-detects modulation/baud, extracts bitstream, diff, replay. |
| `whad` | Unified Python framework: BLE, 802.15.4/Zigbee, Thread, LoRa, ESB, Unifying. One toolchain for many radios. |

## 5. Golden rule: band + IBW + duplex

Before choosing a radio at SP, answer three questions:

1. **Does it reach the band?** RTL-SDR tops out at 1.766 GHz → no 2.4 GHz. UWB (6.5/8 GHz) → out of
   reach of HackRF/bladeRF/B210 (6 GHz ceiling); only USRP X410 (7.2 GHz, $10k+) comes close.
2. **Does the band/connection fit in the IBW?** BLE is 80 MHz; HackRF sees 20 MHz (one slice), bladeRF
   oversampling covers 122.88 MHz (all of it). A BLE connection hops → either capture all, or follow the hop.
3. **Do you need TX (full duplex)?** Replay/forge/jam/rogue-cell require TX. HackRF = half (RX or TX),
   not simultaneous. bladeRF/USRP = full duplex. RTL-SDR = RX only, never transmits.

This matrix decides what is **achievable** with the available kit before promising a result.

## Subflow (SP entry for any protocol)

The SDR-general family **is not** a protocol: it describes the radio selection and spectrum survey that precedes any descent. Apply the `## Golden rule: band + IBW + duplex` from above.

| Progress | Criterion | Markers |
|--------|----------|------------|
| Radio selection | The target sub-band chooses the radio, not the other way around: sub-GHz → RTL-SDR suffices; 2.4 GHz → HackRF/bladeRF; LTE/5G FR1 → USRP B210 + GPSDO | — |
| UWB / 5G FR2 (>6 GHz, BW>500 MHz) | **No radio in the kit reaches it** → declare a visibility gap (Route A), do not simulate capture | — |
| SP → protocol descent | Signal confirmed in waterfall → load the `NN-proto.md` wayfinder and follow the master flow of `SKILL.md` | — |

**Defensive anomaly** (Defensive mode, RX-only): continuous survey of your spectrum looking for carriers/humps that do **not** correspond to known own activity (jammer, spurious peak, unknown link). Record in `loot/notes/`.
