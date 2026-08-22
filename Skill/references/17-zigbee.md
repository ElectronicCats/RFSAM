# 17 - Zigbee / 802.15.4

> Wayfinder + RFSAM controls for Zigbee. RFSAM owns end-to-end.

## Facts
- **Band**: 2.4 GHz (2.405-2.480) primary - sub-GHz 868 MHz (EU) / 902-928 (Americas).
- **Channels**: 2.4 GHz 16 channels 11-26 (spaced 5 MHz); one PAN on one channel (does not hop like BLE).
- **PHY**: IEEE 802.15.4 - 2.4 GHz O-QPSK with DSSS, 250 kbps.
- **Stack**: 802.15.4 MAC/PHY -> Zigbee NWK (mesh) -> APS -> ZCL/ZDO. Roles: Coordinator, Router, End Device.
- **Security**: AES-128-CCM* at NWK and APS. Network key shared by the entire PAN; Trust Center link key gates the join. Default well-known TC link key `ZigBeeAlliance09` (hex `5A6967426565416C6C69616E63653039`).
- **Range**: ~10-100 m per hop; the mesh extends it.

## Layer-by-layer descent

### IG (fingerprinting)
- Chipset (Silicon Labs EFR32/EM35x, TI CC2530/CC2538/CC1352, NXP JN51xx, ESP32-C6), role (Coordinator=Trust Center/Router/End Device), channel/PAN, join model (centralized vs distributed; default TC link key vs install code vs Zigbee 3.0 install-code-only).

### SP - `RFSAM-ZIGBEE-SP-01` Channel survey and capture feasibility
- **Objective**: which of the 16 channels the PAN is on. Energy/active scan, no hop chasing.
- **Kit**: KillerBee `zbstumbler` (active beacon), Gqrx (energy cross-check), Minino (scanner), Kismet (passive multi-radio), catnip (activity table).
- **Caveat**: channels 15/20/25/26 fall in Wi-Fi gaps -> common.

### PHY (no control - demodulation on 802.15.4 radio)
- 802.15.4 radios demodulate O-QPSK/DSSS (PHY) and frame MAC (LL) together. SDR impractical for live decode.

### LL - `RFSAM-ZIGBEE-LL-01` PAN, addressing and device discovery
- **Objective**: park an 802.15.4 radio on the channel -> PCAP. **Critical**: capture a device *joining* (join) - that is where the network key is transported.
- **Kit**: KillerBee (`zbdump`/`zbwireshark`, ApiMote/nRF52840), catnip (CatSniffer), nRF Sniffer 802.15.4, whsniff (CC2531), Minino, WHAD (nRF52840/APIMote), Kismet (multi-radio).
- **Decoder**: Wireshark (802.15.4 + Zigbee NWK/APS; decrypts with network key).

### CR - `RFSAM-ZIGBEE-CR-01` Network-key provisioning and rotation
- **Objective**: recover the network key from the join. Classic weakness: APS Transport-Key on join under the default TC link key `ZigBeeAlliance09` (or in cleartext on old devices).
- **Kit**: zbdsniff (extracts network key from join under `ZigBeeAlliance09` or in cleartext), Wireshark (decrypts with key).
- **Command**: capture join -> `zbdsniff join.pcap` -> paste key in Wireshark Preferences -> ZigBee.
- **Caveat**: per-device install code defeats it; Zigbee 3.0 install-code key agreement (AES-MMO) resists capture-the-join.

### AT (no dedicated control - active techniques)
- **[!] MANDATORY AUTHORIZATION**. With network key: forge/inject (KillerBee `zbreplay`/scapy-radio, ApiMote TX). Force leave/rejoin to recapture the join. catnip OTA firmware-update MITM+jamming PoC.
- **Kit**: KillerBee (ApiMote TX), catnip (OTA MITM PoC).

### AP
- ZCL commands (on/off, lock/unlock, level). With the network key, craft encrypted APS/ZCL and inject (KillerBee zbscapy).

## Subflow (specialization of the master flow)

Zigbee-specific transitions; verbatim commands live in `Layer-by-layer descent` above.

| Advance | Advancement criterion | Markers |
|---------|----------------------|---------|
| IG -> SP | Role (Coordinator/Router/End) and PAN identified. Default TC link key `ZigBeeAlliance09` is **well-known** | - |
| SP -> PHY+LL | PAN channel fixed (16 channels 2.4 GHz, **no hopping**); 802.15.4 radio parked. SDR does not decode O-QPSK/DSSS live | - |
| PHY+LL -> CR | Do you capture a **join**? (that is where the network key is transported). **Critical** to extract the key | - |
| CR -> AT | Network key in hand or gap. Transport-Key protected only by default TC link key (or in cleartext on old devices); install code defeats it | - |
| AT | [!]TX re-check; with key -> forge/inject, force leave/rejoin; without key -> replay encrypted | [!]TX |
| AP (no formal control) | ZCL commands (on/off, lock, level) over what the device trusts | - |

**Defensive anomaly** (Defensive mode, RX-only): unexpected management frames (**forced** leave/rejoin) or unknown devices joining the PAN = possible takeover. Register.

## Legal warnings
- Passive RX OK (802.15.4 open).
- **Inject/replay/forge = active**: own/authorized PAN only. Operating someone else's lock/switch = breaking and entering.
