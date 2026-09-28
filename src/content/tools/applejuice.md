---
slug: applejuice
name: AppleJuice
vendor: ECTO-1A
type: project
protocols:
  - BLE
repo: 'https://github.com/ECTO-1A/AppleJuice'
status: mature
statusNote: >-
  Apple fixed the denial of service in iOS 17.2 (2023-12-11, CVE-2023-42941,
  credited to the AppleJuice author); the author's write-up says patched iPhones
  may still show fleeting pop-ups. Repo last committed 2024-06-17.
statusSource: 'https://support.apple.com/en-us/HT214035'
statusChecked: '2026-09-28'
note: >-
  The original Apple BLE proximity-pairing message-spoofing research/PoC (~1.9k
  stars, Apache-2.0, last push 2024-06), the upstream source of the 'Apple BLE
  spam' payloads reused by Marauder, Bruce, Ghost ESP and EvilAppleJuice. A
  reference corpus rather than a polished tool; payloads date as Apple patches,
  so treat as representative, not current.
---
The original Apple BLE proximity-pairing message-spoofing research/PoC (~1.9k stars, Apache-2.0, last push 2024-06), the upstream source of the 'Apple BLE spam' payloads reused by Marauder, Bruce, Ghost ESP and EvilAppleJuice. A reference corpus rather than a polished tool; payloads date as Apple patches, so treat as representative, not current.
