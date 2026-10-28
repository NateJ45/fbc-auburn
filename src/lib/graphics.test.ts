// Safe to edit by hand
// Tests for the graphics maker (src/lib/graphics/, docs/agent/graphics.md): line breaking and
// fitting, the sizes, the words built from Church facts, and every direction drawing every kind
// at every size inside its safe area, with no pre-launch note, no em dash and no typed time.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FORMATS, safeBox, unit } from './graphics/formats.ts';
import { approxMeasure, balanceLines, breakLines, cleanText, fitText } from './graphics/text.ts';
import { DIRECTIONS } from './graphics/directions/index.ts';
import { SAMPLE_CHURCH, SAMPLES } from './graphics/samples.ts';
import {
  eventContent,
  hasNotes,
  linkFor,
  longDate,
  nextSunday,
  sundayContent,
  timeChangeContent,
  withoutNotes,
} from './graphics/content.ts';
import { resolveChurchFacts } from './church-facts.ts';
import type { Assets, Ctx, Kind } from './graphics/types.ts';

const ASSETS: Assets = {
  serif: 'data:font/woff2;base64,AA',
  sans: 'data:font/woff2;base64,AA',
  markWhite: 'data:image/svg+xml;base64,AA',
  markColor: 'data:image/svg+xml;base64,AA',
  tileNavy: 'data:image/svg+xml;base64,AA',
  tileWall: 'data:image/svg+xml;base64,AA',
  sketch: 'data:image/webp;base64,AA',
};
const ctx: Ctx = { measure: approxMeasure, assets: ASSETS, church: SAMPLE_CHURCH };
const font = { family: 'serif' as const, size: 100 };

describe('graphics: setting words', () => {
  it('breaks lines at spaces within the width', () => {
    const lines = breakLines('Come as you are this Sunday', font, 700, approxMeasure);
    assert.ok(lines.length >= 2);
    for (const l of lines) assert.ok(approxMeasure(l, font) <= 700 || !l.includes(' '));
  });

  it('balances lines: no word left alone on the last line', () => {
    const lines = balanceLines('The Sermon on the Mount', font, 1000, approxMeasure);
    assert.equal(lines.length, 2);
    assert.ok(lines[1].split(' ').length > 1, `last line was "${lines[1]}"`);
  });

  it('fits a title as large as it can, and says when it cannot', () => {
    const o = {
      family: 'serif' as const,
      maxW: 800,
      maxH: 400,
      maxLines: 3,
      max: 140,
      min: 40,
      leading: 1.05,
    };
    const short = fitText('Easter', o, approxMeasure);
    assert.equal(short.size, 140);
    assert.equal(short.overflow, false);
    const long = fitText('word '.repeat(80), o, approxMeasure);
    assert.equal(long.overflow, true);
    assert.equal(long.size, 40);
  });

  it('turns em and en dashes into a colon (house rule 2)', () => {
    assert.equal(cleanText('Advent — week one'), 'Advent: week one');
    assert.equal(cleanText('  two   spaces '), 'two spaces');
  });
});

describe('graphics: sizes', () => {
  it('has unique ids and a safe box inside every canvas', () => {
    assert.equal(new Set(FORMATS.map((f) => f.id)).size, FORMATS.length);
    for (const f of FORMATS) {
      const b = safeBox(f);
      assert.ok(b.w > 0 && b.h > 0, f.id);
      assert.ok(unit(f) > 0.2, `${f.id} unit ${unit(f)}`);
    }
  });

  it('gives print sizes 1/8 inch of bleed and keeps words a further 1/4 inch in', () => {
    for (const f of FORMATS.filter((x) => x.print)) {
      const { inW, inH, dpi } = f.print!;
      assert.equal(f.w, Math.round((inW + 0.25) * dpi), f.id);
      assert.equal(f.h, Math.round((inH + 0.25) * dpi), f.id);
      assert.equal(f.bleed, Math.round(0.125 * dpi));
      assert.ok(f.safe.left >= f.bleed + 0.25 * dpi - 1);
      // A phone browser holds a canvas up to about 16.7 million pixels.
      assert.ok(f.w * f.h <= 16_777_216, `${f.id} is ${f.w * f.h} px`);
    }
  });
});

describe('graphics: words from what the church keeps', () => {
  const facts = resolveChurchFacts(null);

  it('builds web addresses and QR targets with the trailing slash (rule 19)', () => {
    assert.deepEqual(linkFor('https://firstauburn.org', '/christmas'), {
      link: 'firstauburn.org/christmas',
      qr: 'https://firstauburn.org/christmas/',
    });
    assert.equal(linkFor('https://firstauburn.org/', '/').link, 'firstauburn.org');
  });

  it('finds the next Sunday and words the date', () => {
    assert.equal(nextSunday('2026-10-27'), '2026-11-01');
    assert.equal(nextSunday('2026-11-01'), '2026-11-01');
    assert.equal(longDate('2026-12-24'), 'Thursday, December 24');
  });

  it('takes Sunday times from Church facts, never typed', () => {
    const c = sundayContent(facts, '2026-10-27', 'https://firstauburn.org');
    assert.deepEqual(
      c.when,
      facts.serviceTimes
        .filter((s) => s.dayIndex === 0)
        .map((s) => `${s.label.split(/\s+for\s+/i)[0]}, ${s.timeLabel}`),
    );
    assert.equal(c.qr, 'https://firstauburn.org/plan-your-visit/');
  });

  it('applies a time change to the day it is on', () => {
    const f = resolveChurchFacts({
      timeChanges: [
        { _key: 'a', date: '2026-11-29', change: 'time', service: 'worship', time: '10:00' },
      ],
    } as never);
    const change = f.timeChanges[0];
    assert.ok(change, 'the change resolved');
    const c = timeChangeContent(f, change, 'https://firstauburn.org');
    assert.match(c.title, /10:00 am/);
    assert.equal(c.date, 'Sunday, November 29');
  });

  it('reads an event page: the next date, its times', () => {
    const c = eventContent(
      {
        title: 'Christmas',
        slug: 'christmas',
        details: {
          title: 'Christmas Eve',
          occurrences: [
            { date: '2025-12-24', startTime: '18:00' },
            { date: '2026-12-24', startTime: '18:00', label: 'Candlelight service' },
          ],
        },
      },
      '2026-10-27',
      'https://firstauburn.org',
    );
    assert.equal(c.kicker, 'Thursday, December 24');
    assert.deepEqual(c.when, ['Candlelight service, 6:00 pm']);
    assert.equal(c.link, 'firstauburn.org/christmas');
  });

  it('never prints a pre-launch note', () => {
    const c = {
      kind: 'event' as const,
      title: 'Christmas Eve',
      body: 'Carols. [Jacob: confirm the time] Candles.',
    };
    assert.equal(hasNotes(c), true);
    assert.equal(withoutNotes(c).body, 'Carols. Candles.');
    assert.equal(hasNotes(withoutNotes(c)), false);
  });
});

describe('graphics: every direction draws every kind at every size', () => {
  for (const d of DIRECTIONS) {
    it(`${d.id}: well-formed SVG at the canvas size, no dash, no note`, () => {
      for (const kind of Object.keys(SAMPLES) as Kind[]) {
        for (const f of FORMATS) {
          const { svg, warnings } = d.render(SAMPLES[kind], f, ctx);
          const where = `${d.id}/${kind}/${f.id}`;
          assert.ok(svg.startsWith('<svg'), where);
          assert.match(svg, new RegExp(`viewBox="0 0 ${f.w} ${f.h}"`), where);
          assert.ok(!/[—–]/.test(svg), `${where} carries a dash`);
          assert.ok(!/\[(Jacob|Placeholder):/.test(svg), `${where} carries a note`);
          assert.ok(!/NaN|undefined/.test(svg), `${where} has NaN or undefined in it`);
          assert.ok(Array.isArray(warnings), where);
        }
      }
    });
  }
});
