export const bsamRelation = {
  "summary": "RFSAM is complementary to Tarlogic's BSAM, not a replacement. BSAM is an excellent, mature methodology for Bluetooth — but it begins at the link layer and is Bluetooth-only. RFSAM owns the two floors below that (Spectrum and Signal/PHY) for every protocol, and extends to LoRa/LoRaWAN and LTE which BSAM does not cover. For Bluetooth at the link layer and above — discovery data, pairing, authentication, encryption, services, application — RFSAM defers to BSAM: its RFSAM-BLE procedures at those layers describe only the RF-capture prerequisite needed to reach the point where the corresponding BSAM control applies, then cite it directly.",
  "ownership": [
    {
      "rfsam": "Spectrum (SP) + Signal/PHY",
      "note": "RFSAM-owned for all protocols. BSAM has no coverage here."
    },
    {
      "rfsam": "BLE link layer and above",
      "note": "Inherited from BSAM. RFSAM adds only the RF prerequisite and cross-references BSAM-xx."
    },
    {
      "rfsam": "LoRa / LoRaWAN, LTE",
      "note": "RFSAM-owned end to end. BSAM is Bluetooth-only."
    }
  ],
  "priorArt": "RFSAM isn't a claim to have invented RF security — OSSTMM defines a spectrum-security channel, BSAM (Tarlogic) is the mature Bluetooth reference, the SDR-pentest lineage (Ossmann, Black Hat 2008; Picod et al., Black Hat 2014) built the practical tooling, and a deep body of academic RF threat taxonomies exists. What's missing is a single oriented reference that ties that landscape together into something a practitioner can navigate by, end to end, across protocols. RFSAM's purpose is to be that north: structured, numbered procedures with real commands and worked examples, so someone facing an unknown signal has a place to start and a way to know what they've covered.",
  "url": "https://www.tarlogic.com/bsam/"
};
