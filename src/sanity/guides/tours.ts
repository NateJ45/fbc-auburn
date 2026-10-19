// Safe to edit by hand
// =============================================================================
// FBC Auburn's tutorial-video scripts, as DATA (2026-10-19)
// =============================================================================
// The tours that used to live here moved to src/sanity/studio-tours.ts when starter
// card 137 landed. What stays is the shot-by-shot scripts for the six videos, to be
// recorded at launch once the content is real (the recorder and the player are also
// card 137: tools/tutorial-videos/, src/sanity/guides/videos.ts). Nothing reads this
// file yet. Plan and reasons: docs/agent/studio-plan.md.
//
// Sample data only: never a real person's name, phone number, prayer need or
// address other than the church's own public one.
// =============================================================================

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
