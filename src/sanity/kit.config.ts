// Safe to edit by hand
// =============================================================================
// The Studio kit's settings for First Baptist Church of Auburn
// =============================================================================
// The ONE site-specific file for the kit in src/sanity/kit/ (which names no
// site and can go back to the starter unchanged). Everything the editor reads
// in Home, the Checkup and the tour that is about THIS church lives here.
// Detail: docs/agent/studio-kit.md.
//
// The repo is public: no email addresses or other private contacts here. The
// help address comes from PUBLIC_STUDIO_HELP_EMAIL at build time (unset means
// the Ask card shows its words without an email button).
// =============================================================================

import type { KitConfig } from './kit/types';
import { genericRules, unconfirmedRule, plural, type CheckupRule } from '../lib/studio-checkup';
import { qualityRules } from '../lib/studio-checkup-quality';
import { exampleTextRule, llmsRules } from '../lib/studio-prepublish';
import { TOURS, WELCOME, WHATS_NEW } from './studio-tours';
import { guides, GUIDE_CATEGORIES, GUIDE_FOR_FIELD, GUIDES_FOR_TYPE } from './guides/content';
import { makeGuideView } from './components/GuideView';
import { envVal } from './urls';
import type { PageRules } from '../lib/page-guardrails';
import { brandIcon } from './brandIcons';
import { ClockIcon } from '@sanity/icons/Clock';
import { DownloadIcon } from '@sanity/icons/Download';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { ComposeIcon } from '@sanity/icons/Compose';
import { MicrophoneIcon } from '@sanity/icons/Microphone';
import { BellIcon } from '@sanity/icons/Bell';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { collectionRules } from './collectionCheckup';
import { comingSunday, lastSunday } from '../lib/studio-kit';
import {
  buildEventNotice,
  buildNewsletter,
  buildNotice,
  buildPost,
  buildSermon,
  PASTOR_QUERY,
} from '../lib/quick-updates';
import { churchToday } from '../lib/sermons';
import { runPageCheck } from './actions/checkPage';
import { PAGE_BUILDER_TYPES } from './pageBuilderConfig';
import { slugify } from '../lib/slugify';

const PUBLISHED = '!(_id in path("drafts.**"))';

/**
 * Page types with a Google description (seoDescription). Not journalEntry: a
 * post's excerpt is its description when the SEO box is empty.
 */
const SEO_TYPES = [
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'journalPage',
  'privacyPage',
  'page',
  'sermonsPage',
];

/** Site rule: a notice still switched on after its end date. */
const expiredNotices: CheckupRule = {
  id: 'expired-notices',
  run: ({ published, now }) => {
    const old = published.filter(
      (d) =>
        d._type === 'announcement' &&
        d.enabled === true &&
        typeof d.endDate === 'string' &&
        Date.parse(d.endDate) < now,
    );
    if (!old.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(old.length, 'notice')} past its end date and still switched on`,
      detail:
        'The website stops showing a notice after its end date, so nothing is wrong, but switching it off keeps the list tidy.',
      target: { pane: 'content;announcement' },
      targetLabel: 'Open the notices',
    };
  },
};

export const kitConfig: KitConfig = {
  siteName: 'the church website',

  helper: {
    name: 'Nathan',
    email: envVal('PUBLIC_STUDIO_HELP_EMAIL'),
  },

  // Sanity user ids of the people who get the staff view. The pastor is a
  // Sanity Administrator, so he is listed here rather than relying on his
  // role. Add his id once he has accepted the invitation (sanity.io/manage,
  // Members). Until the list has an entry, anyone who is not an administrator
  // gets the staff view.
  staff: [],

  staffTools: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'rsvps',
    'site-guide',
    'checkup',
  ],
  toolOrder: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'rsvps',
    'site-guide',
    'checkup',
    'media',
  ],
  toolTitles: { structure: 'Content', presentation: 'Live preview' },

  // Desk items only a developer needs (ids from src/sanity/structure.ts).
  // None yet: the guides send the editor to Redirects, Our church at a glance
  // is his, and Saved sections feed Live preview. Add an id here when a
  // list appears that only a developer should see.
  staffHiddenPanes: [],

  trashTypes: {
    // One name per thing, matching the desk (FBC Auburn, 2026-10-18).
    announcement: 'Notice',
    faqItem: 'Question',
    faqCategory: 'Question group',
    journalEntry: 'Post',
    journalCategory: 'Post category',
    sermon: 'Sermon',
    sermonSeries: 'Sermon series',
    person: 'Person',
    personGroup: 'People group',
    download: 'Download',
  },

  weekStartsOn: 1,
  // The Sunday checklist (card 111, 2026-10-18). Sermon, bulletin, news and notices tick
  // themselves from the content; "Checkup" ticks itself when nothing needs doing; the
  // Church Trac job is ticked by hand (the website cannot see inside Church Trac), on a
  // small document per week, so the list starts fresh every Monday.
  thisWeekTitle: 'Sunday checklist',
  thisWeek: [
    // The collections (2026-10-18). The week starts on Monday, so "this week" for Sunday's
    // sermon and bulletin reaches back to the Saturday before it.
    {
      id: 'sermon',
      title: "Add Sunday's sermon",
      detail: 'The title, the passage and the video link. The home page names it for a week.',
      query: `count(*[_type == "sermon" && ${PUBLISHED} && dateTime(date + "T00:00:00Z") >= dateTime($weekStart) - 60*60*24*2])`,
      target: { create: 'sermon' },
      targetLabel: 'Add the sermon',
    },
    {
      id: 'bulletin',
      title: "Put up this week's bulletin",
      detail: 'Upload the PDF under Downloads. It shows at /bulletin/ straight away.',
      query: `count(*[_type == "download" && category == "bulletin" && ${PUBLISHED} && dateTime(date + "T00:00:00Z") >= dateTime($weekStart) - 60*60*24*2])`,
      target: { create: 'download' },
      targetLabel: 'Upload the bulletin',
    },
    {
      id: 'news',
      title: "Post this week's news",
      detail:
        'A short post about Sunday, an event or a prayer need keeps the website looking cared for.',
      query: `count(*[_type == "journalEntry" && ${PUBLISHED} && publishedAt >= $weekStart])`,
      target: { create: 'journalEntry' },
      targetLabel: 'Write a post',
    },
    {
      id: 'notices',
      title: 'Take down notices that have ended',
      detail: 'Switch off any notice banner whose date has passed.',
      query: `count(*[_type == "announcement" && ${PUBLISHED} && enabled == true && defined(endDate) && endDate < $now]) == 0`,
      target: { pane: 'content;announcement' },
      targetLabel: 'Open the notices',
    },
    {
      id: 'church-trac',
      title: "Check this week's events in Church Trac",
      detail:
        'The calendar on the website comes from Church Trac. Tick this once the dates and times there are right.',
      manual: true,
    },
    {
      id: 'checkup',
      title: 'Checkup is clear',
      detail: 'Nothing in the Checkup marked "Needs doing".',
      check: 'checkup',
      target: { tool: 'checkup' },
      targetLabel: 'Open the Checkup',
    },
  ],

  // Quick update (card 111): the jobs the pastor does from his phone each week. Each form
  // publishes straight away, so the builders in src/lib/quick-updates.ts return whole,
  // valid documents (tested in quick-updates.test.ts).
  // "Post a photo" on Quick update (card 125): a photo from a phone into a
  // gallery on any page, or into a new News and notes post. Always a DRAFT; the
  // editor presses Publish.
  postPhoto: {
    galleryTypes: [...PAGE_BUILDER_TYPES],
    note: "Photos of children need a parent's permission first, and never add a child's name.",
    post: {
      label: 'A new News and notes post',
      type: 'journalEntry',
      build: ({ title, alt, caption, image, now }) => ({
        _type: 'journalEntry',
        title,
        slug: { _type: 'slug', current: slugify(title) },
        excerpt: (caption || alt).slice(0, 220),
        coverImage: image,
        publishedAt: now.toISOString(),
        body: [
          {
            _type: 'block',
            _key: 'photo-intro',
            style: 'normal',
            markDefs: [],
            children: [
              { _type: 'span', _key: 'photo-intro-text', text: caption || alt, marks: [] },
            ],
          },
        ],
      }),
    },
  },

  quickUpdate: [
    {
      id: 'notice',
      title: 'Put up a notice',
      detail: 'A short line across the top of every page, until the day you pick.',
      icon: BellIcon,
      meaning: 'notice',
      fields: [
        {
          name: 'message',
          title: 'The notice',
          kind: 'text',
          required: true,
          max: 160,
          description: 'One or two short sentences, like "Fall festival this Saturday at 4 pm."',
        },
        {
          name: 'lastDay',
          title: 'Last day to show it',
          kind: 'date',
          required: true,
          initial: (now) => comingSunday(now),
        },
        {
          name: 'link',
          title: 'A link for more',
          kind: 'url',
          description: 'A full web address starting with https://',
        },
      ],
      build: (v) =>
        buildNotice({ message: v.message, lastDay: v.lastDay, link: v.link || undefined }),
      doneMessage:
        'The notice will be on the website in a few minutes, and it takes itself down after the day you picked.',
    },
    {
      id: 'sermon',
      title: "Add Sunday's sermon link",
      detail: 'The title and the video link. The rest can wait.',
      icon: MicrophoneIcon,
      meaning: 'scripture',
      fields: [
        { name: 'title', title: 'Sermon title', kind: 'string', required: true, max: 120 },
        {
          name: 'videoUrl',
          title: 'Video link',
          kind: 'url',
          required: true,
          description: 'Copy the link from YouTube or Facebook.',
        },
        {
          name: 'date',
          title: 'Date preached',
          kind: 'date',
          required: true,
          initial: (now) => lastSunday(now),
        },
        {
          name: 'passage',
          title: 'Bible passage',
          kind: 'string',
          description: 'Like "John 3:1-21".',
        },
      ],
      build: async (v, { client }) => {
        const pastorId = await client.fetch<string | null>(PASTOR_QUERY).catch(() => null);
        return buildSermon(
          { title: v.title, date: v.date, videoUrl: v.videoUrl, passage: v.passage },
          pastorId,
        );
      },
      doneMessage:
        'The sermon will be on the website in a few minutes. Open it in the full editor to add a summary or the audio.',
    },
    {
      id: 'this-week',
      title: 'Cancel or change something this week',
      detail: 'A notice in red that takes itself down after Sunday.',
      icon: CalendarIcon,
      meaning: 'times',
      fields: [
        {
          name: 'message',
          title: 'What is changing',
          kind: 'text',
          required: true,
          max: 160,
          description: 'Like "No Wednesday Bible study this week. See you Sunday."',
        },
      ],
      build: (v, { now }) =>
        buildNotice({ message: v.message, lastDay: comingSunday(now) }, 'urgent'),
      doneMessage:
        'The notice will be on the website in a few minutes and comes down by itself after Sunday.',
    },
    // 2026-10-19 (Studio complete, docs/agent/studio-plan.md): the rest of the weekly jobs
    // that fit a phone. The bulletin needs a file box, which forms do not have yet, so it is
    // on Home's big buttons and the Sunday checklist instead.
    {
      id: 'event',
      title: 'Tell people about an event',
      detail: 'A notice with the day and time that comes down after the event.',
      icon: CalendarIcon,
      meaning: 'event',
      fields: [
        {
          name: 'name',
          title: 'What is happening',
          kind: 'string',
          required: true,
          max: 80,
          description: 'Like "Fall festival" or "Ladies Bible study".',
        },
        { name: 'date', title: 'The day', kind: 'date', required: true },
        {
          name: 'time',
          title: 'The time',
          kind: 'string',
          max: 30,
          description: 'Like "4 pm" or "9 to 11 am". Leave it empty for an all-day event.',
        },
        {
          name: 'link',
          title: 'A link for more',
          kind: 'url',
          description: 'The event in Church Trac, or the page with its RSVP. Starts with https://',
        },
      ],
      build: (v) =>
        buildEventNotice({ name: v.name, date: v.date, time: v.time, link: v.link || undefined }),
      doneMessage:
        'The notice will be on the website in a few minutes, and it takes itself down after the event. Put the event in Church Trac too, so it is on the calendar.',
    },
    {
      id: 'post',
      title: 'Write a short news post',
      detail: 'A few lines for News and notes: a thank-you, a report, good news.',
      icon: ComposeIcon,
      meaning: 'post',
      fields: [
        { name: 'title', title: 'Headline', kind: 'string', required: true, max: 100 },
        {
          name: 'text',
          title: 'The post',
          kind: 'text',
          required: true,
          max: 2000,
          description:
            'Leave an empty line between paragraphs. Only share a prayer need here if the person asked for it to be public.',
        },
      ],
      build: (v, { now }) => buildPost({ title: v.title, text: v.text }, now),
      doneMessage:
        'The post will be on the website in a few minutes. Open it in the full editor to add a photo.',
    },
    {
      id: 'newsletter',
      title: "Start this week's newsletter",
      detail: 'The subject and a few opening words. The sermon and events fill themselves in.',
      icon: EnvelopeIcon,
      meaning: 'message',
      fields: [
        {
          name: 'subject',
          title: 'Subject line',
          kind: 'string',
          required: true,
          max: 120,
          description: 'What people see in their inbox, like "This week at Auburn: fall festival".',
        },
        {
          name: 'intro',
          title: 'Opening words',
          kind: 'text',
          max: 1200,
          description: 'A few friendly lines. You can change them before you send it.',
        },
      ],
      submitLabel: 'Save the issue',
      build: (v, { now }) =>
        buildNewsletter({ subject: v.subject, intro: v.intro }, churchToday(now)),
      doneMessage:
        'Saved, and not sent yet. Open it in the full editor, press "Send a test to me", read it, then send it to everyone.',
    },
    // Card 137 jobs (2026-10-19, Auburn's Phase A plan).
    // The bulletin is a new Download each week, so it is a create job with a file box
    // (an upload job needs one existing document to put the file into). The kind is fixed
    // to Bulletin and the date starts as the coming Sunday; the pastor still presses
    // nothing else: it publishes, and /bulletin/ shows the newest.
    {
      id: 'bulletin',
      title: "Put up this week's bulletin",
      detail: 'Pick the PDF and the Sunday it is for. It shows at /bulletin/.',
      icon: DownloadIcon,
      meaning: 'download',
      job: { kind: 'create', type: 'download', defaults: { category: 'bulletin' } },
      fields: [
        {
          name: 'title',
          title: 'Title',
          kind: 'string',
          required: true,
          max: 120,
          description: 'Like "Bulletin for October 25".',
        },
        {
          name: 'date',
          title: 'The Sunday it is for',
          kind: 'date',
          required: true,
          initial: (now) => comingSunday(now),
        },
        {
          name: 'file',
          title: 'The PDF',
          kind: 'file',
          required: true,
          accept: 'application/pdf',
          description:
            'Anything uploaded is public, so leave out private phone numbers and prayer requests.',
        },
      ],
      submitLabel: 'Put it up',
      doneTitle: 'The bulletin is up',
      doneMessage:
        'It will be at /bulletin/ in a few minutes. The address always opens the newest one.',
    },
    // Link tiles: they open their own screens and keep those screens' safeguards.
    {
      id: 'messages',
      title: 'Messages',
      detail: 'What people sent through the website forms.',
      icon: EnvelopeIcon,
      meaning: 'message',
      job: { kind: 'link', target: { tool: 'messages' } },
    },
    {
      id: 'rsvps',
      title: 'RSVPs',
      detail: 'Who has said they are coming to an event.',
      icon: CalendarIcon,
      meaning: 'event',
      job: { kind: 'link', target: { tool: 'rsvps' } },
    },
    // Opens the Newsletter list, newest issue first. Sending stays on the issue itself, test first.
    {
      id: 'send-newsletter',
      title: 'Send the newsletter',
      detail: "Open this week's issue. Send yourself a test before it goes to everyone.",
      icon: EnvelopeIcon,
      meaning: 'message',
      job: { kind: 'link', target: { pane: 'content;newsletter' } },
    },
  ],

  checkup: {
    rules: [
      ...genericRules({
        seoTypes: SEO_TYPES,
        // podcastArtwork: Apple never reads a description. People's photos and sermon
        // pictures now need one (alt text everywhere, 2026-10-18), so the Checkup asks.
        altExemptFields: ['logo', 'favicon', 'icon', 'logoImage', 'seoImage', 'podcastArtwork'],
      }),
      // Seeded copy marks unconfirmed facts "to be confirmed" (service times,
      // the founding year, the verse), so the pastor can see what is left.
      unconfirmedRule(),
      // Card 123: words still starting "Example:" from a page template, and the
      // files for AI assistants (/llms.txt, /llms-full.txt) being stale.
      exampleTextRule(),
      ...llmsRules({ pageTypes: ['page'] }),
      expiredNotices,
      // Sermons with nothing to watch or hear, people without a photo (2026-10-18).
      ...collectionRules,
      // Links, headings, long Google text, pages nobody can reach, private
      // pages (PORTS.md card 122). fixedPaths are this site's built routes;
      // routes maps each slugged type to its address.
      ...qualityRules({
        seoTypes: SEO_TYPES,
        fixedPaths: [
          '/',
          '/about/', // scaffold: about
          '/journal/', // scaffold: journal
          '/contact/',
          '/privacy/',
          '/give/',
          '/bulletin/',
          '/sermons/',
          '/sermons/podcast.xml',
          '/sunday.ics',
        ],
        routes: {
          page: (slug) => `/${slug}/`,
          privatePage: (slug) => `/private/${slug}/`,
          journalEntry: (slug) => `/journal/${slug}/`, // scaffold: journal
          sermon: (slug) => `/sermons/${slug}/`,
          sermonSeries: (slug) => `/sermons/series/${slug}/`,
        },
      }),
    ],
    ignoreTypes: ['sectionPreset', 'studioGuide', 'redirect'],
  },

  guide: {
    guides,
    categories: GUIDE_CATEGORIES,
    view: makeGuideView,
    // "Help for this page" (card 110): which guides each document type shows.
    forType: GUIDES_FOR_TYPE,
    // The quiet "How to" chip after a field's description (card 134): which
    // guide section explains which field, by name or schema type.
    forField: GUIDE_FOR_FIELD,
  },

  // Home's "Your pages" card (card 115): every page the pastor can change, in
  // the menu's own words, one click each. The five built pages are custom pages
  // (type 'page', ids from the seed); "Other pages you built" lists any new
  // custom page by name without touching this file. Give has no document of its
  // own (src/pages/give.astro builds it from Church facts), so it opens the
  // online giving link. Desk ids are load-bearing (structure.ts).
  pages: [
    {
      title: 'Main pages',
      links: [
        { title: 'Home', target: { doc: 'homePage' } },
        { title: 'About', target: { doc: 'aboutPage' } },
        { title: 'Plan your visit', target: { doc: 'page-plan-your-visit', type: 'page' } },
        { title: 'What we believe', target: { doc: 'page-what-we-believe', type: 'page' } },
        { title: 'Ministries', target: { doc: 'page-ministries', type: 'page' } },
        { title: 'Leadership', target: { doc: 'page-leadership', type: 'page' } },
        { title: 'Watch', target: { doc: 'page-watch', type: 'page' } },
        {
          title: 'Give',
          detail: 'The online giving link',
          target: { doc: 'siteSettings', field: 'givingUrl' },
        },
        { title: 'Contact', target: { doc: 'contactPage' } },
        { title: 'Questions', target: { doc: 'faqPage' } },
        { title: 'Privacy policy', target: { doc: 'privacyPage' } },
      ],
    },
    { title: 'Other pages you built', listType: 'page' },
    // Password pages (card 122), listed by name like the pages above.
    { title: 'Private pages', listType: 'privatePage' },
    {
      title: 'Sermons, people and more',
      links: [
        { title: 'Sermons', target: { pane: 'sermons;sermon' } },
        { title: 'Sermon series', target: { pane: 'sermons;sermonSeries' } },
        { title: 'People', target: { pane: 'people;person' } },
        { title: 'Downloads and bulletins', target: { pane: 'downloads;download' } },
        { title: 'News and notes', target: { pane: 'journal;journalEntry' } },
        { title: 'Notices', target: { pane: 'content;announcement' } },
        { title: 'Questions and answers', target: { pane: 'content;faqItem' } },
      ],
    },
    {
      title: 'Site-wide',
      links: [
        {
          title: 'Church facts',
          detail: 'Service times, address, phone',
          target: { doc: 'siteSettings', field: 'churchAddress' },
        },
        { title: 'Menus', target: { doc: 'siteSettings', field: 'navItems' } },
        { title: 'Footer', target: { doc: 'siteSettings', field: 'footerColumns' } },
        { title: 'Site settings', target: { doc: 'siteSettings' } },
      ],
    },
  ],

  // Home's banner (card 118, 2026-10-18): the navy welcome at the top of Home, dressed in the
  // church's own brand. The full-colour mark on a light disc (it carries the story colours the
  // white mark loses), the stone path from the water to the red cross along the foot
  // (npm run gen:stones writes it), the editor's name in gold, and "Auburn" in Auburn Stone with
  // on-navy letter colours (white, water, gold).
  homeBanner: {
    mark: '/studio-banner/mark.svg',
    motif: '/studio-banner/stone-path.svg',
    motifNarrow: '/studio-banner/stone-path-phone.svg',
    accent: '#B5503A',
    lettering: {
      text: 'Auburn',
      family: 'Auburn Stone',
      src: '/fonts/auburn-stone.woff2',
      colors: ['#FFFFFF', '#7F98B8', '#D98A74'],
    },
  },

  // Home's big buttons (card 110): the pastor's most common jobs, as intent
  // links. Keep it to four. FBC Auburn (2026-10-19): Sunday's sermon, the
  // service times, a new page and the bulletin.
  quickActions: [
    // 2026-10-18: a sermon in the archive replaced "Name last Sunday's message" (the Watch
    // section's hand-typed entry, which still works). The date fills in as the Sunday just gone
    // and the preacher as the pastor (sermons.ts initialValue).
    {
      title: "Add Sunday's sermon",
      detail:
        'The title, the passage and the video link. The date and preacher fill themselves in.',
      target: { create: 'sermon' },
      icon: MicrophoneIcon,
    },
    {
      title: 'Change the service times',
      detail: 'Church facts. Every page that shows a time reads it from here.',
      target: { doc: 'siteSettings', field: 'serviceTimes' },
      icon: ClockIcon,
    },
    {
      title: 'Add a page',
      detail:
        'Press + and pick from about 40 ready-made pages: Plan a visit, Kids, VBS, Easter and more.',
      target: { pane: 'pages;page' },
      // A pane target has no document type to take art from, so name the brick art outright.
      icon: brandIcon('pages'),
    },
    // 2026-10-19: the bulletin replaced "Edit the menus" (a monthly job at most; the menus
    // are still one click away in "Your pages", Site-wide). The same job is also a Quick
    // update tile (id 'bulletin', a create job with a file box); this button opens the full
    // editor instead, with the new download started as a bulletin dated today.
    {
      title: "Put up this week's bulletin",
      detail: 'Upload the PDF. It shows at /bulletin/ a few minutes after you publish.',
      target: { create: 'download' },
      icon: DownloadIcon,
    },
  ],

  // The page check inside "Help for this page" (card 110): the same three
  // checks as the "Check this page..." action, on the page-builder types.
  pageCheck: { types: [...PAGE_BUILDER_TYPES], run: (doc, client) => runPageCheck(client, doc) },

  // Card 137: the spotlight tours, the welcome and What's new live in
  // studio-tours.ts (plain data, unit-tested; Auburn's own tours, mapped from the
  // Phase A plan on 2026-10-19). tourSteps stays as the fallback.
  tours: TOURS,
  welcome: WELCOME,
  whatsNew: WHATS_NEW,

  tourSteps: [
    {
      title: 'This is Home',
      short: 'Home',
      meaning: 'home',
      body: 'Home opens first every time. It shows what to do this week, whether your last change is on the website yet, and anything that needs fixing.',
    },
    {
      title: 'Content is where you edit',
      short: 'Content',
      meaning: 'pages',
      body: 'Click Content in the top bar to change the words and pictures on any page, add a news post or put up a notice.',
    },
    {
      title: 'Live preview shows the real page',
      short: 'Preview',
      meaning: 'preview',
      body: 'Live preview shows the website as visitors will see it, with your unpublished changes in place. Click any words on it to edit them right there.',
    },
    {
      title: 'Nothing is public until you press Publish',
      short: 'Publish',
      meaning: 'publishing',
      body: 'Your changes are private until you press the green Publish button. After that the website updates itself in a few minutes. Changed your mind? Use Undo, or move a thing to the Trash and bring it back later.',
    },
    {
      title: 'Help is always one click away',
      short: 'Help',
      meaning: 'guide',
      body: 'Site Guide in the top bar has step-by-step help for every job, and you can print any of it. Stuck? Home has a card for asking Nathan.',
    },
  ],

  liveSlowAfterMinutes: 15,

  features: {
    home: true,
    guide: true,
    checkup: true,
    tour: true,
    trash: true,
    publishNote: true,
    // Card 115: Cloudflare Web Analytics through /api/studio/visitors/ (it
    // replaced the 2026-10-17 GA4 plan: cookieless, free, no service account).
    // The route says "not set up yet" until the Worker has CF_ANALYTICS_TOKEN,
    // CF_ACCOUNT_ID and CF_WEB_ANALYTICS_SITE_TAG (OPERATIONS.md, "Visitor numbers").
    visitors: true,
    // The email backbone (card 127): the Newsletter card and RSVP counts. Each
    // says "not set up yet" until the Worker has the settings (OPERATIONS.md, "Email").
    mail: true,
    // Card 110: the status line under the top bar, and the help panel.
    navbarStatus: true,
    helpPanel: true,
    // Card 123: "Before you publish", the Checkup for the open document.
    publishPanel: true,
  },
};

/**
 * The site's own page-builder rules (the authoring kit, PORTS.md card 109).
 * Each one shows as a yellow WARNING beside a page's sections, never an error,
 * so nothing here can stop Publish or break content that is already live. The
 * built-in warnings (empty sections, leftover template example text, a synced
 * section with nothing picked) apply everywhere whatever this says. Logic and
 * tests: src/lib/page-guardrails.ts.
 *
 * The starter's defaults suit a custom page: open with a hero, one hero only,
 * and a nudge past twenty sections. A fork tunes these, or empties them.
 */
export const pageRules: PageRules = {
  // Document types the rules below apply to ('page' is a Custom page). The
  // built-in pages often open with something else on purpose, so they are off.
  appliesTo: ['page'],
  mustStartWith: ['heroSection'],
  atMostOnce: ['heroSection'],
  maxSections: 20,
};
