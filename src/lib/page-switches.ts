// Safe to edit by hand
// The "Show in the top menu" and "Show in the footer" switches on a custom page (2026-10-18).
// They existed in the Studio but nothing read them, so ticking one did nothing. Now a ticked page
// is added to the END of the menu (Site settings > Navigation keeps its own order) and to the
// LAST footer row, unless it is already listed there. Site settings stays the place to put a page
// somewhere particular; the switches are the quick way for a new page.
import { withTrailingSlash } from './href.ts';
import type { NavItem, FooterColumn } from './siteSettings.ts';

export interface PageSwitch {
  title?: string | null;
  slug?: string | null;
  navLabel?: string | null;
  addToMainNav?: boolean | null;
  addToFooter?: boolean | null;
}

export function mergePageSwitches(
  nav: NavItem[],
  footer: FooterColumn[],
  pages: (PageSwitch | null)[] | null | undefined,
): { nav: NavItem[]; footer: FooterColumn[] } {
  const list = (pages ?? []).filter((p): p is PageSwitch => !!p?.slug?.trim());
  const link = (p: PageSwitch) => ({
    label: (p.navLabel?.trim() || p.title?.trim() || p.slug!.trim()) as string,
    href: withTrailingSlash(`/${p.slug!.trim()}`),
  });

  const inNav = new Set(
    nav.flatMap((i) => (i.kind === 'flat' ? [i.href] : i.items.map((x) => x.href))),
  );
  const addNav = list
    .filter((p) => p.addToMainNav)
    .map(link)
    .filter((l) => !inNav.has(l.href))
    .map((l) => ({ kind: 'flat' as const, ...l }));

  const inFooter = new Set(footer.flatMap((c) => c.links.map((l) => l.href)));
  const addFooter = list
    .filter((p) => p.addToFooter)
    .map(link)
    .filter((l) => !inFooter.has(l.href));
  let outFooter = footer;
  if (addFooter.length > 0) {
    outFooter =
      footer.length > 0
        ? footer.map((c, i) =>
            i === footer.length - 1 ? { ...c, links: [...c.links, ...addFooter] } : c,
          )
        : [{ title: 'More', links: addFooter }];
  }
  return { nav: [...nav, ...addNav], footer: outFooter };
}
