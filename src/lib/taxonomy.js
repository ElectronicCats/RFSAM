export const LAYER_IDS = ['IG', 'SP', 'PHY', 'LL', 'CR', 'AT', 'AP'];
// Rank a layer by its position in the descent (IG=0 … AP=6) — for ordering controls
// the way the methodology teaches them, rather than alphabetically by id.
export const layerRank = (id) => LAYER_IDS.indexOf(id);

export const PROTOCOL_IDS = [
  'BLE', 'BTC', 'WIFI', 'LORA', 'LTE', 'RFID', 'SUBG',
  'ZIGBEE', 'ZWAVE', 'THREAD', 'GNSS', 'ADSB', 'NR5G', 'GSM', 'UWB',
];

export const CRITICALITY_IDS = ['info', 'low', 'medium', 'high', 'critical'];
// stub → draft → reviewed → verified.
//   reviewed = citations & method confirmed, but the field case is still an
//              illustrative template (no real captured data).
//   verified = reviewed AND demonstrated with a real field case.
export const REVIEW_STATUSES = ['stub', 'draft', 'reviewed', 'verified'];
export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'];

const ID_RE = new RegExp(
  `^RFSAM-(${PROTOCOL_IDS.join('|')})-(${LAYER_IDS.join('|')})-(\\d{2})$`,
);

export function parseControlId(id) {
  const m = ID_RE.exec(id);
  if (!m) return null;
  return { protocol: m[1], layer: m[2], nn: m[3] };
}
