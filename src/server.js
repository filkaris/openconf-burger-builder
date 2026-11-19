import { createApp } from './app.js';
import { config } from './config.js';

createApp({ kitchenApiUrl: config.kitchenApiUrl }).listen(config.port, () => {
  console.log(`OpenConf Burgers builder running at http://localhost:${config.port}`);
});
