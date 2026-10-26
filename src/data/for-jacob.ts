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

const CHURCH_TRAC: JacobNote = {
  title: 'Your Church Trac address and forms.',
  detail:
    'Send us your Church Trac address and the links to your connection card, a general contact form if you have one, and your prayer request form. Each goes in one box and the website swaps its own form for yours, so every message lands in Church Trac. In Church Trac, each form’s "Embed Domain" setting needs this website’s address.',
};

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
      title: 'The verse in the footer.',
      detail:
        'Home ends with Matthew 11:28 across the top of the footer. Is that the verse you want, and which translation does the church read from?',
    },
    {
      title: 'Your TikTok in the footer.',
      detail:
        '[Jacob: the footer links to the auburn.pastor TikTok, labeled "Pastor Jacob on TikTok" so visitors read it as yours, not the church speaking. Does the church want it in the footer on every page, or would you rather it came out (or a church YouTube channel took its place)?]',
    },
    {
      title: 'Confirm the Sunday and Wednesday times.',
      detail:
        'Your road sign says adult Bible study at 6:30 and youth at 6:00 on Wednesdays; the site says 6:00. Which is right today?',
    },
    {
      title: 'Three different Sunday times are out there.',
      detail:
        'The site says Sunday School 9:45 and worship 11:00. Your Google listing shows the building open 9:30 am to 1 pm, and a Facebook post from the spring says Sunday School 9:15 and 10:30. What are the times today? Once we know, the Google hours may want a tidy too.',
    },
    {
      title: 'One honest line about a Sunday.',
      detail:
        'Under "Come as you are.": about how many come, the music, and who comes (families, retirees, both). Visitors told us this decides which church they try.',
    },
    {
      title: 'The good news, near the top.',
      detail:
        'A new block after "Your first Sunday" asks for two or three sentences of the gospel in plain words. It links to "The gospel, first" on What we believe. Your words only; we have not drafted it.',
    },
  ],
  '/about/': [
    {
      title: 'How the church began.',
      detail:
        'Two or three sentences on its start and the season it is in now. Was it founded in 1959?',
    },
    {
      title: '"Who we are" is in your own words now.',
      detail:
        'We took it from the description the church wrote for its Google listing, including "know Christ, make Him known, and glorify God". Change anything that no longer fits.',
    },
    {
      title: 'Which name should the site use?',
      detail:
        'The building says First Baptist Church of Auburn and the road sign says Auburn Baptist Church. One, or both?',
    },
    {
      title: 'A Sunday here.',
      detail:
        'A new section: the music, how you preach and for about how long, and who comes. Visitors want this more than the story of the logo, which is now one line at the end.',
    },
    {
      title: 'Something only Auburn could say.',
      detail:
        '"Who we are" reads like many church websites. One or two sentences about this church in particular would help most.',
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
      detail: 'What it means here, and what someone should do if they would like to be baptized.',
    },
    {
      title: 'What it means to be Baptist.',
      detail:
        'A new section after the beliefs: what makes Auburn Baptist (baptism by immersion, the Lord’s Supper, how the church is governed, the local church, the priesthood of believers, soul liberty) and how Auburn works with other Southern Baptists. Your words; we have not drafted any.',
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
    {
      title: 'How decisions are made.',
      detail:
        'One sentence: does the church vote on members, the budget and calling a pastor, and what do the deacons do?',
    },
    {
      title: 'A 30-second hello video.',
      detail:
        'Filmed on a phone, saying hello. It would sit beside your photo. Visitors say a real voice is what makes them trust a pastor before they visit.',
    },
    {
      title: 'Your TikTok, on this page.',
      detail:
        'The page now says you post short videos on TikTok and links to @auburn.pastor. Happy for it to be here as yours?',
    },
    {
      title: 'An email for you and the office, and office hours.',
      detail:
        'Put them in Site settings and they show in the new contact card on this page and on Need the pastor?.',
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
      title: 'Check the walk-through of a first Sunday.',
      detail:
        'Parking, the greeter, coffee, children and worship: anything marked "to be confirmed" or in brackets is our guess.',
    },
    {
      title: 'The Questions page now lives here.',
      detail:
        'To shorten the menu, the questions moved to the bottom of this page, and the old Questions address comes here. The notes below came with them.',
    },
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
    {
      title: 'Your kids: the details.',
      detail:
        'Nursery ages, where children check in and how parents pick them up, whether it is the whole service, and what a five-year-old does in worship.',
    },
    {
      title: 'Your child safety policy, in one sentence.',
      detail:
        'Background checks, two adults in every room, check-in and pick-up. It shows in the same words here and on Ministries, so say it once and we use it everywhere.',
    },
    {
      title: 'What worship is like.',
      detail:
        'Hymns or newer songs, piano or organ, your Bible translation and pew Bibles, how you preach and for how long, the invitation, and how often you share the Lord’s Supper and whether visitors may take part.',
    },
    {
      title: 'Getting in and getting around.',
      detail:
        'An accessible restroom, wheelchair spaces, steps inside, a hearing loop, large print. Five short answers.',
    },
  ],
  '/ministries/': [
    {
      title: 'Is this list right?',
      detail:
        'Kids, Youth, Sunday School, Bible study, music, prayer and fellowship are our drafts. Add, remove or rename any of them, with days and times.',
    },
    {
      title: 'Who leads each one, and where it meets.',
      detail:
        'A name and a room on every card turns this into something members use week to week. Only names of people who have said yes.',
    },
    {
      title: 'Youth on Wednesdays.',
      detail:
        'Your road sign mentions youth at 6:00, so we added a Youth card. What ages, what happens, and who leads it?',
    },
    {
      title: 'Children: ages, nursery and safety.',
      detail:
        'Parents look for this first. Is there a nursery, from what age, and what is your child safety policy (background checks, two adults in every room)?',
    },
    {
      title: 'Ways to serve.',
      detail:
        'Greeters, the children’s room, music, the food pantry, workdays and a prayer team are our guesses. Which teams are real, and who should people ask?',
    },
    {
      title: 'How the church serves its neighbors.',
      detail:
        'One or two real examples. Does the food pantry run through the year, and when is it open?',
    },
    {
      title: 'One person to ask for each ministry.',
      detail:
        'Every card now has an "Ask about ..." link to the contact form, with the ministry named in the message. Tell us who should get each one (a first name is enough), so it reaches the right person.',
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
    {
      title: 'The Watch page now lives here.',
      detail:
        'The live stream and the latest message sit at the top of this page, and the old Watch address comes here. The notes below came with it.',
    },
    {
      title: 'Facebook live, and YouTube?',
      detail:
        'The Watch band points to your Facebook page for the live stream. If you have or want a YouTube channel, the latest message can show here automatically.',
    },
    {
      title: 'What time does the stream start?',
      detail:
        'The live button says "Next live: Sunday 11:00 am", from the worship time in Site settings. Is that when the stream starts?',
    },
    {
      title: 'The passage, preacher and series on each sermon.',
      detail:
        'Each sermon page shows all three, and people can browse by series and book of the Bible once there are a few. The example sermon has none yet; the yellow lines on its page show where they go.',
    },
    {
      title: 'An audio recording, for the podcast.',
      detail:
        'The podcast fills itself from any sermon with an MP3 attached. If you can record Sunday’s message, people can listen in the car. A YouTube link also lets the video play right on the page.',
    },
  ],
  '/prayer/': [
    {
      title: 'A Church Trac prayer form?',
      detail:
        'If you take prayer requests in Church Trac, send us that form’s link and this page shows it instead, so requests land with your prayer list there.',
    },
    {
      title: 'Who should prayer requests go to?',
      detail:
        'Right now they would go to you alone, and the website keeps no copy. Should a prayer team see them too?',
    },
    {
      title: 'The prayer chain, and a call back.',
      detail:
        'The form now has two checkboxes: "You may share this with the prayer chain" (off unless someone checks it) and "I would like Pastor Jacob to call me". Is there a prayer chain, and who is on it?',
    },
    {
      title: 'Is a request ever read aloud or printed?',
      detail:
        'The page should say exactly where a request goes, so tell us if any are shared on a Sunday or in the bulletin.',
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
        'The Sunday and Wednesday times here come from the same list as the rest of the site. We added Youth on Wednesday at 6:00 from your road sign. Each one gets an "Add to calendar" link once its time is confirmed.',
    },
    {
      title: 'Put the big days in Church Trac early.',
      detail:
        'Homecoming, revival, VBS, Christmas Eve, Easter, the Thanksgiving meal and baptism Sundays. Added a month or two ahead, they show under "Coming up" here and on Home, and the church looks as busy as it is.',
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
      title: 'How gifts are cared for.',
      detail:
        'How the offering is counted, giving statements each January, whether the church votes on the budget, and a line on the Cooperative Program. A new section asks for each.',
    },
  ],
  '/next-steps/': [
    {
      title: 'A new page: what comes after a first Sunday.',
      detail:
        'Knowing Jesus, baptism, membership, a group and a place to serve, one step at a time. Most church sites have a page like this; it is in the menu and the footer.',
    },
    {
      title: 'Baptism and membership, in your words.',
      detail:
        'How someone is baptized here, and how they join the church: a class, a talk with you, a vote? Two or three sentences each.',
    },
    {
      title: 'Coffee with the pastor?',
      detail:
        'An easy first step some churches offer: a coffee to ask anything. Would you like to offer it? If not, we will drop the line.',
    },
    {
      title: 'Know Jesus: your verse.',
      detail:
        'Step one now stands on its own above the others. Which verse would you like there (Romans 10:9, or another), in the church’s translation?',
    },
  ],
  '/contact/': [
    CHURCH_TRAC,
    {
      title: 'When life happens.',
      detail:
        'Hospital visits, funerals, weddings and a hand when someone is struggling: the drafts at the foot of this page are ours. Tell us how each works here, and how to reach you in an emergency.',
    },
    {
      title: 'Can people text the church phone?',
      detail:
        'The site now says "Call or text" beside the number. If it cannot take texts, untick "This number takes texts" in Site settings > Church facts.',
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
      title: 'Is (513) 863-3500 still the church line?',
      detail:
        'It is the number on your Google listing and the local directories, so the site shows it with a "To confirm" tag. A Facebook post from the spring gave (513) 868-1412 instead. Which should people call, and who answers it?',
    },
    {
      title: 'Who reads prayer requests?',
      detail:
        'Contact now sends prayer requests to the prayer request page, which says Pastor Jacob reads every one. Should anyone else?',
    },
    {
      title: 'How quickly is a text answered?',
      detail:
        'Visitors said they would text before they called. A line like "Someone usually replies the same day, even Saturday" would help, if it is true.',
    },
  ],
  '/pastoral-care/': [
    {
      title: 'A new page: Need the pastor?',
      detail:
        'For a hard day: how to reach you after hours, hospital and homebound visits, funerals, weddings, the Lord’s Supper at home and help with a bill. Every line in brackets is yours to answer.',
    },
    {
      title: 'After hours.',
      detail:
        'Say Mom is taken to the hospital on a Saturday night: who should someone call, and may that number be on the site? A deacon is fine too.',
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
export function notesFor(pathname: string): JacobNote[] {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return NOTES[p] ?? [];
}

/** Every page with notes, for the one-page list we send Jacob. */
export function allNotes(): [string, JacobNote[]][] {
  return Object.entries(NOTES);
}
