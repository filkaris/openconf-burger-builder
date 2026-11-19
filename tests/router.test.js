import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRouter } from '../src/lib/router.js';

test('matches routes and extracts params', () => {
  const router = createRouter();
  const handler = () => {};
  router.get('/api/ingredients/:id', handler);

  assert.deepEqual(router.match('GET', '/api/ingredients/cheddar'), { handler, params: { id: 'cheddar' } });
  assert.equal(router.match('POST', '/api/ingredients/cheddar'), null);
  assert.equal(router.match('GET', '/api/ingredients'), null);
});
