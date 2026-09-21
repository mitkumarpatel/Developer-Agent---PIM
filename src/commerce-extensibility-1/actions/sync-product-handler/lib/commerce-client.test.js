import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCommerceClient } from './commerce-client.js';

test('sends commerce product and stock requests', async () => {
  const calls = [];
  const client = createCommerceClient({ apiClient: { put: async (...args) => calls.push(args) } });
  await client.saveProduct({ sku: 'ABC-1' });
  await client.saveStockItem({ sku: 'ABC-1' });
  assert.equal(calls[0][0], '/V1/products/ABC-1');
  assert.equal(calls[1][0], '/V1/products/ABC-1/stockItems/1');
});
