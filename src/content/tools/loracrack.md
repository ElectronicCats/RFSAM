---
slug: loracrack
name: Loracrack
vendor: Applied Risk (Sipke Mellema)
type: project
protocols:
  - LoRa
repo: 'https://github.com/applied-risk/Loracrack'
status: stale
statusNote: >-
  Needs OpenSSL 1.0, end-of-life since 2019; it does not build against 1.1.1
  or 3.x.
statusChecked: 2026-09-23
note: >-
  Proof-of-concept LoRaWAN session cracker that exploits weak or shared
  Application Keys: given a known/guessable AppKey it derives the session keys
  from captured packets and validates against the MIC, demonstrating the danger
  of reused or default AppKeys. Not a brute-forcer of strong AES-128 keys.
---
Proof-of-concept LoRaWAN session cracker that exploits weak or shared Application Keys: given a known/guessable AppKey it derives the session keys from captured packets and validates against the MIC, demonstrating the danger of reused or default AppKeys. Not a brute-forcer of strong AES-128 keys.
