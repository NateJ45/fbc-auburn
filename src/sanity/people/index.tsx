// Foundation, edit with care
// =============================================================================
// ncsPeopleTool - the "People" tool, for administrators only (2026-10-26)
// =============================================================================
// Register it AFTER ncsStudioKit in sanity.config.ts. The kit's tools reducer
// trims the top bar to `staffTools` in the staff view; this one runs after it
// and adds People for anyone whose real Sanity role is Administrator, in either
// view. So the pastor (an administrator who may be on the simple-view list)
// always has it, and a Helper (Sanity's Editor role) never sees it. The route
// behind it checks the role again on every request (src/lib/studio-people.ts):
// hiding the tool is a courtesy, not the lock.
// =============================================================================
import { definePlugin } from 'sanity';
import { UsersIcon } from '@sanity/icons/Users';
import { PeopleTool } from './PeopleTool';

export const PEOPLE_TOOL = 'people';

/** Is this Studio user an administrator by their Sanity roles? */
export function isAdministrator(user: { roles?: Array<{ name: string }> } | null | undefined) {
  return Boolean(user?.roles?.some((r) => r.name === 'administrator'));
}

export const ncsPeopleTool = definePlugin(() => ({
  name: 'ncs-people-tool',
  tools: (prev, { currentUser }) => {
    if (!isAdministrator(currentUser) || prev.some((t) => t.name === PEOPLE_TOOL)) return prev;
    const tool = { name: PEOPLE_TOOL, title: 'People', icon: UsersIcon, component: PeopleTool };
    // Just before Checkup when it is there (the housekeeping end), else last.
    const at = prev.findIndex((t) => t.name === 'checkup');
    return at === -1 ? [...prev, tool] : [...prev.slice(0, at), tool, ...prev.slice(at)];
  },
}));
