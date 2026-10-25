// Safe to edit by hand
// The one place line (design audit L1 and UX audit L3, 2026-10-25). The logo said "AUBURN, OHIO",
// the Home hero "HAMILTON, OH 45013" and the footer "Ross Township": three answers to "where is
// it?". Now the hero's name line ("First Baptist Church of Auburn") is followed by the town from the
// address with no ZIP, and the header lockup's small line reads "Auburn · <town>". Both come from
// Church facts (the address's second line), so nothing is typed twice.

/** "Hamilton, OH 45013" -> "Hamilton, OH". */
export function townOf(cityLine: string | undefined | null): string {
  return (cityLine ?? '').replace(/\s+\d{5}(?:-\d{4})?\s*$/, '').trim();
}

/** The lockup's place line: "Auburn · Hamilton, OH" (just "Auburn" with no address yet). */
export function placeLine(cityLine: string | undefined | null): string {
  const town = townOf(cityLine);
  return town ? `Auburn · ${town}` : 'Auburn';
}
