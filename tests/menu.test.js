import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServers } from './helpers.js';

let servers;
before(async () => (servers = await startServers()));
after(() => servers.close());

test('GET /api/shop returns the shop', async () => {
  const shop = await (await fetch(`${servers.baseUrl}/api/shop`)).json();
  assert.equal(shop.name, "OpenConf Burgers");
  assert.equal(shop.currency, 'EUR');
});

test('GET /api/ingredients returns ingredients with names and prices', async () => {
  const ingredients = await (await fetch(`${servers.baseUrl}/api/ingredients`)).json();
  assert.ok(ingredients.length > 0);
  for (const item of ingredients) {
    assert.ok(item.id && item.name && item.category);
    assert.ok(Number.isInteger(item.priceCents));
  }
});

test('GET /api/categories returns every category', async () => {
  const categories = await (await fetch(`${servers.baseUrl}/api/categories`)).json();
  assert.deepEqual(
    categories.map((c) => c.id),
    ['patty', 'cheese', 'veggie', 'extra', 'bread'],
  );
});
