---
slug: esp32-deauther-ganesh
name: ESP32 Deauther (GANESH-ICMC)
vendor: GANESH-ICMC
type: project
protocols:
  - Wi-Fi
repo: 'https://github.com/GANESH-ICMC/esp32-deauther'
status: stale
statusNote: >-
  Last commit 2020-09-13; the README builds with GNU make against an ESP-IDF
  4.1-dev commit, and ESP-IDF 5.0 removed GNU make support. ESP32 Marauder is
  actively released (v1.17.0, 2026-09-16).
statusSource: 'https://github.com/GANESH-ICMC/esp32-deauther/blob/master/README.md'
statusChecked: '2026-09-28'
successor: esp32-marauder
note: >-
  An ESP-IDF port of the Spacehuhn deauther to the ESP32, built on the
  esp_wifi_80211_tx frame-injection function, the canonical bare-ESP32 deauth
  path referenced by risinek's penetration tool. NOTE: unmaintained since 2021
  and ships no license file; confirm it builds against a current ESP-IDF before
  relying on it. (The famous Spacehuhn esp8266_deauther is ESP8266-only and does
  not run on the ESP32.)
---
An ESP-IDF port of the Spacehuhn deauther to the ESP32, built on the esp_wifi_80211_tx frame-injection function, the canonical bare-ESP32 deauth path referenced by risinek's penetration tool. NOTE: unmaintained since 2021 and ships no license file; confirm it builds against a current ESP-IDF before relying on it. (The famous Spacehuhn esp8266_deauther is ESP8266-only and does not run on the ESP32.)
