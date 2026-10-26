// Registers every schema type with the Studio.
// Order doesn't affect runtime; alphabetical here for readability.

import { aboutPage } from './aboutPage'; // scaffold: about
import { announcement } from './announcement';
import { businessInfo } from './businessInfo';
import { contactPage } from './contactPage';
import { ctaBlock } from './ctaBlock';
import { faqCategory } from './faqCategory'; // scaffold: faq
import { faqItem } from './faqItem'; // scaffold: faq
import { faqPage } from './faqPage'; // scaffold: faq
import { form } from './form';
import { formQuestion } from './formQuestion';
import { formDateQuestion, formTickQuestion } from './formQuestionMore';
import { homePage } from './homePage';
import { journalCategory } from './journalCategory'; // scaffold: journal
import { journalEntry } from './journalEntry'; // scaffold: journal
import { journalPage } from './journalPage'; // scaffold: journal
import { navLink } from './navLink';
import { newsletter } from './newsletter';
import { page } from './page';
import { privatePage } from './privatePage';
import { pageSectionSchemas, syncedSection } from './sections';
import { richSectionSchemas } from './richSections';
import { notFoundPage } from './notFoundPage';
import { privacyPage } from './privacyPage';
import { redirect } from './redirect';
import { sectionPreset } from './sectionPreset';
import { siteSettings } from './siteSettings';
import { studioGuide } from './studioGuide';
// FBC Auburn collections (2026-10-18): sermons, people, downloads.
import { sermonSchemas } from './sermons';
import { peopleSchemas } from './people';
import { download } from './downloads';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,
  // Shared menu link (header menu, footer columns, small print, header button)
  navLink,
  // One editor-written form question (contactPage.formFields).
  formQuestion,
  formDateQuestion,
  formTickQuestion,
  // Page-builder section blocks (objects). Registered before the documents
  // whose pageBuilder arrays reference them.
  ...pageSectionSchemas,
  syncedSection, // authoring kit, card 109: shows a saved section, edit once everywhere
  ...richSectionSchemas,

  // Singletons
  siteSettings,
  businessInfo, // Starter business details; not in the desk, no document (queries.ts reads it)
  homePage,
  aboutPage, // scaffold: about
  faqPage, // scaffold: faq
  contactPage,
  journalPage, // scaffold: journal
  notFoundPage,
  privacyPage,
  // The starter's old "Start Here" handbook. Not shown in the desk (the Site
  // Guide replaced it), but kept registered because a document of it exists.
  studioGuide,

  // Reusable content collections
  announcement, // site-wide banner collection (enabled + date-windowed)
  faqCategory, // scaffold: faq
  faqItem, // scaffold: faq
  journalCategory, // scaffold: journal
  journalEntry, // scaffold: journal
  // FBC Auburn: the sermon archive (sermon, sermonSeries, the sermonsPage singleton), the
  // people list (person, personGroup) and the downloads shelf.
  ...sermonSchemas,
  ...peopleSchemas,
  download,
  // A form the church writes (the form builder); the Form block shows it.
  form,
  // One issue of the email newsletter (card 127); subscribers live in D1, never here.
  newsletter,
  // Custom pages built from the section library (multi-instance, not a singleton)
  page,
  // Pages only people with the password can see (card 122). Stored under the
  // privatePage. id path, which the public API never serves.
  privatePage,
  // One saved section, kept for reuse on other pages. Not content: nothing
  // about a preset reaches the live site until it is added to a page.
  sectionPreset,
  // Old address -> new address forwards, filed by hand or automatically on a
  // web-address change (see components/slugRedirect.tsx).
  redirect,
];
