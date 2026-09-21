import { createHash } from 'node:crypto';
import { createCommerceClient } from './lib/commerce-client.js';
import { transformPimProduct } from './lib/transform.js';

const DEAD_LETTER_PREFIX = 'dead-letter:pim-product-sync:';
const DEDUPE_PREFIX = 'dedupe:pim-product-sync:';

function isTransientError(error) {
  const status = error?.statusCode || error?.status;
  return [502, 503, 504].includes(status) || error?.code === 'ETIMEDOUT';
}

async function withRetry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try { return await fn(); } catch (error) {
      lastError = error;
      if (!isTransientError(error) || i === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50 * (2 ** i)));
    }
  }
  throw lastError;
}

async function getState(params) {
  return params?.state || {
    async get() { return null; },
    async put() {},
  };
}

export async function syncProductHandler(params) {
  const payload = params.payload || params;
  if (!payload?.sku) {
    return { accepted: false, error: 'Missing sku' };
  }

  const dedupeKey = `${payload.sku}:${payload.updated_at || payload.version || 'unknown'}`;
  const dedupeHash = createHash('sha256').update(dedupeKey).digest('hex');
  const state = await getState(params);
  const existing = await state.get(`${DEDUPE_PREFIX}${dedupeHash}`);
  if (existing) {
    return { accepted: true, skipped: true };
  }

  const { product, stockItem } = transformPimProduct(payload);
  const commerce = createCommerceClient({ apiClient: params.apiClient || params.commerceClient || params.client });
  try {
    await withRetry(() => commerce.saveProduct(product));
    await withRetry(() => commerce.saveStockItem(stockItem));
    await state.put(`${DEDUPE_PREFIX}${dedupeHash}`, { processedAt: new Date().toISOString() });
    return { accepted: true, skipped: false };
  } catch (error) {
    await state.put(`${DEAD_LETTER_PREFIX}${dedupeHash}`, { payload, error: { message: error?.message, statusCode: error?.statusCode, code: error?.code } });
    throw error;
  }
}
