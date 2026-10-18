// Safe to edit by hand
// =============================================================================
// The church's own icon art for the Studio (starter PORTS.md card 119)
// =============================================================================
// NOT PORTABLE. The registry in src/sanity/brandIcons.tsx draws every meaning
// with @sanity/icons; each meaning listed here is drawn with one of the eight
// stone icons from the brand kit instead (src/assets/brand/stone-icon-*.svg,
// the same files the site uses through src/lib/stone-icons.ts). The files are
// shown exactly as drawn, stone colours included: artIcon() only places them in
// Sanity's 1em icon box. Checked at 16, 20 and 24px in light and dark: the
// colours read on the paper and on the dark ground, so no one-colour version.
//
// Which document type, field group or tool means what: brand/brand.config.json
// `studio.icons`. Meanings with no stone (home, settings, contact, redirects,
// the Trash, the guide...) keep the starter's @sanity/icons.
// =============================================================================

import type { BrandIconKey } from '../lib/studio-icons';
import { artIcon, type BrandIcon } from './artIcon';
import bibleUrl from '../assets/brand/stone-icon-bible.svg?url';
import blocksUrl from '../assets/brand/stone-icon-blocks.svg?url';
import clockUrl from '../assets/brand/stone-icon-clock.svg?url';
import coffeeUrl from '../assets/brand/stone-icon-coffee.svg?url';
import givingHandUrl from '../assets/brand/stone-icon-giving-hand.svg?url';
import mapPinUrl from '../assets/brand/stone-icon-map-pin.svg?url';
import musicUrl from '../assets/brand/stone-icon-music.svg?url';
import prayingHandsUrl from '../assets/brand/stone-icon-praying-hands.svg?url';
import markUrl from '../assets/brand/fbc-auburn-icon-full-color.svg?url';

// Inset 0: each file's viewBox is already cropped to its art, so the default 10% margin only made
// the stones read small inside their list tiles (2026-10-18).
const Bible = artIcon(bibleUrl, 'Open Bible', 0);
const Blocks = artIcon(blocksUrl, 'Building blocks', 0);
const Clock = artIcon(clockUrl, 'Clock', 0);
const Coffee = artIcon(coffeeUrl, 'Coffee cup', 0);
const GivingHand = artIcon(givingHandUrl, 'Giving hand', 0);
const MapPin = artIcon(mapPinUrl, 'Map pin', 0);
const Music = artIcon(musicUrl, 'Music', 0);
const PrayingHands = artIcon(prayingHandsUrl, 'Praying hands', 0);
// The church's own mark: who we are (the About page, mapped in brand.config.json).
const Mark = artIcon(markUrl, 'The church mark', 0);

export const BRAND_ICON_ART: Partial<Record<BrandIconKey, BrandIcon>> = {
  // Who we are: the About page.
  overview: Mark,
  // Sermons, series, the sermons page; downloads (bulletins and study notes).
  scripture: Bible,
  series: Bible,
  download: Bible,
  // Service times and the church facts.
  times: Clock,
  // Notices, events and news: the welcome cup.
  notice: Coffee,
  event: Coffee,
  post: Coffee,
  journal: Coffee,
  // Giving, and the people who serve (staff, deacons, groups).
  give: GivingHand,
  person: GivingHand,
  people: GivingHand,
  // Plan a visit, the address, and the newcomers' questions.
  place: MapPin,
  question: MapPin,
  questionGroup: MapPin,
  // Worship music and the podcast.
  music: Music,
  // Prayer, and the forms (prayer requests come in through one).
  prayer: PrayingHands,
  form: PrayingHands,
  // Pages and the sections they are built from.
  pages: Blocks,
  page: Blocks,
  sections: Blocks,
  savedSection: Blocks,
  children: Blocks,
};
