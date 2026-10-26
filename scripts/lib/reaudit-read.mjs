// A read-only client for the re-audit content scripts' dry runs (2026-10-26). The dataset is
// public, so the published documents can be read without a token; a dry run then works on any
// checkout, even one without a .env write token. Writes always go through sanity-lib.mjs, which
// keeps the production second factor (NCS_PRODUCTION_WRITE=yes, PORTS.md card 86).
import { createClient } from '@sanity/client';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './loadEnv.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function readClient() {
  const env = loadEnv(ROOT);
  const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
  const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || 'production';
  if (!projectId) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID (in .env or the environment).');
    process.exit(1);
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: '2026-05-01',
    useCdn: false,
    perspective: 'published',
  });
}
