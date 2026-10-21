# The Studio plan: who edits, what they do, and where they do it

Written 2026-10-19. This is the map from the church's real jobs to the Studio surface that serves each one. When a
job changes, change this page and the surface together. The Studio kit itself is described in `studio-kit.md`; the
settings for this church are in `src/sanity/kit.config.ts`.

## Who edits

| Who                                        | Role in the Studio                                                                                | Skill                                            | Device                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| The pastor                                 | Administrator; goes in `staff` in `kit.config.ts` (the plain view) once he accepts his invitation | Comfortable with a phone, new to website editing | Mostly his phone, between other work; a computer for longer jobs |
| A church volunteer or staff member (later) | Editor, staff view (`staffTools`)                                                                 | Varies; assume a first-timer                     | Phone or a church office computer                                |
| Nathan                                     | Administrator, full Studio                                                                        | Developer                                        | Desk                                                             |

What follows is written for the first two. The pastor is bivocational, so every weekly job has to fit into a few
minutes on a phone, and nothing may need remembering from one week to the next: Home and the Site Guide remember for
him.

## Weekly jobs

| Job                            | When                     | Main surface                                                                | Also                                                                      | Guide                            | Picture or video                                                                    |
| ------------------------------ | ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Add Sunday's sermon            | Sunday afternoon, Monday | Quick update: "Add Sunday's sermon link"                                    | Home big button; Sunday checklist; Content > Sermons for audio and notes  | `add-sermon`                     | shot to capture at launch (`sermon-form`); video script, record at launch           |
| Put up the bulletin            | Midweek                  | Home big button "Put up this week's bulletin" (new download, Kind Bulletin) | Sunday checklist; Content > Downloads                                     | `bulletin`                       | shot to capture at launch (`bulletin-form`); video script, record at launch         |
| Notices (a line on every page) | When needed              | Quick update: "Put up a notice"; "Cancel or change something this week"     | Content > Notices to change or switch off; Checkup flags ended ones       | `put-up-a-notice`, `snow-sunday` | shot to capture at launch (`quick-notice-form`)                                     |
| Events                         | Midweek                  | Church Trac (the calendar); Quick update: "Tell people about an event"      | RSVP section on a page, RSVPs tool; the newsletter lists events by itself | `tell-about-an-event`, `rsvps`   | shot to capture at launch (`quick-event-form`); video script, record at launch      |
| RSVPs                          | Before an event          | RSVPs tool (counts, list, spreadsheet)                                      | RSVP section on the event's page                                          | `rsvps`                          | none yet (needs email switched on)                                                  |
| Prayer requests and messages   | Any day                  | Messages tool (prayer request words go to email only, never the Studio)     | The prayer request form on a page                                         | `messages`, `prayer-requests`    | none yet (needs forms switched on)                                                  |
| News post                      | When there is news       | Quick update: "Write a short news post"                                     | Content > News and notes for a longer post with pictures                  | `news-post`                      | shot to capture at launch (`quick-post-form`); video script, record at launch       |
| Newsletter                     | Thursday or Friday       | Quick update: "Start this week's newsletter" (saved, not sent)              | The full editor to send a test, then send to everyone                     | `send-the-newsletter`            | shot to capture at launch (`quick-newsletter-form`); video script, record at launch |
| Photos                         | After an event           | Quick update: "Post a photo" (a draft)                                      | Gallery on any page                                                       | `post-a-photo`                   | shot to capture at launch (`post-photo`); video script, record at launch            |
| Keep an eye on things          | Monday                   | Home: Sunday checklist, Is it live?, Checkup                                |                                                                           | `your-week`, `sunday-checklist`  | shot to capture at launch (`sunday-checklist`)                                      |

The Site Guide's "Every week" category holds all of these, in that order of use, so it opens on them.

## Monthly and seasonal jobs

| Job                                      | Surface                                                   | Guide                                 |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| Start a sermon series                    | Content > Sermons > Sermon series                         | `sermon-series`                       |
| A seasonal page (Easter, Christmas, VBS) | Content > Pages, "+" with a page template; saved sections | `page-templates`, `seasonal-patterns` |
| Snow Sunday or a closing                 | Quick update: "Cancel or change something this week"      | `snow-sunday`                         |
| Change the service times or the address  | Home big button; Site settings > Church facts             | `church-facts`                        |
| Add or update a person (staff, deacons)  | Content > People                                          | `add-person`                          |
| Menus and footer                         | Home > Your pages > Site-wide > Menus                     | `menus-and-footer`                    |
| Forms (a new sign-up, a prayer form)     | Content > Forms                                           | `make-a-form`                         |
| Tidy up (old notices, the Checkup)       | Checkup tool                                              | `housekeeping`                        |

## What Quick update covers now

Post a photo, Put up a notice, Add Sunday's sermon link, Cancel or change something this week, Tell people about an
event, Write a short news post, Start this week's newsletter. Each is a few boxes and one green button; the builders
are in `src/lib/quick-updates.ts` and tested in `quick-updates.test.ts`. Everything is published straight away except
the photo (a draft) and the newsletter (published, never sent until he presses Send).

**Not in Quick update, and why** (notes for the shared kit, starter card 137):

Card 137 added the missing pieces, and Quick update now also holds (2026-10-19):

- **Put up this week's bulletin**: a `create` job with a PDF box, the Sunday it is for and a title. It makes a
  published download of kind Bulletin. (An `upload` job puts a file into one existing document, and the bulletin is a
  new download each week, so it is `create`.) Home's big button still opens the full editor.
- **Messages** and **RSVPs**: `link` tiles that open those tools.
- **Send the newsletter**: a `link` tile that opens the Newsletter list. Sending stays on the issue itself, which
  keeps its test-first safeguards; Quick update never sends mail.

## Guides, field help, pictures

- New guides (2026-10-19): `your-week`, `put-up-a-notice`, `tell-about-an-event`, `news-post` in
  `src/sanity/guides/weekly.ts`; the sermon guide gained "Copying the video link" and the bulletin guide "From your
  phone".
- "How to" chips (card 134) on the fields people get wrong: the bulletin `file`, any `videoUrl`, a post's `excerpt`,
  `givingUrl`, the newsletter's `preheader`, an RSVP's `capacity` (16 in all, the gate's limit).
- **Pictures wait for launch** (decided 2026-10-19): the site still has placeholder content and stand-in photos, so
  new captures would go stale. The eight card 130 captures stay as they are. Every "shot to capture at launch" in the
  table above is a key to add to `src/sanity/guides/shots.ts` and a `{ kind: 'shot', key }` block to put back in its
  guide, captured from the real Studio once the content is real. Two existing captures are already out of date and
  need retaking then: `quick-update` (shows four tiles; there are now seven) and `home-tiles` (shows "Edit the
  menus", now "Put up this week's bulletin").

## Tours (wired with card 137) and video scripts (recorded at launch)

`src/sanity/studio-tours.ts` holds the tours, as card 137 data: a first-run welcome for the pastor (role `editor`)
and a shorter one for staff, the Home and Quick update "How this screen works" tours, walk-throughs for the sermon,
bulletin and newsletter editors (started with `startTour('<id>')`), and the "What's new" entry. The Phase A stops
that were marked `needsHook` use the kit's hooks (`home-this-week`, `home-quick-actions`, `quick:<form id>`,
`newsletter-send-everyone`); a stop with no anchor is centred. `src/sanity/guides/tours.ts` keeps the six video
scripts (sermon, bulletin, event, photo, newsletter, news post) with sample data and a caption for every shot; the
videos are recorded at launch from them.

## Ideas, not built

- Add "Start this week's newsletter" to the Sunday checklist once email is switched on (today it could never tick).
- A Monday "last week on the website" card on Home: visitors, the sermon's plays, new sign-ups.
- A "This Sunday" preview card on Home showing exactly what the home page's This Sunday card will say.
- Read new messages count on the Quick update screen.
- Duplicate last week's newsletter in one tap, carrying the closing note.
