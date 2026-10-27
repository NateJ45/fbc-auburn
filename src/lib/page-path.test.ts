import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicPath } from './page-path.ts';

test('live paths come back as they are', () => {
  assert.equal(publicPath('/'), '/');
  assert.equal(publicPath('/ministries/'), '/ministries/');
  assert.equal(publicPath('/ministries'), '/ministries/');
});

test('preview paths lose the /preview prefix', () => {
  assert.equal(publicPath('/preview'), '/');
  assert.equal(publicPath('/preview/'), '/');
  assert.equal(publicPath('/preview/ministries/'), '/ministries/');
  assert.equal(publicPath('/preview/journal/a-post/'), '/journal/a-post/');
});

test('a page that merely starts with "preview" is left alone', () => {
  assert.equal(publicPath('/previews/'), '/previews/');
});
