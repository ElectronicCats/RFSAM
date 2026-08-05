# 12 — Wi-Fi (802.11)

> Wayfinder + RFSAM controls for Wi-Fi. RFSAM owns end-to-end (no BSAM). No external reference.

## Facts
- **Band**: 2.4 GHz (2.400–2.4835) · 5 GHz (UNII ~5.15–5.85) · 6 GHz (5.925–7.125, Wi-Fi 6E/7).
- **Channels**: 2.4 GHz 1–14 (1/6/11 non-overlapping) · 5 GHz ~25 (several DFS) · 6 GHz up to 59 × 20 MHz. Widths 20/40/80/160 (320 in Wi-Fi 7).
- **Standards**: b/g/n (2.4) · a/n/ac (5) · ax=Wi-Fi 6/6E · be=Wi-Fi 7.
- **Security**: Open · WEP (broken) · WPA/WPA2-PSK (handshake, PMKID) · WPA2/3-Enterprise (802.1X) · WPA3-SAE · OWE. WPS PIN = weak point. WPA3 mandatory on 6 GHz.
- **Range**: ~10–50 m indoor; 100 m+ outdoor at 2.4 GHz.

## Layer-by-layer descent

### IG (no dedicated control — desktop fingerprinting)
- Read FCC ID, BSSID OUI, beacon RSN/WPA. Cross-reference CVEs: KRACK (WPA2), FragAttacks, Dragonblood (WPA3-SAE). WPS status.

### SP — `RFSAM-WIFI-SP-01` Band and channel survey
- **Objective**: enumerate networks, channels, security and clients before compromising the target.
- **Kit**: Kismet (passive survey + GPS), airodump-ng (live AP/client table), Minino/ESP32 Marauder/Ghost ESP (pocket scan). 6 GHz requires a Wi-Fi 6E adapter.
- **Command**: `airodump-ng -c <ch> --bssid <MAC> -w cap wlan0mon`.

### LL — `RFSAM-WIFI-LL-01` Management-frame exposure
- **Objective**: capture management frames (beacons, probes, EAPOL) → exposure and handshakes.
- **Kit**: airodump-ng (capture), hcxdumptool (clientless PMKID + EAPOL), Kismet (logged capture), ESP32 Marauder/risinek (pocket handshake).
- **Command**: put adapter in monitor mode; `airodump-ng wlan0mon -c 6 -w capture`.
- Confirm injection before going active: `aireplay-ng --test wlan0mon`.

### CR — `RFSAM-WIFI-CR-01` WPA handshake / PMKID assessment
- **Objective**: assess crypto and recover key where it is weak. WPA2-PSK → offline attack on handshake/PMKID; WPS PIN → online attack; WEP → trivial. WPA3-SAE/OWE resist (Dragonblood = implementation bug).
- **Kit**: hashcat (mode 22000 GPU), hcxtools (pcapng→.hc22000), aircrack-ng (CPU + WEP), reaver (WPS Pixie-Dust/PIN).
- **Command**: `hcxpcapngtool -o hash.hc22000 capture.pcapng` → `hashcat -m 22000 hash.hc22000 wordlist.txt`.
- **⚠ Deauth to force handshake**: only with authorization; PMF (802.11w/WPA3) blocks it.

### AT (no dedicated control in coverage-map — active techniques)
- **⚠ MANDATORY AUTHORIZATION**. Deauth (aireplay-ng, blocked by PMF), MDK4 (flood), evil-twin (wifiphisher/EAPHammer/hostapd-mana). Kit: ALFA AWUS036ACH (monitor+inject).

### AP
- **Objective**: what the client trusts after associating — captive portal, credentials, MITM.
- **Kit**: wifiphisher (rogue-AP + phishing portal), EAPHammer (Enterprise evil-twin 802.1X), bettercap (post-association MITM), ESP32 Marauder (Evil Portal).

## Subflow (specialization of the master flow)

Wi-Fi-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG → SP | AP/SSID/security identified passively (beacon/RSN IE) | — |
| SP → PHY+LL | Target channel fixed; adapter in monitor mode. **6 GHz** requires a dedicated Wi-Fi 6E radio (SDR cannot decode 802.11ac/ax live) | — |
| PHY+LL → CR | Handshake/PMKID captured or open link? | — |
| CR → AT | Key recovered (WPA2-PSK/WEP/WPS) or active mode justified. WPA3-SAE/OWE **resist** offline (Dragonblood = implementation bug) | — |
| AT | ⚠TX re-check; PMF (802.11w/WPA3) **blocks** deauth → verify first | ⚠TX |
| AP (no formal control) | Post-association attack: captive portal, MITM, harvesting | — |

**Defensive anomaly** (Defensive mode, RX-only): **massive** deauth or anomalous management frames on your own network = possible jamming/evil-twin. Register; do **not** descend to AT.

## Legal warnings
- Passive RX of beacons OK; capturing third-party data is typically regulated.
- **Deauth, evil-twin, injection, credential harvesting = active**: authorized only; capturing third-party credentials without consent is a crime.
- Reaver/Pixie-Dust: only where WPS is enabled and authorized.
