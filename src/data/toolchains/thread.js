export default {
  "status": "complete",
  "facts": [
    { "k": "Band", "v": "2.4 GHz ISM — IEEE 802.15.4 O-QPSK PHY, the same radio layer as Zigbee" },
    { "k": "Channels", "v": "16 × 5 MHz, channels 11–26 (2.405–2.480 GHz); a Thread network sits on one channel" },
    { "k": "Stack", "v": "IPv6 mesh: 802.15.4 MAC → 6LoWPAN header compression → MLE (Mesh Link Establishment) routing → UDP. Matter (CHIP) rides on top." },
    { "k": "Security", "v": "MAC-layer AES-128-CCM* keyed by the Thread network key — strong link crypto. Commissioning: Commissioner authenticates with PSKc; a Joiner is admitted with PSKd over DTLS." },
    { "k": "Matter", "v": "Runs over Thread or Wi-Fi; devices are commissioned over Bluetooth LE. PASE (SPAKE2+) from the setup passcode at onboarding, then CASE (certificate-authenticated) for operation." }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Identify the mesh before any RF work — and first settle what you are even looking at. Thread and Zigbee share the exact same IEEE 802.15.4 2.4 GHz PHY, so a spectrum view alone cannot tell them apart; you distinguish them by what rides on top. Thread is an IPv6 mesh — its frames carry 6LoWPAN-compressed IPv6 and MLE link-management messages — whereas Zigbee carries its own NWK/APS layers. If the device is a Matter product, expect a setup QR code / 11-digit numeric setup code on the label and a Bluetooth LE radio used only for onboarding. The honest headline: Thread's link crypto is strong, so the real attack surface is commissioning and credentials, not breaking AES.",
      "lookFor": [
        "Is it Thread or Zigbee? Both are 802.15.4 at 2.4 GHz — tell them apart by the upper layers: 6LoWPAN + MLE (and IPv6) means Thread; a Zigbee NWK/APS stack means Zigbee.",
        "Is it a Matter device? Look for the Matter logo, a setup QR code and an 11-digit numeric setup code on the label/box, and a BLE radio used for onboarding.",
        "Chipset / SoC and SDK (FCC ID, teardown) — e.g. nRF52840, EFR32, ESP32-H2/C6 — and cross-reference known Thread/Matter/802.15.4 stack CVEs.",
        "Network identifiers: the 802.15.4 channel (11–26), PAN ID and Extended PAN ID, and the Network Name — all readable from beacons/MLE without any key.",
        "Commissioning posture: how is the network key distributed, is a Border Router / Border Agent reachable, and is the commissioning credential (PSKc / Joiner PSKd / Matter setup passcode) exposed, default, or weak?",
        "Matter onboarding path: the setup passcode and discriminator, whether the BLE commissioning window is left open, and whether you can stand up your own commissioner against it."
      ]
    },
    "SP": {
      "note": "How much of the band can you see, and which channel is the mesh on? IEEE 802.15.4 divides the 2.4 GHz band into 16 channels (11–26) of 5 MHz each across roughly 2.405–2.480 GHz, and a Thread network lives on just one of them. The first job is to find that channel. A wide SDR view shows the whole 80 MHz at a glance so you can spot the active channel; you then point a real 802.15.4 radio at it to capture. A HackRF shows ~20 MHz at a time (a few channels); a bladeRF in its oversampling mode covers the full band in one pass. RTL-SDR is out — it stops below the 2.4 GHz band.",
      "tools": [
        { "tool": "gqrx", "role": "Spectrum / waterfall view", "why": "See the live 2.4 GHz spectrum and pick the active 802.15.4 channel — ~20 MHz at a time on a HackRF, the full band on a bladeRF (oversampling) — before committing a sniffer to it.", "deps": ["hackrf-one", "bladerf-2-micro"] },
        { "tool": "minino", "role": "Pocket 802.15.4 scanner", "why": "Electronic Cats ESP32-C6 multitool with an 802.15.4 (Zigbee/Thread) field-recon mode: scan channels and spot an active mesh standalone, no laptop or SDR needed.", "caveat": "Recon-level visibility; confirm Thread vs Zigbee from a real frame capture.", "deps": [] }
      ]
    },
    "PHY": {
      "note": "No standalone Thread demodulator in this kit. The capture tools demodulate the 802.15.4 O-QPSK waveform (PHY) and frame the packets (LL) together on a dedicated 2.4 GHz 802.15.4 radio, so they live at the Capture step. A wide SDR is useful for finding the channel, but a real 802.15.4 transceiver does the actual framing."
    },
    "LL": {
      "note": "Capture and decode 802.15.4 / Thread frames. Park a real 802.15.4 radio on the target channel and it pulls the raw frames — beacons, MAC, 6LoWPAN, MLE — into Wireshark, which has a full 802.15.4 + Thread/6LoWPAN/MLE dissector. The crucial trick: Thread's MAC payload is AES-128-CCM* encrypted under the network key, but Wireshark will decrypt it in place once you give it that key (the decrypt step lives in 'Break the crypto'). Pick a capture path: the turnkey Nordic extcap, an OpenThread co-processor via pyspinel, or the standalone Minino. Each runs on its radio and feeds Wireshark.",
      "decoder": "wireshark",
      "tools": [
        { "tool": "nrf-sniffer-802154", "role": "Primary sniffer", "why": "Nordic's nRF Sniffer for 802.15.4: firmware plus a Wireshark extcap plugin that streams raw 802.15.4/Thread frames straight into Wireshark — the simplest, best-documented capture path. Runs on an nRF52840 dongle.", "deps": ["nrf52840-dongle"] },
        { "tool": "pyspinel", "role": "OpenThread sniffer", "why": "Its sniffer.py turns an OpenThread NCP/RCP into an 802.15.4 sniffer, piping frames to Wireshark — and the same device can also scan for and attempt to join the mesh, so capture and commissioning assessment share one radio.", "deps": ["nrf52840-dongle"], "needs": "An nRF52840 (or other supported radio) flashed with OpenThread as an NCP/RCP; pyspinel drives it over Spinel." },
        { "tool": "catsniffer", "role": "Multiprotocol sniffer", "why": "CC1352-based multiprotocol radio that captures 802.15.4 alongside its BLE/Sub-GHz/Zigbee workflows and exports PCAP for Wireshark — one board for the whole 2.4 GHz mesh kit.", "deps": [] },
        { "tool": "minino", "role": "Pocket sniffer", "why": "Standalone ESP32-C6 802.15.4 (Zigbee/Thread) capture to microSD with Wireshark-compatible output — capture in the field with no host PC.", "caveat": "2.4 GHz field recon; less control than the host-driven sniffers.", "deps": [] }
      ]
    },
    "CR": {
      "note": "Be honest about the crypto: Thread's MAC layer is AES-128-CCM* and you are not going to break it — there is no offline key-recovery attack here the way crackle attacks weak BLE pairing. What you do at this step is decrypt, not crack: if you hold the Thread network key, Wireshark decrypts the whole capture in place and the mesh becomes readable. So the real question is whether you can obtain that key — through weak or default commissioning credentials (PSKc / Joiner PSKd), a key that is shared or exposed during onboarding, or a Matter setup passcode you can read or guess — rather than attacking the cipher. No radio of its own; it consumes a capture from the Capture step.",
      "tools": [
        { "tool": "wireshark", "role": "Decrypt with the network key", "why": "Wireshark's 802.15.4 layer decrypts CCM*-protected Thread frames in place once you supply the Thread network key in its 802.15.4 decryption-keys table — turning an opaque capture into readable 6LoWPAN/MLE/IPv6.", "deps": [], "needs": "A capture of the mesh from the Capture step (nRF Sniffer / pyspinel / CatSniffer / Minino), plus the Thread network key. The key is the prize — it comes from weak/default/exposed commissioning credentials, not from breaking AES." }
      ]
    },
    "AT": {
      "note": "The real attack surface is commissioning and credentials, not the link cipher. Taking over a Thread/Matter device means joining or subverting the mesh, not hijacking an established 802.15.4 frame stream. Pick the angle: stand up an OpenThread node and try to join the network using captured/guessed commissioning credentials (then you are inside the mesh and the network key is yours), or attack the Matter onboarding itself — drive a commissioner against a device whose BLE commissioning window is open or whose setup passcode is weak/exposed. Where AES-128-CCM* holds, this credential path is the way in.",
      "tools": [
        { "tool": "pyspinel", "role": "Join / probe the mesh", "why": "Drive an OpenThread node to scan, beacon-request and attempt to commission/join the target network using the credentials you obtained — if it joins, you are inside the mesh and hold the network key.", "deps": ["nrf52840-dongle"], "needs": "An nRF52840 flashed with OpenThread (NCP/RCP), plus commissioning credentials (Joiner PSKd / network key) recovered at Identify or Break-the-crypto." },
        { "tool": "chip-tool", "role": "Matter commissioning attack", "why": "Run your own Matter commissioner against the device over BLE: if the commissioning window is open or the setup passcode is weak/exposed, complete PASE and commission the node onto a fabric you control.", "deps": ["usb-bt-dongle"], "needs": "A host Bluetooth LE adapter for the BLE onboarding transport, and the device's Matter setup passcode/discriminator (from the QR code, label, or a guessable/exposed value)." }
      ]
    },
    "AP": {
      "note": "Once you are commissioned onto the device (or onto the mesh), test what it exposes above the link. For Matter that is the cluster/attribute model — read state, invoke commands, subscribe to reports — exercised through the controller. The question here is what the device trusts a commissioned controller to do, and whether the application layer enforces the access controls Matter's spec expects.",
      "tools": [
        { "tool": "chip-tool", "role": "Matter cluster interaction", "why": "After commissioning, use CASE-secured operational commands to read/write attributes, invoke cluster commands and subscribe to a Matter device — the way to enumerate and exercise its application layer.", "deps": ["usb-bt-dongle"], "needs": "A commissioned Matter node (from the Attack step) and a controller fabric; chip-tool from the connectedhomeip SDK speaks the operational Matter protocol over Thread or Wi-Fi." }
      ]
    }
  }
};
