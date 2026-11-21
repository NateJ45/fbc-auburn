// The plan half of the inner-page rhythm pass (2026-11-21): pure, no client, no writes, so the
// unit test and a dry run can both read it. scripts/content/inner-rhythm.mjs does the reading,
// the backup and the write.
//
// What it plans, page by page (each line on a photo is text already on that page; nothing new is
// claimed about the church):
//   - Plan your visit: a photo break (the sanctuary) between "Walk in with us" and "What worship is
//     like", with "Wear whatever you like." from the walk's own intro; and "Getting in and getting
//     around" switched to the panel layout (the building beside the navy panel).
//   - What we believe: a photo break (the road sign, "Auburn Baptist Church") before "What it means
//     to be Baptist", with "We are a Southern Baptist church." from that section's words.
//   - About: a photo break (the fellowship hall) between "A Sunday here" and "Our building", with
//     "Inside there is room for a meal and a crowd." from the building band's words.
//   - Ministries: a photo break (the Christmas gifts) between Find your place and "Serving our
//     neighbors", with "Ways to grow, serve and belong, for every age." from the page's opening.
// A step whose anchor block is missing, whose line is no longer on the page, or that is already
// done is skipped and said so, so a re-run changes nothing.

// The church's own photos (renamed fbca-church-* on 2026-11-19; no people in them).
export const PHOTOS = {
  sanctuary: {
    ref: 'image-5c121bef3022c59358f3fedbf678c133b199690d-1440x1080-jpg',
    alt: 'The front of the sanctuary: the pulpit and the communion table, with the flags either side and a "Jesus > Everything" banner above',
  },
  sign: {
    ref: 'image-509ada7dbc5f4325019615dee69f8c936c69a791-1536x2048-jpg',
    alt: 'The church sign by the road, reading Auburn Baptist Church with the Sunday and Wednesday times, and the tall red cross beside it',
  },
  hall: {
    ref: 'image-9052844d711b98c9025f0c07f84ffdfe90685531-1536x2048-jpg',
    alt: 'The fellowship hall set out with tables of canned food and boxes, ready to give away',
  },
  gifts: {
    ref: 'image-47e743375e37d940e98855beae89571a59b54ac4-1600x1232-jpg',
    alt: 'A table of wrapped Christmas gifts under a garland and two candy canes',
  },
};

/** The four pages and what each gets. `after`: the key of the block the photo break follows. */
export const STEPS = [
  {
    id: 'page-plan-your-visit',
    breakKey: 'pyv-break',
    after: 'pyv-walk',
    photo: 'sanctuary',
    line: 'Wear whatever you like.',
    panelKey: 'pyv-here',
  },
  {
    id: 'page-what-we-believe',
    breakKey: 'wwb-break',
    after: 'wwb-baptism-faq',
    photo: 'sign',
    line: 'We are a Southern Baptist church.',
  },
  {
    id: 'aboutPage',
    breakKey: 'about-break',
    after: 'about-sunday',
    photo: 'hall',
    line: 'Inside there is room for a meal and a crowd.',
  },
  {
    id: 'page-ministries',
    breakKey: 'min-break',
    after: 'min-fyp',
    photo: 'gifts',
    line: 'Ways to grow, serve and belong, for every age.',
  },
];

/** Every word a page shows, flattened, so a line can be checked against it. */
export function pageText(doc) {
  const parts = [];
  const walk = (v) => {
    if (typeof v === 'string') parts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (!k.startsWith('_')) walk(x);
    }
  };
  walk(doc?.pageBuilder ?? []);
  return parts.join(' ').replace(/[’]/g, "'").replace(/\s+/g, ' ');
}

const photoBreak = (step) => ({
  _key: step.breakKey,
  _type: 'photoBreakSection',
  image: {
    _type: 'image',
    asset: { _type: 'reference', _ref: PHOTOS[step.photo].ref },
    alt: PHOTOS[step.photo].alt,
  },
  line: step.line,
});

/**
 * The new page layout for one page and a list of what changed or was skipped. Returns
 * `{ pageBuilder, notes, changed }`; `pageBuilder` is the input unchanged when nothing applies.
 */
export function planPage(doc, step) {
  const notes = [];
  const blocks = doc?.pageBuilder ?? [];
  if (!blocks.length)
    return { pageBuilder: blocks, notes: ['no page layout; skipped'], changed: false };
  let changed = false;
  let out = blocks;

  // The line must be words this page already says.
  const text = pageText(doc);
  const lineOk = text.includes(step.line.replace(/\.$/, ''));
  const has = out.some((b) => b._key === step.breakKey);
  const anchor = out.findIndex((b) => b._key === step.after);
  if (has) notes.push(`photo break ${step.breakKey}: already there, left as it is`);
  else if (anchor < 0) notes.push(`photo break: no ${step.after} block; skipped`);
  else if (!lineOk) notes.push(`photo break: "${step.line}" is no longer on the page; skipped`);
  else {
    out = [...out.slice(0, anchor + 1), photoBreak(step), ...out.slice(anchor + 1)];
    notes.push(`photo break after ${step.after}: ${step.photo} photo, "${step.line}"`);
    changed = true;
  }

  if (step.panelKey) {
    const i = out.findIndex((b) => b._key === step.panelKey);
    const b = out[i];
    if (!b) notes.push(`panel: no ${step.panelKey} block; skipped`);
    else if (b._type !== 'imageTextSection' || (b.art ?? 'photo') !== 'photo' || !b.image?.asset)
      notes.push(`panel: ${step.panelKey} is not an Image + text with a photo; skipped`);
    else if (b.layout === 'panel') notes.push(`panel: ${step.panelKey} already a panel`);
    else {
      out = out.map((x, j) => (j === i ? { ...x, layout: 'panel' } : x));
      notes.push(`panel: ${step.panelKey} ("${b.heading}") switched to the panel layout`);
      changed = true;
    }
  }
  return { pageBuilder: out, notes, changed };
}
