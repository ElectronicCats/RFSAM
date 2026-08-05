# 01 — Authorization Protocol and Legal Framework

> **Read this before any active step (AT layer) or any transmission.** RFSAM is intrinsically
> dual-use. RF crosses physical property and regulated spectrum: what you receive may not be yours,
> and what you transmit is almost never legal without permission. This is not bureaucracy — it is the
> difference between an audit and a crime.

## Index
1. Three modes of operation
2. Legality matrix by technique
3. Confirmation protocol (gate 0)
4. Jurisdictions — quick reference
5. RF containment for lab
6. Scope documentation

---

## 1. Three modes of operation

Before starting, the agent **must ask** and record the mode:

| Mode | What it allows | What it prohibits |
|------|-------------|-------------|
| **(1) Observational / passive** | Passive RX (sniff, survey, waterfall) over traffic you can legally receive | Any TX, replay, injection, jamming, spoofing, connecting to third-party devices |
| **(2) Active with authorization** | All of the above + TX/replay/inject **only on your own equipment or with written authorization** from the owner, respecting power/duty-cycle limits of unlicensed spectrum | Any action on third-party equipment or licensed spectrum without a test license |
| **(3) Lab RF contained** | All of the above + jamming/spoofing/rogue-cell **inside a Faraday cage or conducted (wired)**, with test SIMs/devices | Radiating over the air jamming, GNSS, ADS-B, or false cells under any circumstances |

**Safe default**: if the user does not specify, or there is doubt → **mode (1) observational**. AT steps
are documented as hypotheses to verify in an authorized environment, **never executed**.

## 2. Legality matrix by technique

| Technique | Allowed without authorization? | Restrictions |
|---------|------------------------------|---------------|
| Passive reception (sniff, survey) | Generally yes | Third-party personal data is regulated (GDPR/privacy) |
| Capture traffic from your device | Yes (it is yours) | — |
| Capture third-party traffic | Depends | Usually illegal to decrypt/use; RX of public signals (ADS-B) OK |
| Connect to a third-party device (BLE GATT) | **No** without permission | Unauthorized access |
| Transmit / replay / forge | **No** without explicit permission from the device owner | — |
| Wi-Fi deauth / forced disconnection | **No** without permission | Disrupts third-party service |
| Jamming (saturating band) | **Almost never** | Illegal over the air in almost all jurisdictions (FCC, ITU) |
| GNSS spoofing over the air | **No** (crime) | Conducted/cable + cage only |
| ADS-B spoofing/forging over the air | **No** (protected aviation spectrum) | Conducted + cage only |
| Rogue cell LTE/GSM/5G (IMSI catcher) | **No** (licensed spectrum) | Lab + test SIMs + test license + cage only |
| Clone/emulate your own RFID | Yes (it is yours) | Cloning third-party credentials = fraud |
| Force re-pair/re-join of your network | Yes (it is yours) | — |

## 3. Confirmation protocol (gate 0)

**The first interaction of the agent with the user, before any capture, must be:**

> "Before proceeding, I need to confirm the authorization framework for this RF audit:
>
> 1. Is the target **yours** or are you **authorized in writing** to audit it?
> 2. In which mode do I work?
>    - (1) **Observational/passive** — RX only, without actively touching devices
>    - (2) **Active with authorization** — TX/replay/inject on authorized equipment
>    - (3) **Lab RF contained** — Faraday cage or conducted (wired)
>
> I will record your answer in `loot/scope.txt`. If there is doubt, I operate in observational mode."

- Record the answer in `loot/scope.txt` (created by the Phase 0 snippet in SKILL.md).
- **Re-verify** the scope before each AT step. If the scope says observational → block AT.
- On ambiguity ("it's a friend's", "I think I can") → assume observational and warn.

## 4. Jurisdictions — quick reference

> This is not legal advice. Orientation only. Verify local law before operating.

- **USA**: FCC regulates the spectrum. Jamming is illegal (Communications Act §333). GNSS spoofing
  is illegal. Interception of electronic communications (Wiretap Act) restricts content capture.
  Exceptions: equipment owner, with consent, or legal authority.
- **EU/UK**: national regulators + harmonized regulation. Interception without consent
  is illegal (Communications Act). GDPR applies to personal data in captures.
- **Latam**: varies. Generally: intercepting third-party communications is a crime; jamming is usually
  prohibited; passive RX of public signals is usually legal. Verify country by country.
- **Licensed spectrum (cellular)**: transmitting without a license is illegal **everywhere**. Working
  with rogue cells requires an experimental test license + containment.

**Universal principle**: transmitting on licensed bands, jamming over the air, or spoofing security
signals (GNSS, ADS-B) without authorization is a crime. Do not do it outside a contained lab.

## 5. RF containment for lab

For mode (3), the ways to contain the signal:

- **Faraday cage**: conductive box/structure that blocks outgoing/incoming RF. Verify
  attenuation with a phone inside (it must lose signal).
- **Conducted (wired)**: connect the SDR TX to the receiver/device under test via coaxial cable
  with attenuators, never via antenna. Eliminates over-the-air radiation.
- **Attenuators**: limit the power so the signal does not escape the wired setup.
- **Shielded GPSDO**: for GNSS spoofing, the TX goes via cable to the receiver under test, never over the air.

**Validation**: before transmitting in the lab, confirm with an external SDR or phone that there is
**no** signal leakage outside the containment.

## 6. Scope documentation

`loot/scope.txt` must contain at minimum:

```
Target: [device/signal description]
Owner / authorization: [OWN / CONTRACT <ref> / LAB]
Mode: [observational / active / lab-contained]
Authorized by: [name/role of authorizing party, if applicable]
Date: [ISO timestamp]
Protocol(s) in scope: [BLE / WIFI / ...]
Limitations: [e.g. RX only; no deauth; no cloning real credentials]
```

This file is what `scaffold_report.py` includes in the "Scope and authorization" section of the
report, and what justifies every active step executed.
