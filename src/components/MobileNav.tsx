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
// Layout (FBC Auburn, rebuilt 2026-10-18): a full-screen night panel that comes alive as it opens.
// - Left: every menu link in large serif type, numbered in gold, arriving one after another. A
//   stone in the story's next colour (water, green, gold, red) slides in on hover and focus; the
//   page you are on keeps its stone (aria-current).
// - Right (first on phones): the This Sunday card (date, times, address, Directions, the visit
//   button), then the tagline, email, phone and socials when set.
// - Along the bottom: the sill, the same stones as the footer's, laying itself left to right.
// Motion is CSS only (src/styles/auburn.css, keyed on the panel's data-state="open"), and none of it
// runs under reduced motion. The trigger is a "Menu" pill at every width, its icon three stones; on
// a wide screen the header also shows the first four links.
//
// Data: the links, tagline, email, socials and the Sunday facts all come from the Header (Sanity
// Site settings and Church facts), with sensible defaults so the menu renders before content does.

import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { IconBrandInstagram, IconBrandFacebook } from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { telHref } from '@/lib/phone';
import { SILL, SILL_VIEWBOX } from '@/components/home/stones.generated';

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
  socialInstagram?: string;
  socialFacebook?: string;
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
  /** The current path, so the page you are on keeps its stone. */
  current?: string;
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
      <rect x="1" y="1" width="18" height="4" rx="2" fill="#3b83aa" />
      <rect x="1" y="7" width="13" height="4" rx="2" fill="#2c5b3a" />
      <rect x="1" y="13" width="16" height="4" rx="2" fill="#e8a93a" />
    </svg>
  );
}

// ---- Component --------------------------------------------------------------

export default function MobileNav({
  links,
  siteSettings,
  // logoLightUrl is still passed by Header.astro; the night menu uses the white logo only.
  logoDarkUrl,
  cta = DEFAULT_CTA,
  sunday,
  current,
}: Props) {
  const [open, setOpen] = useState(false);

  const tagline = siteSettings?.tagline ?? 'A small church with the door open.';
  const email = siteSettings?.email;
  const phone = siteSettings?.phone;
  const ig = siteSettings?.socialInstagram;
  const fb = siteSettings?.socialFacebook;

  const close = () => setOpen(false);
  // One running number across flat links and grouped ones, so the stagger and the colours flow.
  let n = 0;
  const linkBody = (label: string, i: number) => (
    <>
      <span className="auburn-menu__num" aria-hidden="true">
        {String(i + 1).padStart(2, '0')}
      </span>
      <span className={`auburn-menu__stone auburn-menu__stone--${i % 4}`} aria-hidden="true" />
      <span className="auburn-menu__label">{label}</span>
    </>
  );

  return (
    <div className="site-header__menu">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open the menu" className="menu-pill">
            <StonesIcon />
            <span>Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="auburn-menu" aria-describedby={undefined}>
          <SheetHeader className="auburn-menu__head">
            <SheetTitle className="auburn-menu__eyebrow">Menu</SheetTitle>
          </SheetHeader>

          <div className="auburn-menu__grid">
            <nav aria-label="All pages" className="auburn-menu__nav">
              <ul className="auburn-menu__main">
                {links.map((item) => {
                  if (item.kind === 'flat') {
                    const i = n++;
                    return (
                      <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
                        <a
                          href={item.href}
                          onClick={close}
                          aria-current={isCurrent(item.href, current) ? 'page' : undefined}
                        >
                          {linkBody(item.label, i)}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label} style={{ '--i': n } as React.CSSProperties}>
                      <p className="auburn-menu__group">{item.label}</p>
                      <ul className="auburn-menu__sub">
                        {item.items.map((sub) => {
                          const i = n++;
                          return (
                            <li key={sub.href}>
                              <a
                                href={sub.href}
                                onClick={close}
                                aria-current={isCurrent(sub.href, current) ? 'page' : undefined}
                              >
                                {linkBody(sub.label, i)}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="auburn-menu__side">
              {sunday && (
                <section className="auburn-menu__card" aria-label={sunday.title || 'This Sunday'}>
                  <div className="auburn-menu__card-top">
                    <p className="auburn-menu__card-eyebrow">{sunday.title || 'This Sunday'}</p>
                    {sunday.confirmed === false && (
                      <span className="auburn-menu__tag">Times to confirm</span>
                    )}
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
                  {sunday.street && (
                    <p className="auburn-menu__where">
                      {sunday.street}
                      {sunday.mapsUrl && (
                        <>
                          {' · '}
                          <a href={sunday.mapsUrl} rel="noopener" target="_blank">
                            Directions
                            <span className="sr-only"> (opens Google Maps in a new tab)</span>
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  {cta.show && (
                    <a href={cta.href} onClick={close} className="btn-auburn btn-auburn--primary">
                      {cta.label}
                    </a>
                  )}
                </section>
              )}
              {cta.show && !sunday && (
                <a href={cta.href} onClick={close} className="btn-auburn btn-auburn--primary">
                  {cta.label}
                </a>
              )}
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
              {(ig || fb) && (
                <div className="auburn-menu__social">
                  {ig && (
                    <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <IconBrandInstagram size={20} stroke={1.5} />
                    </a>
                  )}
                  {fb && (
                    <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <IconBrandFacebook size={20} stroke={1.5} />
                    </a>
                  )}
                </div>
              )}
              {logoDarkUrl && (
                <img
                  src={logoDarkUrl}
                  alt="First Baptist Church of Auburn"
                  width={280}
                  height={100}
                  className="auburn-menu__logo"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          </div>

          <div className="auburn-menu__sill" aria-hidden="true">
            <svg viewBox={SILL_VIEWBOX} preserveAspectRatio="xMidYMid slice" focusable="false">
              {SILL.map((s, i) => (
                <path key={i} d={s.d} fill={s.fill} style={{ '--i': i } as React.CSSProperties} />
              ))}
            </svg>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
