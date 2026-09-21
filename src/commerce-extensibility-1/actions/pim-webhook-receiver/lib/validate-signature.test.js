import assert from 'node:assert/strict';
import { test } from 'node:test';
import crypto from 'node:crypto';
import { validateWebhookSignature } from './validate-signature.js';

test('validates matching webhook signature', () => {
  const payload = { sku: 'ABC-1' };
  const secret = 'topsecret';
  const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  const result = validateWebhookSignature({ body: JSON.stringify(payload), headers: { 'x-pim-signature': signature }, PIM_WEBHOOK_SECRET: secret });
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload, payload);
});

test('rejects invalid signature', () => {
  const result = validateWebhookSignature({ body: JSON.stringify({ sku: 'ABC-1' }), headers: { 'x-pim-signature': 'bad' }, PIM_WEBHOOK_SECRET: 'topsecret' });
  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 401);
});
