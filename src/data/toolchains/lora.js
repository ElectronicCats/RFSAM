export default {
  "status": "complete",
  "facts": [
    { "k": "Band", "v": "Sub-GHz ISM, regional: EU868 (863–870 MHz) · US915 (902–928 MHz) · AS923 (sub-banded family, ~915–928 MHz) · EU433 (433.05–434.79 MHz) · also AU915 / CN470 / IN865 / KR920" },
    { "k": "Modulation", "v": "CSS (Chirp Spread Spectrum) — a chirp sweeps the band; data is encoded in the chirp’s cyclic start offset. Spreading factor SF7–SF12 trades data rate for range/sensitivity (higher SF = slower, longer reach)." },
    { "k": "Bandwidth", "v": "125 / 250 / 500 kHz in LoRaWAN regional plans (SX127x/SX126x chips also support 7.8–62.5 kHz, but those are not used by LoRaWAN)." },
    { "k": "LoRaWAN MAC", "v": "PHYPayload = MHDR | MACPayload | MIC(4B). MHDR carries MType. MACPayload = FHDR(DevAddr, FCtrl, FCnt, FOpts) | FPort | FRMPayload. MIC is AES-128-CMAC (RFC 4493)." },
    { "k": "Crypto", "v": "FRMPayload encrypted with AES-128 (AppSKey); MIC keyed by NwkSKey. Root keys: AppKey (1.0.x) / NwkKey+AppKey (1.1). Two activation modes: OTAA (keys derived at join) and ABP (static session keys burned in)." },
    { "k": "Join (OTAA)", "v": "JoinRequest = JoinEUI/AppEUI | DevEUI | DevNonce — sent in clear, protected only by a MIC (the key is never transmitted). JoinAccept is encrypted. 1.0.x DevNonce is random (replay risk); 1.1 makes it a monotonic counter and adds a Join Server + split keys." }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Work out what the device and its network look like before any RF work — no capture yet. LoRa is two layers: the LoRa radio (the CSS chirp) and LoRaWAN (the MAC/network on top). You want to know the region/band it uses (this sets the frequencies you survey), which LoRaWAN version and activation mode it runs, and where the cryptographic weak points are. Much of this comes from the device label/FCC ID, the vendor datasheet, and the network server’s device profile if you have access to it.",
      "lookFor": [
        "Radio chipset (Semtech SX127x / SX126x / SX130x gateway) and module vendor (FCC ID, teardown) — sets the supported bands, spreading factors and bandwidths.",
        "Regional band (EU868 / US915 / AS923 / EU433 …): determines the exact frequencies and channel plan to survey, and the SF/BW data-rate set in play.",
        "LoRaWAN version: 1.0.x vs 1.1 — 1.1 adds a Join Server, split keys and a monotonic DevNonce; 1.0.x is more exposed to join replay and key-management mistakes.",
        "Activation mode: OTAA (session keys derived at each join) vs ABP (static session keys + DevAddr burned into the device — no rotation, frame-counter reset risk).",
        "Key management: is the AppKey a per-device random value, or a default / shared / vendor-wide key? A weak or reused AppKey collapses the whole crypto chain.",
        "Identifiers visible on the air: DevAddr (data frames) and DevEUI / JoinEUI(AppEUI) / DevNonce (join requests, in clear) — useful for tracking and for targeting a capture."
      ]
    },
    "SP": {
      "note": "Find where the device transmits and confirm its channel plan. LoRa lives in narrow sub-GHz ISM bands, so an RTL-SDR is enough to watch a band (unlike 2.4 GHz work) — point it at the regional sub-band and look for the unmistakable diagonal chirp sweeps of CSS on the waterfall. Devices are duty-cycle limited and often transmit infrequently, so a survey may mean watching for a while; a real LoRaWAN gateway can log every channel at once if you have one.",
      "tools": [
        { "tool": "gqrx", "role": "Spectrum / waterfall view", "why": "See the live sub-GHz spectrum and spot the diagonal CSS chirps — confirm the band, channels and roughly how busy the network is. Cheap and quick on an RTL-SDR since LoRa sits well below 1.7 GHz.", "deps": ["rtl-sdr-v4", "hackrf-one"] },
        { "tool": "chirpcat", "role": "Gateway-fed discovery & classification", "why": "Electronic Cats’ LoRa/LoRaWAN platform running on a RAK WisGate Connect gateway: as it ingests every channel it clusters packets by RF characteristics and scores/classifies targets, giving a live picture of the LoRaWAN devices on the air before you commit to a target.", "caveat": "Needs a multi-channel gateway feed (the RAK WisGate Connect / SX1302); new project — verify maturity before relying on it.", "deps": ["rak-wisgate-connect"] }
      ]
    },
    "PHY": {
      "note": "No off-the-shelf hardware demodulator for LoRa CSS in this kit — you de-chirp it in software on an SDR. The receiver multiplies the incoming chirp by a reference down-chirp and takes an FFT, turning each symbol into a frequency bin it can read; doing this reliably (with timing and frequency-offset correction, at low SNR) is exactly what gr-lora_sdr implements. Because demodulating and framing happen together in the same software flow, the actual capture tools live at the next step."
    },
    "LL": {
      "note": "Capture the chirps and turn them into LoRaWAN frames. Two paths: de-chirp the CSS waveform off an SDR in software (gr-lora_sdr / lorattack), or — if you have gateway access — read whole LoRaWAN frames straight off a real concentrator, which captures every channel at once and sees both uplink and downlink. Either way you recover the PHYPayload and parse the LoRaWAN MAC: MHDR/MType, the FHDR with DevAddr, frame counter and options, and — for OTAA joins — the JoinEUI/DevEUI/DevNonce, which travel in clear. The application payload stays AES-128 encrypted until you have the keys. Export to a LoRaTap-tagged PCAP and dissect it in Wireshark.",
      "decoder": "wireshark",
      "tools": [
        { "tool": "gr-lora_sdr", "role": "Primary CSS demodulator", "why": "EPFL’s full GNU Radio LoRa transceiver: a complete CSS receiver with sync, timing and frequency-offset correction that decodes down to very low SNR — the reference open-source way to get LoRa frames off an SDR. Pick the radio by the band/bandwidth you need.", "caveat": "GNU Radio flowgraph setup; sample-rate must cover the 125/250/500 kHz bandwidth.", "deps": ["hackrf-one", "usrp-b210", "bladerf-2-micro", "rtl-sdr-v4"] },
        { "tool": "lorattack", "role": "LoRaWAN multi-channel sniffer", "why": "Purpose-built LoRaWAN assessment toolkit: multi-channel SDR sniffing with session-based capture, automatic handshake storage, and Wireshark-compatible PCAP output (LoRaTap DLT) — captures and organises the join/data frames you’ll crack and replay later.", "caveat": "Actively under construction; sniffer tested mainly at 125 kHz; USRP-oriented.", "deps": ["usrp-b210"] },
        { "tool": "chirpcat", "role": "Gateway frame capture (uplink + downlink)", "why": "With gateway access, ChirpCat reads whole LoRaWAN frames — both uplink and downlink — straight off a RAK WisGate Connect via the Semtech UDP packet forwarder, so you capture the full bidirectional exchange across every channel at once without an SDR de-chirp flow, and dispatch follow/capture tasks to CatSniffer workers.", "caveat": "Requires the RAK WisGate Connect gateway (or another SX130x concentrator running the Semtech packet forwarder); new project.", "deps": ["rak-wisgate-connect"] }
      ]
    },
    "CR": {
      "note": "Assess the LoRaWAN crypto. There is no feasible brute force of a random AES-128 AppKey — the weaknesses are in how keys and nonces are managed, and each assessment consumes a capture from the previous step. Check for: a default / shared / vendor-wide AppKey (if you can guess or recover it, you derive the session keys and decrypt everything); ABP devices with static, never-rotated session keys and a frame counter that resets on reboot; and on LoRaWAN 1.0.x, DevNonce reuse enabling join replay (1.1 closes this with a monotonic DevNonce, a Join Server and split keys). Where the AppKey is known or weak, derive the session keys and validate against the captured MIC.",
      "tools": [
        { "tool": "loracrack", "role": "Weak/shared AppKey exploit", "why": "PoC that, given a known, default or guessable AppKey, derives the session keys from captured join + data frames and validates via the MIC — demonstrates how a single reused AppKey across a fleet collapses confidentiality.", "deps": ["wireshark"], "needs": "A capture containing the OTAA join (and following data frames) from the Capture step, exported as PCAP from Wireshark, plus a candidate AppKey (default/leaked/guessed).", "caveat": "Exploits weak/reused keys; it does NOT brute-force a strong random AES-128 AppKey." },
        { "tool": "laf", "role": "Parse / analyse / crack", "why": "IOActive’s LoRaWAN auditing toolkit: craft, parse, analyse and crack LoRaWAN packets — recompute and check MICs, test key candidates, and pull apart the frames you captured to find management mistakes.", "deps": ["wireshark"], "needs": "Captured LoRaWAN frames (join + uplink/downlink) from the Capture step as PCAP." }
      ]
    },
    "AT": {
      "note": "Actively probe or take over, once you can read the frames. The classic LoRaWAN attacks are replay and forging: replay a captured uplink/join (especially against 1.0.x DevNonce or an ABP device whose frame counter resets) to cause acceptance, desynchronisation or denial of service; or, with recovered session keys, craft and inject valid frames. You can also fuzz the network server by transmitting malformed frames at it. These need transmit-capable hardware, not just an RX dongle — a CatSniffer can transmit on Sub-GHz/LoRa, and standing up a ChirpStack network server gives you a server side to replay or fuzz against and watch.",
      "tools": [
        { "tool": "lorattack", "role": "Replay & crafted-frame attacks", "why": "Beyond sniffing, it replays specific payloads to probe known LoRaWAN weaknesses and crafts packets for a session — the practical path to test replay/desync against a target from one toolkit.", "caveat": "Transmission features need more testing per the author; transmits — only against networks you are authorised to test.", "deps": ["usrp-b210"] },
        { "tool": "catsniffer", "role": "LoRa replay & transmit fuzzing", "why": "Because the CatSniffer’s CC1352 can transmit on Sub-GHz/LoRa, it can re-send captured frames to test replay (e.g. against a ChirpStack network server) and transmit malformed/mutated frames to fuzz how the server and devices handle them — an inexpensive transmit-capable LoRa attacker.", "caveat": "Single-channel LoRa transmit (not multi-channel); transmits — only against networks you are authorised to test.", "deps": ["chirpstack"], "needs": "Captured uplink/join frames from the Capture step to replay, and a target network server (e.g. a ChirpStack instance) to replay or fuzz against." },
        { "tool": "laf", "role": "Forge & send", "why": "Crafts and sends LoRaWAN packets (with valid MICs once keys are known) to test how the network server handles forged, replayed or malformed frames.", "deps": ["hackrf-one", "usrp-b210", "bladerf-2-micro"], "needs": "A transmit-capable SDR and, for valid-MIC frames, session keys recovered at the Break-the-crypto step." }
      ]
    },
    "AP": {
      "note": "Above the LoRaWAN MAC there is little universal protocol to attack — the application payload is just AES-128-encrypted bytes whose meaning is device-specific (a sensor reading, a command), and once you hold the AppSKey you decrypt and inspect it with the same tools that broke the crypto. The richer application surface is the network/application server itself (its API, integrations and downlink handling); standing up an open-source LoRaWAN server such as ChirpStack is the usual way to model that server side, but assessing a specific deployment’s app server is out of band for this RF toolchain."
    }
  }
};
