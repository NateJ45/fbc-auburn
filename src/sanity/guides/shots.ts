// Safe to edit by hand
// =============================================================================
// FBC Auburn's pictures of the Studio for the Site Guide (PORTS.md card 130)
// =============================================================================
// Guides ask for a picture by KEY ({ kind: 'shot', key: 'publish-button' } in
// guides/content.ts); this file says what each key shows here: a real capture of
// the church's own Studio, cropped to the useful part, with the account avatar
// and the greeting name covered, saved as WebP in public/guide-shots/. Marks are
// PERCENT of the cropped picture, measured from the capture's pixels (a recapture
// at another size keeps them). Stones are numbered in order and read in the key
// under the picture. src/lib/guide-shots.test.ts checks the files, the alt text
// and that every mark is inside its picture.
//
// To recapture: sign in to the live Studio, capture at about 1520 wide in the
// light appearance, crop, cover the avatar (top right, and bottom left in the
// editor), then move the marks to match. Docs: docs/agent/studio-kit.md.
// =============================================================================

import type { GuideShotData } from '../../lib/studio-look.ts';

export const GUIDE_SHOTS: Record<string, GuideShotData> = {
  'studio-tabs': {
    src: '/guide-shots/studio-tabs.webp',
    alt: "The top of the Studio's Home screen. A dark blue bar across the top lists Home, Quick update, Content, Live preview, Messages, RSVPs, Site Guide and Checkup. Below it is the welcome banner for First Baptist Church of Auburn.",
    width: 760,
    height: 310,
    marks: [
      {
        kind: 'ring',
        x: 28.9,
        y: 1,
        w: 5,
        h: 7.4,
      },
      {
        kind: 'stone',
        x: 31.4,
        y: 15.2,
        label: 'Home: what to do this week, and whether your last change is on the website.',
      },
      {
        kind: 'ring',
        x: 40.9,
        y: 1,
        w: 5,
        h: 7.4,
      },
      {
        kind: 'stone',
        x: 43.3,
        y: 15.2,
        label: 'Content: every page and setting, ready to edit.',
      },
      {
        kind: 'ring',
        x: 45.9,
        y: 1,
        w: 7,
        h: 7.4,
      },
      {
        kind: 'stone',
        x: 49.5,
        y: 15.2,
        label: 'Live preview: the real pages with your changes in place.',
      },
      {
        kind: 'ring',
        x: 63.6,
        y: 1,
        w: 5.8,
        h: 7.4,
      },
      {
        kind: 'stone',
        x: 66.4,
        y: 15.2,
        label: 'Site Guide: step-by-step help, where you are reading now.',
      },
    ],
  },
  'home-tiles': {
    src: '/guide-shots/home-tiles.webp',
    alt: "Seven large tiles on the Studio's Home screen: Add Sunday's sermon, Change the service times, Add a page, Edit the menus, Edit the website, Quick update and How do I.",
    width: 635,
    height: 265,
    marks: [
      {
        kind: 'ring',
        x: 0.9,
        y: 1.1,
        w: 24.3,
        h: 56.2,
      },
      {
        kind: 'stone',
        x: 22.7,
        y: 5.7,
        label: "Each tile is a shortcut to a common job, like adding Sunday's sermon.",
      },
      {
        kind: 'ring',
        x: 25.7,
        y: 58.9,
        w: 24.3,
        h: 40,
      },
      {
        kind: 'stone',
        x: 47.4,
        y: 63.8,
        label: 'Quick update: the everyday jobs, made small enough for a phone.',
      },
      {
        kind: 'ring',
        x: 50.4,
        y: 58.9,
        w: 24.3,
        h: 40,
      },
      {
        kind: 'stone',
        x: 72.1,
        y: 63.8,
        label: 'How do I...? opens the step-by-step guides.',
      },
    ],
  },
  'home-live': {
    src: '/guide-shots/home-live.webp',
    alt: "The Sunday checklist on the Studio's Home screen, showing one of six jobs done and the first two jobs, next to a card called Is it live with three steps: Saved, Building and On the website.",
    width: 635,
    height: 199,
    marks: [
      {
        kind: 'ring',
        x: 0.9,
        y: 2.5,
        w: 48.7,
        h: 97,
      },
      {
        kind: 'stone',
        x: 47.2,
        y: 7.5,
        label: 'The Sunday checklist. It starts fresh every Monday.',
      },
      {
        kind: 'ring',
        x: 8.2,
        y: 48.2,
        w: 13.9,
        h: 12.6,
      },
      {
        kind: 'stone',
        x: 26.8,
        y: 54.3,
        label: 'Each job has a button that takes you straight to it.',
      },
      {
        kind: 'ring',
        x: 50.6,
        y: 2.5,
        w: 48.7,
        h: 66.8,
      },
      {
        kind: 'stone',
        x: 96.1,
        y: 9.5,
        label: 'Is it live? Saved, Building, then On the website.',
      },
    ],
  },
  'edit-page': {
    src: '/guide-shots/edit-page.webp',
    alt: 'The Studio with Content open. The Pages list is in the middle and the About page is open on the right, showing the Page layout list of four sections, an Add item button, the Google title box and a Publish button at the bottom right.',
    width: 1524,
    height: 784,
    marks: [
      {
        kind: 'ring',
        x: 45.3,
        y: 0.4,
        w: 2.5,
        h: 2.9,
      },
      {
        kind: 'stone',
        x: 46.6,
        y: 6,
        label: 'Content, in the bar at the top.',
      },
      {
        kind: 'ring',
        x: 14,
        y: 11.9,
        w: 13,
        h: 3.6,
      },
      {
        kind: 'stone',
        x: 25.3,
        y: 13.6,
        label: 'Pick the page in the list. This one is About.',
      },
      {
        kind: 'ring',
        x: 51.5,
        y: 39.7,
        w: 23.9,
        h: 20.8,
      },
      {
        kind: 'stone',
        x: 50,
        y: 50,
        label:
          'Page layout: the sections of the page, one under another. Click one to change its words.',
      },
      {
        kind: 'ring',
        x: 51.5,
        y: 60.1,
        w: 23.9,
        h: 3.6,
      },
      {
        kind: 'stone',
        x: 50,
        y: 61.9,
        label: 'Add item: adds a new section.',
      },
      {
        kind: 'ring',
        x: 51.5,
        y: 70.4,
        w: 23.9,
        h: 12,
      },
      {
        kind: 'stone',
        x: 50,
        y: 76.5,
        label: 'Google title: the words people see in search results.',
      },
      {
        kind: 'ring',
        x: 94.7,
        y: 96.6,
        w: 4.2,
        h: 3.1,
      },
      {
        kind: 'stone',
        x: 96.5,
        y: 92.3,
        label: 'Publish: puts your change on the website.',
      },
    ],
  },
  'publish-button': {
    src: '/guide-shots/publish-button.webp',
    alt: 'The bottom right of the editor, with the Publish button in the corner under the Google description box.',
    width: 744,
    height: 184,
    marks: [
      {
        kind: 'ring',
        x: 89.1,
        y: 85.3,
        w: 8.6,
        h: 13,
      },
      {
        kind: 'stone',
        x: 92.7,
        y: 63,
        label:
          'Publish is at the bottom right of every page. It is gray here because nothing has changed yet, and it lights up once you edit.',
      },
    ],
  },
  'quick-update': {
    src: '/guide-shots/quick-update.webp',
    alt: "The Quick update screen on the Studio: four large buttons, Post a photo, Put up a notice, Add Sunday's sermon link, and Cancel or change something this week.",
    width: 760,
    height: 500,
    marks: [
      {
        kind: 'ring',
        x: 33.4,
        y: 0.6,
        w: 7.4,
        h: 4.6,
      },
      {
        kind: 'stone',
        x: 37.1,
        y: 9.4,
        label: 'Quick update, in the bar at the top. On a phone it is in the menu.',
      },
      {
        kind: 'ring',
        x: 27.9,
        y: 39.4,
        w: 44.7,
        h: 58.2,
      },
      {
        kind: 'stone',
        x: 25.3,
        y: 68.4,
        label:
          'Pick a job. Each one is only a few boxes, and the green button at the end publishes it.',
      },
    ],
  },
  'live-preview': {
    src: '/guide-shots/live-preview.webp',
    alt: "Live preview in the Studio. The list of pages is on the left, the church's home page is in the middle, and the Home page editor with its Page layout list is on the right.",
    width: 1524,
    height: 739,
    marks: [
      {
        kind: 'ring',
        x: 0.1,
        y: 0.3,
        w: 11,
        h: 36.7,
      },
      {
        kind: 'stone',
        x: 10.4,
        y: 36.9,
        label: 'The page list. Pick a page to look at.',
      },
      {
        kind: 'ring',
        x: 18.6,
        y: 42.8,
        w: 19.8,
        h: 6.2,
      },
      {
        kind: 'stone',
        x: 40.2,
        y: 45.9,
        label: 'The real page, with your draft in it. Click any words to jump to their box.',
      },
      {
        kind: 'ring',
        x: 75.3,
        y: 30.6,
        w: 23.8,
        h: 36.3,
      },
      {
        kind: 'stone',
        x: 97.6,
        y: 31.3,
        label: 'The editor, beside the page. Type here and the page updates.',
      },
    ],
  },
  checkup: {
    src: '/guide-shots/checkup.webp',
    alt: 'The Checkup screen, titled What needs attention. It lists things to fix in groups: Needs doing, Worth a look and Good to know, each with a button that opens the place to fix it.',
    width: 510,
    height: 500,
    marks: [
      {
        kind: 'ring',
        x: 4.3,
        y: 33.8,
        w: 15.1,
        h: 5.8,
      },
      {
        kind: 'stone',
        x: 26.7,
        y: 36.8,
        label: 'Check again: looks over the website once more.',
      },
      {
        kind: 'ring',
        x: 4.5,
        y: 41.6,
        w: 92.2,
        h: 26,
      },
      {
        kind: 'stone',
        x: 89.2,
        y: 56.6,
        label: 'Needs doing: fix these before you publish.',
      },
      {
        kind: 'ring',
        x: 7.5,
        y: 59.6,
        w: 12.5,
        h: 5.6,
      },
      {
        kind: 'stone',
        x: 27.8,
        y: 62.4,
        label: 'Open it: jumps to the place that needs a look.',
      },
      {
        kind: 'ring',
        x: 4.3,
        y: 91,
        w: 21.6,
        h: 4.8,
      },
      {
        kind: 'stone',
        x: 90.2,
        y: 93.4,
        label: 'Worth a look: nice to fix, but nothing breaks if you wait.',
      },
    ],
  },
};
