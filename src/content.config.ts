import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  LAYER_IDS, PROTOCOL_IDS, CRITICALITY_IDS, REVIEW_STATUSES, CONFIDENCE_LEVELS,
  TOOL_STATUSES,
} from './lib/taxonomy.js';

const layer = z.enum(LAYER_IDS as [string, ...string[]]);
const protocol = z.enum(PROTOCOL_IDS as [string, ...string[]]);

const reference = z.object({
  key: z.string(),
  title: z.string(),
  authors: z.string().optional(),
  venue: z.string().optional(),
  year: z.number().int().optional(),
  url: z.string().url(),
  type: z.enum(['paper', 'cve', 'talk', 'spec', 'standard', 'tool', 'blog']),
});

const attack = z.object({
  name: z.string(),
  cve: z.array(z.string()).optional(),
  refs: z.array(z.string()).default([]),   // keys into references[]
  note: z.string().optional(),             // freeform citation (legacy/quick)
  impact: z.string().optional(),
  preconditions: z.string().optional(),
  summary: z.string(),
});

const controls = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/controls' }),
  schema: z.object({
    id: z.string().regex(/^RFSAM-[A-Z0-9]+-[A-Z]+-\d{2}$/),
    title: z.string().min(1),
    protocol,
    layer,
    criticality: z.enum(CRITICALITY_IDS as [string, ...string[]]),
    applicability: z.array(z.string()).default([]),
    deferred: z.boolean().default(false),
    objective: z.string().optional(),
    intro: z.string().optional(),
    prerequisites: z.object({
      hardware: z.array(z.string()).default([]),
      software: z.array(z.string()).default([]),
      signal: z.object({
        freq: z.string().optional(),
        bandwidth: z.string().optional(),
        modulation: z.string().optional(),
      }).optional(),
      skill: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).optional(),
    attacks: z.array(attack).default([]),
    references: z.array(reference).default([]),
    tools: z.array(z.string()).default([]),
    bsam: z.array(z.string()).default([]),
    resources: z.array(z.string()).default([]),
    reviewStatus: z.enum(REVIEW_STATUSES as [string, ...string[]]).default('stub'),
    confidence: z.enum(CONFIDENCE_LEVELS as [string, ...string[]]).default('low'),
    lastResearched: z.coerce.date().optional(),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({ id: z.string(), title: z.string() }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    slug: z.string().optional(),
    name: z.string(),
    vendor: z.string(),
    type: z.enum(['hardware', 'software', 'project']).default('hardware'),
    protocols: z.array(z.string()).default([]),
    note: z.string(),
    spec: z.string().optional(),   // e.g. instantaneous bandwidth / tuning range for SDRs
    repo: z.string().url().optional(),
    homepage: z.string().url().optional(),
    // Software/projects that pair with this hardware (slugs in this collection).
    software: z.array(z.string()).default([]),
    // Lifecycle. Optional: an unset status means nobody has assessed this entry yet,
    // which is honest: it does not assert the tool is current.
    status: z.enum(TOOL_STATUSES as [string, ...string[]]).optional(),
    statusNote: z.string().optional(),
    statusSource: z.string().url().optional(),   // where the statusNote can be checked
    statusChecked: z.coerce.date().optional(),
    successor: z.string().optional(),   // slug in this collection
    ec: z.boolean().default(false),
  }),
});

export const collections = { controls, resources, tools };
