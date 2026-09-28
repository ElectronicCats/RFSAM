import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkControl, checkTool } from './validate.mjs';

const registries = {
  bsamKeys: new Set(['BSAM-EN-01']),
  resourceIds: new Set(['RFSAM-RES-06']),
  toolSlugs: new Set(['btlejack']),
};

function base(overrides = {}) {
  return {
    data: {
      id: 'RFSAM-BLE-AT-01', protocol: 'BLE', layer: 'AT', criticality: 'high',
      title: 'Hijack', reviewStatus: 'stub', confidence: 'low',
      attacks: [], references: [], bsam: [], resources: [], tools: [],
      ...overrides.data,
    },
    body: overrides.body ?? '## Mechanism\n\nx\n',
    file: 'rfsam-ble-at-01.md',
  };
}

test('a clean stub passes', () => {
  assert.deepEqual(checkControl(base(), registries), []);
});

test('id layer/protocol segment must match fields', () => {
  const errs = checkControl(base({ data: { layer: 'CR' } }), registries);
  assert.ok(errs.some((e) => /layer segment/i.test(e)));
});

test('attack refs must exist in references', () => {
  const errs = checkControl(base({ data: { attacks: [{ name: 'x', refs: ['ghost'], summary: 's' }] } }), registries);
  assert.ok(errs.some((e) => /unknown reference key 'ghost'/i.test(e)));
});

test('bsam, resource and tool refs must resolve', () => {
  const errs = checkControl(base({ data: { bsam: ['BSAM-XX-99'], resources: ['RFSAM-RES-99'], tools: ['ghosttool'] } }), registries);
  assert.equal(errs.filter((e) => /unknown/i.test(e)).length, 3);
});

test('verified controls need objective, a reference and zero open flags', () => {
  const errs = checkControl(base({
    data: { reviewStatus: 'verified', references: [] },
    body: '## Mechanism\n\n> [!FLAG] unsure\n',
  }), registries);
  assert.ok(errs.some((e) => /objective/i.test(e)));
  assert.ok(errs.some((e) => /at least one reference/i.test(e)));
  assert.ok(errs.some((e) => /unresolved \[!FLAG\]/i.test(e)));
});

function tool(data = {}) {
  return { data: { slug: 'btlejack', name: 'Btlejack', type: 'software', ...data }, file: 'btlejack.md' };
}
const assessed = {
  status: 'mature', statusNote: 'Frozen but still works.',
  statusSource: 'https://example.org/source', statusChecked: '2026-09-23',
};

test('a tool with no lifecycle status passes', () => {
  assert.deepEqual(checkTool(tool(), registries), []);
});

test('a fully assessed tool passes', () => {
  assert.deepEqual(checkTool(tool(assessed), registries), []);
});

test('a status needs its note, its source and the date it was checked', () => {
  for (const k of ['statusNote', 'statusSource', 'statusChecked']) {
    const errs = checkTool(tool({ ...assessed, [k]: undefined }), registries);
    assert.equal(errs.length, 1, k);
    assert.match(errs[0], new RegExp(k));
  }
});

test('an active tool needs no note but still needs source and date', () => {
  assert.deepEqual(checkTool(tool({ ...assessed, status: 'active', statusNote: undefined }), registries), []);
});

test('an unknown status is rejected', () => {
  assert.match(checkTool(tool({ ...assessed, status: 'dead' }), registries)[0], /invalid status/);
});

test('a successor must resolve and is only accepted with eol or stale', () => {
  assert.match(checkTool(tool({ ...assessed, status: 'eol', successor: 'nope' }), registries)[0], /unknown successor/);
  assert.match(checkTool(tool({ ...assessed, successor: 'btlejack' }), registries)[0], /only meaningful with status/);
  assert.deepEqual(checkTool(tool({ ...assessed, status: 'eol', successor: 'btlejack' }), registries), []);
  assert.deepEqual(checkTool(tool({ ...assessed, status: 'stale', successor: 'btlejack' }), registries), []);
});

test('lifecycle fields without a status are rejected', () => {
  assert.match(checkTool(tool({ statusNote: 'x' }), registries)[0], /status is not/);
});
