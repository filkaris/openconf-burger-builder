import { sendJson, sendError, readJsonBody } from '../lib/http.js';
import { calculateTotal } from '../lib/pricing.js';

// Prices a burger.
//
//   POST /api/price  { "ingredientIds": ["beef-patty", "cheddar"] }
//     -> 200 { "totalCents": 700, "currency": "EUR" }
//     -> 400 { "error": "unknown_ingredient" }
//
// The same ingredient may appear more than once (double cheese).
export function registerPriceRoutes(router, { ingredientService, shopService }) {
  router.post('/api/price', async (req, res) => {
    const body = await readJsonBody(req);
    const ids = body?.ingredientIds;
    if (!Array.isArray(ids)) return sendError(res, 400, 'ingredient_ids_required');

    const [shop, ingredients] = await Promise.all([shopService.getShop(), ingredientService.getIngredients()]);
    const byId = new Map(ingredients.map((item) => [item.id, item]));

    const items = ids.map((id) => byId.get(id));
    if (items.includes(undefined)) return sendError(res, 400, 'unknown_ingredient');

    sendJson(res, 200, {
      totalCents: calculateTotal({ basePriceCents: shop.basePriceCents, items }),
      currency: shop.currency,
    });
  });
}
