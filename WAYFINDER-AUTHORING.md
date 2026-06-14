# Wayfinder authoring rules

How to add or extend a technology's wayfinder — the per-protocol page that walks a
researcher down the assessment descent and hands them the **kit** (hardware + software)
for what they want to do. BLE is the reference implementation; copy its shape.

Each technology is two files:
- **`src/data/toolchains/<proto>.js`** — its descent and tooling: `export default { "status":"complete", "facts":[…], "reference":…, "layers":{…} }` (a JSON object literal — valid JS, so double-quote keys/strings, no trailing commas, no comments).
- **`src/data/protocol-tools/<proto>.json`** — the new tools that protocol introduces (a JSON array). `scripts/seed-tools.mjs` folds every `protocol-tools/*.json` into the catalogue automatically.

Wire the toolchain in via one line in **`src/data/toolchains.js`** (`import <proto> from './toolchains/<proto>.js'` + `<KEY>: <proto>,`). BLE and Wi-Fi live inline in that file as the reference. Rendered by `src/pages/wayfinder/[protocol].astro`. Validated by `npm run validate`.

---

## The descent (fixed, do not rename)

Every protocol uses the same six plain-language steps, mapped onto RFSAM's layers:

| # | Step (what the user sees) | Layer(s) |
|---|---|---|
| 1 | Identify the device | `IG` |
| 2 | See it in the spectrum | `SP` |
| 3 | Capture the signal | `PHY` + `LL` |
| 4 | Break the crypto | `CR` |
| 5 | Take over / attack | `AT` |
| 6 | Test the app layer | `AP` |

Write content under the **layer** keys; the page maps them to the steps above.

---

## The ten rules

1. **Plain language, for someone who doesn't know the technology.** The steps and the
   `note`/`why` text must make sense to a researcher new to this protocol. Layer codes
   (`IG/SP/PHY/…`) stay underneath for experts; never lead with jargon.

2. **Every software node bonds to the hardware (or input) it depends on. Nothing floats.**
   You cannot run Sniffle without a CC1352 board; you cannot run ice9 without an SDR.
   Express it as `{ tool: 'sniffle', deps: ['catsniffer'] }`. A software bubble with no
   `deps` (and no `needs`) is a bug — unless the tool *is* the radio (rare).

3. **The decoder is the entry: step → decoder → software → hardware.** When a step has a
   `decoder` (e.g. `decoder: 'wireshark'`), it renders as the **first node connected to the
   step**. Each sniffer software hangs off the decoder, and each sniffer's radio hangs off the
   software. Read it as "open Wireshark → fed by Sniffle → running on CatSniffer." The decoder
   is a single shared node; never wire it straight to hardware, never make it a sibling tool.

4. **When the dependency is data, bond to its source and explain where to get it.** crackle
   needs a pairing PCAP, so `deps: ['wireshark']` and `needs: 'Capture it at the Capture
   step …, save it from Wireshark, then feed it to crackle.'` The `needs` text appears in
   the detail box.

5. **Software-led where the user picks a technique** (Capture, Attack, Spectrum): the bubble
   is the software/technique and the radio is its `deps`. For BLE *every* capture/attack tool
   is software-led — even the radio-native Ubertooth goes through its host software
   (`ubertooth-tools` → `ubertooth-one`) rather than appearing as a bare radio. Only use a
   hardware bubble as the primary when there genuinely is no software layer.

6. **Every `tool` and `dep` slug must exist in the tools catalogue** (`seed-tools.mjs`), and
   every catalogue entry must have a **verified** `repo` or `homepage`. **NEVER invent a URL.**
   Verify it first: `gh api repos/<owner>/<name>` or a web search. If you can't verify a tool
   or a claim, leave it out or flag it — see `[[no-unverified-claims]]`.

7. **`facts` per protocol** — band, channels, modulation, range, versions. Verified, concise.
   Shown at the top of the kit panel. (See BLE's `facts` array.)

8. **`lookFor` on the Identify step** — a short list of "common things to check on any
   <tech> device" (chipset/CVEs, version, identifiers, security mode, etc.).

9. **Intents are a soft lens, never a cage.** They highlight relevant steps and filter the
   kit; "Everything" is the default and nothing is ever hidden. Don't add per-protocol
   intents — the six are shared.

10. **`reference`** — if an established methodology owns a layer for this tech (BSAM owns
    BLE's link-and-above), set `reference: { name, url, note }`. Otherwise `null`.

---

## Schemas

**Tool catalogue** — `scripts/seed-tools.mjs`:
```js
{
  slug, name, vendor,
  type: 'hardware' | 'software' | 'project',
  protocols: [...],
  note,                 // one or two sentences
  spec?,                // e.g. SDR bandwidth/tuning range — shown as a mono line
  repo? | homepage?,    // VERIFIED url
  software?: [slugs],   // (for hardware) what runs on it, shown on the tool's own page
}
```

**Toolchain** — `src/data/toolchains.js`:
```js
PROTOCOL: {
  status: 'complete' | 'planned',
  facts?: [ { k, v }, … ],
  reference?: { name, url, note } | null,
  layers: {
    IG: { note?, lookFor?: [string, …] },
    SP: { note?, tools?: [...] },
    PHY|LL: { note?, decoder?: 'wireshark', tools?: [...] },
    CR|AT|AP: { note?, tools?: [...] },
  },
}
```

**A tool entry inside a layer's `tools`:**
```js
{
  tool,            // slug — the bubble (coloured by its catalogue type)
  deps?: [slugs],  // the hardware it runs on / the input it consumes (rule 2)
  role?,           // short label, e.g. 'Primary sniffer'
  why?,            // one sentence on when/why to pick it
  caveat?,         // a limitation (renders with ⚠)
  needs?,          // free-text dependency / where to get an input (rule 4)
}
```

---

## How to add a protocol

1. **Research the toolchain** for the technology — the real hardware and software at each
   step, and the reasons to pick each. Verify every repo/homepage (rule 6) and every
   technical fact (rule 7).
2. **Write the new tools** into `src/data/protocol-tools/<proto>.json` (a JSON array; reuse
   existing catalogue slugs instead of redefining them).
3. **Write the descent** into `src/data/toolchains/<proto>.js` (`export default { … }`),
   following the six steps and the ten rules. Set `status: "complete"`.
4. **Wire it in**: add `import <proto> from './toolchains/<proto>.js';` and `<KEY>: <proto>,`
   to `src/data/toolchains.js`.
5. **`node scripts/seed-tools.mjs && npm run validate && npm run build`** — all must pass
   (the validator checks every slug, dep and decoder resolves).
5. Open the page at `/wayfinder/<protocol>` and confirm the pipeline reads correctly.

A `planned` protocol with empty `layers` already renders the bare descent + controls; you
are upgrading it to `complete` by filling the tools.
