---
slug: matter-dcl
name: Matter Distributed Compliance Ledger (DCL)
vendor: Connectivity Standards Alliance
type: project
protocols:
  - Thread
  - Wi-Fi
  - BLE
repo: 'https://github.com/zigbee-alliance/distributed-compliance-ledger'
homepage: 'https://webui.dcl.csa-iot.org/'
note: >-
  The CSA-run public ledger (Cosmos SDK / CometBFT) of Matter device data:
  vendor and product info keyed by Vendor ID (VID) and Product ID (PID),
  certification status, and the Product Attestation Authority (PAA) root
  certificates that commissioners trust for device attestation. At Identify, the
  DCL turns the VID/PID read off a device's onboarding payload into a known
  vendor/product and certification record, and a Test-Vendor VID (0xFFF1 to
  0xFFF4) on a 'production' device is an immediate red flag.
---
The CSA-run public ledger (Cosmos SDK / CometBFT) of Matter device data: vendor and product info keyed by Vendor ID (VID) and Product ID (PID), certification status, and the Product Attestation Authority (PAA) root certificates that commissioners trust for device attestation. At Identify, the DCL turns the VID/PID read off a device's onboarding payload into a known vendor/product and certification record, and a Test-Vendor VID (0xFFF1 to 0xFFF4) on a 'production' device is an immediate red flag.
