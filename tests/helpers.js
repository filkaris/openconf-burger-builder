import { once } from 'node:events';
import { createFakeKitchen } from './fixtures/kitchen.js';
import { createApp } from '../src/app.js';

// Starts a fake kitchen API and the app on random ports.
export async function startServers() {
  const kitchen = createFakeKitchen().listen(0);
  await once(kitchen, 'listening');
  const kitchenApiUrl = `http://localhost:${kitchen.address().port}`;

  const app = createApp({ kitchenApiUrl }).listen(0);
  await once(app, 'listening');
  const baseUrl = `http://localhost:${app.address().port}`;

  return {
    baseUrl,
    async close() {
      app.close();
      kitchen.close();
    },
  };
}
