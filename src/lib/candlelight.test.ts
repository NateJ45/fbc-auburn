// Safe to edit by hand
// The Candlelight band (src/lib/candlelight.ts, 2026-11-09): the count is held to 5 to 9, the row
// is drawn the same on every build, both states pass AA (text 4.5:1, the switch and the candles
// 3:1), and the CSS declares exactly the colours measured here, so the stylesheet cannot drift
// from the numbers this test checks.
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AA_BODY_TEXT, AA_NON_TEXT, contrastRatio } from './contrast.ts';
import {
  CANDLE_ART,
  CANDLE_DEFAULT,
  CANDLE_MAX,
  CANDLE_MIN,
  CANDLE_OPTIONS,
  CANDLELIGHT,
  candleCount,
  candleHeights,
} from './candlelight.ts';

describe('candleCount', () => {
  it('holds the count to 5 to 9 and defaults to 7', () => {
    assert.equal(candleCount(undefined), CANDLE_DEFAULT);
    assert.equal(candleCount(null), CANDLE_DEFAULT);
    assert.equal(candleCount('seven'), CANDLE_DEFAULT);
    assert.equal(candleCount(2), CANDLE_MIN);
    assert.equal(candleCount(40), CANDLE_MAX);
    assert.equal(candleCount(6.4), 6);
    assert.equal(candleCount('8'), 8);
  });
  it('offers every count from 5 to 9 in the Studio', () => {
    assert.deepEqual(
      CANDLE_OPTIONS.map((o) => o.value),
      [5, 6, 7, 8, 9],
    );
  });
});

describe('candleHeights', () => {
  it('draws one candle per count, the same every time, inside the box', () => {
    for (let n = CANDLE_MIN; n <= CANDLE_MAX; n++) {
      const h = candleHeights(n);
      assert.equal(h.length, n);
      assert.deepEqual(h, candleHeights(n));
      // The box is 132 tall: the wax plus the wick (6) and the flame (24) must fit.
      for (const x of h) assert.ok(x >= 40 && x <= 132 - 2 - 6 - 24, `height ${x}`);
    }
  });
});

describe('the two states pass AA', () => {
  for (const [state, c] of Object.entries(CANDLELIGHT)) {
    it(`lights ${state}: heading and text 4.5:1, the switch 3:1`, () => {
      assert.ok(contrastRatio(c.heading, c.ground) >= AA_BODY_TEXT, `${state} heading`);
      assert.ok(contrastRatio(c.text, c.ground) >= AA_BODY_TEXT, `${state} text`);
      // The switch's words and outline are one colour: they count as text.
      assert.ok(contrastRatio(c.control, c.ground) >= AA_BODY_TEXT, `${state} switch`);
    });
  }
  it('the candles stand out from the band in both states', () => {
    // Lights up: the navy outline carries the cream wax. Lights down: the wax itself.
    assert.ok(contrastRatio(CANDLE_ART.outline, CANDLELIGHT.up.ground) >= AA_NON_TEXT);
    assert.ok(contrastRatio(CANDLE_ART.wax, CANDLELIGHT.down.ground) >= AA_NON_TEXT);
  });
});

describe('builder-blocks.css declares the measured colours', () => {
  const css = readFileSync(new URL('../styles/builder-blocks.css', import.meta.url), 'utf8');
  for (const [state, c] of Object.entries(CANDLELIGHT)) {
    for (const [role, hex] of Object.entries(c)) {
      it(`--cl-${state}-${role} is ${hex}`, () => {
        const m = css.match(new RegExp(`--cl-${state}-${role}:\\s*(#[0-9a-fA-F]{6})`));
        assert.ok(m, `--cl-${state}-${role} is missing from builder-blocks.css`);
        assert.equal(m[1].toLowerCase(), hex.toLowerCase());
      });
    }
  }
});
