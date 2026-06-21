// status: 'existing' = a control file exists today; 'planned' = proposed scope, unwritten.
// Objectives for 'planned' entries are scope statements to be researched & cited on authoring.
export const coverageMap = [
  { protocol: 'BLE', controls: [
    { id: 'RFSAM-BLE-IG-01',  title: 'Known vulnerabilities of the SoC and host stack', layer: 'IG',  status: 'existing' },
    { id: 'RFSAM-BLE-SP-01',  title: 'Channel map and capture feasibility',             layer: 'SP',  status: 'existing' },
    { id: 'RFSAM-BLE-PHY-01', title: 'Demodulation and bit recovery',                   layer: 'PHY', status: 'existing' },
    { id: 'RFSAM-BLE-LL-01',  title: 'Advertising and identifier exposure',             layer: 'LL',  status: 'existing' },
    { id: 'RFSAM-BLE-LL-02',  title: 'Connection-data capture',                         layer: 'LL',  status: 'existing' },
    { id: 'RFSAM-BLE-CR-01',  title: 'Pairing and encryption assessment',               layer: 'CR',  status: 'existing' },
    { id: 'RFSAM-BLE-AT-01',  title: 'Hijack a live BLE connection',                    layer: 'AT',  status: 'existing' },
  ]},
  { protocol: 'BTC', controls: [
    { id: 'RFSAM-BTC-IG-01', title: 'Identify the device, BR/EDR mode and vulnerability corpus', layer: 'IG', status: 'existing' },
    { id: 'RFSAM-BTC-SP-01', title: 'Inquiry-scan and confirm a reachable BR/EDR device',        layer: 'SP', status: 'existing' },
    { id: 'RFSAM-BTC-LL-01', title: 'Capture Bluetooth Classic baseband traffic',                layer: 'LL', status: 'existing' },
    { id: 'RFSAM-BTC-CR-01', title: 'Assess pairing and encryption key strength',                layer: 'CR', status: 'existing' },
    { id: 'RFSAM-BTC-AT-01', title: 'Test baseband/LMP resilience and availability',             layer: 'AT', status: 'existing' },
    { id: 'RFSAM-BTC-AP-01', title: 'Enumerate and exercise exposed BR/EDR profiles',            layer: 'AP', status: 'existing' },
  ]},
  { protocol: 'WIFI', controls: [
    { id: 'RFSAM-WIFI-SP-01', title: 'Band and channel survey',         layer: 'SP', status: 'existing' },
    { id: 'RFSAM-WIFI-LL-01', title: 'Management-frame exposure',       layer: 'LL', status: 'existing' },
    { id: 'RFSAM-WIFI-CR-01', title: 'WPA handshake / PMKID assessment', layer: 'CR', status: 'existing' },
  ]},
  { protocol: 'LORA', controls: [
    { id: 'RFSAM-LORA-SP-01',  title: 'Sub-band occupancy and capture', layer: 'SP',  status: 'existing' },
    { id: 'RFSAM-LORA-PHY-01', title: 'Chirp demodulation',            layer: 'PHY', status: 'existing' },
    { id: 'RFSAM-LORA-LL-01',  title: 'LoRaWAN frame profiling',       layer: 'LL',  status: 'existing' },
    { id: 'RFSAM-LORA-CR-01',  title: 'Join and session-key assessment', layer: 'CR', status: 'existing' },
  ]},
  { protocol: 'LTE', controls: [
    { id: 'RFSAM-LTE-IG-01',  title: 'Baseband and modem vulnerabilities', layer: 'IG',  status: 'existing' },
    { id: 'RFSAM-LTE-SP-01',  title: 'Cell identification and capture',    layer: 'SP',  status: 'existing' },
    { id: 'RFSAM-LTE-PHY-01', title: 'Resource-grid recovery',            layer: 'PHY', status: 'existing' },
    { id: 'RFSAM-LTE-LL-01',  title: 'Control-channel / identity exposure', layer: 'LL', status: 'existing' },
  ]},
  { protocol: 'RFID', controls: [
    { id: 'RFSAM-RFID-SP-01', title: 'Carrier and standard identification', layer: 'SP', status: 'existing' },
    { id: 'RFSAM-RFID-CR-01', title: 'Crypto1 / key-strength assessment',  layer: 'CR', status: 'existing' },
    { id: 'RFSAM-RFID-AT-01', title: 'Clone, emulate and relay',           layer: 'AT', status: 'existing' },
  ]},
  { protocol: 'SUBG', controls: [
    { id: 'RFSAM-SUBG-SP-01',  title: 'Burst discovery and characterisation', layer: 'SP',  status: 'existing' },
    { id: 'RFSAM-SUBG-PHY-01', title: 'Demodulation and framing',           layer: 'PHY', status: 'existing' },
    { id: 'RFSAM-SUBG-LL-01',  title: 'Frame and addressing recovery',      layer: 'LL',  status: 'existing' },
    { id: 'RFSAM-SUBG-CR-01',  title: 'Rolling-code assessment',            layer: 'CR',  status: 'existing' },
    { id: 'RFSAM-SUBG-AT-01',  title: 'Replay and forge',                   layer: 'AT',  status: 'existing' },
  ]},
  // ---- proposed new protocols (author to trim) ----
  { protocol: 'ZIGBEE', controls: [
    { id: 'RFSAM-ZIGBEE-SP-01', title: 'Channel survey and capture feasibility', layer: 'SP', status: 'existing', objective: 'Assess which 802.15.4 channels carry the target PAN and whether they can be observed.' },
    { id: 'RFSAM-ZIGBEE-LL-01', title: 'PAN, addressing and device discovery',   layer: 'LL', status: 'existing', objective: 'Assess what network topology and identifiers are exposed passively.' },
    { id: 'RFSAM-ZIGBEE-CR-01', title: 'Network-key provisioning and rotation',  layer: 'CR', status: 'existing', objective: 'Assess how the network key is established, transported, and rotated.' },
  ]},
  { protocol: 'ZWAVE',  controls: [
    { id: 'RFSAM-ZWAVE-SP-01', title: 'Region/frequency identification', layer: 'SP', status: 'existing', objective: 'Assess the regional frequency in use and capture feasibility.' },
    { id: 'RFSAM-ZWAVE-CR-01', title: 'Key establishment assessment',    layer: 'CR', status: 'existing', objective: 'Assess the security class and key-establishment scheme in use.' },
  ]},
  { protocol: 'THREAD', controls: [
    { id: 'RFSAM-THREAD-LL-01', title: 'Mesh discovery and commissioning exposure', layer: 'LL', status: 'existing', objective: 'Assess what commissioning and mesh-topology data is exposed.' },
    { id: 'RFSAM-THREAD-CR-01', title: 'Network credential assessment',            layer: 'CR', status: 'existing', objective: 'Assess how mesh credentials are provisioned and protected.' },
  ]},
  { protocol: 'GNSS',   controls: [
    { id: 'RFSAM-GNSS-SP-01', title: 'Signal presence and interference survey', layer: 'SP', status: 'existing', objective: 'Assess received GNSS signal conditions and presence of interference.' },
    { id: 'RFSAM-GNSS-AT-01', title: 'Spoofing and jamming resilience',         layer: 'AT', status: 'existing', objective: 'Assess receiver resilience to spoofed or jammed GNSS signals (authorised testing only).' },
  ]},
  { protocol: 'ADSB',   controls: [
    { id: 'RFSAM-ADSB-PHY-01', title: 'Message capture and decode',     layer: 'PHY', status: 'existing', objective: 'Assess capture and decoding of ADS-B messages.' },
    { id: 'RFSAM-ADSB-LL-01',  title: 'Message authenticity assessment', layer: 'LL', status: 'existing', objective: 'Assess what authenticity guarantees, if any, the link provides.' },
    { id: 'RFSAM-ADSB-AT-01',  title: 'Forge and inject (contained lab)', layer: 'AT', status: 'existing', objective: 'Assess resilience to forged/injected ADS-B frames (authorised, contained-lab testing only).' },
  ]},
  { protocol: 'NR5G',   controls: [
    { id: 'RFSAM-NR5G-SP-01', title: 'Cell identification and capture', layer: 'SP', status: 'existing', objective: 'Assess identification and capture of the target 5G NR cell.' },
    { id: 'RFSAM-NR5G-LL-01', title: 'Broadcast / identity exposure',   layer: 'LL', status: 'existing', objective: 'Assess identity and configuration data exposed on broadcast channels.' },
  ]},
  { protocol: 'GSM',    controls: [
    { id: 'RFSAM-GSM-SP-01', title: 'ARFCN survey and capture',     layer: 'SP', status: 'existing', objective: 'Assess identification and capture of GSM carriers.' },
    { id: 'RFSAM-GSM-CR-01', title: 'Cipher and identity exposure', layer: 'CR', status: 'existing', objective: 'Assess ciphering negotiation and identity exposure.' },
  ]},
  { protocol: 'UWB',    controls: [
    { id: 'RFSAM-UWB-PHY-01', title: 'Ranging signal capture',         layer: 'PHY', status: 'existing', objective: 'Assess capture and characterisation of UWB ranging exchanges.' },
    { id: 'RFSAM-UWB-AT-01',  title: 'Distance-manipulation resilience', layer: 'AT', status: 'existing', objective: 'Assess resilience to relay/distance-manipulation against the ranging scheme (authorised testing only).' },
  ]},
];
