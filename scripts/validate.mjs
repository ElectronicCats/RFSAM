import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { parseControlId, CRITICALITY_IDS, TOOL_STATUSES } from '../src/lib/taxonomy.js';

export function checkControl({ data, body, file }, reg) {
  const errs = [];
  const tag = `${file}: `;
  const parsed = parseControlId(data.id);
  if (!parsed) {
    errs.push(`${tag}id '${data.id}' is not a valid RFSAM-<PROTO>-<LAYER>-<NN>`);
  } else {
    if (parsed.protocol !== data.protocol) errs.push(`${tag}id protocol segment '${parsed.protocol}' != protocol field '${data.protocol}'`);
    if (parsed.layer !== data.layer) errs.push(`${tag}id layer segment '${parsed.layer}' != layer field '${data.layer}'`);
  }
  if (!CRITICALITY_IDS.includes(data.criticality)) errs.push(`${tag}invalid criticality '${data.criticality}'`);
  if (!data.title?.trim()) errs.push(`${tag}empty title`);

  const refKeys = new Set((data.references ?? []).map((r) => r.key));
  for (const a of data.attacks ?? []) {
    for (const k of a.refs ?? []) {
      if (!refKeys.has(k)) errs.push(`${tag}attack '${a.name}' cites unknown reference key '${k}'`);
    }
  }
  for (const b of data.bsam ?? []) if (!reg.bsamKeys.has(b)) errs.push(`${tag}unknown BSAM id '${b}'`);
  for (const r of data.resources ?? []) if (!reg.resourceIds.has(r)) errs.push(`${tag}unknown resource id '${r}'`);
  for (const t of data.tools ?? []) if (!reg.toolSlugs.has(t)) errs.push(`${tag}unknown tool slug '${t}'`);

  if (['draft', 'reviewed', 'verified'].includes(data.reviewStatus)) {
    if (!data.objective?.trim()) errs.push(`${tag}${data.reviewStatus} control needs a non-empty objective`);
  }
  if (data.reviewStatus === 'reviewed' || data.reviewStatus === 'verified') {
    if (!(data.references ?? []).length) errs.push(`${tag}${data.reviewStatus} control needs at least one reference`);
    if (/\[!FLAG\]/.test(body)) errs.push(`${tag}${data.reviewStatus} control has unresolved [!FLAG] markers`);
  }
  return errs;
}

// Checks on one tool entry: software/successor slugs resolve, and a lifecycle
// status is never stated without its reason, its source and the date it was checked.
export function checkTool({ data, file }, reg) {
  const errs = [];
  const tag = `tools/${file}: `;
  for (const s of data.software ?? []) {
    if (!reg.toolSlugs.has(s)) errs.push(`${tag}unknown software slug '${s}'`);
  }
  if (data.successor && !reg.toolSlugs.has(data.successor)) {
    errs.push(`${tag}unknown successor slug '${data.successor}'`);
  }
  if (data.successor && !['eol', 'stale'].includes(data.status)) {
    errs.push(`${tag}successor is only meaningful with status 'eol' or 'stale'`);
  }
  if (data.status) {
    if (!TOOL_STATUSES.includes(data.status)) errs.push(`${tag}invalid status '${data.status}'`);
    if (data.status !== 'active' && !data.statusNote?.trim()) {
      errs.push(`${tag}status '${data.status}' needs a statusNote saying why`);
    }
    if (!data.statusSource) errs.push(`${tag}status '${data.status}' needs a statusSource url`);
    if (!data.statusChecked) errs.push(`${tag}status '${data.status}' needs a statusChecked date`);
  } else {
    for (const k of ['statusNote', 'statusSource', 'statusChecked']) {
      if (data[k]) errs.push(`${tag}${k} is set but status is not`);
    }
  }
  return errs;
}

function idsFromDir(dir, field) {
  const out = new Set();
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { data } = matter(readFileSync(join(dir, f), 'utf8'));
    out.add(field ? data[field] : f.replace(/\.md$/, ''));
  }
  return out;
}

export async function loadRegistries() {
  const { bsam } = await import('../src/data/bsam.js');
  return {
    bsamKeys: new Set(Object.keys(bsam)),
    resourceIds: idsFromDir('src/content/resources', 'id'),
    toolSlugs: idsFromDir('src/content/tools', null),
  };
}

export async function runValidation() {
  const reg = await loadRegistries();
  const dir = 'src/content/controls';
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const all = [];
  for (const f of files) {
    const { data, content } = matter(readFileSync(join(dir, f), 'utf8'));
    all.push(...checkControl({ data, body: content, file: f }, reg));
  }

  // Toolchain integrity: every referenced tool slug must exist, and every
  // hardware tool's `software` slugs must exist.
  const { toolchains } = await import('../src/data/toolchains.js');
  for (const [proto, tc] of Object.entries(toolchains)) {
    for (const [layer, def] of Object.entries(tc.layers ?? {})) {
      if (def.decoder && !reg.toolSlugs.has(def.decoder)) all.push(`toolchains.${proto}.${layer}: unknown decoder slug '${def.decoder}'`);
      for (const t of def.tools ?? []) {
        if (!reg.toolSlugs.has(t.tool)) all.push(`toolchains.${proto}.${layer}: unknown tool slug '${t.tool}'`);
        for (const d of t.deps ?? []) {
          if (!reg.toolSlugs.has(d)) all.push(`toolchains.${proto}.${layer}: unknown dep slug '${d}' under '${t.tool}'`);
        }
      }
    }
  }
  for (const f of readdirSync('src/content/tools').filter((f) => f.endsWith('.md'))) {
    const { data } = matter(readFileSync(join('src/content/tools', f), 'utf8'));
    all.push(...checkTool({ data, file: f }, reg));
  }
  return all;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errs = await runValidation();
  if (errs.length) {
    console.error(`✖ ${errs.length} validation error(s):`);
    for (const e of errs) console.error('  - ' + e);
    process.exit(1);
  }
  console.log('✔ all controls valid');
}
