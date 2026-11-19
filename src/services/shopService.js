import { fetchJson } from '../lib/fetchJson.js';

export function createShopService({ baseUrl }) {
  return {
    async getShop() {
      const body = await fetchJson(`${baseUrl}/shop`);
      return body.data;
    },
  };
}
