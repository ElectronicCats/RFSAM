---
id: RFSAM-BLE-AP-01
title: Enumerate and exercise GATT over the CatSniffer host controller
protocol: BLE
layer: AP
criticality: medium
applicability:
  - BLE
deferred: true
objective: >-
  Determine whether a device's GATT services and characteristics can be
  enumerated and read or written without authentication, by presenting the
  CatSniffer as a Linux virtual HCI controller and driving it with host BLE
  tooling - the RF/host-controller prerequisite that reaches where the BSAM
  service-access and data-exposure controls apply.
intro: >-
  Above the link, a BLE device exposes a GATT table; what it lets an
  unauthenticated peer read or write is the application-layer question. RFSAM
  owns the prerequisite - turning the CatSniffer into a native host controller
  (hciN) via catnip's virtual-HCI bridge so any BlueZ tool can enumerate and
  exercise the table. The judgement of what should have required authentication
  is BSAM's (BSAM-SE-03, BSAM-DI-04).
prerequisites:
  hardware:
    - 'A CatSniffer V3 (CC1352P7 + RP2040) flashed with Sniffle firmware, on a Linux host with BlueZ 5.x. Any standard USB Bluetooth LE adapter also works as the host controller; the CatSniffer path is the EC-native one.'
  software:
    - 'catnip (CatSniffer-Tools) for the virtual-HCI bridge; BlueZ (bluetoothctl); Bleak and/or bettercap for enumeration and read/write. Requires Python 3.11+, the hci_vhci kernel module, and root.'
  signal:
    freq: '2.402-2.480 GHz (2.4 GHz ISM); the connection rides the 37 data channels'
    bandwidth: '2 MHz per channel'
    modulation: 'GFSK - LE 1M / 2M / Coded PHY'
  skill: intermediate
attacks:
  - name: Unauthenticated GATT access
    refs:
      - bt-core-spec
    impact: >-
      An unpaired peer reads sensitive characteristics or writes actuating ones
      because the device did not require an authenticated, encrypted connection
      on them first.
    preconditions: >-
      The device exposes readable or writable characteristics without enforcing
      pairing / encryption on them.
    summary: >-
      Enumerate the GATT table and exercise every characteristic reachable
      without pairing; the over-exposure judgement is BSAM-SE-03 / BSAM-DI-04.
  - name: GATT MITM / relay (GATTacker)
    refs:
      - jasek2016gattacker
    impact: >-
      A relay between the app and the device clones the GATT profile and
      forwards or modifies traffic, defeating app-layer trust that rests on the
      link alone.
    preconditions: >-
      Just Works or otherwise unauthenticated pairing, and proximity to clone the
      advertising peripheral and sit in the middle.
    summary: >-
      The canonical BLE application-layer relay: clone the peripheral's GATT and
      MITM the central, showing why app-layer confidentiality cannot rely on the
      link.
references:
  - key: bt-core-spec
    title: 'Bluetooth Core Specification (GATT / ATT: services, characteristics, security properties)'
    authors: Bluetooth SIG
    venue: Bluetooth SIG
    year: 2024
    url: 'https://www.bluetooth.com/specifications/specs/core-specification/'
    type: spec
  - key: jasek2016gattacker
    title: 'GATTacking Bluetooth Smart Devices - Introducing a New BLE Proxy Tool'
    authors: Slawomir Jasek (SecuRing)
    venue: Black Hat USA 2016
    year: 2016
    url: 'https://github.com/securing/gattacker'
    type: talk
  - key: catnip-tools
    title: 'CatSniffer-Tools (catnip) - VHCI bridge: CatSniffer as a Linux HCI controller'
    authors: Electronic Cats
    venue: GitHub
    year: 2026
    url: 'https://github.com/ElectronicCats/CatSniffer-Tools'
    type: tool
  - key: bleak
    title: 'Bleak - a cross-platform BLE client for Python'
    authors: H. Blidh et al.
    venue: GitHub
    year: 2026
    url: 'https://github.com/hbldh/bleak'
    type: tool
  - key: bettercap
    title: 'bettercap - reconnaissance and MITM for 802.11 / BLE / HID / CAN-bus / IP (BLE module)'
    authors: bettercap
    venue: GitHub
    year: 2026
    url: 'https://github.com/bettercap/bettercap'
    type: tool
tools:
  - catnip
  - catsniffer
  - bleak
  - bettercap
bsam:
  - BSAM-SE-03
  - BSAM-DI-04
resources:
  - RFSAM-RES-05
reviewStatus: reviewed
confidence: medium
lastResearched: 2026-07-14
---
## Mechanism

Above the link layer, a BLE peripheral exposes its functionality as a GATT table: a tree of services, each holding characteristics that carry values and a set of properties (read, write, notify, indicate) together with the security a client must satisfy to use them - none, an encrypted link, or an authenticated (MITM-protected) one (Vol 3 Part G) [bt-core-spec]. A device that leaves a sensitive characteristic readable, or an actuating one writable, without first requiring an authenticated encrypted connection is exposed to any peer in range. Deciding whether a given characteristic is over-exposed - whether that read leaks sensitive data, whether that write should have demanded authentication - is the application-layer judgement, and RFSAM defers it to BSAM (BSAM-SE-03 service access control, BSAM-DI-04 sensitive-data exposure). This control owns only the prerequisite: reaching the GATT table with a controller you drive.

The RF/host-controller prerequisite is what makes the CatSniffer relevant here. `catnip`'s virtual-HCI bridge presents the CatSniffer (running Sniffle firmware) to the Linux kernel as a standard Bluetooth LE controller through `/dev/vhci`, which BlueZ registers as `hciN`; any BlueZ-speaking tool then operates the target through the CatSniffer radio, no separate USB dongle required [catnip-tools]. From there the enumeration is ordinary GATT client work with BlueZ (`bluetoothctl`), Bleak, or bettercap.

Link-layer security alone does not settle the application-layer question. The canonical demonstration is the GATTacker relay (Jasek, Black Hat USA 2016): clone a peripheral's advertising and GATT profile, stand between it and the real central, and forward or tamper with ATT traffic - so a design that trusts "the app talked to the device" without app-layer authentication is defeated regardless of the link [jasek2016gattacker]. That is the threat context; this control's active scope is the passive-to-interactive enumeration and read/write test of what a device exposes without pairing.

This control has an interactive, connect-and-read/write step. Run it only against your own devices or with explicit written authorisation; a write to an actuating characteristic can change device state.

## Procedure

Authorised testing only: your own device or written permission. A write step can change device state - read first, and only write to a characteristic you understand.

1. **Load the kernel module and check prerequisites.** The bridge needs `hci_vhci` loaded so `/dev/vhci` exists:
   ```bash
   sudo modprobe hci_vhci
   catnip vhci check
   ```
   Expected: `catnip vhci check` reports that `hci_vhci` is loaded and `/dev/vhci` is present, and lists any existing HCI controllers.

2. **Start the virtual-HCI bridge.** Present the CatSniffer as a host controller:
   ```bash
   sudo catnip vhci start
   ```
   Expected: the bridge prints a line such as `Created hci1` - note the index N (`hciN`). Add `-d N` to pick a specific CatSniffer, `-p /dev/ttyACM0` to force the port, `-v` for verbose HCI logging.

3. **Enumerate the GATT table with BlueZ.** Drive the new `hciN` from `bluetoothctl`:
   ```bash
   sudo bluetoothctl
   ```
   Then, at the prompt: `select <BD_ADDR>` (the bridge controller, shown at startup as `[NEW] Controller`), `scan on`, `connect <MAC>` (the target), `menu gatt`, `list-attributes <MAC>`, `select-attribute 2a00`, `read`. Expected: the full service / characteristic tree, and readable values in the clear where no authentication is enforced (for example the Device Name characteristic `0x2A00`).

4. **Script the enumeration and read/write test with Bleak.** Save this as `enum_gatt.py` (set `ADDR` to the target), which walks every service, prints each characteristic's properties, and reads those marked readable:
   ```python
   import asyncio
   from bleak import BleakClient

   ADDR = "34:85:18:00:35:F6"  # target device MAC

   async def main():
       async with BleakClient(ADDR) as client:
           for service in client.services:
               print("service", service.uuid, service.description)
               for char in service.characteristics:
                   print("  char", char.uuid, char.properties)
                   if "read" in char.properties:
                       try:
                           value = await client.read_gatt_char(char.uuid)
                           print("    value", value.hex())
                       except Exception as exc:
                           print("    read failed:", exc)

   asyncio.run(main())
   ```
   ```bash
   python3 enum_gatt.py
   ```
   Expected: the same handles `bluetoothctl` showed, with values for every characteristic readable without pairing. To test an unauthenticated write, add `await client.write_gatt_char(<uuid>, bytes.fromhex("..."))` for a characteristic whose effect you understand.

5. **Enumerate interactively with bettercap (optional cross-check).** Over the same `hciN`:
   ```bash
   sudo bettercap
   ```
   Then `ble.recon on`, `ble.show` (list discovered devices), `ble.enum <MAC>` (dump services and characteristics). Expected: an interactive services / characteristics listing that corroborates the Bleak walk.

6. **Record and hand off.** List every characteristic readable or writable without pairing, with its value or effect, and pass the over-exposure judgement to BSAM-SE-03 (should this service have required authenticated access?) and BSAM-DI-04 (is an exposed value sensitive?). RFSAM's part ends at producing that enumerated, exercised GATT map.

## Field case

Illustrative walkthrough - substitute the values you capture; do not assert a finding until it is measured on real hardware. With Sniffle flashed to the CatSniffer, `sudo catnip vhci start` brings up the bridge and BlueZ registers it as `hciN` [catnip-tools]. `bluetoothctl` on that controller connects to the bench target and `menu gatt` walks the table; a typical starting point is the Generic Access service, whose Device Name characteristic `0x2A00` reads in the clear without pairing. The `enum_gatt.py` Bleak walk then dumps the full tree and flags which characteristics returned a value with no authentication.

For a real engagement, record: [FILL: target device model], the assigned [FILL: hciN index], the [FILL: enumerated services and characteristic UUIDs], and specifically [FILL: which characteristics were readable/writable without pairing, and the value or effect observed]. Those unauthenticated reads and writes are exactly the input the BSAM judgement consumes - BSAM-SE-03 weighs whether the service should have gated access, BSAM-DI-04 whether an exposed value is sensitive. Do not fabricate handle values; capture them.

## Remediation

Layered, since the exposure originates in the device's GATT design but is inherited by integrators and operators.

- **Developer (device firmware):** Require LE Secure Connections and set the appropriate authentication / encryption permission on every sensitive read and every actuating write, so an unpaired peer enumerating over any controller (a CatSniffer `hciN` included) gets nothing meaningful (BSAM-SE-03) [bt-core-spec]. Do not rely on the app being "the only client" - an app-layer relay clones the profile and sits in the middle (BSAM-DI-04) [jasek2016gattacker]. Keep secrets out of freely readable characteristics.
- **Integrator:** During acceptance, run this enumeration against the shipped device and reject builds that expose sensitive reads or actuating writes before authentication. Confirm any "secure mode" is enabled in the shipped configuration, not merely available.
- **Operator:** Treat the GATT table as reachable by anyone in range with a sub-$50 radio presented as a host controller. Where the threat model warrants it, deploy only devices whose sensitive functions are gated behind authenticated encryption, and re-test after firmware updates that touch the Bluetooth stack or GATT layout.
