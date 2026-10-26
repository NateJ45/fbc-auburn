// Foundation, edit with care
// =============================================================================
// CMS content client - for the Studio-only PREVIEW path (/preview/*)
// (ported from presacademy 2026-08-28; original lineage: the WCP site)
// =============================================================================
// Unlike src/lib/sanity.ts (which reads once at BUILD time for the static
// public pages), this client runs per request on `prerender = false` preview
// routes and must read live DRAFT content, so the token comes from the Worker
// runtime env (`cloudflare:workers`), never from a build-time var. Never import
// this from a prerendered page.
//
// perspective/stega both switch on `draftMode`, which callers derive from the
// presence of the Presentation Tool's perspective cookie. There is deliberately
// no fallback argument here (unlike sanityFetch): a preview page should show
// real Sanity state, including empty and missing fields, so an editor notices a
// gap instead of silently seeing built-in fallback copy.
//
// FAILS CLOSED with no SANITY_TOKEN: the client is built without credentials
// and Sanity refuses the draft perspective, so the preview route errors rather
// than quietly serving published content dressed as a draft.
// =============================================================================
import { createClient, type SanityClient } from '@sanity/client';
import { env } from 'cloudflare:workers';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
export const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
export const apiVersion = (import.meta.env.PUBLIC_SANITY_API_VERSION as string) || '2026-05-01';

// -----------------------------------------------------------------------------
// Fresh-clone guard: FAIL CLOSED, but say why
// -----------------------------------------------------------------------------
// A clone of this template with no Sanity project and no runtime token still
// builds and still serves the whole public site (src/lib/sanity.ts falls back to
// the default sections). The preview stack cannot fall back to anything: with no
// project id the Sanity client constructor throws, and with no token the draft
// perspective is refused. Left alone that surfaces as a bare 500 with a stack
// trace in the Worker log, which reads like a bug in the template rather than
// "you have not set this up yet".
//
// So every preview entry point checks this first and answers with the two
// setup steps instead. Keep it a 503: the route is fine, the service behind it
// is not configured.
const PLACEHOLDER_IDS = new Set(['', 'your-project-id', 'placeholder', 'placeholder-project-id']);

/** Whether the preview routes can do anything at all in this environment. */
export function previewConfig(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!projectId || PLACEHOLDER_IDS.has(projectId.trim())) {
    missing.push('PUBLIC_SANITY_PROJECT_ID (build-time, .env)');
  }
  if (!(env as { SANITY_TOKEN?: string }).SANITY_TOKEN) {
    missing.push('SANITY_TOKEN (Worker runtime secret, .dev.vars locally)');
  }
  return { ok: missing.length === 0, missing };
}

/** The 503 every preview entry point returns when setup is incomplete. */
export function previewUnconfiguredResponse(missing: string[]): Response {
  return new Response(
    'Live preview is not configured yet.\n\n' +
      'Missing:\n' +
      missing.map((m) => `  - ${m}`).join('\n') +
      '\n\nSee .env.example and .dev.vars.example. The embedded Studio also needs\n' +
      'this origin on the project CORS allow list:\n' +
      '  npx sanity cors add <origin> --credentials\n',
    { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}

// -----------------------------------------------------------------------------
// NON_STEGA_FIELDS - the single most important list in the preview stack
// -----------------------------------------------------------------------------
// Fields chosen from a fixed dropdown or radio in the schema. NEVER free text an
// editor types, and never displayed as prose. They drive class and component
// selection in the renderers (SectionRenderer branches on `_type`, the section
// components branch on `align`, `columns`, `imageSide`, `variant`, ...).
//
// Stega encodes a ~1KB run of INVISIBLE marker characters into every string it
// touches so click-to-edit knows which field to open. On a display string that
// is the whole point; on one of these it silently breaks the exact-string
// comparison (`"left" + <markers>` !== `"left"`), so the preview mis-renders
// while the live static site is fine. Excluding them costs nothing: you pick
// these from a list, there is no text to click into.
//
// ADD ANY NEW LOGIC-DRIVING DROPDOWN FIELD HERE THE DAY YOU ADD THE FIELD.
// The list below was derived by scanning every `options: { list: ... }` field in
// src/sanity/schemaTypes/ on 2026-08-28, then padded with the names the rest of
// the family uses, so a section ported in from a sibling repo is covered on
// arrival.
// -----------------------------------------------------------------------------
const NON_STEGA_FIELDS = new Set([
  // Present in this template's schemas today (sections.ts, richSections.ts,
  // ctaBlock.ts, journalEntry.ts, announcement.ts, siteSettings.ts,
  // businessInfo.ts, testimonial.ts, faqItem.ts, page.ts, studioGuide.ts,
  // studioPlaybook.ts).
  'align',
  // FBC Auburn, 2026-10-17: imageTextSection's picture choice (photo, mark or baptism). The
  // stone-icon picker on stepsRailSection's steps is named 'icon', listed below.
  'art',
  'businessModel',
  // FBC Auburn, 2026-10-26: a short link's "Where does it go?" and "For now, or for good?".
  'linkKind',
  'lasting',
  'businessType',
  'category',
  'columns',
  // stepsRailSection steps: which Sunday gathering a step is (its time comes from Church facts).
  'gathering',
  // 2026-10-26: the page opener's style (arch or photo behind the words), and the time dropdowns
  // on Event details and Schedule (src/lib/builder-blocks.ts reads them as times).
  'heroStyle',
  'startTime',
  'endTime',
  // 2026-10-26: a popup's "Which pages" and "How often" (src/lib/popup.ts compares both).
  'where',
  'frequency',
  'heightHint',
  'imageSide',
  'layout',
  'linkType',
  // 2026-10-18: a content block's look (src/lib/section-looks.ts). The cadence
  // compares it to 'feature' / 'stone'; an encoded value would render Standard.
  'look',
  'navGroup',
  'platform',
  'size',
  'source',
  'sourceType',
  'style',
  'tone',
  'variant',
  'width',
  // Not in this template yet, but standard enum names across the site family.
  // Carried so a block ported from a sibling repo is not a preview-only bug
  // waiting to be found.
  'mediaSide',
  'mediaType',
  'padding',
  'overlay',
  'surface',
  'headingLevel',
  'format',
  'icon',
  'aspect',
  'ratio',
  // Appearance controls, 2026-08-28 (PORTS.md card 26). Audited field by field:
  //   headingAccent  NEW, and the sharpest case on this list: it is matched
  //                  against the heading with indexOf, so an encoded value
  //                  would never find its own word and the accent would
  //                  silently do nothing in the preview while the live page
  //                  showed it. src/lib/heading-accent.ts ALSO strips both
  //                  sides with plain() -- belt and braces, because that helper
  //                  runs on the live site too, where this list does not exist.
  //   columns        already listed above, and it is what the two NEW column
  //                  controls (valuesSection, dynamicListSection) are named.
  //   imageSide      already listed above; the wave rewords its Studio label
  //                  and touches nothing else.
  // Nothing else in this wave drives logic from a string: the `subheadRich`
  // twins are portable text meant to be clicked into, so they KEEP their stega,
  // and this template adds no surface or accent COLOUR enum at all (see
  // src/lib/surfaces.ts for why).
  'headingAccent',
  // Church facts on Site settings, 2026-10-17 (src/sanity/schemaTypes/
  // churchFacts.ts). `day` is a dropdown the "This Sunday" line branches on;
  // `time` is parsed as HH:MM; the channel id and the calendar feed are put
  // into fetch URLs. An encoded value would break all four in the preview.
  'day',
  'time',
  'youtubeChannelId',
  'churchTracIcalUrl',
  // 2026-10-18 (visitor audit): links that become hrefs and an empty-or-not switch.
  'givingUrl',
  'liveStreamUrl',
  // The collections, 2026-10-18 (sermons.ts, collectionSections.ts, downloads.ts): which sermon /
  // which people a block shows, the service and the series' book (compared and filtered on),
  // the translation and podcast category (put into URLs and the feed). `category` is above.
  'mode',
  'service',
  'book',
  'bibleVersion',
  'podcastCategory',
  'videoUrl',
  // 2026-10-18, the church section library (churchSections.ts) and the form builder (form.ts).
  // Dropdowns the blocks branch on, dates and keywords compared at build time, and links that
  // become hrefs or player addresses. church-blocks.ts ALSO strips each one with plain(), because
  // that code runs on the live site too, where this list does not exist.
  'urgency',
  'translation',
  'recipient',
  'startDate',
  'endDate',
  'asOf',
  'keywords',
  'signupUrl',
  // Custom code, 2026-10-18 (PORTS.md card 121). embedCode is code, not prose:
  // invisible markers appended to it would land inside the pasted widget (in
  // its box, or on the page with the switch on), and there is no text in it to
  // click into. runsOnPage is a boolean that picks the render branch; stega
  // leaves booleans alone today, listed so the rule 8b audit finds it.
  'embedCode',
  'runsOnPage',
  // A different Sunday, 2026-10-26 (churchFacts.ts `timeChanges`): `change` is the dropdown the
  // times branch on and `date` is compared with the build's day. `service` and `time` are above.
  'change',
  'date',
]);

export function getPreviewClient(draftMode: boolean): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: (env as { SANITY_TOKEN?: string }).SANITY_TOKEN,
    perspective: draftMode ? 'drafts' : 'published',
    stega: {
      enabled: draftMode,
      studioUrl: '/studio',
      // Encode display strings (click-to-edit) but skip the dropdown fields
      // above, whose exact values are used in rendering logic.
      filter: (props) =>
        NON_STEGA_FIELDS.has(String(props.sourcePath.at(-1))) ? false : props.filterDefault(props),
    },
  });
}

/** Run a GROQ query with the draft-aware preview client. */
export async function previewFetch<T>(
  draftMode: boolean,
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getPreviewClient(draftMode).fetch<T>(query, params);
}
