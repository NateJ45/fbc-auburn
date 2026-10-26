// Safe to edit by hand
// Tests for scripts/lib/embed-csp.mjs (the build step that adds a known embed
// service's script origins to the policy only when a page uses it).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addScriptOrigins, providerIdsIn } from './embed-csp.mjs';

const HEADERS = [
  '/*',
  '  X-Content-Type-Options: nosniff',
  "  Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'; script-src 'self' 'wasm-unsafe-eval' https://www.youtube.com 'sha256-abc=' 'unsafe-inline'",
  '/studio/*',
  '  ! Content-Security-Policy',
].join('\n');

describe('providerIdsIn', () => {
  it('reads the marker ids off a page', () => {
    const html =
      '<div class="w-full" data-embed-provider="tithely"><script src="x"></script></div><div data-embed-provider="calendly"></div><div data-embed-provider="tithely"></div>';
    assert.deepEqual([...providerIdsIn(html)], ['tithely', 'calendly']);
  });
  it('ignores pages with none, and odd values', () => {
    assert.equal(providerIdsIn('<p>hello</p>').size, 0);
    assert.equal(providerIdsIn('<div data-embed-provider="Bad Value!"></div>').size, 0);
  });
});

describe('addScriptOrigins', () => {
  it("adds new origins after 'wasm-unsafe-eval' and keeps the rest of the line", () => {
    const r = addScriptOrigins(HEADERS, ['https://tithe.ly', 'https://*.tithe.ly']);
    assert.equal(r.ok, true);
    assert.deepEqual(r.added, ['https://*.tithe.ly', 'https://tithe.ly']);
    const line = r.text.split('\n')[2];
    assert.ok(
      line.endsWith(
        "script-src 'self' 'wasm-unsafe-eval' https://*.tithe.ly https://tithe.ly https://www.youtube.com 'sha256-abc=' 'unsafe-inline'",
      ),
      line,
    );
    assert.ok(
      line.startsWith("  Content-Security-Policy: frame-ancestors 'self'; object-src 'none'"),
    );
    assert.equal(r.lineLength, line.length);
    // The Studio's rule is untouched.
    assert.equal(r.text.split('\n')[4], '  ! Content-Security-Policy');
  });

  it('skips origins already there, and adds nothing twice', () => {
    const r = addScriptOrigins(HEADERS, ['https://www.youtube.com']);
    assert.deepEqual(r.added, []);
    assert.equal(r.text, HEADERS);
    const twice = addScriptOrigins(addScriptOrigins(HEADERS, ['https://a.example']).text, [
      'https://a.example',
    ]);
    assert.deepEqual(twice.added, []);
  });

  it('refuses a file with no policy line, and anything that is not an origin', () => {
    assert.equal(addScriptOrigins('/*\n  X-Frame-Options: DENY', ['https://a.example']).ok, false);
    assert.equal(addScriptOrigins(HEADERS, ["https://a.example 'unsafe-eval'"]).ok, false);
    assert.equal(addScriptOrigins(HEADERS, ['http://a.example']).ok, false);
    assert.equal(addScriptOrigins(HEADERS, ['https://a.example/path']).ok, false);
  });
});
