---
slug: loracrack
name: Loracrack
vendor: Applied Risk (Sipke Mellema)
type: project
protocols:
  - LoRa
status: stale
statusNote: >-
  README and Makefile target OpenSSL 1.0.x (1.0.2 went end of life at the end of
  2019) and the last commit is 2019-03-26. An open issue reports it does not
  compile with libssl 1.1.1 because EVP_CIPHER_CTX is no longer exposed.
statusSource: 'https://github.com/applied-risk/Loracrack/issues/3'
statusChecked: '2026-09-28'
repo: 'https://github.com/applied-risk/Loracrack'
note: >-
  Proof-of-concept LoRaWAN session cracker that exploits weak or shared
  Application Keys: given a known/guessable AppKey it derives the session keys
  from captured packets and validates against the MIC, demonstrating the danger
  of reused or default AppKeys. Not a brute-forcer of strong AES-128 keys.
---
Proof-of-concept LoRaWAN session cracker that exploits weak or shared Application Keys: given a known/guessable AppKey it derives the session keys from captured packets and validates against the MIC, demonstrating the danger of reused or default AppKeys. Not a brute-forcer of strong AES-128 keys.
