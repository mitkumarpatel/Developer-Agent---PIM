import crypto from 'node:crypto';
import { validateWebhookSignature } from './lib/validate-signature.js';
import { syncProductHandler } from '../sync-product-handler/index.js';

const headers = {
  'content-type': 'application/json; charset=utf-8',
};

function jsonResponse(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export async function main(params) {
  try {
    const validation = validateWebhookSignature(params);
    if (!validation.ok) {
      return jsonResponse(validation.statusCode, { error: validation.error });
    }

    const payload = validation.payload;
    const jobId = crypto.randomUUID();
    const result = await syncProductHandler({ ...params, payload, jobId });

    return jsonResponse(200, {
      accepted: true,
      jobId,
      result,
    });
  } catch (error) {
    console.error('pim-webhook-receiver failed', {
      operation: 'pim-webhook-receiver',
      error: error?.message,
    });
    return jsonResponse(500, { error: 'Internal server error' });
  }
}
