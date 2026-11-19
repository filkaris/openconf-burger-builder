// Local development: starts the app. The kitchen API runs separately:
//   npx --allow-git=all github:filkaris/openconf-kitchen
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';

createApp({ kitchenApiUrl: config.kitchenApiUrl }).listen(config.port, async () => {
  console.log(`OpenConf Burgers builder running at http://localhost:${config.port}`);
  try {
    await fetch(new URL('/shop', config.kitchenApiUrl), { signal: AbortSignal.timeout(1000) });
    console.log(`Kitchen API at ${config.kitchenApiUrl}`);
  } catch {
    console.warn(`\nKitchen API not reachable at ${config.kitchenApiUrl}.`);
    console.warn('Start it in a second terminal: npx --allow-git=all github:filkaris/openconf-kitchen\n');
  }
});
