import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controlToFile, toolSlug } from './migrate.mjs';

const legacy = {
  id: 'RFSAM-BLE-AT-01', protocol: 'BLE', layer: 'AT', criticality: 'high',
  title: 'Hijack a live BLE connection', applicability: ['BLE'],
  intro: 'Intro text.', description: 'Description text.',
  procedure: ['First step.', 'Second `cmd` step.'],
  attacks: [{ name: 'BTLEJack', ref: 'Cauquil 2018', what: 'Follows and hijacks.' }],
  resources: ['RFSAM-RES-06'], example: 'A `cur_aa` war story.',
  remediation: 'Fix it.',
};

test('controlToFile maps frontmatter and body faithfully', () => {
  const { frontmatter, body } = controlToFile(legacy);
  assert.equal(frontmatter.id, 'RFSAM-BLE-AT-01');
  assert.equal(frontmatter.reviewStatus, 'stub');
  assert.equal(frontmatter.confidence, 'low');
  assert.equal(frontmatter.intro, 'Intro text.');
  // legacy attack ref preserved as note; refs empty so validator stays green
  assert.equal(frontmatter.attacks[0].note, 'Cauquil 2018');
  assert.deepEqual(frontmatter.attacks[0].refs, []);
  assert.equal(frontmatter.attacks[0].summary, 'Follows and hijacks.');
  // prose goes to the body verbatim under fixed headings
  assert.match(body, /## Mechanism\n\nDescription text\./);
  assert.match(body, /## Procedure\n\n1\. First step\.\n2\. Second `cmd` step\./);
  assert.match(body, /## Field case\n\nA `cur_aa` war story\./);
  assert.match(body, /## Remediation\n\nFix it\./);
});

test('toolSlug slugifies names', () => {
  assert.equal(toolSlug('YARD Stick One'), 'yard-stick-one');
  assert.equal(toolSlug('Universal Radio Hacker'), 'universal-radio-hacker');
});
