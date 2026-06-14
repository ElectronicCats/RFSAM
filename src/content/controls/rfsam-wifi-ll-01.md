---
id: RFSAM-WIFI-LL-01
title: Verify management-frame protection and identity exposure
protocol: WIFI
layer: LL
criticality: medium
applicability:
  - 802.11 b/g/n
  - 802.11 ac/ax
deferred: false
objective: >-
  Determine, from a passive monitor-mode capture, whether the network protects
  its 802.11 management frames (802.11w / PMF) and how much device identity the
  beacons, probe requests and association frames leak in the clear — establishing
  exposure to deauthentication DoS, handshake-forcing and evil-twin targeting.
intro: >-
  802.11 management frames (beacons, probe request/response, association and
  deauthentication) are sent in the clear, and unless Management Frame Protection
  (802.11w / PMF) is enforced they are unauthenticated. That exposure lets forged
  deauth frames evict clients at will and lets probe requests leak the networks a
  client remembers. This LL control reads the exposure from a capture; the active
  deauth and evil-twin techniques it scopes are executed under the Wi-Fi Attack
  layer (RFSAM-WIFI-AT-*).
prerequisites:
  hardware:
    - 'A monitor-mode-capable 802.11 adapter (e.g. ALFA AWUS036ACH / RTL8812AU for 2.4/5 GHz; Electronic Cats Minino / ESP32-C6 for 2.4 GHz only)'
  software:
    - 'aircrack-ng (airodump-ng), Kismet or hcxdumptool for capture; Wireshark/tshark for decode'
  signal:
    freq: '2.4 GHz (2.400–2.4835 GHz) · 5 GHz (UNII, ~5.15–5.85 GHz) · 6 GHz (5.925–7.125 GHz, Wi-Fi 6E/7)'
    bandwidth: '20/40/80/160 MHz channels (320 MHz in Wi-Fi 7)'
    modulation: 'OFDM (a/g/n/ac/ax/be) / DSSS (legacy b) — demodulated on the adapter chipset'
  skill: intermediate
attacks:
  - name: Deauthentication / disassociation DoS
    refs:
      - bellardo2003dos
    impact: >-
      Forged deauth/disassoc frames evict one or all clients on demand — a denial
      of service, and the lever that forces a fresh 4-way handshake for offline
      cracking under RFSAM-WIFI-CR-01.
    preconditions: Management Frame Protection (802.11w / PMF) absent or not enforced on the BSS.
    summary: >-
      Because deauth/disassoc frames are unauthenticated without 802.11w, a single
      forged frame spoofing the AP or client MAC drops the targeted station.
  - name: Probe-request identity / PNL leakage
    refs:
      - cunche2012linking
      - mcdougall2022probing
    impact: >-
      Directed probe requests disclose the SSIDs a device has joined before (its
      Preferred Network List), enabling device tracking, social-link inference and
      evil-twin targeting; users sometimes type credentials into SSID fields that
      then leak verbatim.
    preconditions: Client performs active scanning with directed (non-broadcast) probe requests; passive capture within range.
    summary: >-
      Probe requests broadcast remembered SSIDs in the clear, fingerprinting and
      tracking the device and its owner.
  - name: MAC-randomization bypass via probe fingerprinting
    refs:
      - vanhoef2016randomization
    impact: >-
      Tracks and re-identifies a device across sessions despite randomized MAC
      addresses, undermining the identity protection clients rely on.
    preconditions: Client uses MAC randomization but emits fingerprintable probe-request information elements / sequence numbers.
    summary: >-
      Information-element fingerprints, scrambler seeds and sequence numbers in
      probe requests let devices be tracked even when the MAC address is randomized.
references:
  - key: ieee80211w2009
    title: 'IEEE 802.11w-2009 — Amendment 4: Protected Management Frames'
    authors: IEEE
    venue: IEEE Standards Association
    year: 2009
    url: 'https://standards.ieee.org/ieee/802.11w/3736/'
    type: standard
  - key: bellardo2003dos
    title: '802.11 Denial-of-Service Attacks: Real Vulnerabilities and Practical Solutions'
    authors: 'J. Bellardo, S. Savage'
    venue: 12th USENIX Security Symposium
    year: 2003
    url: 'https://digitalcommons.calpoly.edu/csse_fac/194/'
    type: paper
  - key: cunche2012linking
    title: 'I know who you will meet this evening! Linking wireless devices using Wi-Fi probe requests'
    authors: 'M. Cunche, M. A. Kaafar, R. Boreli'
    venue: 'IEEE WoWMoM 2012'
    year: 2012
    url: 'https://doi.org/10.1109/WoWMoM.2012.6263700'
    type: paper
  - key: vanhoef2016randomization
    title: 'Why MAC Address Randomization is not Enough: An Analysis of Wi-Fi Network Discovery Mechanisms'
    authors: 'M. Vanhoef, C. Matte, M. Cunche, L. S. Cardoso, F. Piessens'
    venue: ACM AsiaCCS 2016
    year: 2016
    url: 'https://papers.mathyvanhoef.com/asiaccs2016.pdf'
    type: paper
  - key: mcdougall2022probing
    title: 'Probing for Passwords — Privacy Implications of SSIDs in Probe Requests'
    authors: 'J. Ansohn McDougall, C. Burkert, D. Demmler, M. Schwarz, V. Hubbe, H. Federrath'
    venue: 'ACNS 2022 (arXiv:2206.03745)'
    year: 2022
    url: 'https://arxiv.org/abs/2206.03745'
    type: paper
tools:
  - aircrack-ng
  - kismet
  - hcxdumptool
  - wireshark
  - alfa-awus036ach
  - minino
bsam: []
resources:
  - RFSAM-RES-11
  - RFSAM-RES-12
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

802.11 separates management, control and data frames. Beacons, probe request/response, and association/authentication frames are sent in the clear, and — critically — by default they carry no cryptographic authentication, so a receiver cannot tell a genuine frame from a forged one. The 802.11w-2009 amendment ("Protected Management Frames", PMF) was published specifically to close this: it adds integrity, origin authentication and replay protection to a subset of management frames, principally deauthentication, disassociation and robust action frames [ieee80211w2009]. By design the amendment cannot protect beacons or probe request/response frames, since those are exchanged before any security association exists [ieee80211w2009]. So even with PMF fully enforced, the *discovery* frames still leak; PMF only stops the *forged-deauth* class.

Where PMF is absent or not enforced, the canonical consequence is the deauthentication/disassociation denial-of-service: an attacker spoofs the AP or client MAC and transmits a single forged deauth frame to evict a station, repeatedly to deny service, or tactically to force a client to reconnect and emit a fresh 4-way handshake. Bellardo and Savage documented this management-frame DoS class in 2003 and noted that, unlike the confidentiality flaws of the era, these availability attacks need no key and target the protocol's own management plane [bellardo2003dos]. The forced-reconnect variant is the lever that feeds the handshake-capture path assessed under RFSAM-WIFI-CR-01.

The second exposure is identity. A client doing *active* scanning broadcasts directed probe requests naming SSIDs it has joined before — its Preferred Network List. Cunche, Kaafar and Boreli showed in 2012 that these lists fingerprint a device and even let social links between owners be inferred from overlapping network histories [cunche2012linking]. MAC-address randomization was meant to blunt this, but Vanhoef et al. demonstrated in 2016 that probe-request information elements, scrambler seeds and sequence numbers fingerprint and track devices despite randomized MACs, correctly following a sizable fraction of devices for tens of minutes [vanhoef2016randomization]. More recently, McDougall et al. found users frequently type sensitive strings — including passwords and email addresses — into SSID fields, which then leak verbatim in probe requests [mcdougall2022probing]. Together these make management-frame capture both a tracking surface and the reconnaissance that seeds evil-twin (AP-impersonation) targeting, executed under the Wi-Fi Attack layer.

## Procedure

All capture below is **passive** and non-transmitting. Steps 1–4 observe only. The active deauth check in step 5 transmits and must be run **only on equipment you own or are explicitly authorised to test**, ideally in an RF-shielded enclosure; classic deauth is a real denial of service against bystanders. The active execution properly belongs to the Wi-Fi Attack layer — here it is a one-shot confirmation of the exposure read in step 4.

1. Put the adapter into monitor mode and park it on the target's channel (RFSAM-RES-11):
   ```bash
   sudo airmon-ng start wlan0
   sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF wlan0mon
   ```
   The live table lists the BSSID, channel, encryption and any associated client (STATION) MACs.

2. Capture management frames to a PCAP for offline decode:
   ```bash
   sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w wifi-ll wlan0mon
   ```
   This writes `wifi-ll-01.cap` containing beacons, probes and any handshake.

3. Read whether the BSS advertises Protected Management Frames in its RSN Information Element. In Wireshark/tshark, the MFP Required / MFP Capable bits live in the RSN Capabilities field of the beacon:
   ```bash
   tshark -r wifi-ll-01.cap -Y "wlan.fc.type_subtype == 0x08" \
     -T fields -e wlan.ssid \
     -e wlan.rsn.capabilities.mfpr -e wlan.rsn.capabilities.mfpc
   ```
   `mfpr=1` (MFP Required) means PMF is enforced — deauth DoS is blocked. `mfpc=1, mfpr=0` means capable but optional. Both `0` (or no RSN IE at all, i.e. Open/WEP) means management frames are unprotected.

4. Inventory the identity leakage — broadcast SSIDs and the probe-request history of nearby clients (their PNLs):
   ```bash
   tshark -r wifi-ll-01.cap -Y "wlan.fc.type_subtype == 0x04 && wlan.ssid != \"\"" \
     -T fields -e wlan.sa -e wlan.ssid | sort -u
   ```
   Each line is a client MAC and an SSID it is actively seeking — the data the tracking and evil-twin work in [cunche2012linking] and [vanhoef2016randomization] consumes. Note any SSID strings that look like credentials [mcdougall2022probing].

5. **(Authorised scope only)** If step 3 showed PMF absent, confirm deauth susceptibility against your own test client with a single, bounded burst, then stop:
   ```bash
   sudo aireplay-ng --deauth 1 -a AA:BB:CC:DD:EE:FF -c 11:22:33:44:55:66 wlan0mon
   ```
   `--deauth 1` sends one round (not a flood). The test client disassociating confirms the exposure; airodump-ng on the same channel should then show the renewed association (and, if a client reconnects, an EAPOL handshake — the input to RFSAM-WIFI-CR-01). Against a PMF-enforced BSS the client stays connected.

## Field case

Illustrative walkthrough — not a measured engagement; substitute the values you capture. Every unmeasured datum is marked `[FILL: …]` and must not be cited as a real finding.

A representative walk-through against a lab AP on channel 6 with an ALFA AWUS036ACH:

- Step 3 on a consumer WPA2-PSK AP typically returns `mfpc=1, mfpr=0` — PMF capable but optional — so an associated client remains deauth-susceptible. Measured value for the target AP: `[FILL: mfpr/mfpc bits read from the beacon]`.
- Step 4 over a `[FILL: N]`-minute capture in a `[FILL: location type, e.g. office lobby]` inventoried `[FILL: count]` distinct client MACs and `[FILL: count]` distinct probed SSIDs, of which `[FILL: any SSID strings resembling credentials/email, or "none observed"]`.
- Step 5, on the operator's own test laptop, a single `aireplay-ng --deauth 1` round dropped the client and airodump-ng captured the renewed EAPOL handshake within `[FILL: seconds]`.

An Electronic Cats Minino (ESP32-C6) reproduces steps 1–4 standalone on 2.4 GHz, writing the capture to microSD and logging the survey geographically over its onboard GPS for the wardriving variant — useful where a laptop is impractical, with the caveat that it sees only 2.4 GHz management/handshake frames, not 5/6 GHz traffic. A WiFi Pineapple consumes the same step-4 PNL inventory to seed an evil-twin clone, but that is an Attack-layer action outside this control's scope and must be separately authorised.

## Remediation

**Developer (client/STA firmware and OS):** Implement MAC-address randomization *and* minimize probe-request fingerprintability — randomize sequence numbers and avoid distinctive information-element ordering, since randomized MACs alone do not prevent tracking [vanhoef2016randomization]. Prefer passive scanning (listen for beacons) over directed active probing so the Preferred Network List is not broadcast [cunche2012linking]; never echo user-entered SSID strings that could carry secrets [mcdougall2022probing].

**Integrator (AP / network design):** Enable 802.11w with **MFP Required** (`mfpr=1`), not merely capable, on every BSS — this authenticates deauth/disassoc frames and defeats the forged-deauth DoS and handshake-forcing class [ieee80211w2009] [bellardo2003dos]. PMF is mandatory under WPA3 and on 6 GHz; enforce it on WPA2 too. Note that PMF does not protect beacons or probe frames, so identity leakage must be addressed at the client [ieee80211w2009].

**Operator (deployment/policy):** Audit beacons for `mfpr` enforcement across the estate; treat any PMF-optional BSS as deauth-exposed. On managed clients, disable auto-join for sensitive SSIDs and clear stale saved networks to shrink the leaked PNL. Avoid hidden SSIDs as a security measure — they force clients to actively probe the hidden name, worsening the leakage this control measures rather than reducing it.
