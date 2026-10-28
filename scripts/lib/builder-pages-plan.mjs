// The plan for scripts/content/builder-pages.mjs (2026-10-26, every main page a page builder):
// what each page's new Page layout holds, built from its old fields, and the two new Studio pages.
// Pure, so builder-pages-plan.test.mjs checks it and a local build can be run against it.

const span = (k, text) => ({ _type: 'span', _key: `${k}-s`, text, marks: [] });
const bullet = (k, text) => ({
  _type: 'block',
  _key: k,
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  markDefs: [],
  children: [span(k, text)],
});
export const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));

const hero = (key, doc, fallback) =>
  defined({
    _type: 'heroSection',
    _key: key,
    eyebrow: doc?.heroEyebrow ?? fallback.eyebrow,
    headline: doc?.heroHeadline || fallback.headline,
    subhead: doc?.heroSubhead ?? fallback.subhead,
    backgroundImage: doc?.heroImage,
    scriptAccent: doc?.heroScriptAccent,
    icon: fallback.icon,
    size: 'short',
  });
const extras = (doc) => doc?.additionalSections ?? [];

export const plans = {
  contactPage: (d) => [
    hero('ct-hero', d, { eyebrow: 'Get in touch', headline: 'Contact us', subhead: '' }),
    { _type: 'contactFormSection', _key: 'ct-form', sidebar: true },
    ...extras(d),
  ],
  privacyPage: (d) => [
    hero('pv-hero', d, { eyebrow: 'Your privacy', headline: 'Privacy policy', subhead: '' }),
    defined({
      _type: 'privacyPolicySection',
      _key: 'pv-policy',
      lastUpdated: d?.lastUpdated,
      body: d?.body,
    }),
  ],
  journalPage: (d) => [
    hero('jn-hero', d, {
      eyebrow: 'From the church',
      headline: 'News and notes',
      subhead: 'News, sermon notes and stories from the church family.',
    }),
    { _type: 'journalPostsSection', _key: 'jn-posts', showCategories: true, showNewsletter: true },
    ...extras(d),
    defined({
      _type: 'ctaBandSection',
      _key: 'jn-cta',
      headline: d?.finalCtaHeadline,
      subhead: d?.finalCtaSubhead,
      scriptAccent: d?.finalCtaScriptAccent,
      backgroundImage: d?.finalCtaBackgroundImage,
      cta: d?.finalCta,
    }),
  ],
  sermonsPage: (d) => [
    hero('sm-hero', d, {
      eyebrow: 'Sunday by Sunday',
      headline: 'Sermons',
      subhead: 'Catch up on a Sunday you missed, or listen again.',
    }),
    {
      _type: 'watchSection',
      // Its heading keeps the id #sermons-watch-heading (src/lib/church-anchors.ts).
      _key: 'sermons-watch',
      eyebrow: 'Sundays, wherever you are',
      heading: 'Watch live, or catch up',
      body: 'Worship is streamed live every Sunday, and the latest message is always here.',
      fallback: "Messages will appear here once the church's video channel is connected.",
    },
    { _type: 'sermonArchiveSection', _key: 'sm-archive', heading: 'Every sermon' },
    {
      _type: 'sermonSeriesSection',
      _key: 'sm-series',
      heading: 'Sermon series',
      limit: 24,
      hideWhenEmpty: true,
    },
    { _type: 'podcastSection', _key: 'sm-podcast', heading: 'Listen on the go' },
    ...extras(d),
  ],
};

// The two new Studio pages. The words are the ones the hard-coded pages showed.
export const newPages = [
  {
    _id: 'page-give',
    _type: 'page',
    title: 'Give',
    slug: { _type: 'slug', current: 'give' },
    seoDescription:
      'How to give to First Baptist Church of Auburn: in the offering on Sunday, by mail, or online.',
    pageBuilder: [
      {
        _type: 'heroSection',
        _key: 'gv-hero',
        eyebrow: 'Giving',
        headline: 'Give',
        subhead:
          'Giving is part of worship here. Every gift supports the ministry in Auburn and the work of Southern Baptist churches around the world. Nobody is expected to give on a first visit.',
        icon: 'giving-hand',
        size: 'short',
      },
      { _type: 'givingSection', _key: 'gv-ways', heading: 'Ways to give' },
      {
        // The asks the old page showed before launch. Answer them here, or remove the section.
        _type: 'richTextSection',
        _key: 'gv-care',
        heading: 'How gifts are cared for',
        body: [
          bullet(
            'gv-care-1',
            '[Jacob: how the offering is counted and recorded (for example, by two people together), so givers know it is handled with care.]',
          ),
          bullet(
            'gv-care-2',
            '[Jacob: whether givers get a giving statement each January for their taxes, and who to ask for one.]',
          ),
          bullet(
            'gv-care-3',
            '[Jacob: how the budget is set: does the church vote on it each year?]',
          ),
          bullet(
            'gv-care-4',
            '[Jacob: a sentence on the Cooperative Program and how much of each gift goes to it, if you would like that shared.] [Placeholder: Through the Cooperative Program, Southern Baptist churches pool part of their giving to send missionaries, train pastors and start new churches.]',
          ),
        ],
      },
    ],
  },
  {
    _id: 'page-bulletin',
    _type: 'page',
    title: "This week's bulletin",
    slug: { _type: 'slug', current: 'bulletin' },
    seoDescription:
      "The newest Sunday bulletin from First Baptist Church of Auburn: the order of service, the week's news and the dates to keep.",
    pageBuilder: [
      {
        _type: 'heroSection',
        _key: 'bl-hero',
        eyebrow: 'Sunday bulletin',
        headline: "This week's bulletin",
        subhead: "The order of service, this week's news and the dates to keep.",
        size: 'short',
      },
      { _type: 'bulletinSection', _key: 'bl-bulletin', earlierHeading: 'Earlier bulletins' },
    ],
  },
];
