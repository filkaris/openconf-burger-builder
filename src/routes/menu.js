import { sendJson } from '../lib/http.js';

export function registerMenuRoutes(router, { ingredientService, categoryService, shopService }) {
  router.get('/api/shop', async (req, res) => {
    sendJson(res, 200, await shopService.getShop());
  });

  router.get('/api/categories', async (req, res) => {
    sendJson(res, 200, await categoryService.getCategories());
  });

  router.get('/api/ingredients', async (req, res) => {
    sendJson(res, 200, await ingredientService.getIngredients());
  });
}
