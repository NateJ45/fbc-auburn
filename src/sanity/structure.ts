// Studio Desk structure. "Our church at a glance" and Site settings at the top,
// then ALL page singletons (one document each) under "Pages", then the reusable
// content collections under "Content", then "News and notes".
//
// Names (FBC Auburn, 2026-10-18): one name per thing, matching the public site.
// News and notes / Posts (code: journal, journalEntry), Questions / Question
// groups (faqItem, faqCategory), Notices (announcement), Page not found
// (notFoundPage), Saved sections (sectionPreset). Every document type is placed explicitly so nothing
// floats loose at the desk root. The trailing default-list filter is a safety net
// for any future type that hasn't been placed (and hides sanity-plugin-media's
// media.tag type, which would otherwise show at the root).
//
// "Pages" is one list (so the rule for editors is simple: every page lives here).
//
// Orderable lists: service / philosophyPoint use the orderable-document-list plugin.
// Editors drag rows to reorder; the plugin writes an `orderRank` string. GROQ
// queries order by orderRank (with displayOrder fallback) so the site mirrors Studio.
//
// Preview: 2026-08-28 the per-document iframe tab (sanity-plugin-iframe-pane)
// was retired in favour of the Presentation tool, which renders the SSR
// /preview/* routes with click-to-edit and in-canvas section controls. The
// singleton list items below therefore carry the plain form view, and
// "see it on the page" is the Presentation tool in the navbar.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import ChurchOverview from './components/ChurchOverview';
import BrandKit from './components/BrandKit';
import { DownloadsIntro, PeopleIntro, SermonsIntro } from './components/CollectionIntro';
import { staffDesk } from './kit/shared';
import { trashListItem } from './kit/trash';
import { brandIcon, typeIcon, type BrandIcon } from './brandIcons';
import { emptyAwareList } from './kit/emptyList';
import { WEEK_TYPE } from '../lib/studio-kit';
import { tableListItem } from './workflow';
import { TABLES } from './tables.config';
import { kitConfig } from './kit.config';
import { TRASH_TYPE } from '../lib/studio-trash';
import { privateDocId } from '../lib/private-pages';
import { OWN_NEWSLETTER } from './ownNewsletter';

const SINGLETON_TYPES = [
  'siteSettings',
  'businessInfo',
  // Core pages
  'homePage',
  'aboutPage', // scaffold: about
  'faqPage', // scaffold: faq (hidden: no desk item; /faq/ forwards to Plan your visit)
  'contactPage',
  'journalPage', // scaffold: journal
  'notFoundPage',
  'privacyPage',
  'sermonsPage',
  // Kept registered but not shown: a document exists (see the note in the desk).
  'studioGuide',
] as const;

const ORDERABLE_TYPES = [] as const;

const HIDDEN_FROM_DEFAULT = new Set<string>([
  ...SINGLETON_TYPES,
  // FBC Auburn (2026-10-18): the starter's business details (service areas,
  // travel fees). No document exists; the type stays because src/lib/queries.ts
  // still reads it (and gets nothing). Not shown in the desk.
  'businessInfo',
  ...ORDERABLE_TYPES,
  'announcement', // placed explicitly under Content → Notices
  'popup', // placed explicitly under Content → Popups, after Notices
  'faqItem', // scaffold: faq
  'faqCategory', // scaffold: faq
  'journalEntry', // scaffold: journal
  'journalCategory', // scaffold: journal
  // The collections (2026-10-18), placed under Sermons, People and Downloads.
  'sermon',
  'sermonSeries',
  'person',
  'personGroup',
  'download',
  'page', // custom pages, placed explicitly under "Pages"
  'privatePage', // private pages (card 122), placed explicitly under "Pages"
  'sectionPreset', // saved sections, placed explicitly under "Pages"
  'redirect', // placed explicitly under "Pages" -> Redirects
  'shortLink', // placed explicitly under "Pages" -> Short links
  'form', // the form builder, placed explicitly under Content -> Forms
  'newsletter', // card 127, placed explicitly under Content -> Newsletter
  TRASH_TYPE, // the Studio kit's Trash, placed explicitly at the bottom
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
  // The Studio kit's weekly tick document (card 111): Home's bookkeeping, never edited here.
  WEEK_TYPE,
  // Private preview link records (card 117): managed from "Share a preview" only.
  'previewShare',
  // processStep is placed explicitly under Content → Process Steps
]);

/**
 * Build a singleton list item pinned to one document id.
 *
 * The name is historical: it used to attach an iframe preview view alongside
 * the form. Since 2026-08-28 the live draft preview is the Presentation tool
 * (src/sanity/resolve.ts maps every one of these types to a /preview path), so
 * the editor pane is the form. Views are still set explicitly because
 * S.document().views([...]) bypasses defaultDocumentNode in sanity.config.ts,
 * and that is where the per-type extra tabs are added.
 */
function singletonWithPreview(
  S: StructureBuilder,
  schemaType: string,
  title: string,
  icon: BrandIcon = typeIcon(schemaType),
) {
  // The id is the document id ON PURPOSE: an intent link ("open the About
  // page", from the Studio kit's Home and Checkup) resolves to the path
  // pages;aboutPage, and a title-derived id ("about") left that pane blank.
  return S.listItem()
    .id(schemaType)
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .schemaType(schemaType)
        .documentId(schemaType)
        .views([S.view.form().title('Edit')]),
    );
}

// The Studio kit's staff view hides kitConfig.staffHiddenPanes from this desk
// (src/sanity/kit/shared.tsx, staffDesk); everyone else sees all of it.
export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  staffDesk(fullDesk(S, context), context, kitConfig);

// Empty lists say what goes there (card 111, emptyAwareList in kit/emptyList.tsx): while a
// list the pastor keeps has nothing in it, it opens on a short note and a "Create the first
// one" button instead of Sanity's bare "No documents of this type". Same ids as before, so
// every link into these lists keeps working.
const fullDesk = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .title('Content')
    .items([
      // FBC Auburn (2026-10-18): ONE help entry. The guides (PORTS.md card 41,
      // src/sanity/guides/content.ts) live in the Site Guide tool in the top bar
      // and in "Help for this page"; the desk's old "Help & Guide" list and the
      // starter's "Start Here" panels (the studioGuide handbook, full of
      // business-starter text, and "Your business at a glance") are gone from
      // here. The studioGuide type stays registered because a document of it
      // still exists; it is simply not shown.
      //
      // First instead: the church's own facts, read live (ChurchOverview.tsx).
      S.listItem()
        .id('church-at-a-glance')
        .title('Our church at a glance')
        .icon(brandIcon('times'))
        .child(
          S.component(ChurchOverview).id('church-at-a-glance-view').title('Our church at a glance'),
        ),
      S.listItem()
        .id('brand-kit')
        .title('Brand colors and fonts')
        .icon(brandIcon('brandKit'))
        .child(S.component(BrandKit).title('Brand colors and fonts')),

      S.divider(),

      // Site settings: pinned singleton (no preview; not a page)
      singletonWithPreview(S, 'siteSettings', 'Site settings'),

      S.divider(),

      // Pages — every page singleton lives here. The id is load-bearing
      // (kit.config.ts links to 'pages;page').
      S.listItem()
        .id('pages')
        .title('Pages')
        .icon(brandIcon('pages'))
        .child(
          S.list()
            .title('Pages')
            .items([
              singletonWithPreview(S, 'homePage', 'Home'),
              singletonWithPreview(S, 'aboutPage', 'About'), // scaffold: about
              // No "Questions" page here since 2026-10-24: it was merged into Plan your visit, where
              // the questions show as "Questions (open and close)" sections, and /faq/ forwards there.
              singletonWithPreview(S, 'contactPage', 'Contact'),
              singletonWithPreview(S, 'journalPage', 'News and notes (the list page)'), // scaffold: journal
              singletonWithPreview(S, 'notFoundPage', 'Page not found'),

              S.divider(),

              singletonWithPreview(S, 'privacyPage', 'Privacy policy'),

              S.divider(),

              // Custom pages: editors build these themselves from the section library.
              // Multi-instance (not a singleton), so it is a normal document list.
              emptyAwareList(S, context, {
                id: 'page',
                type: 'page',
                title: 'Custom pages (build your own)',
                icon: typeIcon('page'),
                explain:
                  'Pages you build yourself: a ministry, an event, a sermon series. Start from a template and change the words.',
              }),

              // Private pages (PORTS.md card 122): only people with the
              // password can open them. EVERY ONE IS STORED UNDER THE
              // privatePage. ID PATH, which Sanity never serves to the public
              // API, and this child resolver is what does it: a new page made
              // from this list gets a fresh id, and the editor opens it as
              // privatePage.<that id>. Existing rows already carry the prefix.
              // The global "Create" menu and Duplicate are switched off for
              // this type in sanity.config.ts so nothing makes one elsewhere.
              S.listItem()
                .id('privatePage')
                .title('Private pages (password)')
                .icon(typeIcon('privatePage'))
                .schemaType('privatePage')
                .child(
                  S.documentTypeList('privatePage')
                    .title('Private pages')
                    .child((id: string) =>
                      S.document().schemaType('privatePage').documentId(privateDocId(id)),
                    ),
                ),

              S.divider(),

              // Saved sections: one band of a page, kept for reuse. Made from a
              // page's publish menu ("Save a section as preset..."), added to a
              // page from the Saved sections group in the Presentation
              // navigator. Ordered by name, because the name is the only way
              // you find one again.
              S.documentTypeListItem('sectionPreset')
                .title('Saved sections')
                .icon(typeIcon('sectionPreset')),

              S.divider(),

              // Redirects: old address -> new address. Most entries are filed
              // automatically when a page's web address changes on publish
              // (src/sanity/components/slugRedirect.tsx); the editor adds one by
              // hand for an address that never existed on this site.
              S.documentTypeListItem('redirect')
                .title('Redirects (old links)')
                .icon(typeIcon('redirect')),

              // Short links (2026-10-26): /vbs, /easter, for bulletins and QR
              // codes. Made here or from Quick update; src/lib/short-links.ts.
              S.documentTypeListItem('shortLink')
                .title('Short links (like /vbs)')
                .icon(typeIcon('shortLink')),
            ]),
        ),

      S.divider(),

      // Content — reusable collections. Orderable types get drag-and-drop;
      // non-orderable use standard lists.
      S.listItem()
        .id('content')
        .title('Questions, notices and forms')
        .icon(brandIcon('content'))
        .child(
          S.list()
            .title('Questions, notices and forms')
            .items([
              // scaffold: faq
              emptyAwareList(S, context, {
                id: 'faqCategory',
                type: 'faqCategory',
                title: 'Question groups',
                icon: typeIcon('faqCategory'),
                explain:
                  'Headings that gather the questions, like "Sunday mornings" or "Children".',
              }),
              emptyAwareList(S, context, {
                id: 'faqItem',
                type: 'faqItem',
                title: 'Questions',
                icon: typeIcon('faqItem'),
                explain:
                  'The questions visitors ask, with your answers. They show wherever a page has a "Questions (open and close)" section, such as Plan your visit.',
              }),
              // scaffold:end

              S.divider(),

              // Announcement banners: queued notices that appear above the header.
              // Each one has a date window (startDate / endDate) and an on/off toggle.
              // The active announcement is picked at build time; a rebuild is required
              // for the banner to appear or disappear on the live site.
              emptyAwareList(S, context, {
                id: 'announcement',
                type: 'announcement',
                title: 'Notices',
                icon: typeIcon('announcement'),
                explain:
                  'A short line across the top of every page, like a weather closing or a special service. Each one can take itself down on a date you pick.',
              }),
              // Popups (2026-10-26, schemaTypes/popup.ts): one at a time, with dates.
              emptyAwareList(S, context, {
                id: 'popup',
                type: 'popup',
                title: 'Popups',
                icon: typeIcon('popup'), // 'notice', from brand.config.json studio.icons.types
                explain:
                  'A box with a short message and one button that appears over the page, like an invitation to Christmas Eve. Only one shows at a time, never straight away, and each visitor sees it once.',
              }),

              S.divider(),

              // The form builder (schemaTypes/form.ts): forms the church writes, shown on a
              // page with the Form section. Answers are emailed, never stored here.
              emptyAwareList(S, context, {
                id: 'form',
                type: 'form',
                title: 'Forms',
                icon: typeIcon('form'),
                explain:
                  'Forms people fill in on the website, like a prayer request or a sign-up. Add one to a page with the Form section.',
              }),

              // The newsletter (card 127): issues written here, sent with the buttons beside
              // Publish. The people who get it are kept in the site's database, never here.
              // Left out while the list lives in Church Trac (ownNewsletter.ts).
              ...(OWN_NEWSLETTER
                ? [
                    emptyAwareList(S, context, {
                      id: 'newsletter',
                      type: 'newsletter',
                      title: 'Newsletter',
                      icon: typeIcon('newsletter'),
                      explain:
                        'The email that goes to everyone who signed up on the website. Write an issue, publish it, send yourself a test, then send it.',
                    }),
                  ]
                : []),
            ]),
        ),

      S.divider(),

      // The collections (FBC Auburn, 2026-10-18): three headings the pastor keeps himself, each
      // opening on a friendly front door (components/CollectionIntro.tsx) that says what the
      // list is for and has a big button for the usual job. Ids are load-bearing: the Checkup
      // and the Site Guide link to 'sermons;sermon', 'people;person' and 'downloads;download'.
      S.listItem()
        .id('sermons')
        .title('Sermons')
        .icon(typeIcon('sermon'))
        .child(
          S.list()
            .title('Sermons')
            .items([
              S.listItem()
                .id('sermons-start')
                .title('Start here')
                .icon(brandIcon('guide'))
                .child(S.component(SermonsIntro).id('sermons-start-view').title('Sermons')),
              emptyAwareList(S, context, {
                id: 'sermon',
                type: 'sermon',
                title: 'Sermons',
                icon: typeIcon('sermon'),
                explain:
                  "Each Sunday's message: the title, the passage and the video link. They fill the Sermons page and the podcast.",
                createLabel: 'Add the first sermon',
                list: (S) =>
                  S.documentTypeList('sermon')
                    .title('Sermons, newest first')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }]),
              }),
              // The same list as a sortable table (card 117, tables.config.ts).
              ...TABLES.filter((c) => c.type === 'sermon').map((c) => tableListItem(S, c)),
              emptyAwareList(S, context, {
                id: 'sermonSeries',
                type: 'sermonSeries',
                title: 'Sermon series',
                icon: typeIcon('sermonSeries'),
                explain:
                  'A run of sermons on one book or theme. Add a series, then pick it on each sermon in it.',
              }),
              S.divider(),
              singletonWithPreview(S, 'sermonsPage', 'Sermons page and podcast'),
            ]),
        ),
      S.listItem()
        .id('people')
        .title('People')
        .icon(typeIcon('personGroup'))
        .child(
          S.list()
            .title('People')
            .items([
              S.listItem()
                .id('people-start')
                .title('Start here')
                .icon(brandIcon('guide'))
                .child(S.component(PeopleIntro).id('people-start-view').title('People')),
              emptyAwareList(S, context, {
                id: 'person',
                type: 'person',
                title: 'People',
                icon: typeIcon('person'),
                explain:
                  'The pastor, staff, deacons and missionaries the website names, each with a photo and a line about them.',
                createLabel: 'Add the first person',
                list: (S) =>
                  S.documentTypeList('person')
                    .title('People')
                    .defaultOrdering([
                      { field: 'order', direction: 'asc' },
                      { field: 'name', direction: 'asc' },
                    ]),
              }),
              // The same list as a sortable table (card 117, tables.config.ts).
              ...TABLES.filter((c) => c.type === 'person').map((c) => tableListItem(S, c)),
              emptyAwareList(S, context, {
                id: 'personGroup',
                type: 'personGroup',
                title: 'Groups',
                icon: typeIcon('personGroup'),
                explain:
                  'The headings people are listed under, like "Staff", "Deacons" or "Missionaries".',
                list: (S) =>
                  S.documentTypeList('personGroup')
                    .title('Groups')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              }),
            ]),
        ),
      S.listItem()
        .id('downloads')
        .title('Downloads')
        .icon(typeIcon('download'))
        .child(
          S.list()
            .title('Downloads')
            .items([
              S.listItem()
                .id('downloads-start')
                .title('Start here')
                .icon(brandIcon('guide'))
                .child(S.component(DownloadsIntro).id('downloads-start-view').title('Downloads')),
              emptyAwareList(S, context, {
                id: 'download',
                type: 'download',
                title: 'All downloads',
                icon: typeIcon('download'),
                explain:
                  'Files people can open from the website: the weekly bulletin, a newsletter, a form to print.',
                createLabel: 'Upload the first one',
                list: (S) =>
                  S.documentTypeList('download')
                    .title('All downloads, newest first')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }]),
              }),
              // The same list as a sortable table (card 117, tables.config.ts).
              ...TABLES.filter((c) => c.type === 'download').map((c) => tableListItem(S, c)),
              S.listItem()
                .id('bulletins')
                .title('Bulletins')
                .icon(typeIcon('download'))
                .child(
                  S.documentList()
                    .id('bulletins-list')
                    .title('Bulletins, newest first')
                    .schemaType('download')
                    .filter('_type == "download" && category == "bulletin"')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                    .initialValueTemplates([S.initialValueTemplateItem('download')]),
                ),
            ]),
        ),

      S.divider(),

      // scaffold: journal
      // News and notes (code name: journal). Its own section so the editor can
      // find posts and categories at a glance. The id keeps the old 'journal'
      // pane path working.
      S.listItem()
        .id('journal')
        .title('News and notes')
        .icon(brandIcon('journal'))
        .child(
          S.list()
            .title('News and notes')
            .items([
              emptyAwareList(S, context, {
                id: 'journalEntry',
                type: 'journalEntry',
                title: 'Posts',
                icon: typeIcon('journalEntry'),
                explain:
                  'News from the church: a word about Sunday, an event coming up, a prayer need. Newest first on the News and notes page.',
                createLabel: 'Write the first post',
              }),
              emptyAwareList(S, context, {
                id: 'journalCategory',
                type: 'journalCategory',
                title: 'Categories',
                icon: typeIcon('journalCategory'),
                explain: 'Labels that sort the posts, like "Events" or "Missions".',
              }),
            ]),
        ),
      // scaffold:end

      S.divider(),

      // The Studio kit's Trash: "Move to Trash" keeps a copy here, and "Bring
      // it back" puts it where it was (src/sanity/kit/trash.tsx). The id is
      // load-bearing: the Checkup's "Open the Trash" links to it.
      trashListItem(S, context, brandIcon('trash')),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set out of the desk root). Every media.* type
      // belongs to sanity-plugin-media's own tool: newer versions add more than
      // media.tag (a "Media Folder" list leaked into the desk on 2026-10-17).
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() as string;
        return !HIDDEN_FROM_DEFAULT.has(id) && !id.startsWith('media.');
      }),
    ]);
