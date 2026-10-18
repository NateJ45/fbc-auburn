// =============================================================================
// Site Guide: sermons, people and downloads (FBC Auburn, 2026-10-18)
// =============================================================================
// Appended to the guides in content.ts (guides.push), under their own
// category. Same conventions as content.ts: `backticks` for a thing you click,
// **bold** for a concept, no em-dashes, US spelling, the Studio's own names.
// src/lib/studio-guides.test.ts checks the structure.
// =============================================================================

import type { Guide } from './content.ts';

export const COLLECTIONS_CATEGORY = 'Sermons, people and downloads' as const;

export const collectionGuides: Guide[] = [
  {
    slug: 'add-sermon',
    category: COLLECTIONS_CATEGORY,
    title: "Add Sunday's sermon",
    icon: 'play',
    lead: 'Two minutes after Sunday, and the website, the home page and the podcast all have it.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Sermons', 'Start here'],
        link: { pane: 'sermons;sermons-start' },
      },
      {
        kind: 'steps',
        items: [
          "On `Home`, click `Add Sunday's sermon` (or open `Sermons`, then `Start here`, and click the same button).",
          'The **date** is already the Sunday just gone, and the **preacher** is already the pastor. Change either if it was different. For a visiting preacher, clear `Preacher` and type their name in `Visiting preacher`.',
          'Type the `Sermon title` and the `Bible passage`, like "John 3:1-21". The website works out the book and adds a link to read the passage.',
          'If it is part of a series, pick it in `Sermon series`.',
          'Under `Video, audio and notes`, paste the **video link**. On YouTube, click `Share` and then `Copy`. On Facebook, open the video, click the three dots and `Copy link`.',
          'If you have a recording, upload the MP3 in `Audio recording`, and the outline in `Notes or outline`. Both are optional.',
          'Back on `The sermon` tab, click `Generate` next to `Web address ending`.',
          'Click `Publish`. The sermon is on the website a few minutes later.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'The home page looks after itself.',
        text: 'For eight days after the date it was preached, the "Last Sunday" card on the home page names the sermon and links to it. After that it steps aside by itself.',
      },
      { kind: 'h', text: 'Putting Sermons in the menu (once)' },
      {
        kind: 'steps',
        items: [
          'Open `Site settings`, then the `Menus` tab.',
          'Add a link to the top menu. Set `Page to link to` to `Sermons page`, and the label to "Sermons".',
          'Publish. The menu shows it after the next website update.',
        ],
      },
      {
        kind: 'p',
        text: 'To show the newest sermon on any other page, add a `Latest sermon` section to it. It changes by itself every week.',
      },
      {
        kind: 'seealso',
        items: ['Start a new sermon series', 'Put the podcast on Apple and Spotify'],
      },
    ],
  },
  {
    slug: 'sermon-series',
    category: COLLECTIONS_CATEGORY,
    title: 'Start a new sermon series',
    icon: 'blocks',
    lead: 'A name, a picture and a sentence. The dates sort themselves out.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Sermons', 'Sermon series'],
        link: { pane: 'sermons;sermonSeries' },
      },
      {
        kind: 'steps',
        items: [
          'Open `Sermons`, then `Sermon series`, then the `+` button.',
          'Type the `Series title` and click `Generate` next to `Web address ending`.',
          'Add a **wide picture**, about 1600 by 900. Every sermon in the series without its own picture uses it.',
          'For a series through one book, pick it in `Book of the Bible`. Leave it empty for a topical series.',
          'Write a sentence or two in `What the series is about`, then `Publish`.',
          "From now on, pick the series in each sermon's `Sermon series` box.",
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'There is no date to type.',
        text: 'The website orders series by their first sermon, and works out when each one ran and how many sermons it has, from the sermons themselves. A series with no sermons yet shows as coming soon.',
      },
      {
        kind: 'p',
        text: 'Every series gets its own page under /sermons/series/. To show the series on another page, add a `Sermon series grid` section.',
      },
      { kind: 'seealso', items: ["Add Sunday's sermon"] },
    ],
  },
  {
    slug: 'podcast',
    category: COLLECTIONS_CATEGORY,
    title: 'Put the podcast on Apple and Spotify',
    icon: 'activity',
    lead: 'A one-time job. After it, every sermon with a recording reaches people’s phones by itself.',
    diy: 'mixed',
    body: [
      {
        kind: 'p',
        text: 'The website already makes a **podcast feed**: a list podcast apps read, with every sermon that has an uploaded recording. Its address is the website address followed by /sermons/podcast.xml. Apple and Spotify each need telling about it once.',
      },
      { kind: 'h', text: 'First, in the Studio' },
      {
        kind: 'steps',
        items: [
          'Open `Sermons`, then `Sermons page and podcast`, then the `Podcast` tab.',
          'Fill in the `Podcast name` and `Podcast description`, and add a **square** `Podcast picture`, 3000 by 3000 pixels if you can (1400 by 1400 at the least).',
          'Check the church email in `Site settings` is one someone reads: Spotify sends a code to it.',
          'Publish, and make sure at least one sermon has a recording.',
        ],
      },
      { kind: 'h', text: 'Apple Podcasts' },
      {
        kind: 'steps',
        items: [
          'Go to podcastsconnect.apple.com and sign in with the church’s Apple Account.',
          'Add a new show, choose to add it with an **RSS feed**, and paste the podcast feed address.',
          'Apple checks it and emails when it is approved. That can take a few days.',
          'Once it is live, copy the show’s Apple Podcasts link into `Link to the podcast on Apple Podcasts`, and publish.',
        ],
      },
      { kind: 'h', text: 'Spotify' },
      {
        kind: 'steps',
        items: [
          'Go to creators.spotify.com, sign in, and choose to add an existing podcast by its **RSS feed**.',
          'Paste the podcast feed address. Spotify emails a code to the church email; type it in.',
          'Pick the category and country, and submit. It is usually live within a few hours.',
          'Copy the show’s Spotify link into `Link to the podcast on Spotify`, and publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Stuck on an account or a sign-in?',
        text: 'The Apple and Spotify parts happen on their websites, with the church’s own accounts. Ask Nathan to sit with you for it if that is easier.',
      },
      { kind: 'seealso', items: ["Add Sunday's sermon"] },
    ],
  },
  {
    slug: 'add-person',
    category: COLLECTIONS_CATEGORY,
    title: 'Add someone to the people list',
    icon: 'add',
    lead: 'Type a person once, and show them on any page.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'People', 'Start here'],
        link: { pane: 'people;people-start' },
      },
      {
        kind: 'steps',
        items: [
          'Open `People`, then `Start here`. The first time, click the button to add the usual groups (Staff, Deacons, Teachers, Missionaries, Volunteers).',
          'Click `Add someone`. Type their `Name` and `Role`, like Pastor, Deacon or Sunday School teacher, and pick their `Group`.',
          'Upload a `Photo`, then click it and drag the circle onto their face so it crops well.',
          'Add `A few sentences about them` if you like.',
          'Use `Position in their group` to put someone first (1 is first). Leave it empty to list by name.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'What is typed here is public.',
        text: 'The website only shows an email when `Show the email on the website` is ticked, and a missionary’s place only when `Keep the location off the website` is unticked. But anything typed in the Studio can be read by someone who knows how. Only type what is fine to be public.',
      },
      { kind: 'h', text: 'Showing people on a page' },
      {
        kind: 'p',
        text: 'Add a `People` section to the page (Leadership, say). Pick the groups to show, or pick people by hand to show them in your own order.',
      },
    ],
  },
  {
    slug: 'bulletin',
    category: COLLECTIONS_CATEGORY,
    title: "Put up this week's bulletin",
    icon: 'document',
    lead: 'Upload the PDF and publish. The address people use never changes.',
    diy: 'self',
    body: [
      {
        kind: 'path',
        items: ['Content', 'Downloads', 'Start here'],
        link: { pane: 'downloads;downloads-start' },
      },
      {
        kind: 'steps',
        items: [
          "Open `Downloads`, then `Start here`, and click `Put up this week's bulletin`.",
          'Type a `Title`, like "Bulletin for October 18". `Kind` is already Bulletin, and the `Date` is already today: set it to the Sunday the bulletin is for.',
          'Upload the PDF in `File`.',
          'Publish.',
        ],
      },
      {
        kind: 'p',
        text: 'The newest bulletin is always at the website address followed by /bulletin/. Put that address in the menu, on Facebook or as a QR code on the printed bulletin, and it never needs changing.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Uploaded files are public.',
        text: 'Leave out phone numbers, addresses and prayer requests that are not meant for everyone before you upload.',
      },
      {
        kind: 'p',
        text: 'Forms, newsletters and policies go in the same place, with their own `Kind`. Give a form a `Take it down after` date and the website drops it by itself. To list files on a page, add a `Downloads list` section and pick the kind.',
      },
    ],
  },
];
