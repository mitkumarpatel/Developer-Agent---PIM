import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'pim-product-sync',
    displayName: 'PIM Product Sync',
    description: 'Syncs product data (SKU, name, description, price, stock, attributes) from an external PIM to Adobe Commerce via inbound webhook.',
    version: '1.0.0',
  },
});
