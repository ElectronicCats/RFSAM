---
id: RFSAM-RFID-SP-01
title: Identify carrier, standard and chip family
protocol: RFID
layer: SP
criticality: info
applicability:
  - 125/134 kHz LF
  - 13.56 MHz HF
  - ISO/IEC 14443-A/B
  - ISO/IEC 15693
deferred: false
objective: >-
  Determine, before any crypto or cloning step, which carrier band a credential
  uses (LF 125/134 kHz vs HF 13.56 MHz), which standard/chip family it is
  (EM4100/HID Prox; ISO/IEC 14443 MIFARE Classic/Ultralight/DESFire/NTAG;
  ISO/IEC 15693), and, for MIFARE Classic, whether its nonce/PRNG behaviour is
  weak, hardened or static, so the correct downstream attack path can be chosen.
intro: >-
  RFID/NFC has no far-field spectrum to survey: LF and HF are near-field
  (magnetically coupled), so "see it" means powering the tag in the reader's
  field and reading back its carrier, standard and chip. That identification is
  the fork that decides the entire assessment, a Crypto1 attack is meaningless
  against DESFire AES, and an LF EM4100 ID needs no cracking at all.
prerequisites:
  hardware:
    - 'A multi-band RFID/NFC reader: Proxmark3 (LF+HF, the reference identifier), or a ChameleonUltra / BomberCat (HF, pocket field-read)'
  software:
    - 'Proxmark3 client (pm3, Iceman fork) for lf/hf search and hf mf info; ChameleonUltra GUI for a pocket read'
  signal:
    freq: 'LF 125/134 kHz · HF 13.56 MHz'
    bandwidth: 'Near-field, magnetically coupled, no far-field radiation to survey'
    modulation: 'LF: ASK/OOK or FSK load modulation. HF: ASK with Manchester/Miller subcarrier load modulation (ISO/IEC 14443), or the ISO/IEC 15693 vicinity air interface.'
  skill: beginner
attacks:
  - name: MIFARE Classic Crypto1 reverse engineering and card key recovery
    refs:
      - garcia2008dismantling
      - garcia2009pickpocketing
    impact: >-
      Once a card is identified as MIFARE Classic, its 48-bit Crypto1 cipher is
      recoverable; the sector keys can be derived and the card cloned. The SP
      identification step is what classifies a card into this attackable family.
    preconditions: Card identified as MIFARE Classic (ISO/IEC 14443-A, Crypto1) rather than DESFire/NTAG/ISO 15693.
    summary: >-
      Crypto1 was reverse-engineered and shown breakable; the "nested" attack
      recovers all sector keys once any one key is known. Identification of the
      chip family is the gate to this attack path.
  - name: Darkside (card-only key recovery)
    refs:
      - courtois2009darkside
    impact: Recovers a first MIFARE Classic sector key from the card alone, with no known key and no legitimate reader, bootstrapping the nested attack.
    preconditions: Card identified as MIFARE Classic with a weak/exploitable PRNG (visible at the SP identification step via the nonce report).
    summary: >-
      A practical card-only attack recovering a sector key in minutes; whether it
      applies is decided by the PRNG classification read during identification.
  - name: Hardnested (hardened-card ciphertext-only attack)
    refs:
      - meijer2015hardnested
    impact: Recovers keys from "hardened" MIFARE Classic (e.g. EV1) that resist the plain nested attack, using ~1600 to 2200 nonces.
    preconditions: Card identified as a hardened MIFARE Classic, exactly the weak-vs-hardened-vs-static classification this control records.
    summary: >-
      Ciphertext-only cryptanalysis defeating the PRNG hardening; the
      identification step's nonce classification (weak/hard/static) selects this
      path over plain nested.
references:
  - key: garcia2008dismantling
    title: Dismantling MIFARE Classic
    authors: 'F. D. Garcia, G. de Koning Gans, R. Muijrers, P. van Rossum, R. Verdult, R. Wichers Schreur, B. Jacobs'
    venue: 'ESORICS 2008 (Springer LNCS 5283)'
    year: 2008
    url: 'https://link.springer.com/chapter/10.1007/978-3-540-88313-5_7'
    type: paper
  - key: garcia2009pickpocketing
    title: Wirelessly Pickpocketing a Mifare Classic Card
    authors: 'F. D. Garcia, P. van Rossum, R. Verdult, R. Wichers Schreur'
    venue: IEEE Symposium on Security and Privacy (S&P) 2009
    year: 2009
    url: 'https://doi.org/10.1109/SP.2009.6'
    type: paper
  - key: courtois2009darkside
    title: 'The Dark Side of Security by Obscurity and Cloning MiFare Classic Rail and Building Passes Anywhere, Anytime'
    authors: N. T. Courtois
    venue: SECRYPT 2009
    year: 2009
    url: 'https://eprint.iacr.org/2009/137'
    type: paper
  - key: meijer2015hardnested
    title: Ciphertext-only Cryptanalysis on Hardened Mifare Classic Cards
    authors: 'C. Meijer, R. Verdult'
    venue: ACM CCS 2015
    year: 2015
    url: 'https://doi.org/10.1145/2810103.2813641'
    type: paper
  - key: iso14443-1
    title: 'ISO/IEC 14443-1:2018: Cards and security devices for personal identification: Contactless proximity objects: Part 1: Physical characteristics'
    venue: ISO/IEC
    year: 2018
    url: 'https://www.iso.org/standard/73596.html'
    type: standard
  - key: iso15693-1
    title: 'ISO/IEC 15693-1:2018: Cards and security devices for personal identification: Contactless vicinity objects: Part 1: Physical characteristics'
    venue: ISO/IEC
    year: 2018
    url: 'https://www.iso.org/standard/70837.html'
    type: standard
  - key: pm3-iceman
    title: 'Proxmark3 (Iceman fork): RfidResearchGroup/proxmark3, client command reference'
    authors: RFID Research Group (Iceman)
    venue: GitHub
    year: 2026
    url: 'https://github.com/RfidResearchGroup/proxmark3/blob/master/doc/commands.md'
    type: tool
  - key: pm3-mfkey-examples
    title: 'Proxmark3 (Iceman fork): tools/mfc/card_reader/mfkey_examples.md, sample MIFARE Classic trace'
    authors: RFID Research Group (Iceman)
    venue: GitHub
    year: 2026
    url: 'https://github.com/RfidResearchGroup/proxmark3/blob/master/tools/mfc/card_reader/mfkey_examples.md'
    type: tool
tools:
  - pm3-client
  - chameleon-ultra-gui
  - bombercat
bsam: []
resources:
  - RFSAM-RES-13
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---
## Mechanism

RFID/NFC operates in two near-field bands that do not radiate to the far field, so unlike Wi-Fi or Sub-GHz there is no spectrum to sweep with an SDR: the reader is the instrument, and "seeing" a tag means energising it in the reader's magnetic field and reading back its carrier, standard and chip. The two bands are **LF 125/134 kHz** (EM4100/EM4102, HID Prox, Indala, HITAG, T5577, mostly fixed read-only IDs with little or no crypto) and **HF 13.56 MHz**, where ISO/IEC 14443-A/B governs proximity cards (MIFARE Classic/Ultralight, NTAG, DESFire, contactless EMV) [iso14443-1] and ISO/IEC 15693 governs vicinity cards (iCODE) [iso15693-1]. The carrier band is the first fork, because it decides every tool choice and the entire downstream attack tree.

The second fork is the chip family and its security mode, and it is decisive because the named attacks apply only to specific families. **MIFARE Classic** authenticates with the proprietary 48-bit Crypto1 stream cipher, which was reverse-engineered and shown breakable: the cipher and protocol were dismantled and key-recovery attacks demonstrated [garcia2008dismantling], and the "nested" attack recovers all remaining sector keys once any single key is known [garcia2009pickpocketing]. A **card-only** "darkside" attack recovers a first key from the card alone, with no known key and no legitimate reader, on cards whose pseudo-random nonce generator is exploitable [courtois2009darkside]; **hardened** MIFARE Classic (e.g. EV1) that resists the plain nested attack still falls to a **ciphertext-only** "hardnested" attack using roughly 1600 to 2200 collected nonces [meijer2015hardnested]. By contrast, LF EM4100/HID IDs carry no cryptographic secret to recover, and DESFire EV1/2/3 and modern NTAG (AES/3DES) are out of scope for the Crypto1 family entirely, so identifying the chip and its PRNG behaviour up front tells you which, if any, of these paths even applies.

This control is the SP-layer identification step that records that fork. For MIFARE Classic specifically, it also classifies the nonce/PRNG behaviour (weak vs hardened vs static), because that classification selects darkside vs nested vs hardnested vs staticnested downstream [courtois2009darkside][meijer2015hardnested]. The Iceman `hf mf info` PRNG section reports this directly, `Prng....... weak`, `Prng....... hard`, or `Static nonce... yes` / `Static enc nonce... yes` for the respective classes [pm3-iceman]. There is also a passive identification path: when a legitimate reader and card are already transacting, the reader can sniff that exchange without transmitting, reading the standard and UID off a genuine transaction.

## Procedure

All steps below are authorised-testing steps: run them only against cards you own or are explicitly permitted to test, on your own reader. Energising a tag and sniffing a reader↔card exchange should be confined to your test set / a shielded environment.

1. **Identify the LF band.** Place the card on the LF antenna and run the autodetect:
   ```
   pm3 --> lf search
   ```
   A 125 kHz tag reports its standard and decoded ID, e.g. `Valid EM410x ID found!` with the 40-bit ID, or `Valid HID Prox ID found!` with the facility/card number. "No known 125/134 kHz tags found" means it is not an LF credential, move to HF. [pm3-iceman]

2. **Identify the HF band.** Place the card on the HF antenna and run:
   ```
   pm3 --> hf search
   ```
   This fingerprints the standard and chip, e.g. `Valid ISO 14443-A tag found` with the UID, SAK, ATQA and a chip guess (MIFARE Classic 1K, MIFARE Ultralight, NTAG21x, MIFARE DESFire), or an `ISO 15693` / iCODE match. The reported SAK/ATQA and chip guess are the fork: Classic → Crypto1 path; DESFire/NTAG → strong crypto, stop. [pm3-iceman][iso14443-1]

3. **Classify the MIFARE Classic PRNG (only if step 2 says Classic).** Read the card's nonce/PRNG behaviour:
   ```
   pm3 --> hf mf info
   ```
   The output reports the UID, ATQA/SAK, magic-tag capability and the PRNG/nonce type, printed in its "PRNG Information" section. `Prng....... weak` indicates the card-only darkside path is viable [courtois2009darkside]; `Prng....... hard` selects the hardnested path [meijer2015hardnested]; `Static nonce... yes` / `Static enc nonce... yes` indicates the static-nested path. Record which. [pm3-iceman]

4. **Record the UID format and cloneability.** Note the UID length (4-byte vs 7-byte) and whether the credential's security rests on UID-only identification. A UID-only access decision is cloneable regardless of band or crypto and should be flagged at this step, independent of any key recovery.

5. **(Optional) Passive identification from a live transaction.** Where a genuine reader and card are transacting and you are authorised to observe, sniff without transmitting:
   ```
   pm3 --> hf 14a sniff
   ```
   Read the standard, the UID and the command traffic off the reader's own field, adding no field of your own. (A pocket alternative: a ChameleonUltra GUI or BomberCat HF field-read identifies the card when no Proxmark is to hand.)

## Field case

A sample MIFARE Classic trace shipped with Proxmark3 (RfidResearchGroup/proxmark3, `tools/mfc/card_reader/mfkey_examples.md`, "Sample trace") documents a genuine ISO/IEC 14443-A 1K card and makes the identification fork concrete [pm3-mfkey-examples]. In that trace the card's anticollision reply gives **ATQA `0004`** (`TAG 04 00`) and **SAK `08`** (`TAG 08 b6 dd`), the MIFARE Classic 1K fingerprint, with UID **`9C599B32`** (`TAG 9c 59 9b 32 6c`). The repository's own usage line labels `9C599B32` as the card's `<uid>` and feeds the captured authentication nonces to mfkey64 to recover a Crypto1 sector key, i.e. it is a **weak-Crypto1 (attackable-PRNG) MIFARE Classic 1K** [pm3-mfkey-examples]. An LF pass over the same band would have returned nothing, since this is a 13.56 MHz HF credential, not a 125 kHz one.

That single sequence sets the whole assessment: a **MIFARE Classic 1K with a weak PRNG** is in scope for the card-only darkside bootstrap [courtois2009darkside] then nested key recovery [garcia2009pickpocketing]; a **hardened** one would instead route to hardnested [meijer2015hardnested]; had `hf search` reported **DESFire** or **NTAG**, the Crypto1 family would not apply and the assessment would pivot to its AES/configuration posture. The fork, `UID-only` vs `Crypto1` vs `DESFire AES`, is exactly what this control records, and it is decided before a single key is touched.

The SAK `08` / ATQA `0004` pair seen in this sample trace is the well-known MIFARE Classic 1K fingerprint, but it should always be confirmed against the specific card under test: cloned/magic Gen1a/Gen2 cards can present a non-standard SAK/ATQA even though they emulate a 1K.

## Remediation

This is an identification control; the finding it produces is "what kind of credential is this, and is it cloneable on identity alone." Remediation is therefore about not depending on a weak credential class once identified.

- **Developer (credential/chip choice):** do not deploy MIFARE Classic / Crypto1 or LF EM/HID Prox for any access decision that matters, they are identified here precisely because their family is broken [garcia2008dismantling][courtois2009darkside][meijer2015hardnested]. Specify DESFire EV2/EV3 (AES) or equivalent, and never make an access decision on UID alone (the UID is read, and cloned, at this very step).
- **Integrator (system design):** bind the access decision to cryptographic mutual authentication with diversified per-card keys, not to the card number or facility code that `lf search` / `hf search` print in the clear. Treat any system where identification alone (steps 1 to 2) yields everything needed to clone as already compromised.
- **Operator (monitoring/lifecycle):** inventory the credential families actually in the field (this control is the inventory tool), prioritise migrating off LF Prox and MIFARE Classic, and where migration lags, add reader-side anti-cloning/anti-relay checks and audit logging so a cloned UID does not pass silently. Frame any chip/CVE corpus as representative, check current NXP advisories, since chip families and their known weaknesses date quickly.
