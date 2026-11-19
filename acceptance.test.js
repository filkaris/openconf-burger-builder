// Hidden acceptance tests for the workshop challenges.
// Run from the main branch with `npm run score` (or `npm run score -- --reveal`).
//
// Self-contained: brings its own kitchen API mock, so changes to the
// participant's kitchen-api/ folder don't affect the score.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { join } from 'node:path';

const ROOT = process.env.BURGER_ROOT;
const PAGE_SIZE = 5;
const BASE = 250;

const ingredients = [
  { id: 'beef-patty', name: 'Beef patty', category: 'patty', priceCents: 350, stock: 25, inStock: true },
  { id: 'veggie-patty', name: 'Chickpea patty', category: 'patty', priceCents: 300, stock: 12, inStock: true },
  { id: 'cheddar', name: 'Cheddar', category: 'cheese', priceCents: 100, stock: 30, inStock: true },
  { id: 'bacon', name: 'Bacon', category: 'extra', priceCents: 150, stock: 0, inStock: true },
  { id: 'lettuce', name: 'Lettuce', category: 'veggie', priceCents: 50, stock: 50, inStock: true },
  { id: 'tomato', name: 'Tomato', category: 'veggie', priceCents: 60, stock: 35, inStock: true },
  { id: 'pickles', name: 'Pickles', category: 'veggie', priceCents: 40, stock: 20, inStock: true },
  { id: 'caramelised-onion', name: 'Caramelised onion', category: 'veggie', priceCents: 70, stock: 18, inStock: true },
  { id: 'avocado', name: 'Avocado', category: 'extra', priceCents: 180, stock: 12, inStock: false },
  { id: 'fried-egg', name: 'Fried egg', category: 'extra', priceCents: 130, stock: 9, inStock: true },
  { id: 'jalapenos', name: 'Jalapeños', category: 'veggie', priceCents: 50, stock: 0, inStock: false },
  { id: 'halloumi', name: 'Grilled halloumi', category: 'cheese', priceCents: 150, stock: 8, inStock: true },
  { id: 'ketchup', name: 'Ketchup', category: 'sauce', priceCents: 30, stock: 60, inStock: true },
  { id: 'house-sauce', name: 'House sauce', category: 'sauce', priceCents: 50, stock: 22, inStock: true },
];
const categories = ['patty', 'cheese', 'veggie', 'extra', 'sauce', 'bread'].map((id) => ({ id, label: id }));
const shop = { name: "Stack'd", tagline: 'Build it your way', currency: 'EUR', basePriceCents: BASE };

function paginate(items, pageParam) {
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const start = (page - 1) * PAGE_SIZE;
  return {
    data: items.slice(start, start + PAGE_SIZE),
    page,
    nextPage: start + PAGE_SIZE < items.length ? page + 1 : null,
  };
}

function createKitchen() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://kitchen.local');
    let status = 200;
    let body;
    if (url.pathname === '/shop') body = { data: shop };
    else if (url.pathname === '/categories') body = paginate(categories, url.searchParams.get('page'));
    else if (url.pathname === '/ingredients') body = paginate(ingredients, url.searchParams.get('page'));
    else if (url.pathname.startsWith('/ingredients/')) {
      const item = ingredients.find((i) => i.id === decodeURIComponent(url.pathname.slice('/ingredients/'.length)));
      if (item) body = { data: item };
      else [status, body] = [404, { error: 'ingredient_not_found' }];
    } else if (url.pathname === '/allergens') [status, body] = [503, { error: 'allergen_service_unavailable' }];
    else [status, body] = [404, { error: 'not_found' }];
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  });
}

let kitchen;
let app;
let baseUrl;

async function freePort() {
  const srv = createServer().listen(0);
  await once(srv, 'listening');
  const { port } = srv.address();
  srv.close();
  return port;
}

before(async () => {
  kitchen = createKitchen().listen(0);
  await once(kitchen, 'listening');
  const port = await freePort();
  app = spawn(process.execPath, [join(ROOT, 'src', 'server.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), KITCHEN_API_URL: `http://localhost:${kitchen.address().port}` },
    stdio: 'ignore',
  });
  baseUrl = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${baseUrl}/api/shop`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('App did not start');
});

after(() => {
  app?.kill();
  kitchen?.close();
});

async function menuIds() {
  const res = await fetch(`${baseUrl}/api/ingredients`);
  assert.equal(res.status, 200, `GET /api/ingredients returned ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : (body.data ?? body.ingredients ?? body.items);
  assert.ok(Array.isArray(list), 'menu is a list of ingredients');
  return list.map((i) => i.id);
}

async function price(ingredientIds) {
  const res = await fetch(`${baseUrl}/api/price`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ingredientIds }),
  });
  assert.equal(res.status, 200, `POST /api/price returned ${res.status}`);
  return (await res.json()).totalCents;
}

async function ingredient(id) {
  const res = await fetch(`${baseUrl}/api/ingredients/${id}`);
  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { status: res.status, item: body?.data ?? body?.ingredient ?? body };
}

// --- baseline ---

test('the menu loads', async () => {
  const ids = await menuIds();
  assert.ok(ids.includes('beef-patty') && ids.includes('cheddar'));
});

test('a plain burger costs the bun plus its ingredients', async () => {
  assert.equal(await price(['beef-patty', 'cheddar', 'lettuce']), BASE + 350 + 100 + 50);
});

test('a single patty is full price, and double cheese is not discounted', async () => {
  assert.equal(await price(['beef-patty', 'cheddar', 'cheddar']), BASE + 350 + 100 + 100);
});

// --- one ingredient by id ---

test('GET /api/ingredients/:id returns one ingredient, 404 for unknown ids', async () => {
  const found = await ingredient('cheddar');
  assert.equal(found.status, 200);
  assert.equal(found.item?.name, 'Cheddar');
  assert.equal((await ingredient('unicorn')).status, 404);
});

test('GET /api/ingredients/:id finds ingredients beyond the first kitchen page', async () => {
  const found = await ingredient('halloumi');
  assert.equal(found.status, 200);
  assert.equal(found.item?.name, 'Grilled halloumi');
});

// --- in stock only ---

test('the menu includes ingredients from every kitchen page', async () => {
  const ids = await menuIds();
  for (const id of ['tomato', 'fried-egg', 'house-sauce']) assert.ok(ids.includes(id), `missing ${id}`);
});

test('sold-out ingredients are hidden, even when the stale inStock flag says true', async () => {
  const ids = await menuIds();
  assert.ok(!ids.includes('bacon'), 'bacon has stock 0');
  assert.ok(!ids.includes('jalapenos'), 'jalapenos has stock 0');
});

test('ingredients with stock are shown, even when the stale inStock flag says false', async () => {
  assert.ok((await menuIds()).includes('avocado'), 'avocado has stock 12');
});

// --- second patty half price ---

test('the second patty is half price', async () => {
  assert.equal(await price(['beef-patty', 'beef-patty']), BASE + 350 + 175);
});

test('with two different patties, the cheaper one is the half-price one', async () => {
  assert.equal(await price(['veggie-patty', 'beef-patty']), BASE + 350 + 150);
});
