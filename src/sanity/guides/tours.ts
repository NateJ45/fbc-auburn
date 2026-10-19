// Safe to edit by hand
// =============================================================================
// FBC Auburn's Studio tours and tutorial-video scripts, as DATA (2026-10-19)
// =============================================================================
// Written before the shared tour and video pieces land in the starter (PORTS.md
// card 137: spotlight tours with popovers on real Studio controls, welcome and
// what's-new modals, a guide video block, the recording pipeline). Nothing reads
// this file yet. When 137 merges, map the TOURS onto its config types in
// kit.config.ts and delete the local types below; the words stay as they are.
// Plan and reasons: docs/agent/studio-plan.md.
//
// Anchors. `anchor` is a stable name for the control; `selector` is how to find
// it in today's Studio. Navbar tools are links ending in the tool's name
// (a[href$="/studio/quick-update"]). Controls inside the kit's own tools have no
// hooks yet: those say `needsHook`, meaning 137 (or this site) should add a
// data attribute there. Sanity's own controls are found by their visible words.
//
// Sample data only, in tours and in videos: never a real person's name, phone
// number, prayer need or address other than the church's own public one.
// =============================================================================

/** Who sees a tour: the pastor (administrator), staff/volunteers (staff view), or both. */
export type TourRole = 'pastor' | 'staff' | 'everyone';

export interface TourStepData {
  anchor: string;
  /** How to find it today. Missing: a centred popover with no anchor. */
  selector?: string;
  /** True when the control has no stable hook yet (add a data attribute). */
  needsHook?: boolean;
  title: string;
  body: string;
}

export interface TourData {
  id: string;
  title: string;
  role: TourRole;
  /** 'first-run' opens once by itself; 'on-demand' starts from a "Show me" link. */
  when: 'first-run' | 'on-demand';
  /** Where the tour starts (a tool, or a document type's editor). */
  startsOn: string;
  steps: TourStepData[];
}

const tool = (name: string) => `a[href$="/studio/${name}"]`;

export const AUBURN_TOURS: TourData[] = [
  {
    id: 'welcome',
    title: 'Welcome to your church website',
    role: 'pastor',
    when: 'first-run',
    startsOn: 'home',
    steps: [
      {
        anchor: 'home-tool',
        selector: tool('home'),
        title: 'Home opens first',
        body: 'Each time you sign in, Home shows what to do this week and whether your last change is on the website yet.',
      },
      {
        anchor: 'sunday-checklist',
        needsHook: true,
        title: 'Your Sunday checklist',
        body: 'The weekly jobs, ticking themselves as you do them: the sermon, the bulletin, a news post, old notices and the Checkup. It starts fresh every Monday.',
      },
      {
        anchor: 'quick-update-tool',
        selector: tool('quick-update'),
        title: 'Quick update, for your phone',
        body: "Sunday's sermon, a notice, an event, a news post, a photo or the newsletter, each in a few taps. It goes on the website straight away.",
      },
      {
        anchor: 'bulletin-button',
        needsHook: true,
        title: "This week's bulletin",
        body: 'The bulletin has its own button here, because it needs a file. Upload the PDF and publish.',
      },
      {
        anchor: 'content-tool',
        selector: tool('structure'),
        title: 'Content is everything else',
        body: 'Every page, sermon, notice and setting, ready to edit. Nothing you change is public until you press Publish.',
      },
      {
        anchor: 'guide-tool',
        selector: tool('site-guide'),
        title: 'Help for every job',
        body: 'Site Guide has step-by-step help with pictures, starting with "Every week". Stuck? Home has a card for asking Nathan.',
      },
    ],
  },
  {
    id: 'welcome-staff',
    title: 'Welcome to the church website',
    role: 'staff',
    when: 'first-run',
    startsOn: 'home',
    steps: [
      {
        anchor: 'home-tool',
        selector: tool('home'),
        title: 'Home opens first',
        body: 'It shows what needs doing this week and whether the last change is on the website yet.',
      },
      {
        anchor: 'quick-update-tool',
        selector: tool('quick-update'),
        title: 'Quick update',
        body: 'The small weekly jobs, made easy on a phone: a notice, an event, a news post, a photo.',
      },
      {
        anchor: 'messages-tool',
        selector: tool('messages'),
        title: 'Messages',
        body: 'What people send through the website forms. Mark each one when it has been answered, so nobody answers twice.',
      },
      {
        anchor: 'guide-tool',
        selector: tool('site-guide'),
        title: 'Help is one click away',
        body: 'Site Guide explains every job. Nothing is public until someone presses Publish, and the Trash keeps anything deleted.',
      },
    ],
  },
  {
    id: 'quick-update',
    title: 'Quick update',
    role: 'everyone',
    when: 'first-run',
    startsOn: 'quick-update',
    steps: [
      {
        anchor: 'quick-tiles',
        selector: '[data-quick]',
        title: 'Pick a job',
        body: 'Each button opens one short form, with nothing else on the screen.',
      },
      {
        anchor: 'quick-sermon',
        needsHook: true,
        title: "Sunday's sermon",
        body: 'The title and the video link are enough. The date is already last Sunday.',
      },
      {
        anchor: 'quick-photo',
        selector: '[data-photo-input]',
        title: 'Post a photo',
        body: 'From your camera or your photos. It is saved as a draft for you to check and publish.',
      },
      {
        anchor: 'quick-submit',
        needsHook: true,
        title: 'The green button publishes it',
        body: 'Everything except a photo goes on the website straight away. To add more later, open it in the full editor.',
      },
    ],
  },
  {
    id: 'sermon-editor',
    title: 'Adding a sermon',
    role: 'everyone',
    when: 'on-demand',
    startsOn: 'sermon',
    steps: [
      {
        anchor: 'sermon-date',
        selector: '[data-testid="field-date"]',
        title: 'The date is filled in',
        body: 'It starts as the Sunday just gone. Change it only if the sermon was another day.',
      },
      {
        anchor: 'sermon-passage',
        selector: '[data-testid="field-passage"]',
        title: 'The Bible passage',
        body: 'Type it like "John 10:1-18". The website adds a link to read it.',
      },
      {
        anchor: 'sermon-video',
        selector: '[data-testid="field-videoUrl"]',
        title: 'The video link',
        body: 'Copy it from YouTube or Facebook. "How to" beside the box shows where.',
      },
      {
        anchor: 'publish',
        selector: '[data-testid="action-publish"]',
        title: 'Publish',
        body: 'It is on the website, the home page and the podcast a few minutes later.',
      },
    ],
  },
  {
    id: 'bulletin-editor',
    title: 'Putting up the bulletin',
    role: 'everyone',
    when: 'on-demand',
    startsOn: 'download',
    steps: [
      {
        anchor: 'download-date',
        selector: '[data-testid="field-date"]',
        title: 'The Sunday it is for',
        body: 'The newest date shows first at /bulletin/.',
      },
      {
        anchor: 'download-file',
        selector: '[data-testid="field-file"]',
        title: 'The PDF',
        body: 'Upload it here. Anything uploaded is public, so leave out private phone numbers and prayer requests.',
      },
      {
        anchor: 'publish',
        selector: '[data-testid="action-publish"]',
        title: 'Publish',
        body: 'The address /bulletin/ always opens the newest one, so a QR code on the printed bulletin never needs changing.',
      },
    ],
  },
  {
    id: 'newsletter-editor',
    title: 'Sending the newsletter',
    role: 'pastor',
    when: 'on-demand',
    startsOn: 'newsletter',
    steps: [
      {
        anchor: 'newsletter-subject',
        selector: '[data-testid="field-subject"]',
        title: 'The subject line',
        body: 'What people see in their inbox. Short and specific beats clever.',
      },
      {
        anchor: 'newsletter-picks',
        selector: '[data-testid="field-includeSermon"]',
        title: 'What goes in',
        body: "This week's sermon and the next two weeks of Church Trac events fill themselves in when you send it.",
      },
      {
        anchor: 'publish',
        selector: '[data-testid="action-publish"]',
        title: 'Publish, then send a test',
        body: 'Only the published issue is sent. Under the arrow beside Publish, press "Send a test to me" and read it on your phone.',
      },
      {
        anchor: 'send-everyone',
        needsHook: true,
        title: 'Send it to everyone',
        body: 'Happy with the test? "Send to everyone" sends it once. A correction is a new issue.',
      },
    ],
  },
];

/** The "What's new" modal for this change (137's modal; shown once to the pastor). */
export const WHATS_NEW_2026_10_19 = {
  id: '2026-10-19-weekly-jobs',
  title: 'New in Quick update',
  items: [
    'Tell people about an event: a notice with the day and time that comes down after it.',
    'Write a short news post from your phone.',
    "Start this week's newsletter from your phone. It is saved, not sent, until you send it.",
    "Home has a button for this week's bulletin.",
    'Site Guide opens with "Every week": each weekly job, step by step.',
  ],
};

// ── Tutorial-video scripts: recorded at launch, once the content is real ─────
// Shot by shot, against the local Studio with SAMPLE data. Under two minutes
// each, 1280 wide (desk) or 390 wide (phone). Each caption is what shows on
// screen during that shot; check every caption frame after recording.

export interface VideoShot {
  /** What happens on screen. */
  action: string;
  /** The caption shown during it (short; one line on a phone). */
  caption: string;
}

export interface VideoScript {
  /** The guide it plays in (guides/*.ts slug). */
  guide: string;
  title: string;
  device: 'phone' | 'desk';
  /** The sample values typed in the video. */
  sample: Record<string, string>;
  shots: VideoShot[];
}

export const AUBURN_VIDEOS: VideoScript[] = [
  {
    guide: 'add-sermon',
    title: "Add Sunday's sermon from your phone",
    device: 'phone',
    sample: {
      title: 'The Good Shepherd',
      passage: 'John 10:1-18',
      videoUrl: 'https://youtu.be/SAMPLE00001',
    },
    shots: [
      { action: 'Studio Home on a phone; tap Quick update.', caption: 'Open Quick update' },
      { action: "Tap Add Sunday's sermon link.", caption: "Tap Add Sunday's sermon link" },
      { action: 'Type the title.', caption: 'Type the sermon title' },
      { action: 'Paste the sample video link.', caption: 'Paste the video link' },
      { action: 'Show the date already set to last Sunday.', caption: 'The date fills itself in' },
      { action: 'Type the passage.', caption: 'Add the Bible passage' },
      {
        action: 'Tap the green button; the done message shows.',
        caption: 'Done. Live in a few minutes',
      },
    ],
  },
  {
    guide: 'bulletin',
    title: "Put up this week's bulletin",
    device: 'phone',
    sample: { title: 'Bulletin for October 25', file: 'sample-bulletin.pdf (one page, lorem)' },
    shots: [
      {
        action: "Home; tap Put up this week's bulletin.",
        caption: "Tap Put up this week's bulletin",
      },
      { action: 'Type the title; Kind already shows Bulletin.', caption: 'Give it a title' },
      { action: 'Set the date to the coming Sunday.', caption: 'Pick the Sunday it is for' },
      { action: 'Upload the sample PDF under File.', caption: 'Upload the PDF' },
      {
        action: 'Tap Publish; the status line shows the update.',
        caption: 'Publish. It is at /bulletin/',
      },
    ],
  },
  {
    guide: 'tell-about-an-event',
    title: 'Tell people about an event',
    device: 'phone',
    sample: {
      name: 'Fall festival',
      date: 'the coming Saturday',
      time: '4 pm',
      link: 'https://example.org/fall-festival',
    },
    shots: [
      {
        action: 'Quick update; tap Tell people about an event.',
        caption: 'Tap Tell people about an event',
      },
      {
        action: 'Type the name, pick the day, type the time.',
        caption: 'What, which day, what time',
      },
      { action: 'Paste the sample link.', caption: 'Add a link for more' },
      { action: 'Tap the green button.', caption: 'Done. It comes down after the day' },
      {
        action: 'Live preview: the notice across the top of Home.',
        caption: 'How visitors see it',
      },
    ],
  },
  {
    guide: 'post-a-photo',
    title: 'Post a photo from your phone',
    device: 'phone',
    sample: {
      photo: 'a stock photo of the church building or a potluck table (no faces)',
      alt: 'Tables set for the fall potluck in the fellowship hall.',
      title: 'Fall potluck',
    },
    shots: [
      { action: 'Quick update; tap Post a photo.', caption: 'Tap Post a photo' },
      { action: 'Choose the sample photo.', caption: 'Pick a photo' },
      { action: 'Type the description.', caption: 'Say what is in it' },
      {
        action: 'Choose A new News and notes post; type the title.',
        caption: 'Make it a news post',
      },
      { action: 'Save; open it; press Publish.', caption: 'Check it, then Publish' },
    ],
  },
  {
    guide: 'send-the-newsletter',
    title: 'Send the weekly newsletter',
    device: 'desk',
    sample: {
      subject: 'This week at Auburn: fall festival',
      intro: 'Hello friends, here is what is happening this week.',
    },
    shots: [
      {
        action: "Quick update; Start this week's newsletter; type subject and intro; save.",
        caption: 'Start the issue',
      },
      {
        action: 'Open it in the full editor; show the sermon and events picks.',
        caption: 'The sermon and events fill in',
      },
      { action: 'Publish.', caption: 'Publish it first' },
      { action: 'Arrow beside Publish; Send a test to me.', caption: 'Send yourself a test' },
      {
        action: 'Send to everyone; the confirm dialog (stop before confirming).',
        caption: 'Then send it to everyone',
      },
    ],
  },
  {
    guide: 'news-post',
    title: 'Write a news post',
    device: 'phone',
    sample: {
      title: 'Thank you for the food drive',
      text: 'We filled the van with 212 cans for the Ross Township pantry. Thank you, all of you.',
    },
    shots: [
      {
        action: 'Quick update; tap Write a short news post.',
        caption: 'Tap Write a short news post',
      },
      { action: 'Type the headline and the post.', caption: 'A headline and a few lines' },
      { action: 'Tap the green button.', caption: 'Done. Live in a few minutes' },
      {
        action: 'Open it in the full editor; add a cover image.',
        caption: 'Add a photo if you like',
      },
    ],
  },
];
