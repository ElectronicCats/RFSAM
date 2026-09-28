# Contributing to RFSAM

RFSAM grows by pull request. A good contribution is a control that is **accurate, cited, and reproducible**: wrong depth is worse than missing depth, so every nontrivial claim must carry a source you can check.

## Add a control

1. Copy `src/content/controls/_template.md` to `src/content/controls/<id>.md`, where `<id>` is the lower-cased control ID (e.g. `rfsam-zigbee-cr-01.md`).
2. Fill the frontmatter and the body sections.
3. Run `npm run validate` and `npm run build`: both must pass.
4. Open a pull request.

## The control ID

`RFSAM-<PROTOCOL>-<LAYER>-<NN>`, e.g. `RFSAM-BLE-AT-01`.

- `<PROTOCOL>` is one of the protocol ids (`BLE`, `WIFI`, `LORA`, `LTE`, `RFID`, `SUBG`, `ZIGBEE`, `ZWAVE`, `THREAD`, `GNSS`, `ADSB`, `NR5G`, `GSM`, `UWB`).
- `<LAYER>` is one of `IG SP PHY LL CR AT AP`.
- `<NN>` is a two-digit sequence number.

**The protocol and layer segments must equal the `protocol` and `layer` frontmatter fields.** Validation fails otherwise.

## Schema

Frontmatter (validated by `src/content.config.ts` and `scripts/validate.mjs`):

| field | notes |
|---|---|
| `id`, `title`, `protocol`, `layer`, `criticality` | required; criticality ∈ `info low medium high critical` |
| `applicability` | strings, e.g. `["BLE"]` |
| `deferred` | `true` when the judgement is owned by BSAM |
| `objective` | one testable statement of what the control verifies (required once `draft`/`verified`) |
| `intro` | short callout shown above the body |
| `prerequisites` | `hardware[]`, `software[]`, `signal{freq,bandwidth,modulation}`, `skill` |
| `attacks[]` | `{name, cve?, refs[], impact, preconditions, summary}`; each `refs` key MUST exist in `references` |
| `references[]` | `{key, title, authors?, venue?, year?, url, type}`; `type ∈ paper cve talk spec standard tool blog` |
| `tools[]` | slugs that exist in `src/content/tools/` |
| `bsam[]` | ids that exist in the BSAM registry (`src/data/bsam.js`) |
| `resources[]` | `RFSAM-RES-NN` ids that exist in `src/content/resources/` |
| `reviewStatus` | `stub` → `draft` → `verified` |
| `confidence` | `low medium high`: honest self-assessment of the draft |
| `lastResearched` | date the sources were pulled |

Body sections, in order: `## Mechanism`, `## Procedure`, `## Field case`, `## Remediation`. Put real commands in fenced code blocks with the expected output. Preserve command strings verbatim.

## Criticality rubric

- **info**: observational; no direct security impact (e.g. capture feasibility).
- **low**: minor exposure or hardening gap.
- **medium**: meaningful weakness requiring specific conditions to exploit.
- **high**: readily exploitable weakness with significant impact.
- **critical**: full compromise (takeover, key recovery, impersonation) with practical preconditions.

## Research → verify workflow

1. **Research** the sources (papers, CVE databases, specs, tool docs, talks). Record each as a `references[]` entry with a resolvable URL.
2. **Draft** to the schema. Every nontrivial claim in `## Mechanism` and every attack maps to a reference. Set `reviewStatus: draft`.
3. **Be honest about uncertainty.** Set `confidence` accordingly, and mark any claim you could not fully verify:
   ```
   > [!FLAG] the claim: what still needs to be checked
   ```
4. **Verify.** A reviewer resolves the flags and confirms the citations, then sets `reviewStatus: verified`. A `verified` control must carry at least one reference and contain no unresolved `[!FLAG]`.

Never assert something you cannot cite. If a claim can't be sourced, drop it or flag it.

## License

By contributing you agree your contribution is licensed under **CC BY‑SA 4.0**.
