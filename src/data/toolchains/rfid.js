export default {
  "status": "complete",
  "facts": [
    { "k": "Bands", "v": "LF 125 / 134 kHz · HF 13.56 MHz — near-field (magnetically coupled), no far-field radiation to survey" },
    { "k": "LF standards", "v": "EM4100/EM4102, HID Prox (125 kHz), Indala, T5577 (writable clone chip), HITAG — mostly read-only IDs with little or no crypto" },
    { "k": "HF standards", "v": "ISO 14443-A/B (MIFARE Classic, Ultralight, NTAG, DESFire, contactless EMV), ISO 15693 (iCODE/vicinity), FeliCa — 13.56 MHz" },
    { "k": "Crypto", "v": "MIFARE Classic uses Crypto1 (48-bit, broken: darkside/nested/hardnested, mfkey32). DESFire EV1/2/3 (AES/3DES) and modern NTAG/ICODE are not Crypto1-breakable." },
    { "k": "Range", "v": "Centimetres by design (a few cm typical, up to ~10 cm for HF; LF even shorter). Long-range reads need oversized antennas or a relay." }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Work out what the credential is before touching crypto. The first fork is the carrier frequency: a 125 kHz LF tag (EM4100, HID Prox) is a different world from a 13.56 MHz HF card (MIFARE, DESFire, NTAG). LF tags are usually fixed read-only IDs with no real security; HF cards range from trivially cloneable (MIFARE Classic) to genuinely strong (DESFire EV2 with AES). Identify the frequency, the standard, the chip family and the security mode, and you already know which steps below even apply.",
      "lookFor": [
        "Carrier frequency — LF 125/134 kHz vs HF 13.56 MHz. Decides every tool choice and is often printed on the reader or readable with a Proxmark autodetect.",
        "Standard / chip family — EM4100, HID Prox, Indala, HITAG (LF); ISO 14443-A/B MIFARE Classic, Ultralight, NTAG, DESFire, contactless EMV; ISO 15693 / FeliCa (HF). Cross-reference known issues (Crypto1 break, MIFARE Classic nested/hardnested, default keys).",
        "UID and whether it is fixed or changeable — 4-byte vs 7-byte; ‘magic’ Gen1a/Gen2 Chinese cards allow writing block 0 (the UID) for a full clone.",
        "For MIFARE Classic: which sectors are in use, and whether they still hold default/transport keys (FFFFFFFFFFFF, A0A1A2…, etc.) — a default key skips the whole crypto step.",
        "Security mode — open/read-only ID vs Crypto1-protected (MIFARE Classic) vs strong crypto (DESFire AES, modern NTAG with password/SUN). The latter resists the attacks below by design.",
        "Application data on the card — access-control facility/card number (HID Prox 26-bit Wiegand etc.), value blocks on transit/payment cards, NDEF records on NTAG."
      ]
    },
    "SP": {
      "note": "There is no far-field spectrum to survey: LF and HF are near-field, so ‘see it’ means powering the tag in the field and reading back its carrier, standard and chip. The reader IS the instrument here — a single command interrogates the card and tells you the frequency band, the modulation/standard and often the exact chip. Run the LF autodetect for 125 kHz tags and the HF autodetect for 13.56 MHz cards from the Proxmark client; the Chameleon (driven from its GUI app) can do the same field read when that is the hardware you have.",
      "tools": [
        { "tool": "pm3-client", "role": "Carrier / standard / chip ID", "why": "The `pm3` client's `lf search` and `hf search` energise the field through the Proxmark and fingerprint the tag — band, standard (EM4100, HID, ISO 14443-A, ISO 15693…) and chip type — in one command. The reference identification step for both bands.", "deps": ["proxmark3"] },
        { "tool": "chameleon-ultra-gui", "role": "Field read / ID", "why": "The Chameleon Ultra GUI app reads and fingerprints LF and HF tags from a pocket device when you don’t have a Proxmark to hand.", "caveat": "Card emulator first; its read/ID coverage is narrower than the Proxmark’s.", "deps": ["chameleon-ultra"] }
      ]
    },
    "PHY": {
      "note": "No standalone RFID demodulator in this kit and none needed: the reader’s analog front-end demodulates the load-modulated carrier and frames the bytes in hardware, so capture and demodulation are one step on the device itself. The client tools below pull the framed data off the reader — there is no separate I/Q or PHY stage to drive."
    },
    "LL": {
      "note": "Read or dump the tag’s data off the reader. For an LF ID this is the raw card number; for an HF card it is the per-sector/per-block contents (as far as the keys you hold allow). Pick the device you have: the Proxmark (driven from the pm3 client) reads and dumps both bands and is the most capable; libnfc drives a cheap USB PN532/ACR122U reader for HF MIFARE work; the Chameleon (via its GUI app) and BomberCat read HF cards standalone. There is no PCAP and no Wireshark here — the reader’s own client is the decoder.",
      "tools": [
        { "tool": "pm3-client", "role": "Primary reader / dumper", "why": "The `pm3` client reads and dumps LF IDs and HF cards across the widest range of standards through the Proxmark, and writes the dump to a file you carry into the crypto and attack steps. The default capture device.", "deps": ["proxmark3"] },
        { "tool": "libnfc", "role": "HF reader stack", "why": "The host library that drives a cheap PN532/ACR122U USB reader (`nfc-list`, `nfc-mfclassic`) to read and dump ISO 14443-A MIFARE cards without a Proxmark — and the engine the mfoc/mfcuk crackers run on.", "deps": ["acr122u"] },
        { "tool": "chameleon-ultra-gui", "role": "Pocket reader", "why": "The Chameleon Ultra GUI reads HF (and LF) cards standalone and stores them as slots, ready to replay/emulate at the attack step — capture and impersonation on one device.", "deps": ["chameleon-ultra"] },
        { "tool": "bombercat", "role": "NFC read / relay capture", "why": "PN7150-based reader for HF/NFC read and emulate, and the capture end of an NFC relay (RelayNFC) between a real card and a reader.", "deps": [] }
      ]
    },
    "CR": {
      "note": "This step is almost entirely MIFARE Classic. Its Crypto1 cipher is broken, so a card with non-default keys still falls: if you hold one known key for any sector, the ‘nested’ attack recovers the rest; with no known key, the ‘darkside’ attack bootstraps the first one; ‘hardnested’ handles hardened/EV1 Classic that resists plain nested; and mfkey32/mfkey64 recover a key from a sniffed reader↔card authentication. LF IDs need no cracking, and DESFire/modern NTAG (AES/3DES) are out of scope for these attacks — recognise them and stop.",
      "tools": [
        { "tool": "pm3-client", "role": "Full Crypto1 suite", "why": "The Iceman `pm3` client carries the complete toolkit driving one Proxmark: `hf mf darkside`, `nested`, `hardnested`, and `mfkey32`/`mfkey64` to recover a key from a sniffed reader transaction — then dumps the now-readable sectors.", "deps": ["proxmark3"], "needs": "Runs live against the card in the field (or against a reader→card transaction it sniffed). No external dump needed — it cracks and then reads the card itself." },
        { "tool": "mfoc", "role": "Nested attack (known key)", "why": "Offline MIFARE Classic cracker: given at least one known/default sector key it runs the nested attack to recover all remaining keys and dumps the card, on a cheap PN532 reader.", "deps": ["libnfc", "acr122u"], "needs": "A MIFARE Classic card present on a libnfc-driven PN532/ACR122U reader (from the Capture step), plus at least one known key — default/transport keys are tried automatically." },
        { "tool": "mfcuk", "role": "Darkside attack (no key)", "why": "Implements the darkside attack to recover a first sector key when none of the default keys work — the bootstrap that lets mfoc finish the rest.", "deps": ["libnfc", "acr122u"], "needs": "A MIFARE Classic card on a libnfc-driven PN532/ACR122U reader with no usable known key; pass the recovered key to mfoc (or the Proxmark) to dump the rest." }
      ]
    },
    "AT": {
      "note": "With the data and keys in hand, take over: clone the credential to a blank, emulate it from a programmable device, or relay a live card to a reader at distance. LF EM/HID IDs clone straight onto a T5577. HF MIFARE Classic dumps write onto a ‘magic’ Gen1a/Gen2 card (UID and all) or are emulated. A relay/MITM defeats the proximity assumption entirely — sit between the card and the reader, or relay a card the reader believes is right in front of it, without needing the card’s keys.",
      "tools": [
        { "tool": "pm3-client", "role": "Clone / write / simulate", "why": "The `pm3` client writes a recovered LF ID to a T5577 or an HF dump to a magic card for a physical clone, and can simulate a tag (`hf mf sim` / `lf … sim`) straight from the Proxmark.", "deps": ["proxmark3"], "needs": "The dump/keys from the Capture and Crypto steps, plus a writable blank (T5577 for LF, magic Gen1a/Gen2 for HF MIFARE Classic) for a physical clone." },
        { "tool": "pm3-client", "role": "NFC relay / MITM", "why": "Drives an ISO 14443-A relay/MITM through the Proxmark: `hf 14a sniff` eavesdrops the reader↔card exchange, and the `hf_reblay` standalone firmware mode relays a live card to a target reader (or sits between card and reader) — an attack that needs no keys at all. Two Proxmarks (mole + proxy) for a full end-to-end relay.", "deps": ["proxmark3"], "needs": "A live card and a target reader; for a full long-distance relay, a second Proxmark/host at the card end. No dump or recovered key required." },
        { "tool": "chameleon-ultra-gui", "role": "Emulate / impersonate", "why": "The Chameleon Ultra GUI emulates a full MIFARE Classic (Crypto1) and other HF/LF tags from stored slots — present the cloned credential to a reader with no blank card at all.", "deps": ["chameleon-ultra"], "needs": "A card dump loaded into a slot (read at the Capture step or cracked at the Crypto step)." },
        { "tool": "bombercat", "role": "Relay / MITM / MagSpoof", "why": "Relays an NFC transaction between a distant real card and a target reader (RelayNFC) — a card-present MITM that needs no keys — and replays magnetic-stripe tracks to legacy readers (MagSpoof).", "deps": [] }
      ]
    },
    "AP": {
      "note": "Above the bytes sits the application: the access-control facility/card number, transit value blocks, EMV records or NDEF data the dump actually encodes. Mostly this is reading meaning out of a recovered dump — the Proxmark client decodes many formats inline, and a dump parser turns a raw MIFARE Classic dump into human-readable sectors, keys and access bits so you can see and tamper with what the card asserts.",
      "tools": [
        { "tool": "mfdread", "role": "Dump parser", "why": "Renders a MIFARE Classic 1k/4k dump in human-readable form — per-sector data, keys A/B and the access-condition bits — so you can read off the application data and spot writable/value blocks.", "deps": ["pm3-client"], "needs": "A .mfd/.bin/.eml dump produced at the Capture/Crypto step by the Proxmark (or mfoc) — feed that file to mfdread." }
      ]
    }
  }
};
