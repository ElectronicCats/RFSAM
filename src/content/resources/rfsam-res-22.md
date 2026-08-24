---
id: RFSAM-RES-22
title: Identify and capture a 5G NR cell
---
Find the 5G NR carrier and its SS/PBCH block (SSB) on a waterfall, FR1 sub-6 GHz is reachable with a USRP-class SDR, while FR2 mmWave (~24 to 40 GHz) is out of reach of the common kit. There is no drop-in passive SA receiver: the practical routes are to stand up your own gNB (srsRAN Project or OpenAirInterface) with a 5G core and read the SSB / MIB / SIB1 from a controlled cell, to use a research PDCCH/MAC sniffer (5GSniffer / Sni5Gect) on a USRP, or to pull signalling off a Qualcomm 5G modem's DIAG interface with QCSuper into Wireshark. Note the SUCI conceals the SUPI, so the LTE-style cleartext-IMSI harvest is closed.
