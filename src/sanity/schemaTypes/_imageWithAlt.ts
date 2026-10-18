// Safe to edit by hand
// =============================================================================
// imageWithAlt - the one way an image field is declared on this site.
//
// Every photo carries a plain-language "Description of the photo" so people who
// cannot see it (screen readers, search engines) still get the point. Hotspot is
// always on so editors can choose the crop focus.
//
// RULES:
//  - The field's `type` stays 'image'. NEVER introduce a named image schema type:
//    stored values carry `_type: 'image'`, and a type change makes the Studio offer
//    "Remove field", which deletes data (CLAUDE.md rule 1).
//  - A field that already had an alt-like subfield under another name keeps that
//    name (pass it in `fields` with its own validation, or use `altName`).
//  - `altRequired: false` (warning only) is for logos, icons, share images and
//    anything decorative or hidden.
// =============================================================================
import { defineArrayMember, defineField } from 'sanity';

export const ALT_DESCRIPTION =
  "Describe the photo for someone who cannot see it, like 'Children singing at the Christmas service'.";

type AltOpts = { altRequired?: boolean; altName?: string; altTitle?: string };

/** The description subfield. Pass `altName` to keep a legacy name such as `altText`. */
export function altField({ altRequired = true, altName = 'alt', altTitle }: AltOpts = {}) {
  return defineField({
    name: altName,
    title: altTitle ?? 'Description of the photo',
    type: 'string',
    description: ALT_DESCRIPTION,
    validation: (R) =>
      altRequired ? R.required().error(ALT_DESCRIPTION) : R.warning(ALT_DESCRIPTION),
  });
}

// Loose on purpose: callers pass the usual field props (validation, fieldset, options...).
type Extra = Record<string, any>;

type ImageArgs = AltOpts & {
  name?: string;
  title?: string;
  description?: string;
  group?: string | string[];
  hidden?: unknown;
  readOnly?: unknown;
  /** Extra subfields after the description (caption, credit...). */
  fields?: ReturnType<typeof defineField>[];
  /** Pass true when the caller supplies its own description subfield in `fields`. */
  ownAlt?: boolean;
} & Extra;

/** A named image field (hotspot on, description subfield first). */
export function imageWithAlt(args: ImageArgs = {}) {
  const { fields: extra = [], altRequired, altName, altTitle, ownAlt, options, ...rest } = args;
  const name = rest.name ?? 'image';
  const title = rest.title ?? 'Image';
  return defineField({
    ...rest,
    name,
    title,
    type: 'image',
    options: { hotspot: true, ...options },
    fields: ownAlt ? extra : [altField({ altRequired, altName, altTitle }), ...extra],
  } as Parameters<typeof defineField>[0]);
}

/** The same image, as a member of an array. */
export function imageMember(args: ImageArgs = {}) {
  const { fields: extra = [], altRequired, altName, altTitle, ownAlt, options, ...rest } = args;
  return defineArrayMember({
    ...rest,
    type: 'image',
    options: { hotspot: true, ...options },
    fields: ownAlt ? extra : [altField({ altRequired, altName, altTitle }), ...extra],
  } as Parameters<typeof defineArrayMember>[0]);
}
