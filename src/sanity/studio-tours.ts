// Safe to edit by hand
// =============================================================================
// This site's Studio tours, welcome and "What's new" (PORTS.md card 137)
// =============================================================================
// Plain data, kept out of kit.config.ts so src/lib/studio-tour.test.ts can read
// it in bare Node and catch a typo (a welcome naming a tour that is not there,
// an em-dash, a date that is not a date). kit.config.ts passes these on as
// `tours`, `welcome` and `whatsNew`.
//
// The words were written in Phase A (src/sanity/guides/tours.ts) and mapped onto
// this shape on 2026-10-19. The Phase A stops marked "needsHook" now use the
// kit's own hooks: home-this-week (the Sunday checklist), home-quick-actions
// (the bulletin button is one of Home's four big buttons), quick:sermon and
// quick-submit (Quick update), newsletter-send-everyone.
//
// Each stop's `anchor` is what gets the spotlight:
//   - a kit hook: 'home-banner', 'home-quick-actions', 'home-this-week',
//     'home-is-it-live', 'home-fix-it', 'home-coming-up', 'home-recent',
//     'home-pick-up', 'home-ask', 'home-visitors', 'home-pages', 'home-videos',
//     'home-help', 'quick-list', 'quick-submit', 'guide-index', 'guide-videos',
//     'navbar-status', 'newsletter-send-everyone';
//   - a Quick update tile: 'quick:<form id>' ('quick:post-photo');
//   - a field of the open document: 'field:<path>';
//   - Sanity's own UI: 'tool:<tool name>', 'tools', 'search', 'publish',
//     'document-actions', 'document-menu', 'document-form', 'pane:list',
//     'pane:document', 'new-document' (src/lib/studio-tour.ts SANITY_ANCHORS);
//   - anything else: 'css:<selector>'.
// No anchor (or one not on screen): the popover sits in the middle.
// `goTo` opens a tool or a document first ({ tool: 'quick-update' }).
// Full shapes: docs/agent/studio-kit.md, "Spotlight tours".
//
// Sample data only: never a real person's name, phone number or prayer need.
// =============================================================================

import type { TourDef, WelcomeConfig, WhatsNewEntry } from '../lib/studio-tour.ts';

export const TOURS: TourDef[] = [
  // The pastor's first visit (the full Studio).
  {
    id: 'welcome',
    title: 'A quick tour',
    role: 'editor',
    firstRun: true,
    steps: [
      {
        anchor: 'tool:home',
        title: 'Home opens first',
        short: 'Home',
        meaning: 'home',
        body: 'Each time you sign in, Home shows what to do this week and whether your last change is on the website yet.',
      },
      {
        anchor: 'home-this-week',
        title: 'Your Sunday checklist',
        short: 'Checklist',
        meaning: 'step',
        body: 'The weekly jobs, ticking themselves as you do them: the sermon, the bulletin, a news post, old notices and the Checkup. It starts fresh every Monday.',
      },
      {
        anchor: 'tool:quick-update',
        title: 'Quick update, for your phone',
        short: 'Quick update',
        meaning: 'quickUpdate',
        body: "Sunday's sermon, a notice, an event, a news post, a photo or the newsletter, each in a few taps. It goes on the website straight away.",
      },
      {
        anchor: 'home-quick-actions',
        title: "This week's bulletin",
        short: 'Bulletin',
        meaning: 'download',
        body: 'The bulletin has its own button here, because it needs a file. Upload the PDF and publish.',
      },
      {
        anchor: 'tool:structure',
        title: 'Content is everything else',
        short: 'Content',
        meaning: 'content',
        body: 'Every page, sermon, notice and setting, ready to edit. Nothing you change is public until you press Publish.',
      },
      {
        anchor: 'tool:site-guide',
        title: 'Help for every job',
        short: 'Help',
        meaning: 'guide',
        body: 'Site Guide has step-by-step help with pictures, starting with "Every week". Stuck? Home has a card for asking Nathan.',
      },
    ],
  },
  // Staff and volunteers (the staff view).
  {
    id: 'welcome-staff',
    title: 'A quick tour',
    role: 'staff',
    firstRun: true,
    steps: [
      {
        anchor: 'tool:home',
        title: 'Home opens first',
        short: 'Home',
        meaning: 'home',
        body: 'It shows what needs doing this week and whether the last change is on the website yet.',
      },
      {
        anchor: 'tool:quick-update',
        title: 'Quick update',
        short: 'Quick update',
        meaning: 'quickUpdate',
        body: 'The small weekly jobs, made easy on a phone: a notice, an event, a news post, a photo.',
      },
      {
        anchor: 'tool:messages',
        title: 'Messages',
        short: 'Messages',
        meaning: 'message',
        body: 'What people send through the website forms. Mark each one when it has been answered, so nobody answers twice.',
      },
      {
        anchor: 'tool:site-guide',
        title: 'Help is one click away',
        short: 'Help',
        meaning: 'guide',
        body: 'Site Guide explains every job. Nothing is public until someone presses Publish, and the Trash keeps anything deleted.',
      },
    ],
  },
  {
    id: 'home',
    title: 'How this screen works',
    tool: 'home',
    steps: [
      {
        anchor: 'home-this-week',
        title: 'This week',
        meaning: 'step',
        body: 'The jobs that come round every week. Each one ticks itself when it is done.',
      },
      {
        anchor: 'home-is-it-live',
        title: 'Is it live?',
        meaning: 'publishing',
        body: 'After you publish, this says when the website has caught up, usually within a few minutes.',
      },
      {
        anchor: 'home-recent',
        title: 'Recent edits',
        meaning: 'document',
        body: 'The last things anyone changed, newest first. Click one to open it again.',
      },
    ],
  },
  // Quick update's own "How this screen works".
  {
    id: 'quick-update',
    title: 'How this screen works',
    tool: 'quick-update',
    steps: [
      {
        anchor: 'quick-list',
        title: 'Pick a job',
        meaning: 'post',
        body: 'Each button opens one short form, with nothing else on the screen.',
      },
      {
        anchor: 'quick:sermon',
        title: "Sunday's sermon",
        meaning: 'scripture',
        body: 'The title and the video link are enough. The date is already last Sunday.',
      },
      {
        anchor: 'quick:post-photo',
        title: 'Post a photo',
        meaning: 'image',
        body: 'From your camera or your photos. It is saved as a draft for you to check and publish.',
      },
      {
        anchor: 'quick:bulletin',
        title: 'The bulletin',
        meaning: 'download',
        body: 'Pick the PDF and the Sunday it is for. It shows at /bulletin/ a few minutes later.',
      },
      {
        anchor: 'quick:send-newsletter',
        title: 'Messages, RSVPs and the newsletter',
        meaning: 'message',
        body: 'These three tiles open their own screens. The newsletter always sends you a test before it goes to everyone.',
      },
    ],
  },
  // Walk-throughs of the full editor. They start from startTour('<id>') or a What's new
  // "Show me", and open the document first (goTo), since Publish is only on screen with a
  // document open.
  {
    id: 'sermon-editor',
    title: 'Adding a sermon',
    steps: [
      {
        anchor: 'field:date',
        goTo: { create: 'sermon' },
        title: 'The date is filled in',
        body: 'It starts as the Sunday just gone. Change it only if the sermon was another day.',
      },
      {
        anchor: 'field:passage',
        title: 'The Bible passage',
        body: 'Type it like "John 10:1-18". The website adds a link to read it.',
      },
      {
        anchor: 'field:videoUrl',
        title: 'The video link',
        body: 'Copy it from YouTube or Facebook. "How to" beside the box shows where.',
      },
      {
        anchor: 'publish',
        title: 'Publish',
        body: 'It is on the website, the home page and the podcast a few minutes later.',
      },
    ],
  },
  {
    id: 'bulletin-editor',
    title: 'Putting up the bulletin',
    steps: [
      {
        anchor: 'field:date',
        goTo: { create: 'download' },
        title: 'The Sunday it is for',
        body: 'The newest date shows first at /bulletin/.',
      },
      {
        anchor: 'field:file',
        title: 'The PDF',
        body: 'Upload it here. Anything uploaded is public, so leave out private phone numbers and prayer requests.',
      },
      {
        anchor: 'publish',
        title: 'Publish',
        body: 'The address /bulletin/ always opens the newest one, so a QR code on the printed bulletin never needs changing.',
      },
    ],
  },
  {
    id: 'newsletter-editor',
    title: 'Sending the newsletter',
    role: 'editor',
    steps: [
      {
        anchor: 'field:subject',
        goTo: { create: 'newsletter' },
        title: 'The subject line',
        body: 'What people see in their inbox. Short and specific beats clever.',
      },
      {
        anchor: 'field:includeSermon',
        title: 'What goes in',
        body: "This week's sermon and the next two weeks of Church Trac events fill themselves in when you send it.",
      },
      {
        anchor: 'publish',
        title: 'Publish, then send a test',
        body: 'Only the published issue is sent. Under the arrow beside Publish, press "Send a test to me" and read it on your phone.',
      },
      {
        anchor: 'newsletter-send-everyone',
        title: 'Send it to everyone',
        body: 'Happy with the test? "Send to everyone" sends it once. A correction is a new issue.',
      },
    ],
  },
];

export const WELCOME: WelcomeConfig = {
  title: 'Welcome to your church website',
  body: 'This is where you look after the website. You cannot break anything by looking around: nothing changes for visitors until you press Publish.',
  points: [
    'Home shows what needs doing this week.',
    'Quick update has the short jobs, made for a phone.',
    'The Site Guide explains every job, step by step.',
  ],
};

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    date: '2026-10-19',
    title: 'New in Quick update',
    items: [
      'Tell people about an event: a notice with the day and time that comes down after it.',
      'Write a short news post from your phone.',
      "Start this week's newsletter from your phone. It is saved, not sent, until you send it.",
      "Put up this week's bulletin: pick the PDF and the Sunday it is for.",
      'Messages and RSVPs are one tap away, and Site Guide opens with "Every week".',
    ],
    tour: 'quick-update',
  },
];
