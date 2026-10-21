// Safe to edit by hand
// =============================================================================
// The church's own icon art for the Studio (starter PORTS.md card 119)
// =============================================================================
// NOT PORTABLE. The registry in src/sanity/brandIcons.tsx draws every meaning
// with @sanity/icons; each meaning listed here is drawn with one of the
// stone icons from the brand kit instead (src/assets/brand/stone-icon-*.svg,
// the same files the site uses through src/lib/stone-icons.ts). The files are
// shown exactly as drawn, stone colours included: artIcon() only places them in
// Sanity's 1em icon box. Checked at 16, 20 and 24px in light and dark: the
// colours read on the paper and on the dark ground, so no one-colour version.
//
// Which document type, field group or tool means what: brand/brand.config.json
// `studio.icons`. Meanings with no stone (contact,
// redirects...) keep the starter's @sanity/icons.
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
import guideUrl from '../assets/brand/stone-icon-guide.svg?url';
import pageUrl from '../assets/brand/stone-icon-page.svg?url';
import imageUrl from '../assets/brand/stone-icon-image.svg?url';
import homeUrl from '../assets/brand/stone-icon-home.svg?url';
import previewUrl from '../assets/brand/stone-icon-preview.svg?url';
import searchUrl from '../assets/brand/stone-icon-search.svg?url';
import linkUrl from '../assets/brand/stone-icon-link.svg?url';
import checkupUrl from '../assets/brand/stone-icon-checkup.svg?url';
import helpUrl from '../assets/brand/stone-icon-help.svg?url';
import quickUrl from '../assets/brand/stone-icon-quick.svg?url';
import mailUrl from '../assets/brand/stone-icon-mail.svg?url';
import settingsUrl from '../assets/brand/stone-icon-settings.svg?url';
import trashUrl from '../assets/brand/stone-icon-trash.svg?url';
import calendarUrl from '../assets/brand/stone-icon-calendar.svg?url';
import paletteUrl from '../assets/brand/stone-icon-palette.svg?url';
import restoreUrl from '../assets/brand/stone-icon-restore.svg?url';
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
const Guide = artIcon(guideUrl, 'Guide book', 0);
const Page = artIcon(pageUrl, 'Page', 0);
const Camera = artIcon(imageUrl, 'Camera', 0);
const House = artIcon(homeUrl, 'House', 0);
const Eye = artIcon(previewUrl, 'Eye', 0);
const Magnifier = artIcon(searchUrl, 'Magnifying glass', 0);
const ChainLink = artIcon(linkUrl, 'Chain link', 0);
const Heartbeat = artIcon(checkupUrl, 'Heartbeat', 0);
const HelpIcon = artIcon(helpUrl, 'Help speech bubble', 0);
const QuickIcon = artIcon(quickUrl, 'Lightning bolt', 0);
const MailIcon = artIcon(mailUrl, 'Envelope', 0);
const SettingsIcon = artIcon(settingsUrl, 'Gear', 0);
const TrashIcon = artIcon(trashUrl, 'Bin', 0);
const CalendarIcon = artIcon(calendarUrl, 'Calendar', 0);
const PaletteIcon = artIcon(paletteUrl, 'Paint palette', 0);
const RestoreIcon = artIcon(restoreUrl, 'Turning back arrow', 0);
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
  sections: Blocks,
  savedSection: Blocks,
  children: Blocks,
  // Guides and the Studio's own help, the single page, and the page-level tools.
  guide: Guide,
  page: Page,
  home: House,
  // Pictures and media, and the preview of the live site.
  image: Camera,
  preview: Eye,
  // Search fields, and the links (share links, redirects in the Studio).
  search: Magnifier,
  link: ChainLink,
  // The health check.
  checkup: Heartbeat,
  // The Studio's furniture: help, the quick-update tool, messages, settings, the Trash.
  help: HelpIcon,
  quickUpdate: QuickIcon,
  message: MailIcon,
  settings: SettingsIcon,
  trash: TrashIcon,
  // Undo a change, Earlier versions (card 132).
  restore: RestoreIcon,
  // Scheduling and publishing, and the Brand kit.
  publishing: CalendarIcon,
  brandKit: PaletteIcon,
};
