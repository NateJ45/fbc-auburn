# Product

Design brief Part A for the First Baptist Church of Auburn website, filled from
`docs/templates/design-brief.md` on 2026-10-17. Visual system: `DESIGN.md`. References:
`docs/references/README.md`. Homepage directions: `docs/design-directions/2026-10-17-fbc-auburn/`.

## Register

brand

## Client and purpose

- **Client:** First Baptist Church of Auburn, a small Southern Baptist congregation at 4241
  Hamilton-Scipio Road in the hamlet of Auburn (Ross Township, near Hamilton, Ohio), in a season
  of revitalization.
- **Visitors:** mostly neighbours in Millville, Ross, Hamilton and nearby who are new to church or
  have been away a while, searching on a phone ("church near me", "Baptist church Hamilton Ohio"),
  often in the days before a Sunday or a holiday. Second, the congregation itself, checking times,
  events and the latest message.
- **The one job of the homepage:** a stranger knows when to come, where to park and what a Sunday
  is like, and feels welcome enough to come once.
- **Secondary jobs:** watch or catch up on a message (streamed on Facebook and TikTok today); find
  what is on this week; send a prayer request or a question.
- **Must be on the homepage:** Sunday times and the address with directions (times NOT yet
  confirmed with the church; every mockup marks them), a plain "what to expect" for a first visit,
  a short welcome in the pastor's voice, this week's events, links to Watch, Give and Prayer, and
  the social links (Facebook, TikTok).
- **Site map (11 pages, the church's own list):** Home, Plan Your Visit, About, What We Believe,
  Pastor and Leadership, Ministries, Sermons / Watch, Events, Give, Prayer Requests, Contact. The
  pastor edits the site himself, so every page is built from Studio blocks.

## Brand personality

- **Three words:** warm, steady, homemade (made with care by hand, like stones laid one by one).
- **The feeling a visitor leaves with:** "That looks like a real, friendly church, and I know
  exactly what Sunday morning will be like."
- **Voice:** plain and kind, first person plural from the church ("we", "come as you are"), short
  sentences, no church jargon without a gloss. Statements of belief are the pastor's words, never
  drafted from scratch by the studio.

## The brand (settled before the site)

- **Mark:** a round stone mosaic: a red stone cross with a gold heart, a ring of green and deep
  sky stones, sky and water wave bands (baptism) and gold stepping stones up to the cross. Lockups:
  horizontal, stacked, an Auburn-led lockup where "Auburn" is the big word, a small mark for under
  48 px, and an avatar (white small mark on a deep sky circle).
- **Everyday default is one colour.** Full colour is for the website's big moments, banners and
  the mark itself.
- **Type:** Young Serif (display) and Familjen Grotesk (text and UI). Auburn Stone, a Young Serif
  split into stones, sets stone headings at 40 px and up only.
- **Brand extras:** stone icons (Bible, coffee, music, map pin, clock, praying hands, giving hand,
  blocks), "First Baptist" stone lettering and a baptism graphic.

## References (what to learn from)

Captured with `npm run references`; screenshots and notes in `docs/references/README.md`.

| Reference                | What we like                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| hppres.org               | Serif headline carries the hero; one photo in an arched crop is enough |
| stpaulsknightsbridge.org | Service times as a calm typographic list, no cards                     |
| capitolhillbaptist.org   | The Sunday facts written out in sentences, high on the page            |
| trinitygracechurch.com   | Artwork stands in for photography, with very large serif type          |
| firstpresevanston.org    | A cross built from squares, the closest relative to the stone mark     |
| citychurchsf.org         | The photo-led model: one full-bleed photograph, minimal chrome         |

## Anti-references (what this must not feel like)

| Anti-reference                  | What we avoid and why                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Megachurch template sites       | Stage-lighting hero video, crowd shots, "experience" language; looks bigger than the church is |
| Stock-photo church sites        | Smiling stock families and coffee cups; the church has to look like itself                     |
| Mosaic-everything church brands | Multicolour tiles on every heading, icon and border; the mark loses its weight                 |

- **Must NOT look like First Baptist Church Muncie** (the last site from this starter): no cream
  paper-and-ink ground, no titling-caps serif masthead, no indigo and gold bands, no building drawn
  into the type, frames and glyphs, and not its homepage section order.
- **Generic defaults to avoid:** three equal feature cards, a centred headline over a gradient or
  stock photo, a giant "I'm new" banner that repeats the hero, autoplay video.

## Accessibility and constraints

- WCAG AA is the floor: text contrast 4.5:1 (3:1 for 24 px and up), visible focus, reduced motion
  respected, one `h1` per page, landmarks.
- Readers range from teenagers to retirees, often on older phones and patchy rural signal: body
  text 18 px or larger, tap targets 44 px, pages light enough to load on one bar.
- Gold (#E8A93A) and sky (#96C3EA) are never text on white; water (#3B83AA) is text on white only
  at 24 px and up. Stone headings are 40 px and up; anything smaller is plain Young Serif.
- Few photographs exist and a photo session is optional, so every layout must work with one photo
  or none. Children's photos and names appear only with signed releases and the pastor's say-so.
- Service times, the verse and every statement of belief are confirmed with the church before
  launch. Until then they are marked in drafts.

## Strategic design principles

- **Sunday facts over atmosphere.** When, where and what to expect come before any mood-setting.
- **Honest size over impressive size.** We show a small church truthfully rather than staging a big one.
- **One stone moment per page.** The mosaic appears once, large (the H1 or the mark); everything
  else is one colour. Restraint is what makes the mark feel special.
- **Type and art before photos we do not have.** A layout that needs ten good photos is a layout
  that will be filled with bad ones.
- **Built for one editor.** Every section is a Studio block the pastor can fill without help.
