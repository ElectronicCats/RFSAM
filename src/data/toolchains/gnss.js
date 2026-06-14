export default {
  "status": "complete",
  "facts": [
    { "k": "Band", "v": "L-band. GPS L1 1575.42 MHz · L2 1227.60 MHz · L5 1176.45 MHz. Neighbours: GLONASS L1 ~1602 MHz, Galileo E1 1575.42 MHz (overlaps GPS L1), BeiDou B1 1561.098 MHz." },
    { "k": "Signal (GPS L1 C/A)", "v": "BPSK on a 1575.42 MHz carrier; 1023-chip C/A spreading code at 1.023 Mcps, repeating every 1 ms; navigation message at 50 bps. One PRN code per satellite (CDMA)." },
    { "k": "Constellations", "v": "GPS (US) · GLONASS (RU) · Galileo (EU) · BeiDou (CN), plus regional QZSS/NavIC. A receiver needs 4+ satellites in view to solve position and time." },
    { "k": "Security", "v": "Civilian signals (GPS C/A, GLONASS, BeiDou B1, Galileo E1 OS) are UNENCRYPTED and UNAUTHENTICATED — the signal structure is public and any receiver decodes it. Military P(Y)/M-code is encrypted but out of scope. Galileo OSNMA adds optional message authentication; legacy GPS C/A has none." },
    { "k": "Power at receiver", "v": "Extremely weak — about -125 to -130 dBm, below the thermal noise floor; recovered only by despreading the known PRN code. This is why an attacker's slightly stronger signal can capture a receiver." }
  ],
  "reference": null,
  "layers": {
    "IG": {
      "note": "Work out what GNSS the target consumes before touching the air — there is no capture yet. Most receivers track several constellations at once on L1, and some add L2/L5 for accuracy. The defining fact for security work: civilian signals carry no encryption and no authentication, so the entire attack surface is the receiver's trust in whatever signal it hears, not any secret it holds. Identify which bands/constellations the target uses, whether it has any spoofing/jamming mitigations, and how it behaves when the fix is lost.",
      "lookFor": [
        "Which constellations and bands the receiver tracks (GPS-only L1, or multi-constellation, or multi-band L1/L2/L5) — this sets which frequencies you survey and which signal you must synthesise to move it.",
        "That civilian signals are unauthenticated: GPS L1 C/A, GLONASS, BeiDou B1 and Galileo E1 OS are public, unencrypted spreading codes — there is no key to recover and no credential to forge, only a signal to imitate.",
        "Receiver chipset / module (FCC ID, teardown, NMEA vendor strings) — cross-reference known weaknesses and whether it implements any anti-spoof (RAIM, consistency checks) or anti-jam features.",
        "What the device does with time and position downstream (navigation, timestamping, a timing/PPS reference for a network or power grid) — this is what a spoof or jam actually disrupts.",
        "Whether it consumes any authenticated signal (Galileo OSNMA) or assistance data (A-GNSS) that changes the trust model.",
        "Behaviour on signal loss: does it coast, alarm, or silently accept the first plausible fix it reacquires — the latter is what a spoofer exploits."
      ]
    },
    "SP": {
      "note": "Confirm the L-band signal is actually present and judge the RF environment before you try to decode or attack it. GNSS sits around 1.2–1.6 GHz, so any SDR that reaches L1 (1575.42 MHz) can look — but the signal is buried below the noise floor, so on a waterfall you are not looking for the GNSS signal itself (you will not see it) but for what is wrong: a strong carrier or wideband hump on top of L1 means interference or a jammer; a clean, quiet band means a healthy environment. This step also sizes up the local RF: a jamming/interference survey before fieldwork, and a check that your active antenna and bias-tee are feeding signal.",
      "tools": [
        { "tool": "gqrx", "role": "Spectrum / interference survey", "why": "Tune to L1 (1575.42 MHz) and watch the waterfall to confirm a clean band and spot interference or jamming — a strong carrier or wideband energy over L1 is the tell, since the GNSS signal itself sits below the noise floor.", "caveat": "Cannot show the despread GNSS signal — it only reveals interference, carriers and noise. Needs an active GPS antenna; on the RTL-SDR enable the bias-tee to power it.", "deps": ["hackrf-one", "bladerf-2-micro", "usrp-b210", "rtl-sdr-v4"] }
      ]
    },
    "PHY": {
      "note": "No standalone GNSS demodulator in this kit. The GNSS physical layer — BPSK despread by the satellite's 1.023 Mcps PRN code — is recovered together with the navigation bits inside the software receiver, so demodulation and decoding live as one step at Capture. There is no point staring at the raw waveform: at about -128 dBm the signal is below the noise floor until the receiver correlates against the known code."
    },
    "LL": {
      "note": "Receive and decode a live GNSS signal. Feed raw L-band I/Q from an SDR into a software receiver, which acquires each satellite's PRN code, tracks it, decodes the 50 bps navigation message (ephemeris, almanac, time) and solves a PVT (position/velocity/time) fix. There is no Wireshark step here — the software receiver is both the demodulator and the decoder, and its output is a position/time solution (and NMEA/RINEX), not a packet capture. The radio is whatever SDR reaches L1; an active GPS antenna (and bias-tee power) is mandatory because the signal is so weak.",
      "tools": [
        { "tool": "gnss-sdr", "role": "Software GNSS receiver", "why": "The reference open SDR receiver: acquire, track, decode the navigation message and compute a PVT fix from live L1 (and L2/L5) for GPS, Galileo, GLONASS and BeiDou. Outputs position/time plus NMEA/RINEX/KML.", "caveat": "Needs an active GPS antenna and bias-tee power; correlation is CPU-intensive. RTL-SDR works for L1 but its ~2.4 MHz bandwidth and 8-bit ADC limit it to single-band C/A.", "deps": ["rtl-sdr-v4", "hackrf-one", "bladerf-2-micro", "usrp-b210"] }
      ]
    },
    "CR": {
      "note": "There is no crypto to break. Civilian GNSS signals — GPS L1 C/A, GLONASS, BeiDou B1, Galileo E1 OS — are unencrypted and unauthenticated by design: the spreading codes and message format are published, so any receiver can decode them and, equally, anyone can generate them. There is no session key to recover (as with BLE pairing) and no handshake to crack (as with WPA). The encrypted military P(Y)/M-codes are out of scope. The real resilience question is not confidentiality but trust: can the receiver tell a genuine satellite signal from a spoofed one? The industry answer is signal authentication — Galileo OSNMA cryptographically signs the navigation message, and modern receivers add consistency/RAIM checks — but legacy GPS C/A offers none, which is exactly why the Attack step works."
    },
    "AT": {
      "note": "Because the signal is unauthenticated, the attack is to imitate it. Two families, both AUTHORIZED and RF-CONTAINED testing only — transmitting GPS over the air is illegal in most jurisdictions, so work inside a shielded enclosure or over a cabled (conducted) path into the target receiver. SPOOFING synthesises a valid-looking GPS L1 C/A signal at higher power than the real satellites so the receiver locks onto it, letting you drag its reported position or clock to attacker-chosen values. JAMMING simply floods L1 with noise/carrier to deny any fix — useful for resilience testing of how the target degrades. Each technique names the TX-capable SDR it runs on (RTL-SDR is receive-only and cannot transmit).",
      "tools": [
        { "tool": "gps-sdr-sim", "role": "GPS spoofing (signal synthesis + TX)", "why": "Generates a GPS L1 C/A baseband from a RINEX ephemeris and a chosen static or moving track, then you transmit it on a TX-capable SDR; at higher power than the live sky it captures the receiver and moves its position/time. The canonical demonstration that unauthenticated C/A is trivially imitable.", "caveat": "RF-CONTAINED only (shielded/cabled) — over-the-air GPS TX is illegal. Half-duplex SDRs transmit; RTL-SDR cannot. Modern multi-constellation or OSNMA-aware receivers may detect or reject a single-constellation GPS-only spoof.", "deps": ["hackrf-one", "bladerf-2-micro", "usrp-b210"] },
        { "tool": "gqrx", "role": "Jamming-resilience survey", "why": "Before and during a jamming-resilience test, watch L1 to confirm the interference you are injecting and observe how it sits over the band — the receiver-side counterpart to seeing whether the target loses its fix.", "caveat": "Observation only — gqrx does not transmit. The jamming source itself is a TX-capable SDR driving a carrier/noise into the contained setup; gqrx just monitors it.", "deps": ["hackrf-one", "bladerf-2-micro", "usrp-b210"] }
      ]
    },
    "AP": {
      "note": "There is no application layer to attack over the air. A civilian GNSS signal is one-way broadcast: satellites transmit, receivers listen, and there is no uplink, no session and no per-receiver protocol to interact with — so the BLE/Wi-Fi notion of probing what the device trusts above the link does not apply on the RF side. Everything an attacker can influence is already decided at the signal level (Attack): once you control the position and time the receiver derives, you control every downstream system that trusts them — navigation, geofencing, timestamps, a PPS timing reference. The application-layer impact is therefore assessed in the victim system (does a false position/time cause unsafe behaviour?), not by attacking a GNSS protocol that has no interactive surface."
    }
  }
};
