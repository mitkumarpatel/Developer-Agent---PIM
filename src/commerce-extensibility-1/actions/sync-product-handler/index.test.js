import assert from 'node:assert/strict';
import { test } from 'node:test';
import { syncProductHandler } from './index.js';

test('skips duplicate payloads', async () => {
  const state = { get: async () => ({ seen: true }), put: async () => {} };
  const result = await syncProductHandler({ payload: { sku: 'A', updated_at: '1' }, state, apiClient: { put: async () => {} } });
  assert.equal(result.skipped, true);
});

test('writes dead letter on failure', async () => {
  const entries = [];
  const state = { get: async () => null, put: async (k, v) => entries.push([k, v]) };
  const apiClient = { put: async () => { const err = new Error('boom'); err.statusCode = 503; throw err; } };
  await assert.rejects(syncProductHandler({ payload: { sku: 'A', updated_at: '1' }, state, apiClient }));
  assert.equal(entries[0][0].startsWith('dead-letter:pim-product-sync:'), true);
});
