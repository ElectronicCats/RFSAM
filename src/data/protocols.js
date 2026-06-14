// Each protocol: id (matches the ID segment), name, band, prefix, status.
// `status: 'deepen'` = exists in the legacy corpus; `status: 'new'` = added for the full map.
export const protocols = [
  { id: 'BLE',    name: 'Bluetooth Low Energy', band: '2.400–2.480 GHz',                 prefix: 'RFSAM-BLE',    status: 'deepen' },
  { id: 'BTC',    name: 'Bluetooth Classic',    band: '2.402–2.480 GHz (BR/EDR)',        prefix: 'RFSAM-BTC',    status: 'new' },
  { id: 'WIFI',   name: 'Wi-Fi (802.11)',       band: '2.4 / 5 / 6 GHz',                 prefix: 'RFSAM-WIFI',   status: 'deepen' },
  { id: 'LORA',   name: 'LoRa / LoRaWAN',        band: 'ISM sub-GHz (US915 / EU868)',     prefix: 'RFSAM-LORA',   status: 'deepen' },
  { id: 'LTE',    name: 'LTE / 4G',              band: 'Licensed cellular',               prefix: 'RFSAM-LTE',    status: 'deepen' },
  { id: 'RFID',   name: 'RFID / NFC',            band: '125 kHz LF / 13.56 MHz HF',       prefix: 'RFSAM-RFID',   status: 'deepen' },
  { id: 'SUBG',   name: 'Sub-GHz ISM / Remotes', band: '315 / 433 / 868 / 915 MHz',      prefix: 'RFSAM-SUBG',   status: 'deepen' },
  { id: 'ZIGBEE', name: 'Zigbee / 802.15.4',     band: '2.4 GHz (+ 868/915 MHz)',         prefix: 'RFSAM-ZIGBEE', status: 'new' },
  { id: 'ZWAVE',  name: 'Z-Wave',                band: 'Sub-GHz, region-specific (~868/908 MHz)', prefix: 'RFSAM-ZWAVE', status: 'new' },
  { id: 'THREAD', name: 'Thread / Matter',       band: '2.4 GHz (802.15.4)',              prefix: 'RFSAM-THREAD', status: 'new' },
  { id: 'GNSS',   name: 'GNSS / GPS',            band: 'L-band (e.g. GPS L1 1575.42 MHz)', prefix: 'RFSAM-GNSS',  status: 'new' },
  { id: 'ADSB',   name: 'ADS-B (aviation)',      band: '1090 MHz / 978 MHz UAT',          prefix: 'RFSAM-ADSB',   status: 'new' },
  { id: 'NR5G',   name: '5G NR',                 band: 'FR1 sub-6 GHz / FR2 mmWave',      prefix: 'RFSAM-NR5G',   status: 'new' },
  { id: 'GSM',    name: 'GSM / 2G',              band: '850 / 900 / 1800 / 1900 MHz',     prefix: 'RFSAM-GSM',    status: 'new' },
  { id: 'UWB',    name: 'Ultra-Wideband',        band: '3.1–10.6 GHz',                    prefix: 'RFSAM-UWB',    status: 'new' },
];
