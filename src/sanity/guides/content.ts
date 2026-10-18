// =============================================================================
// Help & Guide content — plain-language walkthroughs for the site's owner
// =============================================================================
// PORTS.md card 41. This is DATA, not code: each guide is a list of typed
// blocks, rendered read-only by GuideView and grouped in the desk by category.
//
// WHY IT LIVES IN THE REPO. Guides held as Sanity documents can be deleted by
// the person who most needs them, do not travel with a fork, and are empty
// until somebody remembers to seed them. In the repo they cannot be lost and
// every fork inherits them with the code.
//
// ── THIS IS A TEMPLATE. REWRITE IT PER PROJECT. ─────────────────────────────
// What follows is the generic set: true of any site built on this starter, and
// therefore not very useful to any particular client. A real project replaces
// the wording with ITS jobs, in ITS language, named after the things that
// actually exist in ITS Studio. The stonesteps-50k fork is the worked example:
// twelve guides about race dates, results and trekkers, none of which are here.
//
// Two things to keep when you rewrite:
//   1. The reassurance first. "You cannot break the live site by editing" is
//      the single most useful sentence in the whole handbook.
//   2. The rebuild delay. Every static site owner's first support question is
//      "I published and nothing happened".
//
// ── EDITING CONVENTIONS ─────────────────────────────────────────────────────
//   - **double asterisks** for a concept worth emphasis.
//   - `backticks` for a THING YOU CLICK. Renders as a small button-look chip,
//     so a step can be skimmed for its clickable part.
//   - _underscores_ for a light aside.
//   - No em-dashes. Commas, or "and".
//   - Define any jargon in plain words the first time it appears.
//   - src/lib/studio-guides.test.ts enforces the structural half of this.
// =============================================================================

export type DiyLevel = 'self' | 'ask' | 'mixed';

/** Where a "Where in the Studio" breadcrumb can link to. */
export type PathLink = { doc: string; type?: string } | { pane: string } | { tool: string };

export type GuideBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'path'; items: string[]; link?: PathLink }
  | {
      kind: 'callout';
      tone?: 'primary' | 'positive' | 'caution' | 'critical' | 'default';
      title?: string;
      text: string;
    }
  | { kind: 'seealso'; items: string[] };

/** Names the prose refers to. Replace these, do not hardcode them in guides. */
export const SITE = {
  /** Who the owner should ask when a guide does not cover it. */
  contactName: 'your developer',
};

export const GUIDE_CATEGORIES = [
  'Start here',
  'Pages and words',
  'Pictures',
  'Housekeeping',
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  icon: string;
  lead: string;
  diy: DiyLevel;
  body: GuideBlock[];
}

export const guides: Guide[] = [
  {
    slug: 'start-here',
    category: 'Start here',
    title: 'Start here: how this all works',
    icon: '👋',
    lead: 'Two minutes that make everything else make sense.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'The Studio and the website are two different things' },
      {
        kind: 'p',
        text: 'What you are looking at now is the **Studio**. It is private, and it is where the website gets edited. The **website** is what your visitors see. You change things here, and they appear on the website a few minutes later.',
      },
      { kind: 'h', text: 'You cannot break the website by editing' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Nothing is live until you press Publish.',
        text: 'While you type you are editing a private **draft**. The public website does not change at all until you click `Publish`. So open things, click around, and only publish when it looks right. If you make a mess and have not published, close the tab and walk away.',
      },
      { kind: 'h', text: 'How a change reaches the website' },
      {
        kind: 'steps',
        items: [
          'Open the thing you want to change from the menu on the left.',
          'Edit the boxes. Your typing saves itself as a draft as you go.',
          'When it looks right, click the `Publish` button at the bottom right.',
          'Wait two or three minutes. The website rebuilds itself and your change appears.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Give it a couple of minutes.',
        text: 'The website does not change the instant you publish. It is built in advance for speed, so it has to rebuild in the background. Publish, go and do something else, then refresh the page you changed.',
      },
      { kind: 'seealso', items: ['Change the words on a page'] },
    ],
  },

  {
    slug: 'edit-a-page',
    category: 'Pages and words',
    title: 'Change the words on a page',
    icon: '📄',
    lead: 'Every page is a stack of blocks. You edit the blocks.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'How a page is built' },
      {
        kind: 'p',
        text: 'A page is a stack of **sections**, one on top of the other. You edit what is inside a section. You do not have to think about colours or spacing: the design decides those from where the section sits on the page, which is why the site stays consistent no matter who edits it.',
      },
      { kind: 'h', text: 'Seeing it as you type' },
      {
        kind: 'steps',
        items: [
          'Click `Presentation` in the bar at the top of the Studio.',
          'Pick the page on the left. The real page appears beside it.',
          'Click any words on the page to jump to the box that holds them.',
          'Type. The page updates as you go.',
          'Publish when it reads right.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'The preview shows your draft.',
        text: 'What you see in Presentation is your unpublished draft, not the live site. That is the point: you see the change before anyone else does.',
      },
      { kind: 'h', text: 'Adding something to Contact, Questions, News and notes or Privacy' },
      {
        kind: 'p',
        text: 'Those pages keep their own layout, and each has an `Extra sections` tab. Anything you add there (a photo, a short note, a button) appears at the bottom of that page.',
      },
    ],
  },

  {
    slug: 'add-a-page',
    category: 'Pages and words',
    title: 'Add a new page',
    icon: '➕',
    lead: 'And the one thing to get right before you publish it.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Open `Pages`, then `Custom pages (build your own)`, then the `+` button.',
          'Give it a title. The **slug**, which is the part of the web address after the slash, is made from it when you click `Generate`.',
          'Add sections until it says what you want. Drag them to change the order.',
          'To put it in the menu, open the `Menu placement` tab and turn on `Show in the top menu`. It joins the end of the menu. `Show in the footer` adds it to the last row of footer links.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Think about the slug before you publish, not after.',
        text: 'The slug becomes the page address. Changing it later breaks every link anyone has saved or shared. If you do have to change one, see the guide on renaming.',
      },
      {
        kind: 'p',
        text: '_Some slugs are reserved because a built-in page already uses them. The Studio will tell you if you pick one._',
      },
      { kind: 'seealso', items: ['Rename a page without breaking links'] },
    ],
  },

  {
    slug: 'rename-a-page',
    category: 'Pages and words',
    title: 'Rename a page without breaking links',
    icon: '↪️',
    lead: 'Anyone who saved the old address should still arrive.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Changing a page address breaks every link to it: search results, other people’s websites, a printed flyer. A **redirect** sends the old address to the new one so nobody lands on an error.',
      },
      {
        kind: 'steps',
        items: [
          'Change the slug on the page and publish.',
          'That is it. The Studio notices the address changed and files the redirect for you. You can see it under `Pages`, `Redirects (old links)`.',
          'For an address that never existed here (a link printed on an old flyer, say), add a redirect by hand: the old address in `From`, the page in `To`, then publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Redirects cost nothing to keep.',
        text: 'There is no reason to ever delete one. An old redirect is a visitor who still arrives.',
      },
    ],
  },

  {
    slug: 'images-and-alt',
    category: 'Pictures',
    title: 'Add or change a picture',
    icon: '📷',
    lead: 'And write the one line that describes it.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Open the page and find the section holding the picture.',
          'Click it, then `Replace`, and choose a new one.',
          'Fill in `Alt text`. See below, it matters.',
          'Publish.',
        ],
      },
      { kind: 'h', text: 'What alt text is' },
      {
        kind: 'p',
        text: 'One plain sentence describing what is in the picture, for somebody who cannot see it. It is read aloud by screen readers, shown if the image fails to load, and read by Google. Describe what is happening, not the file: "a full workshop with people at long tables" rather than "IMG_4471".',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Do not shrink pictures before uploading.',
        text: 'Upload the biggest version you have. The site resizes every image itself and sends each visitor the size that suits their screen, so a large original gives a better result than one you shrank first.',
      },
    ],
  },

  {
    slug: 'menus-and-footer',
    category: 'Housekeeping',
    title: 'Change the menu or the footer',
    icon: '🧭',
    lead: 'The links across the top and along the bottom.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site Settings'],
        link: { doc: 'siteSettings' },
      },
      {
        kind: 'p',
        text: 'Open the `Navigation (menus)` tab. `Top menu links` is the full menu, the one that opens from the `Menu` button; the bar across the top of the website shows the **first four** of them, so put the most important first. A `Dropdown` groups several pages under one heading. `Header button` is the `Plan your visit` button. `Footer link columns` are the rows of links in the footer. Pick pages from the list rather than typing addresses, so a renamed page never breaks a link. Drag rows to reorder them, and use the `...` menu on a row to remove one.',
      },
      {
        kind: 'p',
        text: "The footer's own words (the line under the big heading, the second button and the line in the bottom bar) are on the `Social & footer` tab. Leave one empty and the website uses its built-in wording.",
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A long menu is a worse menu.',
        text: 'Every item you add makes the others harder to find, and the header runs out of room on a phone before it does on your screen. If something has to go in, consider what comes out.',
      },
    ],
  },

  {
    slug: 'home-page',
    category: 'Pages and words',
    title: 'Rearrange the home page',
    icon: '🏠',
    lead: 'Move, add or remove the sections on the front page.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Pages', 'Home', 'Page layout'],
        link: { doc: 'homePage' },
      },
      {
        kind: 'steps',
        items: [
          'Open `Home`, then the `Page layout` tab.',
          'Drag a section to move it. Use the `...` menu on a section to remove it, and `Add item` to add one from the library.',
          'Publish.',
        ],
      },
      { kind: 'h', text: 'The home page has a few special sections' },
      {
        kind: 'bullets',
        items: [
          'The **Hero** is the welcome at the top, with the This Sunday card. Keep it first.',
          'The first **Stepping-stone steps** section is drawn as "Your first Sunday", the numbered walk. Steps marked as a Sunday gathering show their time by themselves.',
          'The first **Image + text** section is "Who we are": the photos and your signed welcome.',
          '**This week** and **Watch** sit side by side when they are next to each other.',
          'A **Cards with stone icons** section after those is drawn as the "Other ways in" band.',
          'Anything else you add appears in the standard style, wherever you put it.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'The times are not typed here.',
        text: 'The This Sunday card, the walk and This week all read the service times from Church facts, so they always agree. See the guide on changing the times.',
      },
      { kind: 'seealso', items: ['Change the service times or the address'] },
    ],
  },

  {
    slug: 'church-facts',
    category: 'Housekeeping',
    title: 'Change the service times or the address',
    icon: '🕘',
    lead: 'Typed once, shown everywhere.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site Settings', 'Church facts'],
        link: { doc: 'siteSettings' },
      },
      {
        kind: 'p',
        text: 'The service times and the address are typed in one place only. The top of the website, the This Sunday card, "Your first Sunday", This week, the menu, the footer, Google and the "Add to my calendar" link all read them from here, so a change here changes all of them.',
      },
      {
        kind: 'steps',
        items: [
          'Open `Site Settings`, then the `Church facts` tab.',
          'Change a time in `Service times`. Type it the 24-hour way: `09:45`, `11:00`, `18:00` for 6 pm.',
          'Tick `Confirmed by the church` once it is right. Until then the website shows a small "To confirm" tag beside it and keeps it away from Google.',
          'Publish.',
        ],
      },
      {
        kind: 'p',
        text: '`How to find us`, under the address, is one optional sentence for someone driving out: where to park, which door. It shows on the This Sunday card and in the footer.',
      },
    ],
  },

  {
    slug: 'after-sunday',
    category: 'Pages and words',
    title: 'After Sunday: name the message',
    icon: '🎙️',
    lead: 'Thirty seconds that make the home page feel current.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'The "Last Sunday" card on the home page can say which message was preached and link to the video. Facebook does not let a website read its videos by itself, so this is a quick entry after Sunday.',
      },
      {
        kind: 'steps',
        items: [
          'Open `Home`, then `Page layout`, then the `Watch` section.',
          "Fill in `Last Sunday's message`: the title, the Bible passage, the date it was preached, and the link to the video.",
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'It tidies itself away.',
        text: 'The card shows the message for eight days after its date, then goes back to its usual words, so an old title is never left up by mistake.',
      },
    ],
  },

  {
    slug: 'seo-fields',
    category: 'Housekeeping',
    title: 'What the SEO boxes do',
    icon: '🔍',
    lead: 'The title and description Google shows.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Each page has an **SEO title** and **SEO description**. They are not shown on the page itself. They are what appears in a search result and in the little card when somebody shares the link.',
      },
      {
        kind: 'bullets',
        items: [
          'Leave them empty and the page title is used, which is usually fine.',
          'Write a description as a sentence to a person, not a list of keywords.',
          'The counter under the box turns amber when it is long enough that Google will cut it off.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Google decides in the end.',
        text: 'These are strong hints, not instructions. Google sometimes shows its own wording if it thinks that answers the search better.',
      },
    ],
  },

  {
    slug: 'housekeeping',
    category: 'Housekeeping',
    title: 'The occasional tidy-up',
    icon: '🧹',
    lead: 'Worth ten minutes once or twice a year.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          'Look for **unpublished drafts**: somebody started an edit and did not finish, and nothing is live until it is published.',
          'Read the pages you have not touched in a year. Prices, names and opening hours go stale quietly.',
          'Check the links that leave your site still work. Other people move their pages without telling you.',
          'Look at the site on a phone. Most of your visitors are on one.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Never use "Remove field" in the Studio.',
        text:
          'It appears when a page has a box the design no longer uses. It deletes that box across EVERY page at once and cannot be undone without restoring a backup. If you see it, leave it and ask ' +
          SITE.contactName +
          '.',
      },
    ],
  },
];
