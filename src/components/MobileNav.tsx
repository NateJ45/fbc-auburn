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
// Layout (FBC Auburn, 2026-10-17): a full-screen night panel, as in the mockups. Left: every
// menu link in large serif type (dropdown groups as a small heading over their links). Right: the
// main button, the tagline, email and phone, socials, the white logo. The trigger is a "Menu" pill
// shown at every width; on a wide screen the header also shows the first four links.
//
// Data: tagline, email, social URLs all come from Sanity siteSettings via
// the Header, with sensible defaults so the menu renders cleanly before
// content is wired up.

import { useState } from 'react';
import { Menu, Mail, Phone } from 'lucide-react';
import { IconBrandInstagram, IconBrandFacebook } from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { telHref } from '@/lib/phone';

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
}

/** Built-in drawer button, matching the header's own default. */
const DEFAULT_CTA = { show: true, label: 'Plan your visit', href: '/plan-your-visit/' };

// ---- Component --------------------------------------------------------------

export default function MobileNav({
  links,
  siteSettings,
  // logoLightUrl is still passed by Header.astro; the night menu uses the white logo only.
  logoDarkUrl,
  cta = DEFAULT_CTA,
}: Props) {
  const [open, setOpen] = useState(false);

  const tagline = siteSettings?.tagline ?? 'A small church with the door open.';
  const email = siteSettings?.email;
  const phone = siteSettings?.phone;
  const ig = siteSettings?.socialInstagram;
  const fb = siteSettings?.socialFacebook;

  const close = () => setOpen(false);

  return (
    <div className="site-header__menu">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open the menu" className="menu-pill">
            <Menu size={18} aria-hidden="true" />
            <span>Menu</span>
          </button>
        </SheetTrigger>
        {/* FBC Auburn: the full-screen night menu from the mockups (src/styles/auburn.css,
            .auburn-menu). Every page in the menu, large; the header shows only the first four. */}
        <SheetContent side="right" className="auburn-menu">
          <SheetHeader className="auburn-menu__head">
            <SheetTitle className="auburn-menu__eyebrow">Menu</SheetTitle>
          </SheetHeader>

          <div className="auburn-menu__grid">
            <nav aria-label="All pages">
              <ul className="auburn-menu__main">
                {links.map((item) =>
                  item.kind === 'flat' ? (
                    <li key={item.href}>
                      <a href={item.href} onClick={close}>
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <p className="auburn-menu__group">{item.label}</p>
                      <ul className="auburn-menu__sub">
                        {item.items.map((sub) => (
                          <li key={sub.href}>
                            <a href={sub.href} onClick={close}>
                              {sub.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="auburn-menu__side">
              {cta.show && (
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
