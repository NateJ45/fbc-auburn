# People: "Invite a helper" (2026-10-26)

An administrator adds someone to the Studio from the Studio itself: the `People` tool in the top
bar. Name, email, and one of two plain roles:

| In the tool   | Sanity role     | What it means                                                   |
| ------------- | --------------- | --------------------------------------------------------------- |
| Helper        | `editor`        | Edits and publishes; the simple staff view; no permanent delete |
| Administrator | `administrator` | Everything, including People and Delete forever                 |

The tool also lists who is a member (and what they can do) and the pending invitations, each with
`Send again` and `Cancel`. Changing a member's role or removing them stays in sanity.io/manage, and
the tool links there.

## Files

| Part        | File                               | Notes                                                         |
| ----------- | ---------------------------------- | ------------------------------------------------------------- |
| Rules       | `src/lib/studio-people.ts`         | Role mapping, validation, the whole route as `handlePeople()` |
| Tests       | `src/lib/studio-people.test.ts`    | Order of checks, mapping, validation, which token is used     |
| Route       | `src/pages/api/studio/people.ts`   | SSR, GET (list) and POST (invite, resend, cancel)             |
| Studio tool | `src/sanity/people/PeopleTool.tsx` | Kit primitives (`../kit/ui`), talks only to the route         |
| Plugin      | `src/sanity/people/index.tsx`      | Registered AFTER the kit; adds the tool for administrators    |
| Guide       | `src/sanity/guides/people.ts`      | "Add someone to help with the website" (Housekeeping)         |

## Who can call it

The route runs the same checks as every `/api/studio/*` route, then one more, in this order
(tested): same origin, a signed-in project member (`verifyStudioUser`), the caller's real Sanity
role is `administrator`, then the members key is set. Nothing reaches Sanity's Access API before
all four pass. The tool is hidden from non-administrators too, but that is a courtesy: the route is
the lock.

## What Sanity allows (checked 2026-10-26)

- Access API, `https://api.sanity.io/v2025-07-11/access/project/<projectId>`: `GET /users`,
  `GET /invites` (pending by default), `POST /invites` with `{ email, role }` (Sanity sends the
  email), `DELETE /invites/<id>`. There is no resend endpoint: resend is revoke, then invite again.
- Permissions: invite and revoke need `sanity.project.members.invite`; the lists need
  `sanity.project.members.read`.
- "Only administrators can invite other administrators", and the Administrator role cannot be
  given to a robot token (`appliesToRobots: false` on this project's roles list). So Administrator
  invites, and cancelling or resending one, go out with the CALLER's own session token (already
  checked to be an administrator). Helper invites and both lists use the Worker secret.
- Roles by plan (sanity.io/docs/user-guides/roles): Administrator and Viewer on every plan; Editor,
  Developer and Contributor on Growth; custom roles Enterprise only. New projects start on a Growth
  trial. When a trial ends without an upgrade, "all team members with non-admin roles will be
  converted to viewers" (sanity.io/docs/platform-management/growth-plan-trial), so a Helper would
  become read-only.
- The route reads the plan from the project's feature list (`GET
https://api.sanity.io/v2021-06-07/projects/<id>/features`): `roleEditor` there means Helper is
  available. Without it the tool greys out Helper and shows the steps (ask about Growth, or invite
  as an Administrator and add them to `kitConfig.staff`), with a link to sanity.io/manage.
- **This site stays on Free** (Nathan, 2026-10-26): `SANITY_PLAN = 'free'` in `src/lib/studio-people.ts` keeps Helper greyed out even while a Growth trial still lists `roleEditor`, so nobody is invited into a role that turns read-only when the trial ends. Helpers are invited as Administrators. Set it to `'auto'` only if the church moves to a paid plan.
- Seats: the Free plan and the Growth trial allow 20 users. A refusal for the seat limit comes back
  in plain words.

## The secret

`SANITY_MEMBERS_TOKEN`: a Sanity robot token for this project with the **Access Manager (Token
only)** role, the least that can invite: members and invitations (read, invite, update, delete)
and roles, and no access to any content. Create it at sanity.io/manage, project, API, Tokens, Add
API token, then `npx wrangler secret put SANITY_MEMBERS_TOKEN`. Never in the repo, `.env` or the
dataset. If Access Manager is not offered on the plan, Developer also has `members.invite` but
also writes content and makes tokens, so prefer Access Manager. Without the secret the tool says
"Inviting from here is not switched on yet" and shows the sanity.io/manage steps.

## The staff view by role

`kitConfig.staff` stays empty, so the staff view follows the role: everyone who is not an
administrator (a Helper) gets it with no code change. The id list is meant as an override that ADDS
administrators (the pastor) to the staff view. Today's `isStaffUser` in `src/lib/studio-kit.ts`
(PORTABLE) lets a non-empty list REPLACE the role rule, so adding an id would give every Helper the
full Studio and its permanent Delete. The fix (the list adds to the role rule) is a starter card;
until it is synced here, keep `staff: []`.

## Still needs a signed-in test

Unit tests cover the rules with a fake Sanity. Not yet seen for real: the tool rendering in
`/studio` for an administrator (and absent for an Editor), a real invite email arriving, a robot
token with Access Manager being accepted by `POST /invites` (the docs say "authenticated user
session", and the endpoint does not say robots are refused the way some Roles API endpoints do),
the caller's session being accepted for an Administrator invite, and the seat-limit wording.
