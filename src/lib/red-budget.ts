// Safe to edit by hand
// The one-red-button budget's header rule (re-audit 2026-10-26, Nathan's call). The header's
// "Plan your visit" stays red on every page. A button in the page body that goes where the header
// button goes (while the header shows it) repeats it, so it draws navy, never a second red: Home's
// hero "Plan your first visit" included. The page's own red then goes to its next step that is not
// a repeat ("Tell us you are coming"), or to nothing, which is fine.
//
// Pure, so it is unit-tested (red-budget.test.ts). SectionRenderer.astro hands the body red to the
// first block that asks for it and does not repeat the header; HomeHero.astro asks the same question.

export interface HeaderButton {
  show: boolean;
  href: string;
}

/** "/plan-your-visit/?x#y" -> "/plan-your-visit": the page a link opens, for comparing. */
function pagePath(href: string): string {
  const path = href.trim().replace(/[?#].*$/, '');
  return path.replace(/\/+$/, '') || '/';
}

/** True when a body button goes to the page the header button opens, and the header shows it. */
export function repeatsHeaderCta(
  href: string | null | undefined,
  header: HeaderButton | null | undefined,
): boolean {
  if (!href || !header?.show || !header.href) return false;
  // Only site pages: an off-site header button (online giving) is never "repeated" by a path.
  if (!header.href.startsWith('/') || !href.startsWith('/')) return false;
  return pagePath(href) === pagePath(header.href);
}
