// Contact page singleton. Email and social links come from siteSettings.
// The form asks the church's own questions ("Your own questions", formFields).
// FBC Auburn (2026-10-18): the starter's business-form fields (project type,
// location, budget, timeline, lead source) and the booking-link fields are
// HIDDEN, not deleted: some hold old placeholder data, and formFields replaces
// that part of the form anyway (src/lib/custom-form-fields.ts).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { additionalSectionsField, sectionArrayOptions } from './sections';
import { CONTACT_SECTION_TYPES } from './richSections';
import { pageBuilderAuthoring } from '../pageBuilderAuthoring';
import { imageWithAlt } from './_imageWithAlt';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  // Locked and structural: edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'pageBuilder', title: 'Page layout', default: true },
    { name: 'seo', title: 'Google and sharing' },
    { name: 'hero', title: 'Opening banner' },
    { name: 'form', title: 'The form' },
    { name: 'extra', title: 'Extra sections' },
  ],
  fields: [
    // Every main page a page builder (2026-10-26): the sections of this page, in order. The old
    // banner and extra-section fields below are hidden fossils (rule 1); scripts/content/builder-pages.mjs
    // moved their content in here.
    defineField({
      name: 'pageBuilder',
      title: 'Page layout',
      type: 'array',
      group: 'pageBuilder',
      description:
        "Sections on this page. Drag to reorder, remove a section to hide it, or add a new block from the library. Edit each section's content by clicking into it.",
      of: CONTACT_SECTION_TYPES,
      options: sectionArrayOptions,
      ...pageBuilderAuthoring,
    }),
    defineField({
      name: 'seoTitle',
      title: 'Google title',
      type: 'string',
      group: 'seo',
      description:
        'Browser tab and Google result title. Aim for 50 to 60 characters. Start with the church name or Hamilton.',
      validation: (Rule) =>
        Rule.max(60).warning(
          'Titles longer than about 60 characters get cut off in Google search results.',
        ),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Google description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) =>
        Rule.max(160).warning(
          'Descriptions longer than about 160 characters get cut off in Google search results.',
        ),
    }),
    imageWithAlt({
      name: 'seoImage',
      title: 'Social share image (this page)',
      group: 'seo',
      description:
        'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      altRequired: false,
    }),

    defineField({
      name: 'heroEyebrow',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Small line above the heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Get in touch',
    }),
    defineField({
      name: 'heroHeadline',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Contact us',
    }),
    defineField({
      name: 'heroSubhead',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    imageWithAlt({
      name: 'heroImage',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Banner photo',
      group: 'hero',
      description:
        'Full-width photo behind the banner text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
    }),
    defineField({
      name: 'heroScriptAccent',
      // Fossil (2026-10-26): moved into the Page layout; kept, never deleted (rule 1).
      hidden: true,
      readOnly: true,
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in the handwritten script accent font. Must match exactly (case-sensitive). Leave blank to skip.',
    }),

    defineField({
      name: 'formIntroNote',
      title: 'Note above the form',
      type: 'text',
      rows: 3,
      group: 'form',
      description: 'A line or two above the form, such as how soon someone will reply.',
    }),
    defineField({
      name: 'formProjectTypeOptions',
      title: 'Project type dropdown options',
      type: 'array',
      group: 'form',
      // FBC Auburn (2026-10-18): a business-form leftover. Hidden, not deleted:
      // the page's own questions ("Your own questions") replace it on the form.
      hidden: true,
      description:
        'The options shown in the "Project type" dropdown on the contact form. Order matters. Examples: "Single room", "Whole home", "Builder/realtor partnership".',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'formLocationOptions',
      title: 'Location dropdown options',
      type: 'array',
      group: 'form',
      // FBC Auburn (2026-10-18): a business-form leftover. Hidden, not deleted:
      // the page's own questions ("Your own questions") replace it on the form.
      hidden: true,
      description:
        'Cities shown in the "Location" dropdown. List in priority order. Leave blank to use the built-in defaults.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'formBudgetOptions',
      title: 'Budget dropdown options',
      type: 'array',
      group: 'form',
      // FBC Auburn (2026-10-18): a business-form leftover. Hidden, not deleted:
      // the page's own questions ("Your own questions") replace it on the form.
      hidden: true,
      description: 'Brackets for the built-in form. Not used on this site.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'formTimelineOptions',
      title: 'Timeline dropdown options',
      type: 'array',
      group: 'form',
      // FBC Auburn (2026-10-18): a business-form leftover. Hidden, not deleted:
      // the page's own questions ("Your own questions") replace it on the form.
      hidden: true,
      description: 'Choices for the built-in form. Not used on this site.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'formSourceOptions',
      title: '"How did you hear about us?" dropdown options',
      type: 'array',
      group: 'form',
      // FBC Auburn (2026-10-18): a business-form leftover. Hidden, not deleted:
      // the page's own questions ("Your own questions") replace it on the form.
      hidden: true,
      description:
        'Optional lead-source dropdown options. Useful for understanding where good leads come from over time. Leave blank to use the built-in defaults (Google, Instagram, Facebook, referrals, journal, Other), and replace those with the channels this business is actually findable on.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    // Editor-defined questions. Leave this empty and the contact form is
    // exactly the built-in one. Add a question and YOUR questions replace the
    // starter's middle of the form (location, project type, budget,
    // timeline, message, source). The standard name, email, and phone boxes
    // always stay at the top, so a reply address is guaranteed either way.
    // Shaping and caps: src/lib/custom-form-fields.ts.
    defineField({
      name: 'formFields',
      title: 'Your own questions',
      type: 'array',
      group: 'form',
      description:
        'The questions on the form, in order. The name, email, and phone boxes always come first. Maximum 12 questions.',
      of: [defineArrayMember({ type: 'formQuestion' })],
      validation: (Rule) => Rule.max(12),
    }),
    defineField({
      name: 'whatToExpectEyebrow',
      title: '"What happens next": small line above the heading',
      type: 'string',
      group: 'form',
      initialValue: 'What happens next',
    }),
    defineField({
      name: 'whatToExpectHeadline',
      title: '"What happens next": heading',
      type: 'string',
      group: 'form',
      initialValue: 'When you send this',
    }),
    defineField({
      name: 'whatToExpectContent',
      title: '"What happens next": words',
      type: 'array',
      group: 'form',
      description: 'A few sentences on who reads the message and when they reply.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'postInquiryRoadmap',
      title: 'What happens after you get in touch',
      type: 'array',
      group: 'form',
      description:
        'Optional numbered steps. When there are any, they show instead of the "What happens next" words above.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'roadmapStep',
          fields: [
            defineField({
              name: 'title',
              title: 'Step title',
              type: 'string',
              description:
                'Short heading for this step. Example: "The pastor reads every message."',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Step detail',
              type: 'text',
              rows: 3,
              description:
                'A sentence or two with more detail about what happens in this step. Optional.',
            }),
            defineField({
              name: 'timeEstimate',
              title: 'Time estimate (optional)',
              type: 'string',
              description: 'How long this step usually takes. Example: "Within two days".',
            }),
          ],
          preview: {
            select: { title: 'title', timeEstimate: 'timeEstimate' },
            prepare: ({ title, timeEstimate }) => ({
              title: title ?? '(untitled step)',
              subtitle: timeEstimate ?? '',
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'schedulingLink',
      title: 'Booking link',
      type: 'url',
      // FBC Auburn (2026-10-18): a business booking-call leftover; hidden, never set.
      hidden: true,
    }),
    defineField({
      name: 'schedulingLinkLabel',
      title: 'Booking link label',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'availabilityNote',
      title: 'Availability note override',
      type: 'string',
      hidden: true,
      description: 'Optional override of the availability line. Usually leave blank.',
    }),

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description:
        'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    // FBC Auburn (2026-10-18): an append zone, so the pastor can add a photo, a callout or
    // anything from the section library to this page himself.
    // The authoring kit (card 109): Insert a saved section, plus gentle warnings.
    // Fossil (2026-10-26): the extra sections moved into the Page layout; kept, never deleted.
    defineField({
      ...additionalSectionsField,
      ...pageBuilderAuthoring,
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: { prepare: () => ({ title: 'Contact page' }) },
});
