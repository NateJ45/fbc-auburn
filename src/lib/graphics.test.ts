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
  altTextFor,
  captionFor,
  eventContent,
  hasNotes,
  inviteContent,
  welcomeContent,
  linkFor,
  longDate,
  nextSunday,
  sundayContent,
  timeChangeContent,
  withoutNotes,
} from './graphics/content.ts';
import { resolveChurchFacts } from './church-facts.ts';
import { EDDM, addressArea, indiciaBox } from './graphics/mailing.ts';
import { shopPageSize, shopPrintHtml } from './graphics/print.ts';
import { FORMAT_BY_ID, offeredFor } from './graphics/formats.ts';
import type { Assets, Ctx, Kind } from './graphics/types.ts';
import {
  CAROUSEL_FORMAT,
  CAROUSEL_KINDS,
  carouselFor,
  carouselFrames,
  frameFileName,
  renderCarousel,
  splitAddress,
} from './graphics/carousel.ts';
import { GROUNDS } from './graphics/directions/index.ts';
import { SERIES_ART } from './graphics/formats.ts';
import { seriesArtContent } from './graphics/series-art.ts';
import {
  VIDEO,
  frameCount,
  pickVideoType,
  videoFileName,
  videoFrameAt,
  videoRect,
} from './graphics/video.ts';

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
      // A business card keeps words 1/8" in (the printers' rule for that size); the rest 1/4".
      const inset = f.id === 'invite-card' ? 0.125 : 0.25;
      assert.ok(f.safe.left >= f.bleed + inset * dpi - 1, f.id);
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

  it('draws the new sizes and the invite kind without a warning on the sample words', () => {
    for (const d of DIRECTIONS) {
      for (const [kind, format] of [
        ['invite', 'invite-card'],
        ['invite', 'post-square'],
        ['welcome', 'postcard-back'],
        ['event', 'postcard-back'],
        ['sunday', 'postcard-back'],
      ] as [Kind, string][]) {
        const { svg, warnings } = d.render(SAMPLES[kind], FORMAT_BY_ID[format], ctx);
        assert.deepEqual(warnings, [], `${d.id}/${kind}/${format}`);
        assert.match(svg, /<path fill="[^"]+" d="M/, `${d.id}/${kind}/${format} has no QR code`);
      }
    }
  });

  it('prints "Invited by" with the name, and the mailing side says Postal Customer', () => {
    for (const d of DIRECTIONS) {
      assert.match(d.render(SAMPLES.invite, FORMAT_BY_ID['invite-card'], ctx).svg, /Mary Collins/);
      const back = d.render(SAMPLES.event, FORMAT_BY_ID['postcard-back'], ctx).svg;
      assert.match(back, /Postal Customer/);
      for (const l of EDDM.indiciaLines) assert.ok(back.includes(l), `${d.id} indicia "${l}"`);
      assert.ok(back.includes(SAMPLE_CHURCH.line2), `${d.id} return address`);
    }
  });
});

describe('graphics: the mailing side keeps the USPS EDDM Retail rules', () => {
  const f = FORMAT_BY_ID['postcard-back'];
  const dpi = f.print!.dpi;
  const trimRight = f.bleed + f.print!.inW * dpi;
  const trimTop = f.bleed;

  it('is offered only where a mailing makes sense, and the invite card only for an invite', () => {
    const kinds = Object.keys(SAMPLES) as Kind[];
    assert.deepEqual(
      kinds.filter((k) => offeredFor(f, k)),
      ['sunday', 'event', 'welcome'],
    );
    assert.deepEqual(
      kinds.filter((k) => offeredFor(FORMAT_BY_ID['invite-card'], k)),
      ['invite'],
    );
    assert.ok(offeredFor(FORMAT_BY_ID.flyer, 'verse'));
  });

  it('is 6 x 11 inches with bleed', () => {
    assert.deepEqual([f.print!.inW, f.print!.inH], [11, 6]);
    assert.equal(f.group, 'print');
    assert.equal(f.bleed, Math.round(0.125 * dpi));
  });

  it('places the indicia top right, big enough, near enough, and clear of the edges', () => {
    const b = indiciaBox(f);
    const inch = (px: number) => px / dpi;
    assert.ok(inch(b.w) >= 0.5 && inch(b.h) >= 0.5, 'at least 0.5 x 0.5 in');
    assert.ok(inch(trimRight - b.x) <= 1.625, 'within 1.625 in of the right edge');
    assert.ok(inch(b.y + b.h - trimTop) <= 1.375, 'within 1.375 in of the top');
    assert.ok(inch(trimRight - (b.x + b.w)) >= 0.125, '1/8 in clear of the right edge');
    assert.ok(inch(b.y - trimTop) >= 0.125, '1/8 in clear of the top');
    assert.ok(EDDM.indiciaPt >= 4, 'type at least 4 pt');
    for (const l of EDDM.indiciaLines) assert.equal(l, l.toUpperCase(), 'all capitals');
  });

  it('keeps the address and barcode area clear and puts Postal Customer in it', () => {
    const a = addressArea(f);
    const ax = f.bleed + EDDM.address.x * dpi;
    const ay = f.bleed + EDDM.address.y * dpi;
    assert.ok(ax >= a.x && ay >= a.y, 'the address line is in the address area');
    // Clear of the barcode strip: the bottom 5/8 in.
    assert.ok(ay + 0.25 * dpi < f.bleed + (f.print!.inH - 0.625) * dpi, 'above the barcode strip');
    // Nothing else is drawn in the area: every text x in the SVG is left of it, or the address.
    for (const d of DIRECTIONS) {
      const svg = d.render(SAMPLES.event, f, ctx).svg;
      const xs = [...svg.matchAll(/<tspan x="([\d.]+)" y="([\d.]+)"/g)].map((m) => [
        Number(m[1]),
        Number(m[2]),
      ]);
      for (const [x, y] of xs) {
        if (x < a.x || y < a.y) continue;
        assert.ok(Math.abs(x - ax) < 1, `${d.id}: text at ${x},${y} sits in the address area`);
      }
    }
  });
});

describe('graphics: the print-shop PDF page', () => {
  it('is the full size with bleed, with the SVG inlined at that size', () => {
    const f = FORMAT_BY_ID.flyer;
    assert.deepEqual(shopPageSize(f), { inW: 8.75, inH: 11.25 });
    const html = shopPrintHtml(
      '<svg xmlns="x" viewBox="0 0 1 1" width="2625" height="3375"><text>Hi</text></svg>',
      f,
      'Flyer',
    );
    assert.match(html, /@page\{size:8\.75in 11\.25in;margin:0\}/);
    assert.match(html, /<svg xmlns="x" viewBox="0 0 1 1" width="8\.75in" height="11\.25in"><text>/);
    assert.ok(!/<img/.test(html), 'the graphic is inlined, not a picture');
  });
});

describe('graphics: caption and alt text', () => {
  const facts = resolveChurchFacts(null);

  it('writes what, when, where, the link and an invitation for every kind', () => {
    for (const kind of Object.keys(SAMPLES) as Kind[]) {
      const c = { ...SAMPLES[kind], standing: ['Sunday School, 9:45 am', 'Worship, 11:00 am'] };
      const cap = captionFor(c, SAMPLE_CHURCH, kind);
      assert.match(cap, /Where: First Baptist Church of Auburn, 4241 Hamilton-Scipio Road/, kind);
      assert.match(cap, /https:\/\/firstauburn\.org/, kind);
      // A time change carries its time in the headline and its date on the When line.
      if (kind === 'time-change') assert.match(cap, /When: Sunday, November 30/, kind);
      else assert.match(cap, /(When|Sundays|Every week): .*\d:\d\d [ap]m/, kind);
      assert.ok(!/#\w/.test(cap), `${kind}: a hashtag`);
      const alt = altTextFor(c, SAMPLE_CHURCH, kind);
      assert.match(alt, /^A graphic from First Baptist Church of Auburn/, kind);
      assert.ok(
        alt.split(/(?<=[.”])\s+(?=[A-Z])/).length <= 3,
        `${kind}: alt text too long: ${alt}`,
      );
    }
  });

  it('speaks the times and keeps the date', () => {
    const cap = captionFor(SAMPLES.event, SAMPLE_CHURCH);
    assert.match(cap, /When: Wednesday, December 24, 6:00 pm/);
    const sun = captionFor(SAMPLES.sunday, SAMPLE_CHURCH);
    assert.match(sun, /Sunday School at 9:45 am and Worship at 11:00 am/);
    assert.match(sun, /Plan your visit: https:\/\/firstauburn\.org\/plan-your-visit\//);
  });

  it('never prints a note, a dash or an emoji', () => {
    const c = {
      ...SAMPLES.event,
      title: 'Christmas Eve — candlelight 🎄',
      body: 'Carols. [Jacob: confirm the time] Candles – and cocoa.',
      kicker: 'Christmas [Placeholder: name]',
    };
    for (const out of [captionFor(c, SAMPLE_CHURCH), altTextFor(c, SAMPLE_CHURCH)]) {
      assert.ok(!/[—–]/.test(out), `a dash in: ${out}`);
      assert.ok(!/\[(Jacob|Placeholder):/.test(out), `a note in: ${out}`);
      assert.ok(!/\p{Extended_Pictographic}/u.test(out), `an emoji in: ${out}`);
    }
  });

  it('says who invited, and reads a verse with its reference', () => {
    assert.match(captionFor(SAMPLES.invite, SAMPLE_CHURCH), /Invited by Mary Collins\./);
    assert.match(
      altTextFor(SAMPLES.verse, SAMPLE_CHURCH),
      /“Come to me.*rest\.” \(Matthew 11:28, CSB\)/,
    );
  });

  it('builds the invite from this Sunday, and points the connect card QR at Church Trac', () => {
    const inv = inviteContent(facts, '2026-10-27', 'https://firstauburn.org');
    assert.equal(inv.kind, 'invite');
    assert.equal(inv.date, 'Sunday, November 1');
    assert.equal(inv.qr, 'https://firstauburn.org/plan-your-visit/');
    assert.ok(inv.when && inv.when.length > 0);
    const plain = welcomeContent(facts, 'https://firstauburn.org');
    assert.equal(plain.qr, 'https://firstauburn.org/plan-your-visit/');
    assert.equal(plain.qrLabel, 'Scan to plan your visit');
    const card = welcomeContent(
      { ...facts, connectCardUrl: 'https://x.churchtrac.com/connectcard' },
      'https://firstauburn.org',
    );
    assert.equal(card.qr, 'https://x.churchtrac.com/connectcard');
    assert.equal(card.qrLabel, 'Scan to fill this in online');
    assert.equal(card.link, 'firstauburn.org/plan-your-visit');
  });
});

describe('graphics: the carousel', () => {
  it('is offered for an event, a sermon, New here and Sunday only', () => {
    assert.deepEqual((Object.keys(SAMPLES) as Kind[]).filter(carouselFor).sort(), [
      'event',
      'sermon',
      'sunday',
      'welcome',
    ]);
  });

  it('builds 3 to 5 frames: a cover with the title, a where, and an invite with the address', () => {
    for (const kind of CAROUSEL_KINDS) {
      const frames = carouselFrames(SAMPLES[kind], SAMPLE_CHURCH);
      assert.ok(frames.length >= 3 && frames.length <= 5, `${kind}: ${frames.length} frames`);
      assert.equal(frames[0].role, 'cover');
      assert.equal(frames[0].content.title, SAMPLES[kind].title);
      assert.ok(
        frames.some((f) => f.role === 'where'),
        kind,
      );
      const last = frames[frames.length - 1];
      assert.equal(last.role, 'invite');
      assert.match(last.content.link ?? '', /firstauburn\.org/);
    }
    // The event: cover, the date and time, where, every Sunday, the invite.
    const ev = carouselFrames(SAMPLES.event, SAMPLE_CHURCH);
    assert.deepEqual(
      ev.map((f) => f.role),
      ['cover', 'when', 'where', 'weekly', 'invite'],
    );
    assert.equal(ev[1].content.title, 'Wednesday, December 24');
    assert.deepEqual(ev[1].content.when, ['6:00 pm']);
    assert.equal(ev[2].content.title, '4241 Hamilton-Scipio Road');
    assert.equal(ev[2].content.date, 'Hamilton, OH 45013');
    // Sunday: no weekly frame (it is about Sunday already).
    assert.deepEqual(
      carouselFrames(SAMPLES.sunday, SAMPLE_CHURCH).map((f) => f.role),
      ['cover', 'when', 'where', 'invite'],
    );
    // The fewest: no times, no passage, no standing times, no address.
    const bare = carouselFrames(
      { kind: 'sermon', title: 'Hope' },
      { ...SAMPLE_CHURCH, address: null },
    );
    assert.deepEqual(
      bare.map((f) => f.role),
      ['cover', 'where', 'invite'],
    );
    assert.equal(bare[1].content.date, SAMPLE_CHURCH.place);
  });

  it('draws every frame in each look, numbered, with names that sort in order', () => {
    for (const d of DIRECTIONS) {
      for (const kind of CAROUSEL_KINDS) {
        const frames = renderCarousel(d.render, SAMPLES[kind], ctx, GROUNDS[d.id]);
        frames.forEach((fr, i) => {
          const where = `${d.id}/${kind}/${i + 1}`;
          assert.match(fr.svg, /viewBox="0 0 1080 1350"/, where);
          assert.ok(fr.svg.endsWith('</svg>'), where);
          assert.ok(fr.svg.includes(`data-frame="${i + 1}/${frames.length}"`), where);
          assert.ok(!/[—–]|NaN|undefined/.test(fr.svg), `${where} has a dash, NaN or undefined`);
          assert.deepEqual(fr.warnings, [], where);
          assert.equal(fr.label, `${i + 1}/${frames.length}`);
        });
        const names = frames.map((f) => f.name);
        assert.deepEqual([...names].sort(), names, `${d.id}/${kind} names sort`);
        assert.match(names[0], /^carousel-01-[a-z0-9-]+\.png$/);
      }
    }
    assert.equal(frameFileName(9, 'Candlelight service'), 'carousel-10-candlelight-service.png');
    assert.deepEqual([CAROUSEL_FORMAT.w, CAROUSEL_FORMAT.h], [1080, 1350]);
  });

  it('splits the address into the street and the town', () => {
    assert.deepEqual(splitAddress('4241 Hamilton-Scipio Rd, Hamilton, OH 45013'), {
      street: '4241 Hamilton-Scipio Rd',
      town: 'Hamilton, OH 45013',
    });
    assert.deepEqual(splitAddress(null), { street: '', town: '' });
  });
});

describe('graphics: sermon series art', () => {
  it('has a 1920 x 1080 slide, a 1080 square and a 3000 x 3000 podcast cover, for sermons only', () => {
    const sizes = SERIES_ART.map((id) => FORMAT_BY_ID[id]);
    assert.deepEqual(
      sizes.map((f) => [f.w, f.h]),
      [
        [1920, 1080],
        [1080, 1080],
        [3000, 3000],
      ],
    );
    for (const f of sizes) {
      assert.ok(offeredFor(f, 'sermon'), f.id);
      assert.ok(!offeredFor(f, 'event'), f.id);
    }
    assert.match(FORMAT_BY_ID['podcast-cover'].hint, /Sermons page > Podcast/);
  });

  it('draws the title, the series name and the passage, and no sermon link or code', () => {
    const series = { ...SAMPLES.sermon, kicker: 'Sermon on the Mount', title: 'Blessed' };
    for (const d of DIRECTIONS) {
      for (const id of SERIES_ART) {
        const { svg, warnings } = d.render(series, FORMAT_BY_ID[id], ctx);
        const where = `${d.id}/${id}`;
        assert.deepEqual(warnings, [], where);
        assert.ok(svg.includes('Blessed'), `${where} title`);
        assert.ok(/Sermon on the Mount/i.test(svg), `${where} series name`);
        assert.ok(/Matthew 5 to 7/i.test(svg), `${where} passage`);
        assert.ok(!svg.includes('firstauburn.org/sermons'), `${where} carries the sermon link`);
      }
    }
    const art = seriesArtContent(series, 'podcast-cover');
    assert.equal(art.link, undefined);
    assert.equal(art.qr, undefined);
    assert.equal(art.speaker, undefined);
    assert.equal(seriesArtContent(series, 'series-slide').speaker, 'Pastor Jacob Wysong');
  });
});

describe('graphics: the short video', () => {
  it('lasts 6 to 8 seconds at 1080 x 1920', () => {
    assert.ok(VIDEO.seconds >= 6 && VIDEO.seconds <= 8);
    assert.deepEqual([VIDEO.w, VIDEO.h], [1080, 1920]);
    assert.equal(frameCount(), VIDEO.seconds * VIDEO.fps);
  });

  it('fades up from the paper, settles 3 to 4% in, then holds', () => {
    const first = videoFrameAt(0);
    assert.equal(first.alpha, 0);
    assert.ok(first.scale >= 1.03 && first.scale <= 1.04, `starts at ${first.scale}`);
    let prev = first;
    for (let i = 1; i <= frameCount(); i++) {
      const fr = videoFrameAt(i / VIDEO.fps);
      assert.ok(fr.alpha >= prev.alpha, `alpha never dips (frame ${i})`);
      assert.ok(fr.scale <= prev.scale, `scale never grows (frame ${i})`);
      prev = fr;
    }
    // Still after the settle: a hold, not a drift.
    for (let t = VIDEO.settle; t <= VIDEO.seconds; t += 0.25)
      assert.deepEqual(videoFrameAt(t), { alpha: 1, scale: 1 });
    // Centred while it scales.
    const r = videoRect(videoFrameAt(0.5));
    assert.ok(Math.abs(r.x + r.w / 2 - VIDEO.w / 2) < 1e-6);
    assert.ok(Math.abs(r.y + r.h / 2 - VIDEO.h / 2) < 1e-6);
  });

  it('records MP4 when the browser can, else WebM', () => {
    const chrome = pickVideoType(
      (m) => m.startsWith('video/mp4;codecs=avc1') || m.includes('webm'),
    );
    assert.equal(chrome?.ext, 'mp4');
    assert.equal(chrome?.mp4, true);
    const firefox = pickVideoType((m) => m.startsWith('video/webm'));
    assert.deepEqual(firefox, { mime: 'video/webm;codecs=vp9', ext: 'webm', mp4: false });
    assert.equal(
      pickVideoType(() => {
        throw new Error('no');
      }),
      null,
    );
    assert.equal(
      videoFileName('Candlelight service', 'mp4'),
      'story-video-candlelight-service.mp4',
    );
  });
});
