// Authored source for the tools collection. Run with: node scripts/seed-tools.mjs
// Tools are no longer migration-generated; this file is their source of truth.
// Every `repo` URL here was verified to exist before being added.
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const tools = [
  // ---- hardware ----
  {
    slug: 'hackrf-one', name: 'HackRF One', vendor: 'Great Scott Gadgets', type: 'hardware',
    protocols: ['Wide-band SDR'], spec: '~20 MHz IBW · 1 MHz–6 GHz · half-duplex',
    repo: 'https://github.com/greatscottgadgets/hackrf',
    software: ['universal-radio-hacker', 'ice9-bluetooth-sniffer'],
    note: "1 MHz–6 GHz half-duplex SDR — the discovery radio for 'Rapid Radio Reversing': find and characterise an unknown signal before working it with a narrowband tool.",
  },
  {
    slug: 'bladerf-2-micro', name: 'bladeRF 2.0 micro xA9', vendor: 'Nuand', type: 'hardware',
    protocols: ['Wide-band SDR'], spec: '56 MHz IBW · up to 122.88 MHz oversampled (8-bit) · 47 MHz–6 GHz',
    homepage: 'https://www.nuand.com/2023-02-release-122-88mhz-bandwidth/',
    software: ['ice9-bluetooth-sniffer'],
    note: 'Wideband full-duplex SDR (AD9361). ~56 MHz standard, and since the 2023.02 release an oversampling mode reaches 122.88 MHz instantaneous bandwidth (at 8-bit depth over USB 3.0) — enough to cover the entire 80 MHz BLE band in a single pass.',
  },
  {
    slug: 'usrp-b210', name: 'USRP B210', vendor: 'Ettus Research (NI)', type: 'hardware',
    protocols: ['Wide-band SDR'], spec: '~56 MHz IBW (30.72 MHz in 2×2) · 70 MHz–6 GHz',
    homepage: 'https://www.ettus.com/all-products/ub210-kit/',
    software: ['ice9-bluetooth-sniffer'],
    note: 'Lab-grade full-duplex SDR (AD9361) with a disciplined clock option. Up to ~56 MHz real-time bandwidth (halved to ~30.72 MHz in 2×2 MIMO). A common ice9 target for BLE/BT capture.',
  },
  {
    slug: 'signalsdr-pro', name: 'SignalSDR Pro', vendor: 'Signalens', type: 'hardware',
    protocols: ['Wide-band SDR'], spec: '61.44 MHz BW · 70 MHz–6 GHz · 2TX/2RX',
    homepage: 'https://www.rtl-sdr.com/signalsdr-pro-an-upcoming-sdr-with-70-mhz-to-6-ghz-12-bit-adc-61-44-mhz-bandwidth-and-2tx-2rx-channels/',
    note: 'AD9361-based SDR in a Raspberry-Pi form factor (Zynq 7020); the widest instantaneous bandwidth in this list at 61.44 MHz, and it can emulate a USRP B210 / ADALM-Pluto. Newer/emerging product — verify ice9 support and availability before relying on it.',
  },
  {
    slug: 'rtl-sdr-v4', name: 'RTL-SDR Blog V4', vendor: 'RTL-SDR Blog', type: 'hardware',
    protocols: ['RX-only SDR'], spec: '~2.4 MHz BW · 0.5 kHz–1.766 GHz · RX only',
    homepage: 'https://www.rtl-sdr.com/v4/',
    note: 'Budget RX-only dongle. Does NOT reach 2.4 GHz, so it cannot receive BLE, Wi-Fi or Zigbee — but it is a fine cheap receiver for sub-GHz, LoRa and ADS-B (1090 MHz).',
  },
  {
    slug: 'ubertooth-one', name: 'Ubertooth One', vendor: 'Great Scott Gadgets', type: 'hardware',
    protocols: ['BLE', 'Bluetooth'], repo: 'https://github.com/greatscottgadgets/ubertooth',
    software: ['crackle', 'wireshark'],
    note: 'Open BLE/Bluetooth sniffer that follows connections by default (target a BD_ADDR with -t) and captures some Basic Rate Classic. Affordable and battle-tested, but pre-BT5 and weaker on long-lived connections than modern CC1352 sniffers.',
  },
  {
    slug: 'catsniffer', name: 'CatSniffer', vendor: 'Electronic Cats', type: 'hardware', ec: true,
    protocols: ['BLE', 'Sub-GHz', 'Zigbee', 'LoRa'], repo: 'https://github.com/ElectronicCats/CatSniffer',
    software: ['sniffle', 'wireshark', 'catnip', 'kismet'],
    note: 'CC1352 + RP2040 multiprotocol sniffer; runs Sniffle for modern BT5/4.x LE capture, plus Sub-GHz/Zigbee/LoRa workflows. On Linux it can also present as a virtual HCI host BLE adapter via the catnip tool.',
  },
  {
    slug: 'yard-stick-one', name: 'YARD Stick One', vendor: 'Great Scott Gadgets', type: 'hardware',
    protocols: ['Sub-GHz'], homepage: 'https://greatscottgadgets.com/yardstickone/',
    software: ['rfcat', 'universal-radio-hacker'],
    note: 'CC1111 sub-GHz transceiver (300–928 MHz) driven by rfcat — receive, replay and transmit OOK/ASK/FSK from a Python shell. The reference cheap Sub-GHz work tool, paired with a HackRF for discovery.',
  },
  {
    slug: 'proxmark3', name: 'Proxmark3', vendor: 'RFID Research Group (Iceman fork)', type: 'hardware',
    protocols: ['RFID', 'NFC'], repo: 'https://github.com/RfidResearchGroup/proxmark3',
    note: 'The reference RFID/NFC tool: LF+HF, full MIFARE Crypto1 attack suite (darkside/nested/hardnested), read/write/emulate. The Iceman fork is the actively maintained client/firmware.',
  },
  {
    slug: 'chameleon-ultra', name: 'ChameleonUltra', vendor: 'RFID Research Group (RRG)', type: 'hardware',
    protocols: ['RFID', 'NFC'], repo: 'https://github.com/RfidResearchGroup/ChameleonUltra',
    note: 'HF/LF card emulator (nRF52840) for reader-side testing and credential impersonation; emulates full MIFARE Classic with Crypto1.',
  },
  {
    slug: 'alfa-awus036ach', name: 'ALFA AWUS036ACH', vendor: 'Alfa Network', type: 'hardware',
    protocols: ['Wi-Fi'], software: ['aircrack-ng', 'bettercap', 'wireshark'],
    note: 'RTL8812AU dual-band Wi-Fi adapter with monitor mode and injection — the workhorse 802.11 capture/injection radio for surveys and handshake capture.',
  },
  {
    slug: 'wifi-pineapple', name: 'WiFi Pineapple', vendor: 'Hak5', type: 'hardware',
    protocols: ['Wi-Fi'], homepage: 'https://hak5.org',
    note: 'Purpose-built Wi-Fi auditing platform that automates evil-twin, capture and recon workflows.',
  },
  {
    slug: 'bombercat', name: 'BomberCat', vendor: 'Electronic Cats', type: 'hardware', ec: true,
    protocols: ['NFC', 'MagStripe'], repo: 'https://github.com/ElectronicCats/BomberCat',
    note: 'PN7150-based NFC tool for read/emulate and NFC relay (RelayNFC), plus magnetic-stripe emulation (MagSpoof) to legacy readers.',
  },
  {
    slug: 'minino', name: 'Minino', vendor: 'Electronic Cats', type: 'hardware', ec: true,
    protocols: ['Wi-Fi', 'BLE', 'Zigbee', 'Thread'], repo: 'https://github.com/ElectronicCats/Minino',
    note: 'ESP32-C6 pocket multitool (GPS, microSD, OLED). For Wi-Fi (2.4 GHz only) it does wardriving, an AP/SSID sniffer with Wireshark-compatible output, a deauther and console-driven DoS, an analyzer, SSID spammer, and Wi-Fi deauthentication detection. Also BLE and 802.15.4 (Zigbee/Thread) field recon.',
  },
  {
    slug: 'nrf52840-dongle', name: 'nRF52840 Dongle', vendor: 'Nordic Semiconductor', type: 'hardware',
    protocols: ['BLE'], homepage: 'https://www.nordicsemi.com', software: ['nrf-sniffer', 'injectable-firmware'],
    note: 'Low-cost Nordic nRF52840 USB dongle; hosts the nRF Sniffer firmware (with the Wireshark plugin) and the InjectaBLE injection firmware.',
  },
  {
    slug: 'bbc-microbit', name: 'BBC micro:bit', vendor: 'Micro:bit Educational Foundation', type: 'hardware',
    protocols: ['BLE'], homepage: 'https://microbit.org', software: ['btlejack'],
    note: 'A ~$15 nRF51822 board — the reference cheap radio for running Btlejack to sniff, jam and hijack BLE connections.',
  },

  {
    slug: 'stm32wlxx', name: 'STM32WLxx LoRa board', vendor: 'STMicroelectronics', type: 'hardware',
    protocols: ['LoRa', 'Sub-GHz'], spec: 'STM32WL SoC · integrated sub-GHz LoRa/(G)FSK radio',
    homepage: 'https://github.com/whad-team/stm32wlxx-firmware',
    software: ['whad'],
    note: "Any STM32WLxx-based board (e.g. Nucleo-WL55JC, Seeed LoRa-E5) — an Arm Cortex-M4 with an integrated sub-GHz radio. Flashed with WHAD's stm32wlxx-firmware it becomes a WHAD-driven LoRa/LoRaWAN sniff-and-inject radio.",
  },
  // ---- software / projects ----
  {
    slug: 'whad', name: 'WHAD', vendor: 'WHAD Team', type: 'software',
    protocols: ['BLE', 'Zigbee', 'Thread', '802.15.4', 'LoRaWAN', 'ESB'],
    repo: 'https://github.com/whad-team/whad-client',
    note: "Wireless Hacking Devices — a unified Python framework and host protocol that drives many radios to sniff and inject across wireless stacks: BLE, IEEE 802.15.4 / Zigbee / RF4CE, Enhanced ShockBurst, Logitech Unifying, LoRaWAN and a generic PHY layer. Backends include the nRF52840 'Butterfly' firmware, an STM32WLxx (LoRa) firmware, ESP32, Ubertooth, APIMote, RZUSBstick, RFStorm/nRF24 and Yard Stick One, plus host HCI — one toolchain and PCAP/Scapy interface across protocols.",
  },
  {
    slug: 'sniffle', name: 'Sniffle', vendor: 'NCC Group', type: 'software',
    protocols: ['BLE'], repo: 'https://github.com/nccgroup/Sniffle',
    note: 'The reference modern open-source sniffer for Bluetooth 5 and 4.x LE on TI CC1352/CC26x2 (and CatSniffer). Python host, all BT5 PHYs, extended advertising, follows connections — the default LL-layer capture choice today.',
  },
  {
    slug: 'ice9-bluetooth-sniffer', name: 'ice9-bluetooth-sniffer', vendor: 'ICE9 Consulting (Mike Ryan)', type: 'software',
    protocols: ['BLE', 'Bluetooth'], repo: 'https://github.com/mikeryan/ice9-bluetooth-sniffer',
    note: 'SDR-based, Wireshark-compatible all-channel sniffer (HackRF / bladeRF / USRP). Unlike most sniffers it can sniff connections that are already established — invaluable when you cannot catch the connection request. Needs an SDR and GPU/CPU for channelisation.',
  },
  {
    slug: 'crackle', name: 'crackle', vendor: 'Mike Ryan', type: 'software',
    protocols: ['BLE'], repo: 'https://github.com/mikeryan/crackle',
    note: 'Cracks BLE LE Legacy pairing: brute-forces the TK (Just Works / 6-digit PIN), derives the session keys and decrypts the capture. Feed it a PCAP containing the pairing event (e.g. from Ubertooth). Does not apply to LE Secure Connections.',
  },
  {
    slug: 'btlejack', name: 'Btlejack', vendor: 'Damien Cauquil (virtualabs)', type: 'software',
    protocols: ['BLE'], repo: 'https://github.com/virtualabs/btlejack',
    note: 'Sniff, jam and hijack BLE connections from low-cost hardware (BBC micro:bit / nRF51822). Established the practical jam-and-hijack technique for taking over a live connection.',
  },
  {
    slug: 'injectable-firmware', name: 'InjectaBLE firmware', vendor: 'Romain Cayre', type: 'project',
    protocols: ['BLE'], repo: 'https://github.com/RCayre/injectable-firmware',
    note: 'nRF52840-dongle firmware implementing the InjectaBLE strategy: eavesdrop a connection and inject link-layer frames to hijack a role or run a man-in-the-middle.',
  },
  {
    slug: 'bleak', name: 'Bleak', vendor: 'open source (Henrik Blidh)', type: 'software',
    protocols: ['BLE'], repo: 'https://github.com/hbldh/bleak',
    note: 'Cross-platform async Python BLE GATT client (Windows/Linux/macOS): discover, connect, read/write/subscribe characteristics. The fastest way to script application-layer interaction and replay learned commands.',
  },
  {
    slug: 'bettercap', name: 'bettercap', vendor: 'bettercap', type: 'software',
    protocols: ['Wi-Fi', 'BLE'], repo: 'https://github.com/bettercap/bettercap',
    note: 'Network attack/recon framework with a BLE module for device discovery and GATT enumeration, plus Wi-Fi recon and handshake capture.',
  },
  {
    slug: 'nrf-sniffer', name: 'nRF Sniffer for Bluetooth LE', vendor: 'Nordic Semiconductor', type: 'software',
    protocols: ['BLE'], homepage: 'https://www.nordicsemi.com',
    note: 'Vendor BLE sniffer firmware (nRF52 DK / dongle) with a Wireshark plugin. Easy and well-documented, but follows a single connection and is less capable than Sniffle for adversarial work.',
  },
  {
    slug: 'rfcat', name: 'rfcat', vendor: 'atlas0fd00m', type: 'software',
    protocols: ['Sub-GHz'], repo: 'https://github.com/atlas0fd00m/rfcat',
    note: 'Python shell for CC1111-class transceivers (YARD Stick One): set layer-1 parameters and receive, replay or forge OOK/ASK/FSK.',
  },
  {
    slug: 'universal-radio-hacker', name: 'Universal Radio Hacker', vendor: 'open source', type: 'software',
    protocols: ['any SDR'], repo: 'https://github.com/jopohl/urh',
    note: 'Integrated reversing workbench: auto-detect modulation/bitrate, extract bitstreams, diff captures and replay — the fastest path from raw I/Q to a labelled frame format.',
  },
  {
    slug: 'wireshark', name: 'Wireshark', vendor: 'open source', type: 'software',
    protocols: ['any'], homepage: 'https://www.wireshark.org',
    note: 'The universal packet dissector. Capture tools across these protocols export to PCAP, and Wireshark dissects, decodes and lets you filter the frames here — supplying a network/link key where one is needed to decrypt in place.',
  },
  {
    slug: 'aircrack-ng', name: 'aircrack-ng', vendor: 'open source', type: 'software',
    protocols: ['Wi-Fi'], homepage: 'https://www.aircrack-ng.org',
    note: 'The classic 802.11 suite: monitor-mode capture, deauth, handshake capture and offline cracking (with hashcat for modern WPA).',
  },
  {
    slug: 'usb-bt-dongle', name: 'USB Bluetooth adapter', vendor: 'generic', type: 'hardware',
    protocols: ['BLE'],
    note: 'Any standard USB Bluetooth LE adapter (e.g. a CSR8510-class dongle) provides the host HCI controller that GATT tools like Bleak and bettercap drive.',
  },
  {
    slug: 'catnip', name: 'catnip', vendor: 'Electronic Cats', type: 'software', ec: true,
    protocols: ['BLE', 'Zigbee', '802.15.4', 'Sub-GHz', 'LoRa'], repo: 'https://github.com/ElectronicCats/CatSniffer-Tools',
    note: 'The CatSniffer host toolset (CatSniffer-Tools). Its pycatsniffer drives a CatSniffer to sniff IEEE 802.15.4 / Zigbee and BLE with native Wireshark extcap integration; it also presents the CatSniffer as a virtual HCI (vHCI) Bluetooth adapter on Linux so host BLE tools like Bleak and bettercap can drive it. On the sub-1 GHz side the CatSniffer\'s Semtech SX1262 reads and transmits (G)FSK packets (and LoRa/Meshtastic) over a scriptable serial bridge, and the CC1352P sniffer firmware adds IEEE 802.15.4g into Wireshark.',
  },
  {
    slug: 'gqrx', name: 'Gqrx SDR', vendor: 'open source', type: 'software',
    protocols: ['any SDR'], repo: 'https://github.com/gqrx-sdr/gqrx',
    note: 'Live spectrum + waterfall SDR receiver (HackRF, bladeRF, USRP…) — the quickest way to see what is transmitting and where, and to judge how much of the band a given radio covers.',
  },
  {
    slug: 'ubertooth-tools', name: 'Ubertooth host tools', vendor: 'Great Scott Gadgets', type: 'software',
    protocols: ['BLE'], repo: 'https://github.com/greatscottgadgets/ubertooth',
    note: 'The host-side tools (ubertooth-btle and friends) that drive an Ubertooth One to sniff and follow BLE connections, exporting to PCAP.',
  },

  // ---- Wi-Fi (802.11) ----
  {
    slug: 'hcxdumptool', name: 'hcxdumptool', vendor: 'ZerBea', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/ZerBea/hcxdumptool',
    note: 'Capture tool focused on WPA/WPA2 key material: requests the PMKID directly from an AP (often with no connected client) and grabs EAPOL 4-way handshakes, writing pcapng for offline cracking. The clientless PMKID grab is its signature.',
  },
  {
    slug: 'hcxtools', name: 'hcxtools', vendor: 'ZerBea', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/ZerBea/hcxtools',
    note: 'Companion converters for hcxdumptool captures. hcxpcapngtool turns a captured pcapng into the hashcat/John .hc22000 hash format — the bridge from a raw capture to an offline crack.',
  },
  {
    slug: 'hashcat', name: 'hashcat', vendor: 'hashcat', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/hashcat/hashcat',
    note: 'GPU-accelerated password recovery. For Wi-Fi, mode 22000 cracks both WPA/WPA2 4-way handshakes and PMKIDs from a .hc22000 hash using dictionary, rule and mask attacks — the fastest offline WPA cracker.',
  },
  {
    slug: 'kismet', name: 'Kismet', vendor: 'Kismet Wireless', type: 'software',
    protocols: ['Wi-Fi', 'Zigbee', '802.15.4'], repo: 'https://github.com/kismetwireless/kismet',
    note: 'Passive wireless detector, sniffer and wardriving tool. Channel-hops to log every AP, client and SSID (with GPS) and captures to pcapng without ever transmitting — the reference quiet survey/capture tool. Beyond Wi-Fi it has the widest 802.15.4/Zigbee datasource support of any tool here: a dedicated CatSniffer v3 Zigbee source (channels 12–26) plus nRF52840, CC2531, RZUSBstick, nRF51822 and NXP KW41Z (Kismet git / 2025-10+ releases).',
  },
  {
    slug: 'reaver', name: 'Reaver (t6x fork)', vendor: 't6x', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/t6x/reaver-wps-fork-t6x',
    note: 'Attacks the WPS registration PIN to recover a WPA/WPA2 passphrase, including the offline Pixie-Dust attack against weak WPS implementations. The actively maintained community fork; works only where WPS is enabled.',
  },
  {
    slug: 'mdk4', name: 'MDK4', vendor: 'aircrack-ng', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/aircrack-ng/mdk4',
    note: '802.11 stress-testing and DoS toolkit: deauthentication floods, beacon floods (fake SSIDs), authentication floods, probe and other attacks — for testing how an AP and clients hold up under adversarial traffic.',
  },
  {
    slug: 'wifiphisher', name: 'Wifiphisher', vendor: 'Wifiphisher project', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/wifiphisher/wifiphisher',
    note: 'Rogue access point framework: automates the evil-twin plus a templated phishing captive portal (router-login, fake firmware-upgrade, OAuth) to harvest Wi-Fi passphrases or web credentials after a client associates.',
  },
  {
    slug: 'eaphammer', name: 'EAPHammer', vendor: 's0lst1c3', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/s0lst1c3/eaphammer',
    note: 'Targeted evil-twin attacks against WPA2/WPA3-Enterprise (802.1X): stands up a hostile AP/RADIUS to capture EAP (e.g. MSCHAPv2) credentials and run hostile-portal pivots. Built on hostapd-mana.',
  },
  {
    slug: 'hostapd-mana', name: 'hostapd-mana', vendor: 'SensePost', type: 'software',
    protocols: ['Wi-Fi'], repo: 'https://github.com/sensepost/hostapd-mana',
    note: "SensePost's modified hostapd for Wi-Fi attacks — the 'MANA' rogue AP that lures clients using their probe history and captures Enterprise/EAP credentials. The engine underneath EAPHammer.",
  },
];

// Fold in the per-protocol tool catalogues written by the protocol sub-agents
// (src/data/protocol-tools/<proto>.json). Existing base slugs win on collision.
const ptDir = 'src/data/protocol-tools';
const extra = existsSync(ptDir)
  ? readdirSync(ptDir).filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(join(ptDir, f), 'utf8')))
  : [];
const merged = [];
const seen = new Set();
for (const t of [...tools, ...extra]) {
  if (seen.has(t.slug)) continue;
  seen.add(t.slug);
  merged.push(t);
}

const dir = 'src/content/tools';
if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

for (const t of merged) {
  const { slug, note, ...rest } = t;
  const data = { ...rest, ...(t.ec ? { ec: true } : {}), note };
  writeFileSync(join(dir, `${slug}.md`), matter.stringify(`${note}\n`, data));
}
console.log(`Seeded ${merged.length} tools (${tools.length} base + ${extra.length} from protocol files).`);
