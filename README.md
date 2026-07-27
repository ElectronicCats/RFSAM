# RFSAM — Radio Frequency Security Assessment Methodology

An open, structured methodology for RF research and auditing, by [Electronic Cats](https://electroniccats.com) and [PWNLabs](https://pwnlab.mx).

RFSAM is meant to be **a north** for RF work: faced with an unknown signal or device, where do you start — and how do you know what you've missed? It walks you from the spectrum up through the signal, link, crypto, attack and application layers, per protocol, with a verification procedure and a real worked example at each step.

It does **not** claim to invent RF security. OSSTMM, BSAM, the SDR‑pentest lineage and a deep body of research came first; RFSAM organises that landscape into something you can navigate by. For Bluetooth at the link layer and above it defers to [Tarlogic's BSAM](https://www.tarlogic.com/bsam/) rather than duplicating it.

## The model

Controls are indexed on two axes — **protocol** and **layer**. The layer axis is a descent from spectrum down to application:

| | layer | what it asks |
|---|---|---|
| `IG` | Info Gathering | identify components, check known CVEs (pre‑descent) |
| `SP` | Spectrum | what is transmitting, can you see it |
| `PHY` | Signal / PHY | waveform → bits |
| `LL` | Link / Protocol | frames, addressing, identifiers |
| `CR` | Crypto | pairing, keys, confidentiality, integrity |
| `AT` | Attack | injection, replay, hijack, rogue infrastructure |
| `AP` | Application | what the device trusts above the link |

Control IDs follow `RFSAM-<PROTOCOL>-<LAYER>-<NN>` (e.g. `RFSAM-BLE-AT-01`). The protocol and layer segments must match the control's fields — this is enforced in validation.

Each control carries a `reviewStatus`: **stub** (migrated outline), **draft** (researched and cited, awaiting review), or **verified** (checked). Every nontrivial claim cites a source; uncertain claims are flagged inline for review.

## Repository structure

```
src/content/controls/   one Markdown file per control (+ _template.md)
src/content/resources/   reusable procedures referenced by controls
src/content/tools/       the standard-tooling reference
src/data/                meta, layers, criticality, protocols, BSAM registry, coverage map
src/components, src/layouts, src/pages, src/styles   the Astro site
scripts/migrate.mjs      one-time import of the legacy corpus
scripts/validate.mjs     ID and cross-reference validation
src/lib/taxonomy.js      layer/protocol ids and the control-id rule
reference/               provenance: the original corpus and prototype
```

The site is built with [Astro](https://astro.build) and deployed to GitHub Pages at **rfsam.electroniccats.com**.

## Running locally

```bash
npm install
npm run dev        # local dev server
npm run build      # static build into dist/
npm run validate   # ID + cross-reference checks
npm test           # unit tests for the scripts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the control schema, the ID/layer rules, the criticality rubric, and how to add a control. Pull requests welcome.

## License

The methodology content is licensed **CC BY‑SA 4.0** — see [LICENSE](LICENSE). Reuse and adapt it with attribution to Electronic Cats, sharing derivatives under the same license.
