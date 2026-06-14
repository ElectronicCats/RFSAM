export default {
  "status": "complete",
  "facts": [
    { "k": "Bands", "v": "GSM-850 / E-GSM-900 / DCS-1800 / PCS-1900 MHz — exact band depends on region (900/1800 in most of the world, 850/1900 in the Americas)" },
    { "k": "Channels", "v": "200 kHz carriers indexed by ARFCN; each carrier is TDMA-divided into 8 timeslots. Downlink and uplink are paired (FDD), spaced 45 MHz (900) / 95 MHz (1800)" },
    { "k": "Modulation", "v": "GMSK (0.3 BT Gaussian-filtered MSK) at 270.833 kbit/s; EDGE adds 8-PSK on top" },
    { "k": "Logical channels", "v": "BCCH broadcasts cell info · CCCH (PCH/AGCH/RACH) pages and grants · SDCCH carries signalling (incl. location updates, SMS) · TCH carries voice" },
    { "k": "Crypto", "v": "A5/0 none · A5/1 (64-bit stream cipher, broken by rainbow tables) · A5/2 (export-weak, deprecated/banned) · A5/3 & A5/4 (KASUMI block cipher, far stronger). Authentication is one-way (network never proves itself), enabling IMSI catchers" },
    { "k": "Identity", "v": "IMSI (permanent SIM identity) and TMSI (temporary, network-assigned). The IMSI is exposed on the air during attach / location update when no valid TMSI is held" }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Work out the cell and the target before any RF capture. GSM is a network you observe, not a single device: a base station (BTS) broadcasts a cell on a BCCH carrier, identified by its MCC/MNC/LAC/Cell-ID and the operator behind it. Most of what you need is read passively from the cell's own broadcasts, or from public references (operator band plans, cell-tower databases, the SIM's IMSI prefix). The headline weakness to confirm is which A5 cipher the cell runs and whether it ever sends the IMSI in the clear.",
      "lookFor": [
        "Band in use for the region (850/900/1800/1900) — sets which ARFCN range to scan and which radios reach it (RTL-SDR reaches GSM-900/850 and DCS-1800, but check its 1.766 GHz ceiling against PCS-1900).",
        "Cell identity from the BCCH: MCC (country), MNC (operator), LAC (location area) and Cell-ID — cross-reference operator and physical tower in OpenCellID / cell databases.",
        "Cipher in force: A5/0 (none), A5/1 (crackable), A5/2 (deprecated) or A5/3 (KASUMI) — readable from the Cipher Mode Command on the air; it decides whether the Break-crypto step is even feasible.",
        "Identities exposed: does the cell page by IMSI or by TMSI, and does it force an IMSI during location update? Frequent IMSI exposure is both a privacy finding and the signature of an IMSI catcher.",
        "Frequency-hopping: is the target channel hopping (a hopping sequence from the BCCH) — which complicates single-channel capture — or static.",
        "2G fallback context: is the device 2G-only, or a 4G/5G phone that can be downgraded to GSM? Downgrade is what makes legacy GSM attacks relevant in 2026."
      ]
    },
    "SP": {
      "note": "Find a live cell in the spectrum. A GSM carrier is 200 kHz wide and a downlink BCCH transmits continuously, so it shows up as a steady picket in the waterfall — but the reliable way to find cells is to scan for the FCCH/SCH synchronisation bursts every BTS sends, which also gives you each carrier's ARFCN, its signal strength and your radio's clock error (ppm). RTL-SDR is enough for GSM-900/850 and DCS-1800; PCS-1900 is right at the top of its range, so prefer a HackRF/bladeRF/USRP there.",
      "tools": [
        { "tool": "kalibrate-rtl", "role": "ARFCN / cell scanner", "why": "Sweeps a whole GSM band and reports every ARFCN with a live BTS, its power, and the ppm clock offset to feed back into the capture tools. The standard first move: it tells you exactly which channel to camp on.", "caveat": "The -rtl fork is RTL-SDR-specific; use a HackRF/UHD kalibrate fork for those radios.", "deps": ["rtl-sdr-v4", "hackrf-one", "bladerf-2-micro", "usrp-b210"] },
        { "tool": "gqrx", "role": "Spectrum / waterfall view", "why": "Eyeball the band to confirm the 200 kHz GSM pickets and judge signal quality before committing a capture — quick visual sanity check alongside the kalibrate scan.", "deps": ["rtl-sdr-v4", "hackrf-one", "bladerf-2-micro", "usrp-b210"] }
      ]
    },
    "PHY": {
      "note": "No standalone GSM demodulator in this kit — the GMSK burst demodulation (PHY) and the burst-to-frame decoding (LL) happen together in gr-gsm on the SDR, so they live at the Capture step. GSM packs 8 users into one 200 kHz carrier by TDMA, so 'capturing a channel' means demodulating the whole carrier and then picking out the timeslot and logical channel (BCCH/CCCH/SDCCH/TCH) you want."
    },
    "LL": {
      "note": "Capture and decode the GSM downlink. Tune the ARFCN that kalibrate found, let gr-gsm demodulate the GMSK bursts and decode the control channels, and it forwards each frame as GSMTAP over UDP straight into Wireshark — where you read the System Information, paging, assignment and SDCCH signalling. This is the workhorse path: ARFCN scan → grgsm_livemon → GSMTAP → Wireshark.",
      "decoder": "wireshark",
      "tools": [
        { "tool": "gr-gsm", "role": "Primary capture / demod", "why": "grgsm_livemon demodulates a found ARFCN and decodes BCCH/CCCH/SDCCH bursts, streaming GSMTAP to Wireshark in real time. The de-facto open-source GSM receiver (the successor to airprobe) — runs on any of the listed SDRs.", "caveat": "Downlink-focused and easiest on a non-hopping channel; following a hopping TCH or the uplink is materially harder.", "deps": ["rtl-sdr-v4", "hackrf-one", "bladerf-2-micro", "usrp-b210"] },
        { "tool": "imsi-catcher-detector", "role": "Identity extractor", "why": "Reads gr-gsm's GSMTAP stream and prints the IMSI/TMSI of phones the cell pages — the concrete demonstration of GSM's on-air identity exposure, and the basis for spotting an IMSI catcher that forces IMSIs.", "deps": ["gr-gsm"], "needs": "A live grgsm_livemon feeding GSMTAP on localhost (it consumes gr-gsm's output, not the radio directly) — so it bonds to gr-gsm at the Capture step." }
      ]
    },
    "CR": {
      "note": "Assess the cipher and, where it is the broken A5/1, recover the session key from the capture. GSM's A5/1 stream cipher has a public attack: precomputed rainbow tables (the Berlin A5/1 Security Project) recover the 64-bit session key Kc from a slice of known keystream, after which the rest of the captured call/SMS decrypts. This is real but heavy — it needs ~1.6–2 TB of tables, a known-plaintext keystream segment from the capture, and the target cell must actually run A5/1. A5/3 (KASUMI) is not broken this way. Recovering keys from live traffic you are not authorised to intercept is illegal in most jurisdictions — treat this as a lab/authorised-test technique.",
      "tools": [
        { "tool": "kraken-a51", "role": "A5/1 key recovery", "why": "Recovers the A5/1 session key Kc from a captured keystream segment using the rainbow tables; with Kc the captured A5/1 session decrypts. The reference open A5/1 cracker.", "caveat": "Needs the ~2 TB rainbow tables and a clean known-keystream slice; no effect on A5/3/A5/4 (KASUMI). Use only on traffic you are authorised to decrypt.", "deps": ["wireshark"], "needs": "An A5/1-encrypted capture with a recoverable known-keystream segment: capture the cell at the Capture step (gr-gsm → GSMTAP → Wireshark), isolate the burst/keystream, then feed it to Kraken alongside the rainbow tables." }
      ]
    },
    "AT": {
      "note": "Actively interfere or impersonate the network — AUTHORIZED testing only (a licensed lab / shielded enclosure with explicit permission). Because a GSM phone authenticates the network one-way only, a rogue BTS (IMSI catcher) can impersonate a real cell: out-broadcast the genuine BCCH, make handsets attach, force them to reveal their IMSI, and downgrade them to A5/0 or A5/1. The open tooling for standing up a test BTS (OpenBTS / OsmoBTS / YateBTS) sits outside this kit; the entry here is the passive detection counterpart, which needs no transmit.",
      "tools": [
        { "tool": "imsi-catcher-detector", "role": "IMSI-catcher detection", "why": "Run passively across cells to flag the behaviour of a rogue BTS — anomalous IMSI paging, missing ciphering, implausible cell parameters — so you can detect an active attack without transmitting anything yourself.", "caveat": "Detection/monitoring only; it does not impersonate a network. Standing up a test BTS requires separate tooling and explicit authorisation.", "deps": ["gr-gsm"], "needs": "A grgsm_livemon GSMTAP feed at the Capture step; it analyses that stream rather than driving the radio itself." }
      ]
    },
    "AP": {
      "note": "Above the link, GSM's 'app layer' is its signalling and bearer services rather than IP. Once SDCCH/TCH frames are decoded (and decrypted, where A5/1 was broken), the payloads to inspect are the L3 mobility/call-control messages and SMS — including silent/Class-0 pings used to locate a handset. There is no dedicated app-layer tool in this kit beyond the dissector: read the decoded GSM L3 and SMS layers directly in Wireshark on the GSMTAP capture from the Capture step.",
      "tools": [
        { "tool": "wireshark", "role": "L3 / SMS inspection", "why": "Dissects the decoded GSM signalling stack — Mobility Management, Call Control and SMS — straight from the GSMTAP capture, so you can read paging, location updates and SMS payloads without extra tooling.", "deps": ["gr-gsm"], "needs": "The GSMTAP capture produced at the Capture step (gr-gsm → Wireshark); inspect the GSM L3/SMS layers in the same Wireshark session." }
      ]
    }
  }
}
