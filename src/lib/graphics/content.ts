// Safe to edit by hand
// =============================================================================
// The words of a graphic, built from what the church already keeps (2026-10-27).
// =============================================================================
// Pure functions. Each takes Sanity data and returns a Content the templates draw,
// so the times, the address and the dates on a graphic are never typed by hand:
// they come from Church facts (src/lib/church-facts.ts, dayPlan) exactly as the
// site shows them. Jacob may change the words in the Studio afterwards; the facts
// stay derived (rule 15). docs/agent/graphics.md.
// =============================================================================

import {
  addDays,
  changeSummary,
  clockLabel,
  dayPlan,
  dayTitle,
  monthDay,
  parseClock,
  shortLabel,
  weekdayOf,
  type ChurchFacts,
  type TimeChange,
} from '../church-facts.ts';
import { withTrailingSlash } from '../href.ts';
import { cleanText } from './text.ts';
import type { Church, Content, Kind } from './types.ts';

/** "Wednesday, December 24" for a YYYY-MM-DD. */
export const longDate = (iso: string) => `${dayTitle(iso)}, ${monthDay(iso)}`;

/** The next Sunday on or after `today` (YYYY-MM-DD). */
export function nextSunday(today: string): string {
  return addDays(today, (7 - weekdayOf(today)) % 7);
}

/** The printed web address ("firstauburn.org/christmas") and the QR target for a path. */
export function linkFor(siteUrl: string, path: string): { link: string; qr: string } {
  const base = siteUrl.replace(/\/+$/, '');
  const clean = path === '/' ? '/' : withTrailingSlash(path.startsWith('/') ? path : `/${path}`);
  const shown = `${base.replace(/^https?:\/\//, '').replace(/^www\./, '')}${clean === '/' ? '' : clean.replace(/\/$/, '')}`;
  return { link: shown, qr: `${base}${clean}` };
}

/** The church's own lines for the templates. */
export function churchLines(facts: Pick<ChurchFacts, 'address'>, siteUrl: string): Church {
  return {
    line1: 'First Baptist',
    line2: 'Church of Auburn',
    address: facts.address?.oneLine ?? null,
    place: facts.address
      ? `${facts.address.city}, ${stateName(facts.address.state)}`
      : 'Hamilton, Ohio',
    web: linkFor(siteUrl, '/').link,
  };
}

const stateName = (s: string) => (s.toUpperCase() === 'OH' ? 'Ohio' : s);

/** One line per gathering: "Sunday School, 9:45 am". */
function gatheringLines(services: { label: string; timeLabel: string }[]): string[] {
  return services.map((s) => `${shortLabel(s.label)}, ${s.timeLabel}`);
}

/** Join us this Sunday: that Sunday's plan, with any time change already applied. */
export function sundayContent(facts: ChurchFacts, today: string, siteUrl: string): Content {
  const date = nextSunday(today);
  const plan = dayPlan(facts, date);
  const changed = changeSummary(plan);
  return {
    kind: 'sunday',
    kicker: date === today ? 'Today' : 'This Sunday',
    title: 'Come as you are',
    body: changed || 'Coffee is on, and there is a seat for you.',
    when: gatheringLines(plan.services),
    date: longDate(date),
    ...linkFor(siteUrl, '/plan-your-visit/'),
  };
}

/** A different Sunday (Church facts > A different Sunday). */
export function timeChangeContent(
  facts: ChurchFacts,
  change: TimeChange,
  siteUrl: string,
): Content {
  const plan = dayPlan(facts, change.date);
  const first = plan.services.find((s) => s.movedFrom || s.extra);
  const title = plan.services.length
    ? first
      ? `${shortLabel(first.label)} at ${first.timeLabel}`
      : 'A change to our times'
    : 'No services this day';
  return {
    kind: 'time-change',
    kicker: 'A different Sunday',
    date: longDate(change.date),
    title,
    body: changeSummary(plan),
    when: gatheringLines(plan.services),
    ...linkFor(siteUrl, '/'),
  };
}

/**
 * New here: the times of every week, for the connect card, postcard and door hanger. The QR goes
 * to the Church Trac connect card when Church facts has one (so the card can be filled in
 * online), otherwise to Plan your visit; `qrLabel` says which.
 */
export function welcomeContent(
  facts: Pick<ChurchFacts, 'serviceTimes'> & Partial<Pick<ChurchFacts, 'connectCardUrl'>>,
  siteUrl: string,
): Content {
  const visit = linkFor(siteUrl, '/plan-your-visit/');
  const connect = facts.connectCardUrl || null;
  const weekly = [...facts.serviceTimes].sort(
    (a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes,
  );
  return {
    kind: 'welcome',
    kicker: 'New here?',
    title: 'We would love to meet you',
    body: 'Come as you are. We will not put you on the spot.',
    when: weekly.map((s) =>
      s.dayIndex === 0
        ? `${shortLabel(s.label)}, ${s.timeLabel}`
        : `${dayTitle(dayIso(s.dayIndex))} ${shortLabel(s.label)}, ${s.timeLabel}`,
    ),
    link: visit.link,
    qr: connect ?? visit.qr,
    qrLabel: connect ? 'Scan to fill this in online' : 'Scan to plan your visit',
  };
}

/**
 * Invite a friend: this Sunday's times (time changes applied), for the card a member hands on and
 * the square post they share. Personal invitation is the strongest reason a guest comes (Lifeway:
 * 51% against 23% for a postcard). The "Invited by" name is the member's own, typed in the tool.
 */
export function inviteContent(facts: ChurchFacts, today: string, siteUrl: string): Content {
  const date = nextSunday(today);
  const plan = dayPlan(facts, date);
  return {
    kind: 'invite',
    kicker: date === today ? 'Today' : 'This Sunday',
    title: 'You’re invited',
    body: '',
    when: gatheringLines(plan.services),
    date: longDate(date),
    invitedBy: '',
    qrLabel: 'Scan to plan your visit',
    ...linkFor(siteUrl, '/plan-your-visit/'),
  };
}

/** Any date with the given weekday (only its weekday name is read). */
const dayIso = (dayIndex: number) => addDays('2026-01-04', dayIndex); // 2026-01-04 is a Sunday

export interface SermonLike {
  title?: string | null;
  date?: string | null;
  passage?: string | null;
  preacher?: string | null;
  series?: string | null;
  slug?: string | null;
}

/** A sermon: its title, passage and preacher. */
export function sermonContent(s: SermonLike, siteUrl: string): Content {
  return {
    kind: 'sermon',
    kicker: s.series ? s.series : s.date ? longDate(s.date) : 'Sermon',
    title: s.title || 'Sermon title',
    reference: s.passage || undefined,
    speaker: s.preacher || undefined,
    ...{
      link: linkFor(siteUrl, '/sermons/').link,
      qr: linkFor(siteUrl, s.slug ? `/sermons/${s.slug}/` : '/sermons/').qr,
    },
  };
}

export interface SeriesLike {
  title?: string | null;
  book?: string | null;
  slug?: string | null;
}

/** A sermon series. */
export function seriesContent(s: SeriesLike, siteUrl: string): Content {
  return {
    kind: 'sermon',
    kicker: 'Sermon series',
    title: s.title || 'Series title',
    reference: s.book || undefined,
    ...{
      link: linkFor(siteUrl, '/sermons/').link,
      qr: linkFor(siteUrl, s.slug ? `/sermons/series/${s.slug}/` : '/sermons/').qr,
    },
  };
}

export interface EventLike {
  /** The page's title. */
  title?: string | null;
  slug?: string | null;
  /** The page's first Event details block. */
  details?: {
    title?: string | null;
    note?: string | null;
    occurrences?:
      { date?: string | null; startTime?: string | null; label?: string | null }[] | null;
  } | null;
}

/** An event page: the next date from its Event details block, or the soonest one listed. */
export function eventContent(e: EventLike, today: string, siteUrl: string): Content {
  const dates = (e.details?.occurrences ?? []).filter((o) => o?.date) as {
    date: string;
    startTime?: string | null;
    label?: string | null;
  }[];
  dates.sort((a, b) => a.date.localeCompare(b.date));
  const next = dates.find((d) => d.date >= today) ?? dates[0];
  const times = dates
    .filter((d) => next && d.date === next.date)
    .map((d) => {
      const m = parseClock(d.startTime);
      return m == null ? '' : d.label ? `${d.label}, ${clockLabel(m)}` : clockLabel(m);
    })
    .filter(Boolean);
  return {
    kind: 'event',
    kicker: next ? longDate(next.date) : undefined,
    title: e.details?.title || e.title || 'Event',
    body: e.details?.note || undefined,
    when: times,
    ...linkFor(siteUrl, e.slug ? `/${e.slug}/` : '/'),
  };
}

/** A Bible verse (typed by Jacob: the words are his to choose and his translation). */
export function verseContent(text: string, reference: string, translation: string): Content {
  return { kind: 'verse', title: text, reference, translation };
}

/** A short notice, starting empty. */
export function announcementContent(siteUrl: string): Content {
  return {
    kind: 'announcement',
    kicker: 'Church family',
    title: '',
    body: '',
    ...linkFor(siteUrl, '/'),
  };
}

/** The pre-launch notes in page copy ("[Jacob: ...]", "[Placeholder: ...]"): MARKERS in src/data/client-notes.ts. */
const NOTE_RE = /\s*\[(?:Jacob|Placeholder|Client|Photo):[^\]]*\]\s*/g;

/** True when any of the words still holds a pre-launch note. */
export function hasNotes(c: Content): boolean {
  return [c.kicker, c.title, c.body, c.date, c.invitedBy, ...(c.when ?? [])].some(
    (v) => typeof v === 'string' && /\[(?:Jacob|Placeholder|Client|Photo):/.test(v),
  );
}

/** The words with any pre-launch note taken out: a graphic never prints one. */
export function withoutNotes(c: Content): Content {
  const strip = (v?: string) =>
    v == null ? v : v.replace(NOTE_RE, ' ').replace(/\s+/g, ' ').trim();
  return {
    ...c,
    kicker: strip(c.kicker),
    title: strip(c.title) ?? '',
    body: strip(c.body),
    date: strip(c.date),
    invitedBy: strip(c.invitedBy),
    when: c.when?.map((w) => strip(w) ?? '').filter(Boolean),
  };
}

/**
 * The standing invitation, the regular Sunday gatherings ("Worship, 11:00 am"), for the foot of a
 * graphic about something else (an event, a sermon, a notice), so every piece says when to come.
 * Kinds already about Sunday carry their own times and get none.
 */
export function standingFor(
  facts: Pick<ChurchFacts, 'serviceTimes'>,
  kind: Content['kind'],
): string[] | undefined {
  if (kind === 'sunday' || kind === 'time-change' || kind === 'welcome' || kind === 'invite')
    return undefined;
  const sunday = facts.serviceTimes
    .filter((s) => s.dayIndex === 0)
    .sort((a, b) => a.minutes - b.minutes);
  return sunday.length ? gatheringLines(sunday) : undefined;
}

/** The words beside a QR code: the content's own, else what the code's target suggests. */
export function qrLabelFor(c: Pick<Content, 'qr' | 'qrLabel'>): string {
  const own = cleanText(c.qrLabel);
  if (own) return own;
  return /\/plan-your-visit\/?$/.test(c.qr ?? '') || !c.qr
    ? 'Scan to plan your visit'
    : 'Scan for the details';
}

// ── The caption and the alt text (2026-10-28) ──────────────────────────────────
// Written from the same words the graphic draws, so the post and the picture agree. Plain and
// warm, American English, no hashtags, no emoji, no dashes, no pre-launch notes. The two facts a
// guest looks for first are the street address and the times (Thom Rainer), so every caption
// carries both.

/** One piece of words, tidy: dashes turned to a colon, no emoji, single spaces. */
const tidy = (v?: string | null) =>
  cleanText(v ?? '')
    .replace(/\p{Extended_Pictographic}|\u{FE0F}|\u{200D}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Ends a sentence with a full stop unless it already has its own. */
const sentence = (s: string) => (!s ? '' : /[.!?”"]$/.test(s) ? s : `${s}.`);

/** "a", "a and b", "a, b, and c". */
function listJoin(a: string[]): string {
  if (a.length < 2) return a[0] ?? '';
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(', ')}, and ${a[a.length - 1]}`;
}

/** "Sunday School, 9:45 am" becomes "Sunday School at 9:45 am"; a bare time stays as it is. */
const spoken = (line: string) =>
  tidy(line).replace(/^(.+?),\s*(\d{1,2}(?::\d{2})?\s*[ap]m)$/i, '$1 at $2');

/** True for a date line ("Thursday, December 24"), so a kicker that is a date reads as one. */
const isDate = (s: string) => /^(Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day,\s/.test(s);

/** The address a caption links to: the QR target when it is on the same site, else the link. */
function captionUrl(c: Content, church: Church): string {
  const link = tidy(c.link) || church.web;
  const host = link.split('/')[0];
  const qrHost = (c.qr ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
  if (c.qr && qrHost === host) return c.qr;
  return `https://${link}${link.includes('/') ? '/' : ''}`;
}

/** Where: the church's name and street address (the town until the address is typed). */
const whereLine = (church: Church) =>
  `${church.line1} ${church.line2}, ${church.address ? tidy(church.address) : church.place}`;

/** The headline as a sentence, with the kicker joined on when it adds something. */
function headline(c: Content): string {
  const title = tidy(c.title);
  if (c.kind === 'verse') {
    const ref = tidy(c.reference);
    const tr = tidy(c.translation);
    const cite = ref ? ` ${ref}${tr ? ` (${tr})` : ''}` : '';
    return title ? `“${title.replace(/^[“"]|[”"]$/g, '')}”${cite}` : '';
  }
  const kicker = tidy(c.kicker);
  if (!kicker || isDate(kicker) || c.kind === 'invite' || /^today$/i.test(kicker))
    return sentence(title);
  if (/[?!]$/.test(kicker)) return sentence(`${kicker} ${title}`);
  return sentence(`${kicker}: ${title}`);
}

const LINK_LABEL: Record<Kind, string> = {
  sunday: 'Plan your visit',
  event: 'Details',
  sermon: 'Listen',
  verse: 'Visit us',
  announcement: 'More',
  'time-change': 'More',
  welcome: 'Plan your visit',
  invite: 'Plan your visit',
};

const INVITATION: Record<Kind, string> = {
  sunday: 'We would love to see you there.',
  event: 'Everyone is welcome. Bring a friend.',
  sermon: 'We would love to have you with us on Sunday.',
  verse: 'We would love to have you with us on Sunday.',
  announcement: 'Everyone is welcome.',
  'time-change': 'Please pass this on to anyone who might be coming.',
  welcome: 'Come as you are. There is a seat for you.',
  invite: 'I would love for you to come with me. Send me a message and we can sit together.',
};

/** The "When" line, or null: the date and the times, else the regular Sunday times. */
function whenLine(c: Content): string | null {
  const times = (c.when ?? []).map(spoken).filter(Boolean);
  const kicker = tidy(c.kicker);
  const date = tidy(c.date) || (isDate(kicker) ? kicker : '');
  if (c.kind === 'welcome' && times.length) return `Every week: ${listJoin(times)}`;
  if (date && times.length) return `When: ${date}, ${listJoin(times)}`;
  if (date) return `When: ${date}`;
  if (times.length) return `When: ${listJoin(times)}`;
  const standing = (c.standing ?? []).map(spoken).filter(Boolean);
  return standing.length ? `Sundays: ${listJoin(standing)}` : null;
}

/**
 * A ready-to-post Facebook or Instagram caption: what, when, where, the link, and an invitation.
 * `kind` defaults to the content's own.
 */
export function captionFor(content: Content, church: Church, kind: Kind = content.kind): string {
  const c = withoutNotes({ ...content, kind });
  const top = [headline(c)];
  if (kind === 'sermon') {
    const who = tidy(c.speaker);
    const ref = tidy(c.reference);
    if (who && ref) top.push(`${who} preaching from ${ref}.`);
    else if (who) top.push(`${who} preaching.`);
    else if (ref) top.push(`From ${ref}.`);
  }
  if (kind === 'invite') {
    const when = /^today$/i.test(tidy(c.kicker)) ? 'today' : 'this Sunday';
    top[0] = sentence(
      `${tidy(c.title).replace(/[.!]$/, '')} to ${church.line1} ${church.line2} ${when}`,
    );
  }
  if (tidy(c.body)) top.push(sentence(tidy(c.body)));
  if (kind === 'invite' && tidy(c.invitedBy)) top.push(`Invited by ${tidy(c.invitedBy)}.`);
  const facts = [
    whenLine(c),
    `Where: ${whereLine(church)}`,
    `${LINK_LABEL[kind]}: ${captionUrl(c, church)}`,
  ].filter(Boolean);
  return [top.filter(Boolean).join(' '), facts.join('\n'), INVITATION[kind]]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\s*[—–]\s*/g, ': ');
}

/**
 * The alt text: one or two sentences that read out the graphic's words, for the "Alternative
 * text" box on Facebook and Instagram (a screen reader cannot read the words in a picture).
 */
export function altTextFor(content: Content, church: Church, kind: Kind = content.kind): string {
  const c = withoutNotes({ ...content, kind });
  const name = `${church.line1} ${church.line2}`;
  const over = c.photo ? ', set over a photo,' : '';
  const kicker = tidy(c.kicker);
  let first: string;
  if (kind === 'verse') {
    const ref = [tidy(c.reference), tidy(c.translation)].filter(Boolean).join(', ');
    first = `A graphic from ${name}${over} with the verse “${tidy(c.title)}”${ref ? ` (${ref})` : ''}.`;
  } else {
    const title = tidy(c.title);
    const words = !kicker
      ? title
      : /[?!]$/.test(kicker)
        ? `${kicker} ${title}`
        : `${kicker}: ${title}`;
    first = `A graphic from ${name}${over} that reads “${sentence(words)}”`;
  }
  const times = (c.when ?? []).map(spoken).filter(Boolean);
  const date = tidy(c.date);
  const rest = [
    date && date !== kicker ? date : '',
    listJoin(times),
    kind === 'sermon' ? [tidy(c.reference), tidy(c.speaker)].filter(Boolean).join(', ') : '',
    kind === 'invite' && tidy(c.invitedBy) ? `Invited by ${tidy(c.invitedBy)}` : '',
    !times.length && c.standing?.length ? `Sundays: ${listJoin(c.standing.map(spoken))}` : '',
    tidy(c.link),
  ].filter(Boolean);
  return (rest.length ? `${first} Below it: ${rest.join('; ')}.` : first).replace(
    /\s*[—–]\s*/g,
    ': ',
  );
}
