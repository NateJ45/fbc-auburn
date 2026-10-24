// Safe to edit by hand
// What we need from Pastor Jacob, page by page, for the pre-launch preview (2026-10-23). Shown by
// src/components/ForJacob.astro as the "For Jacob" pill while PRE_LAUNCH_NOTES is true. Turn it
// off at launch (and the yellow highlighting of "[Jacob: ...]" placeholders goes with it).
//
// Keys are page paths with a trailing slash ("/" for Home). Keep each note to one thing he can
// act on: a title, then a sentence on what we want and why. Photos are not listed here: the shot
// list (src/data/shot-list.ts) adds one note per "Photo needed" box on the page.

export const PRE_LAUNCH_NOTES = true;

export interface JacobNote {
  title: string;
  detail?: string;
}

const NOTES: Record<string, JacobNote[]> = {
  '/': [
    {
      title: 'Meet Pastor Jacob: a few lines.',
      detail: 'Three or four sentences about you for the block near the bottom of the page.',
    },
    {
      title: 'Your welcome, in your words.',
      detail:
        'The line under "Come as you are." and the note signed by you are our drafts in brackets: rewrite them or tell us what to change.',
    },
    {
      title: 'Confirm the Sunday and Wednesday times.',
      detail:
        'Your road sign says adult Bible study at 6:30 and youth at 6:00 on Wednesdays; the site says 6:00. Which is right today?',
    },
  ],
  '/about/': [
    {
      title: 'How the church began.',
      detail:
        'Two or three sentences on its start and the season it is in now. Was it founded in 1959?',
    },
    {
      title: 'Which name should the site use?',
      detail:
        'The building says First Baptist Church of Auburn and the road sign says Auburn Baptist Church. One, or both?',
    },
  ],
  '/what-we-believe/': [
    {
      title: 'What we believe is yours to write.',
      detail:
        'We have not drafted any beliefs. Each card asks for two to four plain sentences and one verse, in your words.',
    },
    {
      title: 'The gospel, first.',
      detail:
        'The page now opens with the good news in your words, then nine short topics, the order the largest SBC church sites use.',
    },
    {
      title: 'The pictures beside each belief.',
      detail:
        'Each topic has a small brick picture: a crown for God, the cross, a dove, a cracked heart for sin, a broken chain for salvation, the cup and bread over water, the church, and light through the clouds. Tell us if any of them says the wrong thing.',
    },
    {
      title: 'The full statement of faith.',
      detail:
        'The page says, in yellow brackets, that the church affirms the Baptist Faith and Message 2000 and links to it. Confirm that, or send the church’s own statement instead.',
    },
    {
      title: 'Baptism.',
      detail: 'What it means here, and what someone should do if they would like to be baptised.',
    },
  ],
  '/leadership/': [
    {
      title: 'A few sentences about you.',
      detail:
        'How you came to Auburn, family if you would like to share it, and what you love about the church.',
    },
    {
      title: 'Deacons and ministry leaders, with their permission.',
      detail:
        'Names and roles of anyone you would like introduced, and only once each of them has said yes.',
    },
  ],
  '/plan-your-visit/': [
    {
      title: 'Is the front door at the top of the ramp the one guests use?',
      detail:
        'The sketch at the top of the walk pins it as the place to start. If guests come in another way, tell us which.',
    },
    {
      title: 'Check the walk-through of a first Sunday.',
      detail:
        'Parking, the greeter, coffee, children and worship: anything marked "to be confirmed" or in brackets is our guess.',
    },
    {
      title: 'Getting in.',
      detail:
        'Is there an accessible restroom, and anything else a first-time guest should know at the door?',
    },
    {
      title: 'Children during worship.',
      detail: 'Is there a nursery or children’s room, and who looks after it?',
    },
  ],
  '/ministries/': [
    {
      title: 'Is this list right?',
      detail:
        'Kids, Sunday School, Bible study, music, prayer and fellowship are our drafts. Add, remove or rename any of them, with days and times.',
    },
    {
      title: 'How the church serves its neighbours.',
      detail:
        'One or two real examples. Does the food pantry run through the year, and when is it open?',
    },
  ],
  '/watch/': [
    {
      title: 'Facebook live, and YouTube?',
      detail:
        'The page points to your Facebook page for the live stream. If you have or want a YouTube channel, the latest message can show here automatically.',
    },
    {
      title: 'What time does the stream start?',
      detail: 'So we can tell people when to tune in.',
    },
  ],
  '/sermons/': [
    {
      title: 'Do you want a Sermons page?',
      detail:
        'It lists each Sunday’s message with the passage and a video or audio link, and can be a podcast too. The one there now is an example.',
    },
    {
      title: 'Where would the recordings come from?',
      detail:
        'A YouTube link, an audio file, or both. Whoever posts them would add each one in the editor.',
    },
  ],
  '/prayer/': [
    {
      title: 'Who should prayer requests go to?',
      detail:
        'Right now they would go to you alone, and the website keeps no copy. Should a prayer team see them too?',
    },
    {
      title: 'May people share a request with the church?',
      detail:
        'The form has a tick box for "You may share this with the church family". Keep it, or keep every request private?',
    },
  ],
  '/events/': [
    {
      title: 'Your Church Trac calendar link.',
      detail:
        'Send us the calendar (iCal) link from Church Trac and every event you add there shows up here, with a button to add it to a phone.',
    },
    {
      title: 'Confirm the weekly times.',
      detail:
        'The Sunday and Wednesday times here come from the same list as the rest of the site.',
    },
  ],
  '/give/': [
    {
      title: 'Your ChurchTrac giving link.',
      detail: 'Send us the online giving address and every Give button will go straight to it.',
    },
    {
      title: 'Giving by mail.',
      detail: 'If people can mail a check, who should it be made out to and where should it go?',
    },
  ],
  '/contact/': [
    {
      title: 'The church email address.',
      detail:
        'Where messages from the contact form should go, and the address to show on the site.',
    },
    {
      title: 'The church phone number.',
      detail: 'If you want one shown, and who answers it.',
    },
    {
      title: 'Who reads prayer requests?',
      detail: 'The page says the pastor and the prayer team. Is that right?',
    },
  ],
  '/faq/': [
    {
      title: 'Check the answers.',
      detail:
        'What to wear, parking, children and the rest are our drafts in brackets. Change anything that is not how Auburn does it.',
    },
    {
      title: 'Communion and baptism.',
      detail:
        'Those two answers are yours to write: how often you share the Lord’s Supper, and how to ask about baptism.',
    },
    {
      title: 'Anything people often ask you?',
      detail: 'Send us the questions and we will add them.',
    },
  ],
  '/journal/': [
    {
      title: 'Do you want a News and notes page?',
      detail:
        'Short posts from you or the church: news, dates, a thought from Sunday. The post there now is an example.',
    },
    {
      title: 'Who would write them, and how often?',
      detail: 'If nobody has time, we can hide the page until there is.',
    },
  ],
  '/bulletin/': [
    {
      title: 'Do you want a Bulletin page?',
      detail:
        'Each week’s bulletin or newsletter as a PDF people can download. It is empty until the first file is added.',
    },
    {
      title: 'Send us a recent bulletin.',
      detail: 'One past PDF is enough to show you how it looks.',
    },
  ],
  '/privacy/': [
    {
      title: 'Read this over.',
      detail:
        'It says what the site collects (very little) and why. Tell us if the church has its own policy it should match.',
    },
    {
      title: 'Who can people ask about their data?',
      detail: 'The page sends them to the contact form. Is the church happy to answer those?',
    },
  ],
};

/** The notes for a page path (with or without a trailing slash). */
export function notesFor(pathname: string): JacobNote[] {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return NOTES[p] ?? [];
}

/** Every page with notes, for the one-page list we send Jacob. */
export function allNotes(): [string, JacobNote[]][] {
  return Object.entries(NOTES);
}
