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

// Same data as the kitchen repo's data.json.
const ingredients = [
  {"id": "beef-patty", "name": "Beef patty", "category": "patty", "priceCents": 350, "stock": 25, "inStock": true, "availableIn": ["burger"], "vegetarian": false},
  {"id": "veggie-patty", "name": "Chickpea patty", "category": "patty", "priceCents": 300, "stock": 12, "inStock": true, "availableIn": ["burger"], "vegetarian": true},
  {"id": "cheddar", "name": "Cheddar", "category": "cheese", "priceCents": 100, "stock": 30, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "bacon", "name": "Bacon", "category": "extra", "priceCents": 150, "stock": 0, "inStock": true, "availableIn": ["burger", "sandwich"], "vegetarian": false},
  {"id": "lettuce", "name": "Lettuce", "category": "veggie", "priceCents": 50, "stock": 50, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "tomato", "name": "Tomato", "category": "veggie", "priceCents": 60, "stock": 35, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "pickles", "name": "Pickles", "category": "veggie", "priceCents": 40, "stock": 20, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "caramelised-onion", "name": "Caramelised onion", "category": "veggie", "priceCents": 70, "stock": 18, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "avocado", "name": "Avocado", "category": "extra", "priceCents": 180, "stock": 12, "inStock": false, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "fried-egg", "name": "Fried egg", "category": "extra", "priceCents": 130, "stock": 9, "inStock": true, "availableIn": ["burger", "sandwich"], "vegetarian": true},
  {"id": "jalapenos", "name": "Jalapeños", "category": "veggie", "priceCents": 50, "stock": 0, "inStock": false, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "halloumi", "name": "Grilled halloumi", "category": "cheese", "priceCents": 150, "stock": 8, "inStock": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "ketchup", "name": "Ketchup", "category": "sauce", "priceCents": 30, "stock": 60, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "mustard", "name": "Mustard", "category": "sauce", "priceCents": 30, "stock": 40, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "house-sauce", "name": "House sauce", "category": "sauce", "priceCents": 50, "stock": 22, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "bbq", "name": "Smoky BBQ", "category": "sauce", "priceCents": 60, "stock": 30, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "garlic-aioli", "name": "Garlic aioli", "category": "sauce", "priceCents": 70, "stock": 15, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "sriracha-mayo", "name": "Sriracha mayo", "category": "sauce", "priceCents": 80, "stock": 0, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "truffle-mayo", "name": "Truffle mayo", "category": "sauce", "priceCents": 150, "stock": 6, "v2Only": true, "availableIn": ["burger", "taco", "sandwich"], "vegetarian": true},
  {"id": "pulled-pork", "name": "Pulled pork", "category": "filling", "priceCents": 320, "stock": 20, "v2Only": true, "availableIn": ["taco", "sandwich"], "vegetarian": false},
  {"id": "chicken-tinga", "name": "Chicken tinga", "category": "filling", "priceCents": 290, "stock": 14, "v2Only": true, "availableIn": ["taco"], "vegetarian": false},
  {"id": "ham", "name": "Smoked ham", "category": "filling", "priceCents": 180, "stock": 25, "v2Only": true, "availableIn": ["sandwich"], "vegetarian": false},
  {"id": "black-beans", "name": "Black beans", "category": "filling", "priceCents": 120, "stock": 30, "v2Only": true, "availableIn": ["taco"], "vegetarian": true},
  {"id": "pico-de-gallo", "name": "Pico de gallo", "category": "veggie", "priceCents": 45, "stock": 24, "v2Only": true, "availableIn": ["taco"], "vegetarian": true},
  {"id": "corn-tortilla", "name": "Corn tortilla", "category": "bread", "priceCents": 0, "stock": 80, "v2Only": true, "availableIn": ["taco"], "vegetarian": true},
  {"id": "flour-tortilla", "name": "Flour tortilla", "category": "bread", "priceCents": 20, "stock": 60, "v2Only": true, "availableIn": ["taco"], "vegetarian": true},
  {"id": "sourdough", "name": "Sourdough", "category": "bread", "priceCents": 0, "stock": 30, "v2Only": true, "availableIn": ["sandwich"], "vegetarian": true},
  {"id": "ciabatta", "name": "Ciabatta", "category": "bread", "priceCents": 50, "stock": 20, "v2Only": true, "availableIn": ["sandwich"], "vegetarian": true},
  {"id": "focaccia", "name": "Focaccia", "category": "bread", "priceCents": 80, "stock": 0, "v2Only": true, "availableIn": ["sandwich"], "vegetarian": true},
];
const categories = [{"id": "patty", "label": "Patties"}, {"id": "filling", "label": "Fillings", "v2Only": true}, {"id": "cheese", "label": "Cheese"}, {"id": "veggie", "label": "Veggies"}, {"id": "extra", "label": "Extras"}, {"id": "bread", "label": "Bread"}, {"id": "sauce", "label": "Sauces", "v2Only": true}];
const products = [{"id": "burger", "name": "Burger", "basePriceCents": 250}, {"id": "taco", "name": "Taco", "basePriceCents": 150}, {"id": "sandwich", "name": "Sandwich", "basePriceCents": 200}];
const SAUCES = ['ketchup', 'mustard', 'house-sauce', 'bbq', 'garlic-aioli', 'sriracha-mayo', 'truffle-mayo'];
const v1Categories = categories.filter((c) => !c.v2Only).map(({ id, label }) => ({ id, label }));
const v1Ingredients = ingredients
  .filter((i) => !i.v2Only)
  .map(({ id, name, category, priceCents, stock, inStock }) => ({ id, name, category, priceCents, stock, inStock }));
const v2Categories = categories.map((c) => ({ type: c.id, label: c.label }));
const v2Ingredients = ingredients.map((i) => ({
  sku: i.id,
  displayName: i.name,
  type: i.category,
  price: { amount: i.priceCents, currency: 'EUR', unit: 'cents' },
  portionsLeft: i.stock,
  availableIn: i.availableIn,
  vegetarian: i.vegetarian,
}));
const v2Products = products.map((p) => ({
  sku: p.id,
  displayName: p.name,
  basePrice: { amount: p.basePriceCents, currency: 'EUR', unit: 'cents' },
}));
const shop = { name: 'OpenConf Burgers', tagline: 'Build it your way', currency: 'EUR', basePriceCents: BASE };

function paginate(items, pageParam) {
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const start = (page - 1) * PAGE_SIZE;
  return {
    data: items.slice(start, start + PAGE_SIZE),
    page,
    nextPage: start + PAGE_SIZE < items.length ? page + 1 : null,
  };
}

function paginateV2(items, cursor) {
  const offset = cursor ? Number(/^o:(\d+)$/.exec(Buffer.from(cursor, 'base64url').toString())?.[1] ?? NaN) : 0;
  if (Number.isNaN(offset)) return null;
  const end = offset + PAGE_SIZE;
  return {
    items: items.slice(offset, end),
    cursor: { next: end < items.length ? Buffer.from(`o:${end}`).toString('base64url') : null },
  };
}

function createKitchen() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://kitchen.local');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    let status = 200;
    let body;
    if (path === '/shop') body = { data: shop };
    else if (path === '/categories') body = paginate(v1Categories, url.searchParams.get('page'));
    else if (path === '/ingredients') body = paginate(v1Ingredients, url.searchParams.get('page'));
    else if (path.startsWith('/ingredients/')) {
      const item = v1Ingredients.find((i) => i.id === decodeURIComponent(path.slice('/ingredients/'.length)));
      if (item) body = { data: item };
      else [status, body] = [404, { error: 'ingredient_not_found' }];
    } else if (path === '/allergens') [status, body] = [503, { error: 'allergen_service_unavailable' }];
    else if (path === '/v2/categories' || path === '/v2/ingredients' || path === '/v2/products') {
      const lists = { '/v2/categories': v2Categories, '/v2/ingredients': v2Ingredients, '/v2/products': v2Products };
      body = paginateV2(lists[path], url.searchParams.get('cursor'));
      if (!body) [status, body] = [400, { error: { code: 'invalid_cursor', message: 'Cursor is not valid' } }];
    } else if (path.startsWith('/v2/ingredients/')) {
      const sku = decodeURIComponent(path.slice('/v2/ingredients/'.length));
      body = v2Ingredients.find((i) => i.sku === sku);
      if (!body) [status, body] = [404, { error: { code: 'sku_not_found', message: sku } }];
    } else [status, body] = [404, { error: 'not_found' }];
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

// --- add sauces (issue #1 + the kitchen's email) ---

async function priceStatus(ingredientIds) {
  const res = await fetch(`${baseUrl}/api/price`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ingredientIds }),
  });
  return res.status;
}

async function menuSauces() {
  const ids = await menuIds();
  const sauces = ids.filter((id) => SAUCES.includes(id));
  assert.ok(sauces.length > 0, 'no sauces on the menu');
  return sauces;
}

test('the menu has the kitchen\'s sauces (v2)', async () => {
  const sauces = await menuSauces();
  for (const id of ['ketchup', 'mustard', 'house-sauce', 'bbq', 'garlic-aioli']) {
    assert.ok(sauces.includes(id), `missing ${id}`);
  }
});

test('sold-out sauces are hidden', async () => {
  assert.ok(!(await menuSauces()).includes('sriracha-mayo'), 'sriracha mayo has 0 portions');
});

test('truffle mayo is off the menu (kitchen email)', async () => {
  assert.ok(!(await menuSauces()).includes('truffle-mayo'), 'truffle mayo is out until December');
});

test('the first sauce is free', async () => {
  assert.equal(await price(['beef-patty', 'bbq']), BASE + 350);
});

test('the second sauce costs its kitchen price', async () => {
  assert.equal(await price(['beef-patty', 'bbq', 'bbq']), BASE + 350 + 60);
  assert.equal(await price(['beef-patty', 'garlic-aioli', 'garlic-aioli']), BASE + 350 + 70);
});

test('a third sauce is refused', async () => {
  assert.equal(await priceStatus(['beef-patty', 'ketchup', 'mustard']), 200, 'two sauces are allowed');
  const status = await priceStatus(['beef-patty', 'ketchup', 'mustard', 'house-sauce']);
  assert.ok(status >= 400 && status < 500, `three sauces returned ${status}`);
});

// --- second patty half price ---

test('the second patty is half price', async () => {
  assert.equal(await price(['beef-patty', 'beef-patty']), BASE + 350 + 175);
});

test('with two different patties, the cheaper one is the half-price one', async () => {
  assert.equal(await price(['veggie-patty', 'beef-patty']), BASE + 350 + 150);
});

// --- tacos and sandwiches (issue #3 + kitchen v2 products) ---
// POST /api/price { product, ingredientIds }; no product means burger.

async function quote(product, ingredientIds) {
  const res = await fetch(`${baseUrl}/api/price`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ product, ingredientIds }),
  });
  return { status: res.status, totalCents: res.ok ? (await res.json()).totalCents : undefined };
}

const refused = (q) => q.status >= 400 && q.status < 500;

test('a taco costs its kitchen base price plus tortilla and toppings', async () => {
  const q = await quote('taco', ['corn-tortilla', 'pulled-pork', 'cheddar']);
  assert.equal(q.status, 200, `taco returned ${q.status}`);
  assert.equal(q.totalCents, 150 + 0 + 320 + 100);
});

test('a sandwich costs its kitchen base price plus its bread', async () => {
  const q = await quote('sandwich', ['ciabatta', 'ham', 'cheddar']);
  assert.equal(q.status, 200, `sandwich returned ${q.status}`);
  assert.equal(q.totalCents, 200 + 50 + 180 + 100);
});

test('a patty on a taco is refused', async () => {
  const ok = await quote('taco', ['corn-tortilla', 'pulled-pork']);
  assert.equal(ok.status, 200, 'a valid taco is accepted');
  assert.ok(refused(await quote('taco', ['corn-tortilla', 'beef-patty'])), 'patty taco accepted');
  assert.ok(refused(await quote('sandwich', ['sourdough', 'beef-patty'])), 'patty sandwich accepted');
});

test('ingredients the kitchen does not make for a product are refused (availableIn)', async () => {
  const ok = await quote('sandwich', ['sourdough', 'ham']);
  assert.equal(ok.status, 200, 'a valid sandwich is accepted');
  assert.ok(refused(await quote('taco', ['corn-tortilla', 'ham'])), 'ham taco accepted');
  assert.ok(refused(await quote('sandwich', ['sourdough', 'black-beans'])), 'black bean sandwich accepted');
});

test('a taco needs exactly one tortilla, a sandwich exactly one bread', async () => {
  assert.equal((await quote('taco', ['corn-tortilla', 'black-beans'])).status, 200, 'a valid taco is accepted');
  assert.ok(refused(await quote('taco', ['black-beans'])), 'taco without tortilla accepted');
  assert.ok(refused(await quote('taco', ['corn-tortilla', 'flour-tortilla', 'black-beans'])), 'two tortillas accepted');
  assert.ok(refused(await quote('sandwich', ['ham', 'cheddar'])), 'sandwich without bread accepted');
});

test('a taco takes at most 3 toppings, not counting tortilla and sauces', async () => {
  const three = await quote('taco', ['corn-tortilla', 'chicken-tinga', 'cheddar', 'tomato', 'ketchup', 'mustard']);
  assert.equal(three.status, 200, `3 toppings + 2 sauces returned ${three.status}`);
  assert.ok(refused(await quote('taco', ['corn-tortilla', 'chicken-tinga', 'cheddar', 'tomato', 'lettuce'])), '4 toppings accepted');
});

test('vegetarian tacos are 10% off, half a cent rounds up', async () => {
  const q = await quote('taco', ['flour-tortilla', 'black-beans', 'pico-de-gallo', 'halloumi']);
  assert.equal(q.status, 200, `vegetarian taco returned ${q.status}`);
  // (150 + 20 + 120 + 45 + 150) = 485, 10% off = 436.5, ADR 0002: round half up
  assert.equal(q.totalCents, 437);
});
