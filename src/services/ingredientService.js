import { fetchJson } from '../lib/fetchJson.js';

// Ingredients from the kitchen's inventory API.
export function createIngredientService({ baseUrl }) {
  async function getIngredients() {
    const body = await fetchJson(`${baseUrl}/ingredients`);
    return body.data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      priceCents: item.priceCents,
      inStock: item.inStock,
    }));
  }

  async function getIngredient(id) {
    const ingredients = await getIngredients();
    return ingredients.find((item) => item.id === id) ?? null;
  }

  return { getIngredients, getIngredient };
}
