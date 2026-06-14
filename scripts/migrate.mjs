import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export function toolSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function controlToFile(c) {
  const frontmatter = {
    id: c.id,
    title: c.title,
    protocol: c.protocol,
    layer: c.layer,
    criticality: c.criticality,
    applicability: c.applicability ?? [],
    ...(c.deferred ? { deferred: true } : {}),
    ...(c.intro ? { intro: c.intro } : {}),
    attacks: (c.attacks ?? []).map((a) => ({
      name: a.name,
      refs: [],
      ...(a.ref ? { note: a.ref } : {}),
      summary: a.what ?? '',
    })),
    references: [],
    ...(c.bsam ? { bsam: c.bsam } : {}),
    ...(c.resources ? { resources: c.resources } : {}),
    reviewStatus: 'stub',
    confidence: 'low',
  };

  const sections = [];
  if (c.description) sections.push(`## Mechanism\n\n${c.description}`);
  if (c.procedure?.length) {
    const steps = c.procedure.map((s, i) => `${i + 1}. ${s}`).join('\n');
    sections.push(`## Procedure\n\n${steps}`);
  }
  if (c.example) sections.push(`## Field case\n\n${c.example}`);
  if (c.remediation) sections.push(`## Remediation\n\n${c.remediation}`);
  const body = sections.join('\n\n') + '\n';

  return { frontmatter, body };
}

// ---- legacy loader ----
export function loadLegacy(path = 'reference/rfsam-data.js') {
  const text = readFileSync(path, 'utf8');
  // The file is `const RFSAM = { ... };` with no export; evaluate and return it.
  const fn = new Function(`${text}\n;return RFSAM;`);
  return fn();
}

function writeData(dir, name, exportName, value) {
  const out = `export const ${exportName} = ${JSON.stringify(value, null, 2)};\n`;
  writeFileSync(join(dir, name), out);
}

export function runMigration() {
  const R = loadLegacy();
  const cDir = 'src/content/controls';
  const rDir = 'src/content/resources';
  const tDir = 'src/content/tools';
  const dDir = 'src/data';

  // Wipe only the generated content dirs; never delete src/data (authored
  // protocols.js / coverage-map.js live there).
  for (const d of [cDir, rDir, tDir]) {
    if (existsSync(d)) rmSync(d, { recursive: true, force: true });
    mkdirSync(d, { recursive: true });
  }
  mkdirSync(dDir, { recursive: true });

  for (const c of R.controls) {
    const { frontmatter, body } = controlToFile(c);
    writeFileSync(join(cDir, `${c.id.toLowerCase()}.md`), matter.stringify(body, frontmatter));
  }
  for (const r of R.resources) {
    writeFileSync(join(rDir, `${r.id.toLowerCase()}.md`),
      matter.stringify(`${r.body}\n`, { id: r.id, title: r.title }));
  }
  for (const t of R.tools) {
    writeFileSync(join(tDir, `${toolSlug(t.name)}.md`),
      matter.stringify(`${t.note}\n`,
        { name: t.name, vendor: t.vendor, ec: !!t.ec, protocols: t.protocols ?? [], note: t.note }));
  }

  // singletons (protocols.js and coverage-map.js are authored, not generated)
  writeData(dDir, 'meta.js', 'meta', R.meta);
  writeData(dDir, 'layers.js', 'layers', R.layers);
  writeData(dDir, 'criticality.js', 'criticality', R.criticality);
  writeData(dDir, 'bsam.js', 'bsam', R.bsam);
  writeData(dDir, 'bsamRelation.js', 'bsamRelation', R.bsamRelation);

  return {
    controls: R.controls.length, resources: R.resources.length, tools: R.tools.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const counts = runMigration();
  console.log(`Migrated ${counts.controls} controls, ${counts.resources} resources, ${counts.tools} tools.`);
}
