// Unit tests for the Home hero's video rules (src/lib/hero-video.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_VIDEO_BUDGET,
  heroVideoAllowed,
  heroVideoProblem,
  heroVideoSource,
} from './hero-video.ts';

test('heroVideoSource takes mp4 and webm uploads only', () => {
  assert.deepEqual(heroVideoSource({ url: 'https://cdn.sanity.io/a.mp4', mimeType: 'video/mp4' }), {
    url: 'https://cdn.sanity.io/a.mp4',
    type: 'video/mp4',
  });
  assert.equal(
    heroVideoSource({ url: 'https://cdn.sanity.io/a.webm', mimeType: 'video/webm' })?.type,
    'video/webm',
  );
  assert.equal(
    heroVideoSource({ url: 'https://cdn.sanity.io/a.mov', mimeType: 'video/quicktime' }),
    null,
  );
  assert.equal(heroVideoSource({ url: '', mimeType: 'video/mp4' }), null);
  assert.equal(heroVideoSource(null), null);
  assert.equal(heroVideoSource(undefined), null);
});

test('heroVideoProblem: an error for the wrong type, a warning over budget', () => {
  assert.equal(heroVideoProblem(null), null);
  assert.equal(heroVideoProblem({ mimeType: 'video/mp4', size: 3_000_000 }), null);
  assert.equal(heroVideoProblem({ mimeType: 'video/quicktime', size: 1 })?.level, 'error');
  const big = heroVideoProblem({ mimeType: 'video/mp4', size: HERO_VIDEO_BUDGET + 1 });
  assert.equal(big?.level, 'warning');
  assert.match(big?.message ?? '', /6\.0 MB/);
});

test('heroVideoAllowed keeps the still for reduced motion, print, Save-Data and slow links', () => {
  assert.equal(heroVideoAllowed({ reducedMotion: false }), true);
  assert.equal(heroVideoAllowed({ reducedMotion: false, effectiveType: '4g' }), true);
  assert.equal(heroVideoAllowed({ reducedMotion: true }), false);
  assert.equal(heroVideoAllowed({ reducedMotion: false, print: true }), false);
  assert.equal(heroVideoAllowed({ reducedMotion: false, saveData: true }), false);
  for (const slow of ['slow-2g', '2g', '3g']) {
    assert.equal(heroVideoAllowed({ reducedMotion: false, effectiveType: slow }), false, slow);
  }
});
