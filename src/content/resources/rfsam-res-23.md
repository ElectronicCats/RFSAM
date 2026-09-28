---
id: RFSAM-RES-23
title: Survey and capture a GSM cell (ARFCN → GSMTAP)
---
Scan a GSM band (850 / 900 / 1800 / 1900) for live base-station carriers with kalibrate, which locks onto each BTS's FCCH/SCH bursts and reports the ARFCN, its power and the radio's ppm clock offset. Tune the target ARFCN on an SDR and demodulate with gr-gsm (grgsm_livemon): it decodes the BCCH/CCCH/SDCCH bursts and streams GSMTAP over UDP into Wireshark, where you read the System Information, paging and the Cipher Mode Command, confirming the A5/x cipher in force and whether the cell exposes the IMSI. Easiest on a non-hopping downlink.
