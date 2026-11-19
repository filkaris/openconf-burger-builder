// HTTP client for upstream APIs. See docs/adr/0003-api-client-for-upstream-calls.md.
//
//   const kitchen = createApiClient({ baseUrl: config.kitchenApiUrl });
//   const item = await kitchen.get('/ingredients/cheddar');
//   const categories = await kitchen.getAllPages('/categories');

const RETRYABLE_STATUS = new Set([502, 503, 504]);

export class UpstreamError extends Error {
  constructor(message, { status, url, cause } = {}) {
    super(message, { cause });
    this.name = 'UpstreamError';
    this.status = status;
    this.url = url;
  }
}

export function createApiClient({ baseUrl, timeoutMs = 3000, retries = 2 }) {
  async function get(path) {
    const url = new URL(path, baseUrl).toString();
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        if (res.ok) return await res.json();
        lastError = new UpstreamError(`GET ${url} failed with ${res.status}`, { status: res.status, url });
        if (!RETRYABLE_STATUS.has(res.status)) break;
      } catch (err) {
        lastError = new UpstreamError(`GET ${url} failed: ${err.message}`, { url, cause: err });
      }
    }
    throw lastError;
  }

  // Follows `nextPage` until exhausted and returns the concatenated `data` arrays.
  async function getAllPages(path) {
    const items = [];
    let page = 1;
    while (page) {
      const separator = path.includes('?') ? '&' : '?';
      const body = await get(`${path}${separator}page=${page}`);
      items.push(...body.data);
      page = body.nextPage;
    }
    return items;
  }

  return { get, getAllPages };
}
