// =============================================================================
// Site Guide content — plain-language walkthroughs for the site's owner
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
//   - `icon` is a NAME from GUIDE_ICONS in components/GuideView.tsx (an
//     @sanity/icons icon), never an emoji. FBC Auburn, 2026-10-18.
//   - Call things what the Studio calls them: "web address ending", not slug;
//     "Site settings"; "Live preview" (the tool's own name); US spelling.
//   - Define any jargon in plain words the first time it appears.
//   - src/lib/studio-guides.test.ts enforces the structural half of this.
// =============================================================================

import { collectionGuides } from './collections.ts';

import { phoneGuides } from './phoneGuides.ts';

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
  /** Who the owner should ask when a guide does not cover it. Matches kitConfig.helper.name. */
  contactName: 'Nathan',
};

export const GUIDE_CATEGORIES = [
  'Start here',
  'Pages and words',
  // FBC Auburn, 2026-10-18: one guide per group of page templates (src/sanity/pageTemplates.ts).
  'Page templates',
  // FBC Auburn, 2026-10-18 (guides/collections.ts).
  'Sermons, people and downloads',
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
  /**
   * Optional short clip of the job being done (PORTS.md card 115). Shows under
   * "Watch how it is done" on Home and in the Site Guide; with no clips anywhere
   * the row hides itself. Either a file in public/ (record the screen, save as
   * MP4, put it at public/guides/<slug>.mp4 and write "/guides/<slug>.mp4"), or
   * a YouTube (unlisted is fine) or Vimeo link. Keep clips under two minutes.
   */
  video?: string;
}

export const guides: Guide[] = [
  {
    slug: 'start-here',
    category: 'Start here',
    title: 'Start here: how this all works',
    icon: 'info',
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
      { kind: 'h', text: 'Where things are' },
      {
        kind: 'bullets',
        items: [
          '`Home` (the top bar) shows what to do this week and whether your last change is on the website.',
          '`Content` is where everything is edited. Its first item, `Our church at a glance`, shows the service times, address and contact details the website uses, with anything still to confirm marked.',
          '`Live preview` shows the real pages with your changes in place.',
          '`Site Guide`, where you are now, has the step-by-step help. `Help for this page` brings the right part of it up beside whatever you are editing.',
        ],
      },
      { kind: 'seealso', items: ['Change the words on a page'] },
    ],
  },

  {
    slug: 'edit-a-page',
    category: 'Pages and words',
    title: 'Change the words on a page',
    icon: 'document',
    lead: 'Every page is a stack of blocks. You edit the blocks.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'How a page is built' },
      {
        kind: 'p',
        text: 'A page is a stack of **sections**, one on top of the other. You edit what is inside a section. You do not have to think about colors or spacing: the design decides those from where the section sits on the page, which is why the site stays consistent no matter who edits it.',
      },
      { kind: 'h', text: 'Seeing it as you type' },
      {
        kind: 'steps',
        items: [
          'Click `Live preview` in the bar at the top of the Studio.',
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
        text: 'What you see in Live preview is your unpublished draft, not the live site. That is the point: you see the change before anyone else does.',
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
    icon: 'add',
    lead: 'And the one thing to get right before you publish it.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Open `Pages`, then `Custom pages (build your own)`, then the `+` button.',
          'Pick a starting point. Each one starts with its group, like `Visitors: Plan a visit` or `Blank: Simple page`. The guide on page templates says what each group gives you.',
          'Give it a title. The **web address ending**, the part of the address after the slash, is made from it when you click `Generate`.',
          'Replace the example text, and add or remove sections until it says what you want. Drag them to change the order.',
          'To put it in the menu, open the `Menu placement` tab and turn on `Show in the top menu`. It joins the end of the menu. `Show in the footer` adds it to the last row of footer links.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Think about the web address before you publish, not after.',
        text: 'The web address ending becomes the page address. Changing it later breaks every link anyone has saved or shared. If you do have to change one, see the guide on renaming.',
      },
      {
        kind: 'p',
        text: '_Some addresses are reserved because a built-in page already uses them. The Studio will tell you if you pick one._',
      },
      {
        kind: 'seealso',
        items: ['Start a page from a template', 'Rename a page without breaking links'],
      },
    ],
  },

  {
    slug: 'page-templates',
    category: 'Page templates',
    title: 'Start a page from a template',
    icon: 'blocks',
    lead: 'Every new page can start laid out and filled in, so you are editing rather than starting from nothing.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'When you make a new page the Studio asks where to start. A **template** is a page that is already laid out, with sensible words in every box. The menu has no headings, so each template starts with its group: `Visitors: Plan a visit`, `Ministries: Kids`, `Life events: Baptism` and so on.',
      },
      {
        kind: 'steps',
        items: [
          'Open `Pages`, then `Custom pages (build your own)`, then the `+` button.',
          'Pick a template. The groups are below, and each has its own short guide.',
          'Give the page a title, then click `Generate` beside the web address ending.',
          'Read down the page and replace every line that starts **Example:** with your own words.',
          'Point each button at the right page (open the button and pick the page under `Internal page`).',
          'Fill in anything the Studio marks in red, like a countdown date or which form to show. Then publish.',
        ],
      },
      {
        kind: 'bullets',
        items: [
          '**Visitors**: Plan a visit, Next steps, Get in touch.',
          '**About us**: Beliefs, Our story, Leadership, Pastor, Give, Pastor search.',
          '**Ministries**: any ministry, Kids, Students, Women, Men, Senior adults, Music, Missions, Mission trip, Sunday School, Serve, Prayer.',
          '**Life events**: Baptism, Membership class, Weddings, Funerals and memorial services, Facility use.',
          '**Seasonal**: any event, Vacation Bible School, Easter, Christmas, Homecoming, Revival week, Trunk-or-treat, Thanksgiving meal, Anniversary year.',
          '**Sermons and news**: a sermon series, and a news page. The main sermon archive is already at /sermons/.',
          '**Blank**: a simple page with a heading and text, or a page with nothing on it.',
        ],
      },
      { kind: 'h', text: 'What "Example:" means' },
      {
        kind: 'p',
        text: 'Anything only the church can say (a name, a day, a room, how something is run) starts with **Example:**. Words that are true for any church, like "Children are welcome in the service", are left plain for you to keep or change. A section that still has an Example line shows a small yellow warning, so nothing example-shaped goes live by accident.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Service times and the address are never typed on a page.',
        text: 'Templates use the sections that read them from Site settings, then Church facts, so they are only ever changed in one place.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'A template is only a starting point.',
        text: 'Once the page is made it is yours. Add, remove and drag sections exactly as on any other page; the template never comes back and changes anything.',
      },
      {
        kind: 'seealso',
        items: [
          'Add a new page',
          'Templates for visitors',
          'Add Easter, Christmas or a snow notice to a page',
        ],
      },
    ],
  },

  {
    slug: 'templates-visitors',
    category: 'Page templates',
    title: 'Templates for visitors',
    icon: 'home',
    lead: 'Plan a visit, Next steps and Get in touch: the pages a newcomer reads first.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          '`Visitors: Plan a visit` gives the service times, what to expect, the questions people ask, and the map. Write the answers the way you would say them at the door.',
          '`Visitors: Next steps` walks from following Jesus to baptism, membership and serving, with a card linking to each of those pages.',
          '`Visitors: Get in touch` shows the phone, email and address from Church facts, a form and the map.',
        ],
      },
      {
        kind: 'p',
        text: 'Get in touch has a form section. Make the form first under `Content`, then `Forms`, then pick it in the section.',
      },
      { kind: 'seealso', items: ['Start a page from a template', 'Make a new form'] },
    ],
  },

  {
    slug: 'templates-about',
    category: 'Page templates',
    title: 'Templates about the church',
    icon: 'info',
    lead: 'Beliefs, Our story, Leadership, Pastor, Give and Pastor search.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          '`About us: Beliefs` starts with seven beliefs, each with Bible references that link to the verses. The draft wording is in line with the Baptist Faith and Message 2000; rewrite each one in your own words. The link to the full statement is switched on at the bottom of the section.',
          '`About us: Our story` is a timeline. The years show as "19__" until you type the real ones; add a photo to any moment.',
          '`About us: Leadership` and `Pastor search` show people from the People list. In each People section, pick the group to show (Staff, Deacons, the search committee).',
          '`About us: Pastor` is a letter from the pastor, a few facts, and his latest sermon, which changes on its own.',
          '`About us: Give` shows the ways to give from Church facts, a verse and common questions. No amounts are typed anywhere.',
        ],
      },
      {
        kind: 'seealso',
        items: ['Start a page from a template', 'Add someone to the people list'],
      },
    ],
  },

  {
    slug: 'templates-ministries',
    category: 'Page templates',
    title: 'Templates for ministries',
    icon: 'blocks',
    lead: 'Kids, Students, Women, Men, Senior adults, Music, Missions, Sunday School, Serve and Prayer.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Each ministry page has the same shape: who it is for, what you do together, when and where, a verse, and the ministry’s upcoming events from the church calendar. The events section only shows calendar events whose name or description mentions its words (like "Kids, Children, VBS"), so name events that way in Church Trac.',
      },
      {
        kind: 'bullets',
        items: [
          '`Ministries: Ministry (any)` is the plain version, for a ministry without its own template.',
          '`Ministries: Mission trip` has a countdown. Pick the first day of the trip before you publish.',
          '`Ministries: Serve` and `Ministries: Prayer` each end with a form. Make the form under `Content`, then `Forms`, and pick it in the section. For Prayer, choose `Prayer requests (kept private)` when you make the form.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Check every claim about safety.',
        text: 'Lines like "every volunteer is background-checked" are Example lines because only you know if they are true. Keep them only if they are.',
      },
      {
        kind: 'seealso',
        items: ['Start a page from a template', 'Prayer requests: what happens to them'],
      },
    ],
  },

  {
    slug: 'templates-life-events',
    category: 'Page templates',
    title: 'Templates for life events',
    icon: 'document',
    lead: 'Baptism, Membership class, Weddings, Funerals and Facility use.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          '`Life events: Baptism` uses the church’s baptism drawing beside what baptism means, then a verse and common questions.',
          '`Life events: Membership class` shows the steps to joining and when the next class meets.',
          '`Life events: Weddings` and `Funerals and memorial services` answer the first questions people ask and end with the church’s contact details.',
          '`Life events: Facility use` lists the spaces, the questions to ask first, and a downloads list for the policy. Add the policy under `Downloads` with the kind set to `Policy`.',
        ],
      },
      {
        kind: 'p',
        text: 'For a page remembering one member, use the `Memorial for a member` saved section instead, and only with the family’s blessing.',
      },
      {
        kind: 'seealso',
        items: ['Start a page from a template', 'Add Easter, Christmas or a snow notice to a page'],
      },
    ],
  },

  {
    slug: 'templates-seasonal',
    category: 'Page templates',
    title: 'Templates for the church year',
    icon: 'clock',
    lead: 'VBS, Easter, Christmas, Homecoming, Revival, Trunk-or-treat, Thanksgiving and an anniversary year.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Each seasonal template makes a whole page for one occasion. Most start with a **countdown** that changes on its own: days to go, then "happening now", then a thank-you.',
      },
      {
        kind: 'steps',
        items: [
          'Make the page from the template, like `Seasonal: Easter`.',
          'Open the countdown and pick the `First day` (and the `Last day` for something that runs all week, like VBS or revival).',
          'Replace the Example lines with this year’s times and details.',
          'For VBS, make a sign-up form under `Content`, then `Forms`, and pick it in the form section.',
          'Publish. Next year, change the dates and the details and publish again: the page is ready to reuse.',
        ],
      },
      {
        kind: 'p',
        text: '_Only want an Easter band on the home page, not a whole page? Use the saved sections in the next guide._',
      },
      {
        kind: 'seealso',
        items: ['Add Easter, Christmas or a snow notice to a page', 'Count down to VBS'],
      },
    ],
  },

  {
    slug: 'templates-sermons-news',
    category: 'Page templates',
    title: 'Templates for sermons and news',
    icon: 'play',
    lead: 'A page for one sermon series, and a news page.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          '`Sermons and news: Sermon series` introduces a series, shows the latest message and the other series. Sermons themselves are added under `Sermons`.',
          '`Sermons and news: News` shows the latest news posts, upcoming events, the newsletter downloads and the email sign-up.',
        ],
      },
      {
        kind: 'p',
        text: 'The full sermon archive is already at /sermons/ and the news archive at /journal/, so these are for a page of your own, like a ministry’s news or a series you want to point people to.',
      },
      { kind: 'seealso', items: ['Start a page from a template', 'Start a new sermon series'] },
    ],
  },

  {
    slug: 'seasonal-patterns',
    category: 'Page templates',
    title: 'Add Easter, Christmas or a snow notice to a page',
    icon: 'copy',
    lead: 'Ready-made groups of sections to drop into a page that already exists.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Under `Pages`, then `Saved sections`, there is a ready-made set for the church year: Easter services, Christmas services, Homecoming Sunday, Revival week, Trunk-or-treat and fall festival, Thanksgiving meal, Building fund, Anniversary year, Snow Sunday closing notice, the Lottie Moon and Annie Armstrong mission offerings, and Memorial for a member.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page you want it on, like the home page.',
          'Scroll to the bottom of its sections and click `Insert a saved section`.',
          'Pick the one you want and click `Add a copy`. It goes at the bottom; drag it where you want it.',
          'Replace every Example line, pick any date the Studio asks for, then publish.',
          'When the season is over, remove the sections from the page. The saved section stays for next year.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Use "Add a copy", not "Add synced", for these.',
        text: 'The ready-made ones are kept as drafts with Example text in them, so a synced copy cannot show them. A copy is yours to fill in.',
      },
      {
        kind: 'bullets',
        items: [
          '**Building fund** and the mission offerings have a progress bar. Type the goal and the amount raised so far, and update the amount each week.',
          '**Snow Sunday closing notice** shows only between the dates you set. Drag it to the top of the page.',
        ],
      },
      {
        kind: 'seealso',
        items: ['Reuse a section on other pages', 'Put up a notice for a snow Sunday'],
      },
    ],
  },

  {
    slug: 'reuse-sections',
    category: 'Pages and words',
    title: 'Reuse a section on other pages',
    icon: 'copy',
    lead: 'Build a section once, then drop it onto any page as a copy.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'A **saved section** is a section (or a group of sections that belong together, like a banner, a picture with text and a call to action) kept so you can add it again. Saved sections live under `Pages`, then `Saved sections`.',
      },
      { kind: 'h', text: 'Save one' },
      {
        kind: 'steps',
        items: [
          'Open the page that has the section you like.',
          'Open the menu next to `Publish` and choose `Save a section as preset...`.',
          'Pick the section, give it a name you will recognize, and save.',
          'To keep several sections together, open the saved section under `Saved sections` and add more sections to it with `+ Add item`. Then publish it.',
        ],
      },
      { kind: 'h', text: 'Add one to a page' },
      {
        kind: 'steps',
        items: [
          'Open the page and scroll to its sections.',
          'Click `Insert a saved section` under the list.',
          'Pick one and click `Add a copy`. It goes at the bottom of the page; drag it where you want it.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'A copy is yours to change.',
        text: 'Changing a copied section on one page never changes the saved section or any other page. If you want one section that stays the same everywhere, use a synced section instead.',
      },
      {
        kind: 'p',
        text: '_The `+ Add item` menu opens on pictures of every kind of section. Type in its search box to find one by name, or switch it to a plain list with the buttons at the top._',
      },
      { kind: 'seealso', items: ['Keep a section the same on every page'] },
    ],
  },

  {
    slug: 'synced-sections',
    category: 'Pages and words',
    title: 'Keep a section the same on every page',
    icon: 'sync',
    lead: 'Edit it once and every page that uses it changes.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'A **synced section** shows a saved section, live. It holds no words of its own: the words live in the saved section. Change the saved section, publish it, and every page using it changes together. Good for a band that must say the same thing everywhere, like opening times or a "Get in touch" strip.',
      },
      { kind: 'h', text: 'Add one' },
      {
        kind: 'steps',
        items: [
          'Make and publish the saved section first (see the guide on reusing sections).',
          'Open a page and click `Insert a saved section` under its sections.',
          'Pick the saved section and click `Add synced`.',
          'In the sections list it shows as **Synced:** and the saved section name.',
        ],
      },
      { kind: 'h', text: 'Change it everywhere' },
      {
        kind: 'steps',
        items: [
          'Go to `Pages`, then `Saved sections`, and open the one you want to change.',
          'Edit it, then `Publish`.',
          'Every page that shows it updates when the website rebuilds, in a few minutes.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Changing it changes it everywhere.',
        text: 'That is the point, but check which pages use it before you rewrite it. If one page needs different words, remove the synced section from that page and add a copy instead.',
      },
      { kind: 'seealso', items: ['Reuse a section on other pages'] },
    ],
  },

  {
    slug: 'rename-a-page',
    category: 'Pages and words',
    title: 'Rename a page without breaking links',
    icon: 'arrow',
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
          'Change the web address ending on the page and publish.',
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
    icon: 'image',
    lead: 'And write the one line that describes it.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Open the page and find the section holding the picture.',
          'Click it, then `Replace`, and choose a new one.',
          'Fill in `Description of the photo`. The website will not publish a photo without one. See below, it matters.',
          'Publish.',
        ],
      },
      { kind: 'h', text: 'What the description is for' },
      {
        kind: 'p',
        text: 'One plain sentence describing what is in the picture, for somebody who cannot see it, like "Children singing at the Christmas service". It is read aloud by screen readers, shown if the image fails to load, and read by Google. Describe what is happening, not the file: "a full workshop with people at long tables" rather than "IMG_4471".',
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
    icon: 'menu',
    lead: 'The links across the top and along the bottom.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site settings'],
        link: { doc: 'siteSettings' },
      },
      {
        kind: 'p',
        text: 'Open the `Menus` tab. `Top menu links` is the full menu, the one that opens from the `Menu` button; the bar across the top of the website shows the **first four** of them, so put the most important first. A `Dropdown` groups several pages under one heading. `Header button` is the `Plan your visit` button. `Footer link columns` are the rows of links in the footer. Pick pages from the list rather than typing addresses, so a renamed page never breaks a link. Drag rows to reorder them, and use the `...` menu on a row to remove one.',
      },
      {
        kind: 'p',
        text: "The footer's own words (the line under the big heading, the second button and the line in the bottom bar) are on the `Social and footer` tab. Leave one empty and the website uses its built-in wording.",
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
    icon: 'home',
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
          'Drag a section to move it. Use the `...` menu on a section to remove it, and `Add item` to add one from the library. `Insert a saved section`, under the list, adds one you saved earlier.',
          'Publish.',
        ],
      },
      { kind: 'h', text: 'The home page has a few special sections' },
      {
        kind: 'bullets',
        items: [
          'The **Opening banner** is the welcome at the top, with the This Sunday card. Keep it first.',
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
      {
        kind: 'seealso',
        items: ['Change the service times or the address', 'Reuse a section on other pages'],
      },
    ],
  },

  {
    slug: 'church-facts',
    category: 'Housekeeping',
    title: 'Change the service times or the address',
    icon: 'clock',
    lead: 'Typed once, shown everywhere.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site settings', 'Church facts'],
        link: { doc: 'siteSettings' },
      },
      {
        kind: 'p',
        text: 'The service times and the address are typed in one place only. The top of the website, the This Sunday card, "Your first Sunday", This week, the menu, the footer, Google and the "Add to my calendar" link all read them from here, so a change here changes all of them.',
      },
      {
        kind: 'steps',
        items: [
          'Open `Site settings`, then the `Church facts` tab.',
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
    slug: 'contact-give-live',
    category: 'Housekeeping',
    title: 'Phone, email, giving and the live stream',
    icon: 'info',
    lead: 'Fill one box and the link appears everywhere it belongs.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Site Settings', 'Church facts'],
        link: { doc: 'siteSettings' },
      },
      {
        kind: 'bullets',
        items: [
          '**Phone and email** are typed under `Identity & contact`. They show in the menu, the footer and on Contact. Tick `Confirmed by the church` for each under `Church facts` once it is right; until then they carry a "To confirm" tag and are kept away from Google.',
          '**Online giving link**: paste the giving page address and every Give link goes straight there. Leave it empty and Give opens the site’s own page about giving on Sunday or by mail.',
          '**Live stream link**: where people watch on Sunday. It shows on Watch and in the footer, and the home page’s "Live now" card goes there during worship. Empty uses the Facebook link.',
          '**Facebook**: add it under `Social & footer`, `Social links`, platform Facebook.',
        ],
      },
      { kind: 'p', text: 'Publish, and the links appear on the next update of the site.' },
    ],
  },

  // ── The section library and the form builder (2026-10-18) ──────────────────
  {
    slug: 'section-library',
    category: 'Pages and words',
    title: 'Sections you can add to a page',
    icon: 'blocks',
    lead: 'What each section in the "+ Add" menu is for, in one line each.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Open any page, go to its sections and press `+ Add item`. The sections are sorted into groups, and the search box finds one by name. Sections marked **from Church facts** fill themselves from Site settings, so you never type a time or an address twice.',
      },
      {
        kind: 'bullets',
        items: [
          '**Service times**: every regular gathering with its day and time, from Church facts.',
          '**Map and directions**: the address on a drawn map with Google and Apple Maps buttons, from Church facts. Add a line about parking if it helps.',
          '**Contact details**: phone, email, address and office hours, from Church facts.',
          '**What we believe**: a heading and a few sentences per belief, with Bible references that link to the verses.',
          '**History timeline**: a year, what happened, and a photo if you have one.',
          '**Bible verse**: one verse set large, its reference linking to the passage.',
          '**Our wider Baptist family**: the SBC, the Ohio convention and others, each with its website.',
          '**Fold-out questions and answers**: questions a visitor taps to open, typed right on that page.',
          '**Tabs**: two to five labeled tabs, like Kids, Students and Adults.',
          '**Text in columns**: two or three columns of text side by side.',
          '**Row of buttons or link cards**: two to six links, as buttons or as cards with a line of text.',
          '**One wide photo with a caption**: a single photo across the page. For two side by side, use the photo gallery set to two across.',
          '**Notice with dates**: a short notice that shows only between two dates.',
          '**Countdown to a date**: days left until an event, then a "happening now" line, then a thank-you.',
          '**Upcoming events**: the next events from the Church Trac calendar, with "Add to your calendar" buttons.',
          '**Add our calendar to your phone**: just the calendar buttons.',
          '**Ways to give**: on Sunday, by mail and online, from Church facts.',
          '**Progress toward a goal**: a bar that fills toward a building fund or offering goal.',
          '**Live stream**: a "Watch live" button that says "Live now" during Sunday worship.',
          '**Newsletter sign-up**: the email sign-up box, or a button to your sign-up page.',
          '**Form**: one of your forms, like prayer requests or a sign-up sheet.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Empty sections hide themselves.',
        text: 'A section with nothing to show (no events on the calendar, a notice outside its dates) simply does not appear, so a page never shows an empty box.',
      },
      { kind: 'seealso', items: ['Make a new form', 'Put up a notice for a snow Sunday'] },
    ],
  },
  {
    slug: 'make-a-form',
    category: 'Pages and words',
    title: 'Make a new form',
    icon: 'add',
    lead: 'Write the questions once, then put the form on any page.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Forms'] },
      {
        kind: 'steps',
        items: [
          'Open `Content`, then `Forms`, and press the pencil to start a new one.',
          'Give it a `Form name`, like "VBS sign-up". This is the heading above the form.',
          'Pick `What kind of form is it?`. Choose prayer requests only for prayer requests.',
          'Under `Who receives it`, pick the person whose email the answers go to.',
          'Add your `Questions`. For each one pick the kind of answer: a short line, a paragraph, a choice from a list, a tick box, an email or a phone number. Turn on `Must be answered?` only where you really need the answer.',
          'Publish the form.',
          'Open the page it belongs on, press `+ Add item`, choose `Form`, pick your form, and publish the page.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Answers are never kept in this editor.',
        text: 'What people send is emailed to the person you picked. It never comes back into the Studio, so there is nothing personal here to protect or lose.',
      },
      {
        kind: 'p',
        text: 'Need a new person on the "Who receives it" list? Ask your developer: they connect the email address on the server, because addresses are not kept in the Studio. Until then, forms for that name go to the church office.',
      },
      { kind: 'seealso', items: ['Prayer requests: what happens to them'] },
    ],
  },
  {
    slug: 'prayer-requests',
    category: 'Pages and words',
    title: 'Prayer requests: what happens to them',
    icon: 'info',
    lead: 'Where a prayer request goes, who sees it, and what the website keeps.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          'A prayer request is **emailed to the person the form names**, and to nobody else.',
          'It is **never saved in the Studio** and never shown on the website.',
          'The website keeps a copy only until the email has gone. Once it is delivered, the words are wiped from the website’s own records.',
          'If you tick `Let people send it without their name`, people can send a request with no name or email at all. You will not be able to reply to those.',
        ],
      },
      {
        kind: 'callout',
        tone: 'critical',
        title: 'Never paste a request into a page.',
        text: 'Everything in the Studio is public once published. Share prayer needs by email or in person, the way the person asked.',
      },
      {
        kind: 'p',
        text: 'Until email is connected for the website, the form shows a note asking people to email or call the church instead, so nobody types a request that cannot be sent.',
      },
      { kind: 'seealso', items: ['Make a new form'] },
    ],
  },
  {
    slug: 'snow-sunday',
    category: 'Pages and words',
    title: 'Put up a notice for a snow Sunday',
    icon: 'clock',
    lead: 'A notice that appears on the day you choose and takes itself down.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Open the home page (or any page) and press `+ Add item`, then `Notice with dates`.',
          'Type the `Message`, like "No services this Sunday because of the snow. Stay safe."',
          'For weather or a cancellation, pick `Urgent` under `How important is it?`.',
          'Set `Show from` and `Show until`. Both days are included. Leave `Show from` empty to show it straight away.',
          'Drag the notice to the top of the page, then publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Give it a couple of minutes.',
        text: 'The site updates a few minutes after you publish, and again every morning at about 6 am. A notice past its last day is hidden that morning, and people’s browsers hide it at midnight anyway, so you can leave it in place for next winter.',
      },
    ],
  },
  {
    slug: 'vbs-countdown',
    category: 'Pages and words',
    title: 'Count down to VBS',
    icon: 'activity',
    lead: 'Days to go, then "happening now", then a thank-you, all on its own.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'On the page you want, press `+ Add item`, then `Countdown to a date`.',
          'Type what you are counting down to, like "Vacation Bible School".',
          'Pick the `First day`, and the `Last day` if it runs all week.',
          'Change the "during" and "afterward" lines if you like. Empty the "afterward" line to hide the countdown once VBS is over.',
          'Add a `Button` to the sign-up form if you have one, then publish.',
        ],
      },
      {
        kind: 'p',
        text: 'The number of days updates by itself every day. Nothing needs changing until next year, when you only pick new dates.',
      },
      { kind: 'seealso', items: ['Make a new form'] },
    ],
  },

  {
    slug: 'seo-fields',
    category: 'Housekeeping',
    title: 'What the Google and sharing boxes do',
    icon: 'search',
    lead: 'The title and description Google shows.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Each page has a `Google and sharing` tab with a **Google title** and **Google description**. They are not shown on the page itself. They are what appears in a search result and in the little card when somebody shares the link.',
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
    icon: 'check',
    lead: 'Worth ten minutes once or twice a year.',
    diy: 'self',
    body: [
      {
        kind: 'bullets',
        items: [
          'Look for **unpublished drafts**: somebody started an edit and did not finish, and nothing is live until it is published.',
          'Read the pages you have not touched in a year. Names, times and events go stale quietly.',
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

// ── Studio kit helpers (PORTS.md card 110) ───────────────────────────────────
// Appended rather than written into the list above, so a site rewriting its
// guides keeps these two by default. Both describe kit features, not the site.
guides.push(
  {
    slug: 'studio-home',
    category: 'Start here',
    title: 'What Home in the Studio shows you',
    icon: '⌂',
    lead: 'Home opens first every time. Here is what each card is for, top to bottom.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Home is a dashboard: it changes nothing by itself. Every card points somewhere, and the buttons take you straight there.',
      },
      {
        kind: 'bullets',
        items: [
          '**Coming up**: pages set to publish by themselves, soonest first, with the time in plain words. To schedule one, open it, fill in **Publish automatically at** under Publishing, and leave it as a draft. `Open` takes you to it.',
          '**Fix-it list**: the things the Checkup found, by name, like a picture with no description or a page with no Google description. `Edit` opens the page at the right spot. `See the whole list` opens the Checkup.',
          '**Visitors**: how many people visited in the last 7 days against the week before, a small chart of the last four weeks, the most-read pages and how people found the website. Hover a bar to see that day.',
          '**Your pages**: every page you can change, in groups, one click each. Pages you build yourself are added to it automatically.',
          '**Watch how it is done**: short videos of common jobs, when there are any. `Watch` plays one without leaving the Studio.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Visitors says "not set up yet"?',
        text:
          'The numbers come from Cloudflare, which counts visits without cookies. ' +
          SITE.contactName +
          ' switches it on once, and after that it fills in by itself.',
      },
      { kind: 'seealso', items: ['The line under the top bar', 'Start here: how this all works'] },
    ],
  },
  {
    slug: 'website-status',
    category: 'Start here',
    title: 'The line under the top bar',
    icon: 'activity',
    lead: 'A quiet answer to "is my change on the website yet?", wherever you are in the Studio.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Under the top bar there is a thin line that says how the website is doing. It reads the same thing as the **Is it live?** card on Home, so the two always agree.',
      },
      {
        kind: 'bullets',
        items: [
          '**Website up to date**: everything you have published is on the website.',
          '**Updating the website, about 3 minutes**: you published something and the website is rebuilding. The minutes count down. You do not need to wait for it.',
          '**The website update is taking longer than usual**: it has been a while. Nothing is lost, your change is safe and published. Click `Details`, and if it still says this an hour later, ask ' +
            SITE.contactName +
            '.',
          "**The last update didn't go through**, in red: the website tried to update and something stopped it, so it is still showing the older version. " +
            SITE.contactName +
            ' gets an email about it straight away. Your published changes are safe. Press `Try again` once; if it comes back red, leave it with ' +
            SITE.contactName +
            '.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'No line at all?',
        text:
          'The line only appears once the website has said when it was last built. On a brand new site, or while ' +
          SITE.contactName +
          ' is working on it, it can be missing. That is fine.',
      },
      { kind: 'seealso', items: ['Start here: how this all works'] },
    ],
  },
  {
    slug: 'help-panel',
    category: 'Start here',
    title: 'Help for this page',
    icon: 'bulb',
    lead: 'Help beside whatever you are editing, without leaving it.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'When something is open for editing, click `Help for this page` at the top of it (it can also sit in the menu with three dots). A panel opens beside the boxes you are typing in.',
      },
      {
        kind: 'bullets',
        items: [
          '**Worth a look** lists photos with no description, empty sections and links that go nowhere, and anything the Checkup found on this page. It updates as you type. None of it stops you publishing.',
          '**How to** shows the Site Guide steps for this kind of page, so you can follow them while you work.',
        ],
      },
      {
        kind: 'p',
        text: 'Close it with the cross at the top of the panel. It never changes anything on the page.',
      },
      { kind: 'seealso', items: ['Change the words on a page'] },
    ],
  },
  // The Studio remembers (card 111, 2026-10-18): undo from a backup, scheduling, the phone
  // tool and the weekly checklist.
  {
    slug: 'undo-earlier',
    category: 'Start here',
    title: 'Undo a change from earlier in the week',
    icon: 'restore',
    lead: 'Put a page back the way it was on a day you remember.',
    diy: 'ask',
    body: [
      {
        kind: 'p',
        text: 'For something you changed in the last few minutes, use Undo at the top of the page, or `Discard changes` if you have not published yet.',
      },
      {
        kind: 'p',
        text:
          "For anything older, this one is not yours to do, and that is not your fault: the church's Sanity plan keeps only three days of history, and only an administrator can open it. But the website is copied every night, and " +
          SITE.contactName +
          ' can take one page out of a copy and put it back for you.',
      },
      {
        kind: 'steps',
        items: [
          'Tell ' +
            SITE.contactName +
            ' which page or item it is (its name as you see it in the Studio, like "Easter" or "Notices: Snow closing"), and roughly which day it was still right.',
          'He puts that copy back as an unpublished change. Nothing on the website moves yet.',
          'Open it, check it reads the way you remember, and press `Publish`. If it is not what you wanted, press `Discard changes` and nothing has happened.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Ask within two weeks.',
        text: 'The nightly copies are kept for fourteen days, so the sooner you ask, the more there is to choose from.',
      },
      { kind: 'seealso', items: ['Start here: how this all works'] },
    ],
  },
  {
    slug: 'schedule-publish',
    category: 'Start here',
    title: 'Publish something later, by itself',
    icon: 'clock',
    lead: 'Get a notice, a post or a page ready now and let it go up on the day.',
    diy: 'self',
    body: [
      {
        kind: 'steps',
        items: [
          'Write it as usual, but do not press Publish.',
          'Find `Publish automatically at`. On a page or a sermon it is under the `Publishing` tab at the top; on a notice, a post or a download it is the last box.',
          'Pick the date and the time, in your own time.',
          'Leave it. Within half an hour of that time it publishes itself, and the website updates a few minutes later.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Changed your mind?',
        text: 'Clear the box before the time comes and it stays a draft. Pressing Publish yourself also works; the time is then simply ignored.',
      },
      { kind: 'seealso', items: ['The line under the top bar'] },
    ],
  },
  {
    slug: 'quick-update',
    category: 'Start here',
    title: 'Quick update from your phone',
    icon: 'bolt',
    lead: 'Three jobs made small enough for a phone.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Open the Studio on your phone, tap the menu at the top and choose `Quick update` (on Home it is also a button). Pick one:',
      },
      {
        kind: 'bullets',
        items: [
          '**Put up a notice**: a short line across the top of every page, until the last day you pick.',
          "**Add Sunday's sermon link**: the title and the YouTube or Facebook link. The date fills itself in as last Sunday.",
          '**Cancel or change something this week**: a notice in red that comes down by itself after Sunday.',
        ],
      },
      {
        kind: 'p',
        text: 'Fill in the boxes and press the green button. It is published straight away and the website updates in a few minutes. To add more later (a summary, the audio), open it from `Content` as usual.',
      },
      { kind: 'seealso', items: ['The Sunday checklist'] },
    ],
  },
  {
    slug: 'sunday-checklist',
    category: 'Start here',
    title: 'The Sunday checklist',
    icon: 'check',
    lead: 'The weekly jobs on Home, and how they get ticked.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Home has a card called **Sunday checklist** with the jobs that keep the website current each week. Most of them tick themselves when the website can see they are done:',
      },
      {
        kind: 'bullets',
        items: [
          "**Sunday's sermon**: a sermon dated last Sunday is in the list.",
          "**This week's bulletin**: a bulletin dated this week is under Downloads.",
          '**Notices that have ended**: none is still switched on past its last day.',
          '**Checkup is clear**: nothing in the Checkup says "Needs doing".',
        ],
      },
      {
        kind: 'p',
        text: 'The website cannot see inside Church Trac, so **checking the events** has a box you tick yourself. Ticks start fresh every Monday.',
      },
      { kind: 'seealso', items: ['Quick update from your phone'] },
    ],
  },
);

// The sermon, people and downloads guides (FBC Auburn, 2026-10-18).
guides.push(...collectionGuides);

// ── Workflow tools (PORTS.md card 117) ───────────────────────────────────────
// Appended like the kit helpers above, so a site rewriting its guides keeps them.
guides.push(
  {
    slug: 'share-a-preview',
    category: 'Pages and words',
    title: 'Show someone a page before it goes live',
    icon: '↗',
    lead: 'A private link to your draft that works for a few days, no login needed.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Sometimes you want a second pair of eyes on a page before you publish it. **Share a preview** makes a private link that shows your unpublished changes to that one page. The person opening it does not need a Studio login.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page you are working on.',
          'Open the menu next to `Publish` and choose `Share a preview`.',
          'Pick how long the link should work: 1, 3, 7 or 14 days.',
          'Click `Make the link`, then `Copy`, and paste it into an email or a message.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'The link is shown once.',
        text: 'Copy it straight away. If you lose it, make a new one; the old one keeps working until its date unless you stop it.',
      },
      { kind: 'h', text: 'Stop a link early' },
      {
        kind: 'p',
        text: 'Open `Share a preview` on the same page. Under **Links for this page that still work**, click `Stop this link`. Anyone who opens it after that sees the published page instead.',
      },
      { kind: 'seealso', items: ['Change the words on a page'] },
    ],
  },
  {
    slug: 'messages',
    category: 'Housekeeping',
    title: 'Read messages from the website',
    icon: '@',
    lead: 'Everything people send through the forms, in one list.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Click `Messages` in the top bar. Every form on the website lands here as well as in email, newest first. Click a name to read the message.',
      },
      {
        kind: 'bullets',
        items: [
          '**New**: nobody has dealt with it yet.',
          '**Needs a person**: someone has to answer it. A message whose email did not go out starts here, because nobody has seen it anywhere else.',
          '**Replied**: answered. Mark it so nobody answers twice.',
          '**Spam**: junk. Leave it there.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Prayer requests stay private.',
        text: 'A prayer request shows only that one arrived and when. Its words go to the email address set on the form and are not kept or shown here.',
      },
      {
        kind: 'p',
        text: 'If the page says **Forms are not set up yet**, the website forms have not been switched on. Ask for help.',
      },
    ],
  },
);

// ── Custom code (PORTS.md card 121) ──────────────────────────────────────────
// Appended like the blocks above, so a site rewriting its guides keeps it.
guides.push({
  slug: 'add-a-widget',
  category: 'Pages and words',
  title: 'Add a widget from an AI or a website',
  icon: '</>',
  lead: 'A countdown, a sign-up box, a map or a calculator, pasted in as code.',
  diy: 'mixed',
  body: [
    {
      kind: 'p',
      text: 'Sometimes you want something on a page that the Studio does not have a block for: a countdown to Vacation Bible School, a small sign-up gadget, a map, a calculator. You can ask an AI chat (ChatGPT, Claude, Gemini) to write it, or copy the code a website gives you, and paste it into a **Custom code or embed** section.',
    },
    { kind: 'h', text: 'What to ask the AI for' },
    {
      kind: 'p',
      text: 'Describe the widget, then add this sentence: _"Give me a single self-contained HTML snippet with inline CSS and JS, no external build step."_ That gets you one block of code you can paste in one go, instead of several files.',
    },
    { kind: 'h', text: 'Put it on the page' },
    {
      kind: 'steps',
      items: [
        'Open the page and click `+ Add item` where you want the widget.',
        'Pick `Custom code or embed`.',
        'Give it a headline if you like, then paste the whole snippet into `Custom code`. The count under the box tells you it all went in.',
        'Open `Presentation` and look at the page. The widget runs in the preview exactly as it will on the website.',
        'If it looks right, click `Publish`.',
      ],
    },
    {
      kind: 'callout',
      tone: 'positive',
      title: 'It runs in its own box.',
      text: 'The code cannot change the rest of the website, and it cannot see anything private, such as your Studio login. The box grows to fit what is inside it. Links in it open in a new tab.',
    },
    {
      kind: 'callout',
      tone: 'primary',
      title: 'It cannot restyle the rest of the site.',
      text:
        'Colours and fonts inside the box start out matching the website, but the code only ever styles itself. To change how the whole website looks, ask ' +
        SITE.contactName +
        ': design changes go through the theme.',
    },
    { kind: 'h', text: 'If it does not work' },
    {
      kind: 'bullets',
      items: [
        'Ask the AI to fix it, and tell it the code runs **inside a sandboxed iframe with no access to cookies, localStorage or the parent page**. Most widgets do not need any of those.',
        'A yellow warning under the box means the code tries to reach outside it. In the box that is blocked, so that part will not work.',
        'A widget cannot remember things between visits (it has no storage). For sign-ups, ask for a version that sends to a form service, or use one of the site forms.',
      ],
    },
    { kind: 'h', text: 'The "Runs directly on the page" switch' },
    {
      kind: 'callout',
      tone: 'caution',
      title: 'Leave it off unless a provider you trust needs it.',
      text: 'Some giving or booking services give you code that only works on the page itself. The switch lets it. With it on, the code can do anything the website can, including reading what a signed-in editor is doing, so never turn it on for code you are not sure about. The Checkup lists every page where it is on.',
    },
    { kind: 'seealso', items: ['Change the words on a page'] },
  ],
});

// ── The Studio app and earlier versions (PORTS.md card 125) ──────────────────
// Shared by every site (src/sanity/guides/phoneGuides.ts, PORTABLE): keep this
// line when rewriting the guides above.
guides.push(...phoneGuides(SITE.contactName));

/**
 * Which guides "Help for this page" shows for each document type (kit.config.ts
 * guide.forType, PORTS.md card 110). '*' is the fallback for anything unlisted.
 * A site that rewrites its guides rewrites this map with them.
 */
export const GUIDES_FOR_TYPE: Record<string, string[]> = {
  '*': ['edit-a-page', 'help-panel', 'undo-earlier'],
  announcement: ['schedule-publish', 'quick-update', 'undo-earlier'],
  journalEntry: ['schedule-publish', 'undo-earlier'],
  // FBC Auburn: the church's own guides first where they fit.
  page: [
    'edit-a-page',
    'share-a-preview',
    'section-library',
    'page-templates',
    'seasonal-patterns',
    'reuse-sections',
    'rename-a-page',
    'seo-fields',
    'add-a-widget',
  ],
  form: ['make-a-form', 'prayer-requests', 'messages'],
  homePage: ['home-page', 'add-sermon', 'images-and-alt', 'seo-fields'],
  siteSettings: [
    'church-facts',
    'contact-give-live',
    'menus-and-footer',
    'website-status',
    'add-a-widget',
  ],
  sectionPreset: ['seasonal-patterns', 'reuse-sections', 'synced-sections'],
  // The collections (guides/collections.ts, 2026-10-18).
  sermon: ['add-sermon', 'sermon-series', 'quick-update', 'schedule-publish'],
  sermonSeries: ['sermon-series', 'add-sermon'],
  sermonsPage: ['podcast', 'add-sermon'],
  person: ['add-person'],
  personGroup: ['add-person'],
  download: ['bulletin'],
  redirect: ['rename-a-page'],
};
