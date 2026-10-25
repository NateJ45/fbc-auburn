// Foundation, edit with care
// =============================================================================
// GROQ for the sermon, people and downloads collections (FBC Auburn, 2026-10-18)
// =============================================================================
// Field lists and the page-builder arms for the four collection-fed blocks.
// Kept in a file with NO imports so src/lib/queries.ts (which splices the arms
// into SECTION_ARMS) and src/lib/collection-queries.ts (the route queries,
// which import queries.ts) can both use it without an import cycle.
//
// Expiry, the category filter's "all", sorting by derived dates and the limits
// are applied in src/lib/sermons.ts, not here, so they are unit-tested; the
// GROQ slices at fixed integer bounds (a block's own limit cannot be a GROQ
// slice bound; PORTS.md card 62).
//
// NOTE: no backticks in comments inside the template literals below.
// =============================================================================

const IMG = `{ ..., asset->, "alt": coalesce(alt, asset->altText, "") }`;
const FILE = `{
  "url": asset->url,
  "size": asset->size,
  "mimeType": asset->mimeType,
  "originalFilename": asset->originalFilename,
  "extension": asset->extension
}`;

/** One sermon, as every card, page, block and the podcast read it. */
export const SERMON_FIELDS = `{
  _id,
  title,
  "slug": slug.current,
  date,
  passage,
  service,
  summary,
  videoUrl,
  minutes,
  guestPreacher,
  "preacher": preacher->{ _id, name, role },
  "series": series->{ _id, title, "slug": slug.current, art${IMG} },
  "image": picture${IMG},
  "audio": audio${FILE},
  "notes": notes${FILE}
}`;

/** One series, with its dates and sermon count worked out from its sermons (rule 15). */
export const SERIES_FIELDS = `{
  _id,
  title,
  "slug": slug.current,
  book,
  description,
  art${IMG},
  "firstDate": *[_type == "sermon" && references(^._id) && defined(slug.current)] | order(date asc)[0].date,
  "lastDate": *[_type == "sermon" && references(^._id) && defined(slug.current)] | order(date desc)[0].date,
  "count": count(*[_type == "sermon" && references(^._id) && defined(slug.current)])
}`;

/**
 * One person. The email is projected only when "Show email" is ticked and the
 * location only when "Keep location private" was explicitly unticked, so
 * nothing the pastor chose to hide reaches a page.
 */
export const PERSON_FIELDS = `{
  _id,
  name,
  role,
  "group": group->{ _id, title, order },
  photo${IMG},
  bio,
  "email": select(showEmail == true => email),
  "location": select(keepLocationPrivate == false => location),
  order
}`;

export const DOWNLOAD_FIELDS = `{
  _id,
  title,
  date,
  category,
  note,
  expires,
  "file": file${FILE}
}`;

const NEWEST_SERMON = `*[_type == "sermon" && defined(slug.current)] | order(date desc)[0]${SERMON_FIELDS}`;

/** Spliced into the watchSection arm: the newest sermon, for the Watch card. */
export const LATEST_SERMON_FIELD = `"latestSermon": ${NEWEST_SERMON}`;

/** The four collection-fed blocks' arms, spliced into SECTION_ARMS in queries.ts. */
export const COLLECTION_SECTION_ARMS = `
    _type == "latestSermonSection" => {
      ...,
      "sermon": coalesce(
        select(mode == "pick" => sermon->${SERMON_FIELDS}),
        ${NEWEST_SERMON}
      ),
      "bibleVersion": *[_type == "sermonsPage"][0].bibleVersion
    },
    _type == "sermonSeriesSection" => {
      ...,
      "series": *[_type == "sermonSeries" && defined(slug.current)][0...48]${SERIES_FIELDS}
    },
    _type == "peopleSection" => {
      ...,
      "items": select(
        mode == "hand" => people[]->${PERSON_FIELDS},
        *[_type == "person" && defined(group._ref) && group._ref in ^.groups[]._ref][0...200]${PERSON_FIELDS}
      )
    },
    _type == "downloadsSection" => {
      ...,
      "items": *[_type == "download" && defined(file.asset) && (!defined(^.category) || ^.category == "all" || category == ^.category)] | order(date desc)[0...60]${DOWNLOAD_FIELDS},
      "bulletins": select(
        featureBulletin == true => *[_type == "download" && category == "bulletin" && defined(file.asset)] | order(date desc)[0...12]${DOWNLOAD_FIELDS}
      )
    }`;
