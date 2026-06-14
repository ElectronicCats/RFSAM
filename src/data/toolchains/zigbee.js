export default {
  "status": "complete",
  "facts": [
    { "k": "Band", "v": "2.4 GHz (2.405–2.480 GHz ISM) — primary · sub-GHz 868 MHz (Europe) / 902–928 MHz (Americas)" },
    { "k": "Channels", "v": "2.4 GHz: 16 channels, 11–26, spaced 5 MHz · sub-GHz: ch 0 @ 868 MHz and ch 1–10 @ 915 MHz band" },
    { "k": "PHY / Modulation", "v": "IEEE 802.15.4 — 2.4 GHz uses O-QPSK with DSSS, 250 kbps; sub-GHz uses BPSK/O-QPSK at lower rates" },
    { "k": "Stack", "v": "802.15.4 MAC/PHY → Zigbee NWK (mesh routing) → APS (application support) → ZCL/ZDO. Roles: Coordinator, Router, End Device" },
    { "k": "Security", "v": "AES-128-CCM* at NWK and APS layers. A network key shared by the whole PAN; a Trust Center link key gates joining. Default well-known TC link key 'ZigBeeAlliance09' (hex 5A6967426565416C6C69616E636530390)" },
    { "k": "Range", "v": "~10–100 m per hop indoors; the mesh extends reach by routing through mains-powered Routers" }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Identify the device and its Zigbee profile before any RF work — no capture yet. The goal is to know what you are dealing with: which radio SoC it runs, whether it is a Coordinator (the hub/Trust Center), a Router or an End Device, which channel and PAN it lives on, and how it secures joining. Much of this is readable from the FCC ID and a teardown, and the rest falls out the moment you watch a join.",
      "lookFor": [
        "Chipset / SoC and stack (FCC ID, teardown, module markings — Silicon Labs EFR32/EM35x, TI CC2530/CC2538/CC1352, NXP JN51xx, Espressif ESP32-C6) — cross-reference known Zigbee/802.15.4 CVEs and vendor stack advisories.",
        "Role in the mesh: Coordinator (also the Trust Center that hands out keys), Router (mains-powered, relays) or End Device (often sleepy/battery) — sets what you will see on air and what to target.",
        "Channel and PAN: the 802.15.4 channel (11–26 at 2.4 GHz), the 16-bit PAN ID and 64-bit extended PAN ID, and the network's short/extended addresses.",
        "Join / security model: centralized (a Trust Center using a link key) vs distributed; whether it relies on the well-known default Trust Center link key 'ZigBeeAlliance09', a per-device install code, or Zigbee 3.0 install-code-only joining.",
        "Profile and application: Zigbee 3.0 / Home Automation / Light Link, the device's clusters (on/off, level, lock, thermostat) and which are reachable.",
        "Identifiers: manufacturer/model strings reported over ZCL, the EUI-64, and whether the device leaks them before encryption is in force."
      ]
    },
    "SP": {
      "note": "Before capturing, find which of the 16 channels the network is on. Zigbee at 2.4 GHz pins each PAN to one 2 MHz-wide channel (11–26, every 5 MHz across the band) and stays there — it does not frequency-hop like BLE — so the job is a channel scan, not chasing hops. The fast way is an energy/active scan with the capture radio itself; an SDR waterfall is a coarse cross-check to see which channels are lit (and Wi-Fi overlaps heavily in this band, so expect interference). Channels 15, 20, 25 and 26 sit in the gaps between Wi-Fi channels and are common Zigbee choices.",
      "tools": [
        { "tool": "killerbee", "role": "Channel / network scan", "why": "zbstumbler walks the channels transmitting beacon requests and logs the PANs that answer (PAN ID, channel, stack profile) — an active scan that finds the network and its channel fast.", "caveat": "Active: it transmits beacon requests. For a purely passive sweep, energy-scan with the capture radio instead.", "deps": ["apimote", "nrf52840-dongle", "catsniffer"] },
        { "tool": "gqrx", "role": "Spectrum / waterfall view", "why": "Coarse cross-check of which channels are lit across the 2.4 GHz band on an SDR — useful to spot activity and judge Wi-Fi overlap before committing to a channel.", "caveat": "Sees energy, not Zigbee frames; can't tell Zigbee from Wi-Fi/BLE by waterfall alone.", "deps": ["hackrf-one", "bladerf-2-micro"] },
        { "tool": "minino", "role": "Pocket scanner", "why": "Electronic Cats ESP32-C6 multitool with native 802.15.4: standalone channel/PAN recon in the field with onboard OLED, GPS and microSD — no laptop needed.", "deps": [] }
      ]
    },
    "PHY": {
      "note": "No standalone Zigbee demodulator in this kit. The capture radios demodulate the 802.15.4 O-QPSK/DSSS waveform (PHY) and frame the MAC packets (LL) together on their own 802.15.4 chipset, so PHY and Capture live as one step. A wide-band SDR can show the spectrum, but decoding live O-QPSK/DSSS in software is impractical — use a real 802.15.4 radio for capture."
    },
    "LL": {
      "note": "Capture and decode 802.15.4 / Zigbee frames. Park an 802.15.4 radio on the target's channel and it pulls beacons, MAC frames, the join exchange and the encrypted NWK/APS payloads off the air into a PCAP. Pick a capture tool by the radio you have; each feeds Wireshark, whose Zigbee dissector decodes NWK and APS (and will decrypt the upper layers once you supply the network key). Crucially, capture a device joining — that is where the network key is transported and where the whole network opens up.",
      "decoder": "wireshark",
      "tools": [
        { "tool": "killerbee", "role": "Primary capture", "why": "zbdump writes a PCAP and zbwireshark pipes frames live into Wireshark, on whichever 802.15.4 radio KillerBee supports — the standard capture path for Zigbee assessment.", "deps": ["apimote", "nrf52840-dongle", "catsniffer"] },
        { "tool": "nrf-sniffer-802154", "role": "Turnkey capture", "why": "Nordic's firmware + Wireshark extcap plugin captures raw 2.4 GHz 802.15.4 straight into Wireshark — the easiest, best-documented first capture on cheap nRF52840 hardware.", "deps": ["nrf52840-dongle"] },
        { "tool": "whsniff", "role": "CC2531 capture", "why": "Bridges a TI CC2531 USB dongle to Wireshark for live 2.4 GHz 802.15.4 capture — a cheap, simple capture path when you have a CC2531.", "caveat": "CC2531 is 2.4 GHz only and capture-only (no injection).", "deps": ["nrf52840-dongle"] },
        { "tool": "minino", "role": "Pocket sniffer", "why": "Standalone ESP32-C6 802.15.4 sniffer that writes Wireshark-compatible captures to microSD — capture in the field with no host PC.", "deps": [] }
      ]
    },
    "CR": {
      "note": "Assess the join security and recover the network key where it was transported weakly. Zigbee encrypts NWK and APS with AES-128-CCM*, so the whole capture hinges on the network key — and the classic weakness is how that key reaches a joining device. In a centralized network the Trust Center sends the network key in an APS Transport-Key during the join; if it is protected only by the well-known default Trust Center link key 'ZigBeeAlliance09' (or sent in the clear on older devices), anyone who captured the join can recover it. So the attack is: capture a device joining, then extract the key. Once you have the network key, load it into Wireshark and the dissector decrypts the mesh.",
      "tools": [
        { "tool": "zbdsniff", "role": "Network-key extraction", "why": "Scans a join capture for the APS Transport-Key and recovers the Zigbee network key — decrypting it under the well-known default Trust Center link key 'ZigBeeAlliance09' (or reading it directly when sent in the clear).", "caveat": "Only works when the key was transported under the default TC link key or unencrypted; a per-device install code defeats it.", "deps": ["wireshark"], "needs": "A PCAP that contains a device joining the network (the APS Transport-Key frame). Capture the join at the Capture step (KillerBee / nRF Sniffer / whsniff), save the PCAP from Wireshark, then run zbdsniff over that file. To force a fresh join, power-cycle or re-pair the target device while capturing." },
        { "tool": "wireshark", "role": "Decrypt with the key", "why": "Once you have the network key, paste it into Wireshark's Zigbee protocol preferences (and the well-known TC link key 'ZigBeeAlliance09') and the dissector decrypts NWK/APS in the capture — turning ciphertext into readable cluster commands.", "deps": ["wireshark"], "needs": "The network key recovered by zbdsniff (or a key you already hold). Add it under Edit → Preferences → Protocols → ZigBee, then reload the capture." }
      ]
    },
    "AT": {
      "note": "Actively take over or disrupt the mesh. Pick the technique; each names the 802.15.4 radio it runs on, and replay/injection need a radio that can transmit (the ApiMote and CatSniffer can; capture-only dongles cannot). With the network key in hand you can forge and inject frames; even without it, captured encrypted commands can sometimes be replayed wholesale, and a forced leave/rejoin can be abused to re-capture a join (and thus the key).",
      "tools": [
        { "tool": "killerbee", "role": "Replay & inject", "why": "zbreplay re-transmits frames captured earlier (e.g. an on/off or unlock command) back into the network, and the framework's tools forge frames once you hold the network key — the practical replay/injection path.", "caveat": "Needs a transmit-capable 802.15.4 radio; capture-only dongles can't inject.", "deps": ["apimote", "catsniffer"] },
        { "tool": "killerbee", "role": "Join / rejoin abuse", "why": "Force a target to leave and rejoin so a fresh join (and its key transport) hits the air again — KillerBee's framework drives the disruptive scans/floods that provoke a rejoin, which you then capture for key extraction at the Break-crypto step.", "caveat": "Disruptive and noisy; transmits into the live network.", "deps": ["apimote", "catsniffer"] },
        { "tool": "minino", "role": "Pocket 802.15.4 attacker", "why": "Electronic Cats ESP32-C6 field tool with native 802.15.4 for standalone Zigbee/Thread recon and disruption without a laptop.", "caveat": "2.4 GHz only; field recon/disruption, not the full KillerBee injection suite.", "deps": [] }
      ]
    },
    "AP": {
      "note": "Test what the device trusts above the link — the Zigbee Cluster Library (ZCL) commands a Coordinator would send: toggle a relay, unlock a lock, set a thermostat, read attributes. Once you hold the network key you can craft these as encrypted APS frames and inject them, or join a Trust Center / coordinator stack to the network and drive devices legitimately. This is where a recovered key pays off — issuing application commands the device acts on.",
      "tools": [
        { "tool": "killerbee", "role": "Craft & inject ZCL", "why": "With the network key, use KillerBee's framework (zbscapy / scapy-radio) to build and transmit Zigbee APS/ZCL frames — issue cluster commands (on/off, lock/unlock, level) the target device executes.", "caveat": "Needs the network key (from the Break-crypto step) and a transmit-capable radio.", "deps": ["apimote", "catsniffer"], "needs": "The network key recovered at the Break-crypto step, plus a transmit-capable 802.15.4 radio (ApiMote or CatSniffer)." }
      ]
    }
  }
};
