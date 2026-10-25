// Foundation, edit with care
// Mobile nav drawer. Uses shadcn Sheet (Radix Dialog under the hood).
//
// HYDRATED AT client:idle, NOT client:only (2026-09-18). This file said for a
// long time that the Sheet had to be client:only="react" because Radix's
// portal hook threw "Invalid hook call" during Astro's server render. That is
// not true of the versions this starter pins: a closed Sheet server-renders
// only its trigger button, the portal mounts nothing until the drawer opens,
// and every page prerenders without a complaint. Verified against the sibling
// stonesteps-50k build, which ships the identical ui/sheet.tsx at client:idle
// on the same react 19.2.7 / radix-ui 1.4.3 / astro 7.x set.
//
// What client:only cost was the hamburger: it skips SSR entirely, so the
// trigger was absent from the server HTML until React loaded. client:idle puts
// the button in the markup and defers the runtime behind requestIdleCallback.
//
// If a future island genuinely cannot server-render, the symptom is an
// "Invalid hook call" thrown during the build's server render, and
// client:only="react" is still the escape hatch. VisualEditingOverlay in
// PreviewLayout.astro uses it for that kind of reason.
//
//
// Layout (FBC Auburn, rebuilt 2026-10-24 after hppres.org): a full-screen sheet on the light page
// ground, a stack of big serif rows.
// - Top: the lockup on the left and the close button on the right, where the header's own sit, so
//   opening the menu reads as the page turning over rather than a panel arriving.
// - Search (when on) as a field-shaped row, then one full-width row per menu item: the label in
//   Young Serif, a long thin arrow at the right, hairlines between. A row with children is a button
//   (aria-expanded): open, it fills auburn red, its arrow turns down and its pages list beneath it
//   in a smaller size. One group is open at a time. The page you are on is marked with a red stone.
// - Phones and tablets (below 64rem, 2026-10-24): straight under the search field, a compact This
//   Sunday card (date, times, Directions; a "Live now" row only while worship streams) and a
//   full-width visit button, then the rows, then the tagline, email, phone and socials, then the
//   sill. People open the menu to find times; the card was about 1.4 screens down below the rows.
// - From 64rem the rows take the left column and the full card (address, the watch row, the visit
//   button) and contact details the right, as before. Each card is display:none at the other
//   width (auburn.css), so only one is ever in the focus order or the accessibility tree.
// - A row that points where the visit button does is dropped, so "Plan your visit" is never listed
//   twice.
// Motion is CSS only (src/styles/auburn.css, keyed on the sheet's data-state="open"): the rows rise
// in 40ms apart, and none of it runs under reduced motion. Focus trap, Escape, the scroll lock and
// focus return all come from Radix Dialog. The trigger is a "Menu" pill at every width, its icon
// three stones; on a wide screen the header also shows the first four links.
//
// Data: the links, tagline, email, socials and the Sunday facts all come from the Header (Sanity
// Site settings and Church facts), with sensible defaults so the menu renders before content does.

import { useEffect, useId, useRef, useState } from 'react';
import { Mail, Phone, Search, XIcon } from 'lucide-react';
import { socialLabel, type SocialLink } from '@/lib/social-links';
import { socialIcon } from '@/lib/social-icons';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { telHref } from '@/lib/phone';
import { SILL, SILL_PRINT, SILL_VIEWBOX } from '@/components/home/stones.generated';

// ---- Types ------------------------------------------------------------------

interface FlatNavLink {
  kind: 'flat';
  label: string;
  href: string;
}

interface DropdownNavGroup {
  kind: 'dropdown';
  label: string;
  items: { label: string; href: string }[];
}

type NavItem = FlatNavLink | DropdownNavGroup;

interface MobileNavSiteSettings {
  tagline?: string;
  email?: string;
  phone?: string;
  /** Every social account, resolved by the Header (src/lib/social-links.ts). */
  socials?: SocialLink[];
}

interface MenuSunday {
  times: string;
  street?: string;
  mapsUrl?: string;
  /** "This Sunday" or "Today". */
  title?: string;
  /** "October 18" */
  date?: string;
  services?: { time: string; label: string }[];
  confirmed?: boolean;
}

interface Props {
  links: NavItem[];
  siteSettings?: MobileNavSiteSettings | null;
  /**
   * Optimized logo URLs pre-rendered by Astro's getImage() in the parent
   * Header.astro. A React island cannot call Astro's build-time image
   * pipeline itself, so the parent does the work once at build time and
   * passes the resulting WebP URLs in as plain strings.
   */
  logoLightUrl?: string;
  logoDarkUrl?: string;
  /**
   * The drawer's primary button. Header.astro only passes this when the editor
   * has changed it in Site Settings, so an untouched site serializes no extra
   * island props.
   */
  cta?: { show: boolean; label: string; href: string };
  /** Sunday facts, from Church facts, for the This Sunday card. */
  sunday?: MenuSunday;
  /**
   * Where Sunday streams (Church facts, src/lib/live-service.ts): a row under the address in the
   * This Sunday card. It reads "Live now" with a dot while worship is streaming, from the answer
   * src/lib/live-client.ts leaves on window.__churchLive (2026-10-24).
   */
  watch?: { href: string; label: string };
  /** The current path, so the page you are on keeps its stone. */
  current?: string;
  /**
   * Visitor search is on (src/data/site.ts search.enabled, PORTS.md card 126): a round search
   * button beside the Menu pill at every width, and a "Search the site" row at the top of the
   * menu. Both are real links to /search/ that open the header's search dialog
   * (src/components/search/SiteSearch.astro). Header.astro passes it only when search is on.
   */
  search?: boolean;
}

/** Built-in drawer button, matching the header's own default. */
const DEFAULT_CTA = { show: true, label: 'Plan your visit', href: '/plan-your-visit/' };

const isCurrent = (href: string, current?: string) =>
  !!current && (href === '/' ? current === '/' : current.startsWith(href.replace(/\/?$/, '/')));

/** The Menu pill's icon: three stones in the mark's colours instead of three lines. */
function StonesIcon() {
  return (
    <svg
      className="menu-pill__stones"
      width="20"
      height="18"
      viewBox="0 0 20 18"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="18" height="4" rx="2" fill="#2C4F7C" />
      <rect x="1" y="7" width="13" height="4" rx="2" fill="#2C4F7C" />
      <rect x="1" y="13" width="16" height="4" rx="2" fill="#B5503A" />
    </svg>
  );
}

/** The long thin arrow at the right of every row. A group's turns down when it opens (CSS). */
function RowArrow() {
  return (
    <svg
      className="auburn-menu__arrow"
      viewBox="0 0 48 14"
      width="48"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 7h46M40 1l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Same page, ignoring a trailing slash, so "/plan-your-visit" matches "/plan-your-visit/". */
const samePath = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

/**
 * The This Sunday card's insides. `compact` is the phone card under the search field: the date,
 * the times and Directions, with the watch row only while worship is live. The full card (64rem
 * up) adds the street and the watch row; the visit button is the caller's.
 */
function SundayCardBody({
  sunday,
  watch,
  live,
  compact = false,
}: {
  sunday: MenuSunday;
  watch?: { href: string; label: string };
  live?: { live: boolean; href?: string };
  compact?: boolean;
}) {
  const directions = sunday.mapsUrl && (
    <a href={sunday.mapsUrl} rel="noopener" target="_blank">
      Directions
      <span className="sr-only"> (opens Google Maps in a new tab)</span>
    </a>
  );
  const showWatch = watch && (!compact || live?.live);
  return (
    <>
      <div className="auburn-menu__card-top">
        <p className="auburn-menu__card-eyebrow">{sunday.title || 'This Sunday'}</p>
        {sunday.confirmed === false && <span className="auburn-menu__tag">Times to confirm</span>}
      </div>
      {sunday.date && <p className="auburn-menu__card-date">{sunday.date}</p>}
      {sunday.services && sunday.services.length > 0 ? (
        <dl className="auburn-menu__card-times">
          {sunday.services.map((s) => (
            <div key={s.time + s.label}>
              <dt>{s.time}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="auburn-menu__times">{sunday.times}</p>
      )}
      {compact
        ? directions && (
            <p className="auburn-menu__where auburn-menu__where--compact">{directions}</p>
          )
        : sunday.street && (
            <p className="auburn-menu__where">
              {sunday.street}
              {directions && (
                <>
                  {' · '}
                  {directions}
                </>
              )}
            </p>
          )}
      {showWatch && watch && (
        <p className="auburn-menu__watch">
          <a
            href={(live?.live && live.href) || watch.href}
            target="_blank"
            rel="noopener noreferrer"
            data-live={live?.live ? '' : undefined}
          >
            <span className="auburn-menu__live-dot" aria-hidden="true" />
            {live?.live ? 'Live now: watch the service' : watch.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}
    </>
  );
}

// ---- Component --------------------------------------------------------------

export default function MobileNav({
  links,
  siteSettings,
  // logoDarkUrl is still passed by Header.astro; the light sheet uses the light logo.
  logoLightUrl,
  cta = DEFAULT_CTA,
  sunday,
  watch,
  current,
  search = false,
}: Props) {
  const [open, setOpen] = useState(false);
  // The group that is open, by its label. The one holding the current page starts open, so the
  // visitor sees where they are; the rest start closed.
  const currentGroup = links.find(
    (item) => item.kind === 'dropdown' && item.items.some((sub) => isCurrent(sub.href, current)),
  )?.label;
  const [expanded, setExpanded] = useState<string | undefined>(currentGroup);
  const baseId = useId();
  // The live state, kept in step with live-client.ts while the island is on the page.
  const [live, setLive] = useState<{ live: boolean; href?: string } | undefined>(undefined);
  useEffect(() => {
    setLive(window.__churchLive);
    const onLive = (e: Event) =>
      setLive((e as CustomEvent<{ live: boolean; href?: string }>).detail);
    document.addEventListener('church:live', onLive);
    return () => document.removeEventListener('church:live', onLive);
  }, []);
  // Close as a View Transitions navigation starts (a link inside the menu, Back or Forward), so
  // the scroll lock is released before the router swaps the page.
  useEffect(() => {
    const onNavigate = () => setOpen(false);
    document.addEventListener('astro:before-preparation', onNavigate);
    return () => document.removeEventListener('astro:before-preparation', onNavigate);
  }, []);
  // Set when the visitor picks "Search the site" inside the menu: the menu closes first, and the
  // search dialog opens once Radix has handed focus back (onCloseAutoFocus below), so the two
  // modals never fight over focus.
  const searchNext = useRef(false);

  const tagline = siteSettings?.tagline ?? 'A close-knit church with the door open.';
  const email = siteSettings?.email;
  const phone = siteSettings?.phone;
  const socials = siteSettings?.socials ?? [];

  // The rows, less any that duplicates the visit button below the search field.
  const rows = cta.show
    ? links.filter((item) => !(item.kind === 'flat' && samePath(item.href, cta.href)))
    : links;

  const close = () => setOpen(false);
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // Each opening starts from the same place: the current page's group, or none.
    if (next) setExpanded(currentGroup);
  };

  // The stagger index runs on past the rows, so the card and contact details follow them in.
  let n = 0;
  const step = () => ({ '--i': n++ }) as React.CSSProperties;

  return (
    <div className="site-header__menu">
      {search && (
        <a
          href="/search/"
          className="search-pill"
          aria-label="Search the site"
          data-site-search-open
        >
          <Search size={20} strokeWidth={2} aria-hidden="true" />
        </a>
      )}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open the menu" className="menu-pill">
            <StonesIcon />
            <span>Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="auburn-menu"
          showCloseButton={false}
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            if (!searchNext.current) return;
            searchNext.current = false;
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('site-search:open'));
          }}
        >
          <SheetHeader className="auburn-menu__head">
            {logoLightUrl ? (
              <img
                src={logoLightUrl}
                alt=""
                width={496}
                height={100}
                className="auburn-menu__logo"
                decoding="async"
              />
            ) : (
              <span />
            )}
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetClose className="auburn-menu__close">
              <XIcon size={22} strokeWidth={1.75} aria-hidden="true" />
              <span className="sr-only">Close the menu</span>
            </SheetClose>
          </SheetHeader>

          <div className="auburn-menu__grid">
            <div className="auburn-menu__primary">
              {search && (
                <a
                  href="/search/"
                  className="auburn-menu__search"
                  style={step()}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                    e.preventDefault();
                    searchNext.current = true;
                    close();
                  }}
                >
                  <Search size={20} aria-hidden="true" />
                  Search the site
                </a>
              )}
              {(sunday || cta.show) && (
                <div className="auburn-menu__visit" style={step()}>
                  {sunday && (
                    <section
                      className="auburn-menu__card auburn-menu__card--compact"
                      aria-label={sunday.title || 'This Sunday'}
                    >
                      <SundayCardBody sunday={sunday} watch={watch} live={live} compact />
                    </section>
                  )}
                  {cta.show && (
                    <a href={cta.href} onClick={close} className="btn-auburn btn-auburn--primary">
                      {cta.label}
                    </a>
                  )}
                </div>
              )}
              <nav aria-label="All pages" className="auburn-menu__nav">
                <ul className="auburn-menu__rows">
                  {rows.map((item) => {
                    if (item.kind === 'flat') {
                      const here = isCurrent(item.href, current);
                      return (
                        <li key={item.href} className="auburn-menu__item" style={step()}>
                          <a
                            href={item.href}
                            onClick={close}
                            className="auburn-menu__row"
                            aria-current={here ? 'page' : undefined}
                          >
                            <span className="auburn-menu__label">{item.label}</span>
                            <RowArrow />
                          </a>
                        </li>
                      );
                    }
                    const isOpen = expanded === item.label;
                    const panelId = `${baseId}-group-${item.label.replace(/\W+/g, '-')}`;
                    return (
                      <li
                        key={item.label}
                        className="auburn-menu__item"
                        data-open={isOpen ? '' : undefined}
                        style={step()}
                      >
                        <button
                          type="button"
                          className="auburn-menu__row"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setExpanded(isOpen ? undefined : item.label)}
                        >
                          <span className="auburn-menu__label">{item.label}</span>
                          <RowArrow />
                        </button>
                        <ul id={panelId} className="auburn-menu__sub" hidden={!isOpen}>
                          {item.items.map((sub, j) => (
                            <li key={sub.href} style={{ '--j': j } as React.CSSProperties}>
                              <a
                                href={sub.href}
                                onClick={close}
                                aria-current={isCurrent(sub.href, current) ? 'page' : undefined}
                              >
                                {sub.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="auburn-menu__side">
              {sunday && (
                <section
                  className="auburn-menu__card auburn-menu__card--full"
                  aria-label={sunday.title || 'This Sunday'}
                  style={step()}
                >
                  <SundayCardBody sunday={sunday} watch={watch} live={live} />
                  {cta.show && (
                    <a href={cta.href} onClick={close} className="btn-auburn btn-auburn--primary">
                      {cta.label}
                    </a>
                  )}
                </section>
              )}
              {cta.show && !sunday && (
                <a
                  href={cta.href}
                  onClick={close}
                  className="btn-auburn btn-auburn--primary auburn-menu__side-cta"
                  style={step()}
                >
                  {cta.label}
                </a>
              )}
              <div className="auburn-menu__about" style={step()}>
                <p className="auburn-menu__tagline">{tagline}</p>
                {(email || phone) && (
                  <div className="auburn-menu__contact">
                    {email && (
                      <a href={`mailto:${email}`}>
                        <Mail size={16} aria-hidden="true" />
                        {email}
                      </a>
                    )}
                    {phone && (
                      <a href={telHref(phone)}>
                        <Phone size={16} aria-hidden="true" />
                        {phone}
                      </a>
                    )}
                  </div>
                )}
                {socials.length > 0 && (
                  <div className="auburn-menu__social">
                    {socials.map((link) => {
                      const Icon = socialIcon(link.platform);
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={socialLabel(link)}
                        >
                          <Icon size={20} stroke={1.5} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="auburn-menu__sill" aria-hidden="true">
            <svg viewBox={SILL_VIEWBOX} preserveAspectRatio="xMidYMid slice" focusable="false">
              {/* The linocut flecks: a mask over the bricks (scripts/lib/brick-print.mjs). */}
              <g
                dangerouslySetInnerHTML={{
                  __html: SILL_PRINT.replaceAll('__ID__', 'menu-sill-print'),
                }}
              />
              <g mask="url(#menu-sill-print)">
                {SILL.map((s, i) => (
                  <path
                    key={i}
                    className="sill-brick"
                    d={s.d}
                    fill={s.fill}
                    style={{ '--i': i } as React.CSSProperties}
                  />
                ))}
              </g>
            </svg>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
