// The re-audit's content changes (2026-10-26), as pure functions of the documents they change, so
// scripts/content/menu-reach-us.mjs and scripts/content/reaudit-pages.mjs share one plan and
// scripts/lib/reaudit-content.test.mjs can check it without Sanity. Each function takes the
// published document and returns the fields to set (an empty object when it is already applied).
//
// Nothing here is typed in place of Church facts: phone numbers, times and the address stay in
// Site settings and are drawn by the code (the Call and Text buttons, the times band).

const ref = (id) => ({ _type: 'reference', _ref: id });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Only the fields that differ. */
function diff(doc, next) {
  const out = {};
  for (const [k, v] of Object.entries(next)) if (!same(doc?.[k], v)) out[k] = v;
  return out;
}

// ── 1. The menu and the footer: four groups ──────────────────────────────────────────────────
//   New here      Plan your visit, About, What we believe, Leadership
//   Get involved  Ministries, Next steps, News and notes
//   This week     Sermons, Events, Bulletin, Give
//   Reach us      Contact, Need the pastor?, Prayer requests
export const MENU = [
  ['g-new', 'New here', ['n-visit', 'n-about', 'n-believe', 'n-leadership']],
  ['g-involved', 'Get involved', ['n-ministries', 'n-next', 'n-news']],
  ['g-connected', 'This week', ['n-sermons', 'n-events', 'n-bulletin', 'n-give']],
  ['g-reach', 'Reach us', ['n-contact', 'n-care', 'n-prayer']],
];
// The footer column keys (kept where they exist) and the key a new footer link takes.
const FOOTER = [
  ['f-visit', 'New here'],
  ['f-belong', 'Get involved'],
  ['f-week', 'This week'],
  ['f-reach', 'Reach us'],
];
const FOOTER_NEW_KEY = {
  'n-visit': 'fv1',
  'n-about': 'fv2',
  'n-believe': 'fv3',
  'n-leadership': 'fv4',
  'n-contact': 'fc1',
  'n-ministries': 'fb1',
  'n-next': 'fv-next',
  'n-news': 'fb2',
  'n-sermons': 'fb-sermons',
  'n-events': 'fb-events',
  'n-bulletin': 'fw-bulletin',
  'n-prayer': 'fb-prayer',
  'n-care': 'fw-care',
  'n-give': 'fw-give',
};

export function menuPlan(settings) {
  const byKey = {};
  for (const item of settings?.navItems ?? []) {
    if (item._type === 'navLink') byKey[item._key] = item;
    for (const l of item.links ?? []) byKey[l._key] = l;
  }
  const pick = (k) => {
    if (!byKey[k]) throw new Error(`The menu has no ${k}; run audit-chrome.mjs first.`);
    return byKey[k];
  };
  const navItems = MENU.map(([key, label, keys]) => ({
    _key: key,
    _type: 'navGroup',
    label,
    links: keys.map(pick),
  }));
  const footerByTarget = {};
  for (const col of settings?.footerColumns ?? []) {
    for (const l of col.links ?? []) footerByTarget[l.internalPage?._ref ?? l.href ?? l._key] = l;
  }
  const columnType = settings?.footerColumns?.[0]?._type ?? 'footerColumn';
  const footerColumns = MENU.map(([, , keys], i) => ({
    _key: FOOTER[i][0],
    _type: columnType,
    title: FOOTER[i][1],
    links: keys.map((k) => {
      const n = pick(k);
      const have = footerByTarget[n.internalPage?._ref ?? n.href];
      const { _key, ...rest } = n;
      return { ...rest, _key: have?._key ?? FOOTER_NEW_KEY[k] ?? `f-${k}`, label: n.label };
    }),
  }));
  return diff(settings, { navItems, footerColumns });
}

// ── 2. Contact: no prayer option (the prayer page keeps its own privacy promise) ─────────────
export function contactPlan(page) {
  const formFields = (page?.formFields ?? []).map((f) =>
    Array.isArray(f.options) ? { ...f, options: f.options.filter((o) => !/pray/i.test(o)) } : f,
  );
  return diff(page, { formFields });
}

// ── 3. Home: the Ask card is for questions; prayer gets its own card, to /prayer/ ───────────
export function homePlan(page) {
  const pageBuilder = (page?.pageBuilder ?? []).map((b) => {
    if (b._key !== 'home-other-ways' || !Array.isArray(b.cards)) return b;
    const cards = b.cards.map((c) =>
      c._key === 'how-ask' ? { ...c, body: 'Anything you would like to know before you come' } : c,
    );
    if (!cards.some((c) => c._key === 'how-prayer')) {
      cards.push({
        _key: 'how-prayer',
        _type: 'iconCard',
        title: 'Prayer requests',
        body: 'Something we can pray about? Pastor Jacob reads every one.',
        icon: 'praying-hands',
        link: {
          _type: 'ctaBlock',
          label: 'Send a prayer request',
          linkType: 'internal',
          internalLink: ref('page-prayer'),
        },
      });
    }
    return { ...b, cards };
  });
  return diff(page, { pageBuilder });
}

// ── 4. Plan your visit: shorter, one closing invitation, the where up top ───────────────────
// Order after: the page head (its times band now carries the address, Directions and Apple Maps),
// Your kids, Find us (with the sign folded into its note) beside the walk, Walk in with us (no
// button of its own; "Good to know" folded into its intro), What worship is like, Getting in and
// getting around (its four access asks as one), Questions, and the one closing band.
// Every "[Jacob: ...]" ask on the page is kept, word for word or folded into one ask.
export const PLAN_ORDER = [
  'pyv-hero',
  'pyv-kids',
  'pyv-map',
  'pyv-walk',
  'pyv-worship',
  'pyv-here',
  'pyv-faq',
  'pyv-cta',
];
/** The access asks as one short list ask, each question kept word for word. */
const accessAsk = (asks) =>
  `[Jacob: access, in one short list. ${asks
    .map((a) =>
      a
        .replace(/^\[Jacob:\s*/, '')
        .replace(/\]$/, '')
        .trim(),
    )
    .map((q) => q.charAt(0).toUpperCase() + q.slice(1))
    .join(' ')}]`;

/** A plain paragraph block, the shape the rich-text fields hold. */
const para = (key, text) => ({
  _key: key,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: `${key}-s`, _type: 'span', marks: [], text }],
});
const plainText = (body) =>
  (body ?? []).map((b) => (b.children ?? []).map((c) => c.text ?? '').join('')).join('\n');

export function planVisitPlan(page) {
  const blocks = page?.pageBuilder ?? [];
  const byKey = Object.fromEntries(blocks.map((b) => [b._key, b]));
  for (const k of PLAN_ORDER) {
    if (!byKey[k]) throw new Error(`Plan your visit has no ${k}; read the page first.`);
  }
  const sign = byKey['pyv-sign'];
  const signText = sign ? plainText(sign.body).trim() : '';
  const pageBuilder = PLAN_ORDER.map((k) => {
    const b = byKey[k];
    if (k === 'pyv-map') {
      return {
        ...b,
        note:
          b.note ||
          signText ||
          '[Placeholder: Our sign stands by the road with a red cross beside it, and it carries the Sunday and Wednesday times.]',
      };
    }
    if (k === 'pyv-walk') {
      const { endLinkLabel: _l, endLinkHref: _h, endBody: _b, ...rest } = b;
      return {
        ...rest,
        intro:
          'Your first Sunday morning, step by step. [Placeholder: Wear whatever you like: you will see everything from jeans to Sunday best.]',
      };
    }
    if (k === 'pyv-here') {
      const body = b.body ?? [];
      const asks = body.filter((p) => /\[Jacob:/.test(plainText([p])));
      const rest = body.filter((p) => !/\[Jacob:/.test(plainText([p])));
      // Fold the separate access asks into one short list ask (kept, never dropped).
      return asks.length > 1
        ? { ...b, body: [...rest, para('here-access', accessAsk(asks.map((p) => plainText([p]))))] }
        : b;
    }
    return b;
  });
  return diff(page, { pageBuilder });
}

/** Every "[Jacob: ...]" ask in a document, for the before and after check. */
export function jacobAsks(doc) {
  return [...JSON.stringify(doc ?? {}).matchAll(/\[Jacob:[^\]]*\]/g)].map((m) => m[0]);
}

// ── 5. Need the pastor?: Call and Text first, the crisis line tappable, prayer a link ────────
export const CARE_ORDER = ['pc-hero', 'pc-contact', 'pc-crisis', 'pc-reach', 'pc-care', 'pc-more'];
export const CRISIS_LABEL = 'If it cannot wait';

export function pastoralCarePlan(page) {
  const blocks = page?.pageBuilder ?? [];
  const byKey = Object.fromEntries(blocks.map((b) => [b._key, b]));
  // pc-crisis is optional: Nathan removed the crisis band on 2026-10-26, so a page without it is fine.
  for (const k of ['pc-hero', 'pc-contact', 'pc-reach', 'pc-care']) {
    if (!byKey[k]) throw new Error(`Need the pastor? has no ${k}; read the page first.`);
  }
  byKey['pc-contact'] = { ...byKey['pc-contact'], callButtons: true };
  if (byKey['pc-crisis']) byKey['pc-crisis'] = { ...byKey['pc-crisis'], label: CRISIS_LABEL };
  // The prayer form drops from the closing red band to a link card beside "write to us".
  byKey['pc-more'] = byKey['pc-more'] ?? {
    _key: 'pc-more',
    _type: 'buttonRowSection',
    heading: 'Or write it down',
    layout: 'cards',
    links: [
      {
        _key: 'pc-more-prayer',
        _type: 'quickLink',
        link: {
          _type: 'ctaBlock',
          label: 'Send a prayer request',
          linkType: 'internal',
          internalLink: ref('page-prayer'),
        },
        note: 'Pastor Jacob reads every one, and you can leave your name off.',
      },
      {
        _key: 'pc-more-write',
        _type: 'quickLink',
        link: {
          _type: 'ctaBlock',
          label: 'Write to the church',
          linkType: 'external',
          externalUrl: '/contact/?topic=question&about=For%20Pastor%20Jacob',
        },
        note: 'A message to the church, for anything that can wait a day.',
      },
    ],
  };
  const pageBuilder = CARE_ORDER.map((k) => byKey[k]).filter(Boolean);
  return diff(page, { pageBuilder });
}

// ── 6. Prayer requests: the same plain label on its crisis line ──────────────────────────────
export function prayerPlan(page) {
  const pageBuilder = (page?.pageBuilder ?? []).map((b) =>
    b._type === 'noticeSection' && /988|911/.test(b.message ?? '')
      ? { ...b, label: CRISIS_LABEL }
      : b,
  );
  return diff(page, { pageBuilder });
}

export const PAGE_PLANS = {
  contactPage: contactPlan,
  homePage: homePlan,
  'page-plan-your-visit': planVisitPlan,
  'page-pastoral-care': pastoralCarePlan,
  'page-prayer': prayerPlan,
};
