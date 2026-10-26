// Foundation, edit with care (the words are safe to edit)
// =============================================================================
// "Invite a helper": the Studio's People tool, the pure half (2026-10-26)
// =============================================================================
// An administrator adds a deacon or a secretary from inside the Studio: a name,
// an email and a plain-words role. Two roles, in the pastor's words:
//
//   Helper         edits pages and posts, gets the simple staff view, and cannot
//                  delete anything for good. Sanity role: `editor`.
//   Administrator  everything, including this tool. Sanity role: `administrator`.
//
// The route (src/pages/api/studio/people.ts) is a thin shell over
// handlePeople() below, so the unit tests (studio-people.test.ts) reach every
// rule: who may call it, what a valid request is, which Sanity role a plain role
// becomes, and what the tool says when the plan cannot do something.
//
// WHAT SANITY ALLOWS (read from the docs and this project's own API, 2026-10-26)
//   - Invitations live in the Access API:
//       GET    https://api.sanity.io/v2025-07-11/access/project/<id>/invites
//       POST   .../invites            { email, role }  (Sanity sends the email)
//       DELETE .../invites/<inviteId> (revoke)
//       GET    .../users              (members and their role names)
//     Inviting and revoking need `sanity.project.members.invite`; listing needs
//     `sanity.project.members.read`. There is no "resend": a resend is revoke,
//     then invite again (one pending invite per email and role).
//   - "Only administrators can invite other administrators", and a robot token
//     can never hold the Administrator role (appliesToRobots: false). So an
//     Administrator invite (and cancelling one) is sent with the CALLER's own
//     session, which this route has already checked is a project administrator.
//     Everything else uses the Worker secret SANITY_MEMBERS_TOKEN, a robot token
//     with the "Access Manager (Token only)" role: members and invites, no
//     content access at all.
//   - Roles by plan (sanity.io/docs/user-guides/roles): Administrator and Viewer
//     on every plan; Editor, Developer and Contributor on Growth (and during the
//     Growth trial every new project starts on). Custom roles are Enterprise
//     only. On the Free plan there is no role that can edit without being an
//     Administrator, so the tool cannot make a Helper there and says so, with
//     the steps in sanity.io/manage, instead of failing. The project's
//     `roleEditor` feature flag is how the route tells.
//
// Nothing is stored: the name is only used in the reply ("Invitation sent to
// Ruth"); Sanity's invitation email asks the person for their own name. Emails
// pass through to Sanity and back to the signed-in administrator, never into
// the public dataset or a log.
// =============================================================================

import type { StudioUser } from './studio-auth';

// -----------------------------------------------------------------------------
// Roles in plain words
// -----------------------------------------------------------------------------

/** The two roles the tool offers. */
export type PlainRole = 'helper' | 'administrator';

export const PLAIN_ROLES: Record<PlainRole, { title: string; description: string }> = {
  helper: {
    title: 'Helper',
    description:
      'Can edit pages, sermons and notices and publish them. Sees the simple view of the Studio and cannot delete anything for good.',
  },
  administrator: {
    title: 'Administrator',
    description:
      'Can do everything, including inviting people and deleting things for good. Keep this for one or two people.',
  },
};

/** The Sanity role each plain role is sent as. */
export const SANITY_ROLE: Record<PlainRole, string> = {
  helper: 'editor',
  administrator: 'administrator',
};

/** The Sanity feature flag that says the plan has the Editor role. */
export const EDITOR_FEATURE = 'roleEditor';

/**
 * The church's chosen Sanity plan (Nathan, 2026-10-26: Free for good). 'free' treats the Editor role
 * as unavailable even while a Growth trial still reports it, so nobody is invited as a Helper who
 * would turn into a read-only Viewer when the trial ends. 'auto' trusts the live feature list.
 */
export const SANITY_PLAN: 'free' | 'auto' = 'free';

/** Does this plan really have the Editor role (Helper)? */
export function hasEditorRole(features: string[], plan: 'free' | 'auto' = SANITY_PLAN): boolean {
  return plan !== 'free' && features.includes(EDITOR_FEATURE);
}

/** Where the person goes for anything the tool cannot do. */
export function manageUrl(projectId: string): string {
  return `https://www.sanity.io/manage/project/${projectId}/members`;
}

/**
 * What a member's Sanity roles mean, in the tool's words. Administrator wins;
 * any role that can edit is a Helper; a viewer can only look.
 */
export function plainRoleOf(roleNames: string[]): { key: string; title: string } {
  const names = roleNames.map((r) => r.toLowerCase());
  if (names.includes('administrator')) return { key: 'administrator', title: 'Administrator' };
  if (names.some((r) => r === 'editor' || r === 'developer'))
    return { key: 'helper', title: 'Helper' };
  if (names.includes('contributor'))
    return { key: 'helper', title: 'Helper (drafts only, cannot publish)' };
  if (names.includes('viewer')) return { key: 'viewer', title: 'Can look, cannot edit' };
  return { key: 'other', title: roleNames.join(', ') || 'No role' };
}

/**
 * The Sanity role to invite with, or null when this plan has no such role.
 * `features` is the project's feature list (GET /projects/<id>/features).
 */
export function sanityRoleFor(
  role: PlainRole,
  features: string[],
  plan: 'free' | 'auto' = SANITY_PLAN,
): string | null {
  if (role === 'administrator') return SANITY_ROLE.administrator;
  return hasEditorRole(features, plan) ? SANITY_ROLE.helper : null;
}

/** Is the caller an administrator of this project (by their real Sanity role)? */
export function isProjectAdmin(user: Pick<StudioUser, 'roles'> | null | undefined): boolean {
  return Boolean(user?.roles.some((r) => r.toLowerCase() === 'administrator'));
}

/** The plain steps when the plan has no Helper role. */
export function noHelperSteps(projectId: string, helperName: string): string[] {
  return [
    `The free Sanity plan only has two kinds of account: Administrator (can do everything) and Viewer (can look, cannot edit). There is no Helper in between.`,
    `This website stays on the free plan, so invite a helper as an Administrator here. They can edit everything you can.`,
    `If you would like them to see the simpler Studio with no permanent delete, ask ${helperName} to add them to the simple-view list.`,
    `You can also manage people yourself at ${manageUrl(projectId)} (Members, then Invite members).`,
  ];
}

// -----------------------------------------------------------------------------
// Request validation
// -----------------------------------------------------------------------------

export const NAME_MAX = 80;
export const EMAIL_MAX = 254;

/** A plain email shape: something@something.something, no spaces. */
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function isEmail(v: string): boolean {
  return v.length <= EMAIL_MAX && EMAIL_RE.test(v);
}

/** Sanity ids for invites: letters, digits, dashes and underscores. */
export function isInviteId(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(v);
}

export type PeopleRequest =
  | { action: 'invite'; name: string; email: string; role: PlainRole }
  | { action: 'resend'; id: string }
  | { action: 'cancel'; id: string };

export type Validated =
  { ok: true; value: PeopleRequest } | { ok: false; errors: Record<string, string> };

/** Check a POST body. Field messages are written for the person filling the form. */
export function validatePeopleRequest(body: unknown): Validated {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { ok: false, errors: { form: 'That request was not understood. Try again.' } };
  const b = body as Record<string, unknown>;

  if (b.action === 'resend' || b.action === 'cancel') {
    return isInviteId(b.id)
      ? { ok: true, value: { action: b.action, id: b.id } }
      : { ok: false, errors: { form: 'That invitation was not found. Refresh and try again.' } };
  }
  if (b.action !== 'invite')
    return { ok: false, errors: { form: 'That request was not understood. Try again.' } };

  const errors: Record<string, string> = {};
  const name = typeof b.name === 'string' ? b.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const role = b.role;

  if (!name) errors.name = 'Add their name, so you know who the invitation is for.';
  else if (name.length > NAME_MAX) errors.name = `Keep the name under ${NAME_MAX} letters.`;
  if (!email) errors.email = 'Add the email address they use.';
  else if (!isEmail(email)) errors.email = 'That does not look like an email address.';
  if (role !== 'helper' && role !== 'administrator') errors.role = 'Pick Helper or Administrator.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { action: 'invite', name, email, role: role as PlainRole } };
}

// -----------------------------------------------------------------------------
// The route
// -----------------------------------------------------------------------------

export const ACCESS_API = 'https://api.sanity.io/v2025-07-11/access/project';
export const PROJECTS_API = 'https://api.sanity.io/v2021-06-07/projects';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface PeopleDeps {
  sameOrigin: (request: Request) => boolean;
  /** The caller, checked with Sanity, plus their own session token. */
  verify: (request: Request) => Promise<(StudioUser & { token: string }) | null>;
  /** SANITY_MEMBERS_TOKEN, or undefined when it is not set yet. */
  membersToken: string | undefined;
  projectId: string | undefined;
  /** Who the pastor asks ("Nathan"). */
  helperName: string;
  /** The church's plan; defaults to SANITY_PLAN. Tests pass 'auto' to exercise a Growth plan. */
  plan?: 'free' | 'auto';
  fetchImpl?: FetchLike;
}

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  roleKey: string;
  lastSeenAt: string | null;
  isYou: boolean;
}

export interface InviteRow {
  id: string;
  email: string;
  role: string;
  roleKey: string;
  createdAt: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

interface SanityInvite {
  id: string;
  status: string;
  role: string;
  email?: string;
  createdAt: string;
}
interface SanityUser {
  sanityUserId: string;
  profile: { displayName?: string; email?: string; isCurrentUser?: boolean };
  memberships: Array<{
    resourceType: string;
    resourceId: string;
    roleNames: string[];
    lastSeenAt?: string | null;
    resourceUserId?: string | null;
  }>;
}

/** Turn Sanity's members list into the tool's rows (this project's roles only). */
export function memberRows(users: SanityUser[], projectId: string, callerId: string): MemberRow[] {
  return users
    .map((u) => {
      const m = u.memberships.find(
        (x) => x.resourceType === 'project' && x.resourceId === projectId,
      );
      const roles = m?.roleNames ?? [];
      const plain = plainRoleOf(roles);
      return {
        id: u.sanityUserId,
        name: u.profile.displayName?.trim() || u.profile.email || 'Someone',
        email: u.profile.email ?? '',
        role: plain.title,
        roleKey: plain.key,
        lastSeenAt: m?.lastSeenAt ?? null,
        isYou: Boolean(u.profile.isCurrentUser) || m?.resourceUserId === callerId,
        _member: Boolean(m),
      };
    })
    .filter((r) => r._member)
    .map(({ _member, ...r }) => r)
    .sort((a, b) =>
      a.roleKey === b.roleKey ? a.name.localeCompare(b.name) : a.roleKey < b.roleKey ? -1 : 1,
    );
}

/** Pending invitations only, newest first. */
export function inviteRows(invites: SanityInvite[]): InviteRow[] {
  return invites
    .filter((i) => i.status === 'pending')
    .map((i) => {
      const plain = plainRoleOf([i.role]);
      return {
        id: i.id,
        email: i.email ?? '',
        role: plain.title,
        roleKey: plain.key,
        createdAt: i.createdAt,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Sanity's answer to an invite, in plain words. */
export function inviteProblem(status: number, detail: string): string {
  const d = detail.toLowerCase();
  if (status === 409 || d.includes('already'))
    return 'That person already has an invitation or an account here.';
  if (d.includes('quota') || d.includes('seat') || d.includes('limit'))
    return 'The website has reached the number of people the Sanity plan allows. Remove someone first, or ask about a bigger plan.';
  if (status === 401 || status === 403)
    return 'Sanity would not let the website send that invitation. The members key may be missing a permission.';
  if (status === 400)
    return 'Sanity did not accept that invitation. Check the email address and try again.';
  return 'Sanity did not answer. Try again in a minute.';
}

/**
 * The whole route. Order matters and is tested: same origin, then a signed-in
 * member, then an ADMINISTRATOR, then the members key. Nothing reaches Sanity's
 * Access API before all four pass.
 */
export async function handlePeople(request: Request, deps: PeopleDeps): Promise<Response> {
  if (!deps.sameOrigin(request)) return json({ ok: false, error: 'Not allowed.' }, 403);
  const user = await deps.verify(request);
  if (!user)
    return json({ ok: false, error: 'Sign in to the Studio again, then try once more.' }, 401);
  if (!isProjectAdmin(user))
    return json(
      { ok: false, error: `Only an administrator can invite people. Ask ${deps.helperName}.` },
      403,
    );
  const projectId = deps.projectId;
  if (!projectId || !/^[a-z0-9]+$/i.test(projectId))
    return json({ ok: false, error: 'The website does not know its Sanity project.' }, 500);
  const manage = manageUrl(projectId);
  if (!deps.membersToken) return json({ ok: true, configured: false, manageUrl: manage });

  const f = deps.fetchImpl ?? fetch;
  const robot = deps.membersToken;
  const send = (path: string, token: string, init: RequestInit) =>
    f(`${ACCESS_API}/${projectId}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  // If Sanity refuses the robot key (the Access API docs speak of "an
  // authenticated user session"), try once more as the caller, who is an
  // administrator and so holds every members permission.
  const call = async (path: string, token: string, init: RequestInit = {}) => {
    const r = await send(path, token, init);
    if (token === robot && (r.status === 401 || r.status === 403))
      return send(path, user.token, init);
    return r;
  };
  // Administrator invites go out as the caller (see the header).
  const tokenForRole = (sanityRole: string) =>
    sanityRole === 'administrator' ? user.token : robot;

  const features = async (): Promise<string[] | null> => {
    try {
      // The project's own token can read it; the caller's session is the fallback.
      let r = await f(`${PROJECTS_API}/${projectId}/features`, {
        headers: { Authorization: `Bearer ${robot}` },
      });
      if (r.status === 401 || r.status === 403)
        r = await f(`${PROJECTS_API}/${projectId}/features`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      return r.ok ? ((await r.json()) as string[]) : null;
    } catch {
      return null;
    }
  };
  const pendingInvites = async (): Promise<SanityInvite[] | null> => {
    try {
      const r = await call('/invites?limit=100', robot);
      return r.ok ? ((await r.json()) as { data: SanityInvite[] }).data : null;
    } catch {
      return null;
    }
  };

  if (request.method === 'GET') {
    try {
      const [usersRes, invites, feats] = await Promise.all([
        call('/users?limit=100', robot),
        pendingInvites(),
        features(),
      ]);
      if (!usersRes.ok || !invites)
        return json(
          {
            ok: false,
            error:
              usersRes.status === 401 || usersRes.status === 403
                ? 'The members key was refused by Sanity. It may have been removed, or made with the wrong role.'
                : 'Sanity did not answer. Try again in a minute.',
            manageUrl: manage,
          },
          502,
        );
      const users = ((await usersRes.json()) as { data: SanityUser[] }).data;
      const plan = deps.plan ?? SANITY_PLAN;
      const helperAvailable = feats ? hasEditorRole(feats, plan) : plan !== 'free';
      return json({
        ok: true,
        configured: true,
        manageUrl: manage,
        helperAvailable,
        helperSteps: helperAvailable ? [] : noHelperSteps(projectId, deps.helperName),
        members: memberRows(users, projectId, user.id),
        invites: inviteRows(invites),
      });
    } catch {
      return json(
        { ok: false, error: 'Sanity did not answer. Try again in a minute.', manageUrl: manage },
        502,
      );
    }
  }

  if (request.method !== 'POST') return json({ ok: false, error: 'Not allowed.' }, 405);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const v = validatePeopleRequest(body);
  if (!v.ok) return json({ ok: false, errors: v.errors, error: Object.values(v.errors)[0] }, 400);
  const req = v.value;

  const sendInvite = async (email: string, sanityRole: string) => {
    const r = await call('/invites', tokenForRole(sanityRole), {
      method: 'POST',
      body: JSON.stringify({ email, role: sanityRole }),
    });
    if (r.ok) return null;
    const detail = await r.text().catch(() => '');
    return inviteProblem(r.status, detail);
  };

  try {
    if (req.action === 'invite') {
      const feats = await features();
      // Unknown plan (Sanity did not say): try the Editor role and let Sanity answer.
      const plan = deps.plan ?? SANITY_PLAN;
      const sanityRole = sanityRoleFor(
        req.role,
        feats ?? (plan === 'free' ? [] : [EDITOR_FEATURE]),
        plan,
      );
      if (!sanityRole)
        return json(
          {
            ok: false,
            planLimit: true,
            error: 'The free Sanity plan has no Helper role.',
            helperSteps: noHelperSteps(projectId, deps.helperName),
            manageUrl: manage,
          },
          409,
        );
      const problem = await sendInvite(req.email, sanityRole);
      if (problem) return json({ ok: false, error: problem, manageUrl: manage }, 502);
      const first = req.name.split(' ')[0];
      return json({
        ok: true,
        message: `Invitation sent to ${first}. Sanity emails ${req.email} a link; once ${first} accepts and signs in, they appear under People.`,
      });
    }

    // Resend and cancel both start from the pending invitation itself.
    const invites = await pendingInvites();
    const invite = invites?.find((i) => i.id === req.id && i.status === 'pending');
    if (!invite)
      return json(
        { ok: false, error: 'That invitation was not found. It may have been accepted already.' },
        404,
      );
    const revoke = await call(
      `/invites/${encodeURIComponent(invite.id)}`,
      tokenForRole(invite.role),
      {
        method: 'DELETE',
      },
    );
    if (!revoke.ok)
      return json(
        { ok: false, error: 'Sanity would not change that invitation. Try again in a minute.' },
        502,
      );
    if (req.action === 'cancel')
      return json({
        ok: true,
        message: 'Invitation cancelled. The link in the email no longer works.',
      });

    if (!invite.email)
      return json({ ok: false, error: 'That invitation has no email address to send to.' }, 400);
    const problem = await sendInvite(invite.email, invite.role);
    if (problem) return json({ ok: false, error: problem, manageUrl: manage }, 502);
    return json({ ok: true, message: `A fresh invitation is on its way to ${invite.email}.` });
  } catch {
    return json(
      { ok: false, error: 'Sanity did not answer. Try again in a minute.', manageUrl: manage },
      502,
    );
  }
}
