---
id: RFSAM-PROTO-LAYER-NN          # e.g. RFSAM-ZIGBEE-CR-01; segments must match protocol+layer below
title: Short imperative title
protocol: ZIGBEE                   # one of the protocol ids
layer: CR                          # IG | SP | PHY | LL | CR | AT | AP
criticality: medium                # info | low | medium | high | critical
applicability: ["Zigbee"]
deferred: false
objective: The one testable thing this control verifies.
intro: One- or two-sentence callout shown above the body.
prerequisites:
  hardware: ["..."]
  software: ["..."]
  signal: { freq: "...", bandwidth: "...", modulation: "..." }
  skill: intermediate              # beginner | intermediate | advanced
attacks:
  - name: Example attack
    cve: ["CVE-YYYY-NNNNN"]
    refs: ["smith2024"]            # keys that MUST exist in references below
    impact: What it lets an attacker do.
    preconditions: What must be true first.
    summary: One-line description.
references:
  - key: smith2024
    title: Paper or advisory title
    authors: A. Smith et al.
    venue: Conference / journal / vendor
    year: 2024
    url: https://example.org/source
    type: paper                    # paper | cve | talk | spec | standard | tool | blog
tools: ["proxmark3"]               # slugs from the tools collection
bsam: []                           # BSAM registry ids, if deferring
resources: []                      # RFSAM-RES-NN ids
reviewStatus: draft                # stub | draft | verified
confidence: medium                 # low | medium | high
lastResearched: 2026-01-01
---

## Mechanism

How the RF/protocol works and why this control matters. Every nontrivial claim
cites a `references[]` entry. Mark anything unverified with:

> [!FLAG] claim, what still needs to be checked

## Procedure

1. Step with a real command:
   ```bash
   tool --flag value
   ```
   Expected output and how to read it.

## Field case

A worked example with real data. Preserve command strings verbatim.

## Remediation

Specific, layered guidance (developer / integrator / operator).
