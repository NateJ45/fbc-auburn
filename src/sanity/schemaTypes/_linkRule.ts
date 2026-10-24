// Foundation, edit with care
// =============================================================================
// _linkRule - the validation a link box shares so it can hold a Church systems
// link placeholder such as {giving} (2026-10-24, from fbcm's _linkRule.ts,
// PORTS.md card 152; docs/agent/church-trac.md)
// =============================================================================
// WHY `uri({ allowRelative: true })` IS PART OF IT. Sanity gives every `url`
// field a hidden default rule, "an absolute http or https address", and a
// custom rule alone cannot lift it: the default is only dropped when the field
// declares its OWN uri rule. A relative uri rule accepts "{giving}", because
// the URL parser reads it as a relative path. The custom half then does the
// real work (checkLinkBox in src/lib/church-links.ts): a braced word must be a
// known placeholder, and a box that used to demand a full address still does,
// unless it holds a placeholder.
// =============================================================================
import type { UrlRule } from 'sanity';
import { checkLinkBox } from '../../lib/church-links.ts';

type Scheme = 'http' | 'https' | 'mailto' | 'tel';

/**
 * Validation for a `url` link box that may hold a link placeholder.
 * `absoluteOnly`: the box took only a full address before, so a relative path
 * still is not allowed.
 */
export function linkRule(
  opts: { absoluteOnly?: boolean; scheme?: Scheme[] } = {},
): (R: UrlRule) => UrlRule {
  const scheme = opts.scheme ?? ['http', 'https', 'mailto', 'tel'];
  return (R) =>
    R.uri({ allowRelative: true, scheme }).custom((value) =>
      checkLinkBox(value, opts.absoluteOnly ?? false),
    );
}

export { LINK_TOKEN_HINT } from '../../lib/church-links.ts';
