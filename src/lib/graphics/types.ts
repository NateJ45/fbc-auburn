// Safe to edit by hand
// =============================================================================
// The graphics maker's shared shapes (2026-10-27, docs/agent/graphics.md).
// =============================================================================
// A TEMPLATE is a pure function: (what it says, which size, the context) in,
// one self-contained SVG string out (fonts, textures, the mark and any photo
// inlined as data: URIs), plus warnings for the Studio to show ("shorten the
// title"). No DOM, no network, no clock: the Studio, the styleguide wall and
// the node tests all call the same function.
// =============================================================================

import type { Format } from './formats.ts';
import type { Measure } from './text.ts';

/** What the graphic is for: the first choice in the Studio tool. */
export type Kind =
  | 'sunday' // Join us this Sunday: the times from Church facts
  | 'event' // A special service or event: from a page's Event details
  | 'sermon' // A sermon or series: title, passage, preacher
  | 'verse' // A Bible verse
  | 'announcement' // A short notice: a headline and a line or two
  | 'time-change' // A different Sunday: from Church facts > A different Sunday
  | 'welcome' // New here: the connect card, postcard and door hanger
  | 'invite'; // Invite a friend: a card a member hands on, and a square post to share

export interface Photo {
  /** A data: URI (the Studio fetches the picture first, so the canvas is never tainted). */
  src: string;
  /** Natural size, px. */
  w: number;
  h: number;
  /** Sanity's hotspot centre, 0 to 1. Defaults to the middle. */
  focus?: { x: number; y: number };
}

/** The words. Every field is optional except `title`; templates drop what is empty. */
export interface Content {
  kind: Kind;
  /** The small capitals line above the title ("This Sunday", "Sermon series"). */
  kicker?: string;
  title: string;
  /** A sentence or two under the title. */
  body?: string;
  /** When, already worded from Church facts: one gathering per line ("Worship, 10:30 am"). */
  when?: string[];
  /**
   * The standing invitation, worded like `when` ("Worship, 11:00 am"): the regular Sunday
   * gatherings, printed small in the foot of kinds that are not about Sunday themselves.
   */
  standing?: string[];
  /** The date line for an event or a time change ("Sunday, December 21"). */
  date?: string;
  /** A Bible reference (the verse's, or the sermon's passage). */
  reference?: string;
  /** The translation for a verse ("CSB"). */
  translation?: string;
  /** Who is preaching. */
  speaker?: string;
  /** The page this points people to, as shown ("firstauburn.org/christmas"). */
  link?: string;
  /** The full address the QR code holds; print sizes draw a code when it is set. */
  qr?: string;
  /**
   * The words beside the QR code ("Scan to plan your visit"), set where the code's target is
   * not obvious: the welcome kind points at the Church Trac connect card when there is one.
   */
  qrLabel?: string;
  /** Invite a friend: the member's name for the "Invited by" line (optional, typed by them). */
  invitedBy?: string;
  photo?: Photo;
}

/** The church's own lines, from Site settings and Church facts. */
export interface Church {
  line1: string; // "First Baptist"
  line2: string; // "Church of Auburn"
  /** One line: "4241 Hamilton-Scipio Rd, Hamilton, OH 45013". Null until confirmed and typed. */
  address: string | null;
  /** The town line for small type ("Hamilton, Ohio"). */
  place: string;
  /** The web address as printed ("firstauburn.org"). */
  web: string;
}

/** Inlined files, as data: URIs. src/lib/graphics/assets.ts imports them for the browser. */
export interface Assets {
  serif: string; // Young Serif woff2
  sans: string; // Familjen Grotesk woff2 (variable weight)
  markWhite: string; // the linocut mark, white cross on brick (for dark grounds)
  markColor: string; // the full-colour mark (for light grounds)
  tileNavy: string; // the navy stone-tile ground of the site's dark bands
  tileWall: string; // the auburn brick wall
  sketch: string; // the building sketch lines (an alpha mask)
}

export interface Ctx {
  measure: Measure;
  assets: Assets;
  church: Church;
}

export interface Rendered {
  svg: string;
  /** Plain sentences for the Studio ("The title is too long for the story size."). */
  warnings: string[];
}

export type Template = (content: Content, format: Format, ctx: Ctx) => Rendered;

/** A design direction: one complete graphic system. */
export interface Direction {
  id: string;
  name: string;
  /** One or two sentences: what it is and why it is Auburn. */
  summary: string;
  render: Template;
}
