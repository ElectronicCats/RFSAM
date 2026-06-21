# 02 — Catálogo de Kit SDR y Sniffers

> Catálogo de los radios y herramientas de la skill RFSAM, con sus límites críticos (banda, ancho
> de banda instantáneo IBW, half/full dúplex, RX-only). La elección de radio en la capa SP **acota
> toda la auditoría**: un "no observado" bajo una ventana estrecha es un gap, no ausencia.
> Fuente: `RFSAM/scripts/seed-tools.mjs` + `RFSAM/src/data/protocol-tools/*.json`.

## Índice
1. SDRs wide-band
2. SDRs/dongles económicos
3. Sniffers dedicados por protocolo
4. Herramientas host universales
5. Regla de oro: banda + IBW + dúplex

---

## 1. SDRs wide-band

| Slug | Radio | IBW | Rango | Dúplex | Notas |
|------|-------|-----|-------|--------|-------|
| `hackrf-one` | HackRF One (Great Scott Gadgets) | ~20 MHz | 1 MHz–6 GHz | half | Radio de descubrimiento. No ve toda la banda BLE/Wi-Fi a la vez. |
| `bladerf-2-micro` | bladeRF 2.0 micro xA9 (Nuand) | ~56 MHz (oversampling 122.88 MHz @ 8-bit) | 47 MHz–6 GHz | full | Desde release 2023.02, oversampling cubre los 80 MHz de BLE en un pase. AD9361. |
| `usrp-b210` | USRP B210 (Ettus/NI) | ~56 MHz (30.72 en 2×2) | 70 MHz–6 GHz | full | Lab-grade, opción GPSDO para celular coherente. Común en ice9/srsRAN. |
| `signalsdr-pro` | SignalSDR Pro (Signalens) | 61.44 MHz | 70 MHz–6 GHz | 2TX/2RX | AD9361, forma Pi. Más ancho IBW. Producto emergente — verifica soporte. |
| `rtl-sdr-v4` | RTL-SDR Blog V4 | ~2.4 MHz | 0.5 kHz–1.766 GHz | RX only | **No llega a 2.4 GHz** → no BLE/Wi-Fi/Zigbee. Vale para sub-GHz, LoRa, ADS-B (1090). Barato. |

## 2. SDRs/dongles económicos

| Slug | Qué es | Para qué |
|------|--------|----------|
| `ubertooth-one` | Sniffer BLE/BT abierto (CC2400) | BLE/Classic en ~$120; pre-BT5, débil en enlaces largos. Software: `ubertooth-tools`. |
| `yard-stick-one` | Transceptor sub-GHz CC1111 (300–928 MHz) | RX/TX OOK/ASK/FSK vía `rfcat`. La herramienta sub-GHz barata de referencia. |
| `flipper-zero` | Multitool handheld (CC1101) | RX/TX 300–348/387–464/779–928 MHz. Sub-GHz field capture/replay (código fijo solo en firmware stock). |

## 3. Sniffers dedicados por protocolo

| Slug | Hardware | Protocolos | Notas |
|------|----------|------------|-------|
| `catsniffer` | CatSniffer (Electronic Cats) CC1352+RP2040 | BLE, Sub-GHz, Zigbee, LoRa | Multiprotocolo. Corre Sniffle (BT5), 802.15.4, LoRa. Host: `catnip`. EC. |
| `nrf52840-dongle` | Nordic nRF52840 USB | BLE, 802.15.4 | Barato. Host del firmware nRF Sniffer (BLE) y nRF Sniffer 802.15.4, e InjectaBLE. |
| `bbc-microbit` | nRF51822 ~$15 | BLE | Radio barato para Btlejack (sniff/jam/hijack). |
| `stm32wlxx` | STM32WLxx (Nucleo-WL55JC / LoRa-E5) | LoRa, Sub-GHz | Arm M4 + radio sub-GHz integrado. Con firmware WHAD = sniffer/inject LoRa. |
| `proxmark3` | Proxmark3 (Iceman fork) | RFID/NFC LF+HF | Referencia RFID: Crypto1 suite completa, read/write/emulate, relay. |
| `chameleon-ultra` | ChameleonUltra (RRG) nRF52840 | RFID/NFC HF/LF | Emulador de tarjetas; MIFARE Classic Crypto1. |
| `bombercat` | BomberCat (Electronic Cats) PN7150 | NFC, MagStripe | Read/emulate + relay NFC + MagSpoof. EC. |
| `acr122u` | PN532/ACR122U USB | NFC HF 13.56 MHz | Lector barato libnfc; motor de mfoc/mfcuk. |
| `apimote` | ApiMote (River Loop) CC2420 | Zigbee/802.15.4 | Radio RX+TX de KillerBee (puede inyectar). |
| `cc2531` | TI CC2531 USB | Zigbee/802.15.4 2.4 GHz | Dongle capture-only (no inject). Bridge: `whsniff`. |
| `silabs-uzb7` | Silicon Labs UZB-7 (EFR32ZG14) | Z-Wave 700 | Stick para Z-Wave PC Controller / Zniffer (vendor). |
| `dwm3000evb` | Qorvo DWM3000EVB | UWB 802.15.4z | Ch5/Ch9. Plataforma del SEEMOO uwb-sniffer y de Ghost Peak. |
| `sim7600` | SIMCom SIM7600 LTE Cat-4 | LTE | Módem Qualcomm; AT+CPSI? da celda sirviendo; /dev/diag para QCSuper. |
| `quectel-rm500q` | Quectel RM500Q-GL 5G NR FR1 | 5G NR | Snapdragon X55; DIAG para QCSuper 5G. |
| `orbic-rc400l` | Orbic RC400L hotspot | LTE | Qualcomm /dev/diag — hardware de Rayhunter (EFF detector). |
| `rak-wisgate-connect` | RAK WisGate Connect (CM4 + SX1302) | LoRaWAN | Gateway multicanal; backend de ChirpCat. |
| `minino` | Minino (Electronic Cats) ESP32-C6 | Wi-Fi, BLE, Zigbee, Thread | Multitool pocket (GPS, microSD, OLED). 2.4 GHz only. EC. |
| `m5-cardputer`, `cyd`, `lilygo-t-embed-cc1101`, `esp32-devkit`, `esp32-s3-devkit`, `flipper-wifi-devboard` | Plataformas ESP32 handhelds | Wi-Fi, BLE, (+sub-GHz los de CC1101) | Chasis para Marauder/Bruce/Ghost ESP. Solo original ESP32 tiene Classic. |

## 4. Herramientas host universales

| Slug | Qué hace |
|------|----------|
| `wireshark` / `tshark` | El dissector universal. Casi todo sniffer exporta PCAP → Wireshark. Suministra claves para descifrar in-place. |
| `gqrx` | Waterfall SDR live (HackRF/bladeRF/USRP/RTL). "Ver qué transmite y dónde". |
| `universal-radio-hacker` | Reversar I/Q desconocido: auto-detecta modulación/baud, extrae bitstream, diff, replay. |
| `whad` | Framework Python unificado: BLE, 802.15.4/Zigbee, Thread, LoRa, ESB, Unifying. Un toolchain para muchos radios. |

## 5. Regla de oro: banda + IBW + dúplex

Antes de elegir radio en SP, responde tres preguntas:

1. **¿Llega a la banda?** RTL-SDR tope 1.766 GHz → nada de 2.4 GHz. UWB (6.5/8 GHz) → fuera de
   alcance de HackRF/bladeRF/B210 (tope 6 GHz); solo USRP X410 (7.2 GHz, $10k+) se acerca.
2. **¿Cabe la banda/conn en el IBW?** BLE son 80 MHz; HackRF ve 20 MHz (un slice), bladeRF
   oversampling los 122.88 MHz (toda). Una conexión BLE hoppa → o capturas todo, o sigues el hop.
3. **¿Necesitas TX (dúplex full)?** Replay/forge/jam/rogue-cell exigen TX. HackRF = half (RX o TX),
   no simultáneo. bladeRF/USRP = full dúplex. RTL-SDR = RX only, jamás transmite.

Esta matriz decide qué es **alcanzable** con el kit disponible antes de prometer un resultado.

## Subflujo (entrada SP para cualquier protocolo)

La familia SDR-general **no** es un protocolo: describe la selección de radio y el survey de espectro que precede a cualquier descenso. Aplica la `## Regla de oro: banda + IBW + dúplex` de arriba.

| Avance | Criterio | Marcadores |
|--------|----------|------------|
| Selección de radio | La sub-banda objetivo elige el radio, no al revés: sub-GHz → RTL-SDR basta; 2.4 GHz → HackRF/bladeRF; LTE/5G FR1 → USRP B210 + GPSDO | — |
| UWB / 5G FR2 (>6 GHz, BW>500 MHz) | **Ningún radio del kit lo alcanza** → declara gap de visibilidad (Ruta A), no simules captura | — |
| SP → descenso del protocolo | Señal confirmada en waterfall → carga el wayfinder `NN-proto.md` y sigue el flujo maestro de `SKILL.md` | — |

**Anomalía defensiva** (modo Defensivo, RX-only): survey continuo de tu espectro buscando portadoras/humps que **no** correspondan a actividad propia conocida (jammer, pico espurio, enlace desconocido). Registra en `loot/notes/`.
