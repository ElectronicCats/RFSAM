export default {
  status: 'complete',
  facts: [
    { k: 'Band', v: '2.402–2.480 GHz (2.4 GHz ISM) — 79 RF channels × 1 MHz, adaptive frequency hopping (AFH) at ~1600 hops/s. Sharing the band with BLE and Wi-Fi, but a different PHY/MAC from BLE.' },
    { k: 'Modulation / rate', v: 'Basic Rate (BR): GFSK, 1 Mbps. Enhanced Data Rate (EDR): π/4-DQPSK (2 Mbps) and 8DPSK (3 Mbps). The fast 79-channel hop is what makes BR/EDR hard to follow with a static SDR.' },
    { k: 'Identifiers', v: '48-bit BD_ADDR (the device address; upper 24 bits = OUI/vendor) and a Class of Device (CoD) field that hints at the device type. Discoverable devices answer an inquiry scan; non-discoverable ones must be addressed directly.' },
    { k: 'Security', v: 'Legacy pairing: a PIN seeds the link key — short/fixed PINs fall to an offline attack on a captured pairing. Secure Simple Pairing (SSP): ECDH (P-192 in 2.1, P-256 in 4.1+) — but the "Just Works" association model has no MITM protection. Link-layer encryption is E0 (legacy) or AES-CCM. The KNOB attack downgrades the encryption key entropy during negotiation.' },
    { k: 'Topology / targets', v: 'Piconet: one master + up to 7 active slaves; services exposed over profiles (SDP, RFCOMM, HID, A2DP/HFP audio, OBEX). Common targets: wireless headsets/speakers, keyboards & mice (HID), car infotainment / hands-free, OBD-II dongles, point-of-sale and industrial gear.' },
  ],
  reference: {
    name: 'BSAM (Tarlogic)',
    url: 'https://www.tarlogic.com/bsam/',
    note: 'As with BLE, RFSAM owns the RF floors for Bluetooth Classic — getting BR/EDR off the air and into a dissector on cheap hardware — and defers the link-and-above assessment (pairing, profiles, application logic) to Tarlogic’s BSAM, adding only the RF-capture prerequisite. This page is deliberately honest: accessible BR/EDR tooling is thinner and younger than the BLE or Wi-Fi ecosystems, and most of it runs on one $5 board (the original ESP32).',
  },
  layers: {
    IG: {
      note: 'Identify the Bluetooth Classic device before any RF work — no capture yet. The first question is whether the device even speaks BR/EDR (Classic) or only BLE: an ESP32-S3, nRF or CC-series target is LE-only, while audio gear, HID peripherals and car/OBD modules are usually Classic or dual-mode. From there, fingerprint the controller SoC and pairing model, because those decide what the rest of this descent can do. Most of this is readable from the FCC ID, a teardown, the BD_ADDR’s vendor OUI, and the Class-of-Device the device advertises when discoverable.',
      lookFor: [
        'Bluetooth mode — Classic (BR/EDR), dual-mode (BR/EDR + LE), or LE-only. Only BR/EDR belongs on this page; LE-only devices go to the BLE descent.',
        'Controller SoC / firmware (FCC ID, teardown, BD_ADDR OUI) — cross-reference Bluetooth Classic advisories: BlueBorne, KNOB (key-size downgrade), and the BrakTooth family (baseband/LMP crashes and RCE across many BR/EDR controllers).',
        'BD_ADDR and Class of Device (CoD): the 48-bit address and the device-type hint, readable from any inquiry response while the device is discoverable.',
        'Discoverability — is the device in inquiry-scan mode (answers a scan) or non-discoverable (you must already know its BD_ADDR)?',
        'Pairing / association model: legacy PIN pairing vs Secure Simple Pairing (and within SSP, Just Works vs Passkey vs OOB) — and whether the link is encrypted (E0 vs AES-CCM).',
        'Exposed profiles/services (SDP browse): RFCOMM serial, HID, A2DP/HFP audio, OBEX object push — the application surface above the link.',
      ],
    },
    SP: {
      note: 'Confirm the device is transmitting and enumerate what is reachable. Two complementary moves. First, a spectrum view: BR/EDR hops across all 79 channels ~1600 times a second, so a waterfall over 2.402–2.480 GHz shows band activity but you cannot lock to a single channel the way you can with a fixed-channel protocol — it confirms "something Bluetooth is busy here", not a clean per-packet read. Second, an inquiry scan: cheap ESP32 firmware uses the chip’s own Bluetooth controller to run a true BR/EDR inquiry and list every discoverable device’s BD_ADDR, name, RSSI and Class of Device — the BR/EDR analogue of a BLE advertising scan, and usually the most useful "see it" step for Classic.',
      tools: [
        { tool: 'gqrx', role: 'Spectrum / waterfall view', why: 'Watch 2.402–2.480 GHz for the hopping BR/EDR bursts — confirm the device is alive and the band is busy. You see activity, not clean per-packet decode: the 1600 hops/s frustrate a static SDR.', caveat: 'Activity view only — fast AFH hopping means an SDR cannot follow a piconet packet-by-packet here.', deps: ['hackrf-one', 'bladerf-2-micro'] },
        { tool: 'esp32-classic-bt-scan', role: 'BR/EDR inquiry scan', why: 'Runs a true Bluetooth Classic inquiry on the ESP32’s own controller and lists each discoverable device’s BD_ADDR, name, RSSI and Class of Device — the cheapest way to enumerate Classic devices in range.', caveat: 'Only finds devices currently in discoverable / inquiry-scan mode; needs the original ESP32 (Classic radio), not an S3/C-series.', deps: ['esp32-devkit'] },
        { tool: 'esp32-bt-exp', role: 'Dual-mode discovery dump', why: 'Brings up the Bluedroid stack in dual-mode and dumps both Classic (inquiry) and BLE devices it sees — a quick combined survey when a target may be either.', caveat: 'Discovery only — no pairing or connection. Classic discovery needs the BR/EDR-capable original ESP32.', deps: ['esp32-devkit'] },
      ],
    },
    PHY: {
      note: 'No standalone BR/EDR demodulator in this kit. Decoding live GFSK/DQPSK while it hops 1600 times a second is impractical for a software-defined radio, so the practical capture path does PHY and framing together inside a device that owns a real Bluetooth controller. The ESP32 BR/EDR sniffer takes exactly this route: it patches the chip’s own baseband firmware to expose the packets the controller already demodulates, rather than trying to recover them from raw I/Q.',
    },
    LL: {
      note: 'Capture and decode Bluetooth Classic frames. Because an SDR cannot follow the hop, the accessible capture path uses a device with its own BR/EDR radio. The reference option is the ESP32 Classic sniffer: patched ROM firmware dumps baseband packets (BT header, channel, role, FHS, ACL and LMP) over USB serial into a Python host tool with Scapy/Wireshark output — serious BR/EDR visibility on a $5 board, though it actively connects to the target. The Ubertooth One can also pick up some Basic-Rate Classic, a legacy budget option. Either way you export to Wireshark for dissection.',
      decoder: 'wireshark',
      tools: [
        { tool: 'esp32-bt-classic-sniffer', role: 'BR/EDR baseband sniffer', why: 'Patches the ESP32 Bluetooth ROM stack to dump baseband packets — BT header, channel, role, FHS, ACL and LMP — over USB serial to a host Python tool (BTSnifferBREDR.py) with Scapy and Wireshark output. The accessible reference BR/EDR capture path on commodity hardware.', caveat: 'Actively connects to the target to follow it (not purely passive); authorised testing only. Needs the original ESP32 (Classic radio).', deps: ['esp32-devkit'] },
        { tool: 'ubertooth-tools', role: 'Budget Basic-Rate capture', why: 'The Ubertooth One can capture some Basic-Rate Bluetooth Classic in addition to its BLE work — a legacy, lower-fidelity option when an ESP32 sniffer is not to hand.', caveat: 'Partial Basic-Rate only; weaker and dated next to the ESP32 baseband sniffer for serious BR/EDR work.', deps: ['ubertooth-one'] },
      ],
    },
    CR: {
      note: 'Be honest about what is breakable. Legacy PIN pairing is the classic weakness: the PIN seeds the link key, so a captured legacy pairing exchange with a short or fixed PIN (0000 / 1234) falls to an offline brute force that recovers the link key and decrypts the session — but you must have captured the pairing, and modern devices rarely use legacy pairing. Secure Simple Pairing (ECDH, P-192/P-256) resists offline key recovery; its weak point is the "Just Works" association model (no MITM protection), an active-MITM problem rather than an offline crack. The KNOB attack is a separate, protocol-level flaw: it negotiates the encryption key down to as little as 1 byte of entropy, after which the key is brute-forceable — a downgrade, not a maths break. There is no clean point-and-click ESP32 tool for these on cheap hardware, so this floor is mostly analysis of a capture from the previous step plus the BSAM pairing controls.',
    },
    AT: {
      note: 'Going active against Bluetooth Classic means transmitting in the 2.4 GHz ISM band and poking a live BR/EDR device — authorised testing only, on devices you own or are contracted to assess. The standout accessible capability is BrakTooth: a PoC suite of baseband/LMP attacks (≈16 CVEs, 20+ variants) that crash, deadlock or in some cases run code on the BR/EDR controllers of dozens of SoCs — and it runs on the same $5 ESP32. Beyond that, the KNOB key-entropy downgrade enables a follow-on brute force where supported, and a broadband 2.4 GHz jammer denies the band wholesale (illegal in most jurisdictions outside a shielded lab). Forging/replaying valid encrypted frames needs the link key from the previous step.',
      tools: [
        { tool: 'braktooth', role: 'Baseband / LMP exploit & fuzz', why: 'The public BrakTooth release: fuzzes and fires ~20 baseband/LMP attack variants (≈16 CVEs) at a target BR/EDR controller — crash, deadlock and, on some chips, RCE — from a cheap ESP32. The reference accessible BR/EDR attack framework.', caveat: 'Crash/DoS and in some cases RCE against live targets — authorised testing only. Patch status varies by vendor; treat the CVE list as representative, not current.', deps: ['esp32-devkit'] },
        { tool: 'esp32-bluejammer', role: 'Broadband 2.4 GHz jam (DoS)', why: 'Floods all of 2.4 GHz with noise to deny Bluetooth Classic (79 ch), BLE and Wi-Fi at once — a wholesale availability test of how a piconet behaves under RF denial.', caveat: 'RF jamming is illegal in most jurisdictions (e.g. unlawful in the US under FCC rules) — authorised testing only, in an RF-shielded / controlled environment. Needs two nRF24L01+PA+LNA modules.', deps: ['esp32-devkit'], needs: 'Two nRF24L01+PA+LNA modules wired to the ESP32.' },
      ],
    },
    AP: {
      note: 'Above the link sits the application — the profiles and services the device exposes over its BR/EDR link: SDP (the service directory), RFCOMM serial channels (often carrying AT commands on hands-free/car units), HID (inject keystrokes into a host that trusts the device), A2DP/HFP audio, and OBEX object push. The practical driver here is a normal Linux host with its BlueZ stack over any standard USB Bluetooth adapter: `sdptool browse` to enumerate services, `l2ping` to probe reachability, `bluetoothctl` to pair and connect, and profile tools (obexftp, HID/HFP utilities) to exercise what the device trusts — the same host workflow BSAM’s Bluetooth controls assume.',
      tools: [
        { tool: 'usb-bt-dongle', role: 'Host BR/EDR stack (BlueZ)', why: 'A standard USB Bluetooth adapter gives a Linux host its BR/EDR controller; from there BlueZ drives the application layer — enumerate services, probe, pair and exercise RFCOMM/HID/OBEX profiles.', caveat: 'A legitimate host stack, not a covert injector — most application-layer testing requires pairing/permission with the target.', deps: [], needs: 'A Linux host running BlueZ: sdptool browse (service discovery), l2ping (reachability), bluetoothctl (pair/connect), and profile tools such as obexftp.' },
      ],
    },
  },
};
