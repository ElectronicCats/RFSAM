---
slug: esp32-deauther-ganesh
name: ESP32 Deauther (GANESH-ICMC)
vendor: GANESH-ICMC
type: project
protocols:
  - Wi-Fi
repo: 'https://github.com/GANESH-ICMC/esp32-deauther'
status: eol
statusNote: >-
  Does not build against current ESP-IDF and its effect is disputed; the
  catalogue carries two maintained replacements.
statusChecked: 2026-09-23
successor: esp32-marauder
note: >-
  An ESP-IDF port of the Spacehuhn deauther to the ESP32, built on the
  esp_wifi_80211_tx frame-injection function — the canonical bare-ESP32 deauth
  path referenced by risinek's penetration tool. NOTE: unmaintained since 2021
  and ships no license file; confirm it builds against a current ESP-IDF before
  relying on it. (The famous Spacehuhn esp8266_deauther is ESP8266-only and does
  not run on the ESP32.)
---
An ESP-IDF port of the Spacehuhn deauther to the ESP32, built on the esp_wifi_80211_tx frame-injection function — the canonical bare-ESP32 deauth path referenced by risinek's penetration tool. NOTE: unmaintained since 2021 and ships no license file; confirm it builds against a current ESP-IDF before relying on it. (The famous Spacehuhn esp8266_deauther is ESP8266-only and does not run on the ESP32.)
