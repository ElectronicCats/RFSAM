# Controls authoring rules

How to research and write an RFSAM **control** — one numbered, cited, reproducible
verification procedure for a single *protocol × layer*. This is the brief a
contributor or a sub-agent follows.

The machine-checkable schema lives in `src/content.config.ts`; the human PR flow,
the field-by-field table and the criticality rubric live in **`CONTRIBUTING.md`**;
copy **`src/content/controls/_template.md`** to start; **`rfsam-ble-at-01.md`** is
the reference depth. This file is the *operational* guide — what makes a control
accurate, reproducible, and consistent with the rest of RFSAM.

---

## What a control is

A control answers one question: **"can you verify ⟨X⟩ on this technology, and what
do you do about it?"** It is scoped to exactly one protocol (BLE, ZWAVE, …) and one
layer of the descent (IG/SP/PHY/LL/CR/AT/AP). It must be **reproducible** (a numbered
procedure with real commands) and **cited** (every nontrivial claim carries a
resolvable source). Wrong depth is worse than missing depth.

A control is **not** the Wayfinder. The Wayfinder (`src/data/toolchains/<proto>.js`)
is the *kit map* — what hardware + software to use at each step. A control is the
*method and the finding* — how to run the check, a real worked example, the known
attacks with references, and the remediation. They are **paired**: a control's
`layer`, `tools[]` and `attacks[]` must be consistent with that protocol's Wayfinder
toolchain at the same layer (read it first; the bands, tools and attack framing are
already researched there).

---

## File & ID

- One control per file: `src/content/controls/<id-lowercased>.md` — e.g. `rfsam-zwave-cr-01.md`.
- `id` = `RFSAM-<PROTOCOL>-<LAYER>-<NN>`. **Invariant: the PROTOCOL and LAYER segments MUST equal the `protocol` and `layer` frontmatter fields.** The validator fails otherwise.
- Protocols: `BLE WIFI LORA LTE RFID SUBG ZIGBEE ZWAVE THREAD GNSS ADSB NR5G GSM UWB`. Layers: `IG SP PHY LL CR AT AP`.

## Frontmatter

Full schema + table: `CONTRIBUTING.md` / `src/content.config.ts`. The must-gets:
- `title` short + imperative; `criticality` per the rubric; `objective` = the one testable thing it verifies (required once `draft`).
- `prerequisites { hardware[], software[], signal{freq,bandwidth,modulation}, skill }` — pull the signal facts from the protocol's Wayfinder `facts`.
- `attacks[]` = named real attacks `{name, cve?, refs[], impact, preconditions, summary}`. **Every `refs` key MUST exist in `references[]`.**
- `references[]` = `{key, title, authors?, venue?, year?, url, type}`. **Every `url` must resolve and actually be the cited work.**
- `tools[]` = slugs that exist in `src/content/tools/` (reuse the protocol's Wayfinder tools).
- `bsam[]` = ids that exist in the BSAM registry (`src/data/bsam.js`); set when deferring.
- `resources[]` = `RFSAM-RES-NN` ids that exist in `src/content/resources/`.
- `reviewStatus` + `confidence` (lifecycle below); `lastResearched` = the date you pulled the sources.

## Body — four sections, in order

`## Mechanism` → `## Procedure` → `## Field case` → `## Remediation`.
- **Mechanism** — how the RF/protocol works and why the control matters. Every nontrivial claim cites a `references[]` key. Name the real attack families.
- **Procedure** — a NUMBERED, reproducible method, with real commands in fenced code blocks and the expected output / how to read it. Preserve command strings verbatim.
- **Field case** — a concrete worked example with real data (the war story). Keep author field data and any intentional `[FILL: …]` placeholder verbatim — do NOT fabricate a finding.
- **Remediation** — specific, layered guidance (developer / integrator / operator).

---

## The ten rules (accuracy first)

1. **Cite or flag everything.** Every nontrivial claim, attack and number maps to a resolvable `references[]` entry. Verify each source actually exists and says what you claim — `gh api repos/<o>/<n>` for a tool, the NVD page for a CVE, the real paper/talk URL. Never assert what you can't cite. (`[[no-unverified-claims]]`)
2. **Flag uncertainty inline:** `> [!FLAG] the claim — what still needs checking`. A `draft` may carry flags; a `verified` control must have none.
3. **A sub-agent produces `draft`, never `verified`.** Verification is a separate review pass that resolves the flags and confirms the citations. Set `confidence` honestly (`low`/`medium`/`high`).
4. **Align with the Wayfinder.** Read `src/data/toolchains/<proto>.js` for this layer first: reuse its `facts` (bands/modulation), its tools (as `tools[]`), and its attack framing. A control *deepens* what the Wayfinder summarises — they must not contradict.
5. **BSAM deference.** Where BSAM owns the layer (BLE link-and-above; the deferred IG controls), set `deferred: true`, cite the specific `bsam[]` ids, and describe ONLY the RF-capture prerequisite that reaches the point where the BSAM control applies — do not re-derive BSAM's content. (`src/data/bsamRelation.js`)
6. **Tone: a north, not novelty.** RFSAM orients and organises; it builds on OSSTMM / BSAM / the SDR-pentest lineage. Never "first / nobody does this / invented". Frame tool & CVE corpora as "representative, check current advisories".
7. **Authorised-testing framing** on every active / transmit / decrypt step (rogue cells, replay, key recovery): your own equipment, test SIMs/devices, RF shielding, explicit permission.
8. **Verbatim load-bearing content.** Monospace command strings, war-story values (`cur_aa`, `w 0x000e 7e 07 05 03 ff 00 00 10 ef`) and `[FILL: …]` notes are kept exactly — never paraphrase, "complete", or invent them.
9. **Criticality honestly** per the CONTRIBUTING rubric (info → critical). Observational capture-feasibility is `info`/`low`; full takeover / key recovery / impersonation is `high`/`critical`.
10. **It must validate and build.** Controls don't need `seed-tools`, but `npm run validate` (cross-refs) and `npm run build` (zod schema) MUST pass. The validator checks: id ↔ protocol ↔ layer; every `tools` / `bsam` / `resources` / attack-`refs` reference resolves; enums valid; no empty required fields.

---

## reviewStatus / confidence lifecycle

`stub` (placeholder, little real content) → `draft` (researched, cited, may carry `[!FLAG]`s — what a sub-agent produces) → `verified` (a reviewer resolved every flag and confirmed every citation; ≥ 1 reference, zero unresolved flags). Sub-agents stop at `draft`.

## What to write (coverage)

`src/data/coverage-map.js` and the `/roadmap` page list every control: `existing`
(a file exists — but most are `stub`s needing depth) and `planned` (proposed scope,
unwritten). A sub-agent task is usually **either** deepen one existing stub to
`draft`, **or** write one planned control to `draft`. **One control per sub-agent.**

## Launching a sub-agent for a control

Give each sub-agent ONE control id. Tell it to:
1. Read this file, `_template.md`, `CONTRIBUTING.md`, the protocol's Wayfinder
   (`src/data/toolchains/<proto>.js`), and the existing stub if any.
2. Research and **verify every source** (gh/web) — papers, CVEs (NVD), specs, tool repos, talks.
3. Write `src/content/controls/<id>.md` as `reviewStatus: draft` with an honest
   `confidence`, citing every claim and `[!FLAG]`-ing anything it could not fully verify.
4. NOT run the shared `seed-tools` (controls don't need it); just self-check the
   frontmatter parses and the `tools`/`bsam`/`resources`/`refs` it used resolve.
5. Return the file path and a short list of what it flagged.

Run `npm run validate && npm run build` centrally after the batch.
