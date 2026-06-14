export default {
  "status": "complete",
  "facts": [
    { "k": "Band", "v": "Licensed cellular — common bands ~700 MHz to 2.6 GHz (full E-UTRA set ~450 MHz–3.8 GHz); FDD and TDD duplexing" },
    { "k": "Bandwidth", "v": "Six channel widths: 1.4, 3, 5, 10, 15, 20 MHz; a carrier is identified by its EARFCN" },
    { "k": "Modulation", "v": "Downlink OFDMA, uplink SC-FDMA (DFT-spread OFDM); QPSK/16/64/256-QAM. Frame = 10 ms → 10 subframes (1 ms) → 2 slots (0.5 ms)" },
    { "k": "Cell ID", "v": "PSS gives N_ID(2) (0–2), SSS gives N_ID(1) (0–167); PCI = 3·N_ID(1) + N_ID(2) → 504 physical cell IDs (0–503)" },
    { "k": "Broadcast", "v": "MIB on PBCH (bandwidth, PHICH, SFN); SIB1 on PDSCH via SI-RNTI carries PLMN, cell ID, TAC. SIBs are broadcast in the clear" },
    { "k": "Control", "v": "PDCCH carries DCI, addressed by RNTIs (C-RNTI, SI-RNTI, P-RNTI for paging, RA-RNTI); blind-decoding the common search space passively exposes scheduling/identity activity" },
    { "k": "Security", "v": "Air crypto SNOW 3G / AES / ZUC keyed from the USIM’s operator secret (EPS-AKA) — not recoverable from a passive capture. User-plane encryption is optional per bearer; broadcast/paging are unprotected" }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Identify the cell and operator before any RF work — most of this is readable passively from what the network already broadcasts, no capture of user traffic. The goal is to know which operator’s cell you are looking at, on which band and bandwidth, and which identifiers and weaknesses are exposed in the clear. Treat all of this as licensed spectrum: receiving is one thing, but anything that transmits (Attack/App-layer steps) is for authorized testing on your own equipment only.",
      "lookFor": [
        "Band and EARFCN: which carrier frequency and band (e.g. B28/700 MHz, B20/800 MHz, B3/1800 MHz, B7/2.6 GHz) — this sets which radio can even tune it (a 1.766 GHz-capped RTL-SDR only reaches the low bands).",
        "PCI (Physical Cell ID, 0–503) from PSS/SSS — the cell’s RF fingerprint, and how you tell neighbouring cells apart.",
        "PLMN / operator identity (MCC+MNC) and TAC (Tracking Area Code) from SIB1 — which carrier owns the cell and which tracking area it sits in.",
        "System bandwidth and frame config from the MIB on PBCH (1.4–20 MHz) — sets how wide a capture you need.",
        "Known LTE/EPC weaknesses to cross-reference: pre-AKA messages are unauthenticated (the basis for IMSI catchers and fake-eNB downgrade/redirect), and SIB/paging leak configuration and S-TMSI in the clear.",
        "Whether the cell pages with S-TMSI (normal) or ever falls back to IMSI (a privacy weakness) — visible on the paging channel."
      ]
    },
    "SP": {
      "note": "Where is the cell and how wide is it? LTE lives in narrow licensed slices scattered from ~700 MHz to 2.6 GHz, and a channel is 1.4–20 MHz wide. First find the carrier: sweep the candidate bands, spot the steady OFDM ‘wall’ of a downlink carrier, and read its centre frequency (EARFCN) and width on a waterfall. A 20 MHz LTE carrier fits inside one HackRF view; for clean OFDM symbol recovery later, a wider, well-clocked SDR helps. RTL-SDR works only for the low bands — it stops near 1.766 GHz, below the 1.8–2.6 GHz carriers.",
      "tools": [
        { "tool": "gqrx", "role": "Spectrum / waterfall view", "why": "See the live spectrum and find the LTE downlink carrier — read its centre frequency (EARFCN) and bandwidth before committing a capture tool. A 20 MHz carrier fits in one view on a HackRF; wider SDRs show more context.", "deps": ["hackrf-one", "bladerf-2-micro", "usrp-b210", "signalsdr-pro", "rtl-sdr-v4"], "caveat": "RTL-SDR V4 stops near 1.766 GHz — only the low LTE bands (e.g. 700/800 MHz), not the 1.8–2.6 GHz carriers." }
      ]
    },
    "PHY": {
      "note": "No standalone LTE demodulator in this kit. Recovering the OFDM grid — synchronising on PSS/SSS, finding the PCI, then decoding PBCH/PDCCH/PDSCH — and framing the result happen together inside the cell-search tools, so they live at the Capture step. The PHY job here is a coherent capture: LTE is OFDM, so frequency/timing drift smears the subcarrier grid. A disciplined-clock SDR (e.g. the USRP B210’s GPSDO option) gives the stable reference that makes blind PDCCH and full-grid decode reliable; a free-running HackRF can still do cell search and MIB/SIB but is twitchier on the control channel."
    },
    "LL": {
      "note": "Capture and decode the broadcast and control channels. Synchronise on the carrier, lock the PCI from PSS/SSS, decode the MIB on PBCH for bandwidth and frame number, then read the SIBs (PLMN, cell ID, TAC, scheduling) and watch paging. All of this is the network shouting in the clear — you are reading broadcast and control information, not user data. Pick a tool: srsRAN for an end-to-end cell-search + MIB/SIB receiver, FALCON or LTESniffer to focus on the PDCCH control channel, or gr-lte for a GNU Radio flowgraph. The captured RRC/MAC frames dissect in Wireshark over GSMTAP / MAC-LTE.",
      "decoder": "wireshark",
      "tools": [
        { "tool": "srsran-4g", "role": "Cell search + MIB/SIB receiver", "why": "srsUE’s cell-search and pcap modes do the full passive chain — PSS/SSS → PCI, MIB on PBCH (bandwidth, SFN), then SIB1+ (PLMN, cell ID, TAC) — and write a MAC-LTE/RRC PCAP. The reference open SDR LTE stack. Pick the SDR by how cleanly you need the OFDM grid: the GPSDO-disciplined USRP B210 is steadiest.", "deps": ["usrp-b210", "bladerf-2-micro", "signalsdr-pro", "hackrf-one"] },
        { "tool": "falcon", "role": "PDCCH control-channel analysis", "why": "Built on srsRAN to blind-decode the whole PDCCH in real time — every DCI/RNTI scheduling grant in the cell — exposing the live control-channel and resource-usage picture passively. The fastest way to see PDCCH activity.", "deps": ["usrp-b210", "bladerf-2-micro", "signalsdr-pro", "hackrf-one"], "caveat": "Research tool; needs a fast host. Blind PDCCH decode benefits from a disciplined-clock SDR." },
        { "tool": "ltesniffer", "role": "Downlink/uplink eavesdropper", "why": "Decodes PDCCH DCIs and the scheduled PDSCH/PUSCH for both directions of a cell, recovering RNTIs and per-UE scheduling — a focused passive eavesdropper for control and (unciphered) traffic exposure.", "deps": ["usrp-b210"], "caveat": "Authorised testing only — it recovers other users’ control/scheduling info. Wants a USRP-class disciplined radio; uplink capture needs the right RF setup." },
        { "tool": "gr-lte", "role": "GNU Radio LTE receiver", "why": "A GNU Radio flowgraph that synchronises, estimates the channel and decodes the PBCH end-to-end — the choice when you want to see and modify each DSP block of the receiver.", "deps": ["usrp-b210", "bladerf-2-micro", "hackrf-one"], "caveat": "Older codebase (last active ~2020); a learning/PBCH receiver rather than a full SIB/PDCCH suite." }
      ]
    },
    "CR": {
      "note": "There is nothing to crack from a passive capture. The interesting LTE identifiers and configuration — PCI, PLMN, TAC, SIBs, paging S-TMSI, PDCCH scheduling — are broadcast or sent in the clear and are read, not decrypted, at the Capture step. The actual air-interface ciphering (SNOW 3G / AES / ZUC) and integrity protection are keyed by EPS-AKA from the secret on the USIM, shared only with the operator’s core; without that key a recording yields no session key offline, and there is no weak-pairing shortcut equivalent to BLE Just Works or WPA2. Recovering user-plane content means becoming the network (the Attack step) on equipment you are authorised to test, not breaking the ciphered capture."
    },
    "AT": {
      "note": "Going active means transmitting in licensed cellular spectrum and impersonating a carrier — do this ONLY on your own equipment, with your own test SIMs, inside RF shielding (a Faraday enclosure or conducted setup), under an authorised test licence. Never radiate on a live operator’s band. With that constraint, the classic test is a rogue/fake eNodeB: stand up your own cell on a test EARFCN with a higher signal level so your test UE reselects to it, then exercise the pre-authentication messages an attacker would — an IMSI/identity-request (IMSI-catcher behaviour, since the early NAS exchange is unauthenticated), or downgrade/redirect attempts. The same rig is how you reproduce and validate fake-base-station defences.",
      "tools": [
        { "tool": "srsran-4g", "role": "Rogue / test eNodeB", "why": "srsENB stands up a full LTE cell on an SDR — your own PCI, PLMN and SIBs on a test EARFCN — so a test UE camps and you can drive the attach/identity exchange. The reference platform for fake-eNB and IMSI-catcher research.", "deps": ["usrp-b210", "bladerf-2-micro", "signalsdr-pro"], "needs": "A full-duplex TX-capable SDR (B210/bladeRF/SignalSDR), a test UE with a known/programmable SIM, and an EPC core (Open5GS or srsEPC) behind it. Authorised, RF-contained testing only.", "caveat": "Transmits in licensed spectrum — authorised lab/shielded use only." },
        { "tool": "open5gs", "role": "EPC core behind the test cell", "why": "Provides the MME/HSS/SGW/PGW the eNodeB needs to run the attach, authentication and NAS procedures end-to-end, so you can control HSS subscriber data and observe/steer the identity exchange your rogue cell triggers.", "deps": ["usrp-b210", "bladerf-2-micro", "signalsdr-pro"], "needs": "Runs on the host and pairs with the srsENB rogue cell above; configure it with your test PLMN and test-SIM credentials. Authorised testing only." }
      ]
    },
    "AP": {
      "note": "Above the air link, LTE’s ‘application layer’ is the NAS / EPC signalling — attach, authentication, identity and tracking-area procedures between the UE and the core. You can only exercise these by being the network: with your own eNodeB + core (the Attack step) and an authorised test UE, drive and inspect the NAS exchange — watch the IMSI/S-TMSI handling, force re-authentication or identity requests, and test how the device behaves under hostile core signalling. This is end-to-end control-plane testing of the device-to-network trust, done on equipment you own and are authorised to operate.",
      "tools": [
        { "tool": "open5gs", "role": "EPC / NAS test harness", "why": "A full EPC (MME/HSS/SGW/PGW) you control: provision test subscribers in the HSS and drive the attach/auth/identity NAS procedures to probe how a UE handles the control plane — the platform for app-/control-layer LTE testing once your own cell is up.", "deps": ["usrp-b210", "bladerf-2-micro", "signalsdr-pro"], "needs": "Pairs with the srsRAN rogue/test eNodeB and a TX-capable SDR; configure your test PLMN and test-SIM credentials. Authorised testing only.", "caveat": "Requires running your own radiating cell — authorised, RF-contained use only." }
      ]
    }
  }
};
