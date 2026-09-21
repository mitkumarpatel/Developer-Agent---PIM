import crypto from 'node:crypto';

function getHeader(params, name) {
  const headers = params?.headers || params?.__ow_headers || {};
  const lower = name.toLowerCase();
  return headers[name] || headers[lower] || headers[lower.replace(/-/g, '_')];
}

function parseBody(params) {
  if (!params || params.body == null) {
    return { ok: false, statusCode: 400, error: 'Missing request body' };
  }
  if (typeof params.body === 'object') {
    return { ok: true, payload: params.body };
  }
  try {
    return { ok: true, payload: JSON.parse(params.body) };
  } catch {
    return { ok: false, statusCode: 400, error: 'Invalid JSON body' };
  }
}

export function validateWebhookSignature(params) {
  const secret = params?.PIM_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, statusCode: 401, error: 'Missing webhook secret' };
  }

  const signature = getHeader(params, 'x-pim-signature');
  if (!signature) {
    return { ok: false, statusCode: 401, error: 'Missing signature header' };
  }

  const body = parseBody(params);
  if (!body.ok) {
    return body;
  }

  const payload = body.payload;
  const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  const provided = String(signature).trim();
  const valid = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(provided));
  if (!valid) {
    return { ok: false, statusCode: 401, error: 'Invalid signature' };
  }

  return { ok: true, payload };
}
