# The content pages: what each one is for, and the rules they keep

Added 2026-10-25 from the site audit (a pastor's read, a first-time visitor's walk-through and a UX
review). Page copy lives in Sanity; the structure below was set by
`scripts/content/audit-pages.mjs` (dry by default, `--apply` plus `NCS_PRODUCTION_WRITE=yes` to
write). Edit the words in the Studio, but keep the block keys: anchors hang off them.

## Rules every content page keeps

- **Doctrine is Jacob's.** No statement of belief (the gospel, baptism, the Lord's Supper, what makes
  the church Baptist) is ever drafted for him: the page carries a `[Jacob: ...]` ask listing what
  to cover, and nothing else. A `[Placeholder: ...]` draft is only for warm, non-factual copy.
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
- **One child safety ask, worded the same everywhere** (`SAFETY_ASK` in the content script): Plan
  your visit's Your kids, and the Kids and The children's room cards on Ministries. When Jacob
  answers, put the same sentence in all three.
- **One prayer path.** Prayer requests go through the Prayer page's form (`form-prayer`, mode
  `prayer`): emailed to the pastor, and the website deletes its copy once the email has gone
  (`src/pages/api/form.ts`). The form says so once, beside the button (`FormBlock.astro`). Contact
  points prayer requests there; the Privacy policy says the same. Contact messages ARE kept, and
  the Privacy policy says that too, so the three never disagree.
- **The crisis line**, a "Good to know" notice on the Prayer page and on Need the pastor?: "If you
  are in danger or thinking of harming yourself, call or text 988, or call 911."

## Named anchors

A section whose block key is in `src/lib/section-anchors.ts` gets that name as its heading id
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
  subhead asks Jacob for one honest line about size, music and who comes; second button "Watch a
  sermon" to `/sermons/`), Your first Sunday (Sunday School explained and optional; Worship links
  to `#kids`), **The good news** (`home-gospel`, a Text block drawn by SectionRenderer inside the
  board, an ask plus a link to `#the-gospel`), A place to belong, This week and Last Sunday (to
  `/sermons/`), Meet Pastor Jacob, Other ways in (giving says Sunday or by mail until online giving
  is live).
- **Plan your visit**: page head with the Sunday times band (times, address, Directions), Good to
  know (what to wear, about an hour, nobody puts you on the spot), Your kids, Walk in with us (no
  exact minutes; Sunday School invited as optional), What worship is like (asks), Getting in and
  getting around (access asks), Find us (map), Look for the sign, Questions people ask (only what
  the page does not already answer), the closing band.
- **About**: Who we are (plus an ask for something only Auburn could say), **A Sunday here** (asks
  and a photo slot), Our building, the mark in one line, Come and see.
- **What we believe**: The gospel, first (`#the-gospel`), the beliefs, Baptism (`#baptism`, the card
  links to it), **What it means to be Baptist** (asks only), the confession, the closing band.
- **Next steps**: **Know Jesus** set apart above the rail (Jacob's verse, a link to the gospel, "Tell
  Pastor Jacob"), then baptism, membership, a group and serving, each "Ask about ..." prefilled.
- **Leadership**: the pastor (photo slot, a hello-video ask, his TikTok named as his), How we are
  led (congregational government ask, deacons with permission), Contact details (office email and
  hours once they are in Church facts).
- **Prayer requests**: page head (who reads it), the crisis line, the form (prayer chain box off by
  default, "call me" box and an optional phone), and a band to Need the pastor?.
- **Need the pastor?** (`page-pastoral-care`, `/pastoral-care/`, new): the crisis line, How to reach
  him (after-hours and office asks), Contact details, When life happens (hospital and home, the
  Lord's Supper at home, a funeral, a wedding, a hand when you need it), and a band to the Prayer
  page. Contact's "When life happens" now holds two cards that lead here and to Prayer, and
  Ministries' "When life happens" card links here.
- **Contact**: on phones a "Call or text" line leads the form (`src/pages/contact.astro`, from
  Church facts); the intro note asks Jacob how fast a text is answered.
- **Give** (`src/pages/give.astro`, code): How gifts are cared for, Jacob's asks on counting,
  statements, the budget vote and the Cooperative Program. It shows only while
  `PRE_LAUNCH_NOTES` is true; write his answers into the page before launch or it disappears.

Each page's asks are also in its "For Jacob" pill (`src/data/for-jacob.ts`); photo slots are in
`src/data/shot-list.ts`, keyed by the heading, so a renamed heading needs its key renamed too.
