import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRouter } from './lib/router.js';
import { sendError } from './lib/http.js';
import { createApiClient } from './lib/apiClient.js';
import { createIngredientService } from './services/ingredientService.js';
import { createCategoryService } from './services/categoryService.js';
import { createShopService } from './services/shopService.js';
import { registerMenuRoutes } from './routes/menu.js';
import { registerPriceRoutes } from './routes/price.js';

const publicDir = join(import.meta.dirname, '..', 'public');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function serveStatic(pathname, res) {
  const relative = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^(\.\.[/\\])+/, '');
  try {
    const file = await readFile(join(publicDir, relative));
    res.writeHead(200, { 'content-type': contentTypes[extname(relative)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    // Unknown paths fall back to the single-page app.
    const index = await readFile(join(publicDir, 'index.html'));
    res.writeHead(200, { 'content-type': contentTypes['.html'] });
    res.end(index);
  }
}

// True when the kitchen API is not running at all (connection refused).
function isKitchenDown(err) {
  for (let e = err; e; e = e.cause) {
    if (e.code === 'ECONNREFUSED') return true;
    if (e instanceof AggregateError && e.errors.some(isKitchenDown)) return true;
  }
  return false;
}

export function createApp({ kitchenApiUrl }) {
  const kitchenClient = createApiClient({ baseUrl: kitchenApiUrl });
  const ingredientService = createIngredientService({ baseUrl: kitchenApiUrl });
  const categoryService = createCategoryService({ kitchenClient });
  const shopService = createShopService({ baseUrl: kitchenApiUrl });

  const router = createRouter();
  registerMenuRoutes(router, { ingredientService, categoryService, shopService });
  registerPriceRoutes(router, { ingredientService, shopService });

  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (!pathname.startsWith('/api/')) return serveStatic(pathname, res);

    const route = router.match(req.method, pathname);
    if (!route) return sendError(res, 404, 'not_found');

    try {
      await route.handler(req, res, route.params);
    } catch (err) {
      if (isKitchenDown(err)) {
        console.error(`Kitchen API not reachable at ${kitchenApiUrl}`);
        if (!res.headersSent) sendError(res, 503, 'kitchen_unreachable');
        return;
      }
      console.error(err);
      if (!res.headersSent) sendError(res, err.status ?? 500, err.status ? err.message : 'internal_error');
    }
  });
}
