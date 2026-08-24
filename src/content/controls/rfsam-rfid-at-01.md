---
id: RFSAM-RFID-AT-01
title: Clone, emulate and relay a credential
protocol: RFID
layer: AT
criticality: high
applicability:
  - LF Prox
  - MIFARE Classic
  - NFC payment
  - access control
deferred: false
objective: >-
  Determine whether a recovered RFID/NFC credential can be cloned to a blank or
  magic card, emulated by a programmable device, or relayed in real time between
  a genuine card and a distant reader, establishing whether the reader trusts
  card data and proximity as proof of authenticity.
intro: >-
  Once identity or sector keys are recovered (RFSAM-RFID-CR-01), the credential
  can be written to a blank, emulated by a device with no physical card, or
  relayed live between a genuine card and a remote reader. Relay in particular
  defeats physical proximity as a security assumption, since neither the card's
  keys nor its location have to be controlled by the attacker.
prerequisites:
  hardware:
    - 'A Proxmark3 (LF+HF clone/emulate/relay via the pm3 client; two units for an end-to-end relay)'
    - 'A ChameleonUltra (nRF52840) for standalone HF/LF emulation, or a BomberCat (PN7150) for NFC read/emulate, NFC relay (RelayNFC) and MagSpoof'
    - 'Writable blanks: a T5577 (LF EM/HID clone) and a magic Gen1a/Gen2 MIFARE Classic card (HF UID-writable clone)'
  software:
    - 'pm3-client (Iceman Proxmark3 firmware/client) for lf/hf search, clone, sim and the hf_reblay standalone relay; ChameleonUltra GUI; BomberCat RelayNFC/MagSpoof firmware'
  signal:
    freq: 'LF 125 / 134 kHz · HF 13.56 MHz (near-field, magnetically coupled)'
    bandwidth: 'Near-field load modulation, no far-field channel; reads are centimetres by design'
    modulation: 'LF ASK/OOK (EM4100, HID Prox); HF ISO 14443-A/B, ISO 15693 load modulation'
  skill: intermediate
attacks:
  - name: UID / credential cloning
    refs:
      - pm3magic
    impact: >-
      A read-only or Crypto1-recovered credential is written to a blank (T5577)
      or a UID-writable magic card and presented to the reader as the original.
    preconditions: >-
      The card data is recoverable, an LF ID with no crypto, or an HF card whose
      keys were recovered (RFSAM-RFID-CR-01), and the reader trusts that data
      (often the UID alone) as identity.
    summary: >-
      The baseline failure of non-cryptographic access control: UID-only and
      cloned-key credentials write straight onto blanks or magic cards (Gen1a
      backdoor / Gen2 direct-write block 0) and are accepted as the original.
  - name: Card emulation
    refs:
      - pm3magic
    impact: >-
      A programmable device presents the credential to a reader with no physical
      card at all, enabling rapid reader-side testing and real-world
      impersonation.
    preconditions: >-
      A recovered dump/ID loaded into the emulator; the reader must not perform
      card-authenticity checks the emulator cannot satisfy.
    summary: >-
      Proxmark (hf mf sim / lf … sim), ChameleonUltra or BomberCat present the
      credential directly from stored data, for MIFARE Classic the ChameleonUltra
      emulates the full Crypto1 exchange.
  - name: NFC / proximity relay
    refs:
      - francis2010relay
      - hancke2005relay
      - mendoza2020reblay
    impact: >-
      The reader transacts with a genuine, remote card it believes is in front of
      it, defeating physical proximity without the attacker holding the card's
      keys.
    preconditions: >-
      A live card reachable at the 'mole' end and a target reader at the 'proxy'
      end, linked over a low-latency channel; the reader must not enforce a tight
      timing bound or distance bounding.
    summary: >-
      A two-ended relay forwards the reader↔card exchange in real time
      (Proxmark hf_reblay over Bluetooth; BomberCat RelayNFC host/client over the
      network), so keys and proximity are bypassed entirely. Demonstrated
      practical with off-the-shelf NFC phones (Francis et al.) and over ~50 m on
      ISO 14443 (Hancke).
  - name: MagSpoof magnetic-stripe emulation
    refs:
      - magspoof
    impact: >-
      Extends impersonation to legacy magnetic-stripe readers, replaying captured
      track data wirelessly to terminals that still accept magstripe.
    preconditions: >-
      Captured/derived magnetic-stripe track data and a reader that accepts
      magstripe (the legacy fallback on many payment/access terminals).
    summary: >-
      MagSpoof emits a magnetic field that emulates swiping a stripe card to a
      standard reader without a physical card, the magstripe analogue of the
      contactless attacks above.
references:
  - key: francis2010relay
    title: Practical NFC Peer-to-Peer Relay Attack using Mobile Phones
    authors: 'L. Francis, G. Hancke, K. Mayes, K. Markantonakis'
    venue: 'IACR ePrint 2010/228 (RFIDSec 2010)'
    year: 2010
    url: 'https://eprint.iacr.org/2010/228'
    type: paper
  - key: hancke2005relay
    title: A Practical Relay Attack on ISO 14443 Proximity Cards
    authors: G. P. Hancke
    venue: University of Cambridge Computer Laboratory (technical report)
    year: 2005
    url: 'https://www.rfidblog.org.uk/hancke-rfidrelay.pdf'
    type: paper
  - key: mendoza2020reblay
    title: 'Proxmark3 Reblay: Relaying ISO 14443A data over Bluetooth (standalone mode)'
    authors: Salvador Mendoza
    venue: salmg.net
    year: 2020
    url: 'https://salmg.net/2020/12/26/proxmark3-relaying-iso-14443a-data-over-bluetooth/'
    type: blog
  - key: pm3magic
    title: Magic cards notes (UID-writable Gen1a/Gen2 MIFARE Classic clone documentation)
    authors: RFID Research Group (Iceman Proxmark3)
    venue: RfidResearchGroup/proxmark3
    year: 2024
    url: 'https://github.com/RfidResearchGroup/proxmark3/blob/master/doc/magic_cards_notes.md'
    type: tool
  - key: bombercatblog
    title: 'BomberCat: Prepare your bank terminal'
    authors: Electronic Cats
    venue: electroniccats.com
    year: 2022
    url: 'https://electroniccats.com/blog/bombercat-prepare-your-bank-terminal/'
    type: blog
  - key: magspoof
    title: MagSpoof, wireless magnetic-stripe / credit-card emulation
    authors: Samy Kamkar
    venue: 'samyk/magspoof (GitHub)'
    year: 2016
    url: 'https://github.com/samyk/magspoof'
    type: tool
tools:
  - pm3-client
  - chameleon-ultra
  - bombercat
bsam: []
resources:
  - RFSAM-RES-13
  - RFSAM-RES-14
reviewStatus: reviewed
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

Three escalations follow identity or key recovery, all exploiting the same root cause: the reader trusts card-supplied data, and often mere proximity, as proof of authenticity.

**Cloning** writes recovered data onto a writable blank. An LF EM4100/HID Prox ID, read-only with no crypto, is copied straight to a T5577 ([pm3magic] documents the writable-tag families). An HF MIFARE Classic dump, once its sector keys are recovered (RFSAM-RFID-CR-01), is written to a *magic* card. Magic cards expose block 0, which holds the normally-immutable UID: Gen1a cards accept a Chinese "backdoor" command sequence to rewrite it, while Gen2 cards take a direct write to block 0, so the clone reproduces the UID and all sector contents [pm3magic].

**Emulation** removes the blank entirely: a programmable device presents the credential from stored data. The Proxmark simulates a tag (`hf mf sim` / `lf … sim`), and the ChameleonUltra emulates a full MIFARE Classic including the Crypto1 challenge-response, so a reader that authenticates a sector still accepts the emulator [pm3magic].

**Relay** is the strongest because it needs neither the card's keys nor the card's presence. Two ends forward the reader↔card exchange in real time: a "mole" near the genuine card and a "proxy" at the target reader, bridged over a low-latency link. The reader believes a card is in its field; in reality the card is arbitrarily far away. Francis, Hancke, Mayes and Markantonakis demonstrated this in practice with two off-the-shelf NFC mobile phones and no custom hardware [francis2010relay], extending Hancke's earlier result that an ISO 14443 proximity card could be relayed over roughly 50 m [hancke2005relay]. The Proxmark implements this as the `hf_reblay` standalone mode, which relays ISO 14443-A over Bluetooth, authored by Salvador Mendoza [mendoza2020reblay]. The BomberCat (PN7150) provides a host/client RelayNFC pairing intended for auditing NFC bank-card acceptance, where the host reads the card and the client emulates it at the terminal [bombercatblog]. Because relay forwards a genuine, fully-authenticated transaction, neither strong card crypto (DESFire AES) nor unknown sector keys stop it, only a reader-side timing bound or distance-bounding protocol does [hancke2005relay].

A fourth, parallel path extends impersonation to legacy infrastructure: **MagSpoof** emits a magnetic field emulating a stripe swipe to a standard magstripe reader, without a physical card [magspoof]; BomberCat ships a MagSpoof mode for the magstripe fallback that many payment/access terminals still accept.

This control verifies *which* of clone / emulate / relay (and the magstripe fallback) the target reader is susceptible to, i.e. whether it trusts card data, and proximity, as identity.

BomberCat / RelayNFC is documented by Electronic Cats as a tool for auditing bank-terminal NFC acceptance [bombercatblog]; its `RelayNFC` example has the host read a genuine card while the client emulates it at a terminal. Electronic Cats frame this as the tool's auditing purpose, not as a confirmed relay against an in-production bank terminal, and that framing is what is asserted here. The peer-reviewed practical demonstrations of contactless relay are Francis et al., who relayed an NFC transaction between two off-the-shelf mobile phones [francis2010relay], and Hancke, who relayed an ISO 14443 proximity card up to a distance of 50 m [hancke2005relay].

## Procedure

> All steps energise, write to, emulate or relay live credentials, do them only against your own cards/readers, with explicit written authorisation, ideally in an RF-shielded test setup.

1. **Confirm what the reader actually checks.** Before cloning, establish whether the target reader trusts the UID alone, a full sector read, or an authenticated exchange, this decides whether a UID clone suffices or full key recovery is required. Identify the credential first:
   ```
   pm3 --> lf search
   pm3 --> hf search
   ```
   Expected: the band, standard and chip (e.g. `EM410x ID found`, or `MIFARE Classic 1k` with UID and PRNG class). Note the UID length (4 vs 7 byte) and chip family.

2. **Clone an LF ID to a T5577.** For an EM4100 / HID Prox credential (no crypto), write the recovered ID to a blank T5577:
   ```
   pm3 --> lf em 410x clone --id <10-hex-id>
   pm3 --> lf hid clone -w H10301 --fc 10 --cn 1337
   ```
   Expected: `Done`/`Cloned`. Re-run `lf search` on the cloned tag to confirm the ID matches, then test against the reader.

3. **Clone an HF MIFARE Classic dump to a magic card.** Using the dump and keys from RFSAM-RFID-CR-01 (`hf mf autopwn` / `hf mf dump` produce `hf-mf-<UID>-dump.bin`), write the full dump, including block 0/UID, to a magic Gen1a/Gen2 card [pm3magic]:
   ```
   pm3 --> hf mf restore --1k --uid 4A6CE843 -k hf-mf-A29558E4-key.bin -f hf-mf-A29558E4-dump.bin
   ```
   For Gen1a, set the UID with `hf mf csetuid` if needed. Expected: each block writes; `hf mf dump` on the clone reproduces the original. Present to the reader and record acceptance.

4. **Emulate the credential (no blank card).** Simulate from the Proxmark, or load the dump into a ChameleonUltra slot for standalone use:
   ```
   pm3 --> hf mf sim -u 353c2aa6
   pm3 --> lf em 410x sim --id <10-hex-id>
   ```
   Expected: the Proxmark answers the reader as the card (`#db# Emulating MIFARE…`). Confirm the reader accepts the emulated credential, including a sector authentication for MIFARE Classic.

5. **Relay a live card.** With two Proxmarks (or a BomberCat host/client pair), run the relay so a reader at the proxy end transacts with a card at the mole end [mendoza2020reblay][bombercatblog]. On the Proxmark, the `hf_reblay` standalone mode relays ISO 14443-A over Bluetooth. Expected: the reader completes a transaction with the remote card. **Measure the added latency** and check whether the reader still completes, this is the discriminating result.

6. **Test the magstripe fallback** (payment/legacy access only): with BomberCat MagSpoof / `samyk/magspoof`, emit captured track data to a magstripe reader [magspoof] and record whether the terminal accepts the swipe.

7. **Record the reader's defences.** For each accepted path, note whether the reader enforced anything that resisted it: card-authenticity (signed UID, DESFire AES challenge), a transaction timing bound, distance bounding, or anti-passback/anomaly detection in the backend.

## Field case

A representative access-control assessment (authorised, own credentials):

- An LF HID Prox badge fingerprinted with `lf search` exposed a Wiegand facility/card number; cloning it to a T5577 with `lf hid clone -w H10301 --fc <fc> --cn <cn>` produced a badge the door reader accepted as the original, the reader trusted the Wiegand number with no card authentication.
- An HF MIFARE Classic 1k staff card was dumped after key recovery (RFSAM-RFID-CR-01); writing the dump to a Gen2 magic card with `hf mf restore --1k --uid <uid> -k <keyfile> -f <dumpfile>` reproduced the UID and all sectors, and the turnstile accepted the clone.
- The same dump loaded into a ChameleonUltra slot opened the turnstile with **no card at all**, confirming emulation as well as cloning.

Measured values from a specific engagement should be filled in rather than invented:

- Relay added latency end-to-end: [FILL: measured ms over the chosen Bluetooth/network link]
- Reader timeout / whether the relayed transaction still completed: [FILL: completed? / rejected on timeout at N ms]
- Distance achieved at the mole end before the read failed: [FILL: measured cm/m]

The control's decisive question for the defender is the same in every case: does the reader (or its backend) ever check card authenticity or transaction timing, or is card data plus apparent proximity sufficient? Where it is sufficient, all four paths above succeed.

Note: the clone/emulate observations above are a representative composite of well-documented LF-Prox and MIFARE-Classic-magic-card behaviour, not a single logged engagement; the bracketed relay timing/distance values are intentionally unmeasured placeholders to be filled from a specific authorised engagement. Do not cite them as a specific measured finding.

## Remediation

Layered, in order of effectiveness against this control:

- **Developer (credential / chip choice).** Do not authenticate on UID or on a Crypto1-protected secret, both clone trivially. Use credentials with strong, mutually-authenticated crypto (MIFARE DESFire EV2/EV3 with diversified AES keys, or equivalent) so a dump is not enough to impersonate, and so emulation must defeat real card crypto. This neutralises cloning and emulation [pm3magic], but **not relay**, which forwards a genuine authenticated exchange.
- **Integrator (reader / protocol).** To stop relay, the reader side must bound the transaction in time or space: a tight round-trip timeout or, better, a distance-bounding protocol, the only mechanism that addresses relay's defeat of proximity [hancke2005relay][francis2010relay]. Disable the magnetic-stripe fallback wherever the deployment allows, since MagSpoof reinstates the weakest path [magspoof]. Require chip/contactless and reject magstripe for high-value transactions.
- **Operator (deployment / monitoring).** Treat UID and magstripe data as non-secret identifiers, never as proof of presence. Add backend anti-passback, geo/velocity and anomaly detection so a cloned or relayed credential used in two places, or with anomalous timing, is flagged. Where migration off legacy credentials is impossible, assume the credential is cloneable and compensate at the backend.
