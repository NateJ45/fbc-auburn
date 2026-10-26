// Safe to edit by hand
// Whether the Studio shows the website's own newsletter (card 127: issues written in the Studio,
// sent to a list the website keeps). FBC Auburn keeps its email list in Church Trac (decided
// 2026-10-24: the sign-up goes to the Church Trac form in Site settings > Church Trac), so it is
// off, and the Studio leaves out every screen for writing and sending an issue (2026-10-26):
// Home's Newsletter card (kit `features.newsletter`, starter card 163), the Quick update job and
// the Home tile (kit.config.ts), Content > Newsletter (structure.ts), the "+" menu
// (sanity.config.ts), the Site Guide page and its video script (guides/), and the tours
// (studio-tours.ts). The schema type stays registered, so nothing is lost.
//
// To bring it back: set this to true, switch on the list (Site settings > Newsletter and the
// Worker's mail settings, OPERATIONS.md "Email"), and put the newsletter lines back in the
// weekly guide (guides/weekly.ts) and the Quick update guide (guides/content.ts).
export const OWN_NEWSLETTER = false;

/** The Quick update entries that belong to the website's own newsletter. */
export const OWN_NEWSLETTER_JOBS = new Set(['newsletter', 'send-newsletter']);

/** The Site Guide page and tour about it. */
export const OWN_NEWSLETTER_GUIDE = 'send-the-newsletter';
export const OWN_NEWSLETTER_TOUR = 'newsletter-editor';
