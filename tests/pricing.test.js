import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal } from '../src/lib/pricing.js';
import { startServers } from './helpers.js';

const beef = { id: 'beef-patty', category: 'patty', priceCents: 350 };
const cheddar = { id: 'cheddar', category: 'cheese', priceCents: 100 };

test('an empty burger costs the base price', () => {
  assert.equal(calculateTotal({ basePriceCents: 250, items: [] }), 250);
});

test('ingredients are added to the base price', () => {
  assert.equal(calculateTotal({ basePriceCents: 250, items: [beef, cheddar, cheddar] }), 800);
});

let servers;
before(async () => (servers = await startServers()));
after(() => servers.close());

function price(ingredientIds) {
  return fetch(`${servers.baseUrl}/api/price`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ingredientIds }),
  });
}

test('POST /api/price returns the total in cents', async () => {
  const res = await price(['beef-patty', 'cheddar']);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { totalCents: 700, currency: 'EUR' });
});

test('POST /api/price rejects unknown ingredients', async () => {
  const res = await price(['unicorn']);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'unknown_ingredient' });
});
