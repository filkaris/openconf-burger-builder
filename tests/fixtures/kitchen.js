// Minimal stand-in for the kitchen API (v1) so the tests run without the real
// mock. Matches the shapes in docs/kitchen-api.md.
import http from 'node:http';

const PAGE_SIZE = 5;

const shop = { name: "OpenConf Burgers", tagline: 'Build it your way', currency: 'EUR', basePriceCents: 250 };
const categories = [
  { id: 'patty', label: 'Patties' },
  { id: 'cheese', label: 'Cheese' },
  { id: 'veggie', label: 'Veggies' },
  { id: 'extra', label: 'Extras' },
  { id: 'bread', label: 'Bread' },
];
const ingredients = [
  { id: 'beef-patty', name: 'Beef patty', category: 'patty', priceCents: 350, stock: 25, inStock: true },
  { id: 'veggie-patty', name: 'Chickpea patty', category: 'patty', priceCents: 300, stock: 12, inStock: true },
  { id: 'cheddar', name: 'Cheddar', category: 'cheese', priceCents: 100, stock: 30, inStock: true },
  { id: 'lettuce', name: 'Lettuce', category: 'veggie', priceCents: 50, stock: 50, inStock: true },
  { id: 'tomato', name: 'Tomato', category: 'veggie', priceCents: 60, stock: 35, inStock: true },
  { id: 'fried-egg', name: 'Fried egg', category: 'extra', priceCents: 130, stock: 9, inStock: true },
];

function paginate(items, pageParam) {
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const start = (page - 1) * PAGE_SIZE;
  return { data: items.slice(start, start + PAGE_SIZE), page, nextPage: start + PAGE_SIZE < items.length ? page + 1 : null };
}

export function createFakeKitchen() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://kitchen.test');
    let status = 200;
    let body;
    if (url.pathname === '/shop') body = { data: shop };
    else if (url.pathname === '/categories') body = paginate(categories, url.searchParams.get('page'));
    else if (url.pathname === '/ingredients') body = paginate(ingredients, url.searchParams.get('page'));
    else [status, body] = [404, { error: 'not_found' }];
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  });
}
