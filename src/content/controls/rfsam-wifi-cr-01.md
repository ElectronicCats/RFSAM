---
id: RFSAM-WIFI-CR-01
title: Assess WPA handshake and PMKID key recovery
protocol: WIFI
layer: CR
criticality: high
applicability:
  - WPA2-PSK
  - WPA3-SAE
  - WPA3 transitional mode
  - WPS
deferred: false
objective: >-
  Determine whether a network's pre-shared key can be recovered offline — from a
  captured 4-way handshake or a clientless RSN PMKID — or whether an enabled WPS
  PIN gives a faster online path to the PSK; and whether a WPA3 deployment is
  actually exposed to a WPA2 downgrade.
intro: >-
  WPA2-PSK confidentiality reduces to passphrase strength once an auditor captures
  either the 4-way handshake or, since 2018, the RSN PMKID straight from the access
  point with no client present. WPS PIN and WPA3 transitional mode add further
  recovery paths. This control captures the relevant material and assesses
  key-recovery feasibility — perform every active step only against networks you
  are explicitly authorised to test.
prerequisites:
  hardware:
    - 'A monitor-mode and injection-capable 802.11 adapter (e.g. ALFA AWUS036ACH / RTL8812AU). 6 GHz (Wi-Fi 6E/7) targets need a 6 GHz-capable radio.'
    - 'A GPU host for practical offline cracking of the captured hash.'
  software:
    - 'hcxdumptool (PMKID / EAPOL capture), hcxtools (pcapng → hc22000 conversion), hashcat (offline crack), aircrack-ng (capture + CPU crack), reaver / pixiewps (WPS PIN and Pixie-Dust).'
  signal:
    freq: '2.4 GHz (2.400–2.4835 GHz) · 5 GHz (UNII, ~5.15–5.85 GHz) · 6 GHz (5.925–7.125 GHz, Wi-Fi 6E/7)'
    bandwidth: '20/40/80/160 MHz channels (320 MHz in Wi-Fi 7)'
    modulation: 'OFDM (802.11a/g/n/ac/ax/be) / DSSS (legacy 802.11b)'
  skill: intermediate
attacks:
  - name: PMKID clientless capture
    refs:
      - steube2018pmkid
    impact: >-
      Recovers the material needed to crack the PSK offline from the AP alone — no
      associated client and no deauthentication required.
    preconditions: >-
      An AP whose first EAPOL/RSN frame carries a PMKID (many WPA2-PSK APs do);
      the PSK must then be weak enough to fall to the offline crack.
    summary: >-
      The RSN PMKID in the AP's first handshake message is HMAC-SHA1-128(PMK,
      "PMK Name" | MAC_AP | MAC_STA); capturing it lets the PMK/PSK be cracked
      offline (hashcat mode 22000) with no client and no deauth.
  - name: 4-way handshake offline crack
    refs:
      - steube2018pmkid
    impact: Offline recovery of a weak WPA/WPA2 PSK from a captured EAPOL exchange.
    preconditions: >-
      A client associating (or coerced to re-associate via deauth where PMF is
      absent and testing is authorised); a weak or dictionary passphrase.
    summary: >-
      Capturing the EAPOL 4-way handshake yields the same PMK-derived material,
      crackable offline once converted to the hc22000 hash format.
  - name: WPS PIN brute force
    cve:
      - CVE-2011-5053
    refs:
      - viehbock2011wps
    impact: Recovery of the 8-digit WPS PIN, and through it the WPA/WPA2 PSK directly.
    preconditions: WPS PIN method enabled on the AP with no effective lockout / rate-limiting.
    summary: >-
      The WPS PIN is validated in two halves with an independent checksum digit,
      cutting the search space to ~11,000 guesses; without lockout the PIN and
      thus the PSK are recoverable online.
  - name: WPS Pixie-Dust offline attack
    refs:
      - bongard2014pixie
    impact: Near-instant offline recovery of the WPS PIN (and thus the PSK) on vulnerable chipsets.
    preconditions: >-
      WPS enabled on an AP whose Registrar uses weak/zero E-S1/E-S2 nonce entropy
      (e.g. Ralink nonces fixed at zero, weak Broadcom PRNG).
    summary: >-
      Weak or non-existent entropy in the Registrar's E-S1/E-S2 nonces lets the
      PIN be brute-forced offline from a single exchange, bypassing the online
      handshake entirely.
  - name: Dragonblood (WPA3-SAE side channels and downgrade)
    cve:
      - CVE-2019-9494
    refs:
      - vanhoef2020dragonblood
      - cve-2019-9494
    impact: >-
      Timing/cache side-channel leakage of SAE password material, plus
      group-downgrade and transition-mode downgrade that re-expose the WPA2 attack
      surface.
    preconditions: >-
      A vulnerable SAE implementation (hostapd/wpa_supplicant ≤ 2.7) and/or a
      WPA3 network running transitional (mixed WPA2/WPA3) mode.
    summary: >-
      Dragonblood showed SAE side-channels and downgrade attacks against WPA3;
      transitional-mode networks still present the full WPA2-PSK surface to legacy
      clients.
  - name: KRACK key reinstallation
    cve:
      - CVE-2017-13077
    refs:
      - vanhoef2017krack
      - cve-2017-13077
    impact: >-
      Forced nonce reuse breaking WPA/WPA2 packet confidentiality (decrypt, and in
      some configurations replay/forge) without recovering the PSK.
    preconditions: An unpatched client (or AP) that reinstalls an already-installed key during the handshake.
    summary: >-
      Replaying handshake message 3 forces the victim to reinstall the PTK,
      resetting the nonce/replay counter and enabling decryption of traffic —
      independent of passphrase strength.
  - name: Kr00k
    cve:
      - CVE-2019-15126
    refs:
      - cve-2019-15126
    impact: Decryption of frames buffered across a disassociation, encrypted under an all-zero key.
    preconditions: A vulnerable Broadcom/Cypress WLAN chip on either endpoint.
    summary: >-
      A state-transition flaw causes affected chips to encrypt buffered frames
      after disassociation with an all-zero session key, letting an attacker
      decrypt them.
references:
  - key: steube2018pmkid
    title: 'New attack on WPA/WPA2 using PMKID'
    authors: J. Steube (atom)
    venue: hashcat forum
    year: 2018
    url: 'https://hashcat.net/forum/thread-7717.html'
    type: blog
  - key: viehbock2011wps
    title: 'Brute forcing Wi-Fi Protected Setup: When poor design meets poor implementation'
    authors: S. Viehböck
    year: 2011
    url: 'https://www.cs.cmu.edu/~rdriley/330/papers/viehboeck_wps.pdf'
    type: paper
  - key: bongard2014pixie
    title: 'Offline bruteforce attack on Wi-Fi Protected Setup (Pixie Dust)'
    authors: D. Bongard
    venue: hack.lu 2014
    year: 2014
    url: 'http://archive.hack.lu/2014/Hacklu2014_offline_bruteforce_attack_on_wps.pdf'
    type: talk
  - key: vanhoef2017krack
    title: 'Key Reinstallation Attacks: Forcing Nonce Reuse in WPA2'
    authors: M. Vanhoef, F. Piessens
    venue: ACM CCS 2017
    year: 2017
    url: 'https://papers.mathyvanhoef.com/ccs2017.pdf'
    type: paper
  - key: cve-2017-13077
    title: 'CVE-2017-13077: WPA2 4-way-handshake PTK-TK reinstallation (KRACK)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-13077'
    type: cve
  - key: vanhoef2020dragonblood
    title: 'Dragonblood: Analyzing the Dragonfly Handshake of WPA3 and EAP-pwd'
    authors: M. Vanhoef, E. Ronen
    venue: IEEE S&P 2020
    year: 2020
    url: 'https://wpa3.mathyvanhoef.com/'
    type: paper
  - key: cve-2019-9494
    title: 'CVE-2019-9494: SAE side-channel in hostapd/wpa_supplicant (Dragonblood)'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-9494'
    type: cve
  - key: cve-2019-15126
    title: 'CVE-2019-15126: Kr00k — all-zero-key encryption of buffered frames'
    venue: NVD
    year: 2019
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-15126'
    type: cve
tools:
  - hcxdumptool
  - hcxtools
  - hashcat
  - aircrack-ng
  - reaver
resources:
  - RFSAM-RES-11
  - RFSAM-RES-12
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

WPA2-Personal authenticates with a Pre-Shared Key: both sides derive a Pairwise Master Key (PMK) from the passphrase and run an EAPOL **4-way handshake** to prove possession and derive session keys. Anyone who captures that handshake holds enough PMK-derived material to test passphrase guesses offline — so WPA2-PSK confidentiality reduces to passphrase strength, not to anything that happens on the air.

Since 2018 the auditor often does not even need a client. The AP's first EAPOL frame can carry an **RSN PMKID**, computed as `HMAC-SHA1-128(PMK, "PMK Name" | MAC_AP | MAC_STA)` [steube2018pmkid]. Because the PMKID is a function of the PMK and the two MAC addresses, capturing it from the AP alone — no associated station, no deauthentication noise — yields the same offline-crackable target as a full handshake [steube2018pmkid]. Both paths converge on hashcat's unified WPA hash mode 22000 (the PMKID attack originally landed as mode 16800) [steube2018pmkid].

**WPS** is a parallel weakness that sidesteps the passphrase entirely. The 8-digit PIN is validated in two halves with the last digit a checksum, and the AP's response reveals which half is wrong — collapsing brute force from 10^8 to roughly 11,000 attempts where the AP applies no lockout [viehbock2011wps]. Worse, the **Pixie-Dust** attack recovers the PIN *offline* from a single exchange on chipsets whose Registrar generates the E-S1/E-S2 nonces with weak or zero entropy (Ralink nonces fixed at zero; weak Broadcom PRNG) [bongard2014pixie]. A recovered PIN yields the PSK directly, regardless of passphrase strength.

**WPA3-SAE** is designed to resist offline dictionary attacks — the Dragonfly handshake never exposes a passphrase-derived hash to a passive observer. **Dragonblood** showed this is not the whole story: SAE implementations in hostapd/wpa_supplicant leaked password information through timing and cache side-channels, and the protocol permits group-downgrade and transition-mode downgrade [vanhoef2020dragonblood][cve-2019-9494]. A WPA3 network running **transitional (mixed) mode** still advertises WPA2-PSK to legacy clients, so the WPA2 capture-and-crack surface above remains fully available. This control's WPA3 step is therefore mainly a check for transitional mode and management-frame protection, not an offline crack of SAE itself.

Two confidentiality breaks recover *plaintext* without recovering the PSK, and are worth noting when scoping: **KRACK** forces reinstallation of the PTK during the handshake, resetting the nonce/replay counter and enabling decryption on unpatched endpoints [vanhoef2017krack][cve-2017-13077]; **Kr00k** causes affected Broadcom/Cypress chips to encrypt frames buffered across a disassociation with an all-zero key [cve-2019-15126]. Both are implementation/patch-state findings rather than passphrase-strength findings.

This corpus is representative, not exhaustive — Wi-Fi attack surface and patch state move quickly, so check current vendor advisories for the specific chipset and firmware.

## Procedure

> All capture, deauth, WPS and crack steps below are active or recover secret key material. Run them only against networks you own or are explicitly authorised to test, ideally in an RF-isolated setup with test credentials.

1. **Put the adapter in monitor mode and survey the target** (RFSAM-RES-11). Identify the BSSID, channel, security mode (RSN/WPA IE) and whether WPS is enabled.
   ```bash
   sudo airmon-ng start wlan0
   sudo airodump-ng --wps wlan0mon
   ```
   Read off the target's `BSSID`, `CH`, `ENC`/`CIPHER`/`AUTH` (PSK vs SAE) and the WPS column. Note any associated `STATION`s.

2. **Attempt a clientless PMKID capture from the AP** (RFSAM-RES-12). This needs no client and no deauth.
   ```bash
   sudo hcxdumptool -i wlan0mon -w pmkid.pcapng --rds=1
   ```
   Let it run while it associates with the target. hcxdumptool reports captured PMKIDs/EAPOL messages in its status output; stop with Ctrl-C once a PMKID for the target BSSID appears.

3. **If no PMKID is offered, capture the 4-way handshake** from an associating client. Where PMF (802.11w) is absent and testing is authorised, a single targeted deauth forces a re-handshake; do not deauth where PMF is enforced (the frame is rejected).
   ```bash
   sudo airodump-ng -c <CH> --bssid <BSSID> -w hs wlan0mon
   # in a second terminal, only if authorised and PMF absent:
   sudo aireplay-ng -0 1 -a <BSSID> -c <STATION_MAC> wlan0mon
   ```
   airodump-ng prints `WPA handshake: <BSSID>` in the top-right once all four EAPOL messages are captured into `hs-01.cap`.

4. **Convert the capture to the hashcat hash format.**
   ```bash
   hcxpcapngtool -o target.hc22000 pmkid.pcapng     # or hs-01.cap
   ```
   It prints a summary of how many PMKID and EAPOL hashes were written. A non-empty `target.hc22000` is the crackable artefact.

5. **Run the offline crack to assess passphrase strength** (mode 22000 covers both PMKID and handshake hashes).
   ```bash
   hashcat -m 22000 target.hc22000 wordlist.txt
   # or aircrack-ng -w wordlist.txt -b <BSSID> hs-01.cap   (CPU, handshake only)
   ```
   A `Status: Cracked` line with the recovered passphrase means the PSK is weak. Exhausting a reasonable wordlist/mask without a hit is itself a finding — the passphrase resisted the tested effort.

6. **Where WPS is enabled, test the PIN paths.** Pixie-Dust first (offline, near-instant on vulnerable chipsets), then a rate-limited online PIN attempt only if Pixie-Dust fails and the AP has no lockout.
   ```bash
   sudo reaver -i wlan0mon -b <BSSID> -c <CH> -K 1 -vv     # -K 1 = Pixie-Dust
   ```
   On success reaver prints the recovered `WPS PIN` and the `WPA PSK`. A returned PSK here means the network is compromised regardless of passphrase length.

7. **For a network advertising WPA3, do not attempt an offline SAE crack — assess exposure instead.** Confirm whether it runs transitional (mixed WPA2/WPA3) mode and whether PMF is required, since transitional mode re-exposes the WPA2 paths above.
   ```bash
   sudo airodump-ng --bssid <BSSID> -c <CH> wlan0mon
   ```
   In the `AUTH` field, `SAE` alone with `MFP required` indicates WPA3-only; `PSK SAE` (or a parallel WPA2 BSSID/IE) indicates transitional mode — record it as downgrade exposure rather than a crackable finding.

## Field case

Illustrative walkthrough — substitute the values you capture. This is a representative example of the two key-recovery paths against an authorised WPA2-PSK test AP (a consumer router in an RF-isolated lab, test passphrase, no production clients), not a logged engagement; treat the steps as the expected shape of the result and fill in the placeholders with your own measurements.

A clientless PMKID grab in step 2 produces a PMKID for the target BSSID shortly after `hcxdumptool` starts — no client need ever associate and no deauth is sent. `hcxpcapngtool -o target.hc22000 pmkid.pcapng` writes a single PMKID hash. Running `hashcat -m 22000 target.hc22000 rockyou.txt` recovers the lab passphrase, confirming the offline path end to end.

Where the same AP has WPS left enabled (the factory default on many consumer models), `reaver -i wlan0mon -b <BSSID> -c <CH> -K 1 -vv` completes the Pixie-Dust attack and returns the WPS PIN and the WPA PSK directly — the passphrase length is irrelevant once the PIN falls.

The numbers below are placeholders for whoever runs this against a real target; do not treat them as measured.

- Time to first PMKID for the target BSSID: [FILL: measured seconds]
- hashcat mode-22000 crack rate on the test GPU: [FILL: measured H/s]
- Pixie-Dust completion time / chipset: [FILL: measured time and AP chipset]

## Remediation

**Developer / vendor.** Ship WPS PIN disabled by default, or remove the external-Registrar PIN method entirely; where it must exist, use a CSPRNG for the E-S1/E-S2 nonces and enforce a hard lockout after a few failed attempts to close the Pixie-Dust and two-half brute-force classes [bongard2014pixie][viehbock2011wps]. Patch SAE implementations against the Dragonblood side-channels (constant-time hash-to-curve; hostapd/wpa_supplicant > 2.7) [vanhoef2020dragonblood][cve-2019-9494], and ship the KRACK and Kr00k fixes in client and AP firmware [vanhoef2017krack][cve-2019-15126].

**Integrator.** Provision a long, high-entropy passphrase (random, not a memorable phrase) so the offline PMKID/handshake crack is computationally infeasible — this is the single most effective control for WPA2-PSK. Disable WPS entirely. Where the threat model warrants it, move sensitive networks to WPA2/WPA3-Enterprise (802.1X/EAP) so there is no shared offline-crackable secret at all.

**Operator.** Deploy WPA3-SAE in **non-transitional** mode with Protected Management Frames (PMF/802.11w) required — this removes the WPA2 downgrade surface and blunts the deauth used to force handshakes. Keep AP and client firmware current against KRACK/Kr00k/FragAttacks-class advisories, and re-survey periodically: treat the tool and CVE corpus above as representative and check current advisories for your specific hardware.
