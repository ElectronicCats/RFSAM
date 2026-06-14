// Per-technology toolchain: for each protocol, the descent (layer by layer).
// Uniform model — each layer is a list of capabilities, each with a PRIMARY tool
// (the thing you choose) plus what it depends on:
//   { tool, deps?:[slugs], role?, why?, caveat?, needs? }
// The primary `tool` is the graph bubble (coloured by its own type: hardware /
// software / project). `deps` are the tools it pairs with — for a software tool
// that's the hardware it runs on; for a hardware tool that's the software it runs.
// `needs` is a free-text dependency (e.g. "a host BLE adapter", "a pairing PCAP").
// All `tool`/`deps` values are slugs in the tools collection.
//
// layer shape: { note?, tools?: [{ tool, deps?, role?, why?, caveat?, needs? }] }
// status: 'complete' = curated; 'planned' = scaffold, toolchain to be filled.

// Per-protocol toolchains live in ./toolchains/<proto>.js (built by sub-agents,
// merged here). Their tool catalogues live in ./protocol-tools/<proto>.json,
// folded into the tools collection by scripts/seed-tools.mjs.
import rfid from './toolchains/rfid.js';
import lte from './toolchains/lte.js';
import lora from './toolchains/lora.js';
import zigbee from './toolchains/zigbee.js';
import gsm from './toolchains/gsm.js';
import gnss from './toolchains/gnss.js';
import thread from './toolchains/thread.js';
import subg from './toolchains/subg.js';
import zwave from './toolchains/zwave.js';
import adsb from './toolchains/adsb.js';
import nr5g from './toolchains/nr5g.js';
import uwb from './toolchains/uwb.js';
import btclassic from './toolchains/btclassic.js';

export const toolchains = {
  BLE: {
    status: 'complete',
    facts: [
      { k: 'Band', v: '2.402–2.480 GHz (2.4 GHz ISM)' },
      { k: 'Channels', v: '40 × 2 MHz — 3 advertising (37/38/39) + 37 data; a connection hops every event' },
      { k: 'Modulation', v: 'GFSK · PHYs: LE 1M (1 Mbps), LE 2M (BLE 5), LE Coded (long range, BLE 5)' },
      { k: 'Range', v: '~10 m typical indoors; up to ~100 m+ with BLE 5 Coded PHY or higher TX power' },
      { k: 'Versions', v: '4.0 (2010) · 4.2 LE Secure Connections (2014) · 5.0 2M/Coded (2016) · 5.1–5.4' },
    ],
    reference: {
      name: 'BSAM (Tarlogic)',
      url: 'https://www.tarlogic.com/bsam/',
      note: 'RFSAM owns the spectrum and signal/PHY floors for BLE; at the link layer and above it defers to Tarlogic’s BSAM and adds only the RF-capture prerequisite. The BLE controls cite the specific BSAM controls they hand off to.',
    },
    layers: {
      IG: {
        note: 'Identify the device and its stack before any RF work — no capture yet. RFSAM defers the formal SoC/host-stack vulnerability check to the BSAM Information-Gathering controls.',
        lookFor: [
          'Chipset / SoC and host stack (FCC ID, teardown, advertising fingerprint) — cross-reference known Bluetooth CVEs (KNOB, SweynTooth, BLESA…).',
          'BLE version it speaks (4.x vs 5.x): sets which PHYs (1M / 2M / Coded) and security features are in play.',
          'Advertising data: device name, advertised service UUIDs, manufacturer-specific data.',
          'Address type: public vs random, and whether it rotates a Resolvable Private Address (RPA) or exposes a fixed, trackable one.',
          'Pairing / security mode: Just Works vs Passkey vs OOB, and LE Legacy vs LE Secure Connections.',
          'GATT services and characteristics reachable without authentication.',
        ],
      },
      SP: {
        note: 'How much of the band can you see at once? BLE spreads 40 channels over 80 MHz (2.402–2.480 GHz) and hops fast, so the radio is a visibility trade-off: a HackRF shows ~20 MHz — a slice of the band; a bladeRF in its 122.88 MHz oversampling mode shows the full 80 MHz in one pass; or camp a single channel and pick up the packets that land on it as the hopping connection passes through — cheaper and simpler, but you miss whatever is on the other channels. RTL-SDR is out: it stops near 1.766 GHz, below the 2.4 GHz band.',
        tools: [
          { tool: 'gqrx', role: 'Spectrum / waterfall view', why: 'See the live spectrum and pick channels — ~20 MHz at a time on a HackRF, the full 80 MHz on a bladeRF (oversampling).', deps: ['hackrf-one', 'bladerf-2-micro'] },
          { tool: 'esp32-marauder', role: 'Standalone BLE scan / wardrive', why: 'The ESP32 Marauder handheld scans and wardrives BLE devices and detects AirTags from a battery board — a no-laptop survey of advertising-channel devices in range.', caveat: 'Sees advertising/connectable devices on the advertising channels only — not an all-channel SDR view.', deps: ['esp32-s3-devkit', 'cyd', 'm5-cardputer'] },
          { tool: 'minino', role: 'BLE ADV scanner + AirTag detection', why: 'The Electronic Cats Minino (ESP32-C6) has a native BLE suite: an advertising scanner and tracker / AirTag detection from the pocket device — the EC standalone BLE survey.', caveat: '2.4 GHz advertising-channel scan; field recon, not a PCAP-grade sniffer.', deps: [] },
          { tool: 'esp32-airtag-scanner', role: 'AirTag / Find My survey', why: 'Dedicated ESP32 firmware that scans for Apple AirTag / Find My addresses and payloads with no phone — to detect trackers in the environment.', caveat: 'Passive scan only — no spoofing; payload formats may have drifted since 2024.', deps: ['esp32-devkit', 'esp32-s3-devkit'] },
        ],
      },
      PHY: {
        note: 'No standalone BLE demodulator. Every BLE capture tool demodulates (PHY) and frames (LL) in one step, so they live together at the Capture step. The SDR path channelises the raw 80 MHz band with ice9.',
      },
      // Capture is SOFTWARE-LED: you pick the sniffer/technique; the hardware is what it needs.
      // Hardware → sniffer software → Wireshark (the shared decoder).
      LL: {
        note: 'Capture and decode BLE frames. Pick a sniffer technique; each runs on its radio and exports a PCAP you dissect in Wireshark. Dedicated sniffers are simplest; the SDR path (ice9) trades setup for wider bandwidth and the ability to grab already-established connections.',
        decoder: 'wireshark',
        tools: [
          { tool: 'sniffle', role: 'Primary sniffer', why: 'Modern BT5/4.x capture with extended advertising and connection following — the default choice today. Runs on any CC1352 board.', deps: ['catsniffer'] },
          { tool: 'ice9-bluetooth-sniffer', role: 'SDR capture', why: 'All-channel capture that can also grab already-established connections. Runs on an SDR — pick it by how much of the 80 MHz band you need at once (bandwidth shown on each radio).', caveat: 'Needs CPU/GPU for channelisation.', deps: ['hackrf-one', 'bladerf-2-micro', 'usrp-b210', 'signalsdr-pro'] },
          { tool: 'nrf-sniffer', role: 'Vendor sniffer', why: 'Easiest first capture, with a turnkey Wireshark plugin.', caveat: 'Follows a single connection; less suited to adversarial work.', deps: ['nrf52840-dongle'] },
          { tool: 'ubertooth-tools', role: 'Budget sniffer', why: 'Drives an Ubertooth One to follow connections on a ~$120 radio with no SDR.', caveat: 'Pre-BT5; weaker on long-lived links than CC1352 sniffers.', deps: ['ubertooth-one'] },
          { tool: 'whad', role: 'Multi-protocol sniffer', why: 'WHAD turns an nRF52840 dongle (its Butterfly firmware), an Ubertooth, or a host HCI adapter into a BLE sniffer driven from one Python framework with PCAP/Scapy output — the same toolchain you reuse for Zigbee, 802.15.4 and ESB. One workflow across protocols.', deps: ['nrf52840-dongle', 'ubertooth-one', 'usb-bt-dongle'] },
          { tool: 'catnip', role: 'CatSniffer BLE capture (EC host)', why: 'Electronic Cats’ CatSniffer host tool runs the Sniffle firmware on the CatSniffer with native Wireshark extcap, scans for Apple Find My / AirTag devices, and on Linux presents the CatSniffer as a virtual HCI (hciX) adapter for host BLE tools — the integrated EC workflow on one board.', deps: ['catsniffer'] },
          { tool: 'ghost-esp', role: 'BLE → Wireshark advertising capture', why: 'Ghost ESP logs BLE advertising-channel frames from an ESP32 straight to a Wireshark-readable capture — the cheap pocket option when a dedicated CC1352/SDR sniffer is overkill.', caveat: 'Advertising-channel capture only; for connection-following / all-channel PCAP use the dedicated sniffers above.', deps: ['esp32-devkit', 'cyd', 'm5-cardputer'] },
        ],
      },
      CR: {
        note: 'Assess pairing and decrypt where the pairing was weak. No live radio of its own — it consumes a capture from the Capture step.',
        tools: [
          { tool: 'crackle', role: 'Pairing crack / decrypt', why: 'Brute-forces the LE Legacy TK from a captured pairing event and decrypts the session.', caveat: 'No effect on LE Secure Connections (ECDH).', deps: ['wireshark'], needs: 'A PCAP of the pairing exchange: capture it at the Capture step (Sniffle / ice9 / nRF Sniffer / Ubertooth), save it from Wireshark, then feed that file to crackle.' },
        ],
      },
      // Attack is SOFTWARE-LED: you pick the technique; it names the radio it needs.
      AT: {
        note: 'Actively take over or inject. Pick the technique; each names the dedicated radio it runs on. Recon/enumeration runs on a plain host adapter.',
        tools: [
          { tool: 'btlejack', role: 'Jam & hijack', why: 'Follow, jam and hijack a live connection. Runs on ~$15 hardware.', deps: ['bbc-microbit'] },
          { tool: 'injectable-firmware', role: 'Inject / MITM', why: 'Inject link-layer frames into an established connection (the InjectaBLE strategy).', deps: ['nrf52840-dongle'] },
          { tool: 'bettercap', role: 'Recon & enumeration', why: 'Discover devices and enumerate GATT before/after takeover.', deps: ['usb-bt-dongle', 'catsniffer'], needs: 'A host Bluetooth LE adapter over HCI (Linux/BlueZ for the BLE module).' },
          { tool: 'esp32-marauder', role: 'BLE advertising spam / AirTag spoof', why: 'The Marauder BLE suite floods advertising spam (Apple/Sour Apple, Samsung, Swift Pair pairing popups) and spoofs AirTags from the handheld — the umbrella ESP32 BLE attack firmware.', caveat: 'Active transmit (pairing-popup spam / tracker spoofing) — authorised testing only; disruptive to all nearby devices.', deps: ['esp32-s3-devkit', 'cyd', 'm5-cardputer'] },
          { tool: 'bruce', role: 'Pairing-popup spam + Bad BLE (HID)', why: 'Bruce spams pairing popups across Apple/Android/Samsung/Windows and runs Bad BLE — HID keystroke injection over a link the target bonds to it.', caveat: 'Active transmit / HID injection — authorised testing only; Bad BLE needs the target to pair with the ESP32.', deps: ['m5-cardputer', 'cyd', 'lilygo-t-embed-cc1101', 'esp32-devkit'] },
          { tool: 'minino', role: 'BLE notification spam', why: 'The Minino (ESP32-C6) has a native BLE SPAM mode that emulates BLE devices to flood a nearby central with notification and pairing prompts — the EC pocket BLE-spam tool.', caveat: 'Active transmit — authorised testing only; disruptive to nearby devices.', deps: [] },
          { tool: 'esp32-sour-apple', role: 'iOS pairing-spam crash/DoS', why: 'A focused PoC that floods BLE pairing-request adverts to freeze or crash nearby iOS devices — more aggressive than generic popup spam.', caveat: 'Genuinely disruptive (freezes/crashes iPhones) — authorised testing only, on hardware you own. ESP32-S3 / ESP-WROOM-32; not ESP8266.', deps: ['esp32-devkit', 'esp32-s3-devkit'] },
        ],
      },
      AP: {
        note: 'Interact with what the device trusts above the link, over the host’s own HCI controller.',
        tools: [
          { tool: 'bleak', role: 'GATT interaction', why: 'Script reads/writes/subscriptions and replay learned commands, cross-platform.', deps: ['usb-bt-dongle', 'catsniffer'], needs: 'A host BLE controller over HCI — a standard USB Bluetooth adapter, or a CatSniffer presented as a virtual HCI on Linux via the catnip tool.' },
          { tool: 'bettercap', role: 'GATT enumeration', why: 'Enumerate services and characteristics interactively.', deps: ['usb-bt-dongle', 'catsniffer'], needs: 'A host Bluetooth LE adapter over HCI (Linux/BlueZ for the BLE module).' },
          { tool: 'bruce', role: 'GATT / HID interaction (Bad BLE)', why: 'Beyond spam, Bruce acts above the link — Bad BLE drives HID and media commands to a host that has bonded with the ESP32, exercising what the device trusts.', caveat: 'Requires the target to pair/bond with the ESP32 first; authorised testing only.', deps: ['m5-cardputer', 'cyd', 'esp32-devkit'] },
          { tool: 'minino', role: 'BLE HID', why: 'The Minino native BLE HID component presents the EC board as a Bluetooth input device to a host — the EC path for testing what a host trusts from a paired peripheral.', caveat: 'Authorised testing only; the host must pair with the device.', deps: [] },
        ],
      },
    },
  },

  WIFI: {
    status: 'complete',
    facts: [
      { k: 'Band', v: '2.4 GHz (2.400–2.4835 GHz) · 5 GHz (UNII bands, ~5.15–5.85 GHz) · 6 GHz (5.925–7.125 GHz, Wi-Fi 6E/7)' },
      { k: 'Channels', v: '2.4 GHz: 1–14 (1–11 in the US; only 1/6/11 non-overlapping) · 5 GHz: ~25, many gated by DFS · 6 GHz: up to 59 × 20 MHz · widths 20/40/80/160 (320 in Wi-Fi 7)' },
      { k: 'Standards', v: '802.11 b/g/n (2.4) · a/n/ac (5) · ax = Wi-Fi 6 (2.4/5) & 6E (adds 6 GHz) · be = Wi-Fi 7' },
      { k: 'Security', v: 'Open · WEP (broken) · WPA/WPA2-PSK (handshake, PMKID) · WPA2/WPA3-Enterprise (802.1X/EAP) · WPA3-SAE · OWE. WPS PIN is a common weak point; WPA3 mandatory on 6 GHz.' },
      { k: 'Range', v: '~10–50 m indoors; 100 m+ outdoors at 2.4 GHz; 5/6 GHz trade range for throughput. High-gain / amplified adapters extend reach.' },
    ],
    reference: null,
    layers: {
      IG: {
        note: 'Fingerprint the access point or client before any RF work — no capture yet. The goal is to know what you are dealing with: which radio chipset and firmware it runs, which Wi-Fi generation and bands it speaks, how it secures itself, and whether legacy weak points (WEP, WPS) are switched on. Most of this is readable passively from the beacons the AP already shouts, plus the FCC ID on the label.',
        lookFor: [
          'Chipset / SoC and firmware (FCC ID, teardown, OUI of the BSSID) — cross-reference known Wi-Fi CVEs (KRACK on WPA2, FragAttacks, Dragonblood on WPA3-SAE, vendor WPS/firmware bugs).',
          'Standard and bands it speaks (802.11 b/g/n/ac/ax/be; 2.4 vs 5 vs 6 GHz): sets which channels to survey and which radios you need.',
          'SSID and BSSID: the network name and the AP’s MAC — plus whether the SSID is hidden and whether several BSSIDs share one physical AP.',
          'Security mode from the beacon’s RSN/WPA information element: Open / WEP / WPA2-PSK / WPA3-SAE / OWE / WPA-Enterprise (802.1X), and the cipher (TKIP vs CCMP/GCMP).',
          'WPS state: is WPS (especially the 8-digit PIN method) enabled? It is the single most common shortcut into an otherwise strong WPA2 network.',
          'Clients already associated: their MACs, signal strength and probe requests (which reveal networks those devices have joined before).',
        ],
      },
      SP: {
        note: 'How much of the air can you see at once, and where is the target? Wi-Fi spans three bands and dozens of channels, and a radio only listens to one channel at a time — so a survey means hopping channels and logging every AP and client it hears. A standard monitor-mode adapter covers 2.4 and 5 GHz; 6 GHz (Wi-Fi 6E/7) needs a 6 GHz-capable radio. This step is the map: enumerate the networks, their channels, security and clients before you commit to a target.',
        tools: [
          { tool: 'kismet', role: 'Survey & wardriving', why: 'The reference passive survey tool: channel-hops across 2.4/5 (and 6 GHz with capable hardware), logs every AP/client/SSID with GPS, and never transmits — ideal for a quiet map of the environment.', caveat: 'Passive only; 6 GHz needs a Wi-Fi 6E-capable adapter.', deps: ['alfa-awus036ach'] },
          { tool: 'aircrack-ng', role: 'Channel survey', why: 'airodump-ng gives a live table of APs and associated clients — BSSID, channel, encryption, signal — the fastest way to lock onto a target and read its security mode.', deps: ['alfa-awus036ach'] },
          { tool: 'minino', role: 'Pocket scanner / wardriving', why: 'Electronic Cats ESP32-C6 multitool: standalone SSID/AP scanning and wardriving with onboard GPS/microSD and an analyzer view, no laptop needed.', caveat: '2.4 GHz only (ESP32-C6 has no 5/6 GHz radio).', deps: [] },
          { tool: 'esp32-marauder', role: 'Pocket survey / GPS wardrive', why: 'The ESP32 Marauder handheld scans APs and stations and wardrives with GPS, logging to SD — a no-laptop 2.4 GHz survey on a $5–15 board (CYD, Cardputer, bare ESP32).', caveat: '2.4 GHz only (ESP32 has no 5/6 GHz radio); a quick survey, not full Kismet coverage.', deps: ['esp32-devkit', 'cyd', 'm5-cardputer', 'flipper-wifi-devboard'] },
          { tool: 'ghost-esp', role: 'AP / station scan', why: 'Ghost ESP scans nearby APs and associated clients from the ESP32 console — an alternative pocket survey firmware (Bruce does the same).', caveat: '2.4 GHz only.', deps: ['esp32-devkit', 'cyd', 'm5-cardputer'] },
        ],
      },
      PHY: {
        note: 'No standalone Wi-Fi demodulator in this kit. The capture tools demodulate the OFDM/DSSS waveform (PHY) and frame the 802.11 packets (LL) together on the adapter’s own chipset, so they live at the Capture step. A wide-band SDR can stare at the spectrum, but decoding live 802.11ac/ax in software is impractical — use a real monitor-mode adapter.',
      },
      LL: {
        note: 'Capture and decode raw 802.11 frames. Put the adapter into monitor mode, park it on the target’s channel, and it pulls beacons, probes, management/control frames and the EAPOL handshake off the air into a PCAP you open in Wireshark. Pick a capture tool — a quick targeted grab (airodump-ng), a logged survey capture (Kismet), or a handshake/PMKID grab (hcxdumptool).',
        decoder: 'wireshark',
        tools: [
          { tool: 'aircrack-ng', role: 'Primary capture', why: 'airodump-ng is the default monitor-mode capture: lock a channel/BSSID and write a PCAP, optionally firing a deauth to force a client to re-handshake. Simplest path to a 4-way handshake.', deps: ['alfa-awus036ach'] },
          { tool: 'hcxdumptool', role: 'Handshake / PMKID capture', why: 'Purpose-built to grab the WPA/WPA2 PMKID straight from the AP — often clientless, no waiting for a client to reconnect — and EAPOL handshakes, written as pcapng for offline cracking.', caveat: 'Aggressive by default; recent versions dropped some active-attack flags — check the docs for your version.', deps: ['alfa-awus036ach'] },
          { tool: 'kismet', role: 'Logged capture', why: 'Captures while it surveys: every frame it hears is logged to pcapng with metadata, so the survey and the capture are one artefact you replay in Wireshark.', deps: ['alfa-awus036ach'] },
          { tool: 'minino', role: 'Pocket sniffer', why: 'Standalone 2.4 GHz Wi-Fi sniffer that writes captures to microSD with Wireshark-compatible output — capture without a host PC.', caveat: '2.4 GHz only; management/handshake frames, not 5/6 GHz traffic.', deps: [] },
          { tool: 'esp32-marauder', role: 'Handshake / PMKID capture', why: 'The Marauder EAPOL/PMKID scan grabs WPA/WPA2 key material straight to an SD-card PCAP from the handheld — capture in the field, crack offline in hashcat.', caveat: '2.4 GHz, WPA/WPA2 only; captures material only. SD card required (v0.11.0+).', deps: ['esp32-devkit', 'cyd', 'm5-cardputer'] },
          { tool: 'esp32-wifi-penetration-tool', role: 'PMKID → HCCAPX (web-driven)', why: 'A bare-ESP32 framework that captures PMKID/handshakes (passive, rogue-AP or forced re-auth), exports PCAP and converts to a hashcat-ready HCCAPX — all from an on-device web UI, no screen needed.', caveat: '2.4 GHz, WPA/WPA2; captures key material only — crack off-device in hashcat.', deps: ['esp32-devkit'] },
        ],
      },
      CR: {
        note: 'Assess the crypto and recover the key where it is weak. None of these have a radio of their own — they consume a capture from the Capture step. WPA/WPA2-PSK falls to an offline attack on the captured handshake or PMKID; WPS PIN falls to an online attack on the AP; WEP is trivially broken. WPA3-SAE and OWE resist offline cracking by design (though Dragonblood-class bugs exist on some implementations).',
        tools: [
          { tool: 'hashcat', role: 'WPA/WPA2 cracker (GPU)', why: 'The fastest offline cracker: mode 22000 handles both 4-way-handshake and PMKID hashes with GPU dictionary, rule and mask attacks.', deps: ['wireshark'], needs: 'A WPA/WPA2 handshake or PMKID captured at the Capture step (airodump-ng or hcxdumptool). Convert the pcapng to a .hc22000 hash with hcxpcapngtool (hcxtools), then feed it to hashcat.' },
          { tool: 'hcxtools', role: 'Capture → hash converter', why: 'hcxpcapngtool turns a captured pcapng into the .hc22000 hash format hashcat (and John) crack — the glue between capture and cracking.', deps: ['wireshark'], needs: 'The pcapng written by hcxdumptool or airodump-ng at the Capture step.' },
          { tool: 'aircrack-ng', role: 'Handshake / WEP cracker', why: 'Cracks WEP outright and runs a CPU dictionary attack against a captured WPA/WPA2 handshake — the all-in-one option when you don’t want a separate GPU step.', deps: ['wireshark'], needs: 'A .cap/.pcap containing the 4-way handshake from the Capture step (airodump-ng), plus a wordlist.' },
          { tool: 'reaver', role: 'WPS PIN attack', why: 'Attacks the WPS registration PIN — including the offline Pixie-Dust attack — to recover the WPA passphrase directly from a vulnerable AP, bypassing the handshake entirely.', deps: ['alfa-awus036ach'], needs: 'Runs live against the AP over an injection-capable adapter (not from a PCAP); only works where WPS is enabled and unpatched.' },
        ],
      },
      AT: {
        note: 'Actively disrupt, take over or impersonate. Pick the technique; each names the injection-capable radio it runs on. Deauthentication frames knock clients off (to force a handshake or as denial-of-service); a rogue AP / evil twin clones the target SSID so clients associate to you. Note WPA3’s Protected Management Frames (PMF / 802.11w) blunt classic deauth — check the target’s PMF setting first.',
        tools: [
          { tool: 'aircrack-ng', role: 'Deauth / disconnect', why: 'aireplay-ng sends targeted or broadcast deauthentication frames to drop clients — to capture a fresh handshake or as a quick DoS.', caveat: 'Blocked by 802.11w/PMF (common on WPA3 and newer WPA2).', deps: ['alfa-awus036ach'] },
          { tool: 'mdk4', role: 'Stress / flood attacks', why: 'Broad 802.11 fuzzing/DoS toolkit: deauth floods, beacon floods (fake SSIDs), authentication floods and more — for resilience testing of an AP.', caveat: 'Noisy and disruptive; PMF mitigates the deauth modes.', deps: ['alfa-awus036ach'] },
          { tool: 'bettercap', role: 'Recon & deauth', why: 'Scriptable framework with a wifi module: enumerate APs/clients, fire deauths and capture handshakes from one console.', deps: ['alfa-awus036ach'] },
          { tool: 'minino', role: 'Pocket deauther / DoS', why: 'Standalone 2.4 GHz deauther and DoS from its console, plus a deauth-detection mode to spot the same attack against you — a field tool with no laptop.', caveat: '2.4 GHz only; deauth blocked by 802.11w/PMF targets.', deps: [] },
          { tool: 'wifi-pineapple', role: 'Rogue AP / evil twin', why: 'Turnkey platform that automates evil-twin, client-capture and recon — clone an SSID and harvest associations without scripting.', deps: [] },
          { tool: 'esp32-marauder', role: 'Deauth / beacon & probe spam', why: 'Fires targeted or broadcast deauth, beacon spam (fake-SSID floods) and probe floods from the handheld — to force a re-handshake or stress an AP, no laptop needed.', caveat: 'Authorised testing only. 2.4 GHz; deauth blocked by 802.11w/PMF (WPA3 and newer WPA2).', deps: ['esp32-devkit', 'cyd', 'm5-cardputer', 'flipper-wifi-devboard'] },
          { tool: 'bruce', role: 'Deauth from handheld', why: 'The Bruce Wi-Fi menu sends deauthentication frames, plus wardriving and EAPOL capture, on M5Stack/LilyGo/CYD hardware — the broad red-team multitool alternative.', caveat: 'Authorised testing only. 2.4 GHz; blocked by PMF.', deps: ['m5-cardputer', 'cyd', 'lilygo-t-embed-cc1101', 'esp32-devkit'] },
          { tool: 'esp32-deauther-ganesh', role: 'Bare-ESP32 deauth', why: 'The minimal ESP32 deauther — the canonical esp_wifi_80211_tx injection path on a plain board with no display, when all you need is the deauth primitive.', caveat: 'Authorised testing only; blocked by PMF. Unmaintained since 2021, no license — confirm it builds on current ESP-IDF.', deps: ['esp32-devkit'] },
        ],
      },
      AP: {
        note: 'Once a client is on your network (or coerced onto a clone of theirs), test what it trusts above the link: the captive portal, the credentials it submits, and the traffic you can now man-in-the-middle. This is where an evil-twin pays off — present a convincing portal, or sit between the client and the upstream and inspect/alter its flows.',
        tools: [
          { tool: 'wifiphisher', role: 'Rogue-AP / captive portal', why: 'Automates the evil-twin plus a phishing captive portal (fake firmware-upgrade, router-login, OAuth pages) to harvest the Wi-Fi passphrase or web credentials post-association.', caveat: 'Social-engineering attack; needs a believable pretext and a deauth to move the client over.', deps: ['alfa-awus036ach'] },
          { tool: 'eaphammer', role: 'Enterprise evil twin', why: 'Targets WPA2/WPA3-Enterprise (802.1X): stands up a hostile RADIUS/AP to capture EAP (MSCHAPv2) credentials and run hostile-portal pivots.', deps: ['alfa-awus036ach'], needs: 'A target running WPA-Enterprise (802.1X/EAP), not PSK.' },
          { tool: 'hostapd-mana', role: 'Credential-harvesting AP', why: 'SensePost’s patched hostapd (the engine under eaphammer): a “MANA” rogue AP that lures clients via their probe history and captures EAP/Enterprise credentials.', deps: ['alfa-awus036ach'] },
          { tool: 'bettercap', role: 'Post-association MITM', why: 'Once the client is on the network, run ARP/DNS spoofing, an HTTP(S) proxy and traffic capture to inspect and tamper with its app-layer flows.', deps: ['alfa-awus036ach'] },
          { tool: 'esp32-marauder', role: 'Evil Portal credential harvest', why: 'Spawns a rogue AP with a captive-portal login page and logs submitted credentials to SD/serial — the above-the-link phishing test from a handheld (Bruce and Ghost ESP do the same).', caveat: 'Authorised / social-engineering engagement only; harvesting third-party credentials without consent is illegal. Needs an SD card and a believable pretext.', deps: ['esp32-devkit', 'cyd', 'm5-cardputer'] },
          { tool: 'esp32-projectzero', role: 'Verifying captive portal + WPA3-SAE overflow', why: 'A two-board evil-twin whose captive portal verifies the entered Wi-Fi password against the real AP, plus a WPA3-SAE overflow mode — a more specialised rogue-portal variant.', caveat: 'Authorised testing only; low-maturity project — verify behaviour first. Needs two ESP32/C5 boards.', deps: ['esp32-devkit'] },
        ],
      },
    },
  },
  BTC: btclassic,
  LORA: lora,
  LTE: lte,
  RFID: rfid,
  SUBG: subg,
  ZIGBEE: zigbee,
  ZWAVE: zwave,
  THREAD: thread,
  GNSS: gnss,
  ADSB: adsb,
  NR5G: nr5g,
  GSM: gsm,
  UWB: uwb,
};
