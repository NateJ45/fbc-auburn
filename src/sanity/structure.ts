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
import { BellIcon } from '@sanity/icons/Bell';
import { BlockElementIcon } from '@sanity/icons/BlockElement';
import { CogIcon } from '@sanity/icons/Cog';
import { HomeIcon } from '@sanity/icons/Home';
import { UserIcon } from '@sanity/icons/User';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { ThListIcon } from '@sanity/icons/ThList';
import { EditIcon } from '@sanity/icons/Edit';
import { TagIcon } from '@sanity/icons/Tag';
import { BookIcon } from '@sanity/icons/Book';
import { LockIcon } from '@sanity/icons/Lock';
import { ColorWheelIcon } from '@sanity/icons/ColorWheel';
import { ArrowRightIcon } from '@sanity/icons/ArrowRight';
import ChurchOverview from './components/ChurchOverview';
import BrandKit from './components/BrandKit';
import { TrashIcon } from '@sanity/icons/Trash';
import { staffDesk } from './kit/shared';
import { kitConfig } from './kit.config';
import { TRASH_TYPE } from '../lib/studio-trash';

const SINGLETON_TYPES = [
  'siteSettings',
  'businessInfo',
  // Core pages
  'homePage',
  'aboutPage', // scaffold: about
  'faqPage', // scaffold: faq
  'contactPage',
  'journalPage', // scaffold: journal
  'notFoundPage',
  'privacyPage',
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
  'faqItem', // scaffold: faq
  'faqCategory', // scaffold: faq
  'journalEntry', // scaffold: journal
  'journalCategory', // scaffold: journal
  'page', // custom pages, placed explicitly under "Pages"
  'sectionPreset', // saved sections, placed explicitly under "Pages"
  'redirect', // placed explicitly under "Pages" -> Redirects
  TRASH_TYPE, // the Studio kit's Trash, placed explicitly at the bottom
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
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
function singletonWithPreview(S: StructureBuilder, schemaType: string, title: string, icon: any) {
  // The id is the document id ON PURPOSE: an intent link ("open the About
  // page", from the Studio kit's Home and Checkup) resolves to the path
  // pages;aboutPage, and a title-derived id ("about") left that pane blank.
  return S.listItem()
    .id(schemaType)
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(schemaType).views([S.view.form()]));
}

// The Studio kit's staff view hides kitConfig.staffHiddenPanes from this desk
// (src/sanity/kit/shared.tsx, staffDesk); everyone else sees all of it.
export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  staffDesk(fullDesk(S), context, kitConfig);

const fullDesk = (S: StructureBuilder) =>
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
        .icon(HomeIcon)
        .child(
          S.component(ChurchOverview).id('church-at-a-glance-view').title('Our church at a glance'),
        ),
      S.listItem()
        .id('brand-kit')
        .title('Brand colors and fonts')
        .icon(ColorWheelIcon)
        .child(S.component(BrandKit).title('Brand colors and fonts')),

      S.divider(),

      // Site settings: pinned singleton (no preview; not a page)
      singletonWithPreview(S, 'siteSettings', 'Site settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here. The id is load-bearing
      // (kit.config.ts links to 'pages;page').
      S.listItem()
        .id('pages')
        .title('Pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              singletonWithPreview(S, 'homePage', 'Home', HomeIcon),
              singletonWithPreview(S, 'aboutPage', 'About', UserIcon), // scaffold: about
              singletonWithPreview(S, 'faqPage', 'Questions', HelpCircleIcon), // scaffold: faq
              singletonWithPreview(S, 'contactPage', 'Contact', EnvelopeIcon),
              singletonWithPreview(S, 'journalPage', 'News and notes (the list page)', BookIcon), // scaffold: journal
              singletonWithPreview(S, 'notFoundPage', 'Page not found', DocumentTextIcon),

              S.divider(),

              singletonWithPreview(S, 'privacyPage', 'Privacy policy', LockIcon),

              S.divider(),

              // Custom pages: editors build these themselves from the section library.
              // Multi-instance (not a singleton), so it is a normal document list.
              S.documentTypeListItem('page')
                .title('Custom pages (build your own)')
                .icon(DocumentsIcon),

              S.divider(),

              // Saved sections: one band of a page, kept for reuse. Made from a
              // page's publish menu ("Save a section as preset..."), added to a
              // page from the Saved sections group in the Presentation
              // navigator. Ordered by name, because the name is the only way
              // you find one again.
              S.documentTypeListItem('sectionPreset')
                .title('Saved sections')
                .icon(BlockElementIcon),

              S.divider(),

              // Redirects: old address -> new address. Most entries are filed
              // automatically when a page's web address changes on publish
              // (src/sanity/components/slugRedirect.tsx); the editor adds one by
              // hand for an address that never existed on this site.
              S.documentTypeListItem('redirect')
                .title('Redirects (old links)')
                .icon(ArrowRightIcon),
            ]),
        ),

      S.divider(),

      // Content — reusable collections. Orderable types get drag-and-drop;
      // non-orderable use standard lists.
      S.listItem()
        .id('content')
        .title('Content')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('faqCategory').title('Question groups').icon(TagIcon), // scaffold: faq
              S.documentTypeListItem('faqItem').title('Questions').icon(HelpCircleIcon), // scaffold: faq

              S.divider(),

              // Announcement banners: queued notices that appear above the header.
              // Each one has a date window (startDate / endDate) and an on/off toggle.
              // The active announcement is picked at build time; a rebuild is required
              // for the banner to appear or disappear on the live site.
              S.documentTypeListItem('announcement').title('Notices').icon(BellIcon),
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
        .icon(BookIcon)
        .child(
          S.list()
            .title('News and notes')
            .items([
              S.documentTypeListItem('journalEntry').title('Posts').icon(EditIcon),
              S.documentTypeListItem('journalCategory').title('Categories').icon(TagIcon),
            ]),
        ),
      // scaffold:end

      S.divider(),

      // The Studio kit's Trash: "Move to Trash" keeps a copy here, and "Bring
      // it back" puts it where it was (src/sanity/kit/trash.tsx). The id is
      // load-bearing: the Checkup's "Open the Trash" links to it.
      S.listItem()
        .id('trash')
        .title('Trash (bring things back)')
        .icon(TrashIcon)
        .child(
          S.documentTypeList(TRASH_TYPE)
            .id('trash-list')
            .title('Trash')
            .defaultOrdering([{ field: 'deletedAt', direction: 'desc' }]),
        ),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set out of the desk root). Every media.* type
      // belongs to sanity-plugin-media's own tool: newer versions add more than
      // media.tag (a "Media Folder" list leaked into the desk on 2026-10-17).
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() as string;
        return !HIDDEN_FROM_DEFAULT.has(id) && !id.startsWith('media.');
      }),
    ]);
