// Safe to edit by hand
// The "On this page" list (src/lib/page-index.ts): which H2s it collects, in what order, with which
// ids, and when a page earns it.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INDEX_MIN, cardHeadingId, pageIndex, showsIndex } from './page-index.ts';

const block = (style: string, text: string) => ({
  _type: 'block',
  _key: text,
  style,
  children: [{ _type: 'span', text }],
});

describe('pageIndex', () => {
  it('collects section headings, card titles and body H2s in page order', () => {
    const rows = [
      { block: { _type: 'heroSection', headline: 'What we believe' }, headingId: 'page-0' },
      {
        block: { _type: 'imageTextSection', heading: 'The gospel, first' },
        headingId: 'the-gospel',
      },
      {
        block: {
          _type: 'iconCardsSection',
          cards: [{ title: 'God' }, { title: 'The Holy Spirit' }],
        },
        headingId: 'page-2',
      },
      {
        block: {
          _type: 'richTextSection',
          heading: 'Our confession',
          body: [block('h2', 'Article one'), block('normal', 'Words'), block('h3', 'A detail')],
        },
        headingId: 'page-3',
      },
      { block: { _type: 'photoBreakSection', line: 'Come as you are.' }, headingId: 'page-4' },
      { block: { _type: 'ctaBandSection', headline: 'Questions?' }, headingId: 'page-5' },
    ];
    assert.deepEqual(pageIndex(rows), [
      { id: 'the-gospel', text: 'The gospel, first' },
      { id: 'god', text: 'God' },
      { id: 'the-holy-spirit', text: 'The Holy Spirit' },
      { id: 'page-3', text: 'Our confession' },
      { id: 'article-one', text: 'Article one' },
    ]);
  });

  it('skips card titles when the cards section has its own heading (they are H3s then)', () => {
    const rows = [
      {
        block: { _type: 'iconCardsSection', heading: 'Beliefs', cards: [{ title: 'God' }] },
        headingId: 'page-1',
      },
    ];
    assert.deepEqual(pageIndex(rows), [{ id: 'page-1', text: 'Beliefs' }]);
  });

  it('numbers a repeated body heading the way PortableText does', () => {
    const rows = [
      {
        block: {
          _type: 'richTextSection',
          body: [block('h2', 'Notes'), block('h3', 'Notes'), block('h2', 'Notes')],
        },
        headingId: 'page-1',
      },
    ];
    assert.deepEqual(
      pageIndex(rows).map((e) => e.id),
      ['notes', 'notes-3'],
    );
  });

  it('is shown from INDEX_MIN headings', () => {
    const many = Array.from({ length: INDEX_MIN }, (_, i) => ({ id: `a${i}`, text: `A${i}` }));
    assert.equal(showsIndex(many), true);
    assert.equal(showsIndex(many.slice(1)), false);
  });

  it('gives a card title a plain slug', () => {
    assert.equal(cardHeadingId("Baptism and the Lord's Supper"), 'baptism-and-the-lords-supper');
  });
});
