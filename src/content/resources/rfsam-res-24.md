---
id: RFSAM-RES-24
title: Capture UWB 802.15.4z ranging exchanges
---
UWB cannot be blind-scanned and no SDR in the common kit reaches its >500 MHz-wide channels at 6.5 GHz (ch 5) / 8 GHz (ch 9). Capture 802.15.4z frames with a real UWB transceiver that already knows the link's channel, preamble code, data rate and STS mode/length: a Qorvo DWM3000EVB running the SEEMOO uwb-sniffer firmware forwards frames to Wireshark with picosecond timestamps, and a controllable DW3000 peer (Makerfabs board / foldedtoad driver) logs the ranging exchanges it participates in. Capturing the frames does not defeat the STS, the research surface is physical-layer distance manipulation, not key recovery.
