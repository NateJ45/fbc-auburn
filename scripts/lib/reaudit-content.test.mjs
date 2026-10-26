// The re-audit content plan (reaudit-content.mjs, 2026-10-26), run against the committed CI
// snapshot: the four menu groups, the prayer door closed, Plan your visit shorter with every Jacob
// ask kept, Need the pastor? leading with its Call and Text buttons, and each plan idempotent.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import {
  CARE_ORDER,
  CRISIS_LABEL,
  PAGE_PLANS,
  PLAN_ORDER,
  jacobAsks,
  menuPlan,
} from './reaudit-content.mjs';

const docs = gunzipSync(
  readFileSync(new URL('../../ci/sanity-snapshot.ndjson.gz', import.meta.url)),
)
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));
const doc = (id) => docs.find((d) => d._id === id);
const after = (id) => ({ ...doc(id), ...PAGE_PLANS[id](doc(id)) });

test('the menu and the footer become the same four groups', () => {
  const s = doc('siteSettings');
  const next = { ...s, ...menuPlan(s) };
  const groups = (cols) => cols.map((g) => [g.label ?? g.title, g.links.map((l) => l.label)]);
  const want = [
    ['New here', ['Plan your visit', 'About', 'What we believe', 'Leadership']],
    ['Get involved', ['Ministries', 'Next steps', 'News and notes']],
    ['This week', ['Sermons', 'Events', 'Bulletin', 'Give']],
    ['Reach us', ['Contact', 'Need the pastor?', 'Prayer requests']],
  ];
  assert.deepEqual(groups(next.navItems), want);
  assert.deepEqual(groups(next.footerColumns), want);
  // Footer links keep their keys, so nothing an editor linked to is renamed.
  assert.ok(next.footerColumns[3].links.some((l) => l._key === 'fc1'));
  assert.deepEqual(menuPlan(next), {}, 'a second run changes nothing');
});

test('Contact loses its prayer topic and Home gains a prayer card to /prayer/', () => {
  const c = after('contactPage');
  assert.ok(!JSON.stringify(c.formFields).match(/pray/i));
  const h = after('homePage');
  const cards = h.pageBuilder.find((b) => b._key === 'home-other-ways').cards;
  const ask = cards.find((x) => x._key === 'how-ask');
  assert.ok(!/pray/i.test(ask.body));
  const prayer = cards.find((x) => x._key === 'how-prayer');
  assert.equal(prayer.link.internalLink._ref, 'page-prayer');
});

test('Plan your visit: new order, one invitation, every Jacob ask kept', () => {
  const before = doc('page-plan-your-visit');
  const p = after('page-plan-your-visit');
  assert.deepEqual(
    p.pageBuilder.map((b) => b._key),
    PLAN_ORDER,
  );
  const walk = p.pageBuilder.find((b) => b._key === 'pyv-walk');
  assert.equal(walk.endLinkLabel, undefined, 'the walk has no button of its own');
  const text = JSON.stringify(p);
  assert.equal((text.match(/Tell us you are coming/g) ?? []).length, 1, 'the closing band only');
  // Each of the old asks is still there, word for word (some folded into one ask).
  const joined = jacobAsks(p).join(' ').toLowerCase();
  for (const a of jacobAsks(before)) {
    const q = a
      .replace(/^\[Jacob:\s*/, '')
      .replace(/\]$/, '')
      .toLowerCase();
    assert.ok(joined.includes(q), `kept: ${a}`);
  }
  assert.ok(/sign/i.test(p.pageBuilder.find((b) => b._key === 'pyv-map').note));
  assert.deepEqual(PAGE_PLANS['page-plan-your-visit'](p), {}, 'idempotent');
});

test('Need the pastor? leads with Call and Text; a crisis band, if any, gets a plain label', () => {
  const p = after('page-pastoral-care');
  // The crisis band (pc-crisis) was removed on 2026-10-26; the order holds with or without it.
  assert.deepEqual(
    p.pageBuilder.map((b) => b._key),
    CARE_ORDER.filter((k) => p.pageBuilder.some((b) => b._key === k)),
  );
  assert.equal(p.pageBuilder[1].callButtons, true);
  const crisis = p.pageBuilder.find((b) => b._key === 'pc-crisis');
  if (crisis) assert.equal(crisis.label, CRISIS_LABEL);
  assert.ok(!p.pageBuilder.some((b) => b._type === 'ctaBandSection'), 'no red prayer band');
  assert.equal(jacobAsks(p).length, jacobAsks(doc('page-pastoral-care')).length);
  const pr = after('page-prayer');
  const prNotice = pr.pageBuilder.find((b) => b._type === 'noticeSection');
  if (prNotice) assert.equal(prNotice.label, CRISIS_LABEL);
  for (const id of Object.keys(PAGE_PLANS)) {
    assert.deepEqual(PAGE_PLANS[id](after(id)), {}, `${id} is idempotent`);
  }
});
