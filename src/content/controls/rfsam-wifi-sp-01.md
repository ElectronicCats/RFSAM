---
id: RFSAM-WIFI-SP-01
title: Survey bands, channels and monitor-mode capture feasibility
protocol: WIFI
layer: SP
criticality: info
applicability:
  - 802.11 b/g/n (2.4 GHz)
  - 802.11 a/n/ac/ax (5 GHz)
  - 802.11 ax/be (6 GHz, Wi-Fi 6E/7)
deferred: false
objective: >-
  Establish which 802.11 bands and channels carry traffic in scope, enumerate
  the access points and clients on each, and confirm whether the auditing radio
  can passively capture (and, where later controls require it, inject) on every
  band the targets use — so a later "not seen" is recorded as a capability gap,
  not an all-clear.
intro: >-
  Wi-Fi spans three bands and dozens of channels, and a radio listens to only
  one channel at a time, so a survey means channel-hopping and logging every AP
  and client heard. A standard monitor-mode adapter covers 2.4 and 5 GHz; 6 GHz
  (Wi-Fi 6E/7) needs a 6 GHz-capable radio, and many 5 GHz channels are gated by
  DFS. This control draws the map and records the adapter's capability envelope
  before any active step.
prerequisites:
  hardware:
    - 'A monitor-mode-capable 802.11 adapter — ALFA AWUS036ACH (RTL8812AU) for 2.4/5 GHz with injection; a Wi-Fi 6E adapter for 6 GHz; or an Electronic Cats Minino (ESP32-C6) for standalone 2.4 GHz survey/wardriving with onboard GPS.'
  software:
    - 'Linux with mac80211 drivers; airmon-ng / airodump-ng (aircrack-ng), Kismet, hcxdumptool, and Wireshark for inspection.'
  signal:
    freq: '2.400–2.4835 GHz (2.4 GHz) · ~5.15–5.85 GHz (5 GHz U-NII) · 5.925–7.125 GHz (6 GHz, Wi-Fi 6E/7)'
    bandwidth: '20 / 40 / 80 / 160 MHz channels (320 MHz in Wi-Fi 7)'
    modulation: 'DSSS (legacy 2.4 GHz) and OFDM / OFDMA (802.11a/g/n/ac/ax); QAM subcarriers up to 1024-QAM (ax) / 4096-QAM (be)'
  skill: beginner
attacks: []
references:
  - key: ieee80211-2020
    title: 'IEEE Std 802.11-2020 — Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications'
    authors: IEEE 802.11 Working Group
    venue: IEEE Standards Association
    year: 2021
    url: 'https://standards.ieee.org/ieee/802.11/7028/'
    type: standard
  - key: radiotap
    title: 'Radiotap — the de facto standard header for 802.11 frame injection and reception'
    authors: D. Young et al.
    venue: radiotap.org
    url: 'https://www.radiotap.org/'
    type: spec
  - key: wireshark-wlan
    title: 'CaptureSetup/WLAN — capturing 802.11 traffic and enabling monitor mode'
    venue: Wireshark Wiki
    url: 'https://wiki.wireshark.org/CaptureSetup/WLAN'
    type: spec
  - key: linux-dfs
    title: 'DFS (Dynamic Frequency Selection) — Channel Availability Check and radar detection in mac80211/cfg80211'
    venue: Linux Wireless (kernel.org) documentation
    url: 'https://wireless.docs.kernel.org/en/latest/en/developers/dfs.html'
    type: spec
  - key: fcc-6ghz-2020
    title: 'Unlicensed Use of the 6 GHz Band (5.925–7.125 GHz) — FCC Report and Order fact sheet'
    authors: Federal Communications Commission
    venue: FCC
    year: 2020
    url: 'https://docs.fcc.gov/public/attachments/doc-363490a1.pdf'
    type: standard
  - key: kismet
    title: 'Kismet — passive wireless sniffer, survey and wardriving tool'
    authors: M. Kershaw (dragorn) et al.
    venue: Kismet Wireless
    url: 'https://github.com/kismetwireless/kismet'
    type: tool
  - key: aircrack-ng
    title: 'aircrack-ng — 802.11 monitor-mode capture suite (airmon-ng, airodump-ng, aireplay-ng)'
    venue: aircrack-ng
    url: 'https://github.com/aircrack-ng/aircrack-ng'
    type: tool
  - key: hcxdumptool
    title: 'hcxdumptool — capture packets from WLAN devices (PMKID / EAPOL)'
    authors: ZerBea
    venue: GitHub
    url: 'https://github.com/ZerBea/hcxdumptool'
    type: tool
  - key: minino
    title: 'Minino — Electronic Cats ESP32-C6 multiprotocol multitool (Wi-Fi wardriving, sniffer, GPS)'
    authors: Electronic Cats
    venue: GitHub
    url: 'https://github.com/ElectronicCats/Minino'
    type: tool
  - key: wpa3-spec
    title: 'WPA3 Specification — 6 GHz band constraints (WPA3/OWE only, PMF mandatory, no transition mode)'
    authors: Wi-Fi Alliance
    venue: Wi-Fi Alliance
    url: 'https://www.wi-fi.org/system/files/WPA3%20Specification%20v3.4.pdf'
    type: spec
tools:
  - kismet
  - aircrack-ng
  - minino
bsam: []
resources:
  - RFSAM-RES-11
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

802.11 operates across three unlicensed bands: 2.4 GHz (2.400–2.4835 GHz), the 5 GHz U-NII bands (~5.15–5.85 GHz), and — since the 2020 FCC order opening 1200 MHz of new spectrum — 6 GHz (5.925–7.125 GHz), used by Wi-Fi 6E and Wi-Fi 7 [fcc-6ghz-2020][ieee80211-2020]. The PHY is DSSS for legacy 2.4 GHz rates and OFDM/OFDMA for 802.11a/g/n/ac/ax, in channels of 20/40/80/160 MHz (320 MHz in Wi-Fi 7) [ieee80211-2020]. A receiver demodulates only the channel it is tuned to, so observing a whole environment means hopping channels and logging what is heard on each — the survey.

Passive capture depends on **monitor mode**: outside monitor mode an adapter delivers only unicast traffic to/from the host plus broadcast/multicast, often with synthetic Ethernet headers and no radio metadata; in monitor mode the adapter's frame filter is switched off and every received 802.11 frame — management, control and data — is delivered to userspace with a radio-layer header [wireshark-wlan]. That per-frame metadata (channel, rate, signal) is carried in a **radiotap** header prepended to each captured frame, the de facto standard for 802.11 reception and injection across Linux drivers and libpcap [radiotap]. Whether a given adapter supports monitor mode, and on which bands, is a property of its chipset and driver — not every adapter does it, and many built-in cards cannot inject at all [wireshark-wlan].

Two band-specific constraints scope what a survey can see. **DFS (Dynamic Frequency Selection):** many 5 GHz channels are shared with radar; before a master transmits on a DFS channel it must perform a Channel Availability Check, sitting idle and listening for radar pulses, and must vacate on detection [linux-dfs]. A passive survey can still *receive* on DFS channels, but APs may be sparse or absent there, and an injection-capable adapter will refuse to transmit until CAC completes — relevant to later active controls. **6 GHz:** Wi-Fi 6E/7 traffic is invisible to a 2.4/5 GHz-only adapter; capturing it requires a 6 GHz-capable radio [fcc-6ghz-2020]. Recording these gaps is the point of this control: it sets the honest scope so a later "no handshake / no AP seen" is read as a capability limit, not a clean result.

This is an observational, capture-feasibility control — the map drawn before any AT-layer step (deauthentication, rogue AP) is attempted. It carries no offensive technique of its own, hence no `attacks[]`.

## Procedure

> Authorised-testing framing: even a "passive" survey can capture other parties' frames and (with GPS) their locations. Run it only within an authorised scope, against networks you own or are permitted to assess, and store captures as sensitive evidence. Steps 2–6 here transmit nothing; the deauth/injection check in step 5 is an active transmission and must stay inside that authorisation.

1. **Identify the adapter and its bands.** Confirm the chipset and which bands the driver exposes:
   ```bash
   iw list | grep -A40 'Band'
   ```
   Each `Band N:` block lists the frequencies/channels the radio can tune. Note whether 5 GHz and/or 6 GHz bands appear at all — absence here is a hard capability gap [wireshark-wlan].

2. **Enter monitor mode.** Put the interface into monitor mode and kill processes that would fight it:
   ```bash
   sudo airmon-ng check kill
   sudo airmon-ng start wlan0
   ```
   `airmon-ng` reports the new monitor interface (typically `wlan0mon`). Confirm it with `iw dev` showing `type monitor` [aircrack-ng][wireshark-wlan].

3. **Survey 2.4 and 5 GHz.** Channel-hop and log every AP and client:
   ```bash
   sudo airodump-ng --band abg wlan0mon
   ```
   The live table lists BSSID, channel (`CH`), encryption (`ENC`/`CIPHER`/`AUTH`), signal (`PWR`) and associated stations. `--band a` is 5 GHz, `b`/`g` are 2.4 GHz [aircrack-ng]. Record the channels in use and the security mode read from each beacon's RSN element.

4. **Quiet / logged survey with GPS (wardriving).** For a non-transmitting map of a wider area, use Kismet, which channel-hops and logs every AP/client/SSID to pcapng with GPS and never transmits [kismet]:
   ```bash
   kismet -c wlan0mon
   ```
   Open the web UI (`http://localhost:2501`); each device row carries its band, channel, last-seen and (with a gpsd source) location. For a standalone, laptop-free 2.4 GHz survey/wardrive, an Electronic Cats Minino (ESP32-C6) logs SSIDs and GPS fixes to microSD [minino].

5. **Confirm injection (only if later active controls need it).** Before relying on any deauth/handshake-forcing control, verify the adapter can actually transmit on the target band:
   ```bash
   sudo aireplay-ng --test wlan0mon
   ```
   `Injection is working!` confirms transmit capability; a failure means later "no handshake captured" results would be your radio, not the target [aircrack-ng]. This step transmits — keep it inside the authorised scope.

6. **Record DFS / 6 GHz gaps.** Note any 5 GHz DFS channels where the survey saw no traffic (an AP may be present but the radio cannot be confirmed there without CAC) [linux-dfs], and explicitly record whether 6 GHz was surveyed at all — a 2.4/5 GHz adapter cannot see Wi-Fi 6E/7 [fcc-6ghz-2020]. Optionally confirm key-material capture feasibility with a clientless PMKID probe (`hcxdumptool`) on in-scope APs, written as pcapng for the CR-layer control [hcxdumptool].

## Field case

Illustrative walkthrough — substitute the values you capture. Surveying a small-office network in scope, an ALFA AWUS036ACH (RTL8812AU) in monitor mode is hopped across 2.4 and 5 GHz with `airodump-ng --band abg`. A typical 2.4 GHz pass finds the target SSID on channel 6 (WPA2-PSK/CCMP) plus two neighbour APs on 1 and 11; the 5 GHz pass finds the same ESSID's `ac` BSSID on channel 36 (non-DFS). `aireplay-ng --test wlan0mon` returning `Injection is working!` on channel 6 is what scopes the later handshake-capture control as feasible on 2.4 GHz.

The point of the survey is that the two gaps below get recorded, not hidden:
- **6 GHz not surveyed** — the RTL8812AU has no 6 GHz radio, so any Wi-Fi 6E client steering to 6 GHz is invisible. Mark it as a capability gap requiring a Wi-Fi 6E adapter to close [fcc-6ghz-2020].
- **5 GHz DFS channels (52–144)** — no APs observed there, but a passive sweep cannot distinguish "no AP" from "AP present, not captured" on DFS channels without a longer dwell; record it as `unconfirmed` rather than `clear` [linux-dfs].

Record the measured signal level for each BSSID from the live `airodump-ng` table rather than assuming it: [FILL: measured PWR per BSSID].

## Remediation

This is an auditor-capability baseline rather than a device finding — its "remediation" is twofold: hardening guidance for the defender, and discipline for the auditor.

- **Developer / vendor:** Do not rely on a hidden SSID or an unusual channel for security — a passive survey enumerates the BSSID, channel and security mode from beacons regardless [ieee80211-2020][wireshark-wlan]. Set the strongest mutually supported security (WPA3-SAE; WPA2-CCMP at minimum) and enable Protected Management Frames (802.11w) so later AT-layer deauth controls find no easy target. On the 6 GHz band — opened for unlicensed use by the 2020 FCC order [fcc-6ghz-2020] — WPA3 (or OWE) and PMF are mandatory by Wi-Fi Alliance certification, with no WPA2/transition mode permitted [wpa3-spec].
- **Integrator / operator:** Inventory which bands your estate actually uses and ensure monitoring/IDS covers all of them, including 6 GHz and DFS channels — an attacker steering a client to an unmonitored band exploits the same blind spot this control measures [fcc-6ghz-2020][linux-dfs]. Deploy wireless IDS to flag rogue APs and deauth floods that a survey would otherwise only reveal after the fact.
- **Auditor:** Always confirm and document the adapter's band coverage and injection capability up front (steps 1, 5) so scope is honest; treat every "not seen" on an unsupported band or unconfirmed DFS channel as a capability gap, never an all-clear. Channel corpora and adapter chipset support date quickly — verify current driver/monitor-mode status for your hardware rather than assuming [wireshark-wlan].
