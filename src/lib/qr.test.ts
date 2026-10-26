// Safe to edit by hand
// Tests for the QR file helpers (src/lib/qr.ts), against the real library.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import qrcode from 'qrcode-generator';
import { QUIET_ZONE, qrFileName, qrPath, qrPngScale, qrSvg, type QrGrid } from './qr.ts';

function grid(text: string): QrGrid {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr;
}

describe('qr files', () => {
  const g = grid('https://fbc-auburn.nathanjnixon86.workers.dev/vbs');
  const n = g.getModuleCount();

  it('draws every dark square, and only those', () => {
    let dark = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (g.isDark(r, c)) dark++;
    let drawn = 0;
    for (const m of qrPath(g).matchAll(/h(\d+)/g)) drawn += Number(m[1]);
    assert.equal(drawn, dark);
  });

  it('keeps the quiet border and stays crisp', () => {
    const svg = qrSvg(g, { title: 'QR code for /vbs <test>' });
    const size = n + QUIET_ZONE * 2;
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg.includes(`viewBox="0 0 ${size} ${size}"`));
    assert.ok(svg.includes('shape-rendering="crispEdges"'));
    assert.ok(svg.includes('<title>QR code for /vbs &lt;test&gt;</title>'));
    // The top-left finder square starts at the quiet border.
    assert.ok(qrPath(g).startsWith(`M${QUIET_ZONE} ${QUIET_ZONE}h7`));
  });

  it('a PNG uses whole pixels per square and is at least 1200px', () => {
    const scale = qrPngScale(g);
    assert.equal(Number.isInteger(scale), true);
    assert.ok(scale * (n + QUIET_ZONE * 2) >= 1200);
  });

  it('names the file after what it points at', () => {
    assert.equal(qrFileName('https://fbcauburn.org/vbs'), 'qr-vbs');
    assert.equal(qrFileName('https://fbcauburn.org/sermons/advent-1/'), 'qr-sermons-advent-1');
    assert.equal(qrFileName('https://fbcauburn.org/'), 'qr-fbcauburn');
    assert.equal(qrFileName('nonsense'), 'qr-link');
  });
});
