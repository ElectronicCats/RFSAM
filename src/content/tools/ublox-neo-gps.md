---
name: u-blox NEO GPS/GNSS receiver
vendor: u-blox
type: hardware
protocols:
  - GNSS
homepage: 'https://www.u-blox.com/en/product/neo-m9n-module'
spec: >-
  L1 GNSS receiver module (GPS/GLONASS/Galileo/BeiDou); USB or UART/serial; NMEA
  0183 + UBX output
software:
  - gpsd
  - u-center
note: >-
  The everyday GPS-receiver path: a cheap, common u-blox NEO-class module
  (NEO-6M / 7 / 8 / 9, often on a USB-serial breakout) that tracks the
  satellites itself and reports the solved position/time as plain NMEA 0183
  sentences (plus binary UBX). This is how most projects 'get GPS' — no SDR, no
  signal processing on your side; the chip does the acquisition and you just
  read the serial stream. Use it with an active GPS antenna for a usable fix
  indoors-adjacent.
---
The everyday GPS-receiver path: a cheap, common u-blox NEO-class module (NEO-6M / 7 / 8 / 9, often on a USB-serial breakout) that tracks the satellites itself and reports the solved position/time as plain NMEA 0183 sentences (plus binary UBX). This is how most projects 'get GPS' — no SDR, no signal processing on your side; the chip does the acquisition and you just read the serial stream. Use it with an active GPS antenna for a usable fix indoors-adjacent.
