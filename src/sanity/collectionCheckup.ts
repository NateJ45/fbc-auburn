// Safe to edit by hand
// =============================================================================
// Checkup rules for the sermons and the people list (FBC Auburn, 2026-10-18)
// =============================================================================
// Pure rules over the documents the Checkup already fetched (src/lib/
// studio-checkup.ts), added to kit.config.ts. Both point, neither blocks:
//   - a sermon with neither a video link nor a recording has nothing to
//     watch or hear on its page ("Worth a look");
//   - a person with no photo shows their initials instead, which is fine,
//     so it is only "For information".
// =============================================================================

import { listNames, openFirst, plural, type CheckupRule } from '../lib/studio-checkup';

const hasFile = (v: unknown) =>
  Boolean((v as { asset?: { _ref?: string } } | undefined)?.asset?._ref);

export const sermonWithoutMedia: CheckupRule = {
  id: 'sermon-no-video-or-audio',
  run: ({ published, nameOf }) => {
    const bare = published.filter(
      (d) =>
        d._type === 'sermon' &&
        !(typeof d.videoUrl === 'string' && d.videoUrl.trim()) &&
        !hasFile(d.audio),
    );
    if (!bare.length) return null;
    return {
      severity: 'Worth a look',
      label: `${plural(bare.length, 'sermon')} with no video and no recording`,
      detail: `${listNames(bare.map(nameOf))}. Their pages have nothing to watch or listen to. Paste the video link from YouTube or Facebook, or upload the recording, if there is one.`,
      ...openFirst(bare, 'videoUrl'),
    };
  },
};

export const personWithoutPhoto: CheckupRule = {
  id: 'person-no-photo',
  run: ({ published, nameOf }) => {
    const none = published.filter((d) => d._type === 'person' && !hasFile(d.photo));
    if (!none.length) return null;
    return {
      severity: 'For information',
      label: `${plural(none.length, 'person', 'people')} on the people list without a photo`,
      detail: `${listNames(none.map(nameOf))}. The website shows their initials instead, which is fine. A friendly photo is nicer when you have one.`,
      ...openFirst(none, 'photo'),
    };
  },
};

export const collectionRules: CheckupRule[] = [sermonWithoutMedia, personWithoutPhoto];
