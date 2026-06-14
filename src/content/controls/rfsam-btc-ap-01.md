---
id: RFSAM-BTC-AP-01
title: Enumerate and exercise exposed BR/EDR profiles
protocol: BTC
layer: AP
criticality: medium
applicability:
  - Bluetooth Classic
  - BR/EDR
deferred: true
objective: >-
  Determine which services and profiles a Bluetooth Classic (BR/EDR) device
  exposes above the link — the SDP service directory, RFCOMM serial/AT-command
  channels, HID, A2DP/HFP audio and OBEX object exchange — and verify what the
  device trusts on those profiles without (or before) authentication.
intro: >-
  Above the BR/EDR link sits the application surface: the profiles a device
  publishes in its SDP directory and the channels behind them. RFSAM owns the
  RF prerequisite — reaching the device's host stack over the air with a standard
  adapter — and drives enumeration from a Linux BlueZ host, while the
  service-access-control finding (which profiles must demand authentication) is
  assessed under BSAM (BSAM-SE-03). BlueBorne is the canonical reminder that this
  layer is reachable: it is a host-stack attack family that lands over the same
  Bluetooth surface without pairing or discoverable mode.
prerequisites:
  hardware:
    - 'A standard USB Bluetooth adapter (BR/EDR-capable Class 1 or 2 dongle) on a Linux host'
  software:
    - 'Linux with the BlueZ stack: bluetoothctl, sdptool, l2ping, plus profile tools such as obexftp and the hcitool/btmgmt utilities'
  signal:
    freq: '2.402–2.480 GHz (79 RF channels × 1 MHz, adaptive frequency hopping ~1600 hops/s)'
    bandwidth: '1 MHz per RF channel'
    modulation: 'GFSK 1 Mbps (Basic Rate); π/4-DQPSK 2 Mbps & 8DPSK 3 Mbps (EDR)'
  skill: intermediate
attacks:
  - name: 'BlueBorne (BlueZ SDP info leak)'
    cve:
      - CVE-2017-1000250
    refs:
      - armis2017blueborne
      - cve-2017-1000250
    impact: Remote attacker reads sensitive bytes out of the bluetoothd process memory via crafted SDP search-attribute requests — no pairing required.
    preconditions: A reachable BR/EDR host running a vulnerable BlueZ SDP server (5.46 and earlier); the device need not be discoverable, only addressable.
    summary: >-
      Out-of-bounds read in the BlueZ SDP server reached over the same service
      directory this control enumerates — the SDP surface is itself attack
      surface, not just a map of it.
  - name: 'BlueBorne (Linux L2CAP kernel RCE)'
    cve:
      - CVE-2017-1000251
    refs:
      - armis2017blueborne
      - cve-2017-1000251
    impact: Remote code execution in Linux kernel space via a stack overflow in L2CAP configuration-response handling — full host compromise over the air.
    preconditions: A reachable Linux BR/EDR host on kernel 2.6.32–4.13.1; no pairing or discoverable mode needed.
    summary: >-
      The canonical above-the-link Bluetooth Classic takeover: a host-stack
      overflow reached over L2CAP, the transport every profile in this control
      rides on.
  - name: 'BlueBorne (Android Bluetooth RCE / info leak)'
    cve:
      - CVE-2017-0781
      - CVE-2017-0785
    refs:
      - armis2017blueborne
      - armis2017blueborne-poc
      - cve-2017-0781
      - cve-2017-0785
    impact: Remote code execution and information disclosure in the Android Bluetooth stack reachable over the air on Android 4.4.4–8.0.
    preconditions: A reachable, unpatched Android BR/EDR host; no pairing or discoverable mode needed.
    summary: >-
      The Android arm of BlueBorne — the same host-stack-over-profiles class on a
      different OS — with Armis-published proof-of-concept exploit code.
references:
  - key: armis2017blueborne
    title: 'BlueBorne Technical White Paper'
    authors: 'B. Seri, G. Vishnepolsky (Armis Labs)'
    venue: Armis
    year: 2017
    url: 'https://info.armis.com/rs/645-PDC-047/images/BlueBorne%20Technical%20White%20Paper_20171130.pdf'
    type: paper
  - key: armis2017blueborne-poc
    title: 'BlueBorne — PoC scripts demonstrating the BlueBorne vulnerabilities'
    authors: Armis Security
    venue: GitHub
    year: 2017
    url: 'https://github.com/ArmisSecurity/blueborne'
    type: tool
  - key: cve-2017-1000250
    title: 'CVE-2017-1000250: BlueZ SDP server information disclosure (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-1000250'
    type: cve
  - key: cve-2017-1000251
    title: 'CVE-2017-1000251: Linux kernel L2CAP stack overflow / RCE (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-1000251'
    type: cve
  - key: cve-2017-0781
    title: 'CVE-2017-0781: Android Bluetooth remote code execution (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-0781'
    type: cve
  - key: cve-2017-0785
    title: 'CVE-2017-0785: Android Bluetooth information disclosure (BlueBorne)'
    venue: NVD
    year: 2017
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-0785'
    type: cve
  - key: bluez-project
    title: 'BlueZ — the official Linux Bluetooth protocol stack (sdptool, l2ping, bluetoothctl)'
    authors: BlueZ project
    venue: GitHub
    year: 2026
    url: 'https://github.com/bluez/bluez'
    type: tool
tools:
  - usb-bt-dongle
bsam:
  - BSAM-SE-03
resources:
  - RFSAM-RES-29
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Bluetooth Classic exposes its application surface through profiles, and every profile is advertised in the Service Discovery Protocol (SDP) directory. Querying SDP returns the device's service records — each naming a profile (Serial Port / RFCOMM, HID, A2DP, HFP/HSP, OBEX Object Push, PBAP, and so on) and the L2CAP PSM or RFCOMM channel behind it. SDP is therefore the map of what the device trusts above the link, and enumerating it is the first move at this layer. The standard driver is a Linux host's BlueZ stack over a commodity USB adapter — the same host workflow BSAM's Bluetooth controls assume — so RFSAM owns only the RF prerequisite (reaching the device's host stack over the air) and defers the service-access-control judgement (which of those profiles may be reached without authentication) to BSAM-SE-03 (bluez-project).

The reason this layer matters is that the SDP directory is not merely descriptive — it is reachable, and so is everything behind it. **BlueBorne** is the canonical demonstration: a family of host-stack vulnerabilities reached over Bluetooth without pairing and without the target being discoverable (armis2017blueborne). On Linux the SDP server itself leaks `bluetoothd` process memory through crafted search-attribute requests (CVE-2017-1000250), and the kernel L2CAP layer that every profile rides on can be driven to remote code execution (CVE-2017-1000251) (cve-2017-1000250, cve-2017-1000251). The Android arm of the same family adds RCE (CVE-2017-0781) and an information leak in the Android Bluetooth SDP server (CVE-2017-0785), with proof-of-concept code published by Armis (armis2017blueborne-poc, cve-2017-0781, cve-2017-0785). The SDP framing of CVE-2017-0785 is Armis's own: NVD records it simply as an Android Bluetooth information-disclosure issue, while the Armis PoC `android/` exploit uses it explicitly as "the SDP Information leak vulnerability (CVE-2017-0785) to bypass ASLR" ahead of the CVE-2017-0781 RCE (armis2017blueborne-poc). Treat this CVE set as representative of the above-the-link/host-stack class, not as a current advisory list — check vendor advisories for the target's controller SoC and host OS before testing.

## Procedure

> Authorised testing only — enumerate and exercise profiles solely on devices you own or are explicitly contracted to assess. SDP browsing is passive, but pairing, RFCOMM connection and OBEX transfer are active interactions with the target's host stack.

1. Bring up the local adapter and confirm it is a BR/EDR controller:
   ```bash
   sudo hciconfig hci0 up
   hciconfig hci0 version    # check "BR/EDR" and the HCI/LMP version
   ```
   You want a controller that reports BR/EDR (not an LE-only dongle).

2. Discover the target and record its BD_ADDR and Class of Device (the IG/SP work feeds this — you may already have the address):
   ```bash
   bluetoothctl
   [bluetooth]# scan on
   # note the BD_ADDR (e.g. AA:BB:CC:DD:EE:FF), name and CoD, then:
   [bluetooth]# scan off
   ```

3. Confirm L2CAP reachability of the host stack (works even against a non-discoverable device whose BD_ADDR you already know):
   ```bash
   sudo l2ping -c 5 AA:BB:CC:DD:EE:FF
   ```
   Replies confirm the BR/EDR host is up and answering — the prerequisite for everything below.

4. Enumerate the SDP service directory — the core of this control:
   ```bash
   sdptool browse AA:BB:CC:DD:EE:FF
   ```
   Read the output for service records: each lists a `Service Name`, the profile (`Serial Port`, `Human Interface Device`, `Advanced Audio`, `Handsfree`, `OBEX Object Push`, …), and the `RFCOMM` channel or L2CAP `PSM` behind it. This is the inventory of what the device exposes above the link.

5. For each interesting profile, exercise what the device trusts. Examples:
   - **RFCOMM serial / AT command channel** (common on hands-free and car/OBD units): bind the channel SDP reported and probe it.
     ```bash
     sudo rfcomm connect /dev/rfcomm0 AA:BB:CC:DD:EE:FF 1   # channel from sdptool
     # in another terminal:
     screen /dev/rfcomm0 115200
     AT                                                     # does the unit answer AT commands?
     ```
   - **OBEX Object Push** (does it accept files without authorisation?):
     ```bash
     obexftp -b AA:BB:CC:DD:EE:FF -B <obex-channel> -p ./test.txt
     ```
   - **HID / audio (A2DP/HFP)**: note whether `bluetoothctl pair`/`connect` succeeds with no PIN or with a fixed/known PIN, and whether the profile activates without confirmation on the device.

6. Record, per profile: the channel/PSM, whether it required authentication, and what it did when reached without it. That table — which services answer unauthenticated — is the finding handed to **BSAM-SE-03** for the service-access-control judgement.

## Field case

Illustrative walkthrough — substitute the values you capture. Against a generic Bluetooth hands-free car kit on the bench, the pattern looks like this: `sdptool browse` returns a Serial Port (RFCOMM) record on channel 1 and a Handsfree Gateway record, alongside the expected A2DP sink. `l2ping` answers immediately even though the unit is not in pairing mode, confirming the host stack is reachable from its BD_ADDR alone. Binding RFCOMM channel 1 with `rfcomm connect /dev/rfcomm0 <addr> 1` and sending `AT` over `screen /dev/rfcomm0 115200` produces an `OK` — the serial channel answering AT commands before any pairing completed, which is exactly the unauthenticated-service condition BSAM-SE-03 exists to flag. A harmless car kit is the demonstrator; the same enumeration step against an OBD-II dongle or a point-of-sale terminal is where an exposed RFCOMM/AT or OBEX channel becomes consequential. Record the real values from your own engagement: [FILL: real device model, BD_ADDR OUI, exact sdptool record and channel].

## Remediation

- **Developer (device firmware):** Publish only the profiles the product actually needs in SDP, and require authentication and authorisation on every channel that carries data or commands — never leave an RFCOMM/AT or OBEX channel reachable pre-pairing. Reject legacy PIN pairing and "Just Works" where the profile handles anything sensitive. Keep the controller SoC and host Bluetooth stack patched against the host-stack class (BlueBorne and its successors); treat the cited CVE set as representative and track current advisories for your specific stack (armis2017blueborne).
- **Integrator:** Choose modules and host stacks with maintained security updates; verify, by running the enumeration above on the assembled product, that no profile answers unauthenticated. Disable unused profiles at integration time rather than trusting defaults.
- **Operator:** Keep the device non-discoverable when not actively pairing, apply firmware updates promptly, and unpair stale bondings. Recognise that non-discoverable is not unreachable — a known BD_ADDR still reaches the host stack — so patching the stack, not hiding it, is the durable control. The which-services-must-be-locked judgement is owned by BSAM-SE-03.
