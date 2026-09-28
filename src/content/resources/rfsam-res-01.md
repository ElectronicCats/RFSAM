---
id: RFSAM-RES-01
title: Capture raw I/Q with an SDR
---
Select an SDR whose instantaneous bandwidth covers the target, tune to the centre frequency, set sample rate ≥ signal bandwidth, and record I/Q to disk. Log overflow/dropped-sample counters, a capture with overflows is silently incomplete. Reference radios: RTL-SDR V4 (narrow), HackRF One (~20 MHz), USRP B210 (~56 MHz, GPSDO), bladeRF 2.0 (~61 MHz).
