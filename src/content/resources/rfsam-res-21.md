---
id: RFSAM-RES-21
title: Capture and decode ADS-B (1090ES / 978 UAT)
---
ADS-B is broadcast and unencrypted. Receive 1090 MHz Mode S Extended Squitter (1090ES, PPM) on an RTL-SDR and decode with dump1090 or readsb to recover the ICAO 24-bit address, callsign, altitude and position from the DF17/DF18 messages; in the US, decode the 978 MHz UAT link with dump978. There is no crypto to break, the security property of interest is the *absence* of authentication or integrity, which is what makes injection/spoofing possible (and is assessed, authorised and RF-contained, at the Attack step).
