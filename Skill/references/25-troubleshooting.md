# 25 — Troubleshooting RF

> Diagnosis when a descent phase is not progressing. Use it **before** declaring a gap (Route A) or escalating
> (CONSULT): most "it doesn't work" cases are environment (permissions/drivers/antenna), not lack of signal or
> crypto strength. Source: §1 (setup), §2 (diagnosis), §3 (order of diagnosis), §4 (false positives).

## Index
1. §setup — 5 environment checks (Phase 0, cache result in `loot/notes/hardware.txt`)
2. §diagnosis — symptom → probable cause → action table
3. §order — diagnosis rule (antenna before driver before binary)
4. §false-positives — finding that looks confirmed but is not

---

## 1. §setup — 5 environment checks (Phase 0)

One command per check, no external dependencies. The result is cached in `loot/notes/hardware.txt`
(re-read at each axis 4 of the decision tree, not re-run per command except TX).

### 1.1 Host software

```sh
for t in gqrx wireshark hackrf_transfer rtl_sdr dump1090 readsb dump978 \
         rtl_433 kalibrate-rtl gr-gsm gnss-sdr rtl_biast ubertooth-util \
         crackle sniffle catnip whad bettercap killerbee whsniff kismet \
         aircrack-ng hcxdumptool hcxpcapngtool hashcat pm3 libnfc mfoc \
         mfcuk rfcat universal-radio-hacker chirpcat qcsuper srsran open5gs \
         gpsd ubxtool; do
  command -v "$t" >/dev/null 2>&1 && echo "OK  $t" || echo "MISS $t"
done
```

`MISS` → do not abort; consult the protocol wayfinder for an RX substitute. If none exists, declare a gap (Route A).

### 1.2 Connected hardware (USB bus)

```sh
lsusb
ls /dev/ttyACM* /dev/ttyUSB* 2>/dev/null
ls /sys/class/net
```

Map vendor:product to slug using `references/02-kit-sdr.md` (field `spec`). Key markers:

| Hardware | vendor:product | Notes |
|----------|----------------|-------|
| HackRF One | `1d50:6089` | |
| bladeRF 2.0 | `1d50:6130` | |
| USRP B210 | `2500:0020` | |
| RTL-SDR V4 | `0bda:2838` | `rtl_test -t` validates sample rate |
| CatSniffer (EC) | `1207:8000` | `/dev/ttyACM0` after firmware |
| nRF52840 dongle | `1915:xxxx` | Nordic |
| Proxmark3 (Iceman) | `2d2d:504d` | |
| ACR122U | `072f:2200` | |
| Chameleon Ultra | `1915:c00a` | |
| Ubertooth One | `1d50:6000` (enum) / `1d50:6001` (op) | |
| Yard Stick One / CC1111 | `1d50:605b` | `/dev/ttyACM*` |
| ESP32-family | `303a:xxxx` (S3) / `10c4:ea60` (CP210x) | |
| Flipper Zero | `0483:df11` (DFU) / `0483:5740` (CDC) | |
| GPS u-blox NEO | — | `$GPGGA`/`$GNGGA` frames readable on `/dev/ttyACM*` |

### 1.3 Permissions and drivers

```sh
# 1. Hardware access groups
groups | grep -Eo 'dialout|plugdev|uucp|tty|video' | sort -u

# 2. udev rules loaded
ls /etc/udev/rules.d/ | grep -Ei 'hackrf|rtl-sdr|rtlsdr|proxmark|ubertooth|cat|nordic|cp210|cdc-acm'

# 3. Drivers/modules loaded
lsmod | grep -Ei 'rtl2832|hackrf|bladerf|usbserial|cp210|cdc_acm|option|ftdi'

# 4. RF blocks (kill switches — critical on WiFi/BT)
rfkill list
```

- **Missing group** (`dialout`/`plugdev`) → binary opens but device returns `Permission denied`. Action: `usermod -aG` + relogin.
- **Missing udev rule** → device shows up as `root:root`. Action: verify package or copy the rule from the manufacturer's repo.
- **Missing driver** (`lsmod` empty) → `dmesg | tail -50` shows connection without bind. Action: USB reinsertion or `modprobe <driver>`.
- **`rfkill` blocks** → `sudo rfkill unblock all` or physical switch. Some marauder firmwares do not survive a soft-block.

### 1.4 Antenna and bias-T (RF-critical)

Connected hardware ≠ captured signal. The agent cannot physically verify the antenna — **ask the operator**.

| Signal | Requirement | Symptom if missing |
|--------|-------------|---------------------|
| GNSS L1 | `rtl_biast -b 1` (bias-T ~5 V to active antenna) | `gqrx` shows flat noise at -90 dBm even with antenna connected |
| ADS-B 1090 | Quarter-wave antenna (~6.9 cm) + filter + LNA | `dump1090` reports 0 messages/min |
| sub-GHz / GSM-850/900 | Telescopic or tuned dipole antenna | `gqrx` shows pure thermal noise |
| 2.4 GHz ISM | 2.4 GHz dipole antenna | SDR without antenna picks up BT/Wi-Fi by coupling, but 5–10 dB below |
| UWB (6.5/8 GHz) | No radio in the kit reaches it | Declare visibility gap, no check applicable |

### 1.5 Disk space and network

```sh
df -h "$LOOT_DIR"          # Typical IQ: 2-8 MB/s; BLE PCAP: 200 KB/s
ip -br link show           # avoid capturing host traffic
ip route show default      # if the audit is offline, confirm isolation
```

- **Space < 5 GB free** → long capture aborts. Clean up or compress (`rtl_sdr -s 2400000 - | gzip > file.iq.gz`).
- **WiFi monitor on wrong interface** → `tshark -i <iface>` confirms target BSSID; if capturing in managed mode, the PCAP is useless.

---

## 2. §diagnosis — symptom → probable cause → action table

### 2.1 Hardware not detected / permissions

| Symptom | Probable cause | Action |
|---------|----------------|--------|
| `lsusb` does not list the SDR | USB cable / port / insufficient power (HackRF+amp) | Another USB 3.0 port; external power if amp present; `dmesg -w` on connect |
| SDR in `lsusb` but binary returns `Permission denied` | Missing `dialout`/`plugdev` group or udev rule | §1.3; `usermod -aG dialout,plugdev $USER` + relogin; reinstall package to copy udev rule |
| `/dev/ttyACM0` does not appear (CatSniffer/PM3/nRF) | Firmware not loaded, data-only cable, CDC-ACM driver | `dmesg \| grep tty`; restart device in bootloader mode; `modprobe cdc_acm` |
| `rtl_test` fails with "No supported devices found" | RTL2832 driver not loaded or device claimed by another process | `lsmod \| grep rtl2832`; kill process holding the device (old SDR#, another `rtl_*`) |
| `rfkill list` shows "Soft blocked: yes" on WiFi/BT | OS or hardware kill switch | `sudo rfkill unblock all`; check laptop physical switch |
| Proxmark3 `pm3` client not detected | Iceman firmware not flashed, wrong port | `ls /dev/ttyACM*`; flash Iceman firmware; `pm3 -p /dev/ttyACM0` explicitly |
| Ubertooth does not enumerate | DFU mode or corrupt firmware | `ubertooth-util -v` for version; reflash with `ubertooth-programmer` |

### 2.2 Signal not visible / defective capture

> **Diagnosis rule (§3)**: on "I can't see the signal", check in THIS order — antenna (§1.4) → gain/overflow (here) → driver (§1.3) → binary (§1.1) → band gap. Antenna and gain explain 80% of cases.

| Symptom | Probable cause | Action |
|---------|----------------|--------|
| `gqrx` shows flat noise with hardware OK | Antenna absent/incorrect, bias-T off (GNSS), mistuned dipole | §1.4 first; `rtl_biast -b 1` for GNSS; ask operator about connected antenna |
| Waterfall flat at 0 dBFS (clipping) | Excessive gain saturates the ADC | Lower gain: RTL-SDR `-g 40–49`; HackRF `-a 1 -l <lna> -g <vga>` adjusted |
| Signal buried in noise floor | Insufficient gain | Raise gain gradually; check external LNA (ADS-B 1090) |
| Partial capture of 80/160 MHz Wi-Fi channel | SDR IBW does not cover it | HackRF ~20 MHz cannot see full channel → bladeRF/USRP or declare limitation |
| `hackrf_transfer`/`rtl_test` reports drops/overflows | Sample rate exceeds USB/host I/O | Lower sample rate; close other processes; SSD vs HDD; direct USB 3.0 (no hub) |
| OFDM grid recovery fails (LTE/5G NR) | No GPSDO lock | `uhd_usrp_probe ... clock_source=gpsdo`; obtain a GPSDO or declare gap |
| `dump1090` reports 0 messages/min | 1090 antenna without LNA/filter or bad orientation | §1.4 ADS-B; vertical quarter-wave antenna + LNA + 1090 filter |
| Sniffle does not follow established BLE connection | Access Address not set correctly | Set AA **after** CENTRAL (flush); advertisements during INITIATING reset to the advertising AA and break data PDU decoding |
| Ubertooth captures BT Classic garbage | Hop not followed, unknown LAP | BR/EDR hop at 1600 h/s — only `esp32_bluetooth_classic_sniffer` or Ubertooth follow by known LAP |
| RFID: reader does not read tag | Active mode in observational, tag absent from field | In observational/defensive use `hf 14a sniff` (passive, does not power); `hf mf autopwn` is active |

### 2.3 Analysis does not decode (offline CR)

| Symptom | Probable cause | Action |
|---------|----------------|--------|
| Wireshark shows massive "Malformed packet" | Wrong decoder or corrupt capture | Confirm correct dissector: BTBR/BLE/802.15.4/LoRaTap/GSMTAP. Old Wireshark version → update |
| `crackle` fails: "no STK found" | Pairing is not in the PCAP | The pairing event was missed in the capture — re-capture SP/PHY+LL during bonding; it is not crypto strength |
| `hashcat -m 22000` does not load | PCAP without complete PMKID/EAPOL | Re-capture; clientless PMKID chain `hcxdumptool` → `hcxpcapngtool` requires client interaction |
| `kraken` A5/1 does not find the key | Insufficient keystream or BB-.tables not indexed | Capture more traffic; verify BB tables `index` (~2 TB); do not dismiss crypto strength |
| `hf mf autopwn` does not recover keys | Tag distance/angle, unknown key | Try `hf mf list` + `mfkey32/64` from reader sniff; distance 1-3 cm; MIFARE Plus tag evades Classic |
| Analysis on PCAP with overflows ≠ 0 | Base capture silently incomplete | Re-capture (safe-capture §4); overflows cause garbage to be decoded and presented as a finding |
| Conclusion without cited artifact | Floating opinion, not evidence | Every conclusion cites `loot/captures/...` + command; artifact→finding mapping mandatory |

---

## 3. §order — diagnosis rule

On "I can't see / it doesn't work", do NOT declare a gap immediately. Follow this order:

1. **Antenna** (§1.4) — is it connected and correct for the band? `gqrx` with flat noise + hardware OK = antenna first.
2. **Gain/overflow** (§2.2) — is it saturating or buried? Adjust before declaring "no signal".
3. **Driver/permissions** (§1.3) — does the device open? `Permission denied` ≠ broken hardware.
4. **Binary/decoder** (§1.1, §2.3) — are the right tool and decoder present? `which`, Wireshark version.
5. **Band** — does the radio reach the frequency? RTL-SDR cannot see 2.4 GHz; UWB 6.5/8 GHz is not covered by any radio in the kit.
6. **Only then** → declare a visibility gap in `loot/notes/gaps.md` (Route A) or escalate (CONSULT).

> Antenna and gain explain ~80% of "I can't see the signal". A gap declaration without having checked antenna+gain
> is a false negative.

---

## 4. §false-positives — finding that looks confirmed but is not

Before registering, discard the typical false positive of the pattern (see §4 below, "Typical false positive"
column per family). Cross-cutting cases:

| Symptom (looks like a finding) | Typical false positive | Verification |
|---------------------------------|------------------------|--------------|
| Crack failed → "strong crypto" | The pairing/join/handshake event **was not** in the capture (capture gap, not strength) | Re-capture; confirm the event is present in the PCAP before attributing to strength |
| Decoding produces garbage | Base capture with overflows ≠ 0 (silently incomplete) | Check overflow counters in the wrapper; re-capture if > 0 |
| "Unknown signal" in survey | Local interference (your own router, microwave, host Bluetooth) | Turn off host BT/Wi-Fi; correlate with time; move antenna |
| "Discovered" cleartext traffic | Wrong decoder shows readable bytes by coincidence | Confirm dissector; validate against protocol length/checksum |
| GNSS C/N0 anomaly | Urban multipath or legitimate jamming (military radar) | Correlate with time/location; do not report spoof without observed forge |
| "BLE from unknown device" | The operator's own device/environment | Correlate against inventory before labeling as stalking |

> **"Not observed" under a finite window is a visibility gap, not evidence of absence.** But "observed" can also
> be a false positive if the base capture is corrupt or the decoder does not match. Verify both extremes before
> registering.

---

## 5. Mapping to downstream phases

- **SKILL.md Phase 0** cites §setup as the body of the environment check.
- **SKILL.md Route B** cites §diagnosis as the step before escalating.
- **Wayfinders** (`references/NN-proto.md`) may cite "see troubleshooting §2.2" for the specific family.
- **Phase 7.1 (validation):** every "it doesn't work" documented in `loot/notes/` must reference §order — without
  that order traversed, the gap is weak.
