# The content pages: what each one is for, and the rules they keep

Added 2026-10-25 from the site audit (a pastor's read, a first-time visitor's walk-through and a UX
review). Page copy lives in Sanity; the structure below was set by
`scripts/content/audit-pages.mjs` (dry by default, `--apply` plus `NCS_PRODUCTION_WRITE=yes` to
write). Edit the words in the Studio, but keep the block keys: anchors hang off them.

## Rules every content page keeps

- **The copy is finished, and the beliefs wait on the pastor's yes** (2026-11-19,
  `scripts/content/finished-copy.mjs`; it replaced the marked `[Placeholder: ...]` drafts of
  2026-11-09). Facts and voice come from the church's own public posts (its Facebook page and the
  pastor's sermon clips: the times, the Wednesday meal and studies, Easter, the movie nights, the
  coat giveaway, the Christmas gifts and program, the road sign, the ramp). Belief comes from the
  Baptist Faith and Message 2000 (the confession the page says the church affirms), with verses in
  the King James wording the posts quote, and practice the posts do not show (the invitation, who
  takes the Lord's Supper, joining) is written the usual Southern Baptist way. What we believe and
  those practice lines read as settled, so they must not launch until Jacob has approved them
  (`docs/PENDING.md` 1zt). **A fact no post gives stays a `[Jacob: ...]` ask, never a guess**:
  the child safety sentence, the nursery, access inside the building, office hours and email, who
  counts the offering, the budget vote, a music team, leaders' names. **No bracket survives launch.**
  The sources read are listed in the studio's private notes, not here.
- **Facts are never typed.** Times, the address and the phone come from Church facts through
  blocks: the Sunday times band (`heroSection.showTimes`), Contact details (`contactCardSection`),
  Map and directions (`mapSection`), This Sunday. The Plan your visit walk keeps two loose times
  ("About 10:45", "11:00") because the pastor asked for exactly that; they are the one exception.
- **American spelling** (baptized, neighbors, color, around a table). The content script's
  spelling pass (`americanize()`) covers every document; run it again after a large paste.
- **Two contact verbs.** "Ask a question" (`/contact/?topic=question`, optionally
  `&about=<a few words>`, which the form puts at the start of the message) and "Tell us you are
  coming" (`/contact/?visit=sunday-11`, which also becomes the Church Trac connection card once
  one is set, `src/lib/church-links.ts`).
- **One child safety sentence, worded the same everywhere**: Plan your visit's Your kids, and the
  Kids and The children's room cards on Ministries. Since 2026-11-19 all three hold the same ASK
  (`SAFETY_ASK` in `finished-copy.mjs`), not a guess: it must be exactly true, so only Jacob can
  give it. When he answers, put his sentence in all three.
- **One prayer path.** Prayer requests go through the Prayer page's form (`form-prayer`, mode
  `prayer`): emailed to the pastor, and the website deletes its copy once the email has gone
  (`src/pages/api/form.ts`). The form says so once, beside the button (`FormBlock.astro`). Contact
  points prayer requests there; the Privacy policy says the same. Contact messages ARE kept, and
  the Privacy policy says that too, so the three never disagree.
- **No crisis band** (Nathan, 2026-10-26): the 988/911 notice ("If it cannot wait") was removed from
  the Prayer page (`pr-crisis`) and Need the pastor? (`pc-crisis`); backups of both pages were kept.
  Notices can still make 988 and 911 tap-to-call if one is added back.

The four sections named with a key above were added 2026-11-09 by
`scripts/content/borrowed-shapes.mjs`, shapes borrowed from a large church's site and filled with
marked drafts, finished on 2026-11-19. A stepping-stone step takes one of eight icons only (the list in
`auburnMotionSections.ts`); `npm run audit:data` says so if another is used.

## Named anchors

A section whose block key is in `src/lib/church-anchors.ts` gets that name as its heading id
(SectionRenderer), with `scroll-margin-top` so the sticky header does not cover it
(`src/styles/board.css`). Other sections keep their numbered ids.

| Link                               | Block key     | Used by                                     |
| ---------------------------------- | ------------- | ------------------------------------------- |
| `/what-we-believe/#the-gospel`     | `wwb-short`   | Home "The good news", Next steps Know Jesus |
| `/what-we-believe/#baptism`        | `wwb-baptism` | The "Baptism and the Lord's Supper" card    |
| `/what-we-believe/#baptist`        | `wwb-baptist` | (free to link)                              |
| `/plan-your-visit/#kids`           | `pyv-kids`    | Home's Worship step, the walk's kids stop   |
| `/plan-your-visit/#worship`        | `pyv-worship` | (free to link)                              |
| `/plan-your-visit/#getting-around` | `pyv-here`    | (free to link)                              |
| `/plan-your-visit/#questions`      | first FAQ     | `/faq/` forwards here (SectionRenderer)     |
| `/pastoral-care/#reach`            | `pc-reach`    | (free to link)                              |

## The pages, in order

- **Home** (`homePage`, drawn by HomeBoard): hero (the welcome is the one "Come as you are"; the
  subhead is the church's Facebook bio, "everyone is family and loves the Lord"; second button
  "Watch a sermon" to `/sermons/`; an optional silent Background video plays over the photo, see
  `docs/agent/animation.md`), Your first Sunday (Sunday School explained and optional; Worship links
  to `#kids`), **The good news** (`home-gospel`, since 2026-11-19 a Cards with stone icons block in
  the Brick wall look: four numbered stones on the navy brick wall, the finished gospel of
  `wwb-short` in four parts with a verse each, the last stone linking to `#the-gospel`; drawn by
  IconCards through SectionRenderer, not as a Home band), A place to belong, This week and Last
  Sunday (to `/sermons/`), Meet Pastor Jacob (his hello in the first person), Other ways in (giving
  says Sunday or by mail until online giving is live).
- **Plan your visit**: page head with the Sunday times band (times, address, Directions), Good to
  know (what to wear, about an hour, nobody puts you on the spot), Your kids (the nursery and the
  child safety sentence are asks), By age (`pyv-kids-ages`: a nursery ask, children, students), Walk
  in with us (no exact minutes; Sunday School invited as optional), What worship is like, Getting in
  and getting around (the ramp; access inside is an ask), Find us (map; the note names the road
  sign, which reads "Auburn Baptist Church"), Questions people ask (only what the page does not
  already answer), the closing band.
- **About**: Who we are, A year with us (`about-timeline`: Easter, summer, fall, Christmas and
  every week, from the church's posts; it had blank years until 2026-11-19), **A Sunday here** (and
  a photo slot), Our building, the mark in one line, Come and see.
- **What we believe**: The gospel, first (`#the-gospel`), How to begin (`wwb-abc`: Admit, Believe,
  Confess), the beliefs, Baptism (`#baptism`, the card links to it), Questions about baptism
  (`wwb-baptism-faq`, six `faq-baptism-*` questions), **What it means to be Baptist**, the
  confession, the closing band. The whole page waits on the pastor's approval (PENDING 1zt).
- **Next steps**: **Know Jesus** set apart above the rail (Romans 10:9, a link to the gospel, "Tell
  Pastor Jacob"), then baptism, membership, a group and serving, each "Ask about ..." prefilled.
- **Leadership**: the pastor (photo slot, his TikTok named as his), How we are led (congregational;
  names Pastor Rick; deacons only with permission, an ask), Contact details (office email and hours
  once they are in Church facts).
- **Prayer requests**: page head (who reads it), the form (prayer chain box off by
  default, "call me" box and an optional phone), and a band to Need the pastor?.
- **Need the pastor?** (`page-pastoral-care`, `/pastoral-care/`, new): Call and Text first, How to reach
  him (office hours are an ask), Contact details, When life happens (hospital and home, the Lord's
  Supper at home, a funeral, a wedding, a hand when you need it), and a band to the Prayer page.
  Contact's "When life happens" now holds two cards that lead here and to Prayer, and Ministries'
  "When life happens" card links here.
- **Contact**: on phones a "Call or text" line leads the form (`src/components/sections/ContactFormSection.astro`, from
  Church facts).
- **Give** (a Studio page since 2026-10-26, `page-give`): How gifts are cared for, as a text
  section: giving as worship, the Cooperative Program, and two asks (counting and statements, the
  budget vote). Answer them in the section before launch, or remove them.

Each page's asks are also in its "For Jacob" pill (`src/data/client-notes.ts`); photo slots are in
`src/data/shot-list.ts`, keyed by the heading, so a renamed heading needs its key renamed too.
