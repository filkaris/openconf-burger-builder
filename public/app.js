const menuEl = document.querySelector('#menu');
const stackEl = document.querySelector('#stack');
const totalEl = document.querySelector('#total');

let ingredientsById = new Map();
let currency = 'EUR';
const burger = []; // ingredient ids, bottom to top

async function getJson(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(`${path} returned ${res.status}`);
    err.code = body.error;
    throw err;
  }
  return res.json();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(cents / 100);
}

function renderMenu(categories, ingredients) {
  const groups = categories
    .map((category) => ({ category, items: ingredients.filter((item) => item.category === category.id) }))
    .filter((group) => group.items.length > 0);

  menuEl.innerHTML = groups
    .map(
      ({ category, items }) => `
      <h2>${escapeHtml(category.label)}</h2>
      <div class="ingredient-grid">
        ${items
          .map(
            (item) => `
          <button class="ingredient" type="button" data-id="${escapeHtml(item.id)}">
            <span class="swatch layer--${escapeHtml(item.category)}"></span>
            <span class="ingredient__name">${escapeHtml(item.name)}</span>
            <span class="ingredient__price">+${formatPrice(item.priceCents)}</span>
          </button>`,
          )
          .join('')}
      </div>`,
    )
    .join('');
}

function renderStack() {
  const layers = burger
    .map((id, index) => {
      const item = ingredientsById.get(id);
      return `<button class="layer layer--${escapeHtml(item.category)}" type="button" data-index="${index}">${escapeHtml(item.name)}</button>`;
    })
    .reverse()
    .join('');
  stackEl.innerHTML = `<div class="bun bun--top"></div>${layers}<div class="bun bun--bottom"></div>`;
}

async function renderTotal() {
  try {
    const { totalCents } = await getJson('/api/price', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ingredientIds: burger }),
    });
    totalEl.textContent = formatPrice(totalCents);
  } catch {
    totalEl.textContent = '?';
  }
}

function update() {
  renderStack();
  renderTotal();
}

menuEl.addEventListener('click', (event) => {
  const button = event.target.closest('.ingredient');
  if (!button) return;
  burger.push(button.dataset.id);
  update();
});

stackEl.addEventListener('click', (event) => {
  const layer = event.target.closest('.layer');
  if (!layer) return;
  burger.splice(Number(layer.dataset.index), 1);
  update();
});

document.querySelector('#clear').addEventListener('click', () => {
  burger.length = 0;
  update();
});

async function start() {
  try {
    const [shop, categories, ingredients] = await Promise.all([
      getJson('/api/shop'),
      getJson('/api/categories'),
      getJson('/api/ingredients'),
    ]);
    currency = shop.currency;
    document.querySelector('#shop-name').textContent = shop.name;
    document.querySelector('#shop-tagline').textContent = shop.tagline;
    ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
    renderMenu(categories, ingredients);
    update();
  } catch (err) {
    if (err.code === 'kitchen_unreachable') {
      menuEl.innerHTML = `
        <p class="error"><strong>The kitchen API is not running.</strong></p>
        <p>Start it in a second terminal, then reload this page:</p>
        <pre class="command">npx --allow-git=all github:filkaris/openconf-kitchen</pre>`;
      return;
    }
    menuEl.innerHTML = `<p class="error">Something went wrong: ${escapeHtml(err.message)}</p>`;
  }
}

start();
