# 12 — Wi-Fi (802.11)

> Wayfinder + controles RFSAM para Wi-Fi. RFSAM es dueño end-to-end (no BSAM). Sin referencia externa.

## Facts
- **Banda**: 2.4 GHz (2.400–2.4835) · 5 GHz (UNII ~5.15–5.85) · 6 GHz (5.925–7.125, Wi-Fi 6E/7).
- **Canales**: 2.4 GHz 1–14 (1/6/11 no solapan) · 5 GHz ~25 (varios DFS) · 6 GHz hasta 59 × 20 MHz. Anchos 20/40/80/160 (320 en Wi-Fi 7).
- **Estándares**: b/g/n (2.4) · a/n/ac (5) · ax=Wi-Fi 6/6E · be=Wi-Fi 7.
- **Seguridad**: Open · WEP (roto) · WPA/WPA2-PSK (handshake, PMKID) · WPA2/3-Enterprise (802.1X) · WPA3-SAE · OWE. WPS PIN = punto débil. WPA3 obligatorio en 6 GHz.
- **Alcance**: ~10–50 m interior; 100 m+ exterior a 2.4 GHz.

## Descenso por capa

### IG (sin control dedicado — fingerprinting de escritorio)
- Leer FCC ID, OUI del BSSID, beacon RSN/WPA. Cruzar CVEs: KRACK (WPA2), FragAttacks, Dragonblood (WPA3-SAE). Estado WPS.

### SP — `RFSAM-WIFI-SP-01` Band and channel survey
- **Objetivo**: enumerar redes, canales, seguridad y clientes antes de comprometer objetivo.
- **Kit**: Kismet (survey pasivo + GPS), airodump-ng (tabla live APs/clientes), Minino/ESP32 Marauder/Ghost ESP (scan pocket). 6 GHz necesita adaptador Wi-Fi 6E.
- **Comando**: `airodump-ng -c <ch> --bssid <MAC> -w cap wlan0mon`.

### LL — `RFSAM-WIFI-LL-01` Management-frame exposure
- **Objetivo**: capturar management frames (beacons, probes, EAPOL) → exposición y handshakes.
- **Kit**: airodump-ng (capture), hcxdumptool (PMKID clientless + EAPOL), Kismet (logged capture), ESP32 Marauder/risinek (handshake pocket).
- **Comando**: poner adaptador en monitor mode; `airodump-ng wlan0mon -c 6 -w capture`.
- Confirmar inyección antes de active: `aireplay-ng --test wlan0mon`.

### CR — `RFSAM-WIFI-CR-01` WPA handshake / PMKID assessment
- **Objetivo**: evaluar crypto y recuperar clave donde es débil. WPA2-PSK → offline attack sobre handshake/PMKID; WPS PIN → online attack; WEP → trivial. WPA3-SAE/OWE resisten (Dragonblood = bug de implementación).
- **Kit**: hashcat (modo 22000 GPU), hcxtools (pcapng→.hc22000), aircrack-ng (CPU + WEP), reaver (WPS Pixie-Dust/PIN).
- **Comando**: `hcxpcapngtool -o hash.hc22000 capture.pcapng` → `hashcat -m 22000 hash.hc22000 wordlist.txt`.
- **⚠ Deauth para forzar handshake**: solo con autorización; PMF (802.11w/WPA3) lo bloquea.

### AT (sin control dedicado en coverage-map — técnicas activas)
- **⚠ AUTORIZACIÓN OBLIGATORIA**. Deauth (aireplay-ng, bloqueado por PMF), MDK4 (flood), evil-twin (wifiphisher/EAPHammer/hostapd-mana). Kit: ALFA AWUS036ACH (monitor+inject).

### AP
- **Objetivo**: lo que el cliente confía tras asociarse — captive portal, credenciales, MITM.
- **Kit**: wifiphisher (rogue-AP + portal phishing), EAPHammer (Enterprise evil-twin 802.1X), bettercap (MITM post-asociación), ESP32 Marauder (Evil Portal).

## Subflujo (especialización del flujo maestro)

Transiciones específicas de Wi-Fi; los comandos verbatim viven en `Descenso por capa` arriba.

| Avance | Criterio de avance | Marcadores |
|--------|--------------------|------------|
| IG → SP | AP/SSID/seguridad identificados pasivamente (beacon/RSN IE) | — |
| SP → PHY+LL | Canal target fijado; adaptador en monitor mode. **6 GHz** requiere radio Wi-Fi 6E dedicado (SDR no decodifica 802.11ac/ax live) | — |
| PHY+LL → CR | ¿Handshake/PMKID capturado o enlace abierto? | — |
| CR → AT | Clave recuperada (WPA2-PSK/WEP/WPS) o modo activo justificado. WPA3-SAE/OWE **resisten** offline (Dragonblood = bug de implementación) | — |
| AT | ⚠TX re-check; PMF (802.11w/WPA3) **bloquea** deauth → verifica antes | ⚠TX |
| AP (sin control formal) | Ataque post-asociación: captive portal, MITM, harvesting | — |

**Anomalía defensiva** (modo Defensivo, RX-only): deauth **masivo** o frames de gestión anómalas sobre tu red propia = posible jamming/evil-twin. Registra; **no** desciendas a AT.

## Advertencias legales
- RX pasivo de beacons OK; capturar datos de terceros suele regularse.
- **Deauth, evil-twin, inyección, harvesting credenciales = activos**: solo con autorización; capturar credenciales de terceros sin consentimiento es delito.
- Reaver/Pixie-Dust: solo donde WPS habilitado y autorizado.
