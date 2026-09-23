import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { parseControlId, CRITICALITY_IDS } from '../src/lib/taxonomy.js';

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
    for (const s of data.software ?? []) {
      if (!reg.toolSlugs.has(s)) all.push(`tools/${f}: unknown software slug '${s}'`);
    }
    if (data.successor && !reg.toolSlugs.has(data.successor)) {
      all.push(`tools/${f}: unknown successor slug '${data.successor}'`);
    }
    if (data.status && data.status !== 'active' && !data.statusNote) {
      all.push(`tools/${f}: status '${data.status}' needs a statusNote saying why`);
    }
    if (data.status && !data.statusChecked) {
      all.push(`tools/${f}: status '${data.status}' needs a statusChecked date`);
    }
    if (data.successor && data.status !== 'eol') {
      all.push(`tools/${f}: successor is only meaningful with status 'eol'`);
    }
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
