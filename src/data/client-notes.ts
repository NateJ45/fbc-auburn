// Safe to edit by hand
// The client review layer's settings and notes (PORTS.md card 195; First Baptist Auburn is where it
// started, 2026-10-23, as the "For Jacob" pill). What we need from Pastor Jacob, page by page, for
// the pre-launch preview. Shown by src/components/ClientNotes.astro as the "For Jacob" pill while
// CLIENT_NOTES_ACTIVE is true. Turn CLIENT_NOTES_ON off at launch (and the yellow highlighting of
// "[Jacob: ...]" placeholders goes with it). It also goes quiet by itself once src/data/site.ts
// holds the real domain, and src/lib/client-notes.test.ts fails until the switch is turned off.
//
// Keys are page paths with a trailing slash ("/" for Home). Keep each note to one thing he can
// act on: a title, then a sentence on what we want and why. Photos are not listed here: the shot
// list (src/data/shot-list.ts) adds one note per "Photo needed" box on the page.

import { clientNotesActive } from '../lib/client-notes.ts';
import { publicPath } from '../lib/page-path.ts';
import { site } from './site.ts';

/** THE SWITCH. On while the church is reviewing the pre-launch site (workers.dev). */
export const CLIENT_NOTES_ON = true;

/** What the pill calls the person it is for: "For Jacob". */
export const CLIENT_NAME = 'Jacob';

/** The words that mark wording to fill in: "[Jacob: ...]", "[Placeholder: ...]", "[Photo: ...]". */
export const MARKERS: readonly string[] = ['Client', 'Placeholder', 'Photo', 'Jacob'];

/** Whether the layer draws right now: the switch is on and the site is on a pre-launch address. */
export const CLIENT_NOTES_ACTIVE = clientNotesActive(CLIENT_NOTES_ON, site.url);

export interface ClientNote {
  title: string;
  detail?: string;
}

const CHURCH_TRAC: ClientNote = {
  title: 'Your Church Trac address and forms.',
  detail:
    'Send us your Church Trac address and the links to your connection card, a general contact form if you have one, and your prayer request form. Each goes in one box and the website swaps its own form for yours, so every message lands in Church Trac. In Church Trac, each form’s "Embed Domain" setting needs this website’s address.',
};

// Since 2026-11-19 (scripts/content/finished-copy.mjs) the pages hold finished copy, written from
// the church's own Facebook posts and, for belief and usual practice, the Baptist Faith and
// Message. The notes below are now what is left to approve or confirm, page by page. Yellow
// "[Jacob: ...]" text on a page is a fact no post gave us.
const NOTES: Record<string, ClientNote[]> = {
  '/': [
    {
      title: 'The pages are written now: please read and approve.',
      detail:
        'We filled every page from your own Facebook posts (your times, the Wednesday meal, Easter, the movie nights, the coat giveaway, the Christmas gifts and program) and, for beliefs, from the Baptist Faith and Message. Read it as a visitor would and tell us anything that is not true of Auburn. Yellow "[Jacob: ...]" text is a fact we could not find anywhere, so only you can give it.',
    },
    {
      title: 'Your welcome and your hello.',
      detail:
        'The line under "Come as you are." uses your Facebook bio ("everyone is family and loves the Lord"). The note signed by you, near the bottom, is written in your voice and mentions Kassie. Change any word you would not say.',
    },
    {
      title: 'The verse in the footer.',
      detail:
        'Home ends with Hebrews 13:8, "Jesus Christ the same yesterday, and to day, and for ever.", the verse on your Facebook page, in the King James wording it quotes. Keep it?',
    },
    {
      title: 'Your TikTok in the footer.',
      detail:
        '[Jacob: the footer links to the auburn.pastor TikTok, labeled "Pastor Jacob on TikTok" so visitors read it as yours, not the church speaking. Does the church want it in the footer on every page, or would you rather it came out (or a church YouTube channel took its place)?]',
    },
    {
      title: 'The times are confirmed from your posts and sign.',
      detail:
        'Sunday School 9:45 and worship 11:00; on Wednesday, dinner at 6:00, adult Bible study at 6:30 and children and youth at 6:00. If any of that changes, update it once in Site settings > Church facts and the whole site follows.',
    },
  ],
  '/about/': [
    {
      title: 'A year with us.',
      detail:
        'The blank-years timeline is now the church year as your posts show it: Easter, summer movie nights and haircuts, the fall coat giveaway and bonfire, Christmas, and every week. If you would rather tell the church’s history with dates, send us the years and we will add them.',
    },
    {
      title: 'When did the church begin?',
      detail:
        'Site settings has 1959 as the founding year, not confirmed. Is that right? Nothing on the page depends on it yet.',
    },
    {
      title: 'Which name should the site use?',
      detail:
        'The building says First Baptist Church of Auburn and the road sign says Auburn Baptist Church. The site uses the first and mentions the sign by name on Plan your visit. Is that right?',
    },
  ],
  '/what-we-believe/': [
    {
      title: 'Please approve this page before launch.',
      detail:
        'Every belief here is written out in full now, in plain words from the Baptist Faith and Message 2000, with the King James verses your posts quote, and the gospel at the top is in the words of your own sermon clips. It reads as settled, so it must not go live until you have read it and said yes, or changed it.',
    },
    {
      title: 'The Baptist Faith and Message as written?',
      detail:
        'The page says the church affirms it as its full statement of faith and links to it. The SBC page notes a later change to Article VI, on the office of pastor. Confirm you are happy with its current wording, or send the church’s own statement instead.',
    },
    {
      title: 'The end times.',
      detail:
        'The "Jesus will return" card keeps to what the Baptist Faith and Message says: Jesus will return in person, and he will judge everyone rightly. Your sermon clips teach a pre-tribulation rapture. Would you like the page to say so?',
    },
    {
      title: 'Your association.',
      detail:
        'The page says the church works with sister churches in Ohio and gives through the Cooperative Program. Is that right, and would you like the association named, or any missionaries the church supports?',
    },
    {
      title: 'The pictures beside each belief.',
      detail:
        'Each topic has a small brick picture: a crown for God, the cross, a dove, a cracked heart for sin, a broken chain for salvation, the cup and bread over water, the church, and light through the clouds. Tell us if any of them says the wrong thing.',
    },
  ],
  '/leadership/': [
    {
      title: 'About you.',
      detail:
        'Written from your posts: you and Kassie, several years here, another job through the week, preaching passage by passage, and Kassie leading the women’s Bible study and teaching the kids. Correct anything, or add how you came to Auburn.',
    },
    {
      title: 'Pastor Rick, by name.',
      detail:
        'How we are led names Dr. Richard Rhodus (Pastor Rick) as preaching and leading the Wednesday study, as your posts do. Is he happy to be named here?',
    },
    {
      title: 'Deacons and ministry leaders, with their permission.',
      detail:
        'Names and roles of anyone you would like introduced, and only once each of them has said yes.',
    },
    {
      title: 'A 30-second hello video?',
      detail:
        'Filmed on a phone, saying hello, it would sit beside your photo. The ask came off the page; send one any time and it goes in.',
    },
    {
      title: 'An email for you and the office, and office hours.',
      detail:
        'Put them in Site settings and they show in the contact card on this page and on Need the pastor?.',
    },
  ],
  '/plan-your-visit/': [
    {
      title: 'Tell us you are coming: your connection card.',
      detail:
        'Once we have your Church Trac connection card link, every "Tell us you are coming" button goes straight to it.',
    },
    {
      title: 'Is the front door at the top of the ramp the one guests use?',
      detail:
        'The sketch at the top of the walk pins it as the place to start. If guests come in another way, tell us which.',
    },
    {
      title: 'Your child safety policy, in one sentence.',
      detail:
        'Background checks, how many adults in a room, check-in and pick-up. It shows in the same words here and twice on Ministries, so say it once and we use it everywhere. It must be exactly true.',
    },
    {
      title: 'Is there a nursery?',
      detail:
        'The Nursery card and two lines ask: the ages, where children are signed in and picked up, and whether it runs the whole service. If there is none, the card comes out.',
    },
    {
      title: 'What worship is like: three to check.',
      detail:
        'We kept to what your posts show, and wrote three things the usual Southern Baptist way: a time to respond at the close of the service, the Lord’s Supper open to anyone who has trusted Jesus (your posts show it at Easter and Christmas), and someone baptized as a baby being invited to be baptized as a believer. Tell us if any is not how Auburn does it.',
    },
    {
      title: 'Getting around inside.',
      detail:
        'Is everything on one level, where is the accessible restroom, and is there a step-free way downstairs?',
    },
  ],
  '/ministries/': [
    {
      title: 'Is there a music team or choir?',
      detail: 'Two cards ask. If there is not, they come out.',
    },
    {
      title: 'Your child safety policy.',
      detail:
        'The Kids card and the children’s room card both ask for it, word for word the same as Plan your visit.',
    },
    {
      title: 'One person to ask for each ministry.',
      detail:
        'Every card has an "Ask about ..." link to the contact form, with the ministry named in the message. Tell us who should get each one (a first name is enough), so it reaches the right person.',
    },
    {
      title: 'Ms. Kassie and Matthew 25 Ministries, by name.',
      detail:
        'The Kids card names Ms. Kassie as your posts do, and Serving our neighbors thanks Matthew 25 Ministries. Happy for both to be named?',
    },
  ],
  '/sermons/': [
    {
      title: 'Do you want a Sermons page?',
      detail:
        'It lists each Sunday’s message with the passage and a video or audio link, and can be a podcast too. The one there now is an example, marked in yellow: replace it with a real one or we delete it before launch.',
    },
    {
      title: 'Where would the recordings come from?',
      detail:
        'A Facebook or YouTube link, an audio file, or both. Whoever posts them would add each one in the editor.',
    },
    {
      title: 'Facebook live, and YouTube?',
      detail:
        'The Watch band points to your Facebook page for the live stream. If you have or want a YouTube channel, the latest message can show here automatically.',
    },
    {
      title: 'An audio recording, for the podcast.',
      detail:
        'The podcast fills itself from any sermon with an MP3 attached. If you can record Sunday’s message, people can listen in the car.',
    },
  ],
  '/prayer/': [
    {
      title: 'A Church Trac prayer form?',
      detail:
        'If you take prayer requests in Church Trac, send us that form’s link and this page shows it instead, so requests land with your prayer list there.',
    },
    {
      title: 'Who sees a request.',
      detail:
        'The page now says a request goes to you, and to the church family only if the box is ticked. Is that right, and is there a prayer chain the box should name?',
    },
  ],
  '/events/': [
    {
      title: 'Your Church Trac calendar link.',
      detail:
        'Send us the calendar (iCal) link from Church Trac and every event you add there shows up here, with a button to add it to a phone.',
    },
    {
      title: 'Put the big days in Church Trac early.',
      detail:
        'The Christmas program, Easter, the movie nights, the coat giveaway and the bonfire. Added a month or two ahead, they show under "Coming up" here and on Home, and the church looks as busy as it is.',
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
    {
      title: 'How gifts are cared for: two facts.',
      detail:
        'Who counts the offering and whether givers get a statement each January, and whether the church votes on a yearly budget. The Cooperative Program line assumes the church gives through it: is that right?',
    },
  ],
  '/next-steps/': [
    {
      title: 'Joining the church.',
      detail:
        'Written the usual Southern Baptist way: talk with you about how they came to faith and their baptism, then a vote of the members. Is that how it works here, and is there a class?',
    },
    {
      title: 'Coffee with the pastor.',
      detail:
        'The page and the Ministries card now say "call or text the church, and Pastor Jacob will be glad to sit down with you". Happy to offer that?',
    },
  ],
  '/contact/': [
    CHURCH_TRAC,
    {
      title: 'The church’s WhatsApp link.',
      detail:
        '[Jacob: you listed WhatsApp as one of the church’s accounts, with Facebook and TikTok. Do you want it on the website? If so, send us the link: a group invite (it starts https://chat.whatsapp.com/) or a number link (https://wa.me/ and the number). It then shows as a WhatsApp button beside Facebook here, in the footer and in the phone menu. You can add it yourself too: Site settings > Social and footer > Social links, paste the link.]',
    },
    {
      title: 'A member sign-in link.',
      detail:
        'If members will use the Church Trac portal or app, send us the sign-in link and it goes in the footer as "Members: sign in".',
    },
    {
      title: 'The church email address.',
      detail:
        'Where messages from the contact form should go, and the address to show on the site.',
    },
    {
      title: 'The church phone.',
      detail:
        'The site shows (513) 863-3500, the number on your Facebook page, and says "Call or text". If it cannot take texts, untick "This number takes texts" in Site settings > Church facts.',
    },
  ],
  '/pastoral-care/': [
    {
      title: 'Need the pastor?: check the promises.',
      detail:
        'Hospital and home visits, the Lord’s Supper at home, funerals, weddings and help with a bill are written as offers. Take out any the church cannot keep.',
    },
    {
      title: 'Office hours and email.',
      detail: 'If there are any, they go in Site settings and show in the card on this page.',
    },
  ],
  '/journal/': [
    {
      title: 'A first real post.',
      detail:
        'The example is now the Children’s Christmas Program on December 2, from your Facebook invitation. Short posts like it keep the site alive: who would write them, and how often?',
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
    {
      title: 'When is it posted, and by whom?',
      detail:
        'Until the new one is up, the page keeps last week’s and says when the next goes up. Tell us the day (say, "by Saturday evening") and who uploads it.',
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
export function notesFor(pathname: string): ClientNote[] {
  return NOTES[publicPath(pathname)] ?? [];
}

/** Every page with notes, for the one-page list we send Jacob. */
export function allNotes(): [string, ClientNote[]][] {
  return Object.entries(NOTES);
}
