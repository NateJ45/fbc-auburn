// Safe to edit by hand
// =============================================================================
// newsletter-content - FBC Auburn's newsletter: what an issue holds, the brand,
// the footer address (the email backbone, PORTS.md card 127)
// =============================================================================
// The send engine (src/lib/mail-newsletter.ts, PORTABLE) knows nothing about
// sermons or Church Trac. This file says what an Auburn issue is made of:
//
//   This week's sermon  the one picked on the issue, else the newest sermon
//                       (rule 15: derived, not retyped).
//   Notices             typed on the issue.
//   Coming up           the Church Trac calendar's next dated events, fetched
//                       when the issue is SENT (so the list is current), over
//                       the issue's "how many days ahead". Weekly meetings are
//                       left out: everyone knows Sunday is Sunday.
//   A closing note      typed on the issue.
//
// The footer address is Church facts' address (CAN-SPAM). Runs in the Worker
// at send time and at build time for the archive (src/pages/newsletter/), which
// leaves out "Coming up": an archived issue should not list next week's events.
// =============================================================================
import brandConfig from '../../brand/brand.config.json';
import { site } from '@/data/site';
import { sanityFetch } from '@/lib/sanity';
import { getSiteSettings } from '@/lib/queries';
import { resolveChurchFacts } from '@/lib/church-facts';
import { fetchFeed } from '@/lib/church-feeds';
import {
  addDays,
  churchClock,
  parseIcs,
  whatsOn,
  whenLine,
  timeLabel,
} from '@/lib/church-calendar';
import { preacherName, sermonHref } from '@/lib/sermons';
import { brandFromConfig, type MailItem } from '@/lib/mail-template';
import type { IssueContent } from '@/lib/mail-newsletter';

/** The list's name in sentences: "signed up for <LIST_NAME>". */
export const LIST_NAME = 'the First Baptist Auburn newsletter';

/** Dates in emails (RSVP confirmations) are shown in the church's time zone. */
export const TIME_ZONE = 'America/New_York';

export const MAIL_BRAND = brandFromConfig(brandConfig, site.name, site.url);

/** Church facts' address, the postal address every list email must carry. */
export async function mailAddress(): Promise<string> {
  const facts = resolveChurchFacts(await getSiteSettings().catch(() => null));
  return facts.address?.lines.join('\n') || site.name;
}

export const issuePath = (slug: string) => `/newsletter/${slug}/`;

export const ISSUE_PROJECTION = `{
  _id, subject, preheader, intro, "slug": slug.current, showOnWebsite, date,
  includeSermon, includeEvents, eventDays,
  "sermon": coalesce(
    sermon->{ title, "slug": slug.current, date, passage, summary, guestPreacher, "preacher": preacher->{ name } },
    *[_type == "sermon" && defined(slug.current)] | order(date desc)[0]{ title, "slug": slug.current, date, passage, summary, guestPreacher, "preacher": preacher->{ name } }
  ),
  notices[]{ title, text, link },
  note
}`;

interface RawIssue {
  _id: string;
  subject?: string;
  preheader?: string;
  intro?: string;
  slug?: string;
  showOnWebsite?: boolean;
  date?: string;
  includeSermon?: boolean;
  includeEvents?: boolean;
  eventDays?: number;
  sermon?: {
    title?: string;
    slug?: string;
    date?: string;
    passage?: string;
    summary?: string;
    guestPreacher?: string;
    preacher?: { name?: string } | null;
  } | null;
  notices?: Array<{ title?: string; text?: string; link?: string }> | null;
  note?: { heading?: string; text?: string } | null;
}

/** The next dated Church Trac events, as email items. Empty on any failure. */
async function comingUp(days: number): Promise<MailItem[]> {
  const facts = resolveChurchFacts(await getSiteSettings().catch(() => null));
  if (!facts.icalUrl) return [];
  const text = await fetchFeed(
    facts.icalUrl,
    (t) => /BEGIN:VCALENDAR/i.test(t),
    'newsletter-events',
  );
  if (!text) return [];
  const now = new Date();
  const until = addDays(churchClock(now).date, days);
  return whatsOn(parseIcs(text), now)
    .months.flatMap((m) => m.items)
    .filter((it) => it.date <= until)
    .slice(0, 8)
    .map((it) => ({
      title: it.title,
      meta: [whenLine(it), it.startMinutes !== null ? timeLabel(it.startMinutes) : '']
        .filter(Boolean)
        .join(', '),
      text: it.location || undefined,
    }));
}

export function issueFromRaw(
  raw: RawIssue | null,
  origin: string = site.url,
  events: MailItem[] = [],
): IssueContent | null {
  if (!raw?._id || !raw.subject) return null;
  const sections: IssueContent['sections'] = [];
  const s = raw.sermon;
  if (raw.includeSermon !== false && s?.title && s.slug) {
    const who = preacherName({
      preacher: s.preacher ?? null,
      guestPreacher: s.guestPreacher ?? null,
    });
    sections.push({
      heading: "This week's sermon",
      items: [
        {
          title: s.title,
          meta: [s.passage, who].filter(Boolean).join(', ') || undefined,
          text: s.summary,
          url: `${origin}${sermonHref(s.slug)}`,
          linkLabel: 'Watch or listen',
        },
      ],
    });
  }
  const notices: MailItem[] = (raw.notices ?? [])
    .filter((n) => n?.title)
    .map((n) => ({
      title: n.title as string,
      text: n.text,
      url: n.link,
      linkLabel: n.link ? 'Find out more' : undefined,
    }));
  if (notices.length) sections.push({ heading: 'Notices', items: notices });
  if (events.length) sections.push({ heading: 'Coming up', items: events });
  return {
    id: raw._id,
    subject: raw.subject,
    preheader: raw.preheader,
    intro: raw.intro,
    sections,
    note: raw.note?.text ? { heading: raw.note.heading, text: raw.note.text } : undefined,
    webUrl: raw.showOnWebsite !== false && raw.slug ? `${origin}${issuePath(raw.slug)}` : undefined,
  };
}

/** The published issue (never a draft), ready for the template, with this week's events. */
export async function loadIssue(id: string, origin?: string): Promise<IssueContent | null> {
  if (id.startsWith('drafts.')) return null;
  const raw = await sanityFetch<RawIssue>(
    `*[_type == "newsletter" && _id == $id][0]${ISSUE_PROJECTION}`,
    { id },
    null,
  ).catch(() => null);
  if (!raw) return null;
  const events =
    raw.includeEvents !== false
      ? await comingUp(Math.min(Math.max(raw.eventDays ?? 14, 1), 60)).catch(() => [])
      : [];
  return issueFromRaw(raw, origin, events);
}

/** Every issue the archive shows, newest first (build time). */
export async function archiveIssues(): Promise<Array<RawIssue & { slug: string }>> {
  const rows = await sanityFetch<RawIssue>(
    `*[_type == "newsletter" && showOnWebsite != false && defined(slug.current) && defined(date) && date <= now()] | order(date desc)${ISSUE_PROJECTION}`,
    {},
    [],
  );
  return rows.filter((r): r is RawIssue & { slug: string } => Boolean(r.slug));
}
