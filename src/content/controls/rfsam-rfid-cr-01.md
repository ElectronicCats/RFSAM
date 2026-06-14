---
id: RFSAM-RFID-CR-01
title: Assess Crypto1 key strength on MIFARE Classic
protocol: RFID
layer: CR
criticality: high
applicability:
  - MIFARE Classic (1K/4K)
  - MIFARE Classic EV1 (hardened PRNG)
  - MIFARE Plus in SL1 (Crypto1-compatible mode)
  - "MIFARE-compatible clones (Fudan FM11RF08/FM11RF08S, etc.)"
deferred: false
objective: >-
  Determine whether the Crypto1 sector keys protecting an ISO 14443-A MIFARE
  Classic credential can be recovered — card-only, with one known key, or from a
  sniffed reader transaction — and therefore whether the credential is clonable.
intro: >-
  MIFARE Classic's proprietary Crypto1 cipher uses a 48-bit key and a weak
  LFSR-based PRNG, and is fundamentally broken. Depending on the card's nonce
  behaviour, sector keys are recoverable card-only (no reader needed), with one
  known key, or from a captured reader authentication — making most Crypto1
  access systems effectively clonable. This control selects the applicable
  attack and recovers the keys; it is RFSAM-owned (RFID is near-field; there is
  no BSAM equivalent for this layer).
prerequisites:
  hardware:
    - 'A Proxmark3 (RDV4 or compatible, running the Iceman firmware) — the reference HF tool for both the cryptanalytic attacks and the dump'
    - 'Alternatively a libnfc-driven PN532 / ACR122U USB reader for the offline mfoc / mfcuk crackers, or a Chameleon Ultra for read/emulate'
    - 'A target MIFARE Classic card in the field, or physical access to a legitimate reader for the reader-side (mfkey) path'
  software:
    - 'pm3 client (Iceman): hf 14a info / hf mf info / autopwn / darkside / nested / hardnested / mf sim'
    - 'Or mfoc (nested) and mfcuk (darkside) on libnfc; mfkey32/mfkey64 for reader-side recovery'
  signal:
    freq: 'HF 13.56 MHz (ISO 14443-A) — near-field, magnetically coupled; no far-field radiation to survey'
    bandwidth: 'Subcarrier load modulation at 847.5 kHz (fc/16); ~106 kbit/s baseline data rate'
    modulation: 'Reader→card: 100% ASK with modified Miller coding. Card→reader: OOK load modulation of an 847.5 kHz subcarrier with Manchester coding (ISO 14443-A)'
  skill: intermediate
attacks:
  - name: Darkside attack
    refs:
      - courtois2009darkside
    impact: Recovers a first sector key with no prior key and no reader, by querying only the card for a few minutes.
    preconditions: A MIFARE Classic card with the original weak (16-bit-LFSR) PRNG that leaks via NACK and nonce repetition; ineffective against truly-random-nonce EV1 / hardened cards.
    summary: >-
      Card-only key recovery exploiting the Crypto1 NACK parity leak and nonce
      repetition — bootstraps the first key when no default key works.
  - name: Nested attack
    refs:
      - garcia2009pickpocket
    impact: Recovers all remaining sector keys once any one key is known, by triggering nested (sector-to-sector) authentications.
    preconditions: At least one known key (often a default/transport key) and a predictable PRNG so encrypted nonces can be guessed via the parity leak.
    summary: >-
      Given one known key and a predictable PRNG, recovers the remaining sector
      keys by filtering nonce guesses through the Crypto1 parity keystream leak.
  - name: Hardnested attack
    refs:
      - meijer2015hardnested
    impact: Recovers a key on hardened cards (MIFARE Classic EV1) that resist the plain nested attack, in roughly five minutes on a laptop.
    preconditions: One known key on the card; works against truly-random nonces by reducing the search from 2^48 to about 2^30 via ciphertext-only statistical cryptanalysis.
    summary: >-
      Defeats hardened MIFARE Classic EV1 (truly-random nonces) with a
      ciphertext-only statistical attack on collected nonces; needs one known key.
  - name: Static-encrypted-nonce break and FM11RF08S hardware backdoor
    refs:
      - teuwen2024fm11rf08s
    impact: Recovers keys on the most-hardened "static encrypted nonce" Crypto1 clones, and a shared hardware backdoor key compromises all user keys on affected Fudan cards.
    preconditions: A Fudan FM11RF08S (or related FM11RF08/FM11RF32/FM1208) card; a few minutes of card access. The backdoor key is common across the product line.
    summary: >-
      Breaks the static-encrypted-nonce variant designed to thwart all known
      card-only attacks, and documents a manufacturer backdoor key shared across
      FM11RF08S cards.
  - name: mfkey32 / mfkey64 reader-key extraction
    refs:
      - garcia2008dismantling
    impact: Recovers a sector key from one or two captured reader↔card authentications, attacking the reader side rather than the card.
    preconditions: The ability to sniff (or relay) a genuine reader authenticating to a real card for that sector; no card-only access needed.
    summary: >-
      Recovers a sector key from a sniffed reader authentication exchange using
      the Crapto1 keystream-recovery technique — attacks the reader, not the card.
references:
  - key: garcia2008dismantling
    title: Dismantling MIFARE Classic
    authors: 'F. D. Garcia, G. de Koning Gans, R. Muijrers, P. van Rossum, R. Verdult, R. Wichers Schreur, B. Jacobs'
    venue: 'ESORICS 2008, LNCS 5283, pp. 97–114'
    year: 2008
    url: 'http://www.cs.ru.nl/~rverdult/Dismantling_MIFARE_Classic-ESORICS_2008.pdf'
    type: paper
  - key: garcia2009pickpocket
    title: Wirelessly Pickpocketing a Mifare Classic Card
    authors: 'F. D. Garcia, P. van Rossum, R. Verdult, R. Wichers Schreur'
    venue: 'IEEE Symposium on Security and Privacy (S&P) 2009, pp. 3–15'
    year: 2009
    url: 'https://doi.org/10.1109/SP.2009.6'
    type: paper
  - key: courtois2009darkside
    title: 'The Dark Side of Security by Obscurity — and Cloning MiFare Classic Rail and Building Passes, Anywhere, Anytime'
    authors: N. T. Courtois
    venue: 'SECRYPT 2009 / IACR ePrint 2009/137'
    year: 2009
    url: 'https://eprint.iacr.org/2009/137'
    type: paper
  - key: meijer2015hardnested
    title: Ciphertext-only Cryptanalysis on Hardened MIFARE Classic Cards
    authors: 'C. Meijer, R. Verdult'
    venue: 'ACM CCS 2015'
    year: 2015
    url: 'http://cs.ru.nl/~rverdult/Ciphertext-only_Cryptanalysis_on_Hardened_Mifare_Classic_Cards-CCS_2015.pdf'
    type: paper
  - key: teuwen2024fm11rf08s
    title: 'MIFARE Classic: exposing the static encrypted nonce variant'
    authors: P. Teuwen
    venue: 'IACR ePrint 2024/1275 / Quarkslab'
    year: 2024
    url: 'https://eprint.iacr.org/2024/1275'
    type: paper
  - key: teuwen2024blog
    title: 'MIFARE Classic: exposing the static encrypted nonce variant… and a few hardware backdoors'
    authors: P. Teuwen (Quarkslab)
    venue: Quarkslab blog
    year: 2024
    url: 'https://blog.quarkslab.com/mifare-classic-static-encrypted-nonce-and-backdoors.html'
    type: blog
  - key: proxmark3-iceman
    title: Proxmark3 — Iceman fork (RfidResearchGroup)
    venue: GitHub
    url: 'https://github.com/RfidResearchGroup/proxmark3'
    type: tool
  - key: mfoc-tool
    title: 'mfoc — MIFARE Classic Offline Cracker (nested attack)'
    venue: GitHub (nfc-tools)
    url: 'https://github.com/nfc-tools/mfoc'
    type: tool
  - key: mfcuk-tool
    title: 'mfcuk — MiFare Classic Universal toolKit (darkside attack)'
    venue: GitHub (nfc-tools)
    url: 'https://github.com/nfc-tools/mfcuk'
    type: tool
tools:
  - pm3-client
  - proxmark3
  - mfoc
  - mfcuk
  - libnfc
  - acr122u
  - chameleon-ultra
resources:
  - RFSAM-RES-13
  - RFSAM-RES-14
reviewStatus: verified
confidence: high
lastResearched: 2026-06-14
---

## Mechanism

MIFARE Classic protects each sector with a pair of 48-bit Crypto1 keys (A and B) and authenticates with a three-pass challenge-response. The cipher and its protocol were reverse-engineered and fully dismantled in 2008: Crypto1 is a 48-bit LFSR stream cipher with a non-linear filter, fed by a 16-bit LFSR card nonce, and the keystream leaks through the parity bits transmitted over the air [`garcia2008dismantling`]. That parity leak, plus the predictability of the card nonce, is what every Crypto1 attack exploits — the 48-bit key space is never brute-forced directly.

The applicable attack depends on the card's nonce behaviour, so the first job of this control is to classify it:

- **Original weak PRNG (most legacy 1K/4K).** The card nonce comes from a 16-bit LFSR that the reader can advance to a known value, and the card leaks a NACK on bad parity. The **darkside** attack uses these two leaks to recover a first key card-only, with no reader and no prior key, in a few minutes [`courtois2009darkside`]. Once any one key is known, the **nested** attack triggers sector-to-sector ("nested") authentications and recovers every remaining key from the encrypted-nonce parity leak [`garcia2009pickpocket`].
- **Hardened PRNG (MIFARE Classic EV1 and hardened clones).** These emit truly-random nonces, defeating darkside and plain nested. The **hardnested** attack is a ciphertext-only statistical cryptanalysis that, given one known key, collects encrypted nonces and reduces the search from 2^48 to roughly 2^30, recovering a key in about five minutes on a single laptop core [`meijer2015hardnested`].
- **Static encrypted nonce (Fudan FM11RF08S and relatives).** A 2020-era "MIFARE-compatible" variant added a static-encrypted-nonce countermeasure specifically to thwart all known card-only attacks. In 2024 this was broken, and a **hardware backdoor key common to all FM11RF08S cards** was recovered: anyone who knows it can authenticate to and dump user sectors without the user keys, in a few minutes of card access [`teuwen2024fm11rf08s`, `teuwen2024blog`].

There is also a reader-side path. When a genuine reader is observed authenticating to a real card, **mfkey32** recovers a sector key from two authentication attempts on the same nonce, and **mfkey64** from a single full authentication — both reconstruct the Crypto1 state from the captured (encrypted) handshake rather than touching the card [`garcia2008dismantling`]. This is the route when the card itself is out of reach but a reader is not.

A practical shortcut precedes all of the above: enormous numbers of deployments never change the transport keys, so a **default/dictionary key check** (`FFFFFFFFFFFF`, `A0A1A2A3A4A5`, …) frequently recovers keys with no cryptanalysis at all. RFID is near-field and RFSAM-owned at this layer; LF tags and DESFire/AES cards are out of scope for these attacks — recognise them and stop, per the Wayfinder.

## Procedure

All steps below are active interrogation of a credential. Run them only against cards and readers you own or are explicitly authorised to test, with the card under your physical control.

1. **Identify the card and classify its PRNG.** With a Proxmark3 (Iceman), place the card on the antenna and fingerprint it:
   ```
   [usb] pm3 --> hf 14a info
   [usb] pm3 --> hf mf info
   ```
   Expected: `hf 14a info` prints the UID, SAK, ATQA and the chip guess (e.g. *MIFARE Classic 1K*). `hf mf info` reports the PRNG / nonce class — read it as **weak** (darkside/nested apply) vs **hard / static encrypted nonce** (hardnested or the FM11RF08S techniques apply). Note whether the UID is 4-byte or 7-byte and whether the card is a known Fudan clone.

2. **Try default and dictionary keys first.** Many systems never change them:
   ```
   [usb] pm3 --> hf mf chk *1 ? d
   ```
   Expected: a per-sector table of recovered keys A/B. If every sector resolves here, skip straight to step 6 — no cryptanalysis was needed (a finding in itself).

3. **Run the matching card-only attack.** For weak-PRNG cards with no known key, bootstrap one with darkside, or let `autopwn` orchestrate the whole chain:
   ```
   [usb] pm3 --> hf mf darkside
   [usb] pm3 --> hf mf autopwn
   ```
   Expected: `darkside` returns a recovered key for one sector after a few minutes; `autopwn` then chains darkside → nested → key-table → dump automatically. With the offline tools instead, on a PN532/ACR122U: `mfoc -O dump.mfd` (nested, needs one known/default key) or `mfcuk -C -R 0:A -s 250 -S 250` (darkside bootstrap).

4. **For hardened (EV1 / hard-PRNG) cards, use hardnested with one known key.** If a default key was found for any sector in step 2, recover the rest:
   ```
   [usb] pm3 --> hf mf nested
   [usb] pm3 --> hf mf hardnested --blk 0 -a -k FFFFFFFFFFFF --tblk 4 --ta
   ```
   Expected: `nested` handles predictable-PRNG cards; `hardnested` collects nonces and returns the target key in roughly five minutes [`meijer2015hardnested`]. (`autopwn` selects nested vs hardnested for you based on the step-1 classification.)

5. **Reader-side path (card unreachable, reader available).** Sniff a genuine authentication and recover the key offline:
   ```
   [usb] pm3 --> hf 14a sniff
   [usb] pm3 --> hf mf list
   ```
   Then feed the captured `{uid, nt, nr, ar}` (and `at` for mfkey64) to the recovery tool. Expected: mfkey32 yields a key from two captured attempts on the same nonce; mfkey64 from a single complete handshake.

6. **Dump every sector and assess clonability.** With the key table populated:
   ```
   [usb] pm3 --> hf mf dump
   [usb] pm3 --> hf mf autopwn          # also writes the dump + keyfile
   ```
   Expected: a full `*.bin` / `*.eml` dump plus the recovered key file. Parse it (e.g. `mfdread`) to read the access-control payload (facility/card number, value blocks). If all keys are recovered, the credential is clonable — to a magic Gen1a/Gen2 card or emulated from a Chameleon Ultra (see RFSAM-RES-14). Recovering the keys here, not the clone, is the finding this control records.

## Field case

Illustrative walkthrough — substitute the values you capture. A representative engagement against an office MIFARE Classic 1K badge, with written authorisation and the badge in hand:

1. `hf 14a info` returned *MIFARE Classic 1K (4-byte UID)*; `hf mf info` classified the PRNG as **weak**.
2. `hf mf chk *1 ? d` recovered sector 0 key A as the transport default `A0A1A2A3A4A5`, but sectors 1–15 did not resolve from the dictionary.
3. With one known key and a weak PRNG, `hf mf autopwn` chained nested authentication off sector 0 and recovered all 32 sector keys in under two minutes, then wrote `hf-mf-<UID>-dump.bin` and the keyfile.
4. Parsing the dump showed the access-control payload in sector 1 (a [FILL: facility/card-number layout for this specific deployment — not measured here]); the keys A/B for every sector were now known, so the badge was fully clonable to a magic card.

The finding such an engagement records is *all 16 sectors' Crypto1 keys recovered card-only in under two minutes, one of them still the transport default* — i.e. the credential provides no cryptographic protection. The hardened path differs only in the attack chosen: against an EV1 card, step 3 is replaced by `hf mf hardnested` seeded with the one default key, recovering a target key in about five minutes [`meijer2015hardnested`]; against an FM11RF08S clone, the static-encrypted-nonce techniques and the shared backdoor key apply instead [`teuwen2024fm11rf08s`]. The `[FILL: …]` access-control payload above is intentionally left unmeasured — substitute the facility/card-number layout you actually read; do not fabricate one.

## Remediation

**Developer / product team.** Do not design new systems on MIFARE Classic or any Crypto1-compatible card (including MIFARE Plus operated in SL1 and "MIFARE-compatible" clones). Crypto1 is broken by design — a 48-bit key with a parity keystream leak — and no card-only countermeasure has held: even the static-encrypted-nonce FM11RF08S fell and shipped with a shared hardware backdoor [`teuwen2024fm11rf08s`]. Specify audited cryptographic credentials (MIFARE DESFire EV2/EV3 with AES, or equivalent) with per-card diversified keys and challenge-response that binds to card-authenticated data, not to the UID.

**Integrator.** Never authorise on UID alone — UIDs are freely clonable to magic cards regardless of Crypto1. If a Crypto1 deployment cannot be replaced immediately, at minimum change all transport/default keys (a default key collapses the entire attack chain to step 2), use both A and B keys with least-privilege access bits, and plan migration; treat every Crypto1 sector key as recoverable by an attacker with a few minutes of card or reader access.

**Operator.** Assume any Crypto1 badge in your environment is clonable and act at the backend: enable anti-passback and impossible-travel / velocity anomaly detection, log and alert on duplicate-UID or out-of-sequence reads, and shorten credential lifetimes. These do not fix the card — they detect use of a clone after the keys are gone — so prioritise migration off Crypto1 over compensating controls.
