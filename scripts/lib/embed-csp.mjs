// Safe to edit by hand
// =============================================================================
// embed-csp.mjs - the pure half of scripts/build-embed-csp.mjs
// =============================================================================
// Two string jobs, tested in embed-csp.test.mjs: find the embed-provider ids a
// built page carries, and add script origins to the script-src directive of the
// Content-Security-Policy line build-csp.mjs wrote.

/** The data-embed-provider ids on a built page (the marker EmbedSection writes). */
export function providerIdsIn(html) {
  const ids = new Set();
  for (const m of String(html).matchAll(/\sdata-embed-provider\s*=\s*"([a-z0-9-]+)"/g)) {
    ids.add(m[1]);
  }
  return ids;
}

const ORIGIN = /^https:\/\/(\*\.)?[a-z0-9.-]+$/i;

/**
 * Add `origins` to script-src on the Content-Security-Policy line of a _headers
 * file. Origins already listed are skipped. They go straight after
 * 'wasm-unsafe-eval', where build-csp puts its own origins.
 */
export function addScriptOrigins(headersText, origins) {
  const lines = String(headersText).split(/\r?\n/);
  const at = lines.findIndex((l) => /^\s+Content-Security-Policy:.*\bscript-src\b/.test(l));
  if (at === -1) {
    return {
      ok: false,
      reason:
        'No Content-Security-Policy line with script-src in _headers. Run build-csp.mjs first.',
    };
  }
  const bad = origins.filter((o) => !ORIGIN.test(o));
  if (bad.length) return { ok: false, reason: `Not an origin: ${bad.join(', ')}` };

  const line = lines[at];
  const directives = line.split(';');
  const di = directives.findIndex((d) => /^\s*(Content-Security-Policy:\s*)?script-src\b/.test(d));
  const parts = directives[di].trim().split(/\s+/);
  const listed = new Set(parts);
  const added = [...new Set(origins)].filter((o) => !listed.has(o)).sort();
  if (added.length) {
    const after = parts.indexOf("'wasm-unsafe-eval'");
    parts.splice(after === -1 ? parts.indexOf('script-src') + 1 : after + 1, 0, ...added);
    const lead = directives[di].match(/^\s*/)[0];
    directives[di] = lead + parts.join(' ');
    lines[at] = directives.join(';');
  }
  return { ok: true, text: lines.join('\n'), added, lineLength: lines[at].length };
}
